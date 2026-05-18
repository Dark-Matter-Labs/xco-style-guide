// Prompt templates for each xCO tone register.
// Paste into Claude / ChatGPT to draft text in the correct voice.
// Each template includes: the rule, two example pairs, uncertainty instructions.

export const toneRegisters = [
  {
    id: "method" as const,
    label: "A — Method",
    usage: "Technical writing, papers, policy docs, briefings",
    rule: "Specific verbs, real numbers, named places.",
    ruleDetail:
      "No abstractions, no hedging about process. The reader should be able to fact-check every claim.",
    examples: [
      {
        good: "Madrid faces +7.5°C. The portfolio combines a peri-urban food forest, mistifier networks at the street scale, and community energy storage.",
        bad: "We are exploring transformative pathways for urban climate resilience through integrated, multi-stakeholder approaches.",
      },
      {
        good: "Arctic destabilisation is running 4× faster than IPCC median projections. The response portfolio requires 40,000 ha of rewetted peatland and a 23-municipality governance compact.",
        bad: "We believe unprecedented action is needed to holistically address the systemic challenge of Arctic systems at civilizational risk.",
      },
    ],
  },
  {
    id: "hunch" as const,
    label: "B — Hunch",
    usage: "Substack, LinkedIn, thinking-aloud posts, internal strategy notes",
    rule: "Declarative about the question, tentative about the answer.",
    ruleDetail:
      "State the problem clearly and confidently. Admit what you don't know. Do not conclude.",
    examples: [
      {
        good: "If field optionality is the precondition for the other two regimes, the allocation problem isn't about choosing between them — it's about why capital under-prices preconditions. We're trying to figure out how to price what makes everything else possible.",
        bad: "We believe field optionality represents a paradigm shift in how we think about civilizational resilience.",
      },
      {
        good: "There's something structurally odd about how the three regimes get funded. Frontier and Fortress attract capital because their returns are legible. Field doesn't. That might be the whole problem.",
        bad: "We envision a transformative new approach that leverages field optionality to unlock unprecedented civilizational potential across all three regimes.",
      },
    ],
  },
  {
    id: "annotation" as const,
    label: "C — Annotation",
    usage: "Diagram captions, footnotes, marginalia, in-document asides",
    rule: "Show the working. Mark uncertainty inline.",
    ruleDetail:
      "Never assert more than you know. Every dependency and assumption gets a tag. This is what makes xCO diagrams different from McKinsey slides.",
    examples: [
      {
        good: "Mistifier governance assumes a legionella testing regime [unverified — depends on Madrid water authority compliance].",
        bad: "Mistifiers will prevent waterborne disease through robust governance frameworks.",
      },
      {
        good: "// [inference] food forest cooling assumes 60% canopy cover by year 5 — actual rate depends on site soil type and water table [unverified for Madrid Cañada Real site].",
        bad: "The food forest will provide comprehensive cooling benefits through its innovative integrated design approach.",
      },
    ],
  },
] as const;

export type RegisterId = (typeof toneRegisters)[number]["id"];

// ── Prompt templates ─────────────────────────────────────────────────

export const promptTemplates: Record<RegisterId, string> = {
  method: `You are writing in the METHOD register of Expanding Civilizational Optionality (xCO).

RULE: Specific verbs, real numbers, named places. No abstractions or process-hedging.

EXAMPLES OF THE REGISTER:
✓ "Madrid faces +7.5°C. The portfolio combines a peri-urban food forest, mistifier networks at the street scale, and community energy storage."
✗ "We are exploring transformative pathways for urban climate resilience through integrated, multi-stakeholder approaches."

✓ "Arctic destabilisation is running 4× faster than IPCC median projections. The response portfolio requires 40,000 ha of rewetted peatland and a 23-municipality governance compact."
✗ "We believe unprecedented action is needed to holistically address the systemic challenge of Arctic systems at civilizational risk."

INSTRUCTIONS:
- Use named places (Madrid, Santiago, the Mackenzie Basin), real numbers (+7.5°C, 40,000 ha, 4×), specific verbs (combines, requires, produces, removes, fails to)
- Avoid: transformative, unprecedented, regenerative [as adjective], holistic, paradigm, ecosystem [as metaphor], unlock, leverage, empower, journey, "in this space"
- Mark all uncertainty inline — do not drop uncertain claims, mark them: [unverified], [inference], [speculation]
- If you don't have a number, say "X ha [unverified]" — don't omit the structure

TEXT TO WRITE:
[INSERT BRIEF OR BULLET POINTS HERE]`,

  hunch: `You are writing in the HUNCH register of Expanding Civilizational Optionality (xCO).

RULE: Declarative about the question, tentative about the answer. You know what the problem is. You don't know the solution yet.

EXAMPLES OF THE REGISTER:
✓ "If field optionality is the precondition for the other two regimes, the allocation problem isn't about choosing between them — it's about why capital under-prices preconditions. We're trying to figure out how to price what makes everything else possible."
✗ "We believe field optionality represents a paradigm shift in how we think about civilizational resilience."

✓ "There's something structurally odd about how the three regimes get funded. Frontier and Fortress attract capital because their returns are legible. Field doesn't. That might be the whole problem."
✗ "We envision a transformative new approach that leverages field optionality to unlock unprecedented civilizational potential."

INSTRUCTIONS:
- State the problem clearly and confidently — do not hedge about the question
- Be tentative about answers: "we're trying to", "might be", "it's not clear whether", "the question is"
- Allergic to: transformative, unprecedented, regenerative [as adjective], paradigm, ecosystem [as metaphor], unlock, leverage, empower, journey, "in this space"
- No "we believe" or "we envision" — if you're stating a belief, state the reasoning instead
- Mark all uncertainty: [unverified], [inference], [speculation]

TEXT TO WRITE:
[INSERT TOPIC OR QUESTION HERE]`,

  annotation: `You are writing in the ANNOTATION register of Expanding Civilizational Optionality (xCO).

RULE: Show the working. Mark every assumption, dependency, and uncertainty inline. Never assert more than you know.

EXAMPLES OF THE REGISTER:
✓ "Mistifier governance assumes a legionella testing regime [unverified — depends on Madrid water authority compliance]."
✗ "Mistifiers will prevent waterborne disease through robust governance frameworks."

✓ "// [inference] food forest cooling assumes 60% canopy cover by year 5 — actual rate depends on site soil type and water table [unverified for Madrid Cañada Real site]."
✗ "The food forest will provide comprehensive cooling benefits through its innovative integrated design approach."

INSTRUCTIONS:
- Every claim that depends on something else: state the dependency explicitly
- Use [unverified] when a fact hasn't been confirmed from primary source
- Use [inference] when reasoning forward from known facts
- Use [speculation] when genuinely unknown
- The // prefix is optional but signals "this is the thinking behind the claim above"
- Never drop an uncertain claim — mark it and keep it
- Keep sentences short. One claim per sentence where possible.
- No: transformative, unprecedented, holistic, paradigm, ecosystem [as metaphor]

TEXT TO ANNOTATE (provide the claim to annotate, plus any context you have):
[INSERT CLAIM + CONTEXT HERE]`,
};
