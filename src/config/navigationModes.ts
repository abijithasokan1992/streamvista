export type NavigationMode = "watch" | "create" | "distribute" | "industry" | "muse";

export type NavigationItem = {
  label: string;
  path: string;
};

export const NAVIGATION_MODES: Record<NavigationMode, { label: string; items: NavigationItem[] }> = {
  watch: {
    label: "Watch",
    items: [
      { label: "Home", path: "/home" },
      { label: "Discover", path: "/discover" },
      { label: "Movies", path: "/movies" },
      { label: "Series", path: "/series" },
      { label: "Genres", path: "/genres" },
      { label: "Watchlist", path: "/watchlist" },
      { label: "My Library", path: "/library" },
    ],
  },
  create: {
    label: "Create",
    items: [
      { label: "Creator Home", path: "/creator" },
      { label: "Studio", path: "/workspace/studio" },
      { label: "Projects", path: "/projects" },
      { label: "Development", path: "/drafts" },
      { label: "Production", path: "/uploads" },
      { label: "Campaigns", path: "/campaigns" },
      { label: "Audience", path: "/analytics" },
      { label: "SV Muse", path: "/chat?mode=muse" },
    ],
  },
  distribute: {
    label: "Distribute",
    items: [
      { label: "Distribution Home", path: "/distribution" },
      { label: "Catalog", path: "/titles" },
      { label: "Rights & Availability", path: "/rights" },
      { label: "Territories", path: "/territories" },
      { label: "Platforms", path: "/platforms" },
      { label: "Deliverables", path: "/deliverables" },
      { label: "Deals", path: "/deals" },
      { label: "Performance", path: "/analytics" },
    ],
  },
  industry: {
    label: "Industry",
    items: [
      { label: "Industry Home", path: "/industry" },
      { label: "Marketplace", path: "/marketplace" },
      { label: "Titles", path: "/titles" },
      { label: "Talent", path: "/talent" },
      { label: "Festivals", path: "/festivals" },
      { label: "Events", path: "/events" },
      { label: "Opportunities", path: "/opportunities" },
      { label: "Industry Insights", path: "/industry/insights" },
    ],
  },
  muse: {
    label: "SV Muse",
    items: [
      { label: "Ideas", path: "/chat?mode=muse&focus=ideas" },
      { label: "Development", path: "/chat?mode=muse&focus=development" },
      { label: "Research", path: "/chat?mode=muse&focus=research" },
      { label: "Marketing", path: "/chat?mode=muse&focus=marketing" },
      { label: "Distribution", path: "/chat?mode=muse&focus=distribution" },
    ],
  },
};

export const DEFAULT_NAVIGATION_MODE: NavigationMode = "watch";
