/** Sidebar table of contents for the overview page */
export const OVERVIEW_SECTIONS = [
  { id: "overview-start", label: "Start" },
  { id: "overview-stack", label: "Burin + Pathways stack" },
  { id: "overview-trust-key", label: "Trust Key" },
  { id: "overview-centerpiece", label: "Cross-session collaboration" },
  { id: "overview-water", label: "Water reporting" },
  { id: "overview-special", label: "What is special" },
  { id: "overview-first-time", label: "First-time demo" },
  { id: "overview-audiences", label: "Who this matters to" },
  { id: "overview-technology", label: "Technology" },
  { id: "overview-cta", label: "Try the quarter" },
] as const;

export type OverviewSectionId = (typeof OVERVIEW_SECTIONS)[number]["id"];
