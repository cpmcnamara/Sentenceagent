/**
 * Extended Types for Comprehensive Style Capture
 *
 * A complete "writing brain" needs to capture:
 * - Sentence construction (SPU/CPU)
 * - Word choice / lexicon
 * - Voice markers / signature phrases
 * - Energy contours
 * - Flow patterns
 * - Structural templates
 */

import {
  PatternBase,
  RhythmProfile,
  CadenceContour,
  Audience,
  MetaphorTolerance,
  CompressionLevel,
  HeatLevel,
} from './index.js';

// =============================================================================
// LEXICON PROFILE - Word Choice Patterns
// =============================================================================

export interface LexiconProfile {
  // Vocabulary characteristics
  averageWordLength: number;
  averageSyllablesPerWord: number;
  lexicalDiversity: number; // Type-token ratio

  // Word class preferences
  verbDensity: number; // Verbs per 100 words
  adjectiveDensity: number;
  adverbDensity: number;
  nounDensity: number;

  // Preferred word patterns
  preferredVerbs: WeightedWord[];
  preferredTransitions: WeightedWord[];
  preferredModifiers: WeightedWord[];
  avoidedWords: string[];

  // Formality spectrum
  formalityScore: number; // 0-1 (casual to formal)
  technicalDensity: number; // Jargon/technical terms per 100 words

  // Concrete vs abstract
  concretenessRatio: number; // Ratio of concrete to abstract nouns
}

export interface WeightedWord {
  word: string;
  frequency: number;
  contexts: string[]; // Where this word appears
}

// =============================================================================
// VOICE MARKER - Signature Phrases & Constructions
// =============================================================================

export interface VoiceMarker {
  id: string;
  type: 'phrase' | 'construction' | 'rhythm' | 'opening' | 'closing';

  // The pattern itself
  template: string;
  examples: string[];

  // When it appears
  typicalPosition: 'start' | 'middle' | 'end' | 'any';
  frequency: 'signature' | 'common' | 'occasional';

  // Effect
  effect: string; // What this marker does for the writing
  alternatives: string[]; // Other ways to achieve similar effect

  // Constraints
  maxUsagePerPiece: number;
  notAfter: string[]; // Patterns it shouldn't follow
  notBefore: string[]; // Patterns it shouldn't precede
}

// =============================================================================
// ENERGY PATTERN - Intensity Modulation
// =============================================================================

export type EnergyLevel = 'quiet' | 'building' | 'intense' | 'peak' | 'release';

export interface EnergyContour {
  id: string;
  name: string;

  // The shape of energy through a piece
  pattern: EnergyLevel[];
  archetypeName: string; // e.g., "slow_burn", "punch_rest_punch", "crescendo"

  // Characteristics
  peakPosition: number; // 0-1, where the peak occurs
  peakCount: number; // Number of peaks
  averageIntensity: number; // 0-1

  // When to use
  suitableFor: string[]; // Types of pieces
  effect: string;
}

export const ENERGY_ARCHETYPES = {
  slow_burn: {
    description: 'Gradual build to a late peak',
    pattern: ['quiet', 'building', 'building', 'intense', 'peak', 'release'],
    peakPosition: 0.8,
  },
  punch_rest_punch: {
    description: 'Alternating intensity with recovery periods',
    pattern: ['intense', 'quiet', 'intense', 'quiet', 'peak'],
    peakPosition: 0.9,
  },
  front_loaded: {
    description: 'Strong opening that levels off',
    pattern: ['peak', 'intense', 'building', 'quiet', 'building'],
    peakPosition: 0.1,
  },
  wave: {
    description: 'Multiple builds and releases',
    pattern: ['building', 'peak', 'release', 'building', 'peak', 'release'],
    peakPosition: 0.5,
  },
  steady_simmer: {
    description: 'Consistent moderate intensity throughout',
    pattern: ['building', 'intense', 'intense', 'intense', 'building'],
    peakPosition: 0.5,
  },
  quiet_explosion: {
    description: 'Quiet throughout with sudden peak at end',
    pattern: ['quiet', 'quiet', 'building', 'peak', 'release'],
    peakPosition: 0.8,
  },
} as const;

// =============================================================================
// FLOW PATTERN - Transition & Connection Style
// =============================================================================

export type TransitionStyle =
  | 'explicit' // Clear transitional phrases
  | 'implicit' // Ideas flow without markers
  | 'parallel' // Parallel structure creates connection
  | 'question' // Questions bridge ideas
  | 'callback' // References to earlier content
  | 'contrast'; // But/however/yet transitions

export interface FlowPattern {
  id: string;
  name: string;

  // How ideas connect
  dominantTransitionStyle: TransitionStyle;
  transitionFrequency: number; // Explicit transitions per 100 sentences

  // Paragraph linking
  paragraphLinkingStyle: 'tight' | 'loose' | 'varied';
  averageParagraphLength: number; // In sentences

  // Idea development
  developmentPattern: 'linear' | 'spiral' | 'branching' | 'dialectic';

  // Examples
  transitionExamples: string[];
}

// =============================================================================
// STRUCTURAL TEMPLATE - Macro-Level Organization
// =============================================================================

export interface StructuralTemplate {
  id: string;
  name: string;
  type: 'essay' | 'argument' | 'narrative' | 'analysis' | 'memo' | 'thread';

  // The skeleton
  sections: SectionTemplate[];
  totalParagraphRange: [number, number];

  // Characteristics
  openingStyle: string;
  closingStyle: string;
  argumentStructure: 'claim-evidence' | 'problem-solution' | 'compare-contrast' | 'narrative' | 'dialectic';

  // Energy shape
  energyContour: string; // Reference to EnergyContour archetype

  // Examples
  exampleOutlines: string[];
}

export interface SectionTemplate {
  name: string;
  position: number; // Order in the piece
  paragraphRange: [number, number];
  role: string;
  typicalPatterns: string[]; // Pattern IDs that work here
  energyLevel: EnergyLevel;
  transitionIn: string; // How to enter this section
  transitionOut: string; // How to exit this section
}

// =============================================================================
// STYLE DNA - Complete Style Fingerprint
// =============================================================================

export interface StyleDNA {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Core patterns
  sentencePatterns: string[]; // SPU IDs
  cadencePatterns: string[]; // CPU IDs

  // Extended patterns
  lexiconProfile: LexiconProfile;
  voiceMarkers: VoiceMarker[];
  energyContours: EnergyContour[];
  flowPatterns: FlowPattern[];
  structuralTemplates: StructuralTemplate[];

  // Preferences (from user profile)
  audienceDefault: Audience[];
  metaphorTolerance: MetaphorTolerance;
  compressionLevel: CompressionLevel;
  heatLevel: HeatLevel;

  // Quality thresholds
  minPatternEvidence: number; // Minimum examples before pattern is trusted
  diversityTarget: number; // Target variety in pattern usage
}

// =============================================================================
// STYLE EXTRACTION - Mining Configuration
// =============================================================================

export interface StyleExtractionConfig {
  // What to extract
  extractSentencePatterns: boolean;
  extractCadencePatterns: boolean;
  extractLexicon: boolean;
  extractVoiceMarkers: boolean;
  extractEnergyContours: boolean;
  extractFlowPatterns: boolean;
  extractStructure: boolean;

  // Source requirements
  minSourceCount: number; // Minimum sources to establish style
  minWordCount: number; // Minimum words per source

  // Confidence thresholds
  patternConfidenceThreshold: number; // 0-1
  markerFrequencyThreshold: number; // Minimum occurrences

  // Deduplication
  similarityThreshold: number; // Below this, patterns are merged
}

// =============================================================================
// WRITING SAMPLE - For Style Analysis
// =============================================================================

export interface WritingSample {
  id: string;
  sourceUrl: string | null;
  sourceType: 'url' | 'paste' | 'file';
  title: string;
  content: string;
  wordCount: number;
  addedAt: string;

  // Analysis results
  analyzed: boolean;
  analysisVersion: number;

  // Extracted features
  rhythmProfile?: RhythmProfile;
  cadenceContours?: CadenceContour[];
  lexiconSnapshot?: Partial<LexiconProfile>;
  detectedPatterns?: string[]; // Pattern IDs found
  detectedMarkers?: string[]; // Voice marker IDs found
}

// =============================================================================
// STYLE REPLICATION - Generation Guidance
// =============================================================================

export interface StyleReplicationGuide {
  // For LLM prompting
  voiceSummary: string; // Prose description of the style
  dosAndDonts: {
    do: string[];
    dont: string[];
  };

  // Concrete examples
  exampleSentences: string[];
  exampleParagraphs: string[];
  exampleTransitions: string[];

  // Constraints
  wordLengthRange: [number, number];
  sentenceLengthRange: [number, number];
  paragraphLengthRange: [number, number];

  // Pattern usage guidance
  patternUsageGuide: {
    patternId: string;
    frequency: 'high' | 'medium' | 'low';
    contexts: string[];
  }[];
}
