/**
 * The one definition of a streak.
 *
 * It lived in three places — getStats, getFamilyBoard, and the reminder cron —
 * each a hand-copied loop with the same comment promising the numbers agree.
 * Three copies is exactly how they stop agreeing: the day a grace-day or
 * window change lands in one, the email starts contradicting the dashboard,
 * on the one screen a lapsing user still sees. Now they all call this.
 */

/** Bucket a timestamp into its Europe/Lisbon calendar day, "YYYY-MM-DD". */
export function dayKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });
}

/**
 * Consecutive-day streak from a set of active local-day keys, plus whether
 * today is one of them.
 *
 * Anchored on today when active, otherwise on yesterday: a streak is not dead
 * until a whole local day has passed with no practice.
 *
 * The walk-back cursor is anchored at LOCAL NOON, not midnight. Stepping a
 * midnight-anchored Date by `setDate(-1)` moves in the server's 24h units
 * while the day is bucketed in Europe/Lisbon — so on the night the clocks
 * spring forward, a run near Lisbon midnight could step straight over a whole
 * day and cut the streak short. From noon, a ±1h DST shift never crosses a day
 * boundary, so every day between then and now is visited exactly once.
 */
export function streakFrom(days: Set<string>): {
  streak: number;
  activeToday: boolean;
} {
  const activeToday = days.has(dayKey(new Date()));
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  if (!activeToday) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, activeToday };
}
