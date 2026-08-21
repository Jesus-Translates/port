/**
 * When a week and a month start, in the family's timezone.
 *
 * Lisbon, not UTC. An hour's difference moves a late-evening session onto the
 * wrong day for half the year, which on a weekly scoreboard is the difference
 * between winning and not.
 *
 * Here rather than beside their first caller because they now have several:
 * the AI budget rails reset on the same week these leaderboards count, and two
 * definitions of "this week" that drift is how a learner's own numbers stop
 * agreeing with each other.
 */

/** Monday 00:00 Lisbon, as an instant. Weeks reset; that is the point. */
export function lisbonWeekStart(): Date {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Lisbon" })
  );
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  now.setDate(now.getDate() - dow);
  const day = now.toLocaleDateString("en-CA");
  return new Date(`${day}T00:00:00Z`);
}

/** The 1st of the current month, 00:00 Lisbon. */
export function lisbonMonthStart(): Date {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon",
  });
  return new Date(`${day.slice(0, 7)}-01T00:00:00Z`);
}
