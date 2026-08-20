// xCO Polyphonic Communication Grammar.
//
// Encoded from the xCO Polyphonic Communication Style Guide v5.
// This layer governs *communication* — what a composition does to a reader and
// with what consequence. It sits alongside design-tokens.ts, which governs the
// *visual* system (palette, type, spacing).
//
// The two are deliberately separate: v5 §08 states that serif, italic, mono,
// colour and orientation are affordances, not semantic laws. This module encodes
// the grammar; design-tokens.ts supplies the marks it operates on.

export {
  licences,
  constitutionSteps,
  principles,
  performedRelation,
  institutionalActs,
  decisionObject,
  consentRules,
} from "./licences";
export type { Licence, LicenceId } from "./licences";

export {
  operators,
  notationContract,
  operatorWalkthrough,
  spatialOperators,
  attentionBeats,
  readingProbes,
} from "./operators";
export type { Operator } from "./operators";

export {
  relationJurisdictions,
  epistemicFunctions,
  logicalDistinctions,
  evidenceContract,
  evidenceTypeDisclosures,
} from "./relations";
export type { RelationJurisdiction, RelationCode } from "./relations";

export {
  topologies,
  conceptFieldElements,
  lineageSteps,
  lineageTests,
  transpositionInvariants,
  transpositionRecomposable,
} from "./topologies";
export type { Topology } from "./topologies";

export {
  readerPositions,
  politicalChecksum,
  agentTypes,
  addressHazards,
} from "./reader";
export type { ReaderPosition, AgentType } from "./reader";

export {
  ambiguityClasses,
  releaseTests,
  releaseGates,
  antiPatterns,
  compositionalProportion,
  channelJurisdictions,
} from "./integrity";
export type { AmbiguityClass, ReleaseGate, AntiPattern } from "./integrity";

// Source provenance — this grammar is a governed object (§07 gate 08).
export const GRAMMAR_SOURCE = {
  title: "XCO Polyphonic Communication Style Guide",
  version: "v5",
  governingProposition:
    "Polyphonic communication is the governed composition of performed relations.",
  maxim: "Meaning may remain open. Institutional consequence may not.",
} as const;
