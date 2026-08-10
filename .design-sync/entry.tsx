/**
 * The design-system surface of this app.
 *
 * This is a Next.js application, not a component library, so there is no
 * published dist/ to bundle. Most of its 65 components call server actions or
 * getDb() and cannot run in a browser bundle at all — spend-chip, for one,
 * reads live spend through drizzle.
 *
 * These five are genuinely presentational: they take props and render. They
 * are the part of this app a design agent can legitimately build with,
 * alongside the token and component-class layer in app/globals.css.
 *
 * ListeningElsewhere is deliberately NOT here. It takes no props and renders a
 * fixed curated list of Portuguese podcasts — content, not a composable part,
 * so a design agent gains nothing it could build with. It was also the only
 * component importing next/link, which dragged Next's client router into the
 * bundle and broke it at load with `process is not defined`.
 *
 * The `<Name>Props` types are re-exported alongside each component on purpose:
 * the converter resolves prop types through this entry, so a component whose
 * props stop here ships an empty `{ [key: string]: unknown }` contract and the
 * design agent has nothing to code against.
 */
export { AnswerDiff, type AnswerDiffProps } from "@/components/answer-diff";
export { AudioButton, type AudioButtonProps } from "@/components/audio-button";
export { Markdown, type MarkdownProps } from "@/components/markdown";
export { Recorder, type RecorderProps } from "@/components/recorder";
export {
  VerbConjugator,
  type VerbConjugatorProps,
} from "@/components/verb-conjugator";
