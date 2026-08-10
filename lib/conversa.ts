/**
 * Shared shape and rules for a conversation with Sandra.
 *
 * Separate from lib/actions/conversa.ts because a "use server" file may only
 * export async functions — a plain constant there is a build error, and the
 * client needs this number to draw the progress bar.
 */

/** What a stored turn needs to redraw. Audio is regenerated, never stored. */
export type StoredMsg = { role: "sandra" | "eu"; pt: string; en?: string };

/**
 * XP that finishes the step — roughly six to ten good turns.
 *
 * High enough that "sim" ten times will not get there (a bare answer is worth
 * 5), low enough that a real conversation does.
 */
export const CONVERSA_GOAL = 100;

/** The most one turn can be worth, so a single reply cannot finish the step. */
export const CONVERSA_MAX_TURN = 25;
