import type { MetadataRoute } from "next";

/** Lets the family "Add to Home Screen" and get an app-like window. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Português · the family hub",
    short_name: "Português",
    description:
      "Our European Portuguese learning hub — phrasebook, lessons, homework, quizzes and Sandra the AI tutor.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#faf7f0",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
