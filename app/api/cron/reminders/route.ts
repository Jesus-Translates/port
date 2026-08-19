import { NextResponse } from "next/server";
import { and, eq, gt, gte, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { activity, cards, emailLog, getDb, users } from "@/lib/db";
import { emailConfigured, sendReminder } from "@/lib/email";
import { streakFrom } from "@/lib/streak";

/**
 * The daily reminder — the only thing that ever brings anyone BACK.
 *
 * Review cards decay and streaks die in silence: both were visible only to
 * someone already inside the app, which is exactly the person who does not
 * need reminding. Vercel Cron calls this once a day (see vercel.json); it
 * emails each person who has something concrete waiting — cards due, or a
 * streak that today's silence would kill — and nobody else. No news, no email.
 *
 * Rules that matter, in order of what they protect:
 *  - CRON_SECRET or nothing: an open cron endpoint is an open mailer.
 *  - At most one email per mailbox per day: email_log (kind "reminder",
 *    ok=true, last 20 hours) is the dedup source, so a re-run of the same
 *    day's cron is a no-op rather than a double-send. 20 hours, not a
 *    calendar day: it clears the 24h between daily runs regardless of DST,
 *    with no timezone arithmetic to get wrong.
 *  - Deactivated accounts and accounts without an email are never candidates.
 *  - Fail soft everywhere: one unreachable mailbox must not stop the run.
 */

// Sequential sends to a whole household of mailboxes can outlast the default
// function window; a minute is plenty and costs nothing when unused.
// A few hundred mailboxes sent with bounded concurrency fit comfortably; the
// old strictly-sequential loop timed out past ~150 recipients, and because the
// candidate order is stable and the dedup window is 20h, the same tail of the
// list then never got mailed at all. 300s is the platform max.
export const maxDuration = 300;
const SEND_CONCURRENCY = 5;

export async function GET(request: Request) {
  // A missing secret closes the endpoint rather than opening it.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Without a provider every "send" would fail loudly into email_log, once
  // per person per day, forever. Say so once instead.
  if (!emailConfigured()) {
    return NextResponse.json({ ok: false, error: "Email não configurado." });
  }

  const db = getDb();
  const now = new Date();

  let candidates: { username: string; displayName: string; email: string | null }[];
  try {
    candidates = await db
      .select({
        username: users.username,
        displayName: users.displayName,
        email: users.email,
      })
      .from(users)
      .where(and(eq(users.active, true), isNotNull(users.email)));
  } catch {
    return NextResponse.json({ ok: false, error: "users unreadable" }, { status: 500 });
  }
  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, sent: 0 });
  }
  const usernames = candidates.map((c) => c.username);

  // Everything the decision needs, in three batched queries — not 3×N.
  // Each one degrades to "nothing" on failure: a broken streak read must
  // cost a reminder, never the whole run.
  const [dueRows, actRows, sentRows] = await Promise.all([
    // countDue()'s definition, grouped: state > 0 and due now or earlier.
    db
      .select({ username: cards.username, n: sql<number>`count(*)::int` })
      .from(cards)
      .where(and(gt(cards.state, 0), lte(cards.due, now)))
      .groupBy(cards.username)
      .catch(() => []),
    // Distinct active DAYS per user over the streak window, grouped in SQL.
    // Fetching raw rows shipped tens of rows per active user per day (megabytes
    // at scale) only to reduce them to days in JS; this returns at most one row
    // per user per day. The day string is the Lisbon calendar day, matching
    // lib/streak's dayKey() format ("YYYY-MM-DD") exactly.
    db
      .select({
        username: activity.username,
        day: sql<string>`to_char((${activity.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Lisbon')::date, 'YYYY-MM-DD')`,
      })
      .from(activity)
      .where(
        and(
          inArray(activity.username, usernames),
          gte(activity.createdAt, new Date(now.getTime() - 60 * 86_400_000))
        )
      )
      .groupBy(
        activity.username,
        sql`(${activity.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Lisbon')::date`
      )
      .catch(() => []),
    // Who already got today's reminder — the double-send guard.
    db
      .select({ recipient: emailLog.recipient })
      .from(emailLog)
      .where(
        and(
          eq(emailLog.kind, "reminder"),
          eq(emailLog.ok, true),
          gte(emailLog.createdAt, new Date(now.getTime() - 20 * 3_600_000))
        )
      )
      .catch(() => []),
  ]);

  const dueBy = new Map(dueRows.map((r) => [r.username, Number(r.n)]));
  const daysBy = new Map<string, Set<string>>();
  for (const row of actRows) {
    let set = daysBy.get(row.username);
    if (!set) daysBy.set(row.username, (set = new Set()));
    set.add(row.day);
  }
  // Seeded from the log, extended during the run: two accounts sharing a
  // parent's mailbox still mean one email in that mailbox.
  const alreadySent = new Set(sentRows.map((r) => r.recipient));

  let skipped = 0;

  // Decide WHO gets an email first, deduping by mailbox as we go — then send
  // concurrently. Deduping up front (rather than inside a sequential loop that
  // mutated alreadySent) is what lets the sends run in parallel without two
  // accounts on one parent's mailbox each firing.
  const toSend: { to: string; displayName: string; due: number; streak: number }[] = [];
  for (const person of candidates) {
    const to = (person.email ?? "").trim().toLowerCase();
    if (!to || alreadySent.has(to)) {
      skipped += 1;
      continue;
    }
    const due = dueBy.get(person.username) ?? 0;
    const { streak, activeToday } = streakFrom(
      daysBy.get(person.username) ?? new Set()
    );
    // A streak is only news when today's silence would end it. One day is not
    // yet a streak worth an email — with nothing due, that person is left
    // alone. Never guilt, never filler: no cards and no streak means no email.
    const streakAtRisk = !activeToday && streak >= 2;
    if (due === 0 && !streakAtRisk) {
      skipped += 1;
      continue;
    }
    alreadySent.add(to); // claim the mailbox so a sibling doesn't also queue
    toSend.push({ to, displayName: person.displayName, due, streak });
  }

  // Bounded concurrency: the strictly-sequential version timed out past ~150
  // recipients, and one mailbox never stops the run (fail soft per send).
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < toSend.length; i += SEND_CONCURRENCY) {
    const chunk = toSend.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.allSettled(chunk.map((r) => sendReminder(r)));
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.ok) sent += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    checked: candidates.length,
    sent,
    skipped,
    failed,
  });
}
