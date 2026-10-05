// Situated atlas — accounts in motion (§06C).
//
// From the xCO Polyphonic Communication Style Guide v8.1. The Service Score
// shows distributed responsibilities; the atlas follows an account across the
// places, waits, thresholds and relationships through which a capability
// becomes usable. AT-H1 extends the constructed cooling case (H0) as a
// hypothetical reading: it adds no observation to the source record, and its
// positions are relational — distances and durations are unmeasured.

export const atlasIntro = {
  title: "One field. Several trajectories.",
  line: "A system is encountered from somewhere, through time, under particular conditions.",
  body: "The atlas can expose where an institution's nominal provision and someone's lived pathway diverge. Keep the ground quiet enough for distinct accounts to remain traceable. Give a pause its own presence. Put a border, permission, handoff or maintenance condition at the encounter where it becomes consequential. At a crossing, keep which route belongs to whom.",
  scale: "No implied geography. Positions show a relational arrangement; distances and durations are unmeasured.",
} as const;

export interface AtlasStep {
  id: string;
  name: string;
  text: string;
  /** Unresolved prerequisite — drawn dashed. */
  unresolved?: boolean;
  /** A wait of unknown duration — drawn as a ring. */
  wait?: boolean;
}

export interface AtlasRoute {
  id: "AT-A" | "AT-B";
  /** Route identity colour (routeColors in design-tokens). */
  route: "a" | "b";
  account: string;
  title: [string, string];
  steps: AtlasStep[];
}

export const atlasRoutes: AtlasRoute[] = [
  {
    id: "AT-A",
    route: "a",
    account: "Resident / constructed pathway",
    title: ["From a room listed", "to a place usable."],
    steps: [
      { id: "A1", name: "Home", text: "A resident needs cooling at a particular time. The starting account belongs to that situation." },
      { id: "A2", name: "Route", text: "Reaching the facility depends on a workable journey. Its duration and availability remain unknown.", unresolved: true, wait: true },
      { id: "A3", name: "Threshold", text: "Admission, opening hours and any required accompaniment must coincide. A listed room does not establish this.", unresolved: true },
      { id: "A4", name: "Remain", text: "A room's condition, suitability and practical rules need to let the resident stay when required." },
      { id: "A5", name: "Return", text: "A usable return route and a way to report the encounter become part of the capability." },
    ],
  },
  {
    id: "AT-B",
    route: "b",
    account: "Care worker / constructed pathway",
    title: ["From an assignment", "to sustained support."],
    steps: [
      { id: "B1", name: "Rota", text: "A worker, available time and a funded arrangement would need to be identified." },
      { id: "B2", name: "Wait", text: "A suspended care route leaves accompaniment unresolved. The resulting delay is not measured.", unresolved: true, wait: true },
      { id: "B3", name: "Accompany", text: "The arrangement depends on the resident's agreement, the worker's availability and a practicable route." },
      { id: "B4", name: "Handoff", text: "At the shared threshold, who supports admission and continued use must be explicit.", unresolved: true },
      { id: "B5", name: "Return", text: "Subsequent duties, the return journey and the labour of reviewing the encounter need resources." },
    ],
  },
];

export const atlasCrossing =
  "Crossing / A3 ↔ B4. The accounts share an encounter while keeping different prerequisites and burdens. Review / A5 + B5. Each can reopen the shared question through an attributable account.";

export const atlasLineContract =
  "Blue and oxide identify two constructed accounts. A solid segment is a step in the proposed scenario; a dashed segment has an unresolved prerequisite. A ring marks a wait of unknown duration. Arrowheads show the reading direction. Both routes remain in the complete account below.";

/** AT ↔ IF ↔ SS — exact connections into the shared teaching record. */
export const atlasConnections = [
  { atlas: "AT:AT-H1/A3 / admission", existing: "IF:H-I/A2 / situated access", relation: "Examines the “enter” part of reaching, entering and remaining. The route can identify a missing prerequisite or a question for observation." },
  { atlas: "AT:AT-H1/B4 / handoff", existing: "SS / resident and team handoffs", relation: "Locates who would support the shared threshold. The Service Score keeps agreement, allocation and human work as distinct relations." },
  { atlas: "AT:AT-H1/A5 + B5 / return", existing: "IF:H-I/A3 / sustained provision + SS / review stage", relation: "Opens the recurring work and resource questions after an encounter, and carries accounts back into review." },
] as const;

export const atlasScopedNames =
  "Keep local names scoped. Atlas A3 means admission; Inquiry Field A3 means sustained provision. Write the full address when linking records — AT:AT-H1/A3 and IF:H-I/A3. Module, record and local object together identify the target.";

export const atlasRules = [
  { name: "Location", line: "Draw the place that matters.", body: "Use a small architectural vignette when a threshold, room, bridge, vehicle or boundary materially changes the account. A decorative building only adds apparent specificity." },
  { name: "Time", line: "Give a wait its own object.", body: "Separate measured duration, reported duration, sequence and unknown delay. A long drawn segment never becomes a time measure without an explicit scale." },
  { name: "Account", line: "Keep the voice addressable.", body: "Each route carries an account ID, source, interval, gaps and correction route. A recalled journey and an institutional log can share a field while keeping their different evidential functions." },
  { name: "Distribution", line: "Show the cost of continuation.", body: "A capability may shift waiting, work or risk from one actor to another. Put those changes where they occur. A smooth path can conceal the people who keep it available." },
] as const;

export const atlasClose = ["Movement. Waiting. Threshold.", "Handoff. Maintenance. Return."] as const;
