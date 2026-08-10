/**
 * Household-level settings: the shape and the defaults.
 *
 * Separate from lib/actions/household-settings.ts because a "use server" file
 * may only export async functions — a plain object there is a build error,
 * and it is not a friendly one: the failure surfaces as
 * "Failed to collect configuration for /missoes/[id]" on an unrelated route.
 */
export type HouseholdSettings = {
  /** total = Sandra never uses English. ajuda = she explains when needed. */
  immersion: "total" | "ajuda";
  /** English shown beside the Portuguese throughout the interface. */
  bilingual: boolean;
};

export const DEFAULT_HOUSEHOLD_SETTINGS: HouseholdSettings = {
  // Defaults to help, not immersion. Dropping a beginner into Portuguese-only
  // with no way back is how you lose them on day one.
  immersion: "ajuda",
  bilingual: false,
};
