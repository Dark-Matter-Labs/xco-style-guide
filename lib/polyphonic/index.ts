// xCO Polyphonic Communication Grammar.
//
// Encoded from the xCO Polyphonic Communication Style Guide v6.1 (6 September
// 2026), which supersedes v5. 6.1 keeps v5's foundations whole and adds a
// generative centre: reader capability as a purpose, situated voices, the
// Inquiry Field, precise commitments, material attention and a reader-benefit
// release test. Its token registry is identical to v5's.
// This layer governs *communication* — what a composition does to a reader and
// with what consequence. It sits alongside design-tokens.ts, which governs the
// *visual* system (palette, type, spacing).
//
// The two are deliberately separate: §11 states that serif, italic, mono,
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
  commitmentMaxim,
  commitmentCertainty,
  decisionRules,
  boundedInquiry,
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
  inquiryConditionStates,
  inquiryFieldRules,
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
  proportionNote,
  channelJurisdictions,
} from "./integrity";
export type { AmbiguityClass, ReleaseGate, AntiPattern } from "./integrity";

export {
  generativeIntro,
  generativeFraming,
  generativeOperations,
  hopeConditions,
  legitimateOutcomes,
  registerAndVoice,
  situatedVoiceRules,
  workingForms,
  workingFormsNote,
} from "./generative";
export type { GenerativeOperation } from "./generative";

export {
  materialAttention,
  materialPrinciples,
  materialTreatments,
  imageryContract,
  composeIntro,
  compositionSteps,
  failureIsInformative,
  compositionBrief,
  compositionBriefText,
} from "./compose";

// Source provenance — this grammar is a governed object (§10 gate 08).
export const GRAMMAR_SOURCE = {
  title: "xCO Polyphonic Communication Style Guide",
  version: "v6.1",
  date: "6 September 2026",
  supersedes: "v5",
  question: "What becomes possible when different voices can change the question?",
  governingProposition:
    "Polyphonic communication composes relations through which people can become more capable of perceiving, questioning and participating together.",
  constitutionalLine: "A shared question. Distinct voices. Greater capacity to participate.",
  governingPurpose: "Make interdependence perceptible. Let difference change the question. Develop the capacity to participate.",
  maxim: "Make the commitment precise. Make uncertainty about its effects explicit.",
} as const;
