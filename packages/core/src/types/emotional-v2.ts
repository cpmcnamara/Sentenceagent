/**
 * Emotional Pattern Types v2 - Research-Aligned
 *
 * Aligned with established emotion science:
 * - Plutchik's Wheel (8 primary emotions + intensity levels)
 * - Russell's Circumplex (valence + arousal dimensions)
 * - GoEmotions taxonomy (27 fine-grained, validated)
 * - Appraisal theory (cognitive triggers for emotions)
 *
 * References:
 * - Plutchik, R. (1980). "A general psychoevolutionary theory of emotion"
 * - Russell, J.A. (1980). "A circumplex model of affect"
 * - Demszky et al. (2020). "GoEmotions: A Dataset of Fine-Grained Emotions"
 * - Mohammad & Turney (2013). "NRC Emotion Lexicon"
 */

// =============================================================================
// PLUTCHIK'S PRIMARY EMOTIONS (8 with intensity levels)
// =============================================================================

/**
 * Plutchik's 8 primary emotions, each with 3 intensity levels
 */
export type PlutchikEmotion =
  // Joy spectrum
  | 'ecstasy'      // High intensity joy
  | 'joy'          // Medium intensity
  | 'serenity'     // Low intensity

  // Trust spectrum
  | 'admiration'   // High intensity trust
  | 'trust'        // Medium intensity
  | 'acceptance'   // Low intensity

  // Fear spectrum
  | 'terror'       // High intensity fear
  | 'fear'         // Medium intensity
  | 'apprehension' // Low intensity

  // Surprise spectrum
  | 'amazement'    // High intensity surprise
  | 'surprise'     // Medium intensity
  | 'distraction'  // Low intensity

  // Sadness spectrum
  | 'grief'        // High intensity sadness
  | 'sadness'      // Medium intensity
  | 'pensiveness'  // Low intensity

  // Disgust spectrum
  | 'loathing'     // High intensity disgust
  | 'disgust'      // Medium intensity
  | 'boredom'      // Low intensity

  // Anger spectrum
  | 'rage'         // High intensity anger
  | 'anger'        // Medium intensity
  | 'annoyance'    // Low intensity

  // Anticipation spectrum
  | 'vigilance'    // High intensity anticipation
  | 'anticipation' // Medium intensity
  | 'interest';    // Low intensity

/**
 * Plutchik's combined/complex emotions (dyads)
 */
export type PlutchikDyad =
  | 'love'         // Joy + Trust
  | 'submission'   // Trust + Fear
  | 'awe'          // Fear + Surprise
  | 'disapproval'  // Surprise + Sadness
  | 'remorse'      // Sadness + Disgust
  | 'contempt'     // Disgust + Anger
  | 'aggressiveness' // Anger + Anticipation
  | 'optimism';    // Anticipation + Joy

// =============================================================================
// RUSSELL'S CIRCUMPLEX (Dimensional Model)
// =============================================================================

/**
 * Two-dimensional emotion representation
 * More nuanced than categorical models
 */
export interface CircumplexPosition {
  /**
   * Valence: How positive or negative
   * -1 (very negative) to +1 (very positive)
   */
  valence: number;

  /**
   * Arousal: How activated or calm
   * -1 (very calm/deactivated) to +1 (very excited/activated)
   */
  arousal: number;
}

/**
 * Common circumplex quadrants
 */
export type CircumplexQuadrant =
  | 'high_arousal_positive'   // Excited, elated, happy
  | 'low_arousal_positive'    // Calm, relaxed, serene
  | 'high_arousal_negative'   // Tense, nervous, stressed
  | 'low_arousal_negative';   // Sad, depressed, bored

export function getCircumplexQuadrant(pos: CircumplexPosition): CircumplexQuadrant {
  if (pos.valence >= 0 && pos.arousal >= 0) return 'high_arousal_positive';
  if (pos.valence >= 0 && pos.arousal < 0) return 'low_arousal_positive';
  if (pos.valence < 0 && pos.arousal >= 0) return 'high_arousal_negative';
  return 'low_arousal_negative';
}

// =============================================================================
// GOEMOTIONS TAXONOMY (Google Research, 2020)
// =============================================================================

/**
 * GoEmotions: 27 emotion categories + neutral
 * Validated on 58K Reddit comments with high inter-annotator agreement
 * Reference: https://github.com/google-research/google-research/tree/master/goemotions
 */
export type GoEmotion =
  // Positive emotions
  | 'admiration'
  | 'amusement'
  | 'approval'
  | 'caring'
  | 'desire'
  | 'excitement'
  | 'gratitude'
  | 'joy'
  | 'love'
  | 'optimism'
  | 'pride'
  | 'relief'

  // Negative emotions
  | 'anger'
  | 'annoyance'
  | 'disappointment'
  | 'disapproval'
  | 'disgust'
  | 'embarrassment'
  | 'fear'
  | 'grief'
  | 'nervousness'
  | 'remorse'
  | 'sadness'

  // Ambiguous emotions
  | 'confusion'
  | 'curiosity'
  | 'realization'
  | 'surprise'

  // Neutral
  | 'neutral';

/**
 * GoEmotions grouped by sentiment
 */
export const GOEMOTIONS_BY_SENTIMENT = {
  positive: [
    'admiration', 'amusement', 'approval', 'caring', 'desire',
    'excitement', 'gratitude', 'joy', 'love', 'optimism', 'pride', 'relief'
  ] as GoEmotion[],
  negative: [
    'anger', 'annoyance', 'disappointment', 'disapproval', 'disgust',
    'embarrassment', 'fear', 'grief', 'nervousness', 'remorse', 'sadness'
  ] as GoEmotion[],
  ambiguous: [
    'confusion', 'curiosity', 'realization', 'surprise'
  ] as GoEmotion[],
  neutral: ['neutral'] as GoEmotion[],
};

// =============================================================================
// APPRAISAL THEORY (Cognitive Triggers)
// =============================================================================

/**
 * Appraisal dimensions that trigger emotions
 * Based on Scherer's Component Process Model
 */
export interface AppraisalDimensions {
  /**
   * Novelty: Is this new/unexpected?
   */
  novelty: 'expected' | 'unexpected' | 'highly_unexpected';

  /**
   * Intrinsic pleasantness: Is this inherently pleasant/unpleasant?
   */
  pleasantness: 'pleasant' | 'neutral' | 'unpleasant';

  /**
   * Goal relevance: Does this affect my goals?
   */
  goalRelevance: 'irrelevant' | 'relevant' | 'highly_relevant';

  /**
   * Goal conduciveness: Does this help or hinder my goals?
   */
  goalConduciveness: 'obstructive' | 'neutral' | 'conducive';

  /**
   * Coping potential: Can I deal with this?
   */
  copingPotential: 'low' | 'medium' | 'high';

  /**
   * Agency: Who caused this?
   */
  agency: 'self' | 'other' | 'circumstances';
}

// =============================================================================
// WRITING-SPECIFIC EMOTIONAL EFFECTS
// =============================================================================

/**
 * Rhetorical emotional effects (writing-specific)
 * These map TO validated emotions but describe the writer's INTENT
 */
export type RhetoricalEmotionalIntent =
  // Engagement intents (map to: curiosity, interest, anticipation)
  | 'create_curiosity'
  | 'build_anticipation'
  | 'hook_attention'

  // Conviction intents (map to: trust, admiration, approval)
  | 'establish_credibility'
  | 'create_certainty'
  | 'build_trust'

  // Connection intents (map to: love, caring, gratitude)
  | 'foster_recognition'    // "That's exactly how I feel"
  | 'create_belonging'
  | 'evoke_empathy'

  // Energy intents (map to: excitement, fear, anger)
  | 'create_urgency'
  | 'build_momentum'
  | 'provide_release'

  // Insight intents (map to: surprise, realization, amusement)
  | 'deliver_revelation'
  | 'create_delight'
  | 'provoke_thought'

  // Reflective intents (map to: sadness, relief, serenity)
  | 'induce_contemplation'
  | 'create_gravity'
  | 'bring_peace';

/**
 * Maps rhetorical intent to validated GoEmotions
 */
export const INTENT_TO_EMOTION_MAP: Record<RhetoricalEmotionalIntent, GoEmotion[]> = {
  create_curiosity: ['curiosity', 'excitement'],
  build_anticipation: ['excitement', 'desire'],
  hook_attention: ['curiosity', 'surprise'],
  establish_credibility: ['admiration', 'approval'],
  create_certainty: ['approval', 'relief'],
  build_trust: ['admiration', 'caring'],
  foster_recognition: ['joy', 'relief'],
  create_belonging: ['love', 'caring'],
  evoke_empathy: ['caring', 'sadness'],
  create_urgency: ['fear', 'nervousness', 'excitement'],
  build_momentum: ['excitement', 'anticipation' as GoEmotion],
  provide_release: ['relief', 'joy'],
  deliver_revelation: ['surprise', 'realization'],
  create_delight: ['amusement', 'joy'],
  provoke_thought: ['confusion', 'curiosity', 'realization'],
  induce_contemplation: ['sadness', 'curiosity'],
  create_gravity: ['fear', 'nervousness'],
  bring_peace: ['relief', 'gratitude'],
};

// =============================================================================
// COMPREHENSIVE EMOTIONAL PROFILE (v2)
// =============================================================================

export interface EmotionalProfileV2 {
  /**
   * Primary emotion using GoEmotions taxonomy (validated)
   */
  primaryEmotion: GoEmotion;

  /**
   * Secondary emotions (up to 3)
   */
  secondaryEmotions: GoEmotion[];

  /**
   * Circumplex position (dimensional representation)
   */
  circumplex: CircumplexPosition;

  /**
   * Plutchik mapping (for intensity)
   */
  plutchikMapping?: PlutchikEmotion;

  /**
   * Rhetorical intent (what the writer is trying to do)
   */
  rhetoricalIntent: RhetoricalEmotionalIntent;

  /**
   * Confidence score (0-1) based on signal strength
   */
  confidence: number;

  /**
   * Appraisal dimensions that trigger this emotion
   */
  appraisalTriggers?: Partial<AppraisalDimensions>;
}

// =============================================================================
// NRC EMOTION LEXICON INTEGRATION
// =============================================================================

/**
 * NRC Emotion Lexicon word-emotion associations
 * Subset of high-confidence associations for key words
 * Full lexicon: https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm
 */
export const NRC_EMOTION_WORDS: Record<GoEmotion, string[]> = {
  // Positive
  admiration: ['admire', 'respect', 'esteem', 'honor', 'revere', 'appreciate'],
  amusement: ['funny', 'hilarious', 'amusing', 'entertaining', 'witty', 'humorous'],
  approval: ['approve', 'endorse', 'support', 'agree', 'accept', 'validate'],
  caring: ['care', 'compassion', 'kindness', 'gentle', 'nurture', 'protect'],
  desire: ['want', 'crave', 'long', 'yearn', 'aspire', 'wish'],
  excitement: ['excited', 'thrilling', 'exhilarating', 'electrifying', 'energizing'],
  gratitude: ['grateful', 'thankful', 'appreciative', 'indebted', 'blessed'],
  joy: ['happy', 'joyful', 'delighted', 'pleased', 'elated', 'cheerful'],
  love: ['love', 'adore', 'cherish', 'devoted', 'affection', 'beloved'],
  optimism: ['hopeful', 'optimistic', 'confident', 'positive', 'encouraging'],
  pride: ['proud', 'accomplished', 'triumphant', 'successful', 'achieved'],
  relief: ['relieved', 'released', 'freed', 'unburdened', 'relaxed'],

  // Negative
  anger: ['angry', 'furious', 'outraged', 'enraged', 'livid', 'irate'],
  annoyance: ['annoyed', 'irritated', 'frustrated', 'bothered', 'aggravated'],
  disappointment: ['disappointed', 'letdown', 'dismayed', 'disheartened'],
  disapproval: ['disapprove', 'reject', 'criticize', 'condemn', 'denounce'],
  disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled'],
  embarrassment: ['embarrassed', 'ashamed', 'humiliated', 'mortified'],
  fear: ['afraid', 'scared', 'terrified', 'frightened', 'alarmed', 'panicked'],
  grief: ['grief', 'mourning', 'bereaved', 'devastated', 'heartbroken'],
  nervousness: ['nervous', 'anxious', 'worried', 'uneasy', 'tense', 'stressed'],
  remorse: ['sorry', 'regret', 'guilty', 'apologetic', 'repentant'],
  sadness: ['sad', 'unhappy', 'sorrowful', 'melancholy', 'gloomy', 'depressed'],

  // Ambiguous
  confusion: ['confused', 'puzzled', 'perplexed', 'bewildered', 'baffled'],
  curiosity: ['curious', 'intrigued', 'interested', 'wondering', 'inquisitive'],
  realization: ['realize', 'understand', 'discover', 'recognize', 'insight'],
  surprise: ['surprised', 'astonished', 'amazed', 'shocked', 'startled'],

  // Neutral
  neutral: [],
};

// =============================================================================
// EMOTION DETECTION (Research-Aligned)
// =============================================================================

/**
 * Detect emotions using NRC lexicon + pattern matching
 */
export function detectEmotionsV2(text: string): {
  emotions: GoEmotion[];
  circumplex: CircumplexPosition;
  confidence: number;
} {
  const lowerText = text.toLowerCase();
  const emotionScores: Record<GoEmotion, number> = {} as Record<GoEmotion, number>;

  // Initialize scores
  for (const emotion of Object.keys(NRC_EMOTION_WORDS) as GoEmotion[]) {
    emotionScores[emotion] = 0;
  }

  // Score based on NRC lexicon matches
  for (const [emotion, words] of Object.entries(NRC_EMOTION_WORDS) as [GoEmotion, string[]][]) {
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        emotionScores[emotion] += matches.length;
      }
    }
  }

  // Get top emotions
  const sortedEmotions = (Object.entries(emotionScores) as [GoEmotion, number][])
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion]) => emotion);

  // Calculate circumplex position
  let valenceSum = 0;
  let arousalSum = 0;
  let count = 0;

  const emotionCircumplex: Record<string, CircumplexPosition> = {
    // High arousal positive
    excitement: { valence: 0.8, arousal: 0.8 },
    joy: { valence: 0.8, arousal: 0.5 },
    amusement: { valence: 0.6, arousal: 0.4 },
    // Low arousal positive
    relief: { valence: 0.5, arousal: -0.3 },
    gratitude: { valence: 0.7, arousal: -0.2 },
    love: { valence: 0.9, arousal: 0.2 },
    // High arousal negative
    anger: { valence: -0.7, arousal: 0.8 },
    fear: { valence: -0.8, arousal: 0.7 },
    nervousness: { valence: -0.5, arousal: 0.6 },
    // Low arousal negative
    sadness: { valence: -0.7, arousal: -0.4 },
    disappointment: { valence: -0.5, arousal: -0.2 },
    boredom: { valence: -0.3, arousal: -0.6 },
    // Ambiguous
    curiosity: { valence: 0.3, arousal: 0.4 },
    surprise: { valence: 0.1, arousal: 0.7 },
    confusion: { valence: -0.2, arousal: 0.3 },
  };

  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > 0 && emotionCircumplex[emotion]) {
      valenceSum += emotionCircumplex[emotion].valence * score;
      arousalSum += emotionCircumplex[emotion].arousal * score;
      count += score;
    }
  }

  const circumplex: CircumplexPosition = count > 0
    ? { valence: valenceSum / count, arousal: arousalSum / count }
    : { valence: 0, arousal: 0 };

  // Calculate confidence based on signal strength
  const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
  const wordCount = text.split(/\s+/).length;
  const confidence = Math.min(1, totalScore / (wordCount * 0.1));

  return {
    emotions: sortedEmotions.length > 0 ? sortedEmotions : ['neutral'],
    circumplex,
    confidence,
  };
}

// =============================================================================
// ANNOTATION GUIDELINES (Best Practice)
// =============================================================================

/**
 * Annotation guidelines for emotional labeling
 * Following best practices for data labeling consistency
 */
export const ANNOTATION_GUIDELINES = {
  general: [
    'Label based on the LIKELY emotional response in the READER, not the writer',
    'Consider the full context, not just individual words',
    'Multiple emotions can co-occur - label all that apply',
    'When uncertain between two emotions, prefer the more general one',
    'Neutral should only be used when no emotional content is present',
  ],

  byEmotion: {
    curiosity: 'Use when text creates a desire to know more, poses questions, or hints at unrevealed information',
    surprise: 'Use when text contains unexpected information or reversals',
    joy: 'Use when text describes positive outcomes, successes, or pleasant experiences',
    fear: 'Use when text describes threats, risks, or potential negative outcomes',
    anger: 'Use when text describes injustice, obstruction, or blame',
    sadness: 'Use when text describes loss, failure, or disappointment',
    trust: 'Use when text establishes credibility, reliability, or safety',
    anticipation: 'Use when text builds toward something, creates expectation',
  },

  intensityGuidelines: {
    low: 'Subtle emotional coloring, easily overlooked',
    medium: 'Clear emotional content, noticeable on first read',
    high: 'Strong emotional content, dominant feeling',
    intense: 'Overwhelming emotional content, hard to ignore',
  },
};

// =============================================================================
// INTER-ANNOTATOR AGREEMENT (IAA) UTILITIES
// =============================================================================

/**
 * Calculate Cohen's Kappa for inter-annotator agreement
 */
export function calculateCohensKappa(
  annotations1: GoEmotion[],
  annotations2: GoEmotion[]
): number {
  if (annotations1.length !== annotations2.length) {
    throw new Error('Annotation arrays must be same length');
  }

  const n = annotations1.length;
  const categories = [...new Set([...annotations1, ...annotations2])];

  // Calculate observed agreement
  let agreements = 0;
  for (let i = 0; i < n; i++) {
    if (annotations1[i] === annotations2[i]) agreements++;
  }
  const po = agreements / n;

  // Calculate expected agreement
  let pe = 0;
  for (const category of categories) {
    const p1 = annotations1.filter(a => a === category).length / n;
    const p2 = annotations2.filter(a => a === category).length / n;
    pe += p1 * p2;
  }

  // Kappa
  return (po - pe) / (1 - pe);
}

/**
 * Interpret Kappa score
 */
export function interpretKappa(kappa: number): string {
  if (kappa < 0) return 'Poor (less than chance)';
  if (kappa < 0.2) return 'Slight agreement';
  if (kappa < 0.4) return 'Fair agreement';
  if (kappa < 0.6) return 'Moderate agreement';
  if (kappa < 0.8) return 'Substantial agreement';
  return 'Almost perfect agreement';
}
