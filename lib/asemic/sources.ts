// The xCO sentences the asemic script grows from. Each line is written as one
// passage; a line break becomes a rest on the thread. The propositions are
// copied from /x-demo, which does not export them.

export const SOURCES = [
  {
    id: "tone",
    label: "The tone note",
    text: [
      "Be precise about what we know, explicit about what we are testing, and open about what remains unresolved.",
      "Learning in public. Show what is being learned, not what has been done.",
    ].join("\n"),
  },
  {
    id: "propositions",
    label: "The propositions",
    text: [
      "We publish what we are testing alongside what we know. Each claim carries its status and its version.",
      "Optionality can be measured as the number of viable pathways a place keeps open, not the value of any single one.",
      "Long-horizon capital behaves differently when the governance around it can be revised.",
      "Institutions can hold an option without committing to exercise it, and without being blamed for not doing so.",
      "Optionality can be priced like any other asset. Withdrawn: the pilots showed its value depends on who holds the right to change course.",
    ].join("\n"),
  },
  {
    id: "identity",
    label: "The identity note",
    text: [
      "A field of work on how societies keep more futures open: through capital structures, institutional pathways and governance that can change course.",
      "Identity is syntax, not icon. Line behaviour, annotation style, diagram logic, tone, rhythm, versioning and visual gestures.",
      "The x is the operator acting on the C and the O. Same geometry, different openness.",
    ].join("\n"),
  },
] as const;

export type SourceId = (typeof SOURCES)[number]["id"];
