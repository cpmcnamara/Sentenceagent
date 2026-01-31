/**
 * Candidate Scoring Pipeline
 *
 * Scores pattern candidates based on:
 * - Intent match (how well it fits requested intent/role)
 * - Novelty (difference from existing library)
 * - Preference match (alignment with user preferences)
 * - Reusability (how broadly applicable)
 * - Anti-cliché (avoidance of overused patterns)
 * - Rhythm quality (strength of rhythmic characteristics)
 */

import {
  Candidate,
  CandidateScore,
  MiningQuery,
  UserPreferences,
  PatternUnit,
  RejectedPattern,
  SentenceFamily,
  ParagraphRole,
  IntentTag,
  CadenceArchetype,
  RhythmProfile,
} from '../types/index.js';

import {
  analyzeRhythm,
  analyzeCadenceContour,
  detectPatternType,
} from '../analysis/rhythm.js';

// =============================================================================
// CLICHÉ DETECTION
// =============================================================================

const CLICHE_PHRASES = [
  'at the end of the day',
  'think outside the box',
  'it is what it is',
  'low-hanging fruit',
  'move the needle',
  'synergy',
  'paradigm shift',
  'game changer',
  'deep dive',
  'circle back',
  'touch base',
  'leverage',
  'unpack',
  'drill down',
  'take this offline',
  'boots on the ground',
  'skin in the game',
  'value proposition',
  'core competency',
  'best practice',
  'thought leader',
  'disrupt',
  'pivot',
  'scale',
  'iterate',
  'optimize',
  'empower',
  'incentivize',
  'utilize',
  'impactful',
  'actionable',
  'learnings',
  'deliverables',
  'bandwidth',
  'granular',
  'holistic',
  'robust',
  'seamless',
  'innovative',
  'cutting-edge',
  'next-level',
  'world-class',
];

const AI_TELLS = [
  "let's explore",
  "let's dive into",
  "let's unpack",
  "it's important to note",
  "it's worth mentioning",
  "interestingly,",
  "importantly,",
  "notably,",
  "in conclusion,",
  "to summarize,",
  "first and foremost",
  "last but not least",
  "at its core",
  "in essence",
  "ultimately,",
  "the reality is",
  "the truth is",
  "here's the thing:",
  "here's the deal:",
  "delve",
  "multifaceted",
  "navigate",
  "landscape",
  "realm",
  "tapestry",
  "intricacies",
  "nuances",
  "myriad",
  "plethora",
  "leverage",
  "foster",
  "facilitate",
  "endeavor",
  "underscore",
  "bolster",
  "testament",
];

export function detectCliches(text: string): string[] {
  const lowerText = text.toLowerCase();
  return CLICHE_PHRASES.filter(cliche => lowerText.includes(cliche));
}

export function detectAITells(text: string): string[] {
  const lowerText = text.toLowerCase();
  return AI_TELLS.filter(tell => lowerText.includes(tell.toLowerCase()));
}

// =============================================================================
// PATTERN FAMILY DETECTION
// =============================================================================

const FAMILY_PATTERNS: Record<SentenceFamily, RegExp[]> = {
  negation_pivot: [
    /\bisn't\b.*—/i,
    /\bnot\b.*—/i,
    /\bdoesn't\b.*—/i,
    /\bwon't\b.*—/i,
    /\bnot about\b/i,
  ],
  colon_reveal: [
    /[^:]+:\s+[A-Z]/,
    /here's\s+(what|the|why)/i,
  ],
  em_dash_insert: [
    /—[^—]+—/,
    /--[^-]+--/,
  ],
  question_answer: [
    /\?\s+[A-Z]/,
    /\?\s+(Yes|No|Because|It|That|This)/,
  ],
  list_resolve: [
    /,\s+\w+,\s+and\s+\w+[.:]/,
    /:\s*\w+,\s*\w+,\s*(and\s+)?\w+/,
  ],
  contrast_pair: [
    /;\s+\w+\s+/,
    /\bwhile\b.*\b(but|however)\b/i,
    /\bwhereas\b/i,
  ],
  conditional_snap: [
    /^if\b/i,
    /^when\b/i,
    /^once\b/i,
    /^unless\b/i,
  ],
  definition_is: [
    /^\w+\s+is\s+/i,
    /\bmeans\s+/i,
    /\brepresents\s+/i,
  ],
  analogy_bridge: [
    /\blike\s+a?\s*\w+/i,
    /\bas\s+if\b/i,
    /\bimagine\b/i,
    /\bthink\s+of\b/i,
  ],
  parallel_triple: [
    /\.\s+\w+\.\s+\w+\./,
  ],
  reversal_but: [
    /,\s*but\s+/i,
    /,\s*yet\s+/i,
    /,\s*however\s*,?/i,
  ],
  accumulation: [
    /,\s*\w+,\s*\w+,\s*\w+,/,
    /and\s+\w+\s+and\s+\w+/i,
  ],
  understatement: [
    /\bnot\s+entirely\b/i,
    /\bsomewhat\b/i,
    /\ba\s+bit\b/i,
    /\bslightly\b/i,
  ],
  direct_command: [
    /^[A-Z][a-z]+\s+it\./,
    /^[A-Z][a-z]+\s+\w+\./,
  ],
  fragment_punch: [
    /\.\s+[A-Z][a-z]+\.$/,
    /\.\s+(Nothing|Everything|Always|Never)\./,
  ],
  extended_qualifier: [
    /\balthough\b.*,\s*\w+/i,
    /\bwhile\b.*,.*,/i,
    /\bdespite\b.*,/i,
  ],
};

export function detectFamily(text: string): SentenceFamily | null {
  for (const [family, patterns] of Object.entries(FAMILY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return family as SentenceFamily;
      }
    }
  }
  return null;
}

// =============================================================================
// INTENT DETECTION
// =============================================================================

const INTENT_SIGNALS: Record<IntentTag, (text: string, rhythm: RhythmProfile) => number> = {
  hook: (text, rhythm) => {
    let score = 0;
    if (rhythm.wordCount <= 15) score += 0.2;
    if (/\?/.test(text)) score += 0.2;
    if (/^(What|Why|How|When|Where|Who)\b/i.test(text)) score += 0.2;
    if (/\b(suddenly|unexpected|surprising)\b/i.test(text)) score += 0.2;
    if (rhythm.punctuationProfile.emDashes > 0) score += 0.1;
    return Math.min(1, score);
  },
  frame: (text, rhythm) => {
    let score = 0;
    if (/\b(the real|what we're|think of|consider)\b/i.test(text)) score += 0.3;
    if (/\b(question is|point is|key is)\b/i.test(text)) score += 0.3;
    if (rhythm.wordCount > 10 && rhythm.wordCount < 25) score += 0.2;
    return Math.min(1, score);
  },
  reframe: (text, rhythm) => {
    let score = 0;
    if (/\b(actually|isn't|not about|but what if)\b/i.test(text)) score += 0.3;
    if (/\bisn't\s+\w+[—,]/i.test(text)) score += 0.3;
    if (rhythm.punctuationProfile.emDashes > 0) score += 0.2;
    return Math.min(1, score);
  },
  crystallization: (text, rhythm) => {
    let score = 0;
    if (/\b(is|means|equals)\b/i.test(text)) score += 0.2;
    if (rhythm.wordCount <= 12) score += 0.3;
    if (rhythm.punctuationProfile.periods === 1) score += 0.2;
    if (/^[A-Z][a-z]+\s+is\s+/i.test(text)) score += 0.3;
    return Math.min(1, score);
  },
  pivot: (text, rhythm) => {
    let score = 0;
    if (/\b(but|however|yet|still)\b/i.test(text)) score += 0.3;
    if (/^(But|However|Yet|Still)\b/.test(text)) score += 0.2;
    if (rhythm.punctuationProfile.emDashes > 0) score += 0.2;
    return Math.min(1, score);
  },
  reversal: (text, rhythm) => {
    let score = 0;
    if (/\b(actually|in fact|the opposite|contrary)\b/i.test(text)) score += 0.3;
    if (/\bnot\s+\w+\s*[,—]\s*but\b/i.test(text)) score += 0.3;
    if (rhythm.punctuationProfile.emDashes > 0) score += 0.2;
    return Math.min(1, score);
  },
  concede_counterpunch: (text, rhythm) => {
    let score = 0;
    if (/\b(yes,?\s*but|granted,?\s*but|true,?\s*but)\b/i.test(text)) score += 0.4;
    if (/\b(while|although).*,\s*(but|however)\b/i.test(text)) score += 0.3;
    return Math.min(1, score);
  },
  build_momentum: (text, rhythm) => {
    let score = 0;
    if (/\b(and then|even more|beyond that|furthermore)\b/i.test(text)) score += 0.3;
    if (rhythm.clauseCount >= 3) score += 0.2;
    if (rhythm.wordCount > 20) score += 0.2;
    return Math.min(1, score);
  },
  slow_down: (text, rhythm) => {
    let score = 0;
    if (/\b(pause|consider|notice|wait)\b/i.test(text)) score += 0.3;
    if (/\b(let's|let us)\b/i.test(text)) score += 0.2;
    if (rhythm.punctuationProfile.ellipses > 0) score += 0.2;
    return Math.min(1, score);
  },
  summarize: (text, rhythm) => {
    let score = 0;
    if (/\b(in short|the point|to summarize|in sum)\b/i.test(text)) score += 0.4;
    if (/\b(simply|essentially)\b/i.test(text)) score += 0.2;
    return Math.min(1, score);
  },
  foreshadow: (text, rhythm) => {
    let score = 0;
    if (/\b(soon|as we'll see|but first|later)\b/i.test(text)) score += 0.4;
    if (/\b(will|would|going to)\b/i.test(text)) score += 0.2;
    return Math.min(1, score);
  },
  callback: (text, rhythm) => {
    let score = 0;
    if (/\b(remember|as (we|I) said|back to|earlier)\b/i.test(text)) score += 0.4;
    if (/\b(again|once more)\b/i.test(text)) score += 0.2;
    return Math.min(1, score);
  },
};

export function detectIntents(text: string, rhythm: RhythmProfile): IntentTag[] {
  const scores: [IntentTag, number][] = [];

  for (const [intent, scorer] of Object.entries(INTENT_SIGNALS)) {
    const score = scorer(text, rhythm);
    if (score > 0.3) {
      scores.push([intent as IntentTag, score]);
    }
  }

  // Sort by score and return top intents
  scores.sort((a, b) => b[1] - a[1]);
  return scores.slice(0, 3).map(([intent]) => intent);
}

// =============================================================================
// ROLE DETECTION
// =============================================================================

const ROLE_SIGNALS: Record<ParagraphRole, (text: string, rhythm: RhythmProfile) => number> = {
  opening: (text, rhythm) => {
    let score = 0;
    if (rhythm.wordCount <= 15) score += 0.3;
    if (/\?/.test(text)) score += 0.2;
    if (/^(In|When|The|A|It|There)\b/.test(text)) score += 0.1;
    return Math.min(1, score);
  },
  hook: (text, rhythm) => INTENT_SIGNALS.hook(text, rhythm),
  frame: (text, rhythm) => INTENT_SIGNALS.frame(text, rhythm),
  argument: (text, rhythm) => {
    let score = 0;
    if (/\b(because|therefore|thus|so)\b/i.test(text)) score += 0.3;
    if (rhythm.clauseCount >= 2) score += 0.2;
    if (rhythm.wordCount > 15) score += 0.2;
    return Math.min(1, score);
  },
  evidence: (text, rhythm) => {
    let score = 0;
    if (/\b(study|research|data|percent|statistics)\b/i.test(text)) score += 0.4;
    if (/\b(for example|such as|including)\b/i.test(text)) score += 0.3;
    return Math.min(1, score);
  },
  pivot: (text, rhythm) => INTENT_SIGNALS.pivot(text, rhythm),
  transition: (text, rhythm) => {
    let score = 0;
    if (/^(Now|Next|Then|Moving|Turning)\b/.test(text)) score += 0.4;
    if (/\b(meanwhile|furthermore|additionally)\b/i.test(text)) score += 0.3;
    return Math.min(1, score);
  },
  concession: (text, rhythm) => {
    let score = 0;
    if (/\b(granted|admittedly|true|fair)\b/i.test(text)) score += 0.4;
    if (/\b(some might|critics|opponents)\b/i.test(text)) score += 0.3;
    return Math.min(1, score);
  },
  counterpunch: (text, rhythm) => {
    let score = 0;
    if (/^(But|However|Yet|Still)\b/.test(text)) score += 0.4;
    if (/\b(but|however).*\b(actually|really|in fact)\b/i.test(text)) score += 0.3;
    return Math.min(1, score);
  },
  definition: (text, rhythm) => {
    let score = 0;
    if (/^\w+\s+(is|means|represents)\s+/i.test(text)) score += 0.4;
    if (rhythm.wordCount <= 12) score += 0.2;
    return Math.min(1, score);
  },
  elaboration: (text, rhythm) => {
    let score = 0;
    if (/\b(specifically|in particular|namely)\b/i.test(text)) score += 0.3;
    if (rhythm.wordCount > 20) score += 0.2;
    return Math.min(1, score);
  },
  close: (text, rhythm) => {
    let score = 0;
    if (/\b(ultimately|finally|in the end)\b/i.test(text)) score += 0.3;
    if (rhythm.wordCount <= 15) score += 0.2;
    if (rhythm.punctuationProfile.periods === 1) score += 0.1;
    return Math.min(1, score);
  },
};

export function detectRoles(text: string, rhythm: RhythmProfile): ParagraphRole[] {
  const scores: [ParagraphRole, number][] = [];

  for (const [role, scorer] of Object.entries(ROLE_SIGNALS)) {
    const score = scorer(text, rhythm);
    if (score > 0.25) {
      scores.push([role as ParagraphRole, score]);
    }
  }

  scores.sort((a, b) => b[1] - a[1]);
  return scores.slice(0, 3).map(([role]) => role);
}

// =============================================================================
// TEMPLATE EXTRACTION
// =============================================================================

export function extractTemplate(text: string): string {
  let template = text
    // Replace proper nouns with [Name]
    .replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, (match) => {
      // Keep common words that are capitalized at start
      if (/^(The|A|An|This|That|It|We|I|You|They|He|She|But|And|Or|So|Yet|If|When|Where|How|Why|What|Who)\b/.test(match)) {
        return match;
      }
      return '[Name]';
    })
    // Replace numbers with [N]
    .replace(/\b\d+(\.\d+)?(%|st|nd|rd|th)?\b/g, '[N]')
    // Replace quoted text with [Quote]
    .replace(/"[^"]+"/g, '"[Quote]"')
    .replace(/'[^']+'/g, "'[Quote]'")
    // Replace long noun phrases with [X]
    .replace(/\b(the|a|an)\s+([a-z]+\s+){2,}[a-z]+\b/gi, '[X]');

  return template;
}

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

export function scoreIntentMatch(
  candidate: Partial<Candidate>,
  query: MiningQuery
): number {
  if (!query.intent && !query.role && !query.cadence) {
    return 0.5; // No query constraints, neutral score
  }

  let score = 0;
  let weights = 0;

  // Intent match
  if (query.intent && candidate.predictedIntents) {
    weights += 1;
    if (candidate.predictedIntents.includes(query.intent)) {
      score += 1;
    } else {
      // Partial credit for related intents
      const relatedIntents: Record<IntentTag, IntentTag[]> = {
        hook: ['frame', 'reframe'],
        frame: ['hook', 'crystallization'],
        reframe: ['pivot', 'reversal', 'hook'],
        crystallization: ['frame', 'summarize'],
        pivot: ['reversal', 'reframe'],
        reversal: ['pivot', 'reframe'],
        concede_counterpunch: ['pivot', 'reversal'],
        build_momentum: ['foreshadow'],
        slow_down: ['summarize'],
        summarize: ['crystallization', 'slow_down'],
        foreshadow: ['build_momentum', 'hook'],
        callback: ['summarize'],
      };
      const related = relatedIntents[query.intent] || [];
      const hasRelated = candidate.predictedIntents.some(i => related.includes(i));
      if (hasRelated) score += 0.5;
    }
  }

  // Role match
  if (query.role && candidate.predictedRoles) {
    weights += 1;
    if (candidate.predictedRoles.includes(query.role)) {
      score += 1;
    }
  }

  // Cadence match
  if (query.cadence && candidate.predictedCadence) {
    weights += 1;
    if (candidate.predictedCadence === query.cadence) {
      score += 1;
    }
  }

  // Audience match
  if (query.audience && candidate.predictedAudience) {
    weights += 0.5;
    if (candidate.predictedAudience.includes(query.audience)) {
      score += 0.5;
    }
  }

  return weights > 0 ? score / weights : 0.5;
}

export function scoreNovelty(
  candidate: Partial<Candidate>,
  existingPatterns: PatternUnit[],
  recentFingerprints: string[]
): number {
  if (existingPatterns.length === 0 && recentFingerprints.length === 0) {
    return 1; // Everything is novel when library is empty
  }

  const candidateTemplate = candidate.template || '';

  // Check against recent fingerprints (high penalty for recent similarity)
  for (const fp of recentFingerprints) {
    if (candidateTemplate === fp) {
      return 0.1; // Very low score for duplicate
    }
    if (similarity(candidateTemplate, fp) > 0.8) {
      return 0.3; // Low score for very similar
    }
  }

  // Check against existing patterns
  let maxSimilarity = 0;
  for (const pattern of existingPatterns) {
    const sim = similarity(candidateTemplate, pattern.template);
    maxSimilarity = Math.max(maxSimilarity, sim);
  }

  // Convert similarity to novelty score
  if (maxSimilarity > 0.9) return 0.2;
  if (maxSimilarity > 0.7) return 0.4;
  if (maxSimilarity > 0.5) return 0.6;
  if (maxSimilarity > 0.3) return 0.8;
  return 1;
}

export function scorePreferenceMatch(
  candidate: Partial<Candidate>,
  preferences: UserPreferences
): number {
  let score = 0;
  let weights = 0;

  const rhythm = candidate.rhythmProfile;
  if (!rhythm) return 0.5;

  // Sentence length preference
  const [minLen, maxLen] = preferences.preferredSentenceLengthRange;
  const avgLen = rhythm.avgWordsPerSentence;
  weights += 1;
  if (avgLen >= minLen && avgLen <= maxLen) {
    score += 1;
  } else {
    const distance = avgLen < minLen ? minLen - avgLen : avgLen - maxLen;
    score += Math.max(0, 1 - distance / 10);
  }

  // Cadence preference
  if (candidate.predictedCadence) {
    weights += 0.5;
    if (preferences.preferredCadenceArchetypes.includes(candidate.predictedCadence)) {
      score += 0.5;
    } else if (preferences.dislikedCadenceArchetypes.includes(candidate.predictedCadence)) {
      score -= 0.25;
    } else {
      score += 0.25; // Neutral
    }
  }

  // Family preference
  if (candidate.predictedFamily) {
    weights += 0.5;
    if (preferences.favoredFamilies.includes(candidate.predictedFamily)) {
      score += 0.5;
    } else if (preferences.dislikedFamilies.includes(candidate.predictedFamily)) {
      score -= 0.25;
    } else {
      score += 0.25;
    }
  }

  // Banned phrases check
  const text = (candidate.text || '').toLowerCase();
  for (const phrase of preferences.bannedPhrases) {
    if (text.includes(phrase.toLowerCase())) {
      score -= 0.5;
    }
  }

  // AI tells check
  for (const tell of preferences.dislikedTells) {
    if (text.includes(tell.toLowerCase())) {
      score -= 0.3;
    }
  }

  return Math.max(0, Math.min(1, weights > 0 ? score / weights : 0.5));
}

export function scoreReusability(
  candidate: Partial<Candidate>
): number {
  const template = candidate.template || '';
  const text = candidate.text || '';

  let score = 0.5;

  // More placeholders = more reusable
  const placeholderCount = (template.match(/\[[^\]]+\]/g) || []).length;
  score += Math.min(0.3, placeholderCount * 0.1);

  // Shorter templates are often more reusable
  const wordCount = text.split(/\s+/).length;
  if (wordCount <= 15) score += 0.2;
  else if (wordCount <= 25) score += 0.1;

  // Generic structural patterns are more reusable
  if (/\b(is|are|was|were)\b/i.test(text)) score += 0.1;
  if (/[—:;]/.test(text)) score += 0.1;

  return Math.min(1, score);
}

export function scoreAntiCliche(
  candidate: Partial<Candidate>,
  rejectedPatterns: RejectedPattern[],
  preferences: UserPreferences
): number {
  const text = (candidate.text || '').toLowerCase();

  let score = 1;

  // Penalize clichés
  const cliches = detectCliches(text);
  score -= cliches.length * 0.2;

  // Penalize AI tells
  const tells = detectAITells(text);
  score -= tells.length * 0.15;

  // Penalize similarity to rejected patterns
  const template = candidate.template || '';
  for (const rejected of rejectedPatterns.slice(-50)) { // Check last 50
    if (similarity(template, rejected.template) > 0.7) {
      score -= 0.3;
      break;
    }
  }

  // Extra penalty for top-disliked failure modes
  // (This would require analyzing the candidate for failure modes)

  return Math.max(0, score);
}

export function scoreRhythmQuality(
  candidate: Partial<Candidate>
): number {
  const rhythm = candidate.rhythmProfile;
  const cadence = candidate.cadenceContour;

  if (!rhythm) return 0.5;

  let score = 0.5;

  // Clear punctuation structure is good
  const punct = rhythm.punctuationProfile;
  if (punct.emDashes > 0) score += 0.1;
  if (punct.colons > 0) score += 0.1;
  if (punct.semicolons > 0) score += 0.05;

  // Variety in clause structure
  if (rhythm.clauseCount >= 2 && rhythm.clauseCount <= 4) {
    score += 0.15;
  }

  // For CPU patterns, high cadence confidence is good
  if (cadence && cadence.archetypeConfidence > 0.7) {
    score += 0.2;
  }

  // Penalize very long sentences
  if (rhythm.avgWordsPerSentence > 35) {
    score -= 0.2;
  }

  return Math.min(1, Math.max(0, score));
}

// =============================================================================
// MAIN SCORING PIPELINE
// =============================================================================

export interface ScoringContext {
  query: MiningQuery;
  preferences: UserPreferences;
  existingPatterns: PatternUnit[];
  rejectedPatterns: RejectedPattern[];
  recentFingerprints: string[];
}

export function scoreCandidate(
  candidate: Partial<Candidate>,
  context: ScoringContext
): CandidateScore {
  const weights = context.preferences.scoringWeights;

  const intentMatch = scoreIntentMatch(candidate, context.query);
  const novelty = scoreNovelty(candidate, context.existingPatterns, context.recentFingerprints);
  const preferenceMatch = scorePreferenceMatch(candidate, context.preferences);
  const reusability = scoreReusability(candidate);
  const antiCliche = scoreAntiCliche(candidate, context.rejectedPatterns, context.preferences);
  const rhythmQuality = scoreRhythmQuality(candidate);

  const total =
    intentMatch * (weights?.intentMatch || 0.25) +
    novelty * (weights?.novelty || 0.20) +
    preferenceMatch * (weights?.preferenceMatch || 0.20) +
    reusability * (weights?.reusability || 0.15) +
    antiCliche * (weights?.antiCliche || 0.10) +
    rhythmQuality * (weights?.rhythmQuality || 0.10);

  return {
    total,
    intentMatch,
    novelty,
    preferenceMatch,
    reusability,
    antiCliche,
    rhythmQuality,
  };
}

// =============================================================================
// CANDIDATE GENERATION
// =============================================================================

export function generateCandidate(
  text: string,
  sourceUrl: string | null,
  sourceType: 'url' | 'paste' | 'manual',
  context: ScoringContext
): Candidate {
  const rhythm = analyzeRhythm(text);
  const { type } = detectPatternType(text);
  const cadence = type === 'CPU' ? analyzeCadenceContour(text) : null;

  const template = extractTemplate(text);
  const family = detectFamily(text);
  const intents = detectIntents(text, rhythm);
  const roles = detectRoles(text, rhythm);

  const partialCandidate: Partial<Candidate> = {
    text,
    template,
    type,
    rhythmProfile: rhythm,
    cadenceContour: cadence,
    predictedFamily: family,
    predictedIntents: intents,
    predictedRoles: roles,
    predictedCadence: cadence?.archetype || null,
    predictedAudience: ['essay', 'general'], // Default
  };

  const score = scoreCandidate(partialCandidate, context);

  // Generate why it works / why it might fail
  const whyItWorks = generateWhyItWorks(partialCandidate);
  const whyItMightFail = generateWhyItMightFail(partialCandidate, context);

  return {
    id: generateId(),
    text,
    template,
    type,
    rhythmProfile: rhythm,
    cadenceContour: cadence,
    predictedFamily: family,
    predictedIntents: intents,
    predictedRoles: roles,
    predictedCadence: cadence?.archetype || null,
    predictedAudience: ['essay', 'general'],
    score,
    whyItWorks,
    whyItMightFail,
    sourceUrl,
    sourceType,
  };
}

function generateWhyItWorks(candidate: Partial<Candidate>): string {
  const reasons: string[] = [];

  if (candidate.predictedFamily) {
    const familyDescriptions: Record<SentenceFamily, string> = {
      negation_pivot: 'Clean negation-redefinition structure',
      colon_reveal: 'Strong setup-reveal via colon',
      em_dash_insert: 'Effective parenthetical emphasis',
      question_answer: 'Direct question-answer creates engagement',
      list_resolve: 'Enumeration builds to clear resolution',
      contrast_pair: 'Sharp contrast highlights difference',
      conditional_snap: 'Clear cause-effect with punch',
      definition_is: 'Direct definitional clarity',
      analogy_bridge: 'Concrete analogy aids understanding',
      parallel_triple: 'Triple rhythm creates emphasis',
      reversal_but: 'Expectation subversion creates interest',
      accumulation: 'Building pressure through accumulation',
      understatement: 'Understated delivery adds sophistication',
      direct_command: 'Direct imperative creates urgency',
      fragment_punch: 'Fragment creates emphasis after setup',
      extended_qualifier: 'Nuanced positioning through qualification',
    };
    reasons.push(familyDescriptions[candidate.predictedFamily]);
  }

  if (candidate.rhythmProfile) {
    if (candidate.rhythmProfile.wordCount <= 12) {
      reasons.push('Concise length aids memorability');
    }
    if (candidate.rhythmProfile.punctuationProfile.emDashes > 0) {
      reasons.push('Em-dash creates strong pivot');
    }
  }

  if (candidate.cadenceContour && candidate.cadenceContour.archetypeConfidence > 0.6) {
    reasons.push(`Clear ${candidate.cadenceContour.archetype.replace('_', ' ')} rhythm`);
  }

  return reasons.length > 0 ? reasons[0] : 'Solid structural pattern';
}

function generateWhyItMightFail(candidate: Partial<Candidate>, context: ScoringContext): string {
  const concerns: string[] = [];

  // Check for potential issues
  if (candidate.score && candidate.score.antiCliche < 0.7) {
    concerns.push('Contains potentially overused phrases');
  }

  if (candidate.rhythmProfile && candidate.rhythmProfile.avgWordsPerSentence > 30) {
    concerns.push('Long sentences may lose readers');
  }

  if (candidate.predictedFamily === 'question_answer') {
    concerns.push('Question-answer can feel rhetorical if overused');
  }

  if (candidate.predictedFamily === 'definition_is') {
    concerns.push('Direct definitions can feel obvious');
  }

  if (candidate.score && candidate.score.novelty < 0.5) {
    concerns.push('Similar to existing patterns');
  }

  return concerns.length > 0 ? concerns[0] : 'May feel formulaic if overused';
}

// =============================================================================
// UTILITIES
// =============================================================================

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Simple word overlap similarity
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return intersection / union;
}

function generateId(): string {
  return 'cand_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export {
  similarity,
  generateId,
};
