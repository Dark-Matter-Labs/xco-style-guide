// xCO Polyphonic Communication Grammar.
//
// Encoded from the xCO Polyphonic Communication Style Guide v8.1 (5 October
// 2026), which supersedes v6.1. 6.1 added a generative centre to v5: reader
// capability as a purpose, situated voices, the Inquiry Field, precise
// commitments, material attention and a reader-benefit release test. 7.0–8.1
// keep all of that and add seven references and five grammars: the page and
// its questioning margin, the proof block, the situated atlas, material worlds
// and a reusable production layer. 8.1 also sets the palette (design-tokens.ts).
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

export { referencesIntro, referenceStudies, referenceGrammars, referenceDepths } from "./references";
export type { ReferenceStudy } from "./references";

export {
  pageGrammarIntro,
  pageLayers,
  pageSpecimen,
  annotationContract,
  annotationRecord,
  pageStartingValues,
  pageByLicence,
  highlightKeyRule,
} from "./page-grammar";

export {
  proofIntro,
  proofSpecimen,
  proofBands,
  proofMinimumRecord,
  proofNeighbours,
  proofClose,
} from "./proof";
export type { ProofBand, ProofLine, HighlightRole } from "./proof";

export {
  atlasIntro,
  atlasRoutes,
  atlasCrossing,
  atlasLineContract,
  atlasConnections,
  atlasScopedNames,
  atlasRules,
  atlasClose,
} from "./atlas";
export type { AtlasRoute, AtlasStep } from "./atlas";

export {
  materialWorldIntro,
  materialWorldSteps,
  worldGrammar,
  imageBrief,
  imageBriefMedium,
  materialWorldClose,
  questionToForm,
  formCompositions,
} from "./worlds";

export {
  identityIntro,
  typeAffordances,
  semanticRegistry,
  implementationRequirements,
  productionIntro,
  productionContract,
  proofFragmentHTML,
  proofFragmentCSS,
  addressConvention,
  portableRecord,
  revisionRule,
} from "./identity";

// Source provenance — this grammar is a governed object (§10 gate 08).
export const GRAMMAR_SOURCE = {
  title: "xCO Polyphonic Communication Style Guide",
  version: "v8.1",
  date: "5 October 2026",
  supersedes: "v6.1",
  subtitle: "A language for worlds still becoming.",
  opening: "What can a language hold open?",
  question: "What must remain open for another world to become possible?",
  governingProposition:
    "Polyphonic communication composes relations through which people can become more capable of perceiving, questioning and participating together.",
  constitutionalLine: "A shared question. Distinct voices. Greater capacity to participate.",
  governingPurpose: "Make interdependence perceptible. Let difference change the question. Develop the capacity to participate.",
  maxim: "Make the commitment precise. Make uncertainty about its effects explicit.",
} as const;
