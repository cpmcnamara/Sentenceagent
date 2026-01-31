/**
 * Emotional Pattern Types
 *
 * "The touchstone is emotion, not reason."
 *
 * This module captures the emotional effect of patterns - the real
 * goal beneath all structural analysis. Structure is the delivery
 * mechanism; emotion is the payload.
 */

// =============================================================================
// EMOTIONAL EFFECT TAXONOMY
// =============================================================================

/**
 * Primary emotional effects a pattern can create
 */
export type EmotionalEffect =
  // Engagement emotions
  | 'curiosity'          // Makes reader want to know more
  | 'intrigue'           // Creates mystery/tension
  | 'anticipation'       // Builds expectation

  // Conviction emotions
  | 'certainty'          // Creates feeling of truth/rightness
  | 'clarity'            // "Aha!" moment of understanding
  | 'resolve'            // Strengthens reader's determination

  // Connection emotions
  | 'recognition'        // "That's exactly how I feel"
  | 'empathy'            // Feeling with/for
  | 'belonging'          // Part of something larger

  // Energy emotions
  | 'urgency'            // Need to act now
  | 'momentum'           // Building energy/excitement
  | 'release'            // Cathartic letting go

  // Trust emotions
  | 'credibility'        // Belief in the speaker
  | 'intimacy'           // Closeness/vulnerability
  | 'authority'          // Confidence in the source

  // Surprise emotions
  | 'revelation'         // Unexpected insight
  | 'delight'            // Pleasant surprise
  | 'provocation'        // Challenging assumption

  // Reflective emotions
  | 'contemplation'      // Deep thought
  | 'gravity'            // Weight/importance
  | 'peace'              // Calm resolution

  // Motivational emotions
  | 'inspiration'        // Desire to do/become
  | 'hope'               // Belief in possibility
  | 'determination';     // Will to act

/**
 * Emotional intensity levels
 */
export type EmotionalIntensity = 'subtle' | 'moderate' | 'strong' | 'intense';

/**
 * How emotion is delivered - the mechanism
 */
export type EmotionalDelivery =
  | 'direct'             // States the emotion plainly
  | 'implied'            // Creates space for reader to feel
  | 'accumulated'        // Builds through repetition/listing
  | 'contrasted'         // Creates emotion through juxtaposition
  | 'released'           // Provides catharsis after tension
  | 'understated'        // Says less to feel more
  | 'amplified'          // Uses intensity to overwhelm
  | 'rhythmic';          // Uses cadence to embody emotion

// =============================================================================
// EMOTIONAL PATTERN PROFILE
// =============================================================================

export interface EmotionalProfile {
  /**
   * Primary emotional effect this pattern creates
   */
  primaryEffect: EmotionalEffect;

  /**
   * Secondary effects that support the primary
   */
  secondaryEffects: EmotionalEffect[];

  /**
   * How intense the emotional effect is
   */
  intensity: EmotionalIntensity;

  /**
   * How the emotion is delivered
   */
  delivery: EmotionalDelivery;

  /**
   * What emotional state this pattern assumes/requires in the reader
   */
  entryState?: EmotionalEffect;

  /**
   * What emotional state this pattern leaves the reader in
   */
  exitState: EmotionalEffect;

  /**
   * Emotional risk - what can go wrong
   */
  risks: EmotionalRisk[];

  /**
   * Confidence in this emotional assessment (0-1)
   */
  confidence: number;
}

export interface EmotionalRisk {
  risk: string;
  whenLikely: string;
  mitigation?: string;
}

// =============================================================================
// EMOTIONAL CONTOUR (for paragraphs/pieces)
// =============================================================================

export interface EmotionalContour {
  /**
   * Emotional journey through the text
   */
  journey: EmotionalBeat[];

  /**
   * Overall emotional arc
   */
  arc: EmotionalArc;

  /**
   * Dominant emotion of the piece
   */
  dominantEmotion: EmotionalEffect;

  /**
   * Emotional range (how much variation)
   */
  range: 'narrow' | 'moderate' | 'wide';
}

export interface EmotionalBeat {
  position: number;  // 0-1 through the piece
  emotion: EmotionalEffect;
  intensity: EmotionalIntensity;
  transition?: EmotionalTransition;
}

export type EmotionalTransition =
  | 'shift'       // Gradual change
  | 'pivot'       // Sharp turn
  | 'build'       // Intensification
  | 'release'     // De-escalation
  | 'contrast'    // Juxtaposition
  | 'callback';   // Return to earlier emotion

export type EmotionalArc =
  | 'flat'               // Consistent emotional tone
  | 'build'              // Increasing intensity
  | 'release'            // Decreasing intensity
  | 'arc'                // Build then release
  | 'inverted_arc'       // Release then build
  | 'wave'               // Multiple builds and releases
  | 'shock'              // Sudden emotional shift
  | 'spiral';            // Deepening through repetition

// =============================================================================
// EMOTIONAL-STRUCTURAL MAPPING
// =============================================================================

/**
 * Maps structural patterns to their typical emotional effects
 */
export const STRUCTURE_EMOTION_MAP: Record<string, EmotionalEffect[]> = {
  // Sentence families → emotions
  negation_pivot: ['revelation', 'clarity', 'certainty'],
  colon_reveal: ['anticipation', 'clarity', 'revelation'],
  em_dash_insert: ['intimacy', 'urgency', 'provocation'],
  question_answer: ['curiosity', 'clarity', 'certainty'],
  list_resolve: ['momentum', 'clarity', 'resolve'],
  contrast_pair: ['clarity', 'revelation', 'provocation'],
  conditional_snap: ['urgency', 'certainty', 'gravity'],
  definition_is: ['certainty', 'clarity', 'authority'],
  analogy_bridge: ['recognition', 'clarity', 'connection'],
  parallel_triple: ['momentum', 'certainty', 'inspiration'],
  reversal_but: ['revelation', 'delight', 'provocation'],
  accumulation: ['momentum', 'gravity', 'overwhelm'],
  understatement: ['intimacy', 'gravity', 'credibility'],
  direct_command: ['urgency', 'certainty', 'determination'],
  fragment_punch: ['urgency', 'revelation', 'certainty'],
  extended_qualifier: ['credibility', 'contemplation', 'gravity'],

  // Cadence archetypes → emotions
  crescendo_snap: ['momentum', 'revelation', 'release'],
  staccato: ['urgency', 'certainty', 'determination'],
  wave: ['contemplation', 'momentum', 'peace'],
  drumline: ['certainty', 'authority', 'resolve'],
  slow_build: ['anticipation', 'gravity', 'momentum'],
  punch_punch_land: ['urgency', 'revelation', 'certainty'],
  long_short_snap: ['contemplation', 'revelation', 'clarity'],
  parallel_march: ['certainty', 'momentum', 'inspiration'],
  spiral: ['contemplation', 'revelation', 'gravity'],
  bookend: ['recognition', 'clarity', 'peace'],
  ladder: ['clarity', 'certainty', 'momentum'],
  heartbeat: ['intimacy', 'connection', 'empathy'],
  cascade: ['momentum', 'urgency', 'release'],
};

// =============================================================================
// EMOTIONAL ANALYSIS
// =============================================================================

/**
 * Heuristics for detecting emotional content
 */
export const EMOTION_SIGNALS: Record<EmotionalEffect, RegExp[]> = {
  curiosity: [
    /\bwhat if\b/i,
    /\bwhy\b.*\?/i,
    /\bhow\b.*\?/i,
    /\bwonder\b/i,
    /\bquestion\b/i,
  ],
  intrigue: [
    /\bsecret\b/i,
    /\bhidden\b/i,
    /\bunexpected\b/i,
    /\bsurpris/i,
    /\bmystery\b/i,
  ],
  anticipation: [
    /\bsoon\b/i,
    /\bwait\b/i,
    /\bcoming\b/i,
    /\bwill\b/i,
    /\babout to\b/i,
  ],
  certainty: [
    /\bis\b/i,
    /\balways\b/i,
    /\bnever\b/i,
    /\btruth\b/i,
    /\bfact\b/i,
  ],
  clarity: [
    /\bsimply\b/i,
    /\bclear\b/i,
    /\bobvious\b/i,
    /\bplain\b/i,
    /\bmeans\b/i,
  ],
  resolve: [
    /\bdecide\b/i,
    /\bchoose\b/i,
    /\bcommit\b/i,
    /\bwill\b/i,
    /\bmust\b/i,
  ],
  recognition: [
    /\bknow\b/i,
    /\bfeel\b/i,
    /\bexactly\b/i,
    /\bsame\b/i,
    /\bremember\b/i,
  ],
  empathy: [
    /\bunderstand\b/i,
    /\bfeel\b/i,
    /\bheart\b/i,
    /\bconnect\b/i,
    /\bshare\b/i,
  ],
  belonging: [
    /\bwe\b/i,
    /\btogether\b/i,
    /\bour\b/i,
    /\bjoin\b/i,
    /\bpart of\b/i,
  ],
  urgency: [
    /\bnow\b/i,
    /\bimmediately\b/i,
    /\btoday\b/i,
    /\bcan't wait\b/i,
    /\bmust\b/i,
  ],
  momentum: [
    /\band then\b/i,
    /\bmore\b/i,
    /\bgrow\b/i,
    /\bbuild\b/i,
    /\brising\b/i,
  ],
  release: [
    /\bfinally\b/i,
    /\bat last\b/i,
    /\brelief\b/i,
    /\bfree\b/i,
    /\blet go\b/i,
  ],
  credibility: [
    /\bresearch\b/i,
    /\bdata\b/i,
    /\bevidence\b/i,
    /\bproven\b/i,
    /\bshows\b/i,
  ],
  intimacy: [
    /\bbetween us\b/i,
    /\bhonestly\b/i,
    /\btruth is\b/i,
    /\bpersonally\b/i,
    /\badmit\b/i,
  ],
  authority: [
    /\bmust\b/i,
    /\bshould\b/i,
    /\brequire\b/i,
    /\bessential\b/i,
    /\bcritical\b/i,
  ],
  revelation: [
    /\bbut\b/i,
    /\bactually\b/i,
    /\bin fact\b/i,
    /\bturns out\b/i,
    /\breally\b/i,
  ],
  delight: [
    /\bbeautiful\b/i,
    /\bwonderful\b/i,
    /\bmagic\b/i,
    /\bjoy\b/i,
    /\blove\b/i,
  ],
  provocation: [
    /\bwrong\b/i,
    /\bproblem\b/i,
    /\bchallenge\b/i,
    /\bquestion\b/i,
    /\bdare\b/i,
  ],
  contemplation: [
    /\bconsider\b/i,
    /\bthink\b/i,
    /\breflect\b/i,
    /\bpause\b/i,
    /\bponder\b/i,
  ],
  gravity: [
    /\bmatters\b/i,
    /\bimportant\b/i,
    /\bstakes\b/i,
    /\bconsequence\b/i,
    /\bweight\b/i,
  ],
  peace: [
    /\bcalm\b/i,
    /\bstill\b/i,
    /\bquiet\b/i,
    /\brest\b/i,
    /\bsettled\b/i,
  ],
  inspiration: [
    /\bimagine\b/i,
    /\bpossible\b/i,
    /\bdream\b/i,
    /\bcan\b/i,
    /\bwill\b/i,
  ],
  hope: [
    /\bhope\b/i,
    /\bbelieve\b/i,
    /\bfuture\b/i,
    /\bpromise\b/i,
    /\bpossibility\b/i,
  ],
  determination: [
    /\bwill\b/i,
    /\bmust\b/i,
    /\bgoing to\b/i,
    /\bcommit\b/i,
    /\bdecided\b/i,
  ],
};

/**
 * Analyzes text for emotional signals
 */
export function analyzeEmotionalSignals(text: string): EmotionalEffect[] {
  const detected: [EmotionalEffect, number][] = [];

  for (const [emotion, patterns] of Object.entries(EMOTION_SIGNALS)) {
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      detected.push([emotion as EmotionalEffect, matchCount]);
    }
  }

  // Sort by match count and return top emotions
  detected.sort((a, b) => b[1] - a[1]);
  return detected.slice(0, 3).map(([emotion]) => emotion);
}

/**
 * Estimates emotional intensity from text characteristics
 */
export function estimateEmotionalIntensity(text: string): EmotionalIntensity {
  let score = 0;

  // Short sentences tend to be more intense
  const words = text.split(/\s+/).length;
  if (words <= 8) score += 2;
  else if (words <= 15) score += 1;

  // Punctuation intensity
  if (/!/.test(text)) score += 2;
  if (/\?/.test(text)) score += 1;
  if (/—/.test(text)) score += 1;
  if (/\.{3}|…/.test(text)) score += 1;

  // Strong words
  if (/\b(always|never|must|everything|nothing|impossible)\b/i.test(text)) score += 2;
  if (/\b(very|extremely|absolutely|completely)\b/i.test(text)) score += 1;

  // Capitalization for emphasis
  if (/[A-Z]{2,}/.test(text)) score += 1;

  if (score >= 5) return 'intense';
  if (score >= 3) return 'strong';
  if (score >= 1) return 'moderate';
  return 'subtle';
}

/**
 * Infers emotional delivery mechanism
 */
export function inferEmotionalDelivery(text: string, family?: string): EmotionalDelivery {
  // Check for accumulation/listing
  if (/,.*,.*,/.test(text) || /and.*and/.test(text)) {
    return 'accumulated';
  }

  // Check for contrast
  if (/\bbut\b|\bhowever\b|\byet\b/i.test(text) || family === 'contrast_pair' || family === 'reversal_but') {
    return 'contrasted';
  }

  // Check for understatement
  if (/\bnot entirely\b|\bsomewhat\b|\ba bit\b|\bslightly\b/i.test(text) || family === 'understatement') {
    return 'understated';
  }

  // Check for rhythmic patterns
  if (family === 'parallel_triple' || family === 'accumulation') {
    return 'rhythmic';
  }

  // Check for release markers
  if (/\bfinally\b|\bat last\b|\brelease\b/i.test(text)) {
    return 'released';
  }

  // Check for amplification
  if (/!|[A-Z]{2,}|\b(very|extremely|absolutely)\b/i.test(text)) {
    return 'amplified';
  }

  // Default based on sentence structure
  const words = text.split(/\s+/).length;
  if (words <= 10) {
    return 'direct';
  }

  return 'implied';
}
