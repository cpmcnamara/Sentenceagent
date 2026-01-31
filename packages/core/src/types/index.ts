/**
 * Core Types for Rhythm-Aware Pattern Miner
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type PatternType = 'SPU' | 'CPU';

export type PatternTier = 'active' | 'archive';

export type PatternStatus = 'accepted' | 'rejected' | 'pending';

export type RejectionReason =
  | 'too_vague'
  | 'too_cute'
  | 'too_long'
  | 'too_abstract'
  | 'too_academic'
  | 'cadence_flat'
  | 'cadence_manic'
  | 'meaning_unclear'
  | 'sounds_like_ai'
  | 'other';

export const REJECTION_REASONS: Record<RejectionReason, string> = {
  too_vague: 'Too vague',
  too_cute: 'Too cute/cheesy',
  too_long: 'Too long',
  too_abstract: 'Too abstract',
  too_academic: 'Too academic',
  cadence_flat: 'Cadence feels flat',
  cadence_manic: 'Cadence feels manic',
  meaning_unclear: 'Meaning unclear',
  sounds_like_ai: 'Sounds like AI',
  other: 'Other',
};

export type ParagraphRole =
  | 'opening'
  | 'hook'
  | 'frame'
  | 'argument'
  | 'evidence'
  | 'pivot'
  | 'transition'
  | 'concession'
  | 'counterpunch'
  | 'definition'
  | 'elaboration'
  | 'close';

export type IntentTag =
  | 'hook'
  | 'frame'
  | 'reframe'
  | 'crystallization'
  | 'pivot'
  | 'reversal'
  | 'concede_counterpunch'
  | 'build_momentum'
  | 'slow_down'
  | 'summarize'
  | 'foreshadow'
  | 'callback';

export type Audience = 'exec' | 'essay' | 'technical' | 'general';

export type MetaphorTolerance = 'low' | 'medium' | 'high';

export type CompressionLevel = 'low' | 'medium' | 'high';

export type HeatLevel = 'cool' | 'warm' | 'hot';

export type CadenceArchetype =
  | 'crescendo_snap'
  | 'staccato'
  | 'wave'
  | 'drumline'
  | 'slow_build'
  | 'punch_punch_land'
  | 'long_short_snap'
  | 'parallel_march'
  | 'spiral'
  | 'bookend'
  | 'ladder'
  | 'heartbeat'
  | 'cascade';

export type SentenceFamily =
  | 'negation_pivot'
  | 'colon_reveal'
  | 'em_dash_insert'
  | 'question_answer'
  | 'list_resolve'
  | 'contrast_pair'
  | 'conditional_snap'
  | 'definition_is'
  | 'analogy_bridge'
  | 'parallel_triple'
  | 'reversal_but'
  | 'accumulation'
  | 'understatement'
  | 'direct_command'
  | 'fragment_punch'
  | 'extended_qualifier';

// =============================================================================
// RHYTHM ANALYSIS TYPES
// =============================================================================

export interface RhythmProfile {
  wordCount: number;
  charCount: number;
  syllableEstimate: number;
  clauseCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  punctuationProfile: PunctuationProfile;
  lengthCategory: 'short' | 'medium' | 'long' | 'extended';
  stressPattern: string; // e.g., "SL-SL-L" for short-long patterns
}

export interface PunctuationProfile {
  periods: number;
  commas: number;
  semicolons: number;
  colons: number;
  emDashes: number;
  questionMarks: number;
  exclamationMarks: number;
  parentheses: number;
  ellipses: number;
}

export interface SentenceRhythm {
  position: number;
  text: string;
  wordCount: number;
  clauseEstimate: number;
  punctuation: PunctuationProfile;
  role: 'setup' | 'build' | 'pivot' | 'land' | 'coda';
}

export interface CadenceContour {
  sentenceRhythms: SentenceRhythm[];
  lengthContour: number[]; // word counts per sentence
  archetype: CadenceArchetype;
  archetypeConfidence: number;
  hingeSentenceIndex: number | null;
  totalSentences: number;
}

// =============================================================================
// PATTERN UNIT TYPES
// =============================================================================

export interface PatternBase {
  id: string;
  type: PatternType;
  tier: PatternTier;
  createdAt: string;
  updatedAt: string;
  version: number;

  // Core content (structures, not full text)
  template: string; // Abstracted structure with [X], [Y] placeholders
  constraints: string[]; // Structural constraints
  exampleSnippet: string; // Short example (< 50 words)

  // Classification
  family: SentenceFamily | null;
  paragraphRoles: ParagraphRole[];
  intentTags: IntentTag[];
  cadenceArchetype: CadenceArchetype | null;

  // Audience & style
  audienceSuitability: Audience[];
  metaphorLevel: MetaphorTolerance;
  compressionLevel: CompressionLevel;
  heatLevel: HeatLevel;

  // Rhythm
  rhythmProfile: RhythmProfile;

  // Quality & usage
  evidenceCount: number;
  testsPassed: number;
  overuseCap: number | null;
  hardBans: string[]; // Contexts where this should never be used

  // Annotations
  whyItWorks: string;
  whyItMightFail: string;
  notes: string;

  // Fingerprinting
  fingerprint: string;
  featureVector: number[];

  // Source tracking
  sourceUrl: string | null;
  sourceType: 'url' | 'paste' | 'manual';
}

export interface SPU extends PatternBase {
  type: 'SPU';
}

export interface CPU extends PatternBase {
  type: 'CPU';
  cadenceContour: CadenceContour;
  hingeSentenceTemplate: string | null;
  essentialElements: ('crescendo' | 'snap' | 'parallelism' | 'contrast' | 'repetition')[];
}

export type PatternUnit = SPU | CPU;

// =============================================================================
// REJECTED PATTERN
// =============================================================================

export interface RejectedPattern {
  id: string;
  originalText: string;
  template: string;
  fingerprint: string;
  rejectionReason: RejectionReason;
  rejectionNotes: string;
  rejectedAt: string;
  sourceUrl: string | null;
}

// =============================================================================
// CANDIDATE (PRE-ACCEPTANCE)
// =============================================================================

export interface Candidate {
  id: string;
  text: string;
  template: string;
  type: PatternType;
  rhythmProfile: RhythmProfile;
  cadenceContour: CadenceContour | null;

  // Predicted classifications
  predictedFamily: SentenceFamily | null;
  predictedRoles: ParagraphRole[];
  predictedIntents: IntentTag[];
  predictedCadence: CadenceArchetype | null;
  predictedAudience: Audience[];

  // Scoring
  score: CandidateScore;

  // Annotations
  whyItWorks: string;
  whyItMightFail: string;

  // Source
  sourceUrl: string | null;
  sourceType: 'url' | 'paste' | 'manual';
}

export interface CandidateScore {
  total: number;
  intentMatch: number;
  novelty: number;
  preferenceMatch: number;
  reusability: number;
  antiCliche: number;
  rhythmQuality: number;
}

// =============================================================================
// USER PREFERENCES
// =============================================================================

export interface UserPreferences {
  // Defaults
  defaultAudience: Audience[];
  defaultMetaphorTolerance: MetaphorTolerance;
  defaultCompression: CompressionLevel;

  // Length preferences (learned)
  preferredSentenceLengthRange: [number, number]; // [min, max] words
  preferredParagraphLengthRange: [number, number]; // [min, max] sentences

  // Cadence preferences
  preferredCadenceArchetypes: CadenceArchetype[];
  dislikedCadenceArchetypes: CadenceArchetype[];

  // Style preferences
  metaphorTolerance: MetaphorTolerance;
  bannedPhrases: string[];
  dislikedTells: string[]; // Phrases that "sound like AI"

  // Families
  favoredFamilies: SentenceFamily[];
  dislikedFamilies: SentenceFamily[];

  // Failure modes (ranked by dislike)
  dislikedFailureModes: RejectionReason[];

  // Stats (auto-updated)
  totalAccepted: number;
  totalRejected: number;
  rejectionReasonCounts: Record<RejectionReason, number>;
  lastUpdated: string;
}

// =============================================================================
// MINING SESSION
// =============================================================================

export interface MiningQuery {
  role?: ParagraphRole;
  intent?: IntentTag;
  audience?: Audience;
  metaphor?: MetaphorTolerance;
  compression?: CompressionLevel;
  heat?: HeatLevel;
  cadence?: CadenceArchetype;
  sourceUrl?: string;
  pastedText?: string;
}

export interface MiningSession {
  id: string;
  startedAt: string;
  query: MiningQuery;
  acceptedCount: number;
  rejectedCount: number;
  skippedCount: number;
  mergedCount: number;
  acceptedPatterns: string[]; // Pattern IDs
  rejectedPatterns: string[]; // Rejected pattern IDs
  recentFingerprints: string[]; // For diversity enforcement
}

export interface SessionSummary {
  session: MiningSession;
  endedAt: string;
  libraryCoverage: LibraryCoverage;
  suggestions: string[];
}

export interface LibraryCoverage {
  byRole: Record<ParagraphRole, number>;
  byIntent: Record<IntentTag, number>;
  byCadence: Record<CadenceArchetype, number>;
  underrepresented: string[];
  overrepresented: string[];
}

// =============================================================================
// SOURCE MANAGEMENT
// =============================================================================

export interface Source {
  url: string;
  addedAt: string;
  lastFetched: string | null;
  category: string | null;
  tags: string[];
  fetchCount: number;
  patternsExtracted: number;
  status: 'active' | 'failed' | 'disabled';
  errorMessage: string | null;
}

// =============================================================================
// SEARCH & FILTERING
// =============================================================================

export interface SearchQuery {
  intent?: IntentTag;
  role?: ParagraphRole;
  cadence?: CadenceArchetype;
  audience?: Audience;
  compression?: CompressionLevel;
  family?: SentenceFamily;
  tier?: PatternTier;
  type?: PatternType;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  pattern: PatternUnit;
  relevanceScore: number;
}

// =============================================================================
// SIMILARITY & FINGERPRINTING
// =============================================================================

export interface SimilarityMatch {
  patternId: string;
  similarity: number;
  pattern: PatternUnit;
}

export interface FingerprintComponents {
  structure: string; // Abstracted syntactic structure
  lengthBucket: string; // 'S' | 'M' | 'L' | 'XL'
  punctuationSignature: string; // e.g., "C-E-P" for comma, em-dash, period
  clausePattern: string; // e.g., "2-1" for 2 clauses then 1
}
