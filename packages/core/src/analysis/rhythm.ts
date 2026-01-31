/**
 * Rhythm Analysis Engine
 *
 * Analyzes text for rhythm characteristics:
 * - Sentence length and structure
 * - Clause patterns
 * - Punctuation profiles
 * - Stress/beat estimation
 * - Cadence classification
 */

import {
  RhythmProfile,
  PunctuationProfile,
  SentenceRhythm,
  CadenceContour,
  CadenceArchetype,
  PatternType,
} from '../types/index.js';

// =============================================================================
// SYLLABLE ESTIMATION
// =============================================================================

const SYLLABLE_PATTERNS: [RegExp, number][] = [
  // Subtract for silent e
  [/[^laeiouy]e$/i, -1],
  // Subtract for ed endings that don't add syllable
  [/[^aeiou]ed$/i, -1],
  // Add for -le endings
  [/[^aeiouy]le$/i, 1],
  // Vowel clusters that are one syllable
  [/[aeiouy]{2,}/gi, 0], // handled specially
];

export function estimateSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length === 0) return 0;
  if (cleaned.length <= 3) return 1;

  // Count vowel groups
  const vowelGroups = cleaned.match(/[aeiouy]+/gi) || [];
  let syllables = vowelGroups.length;

  // Apply adjustments
  if (/[^laeiouy]e$/i.test(cleaned)) syllables--;
  if (/[^aeiou]ed$/i.test(cleaned) && syllables > 1) syllables--;
  if (/[^aeiouy]le$/i.test(cleaned)) syllables++;

  return Math.max(1, syllables);
}

export function estimateTotalSyllables(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.reduce((sum, word) => sum + estimateSyllables(word), 0);
}

// =============================================================================
// PUNCTUATION ANALYSIS
// =============================================================================

export function analyzePunctuation(text: string): PunctuationProfile {
  return {
    periods: (text.match(/\./g) || []).length,
    commas: (text.match(/,/g) || []).length,
    semicolons: (text.match(/;/g) || []).length,
    colons: (text.match(/:/g) || []).length,
    emDashes: (text.match(/—|--/g) || []).length,
    questionMarks: (text.match(/\?/g) || []).length,
    exclamationMarks: (text.match(/!/g) || []).length,
    parentheses: (text.match(/[()]/g) || []).length / 2,
    ellipses: (text.match(/\.{3}|…/g) || []).length,
  };
}

// =============================================================================
// CLAUSE ESTIMATION
// =============================================================================

const CLAUSE_MARKERS = [
  // Conjunctions
  /\b(and|but|or|nor|for|yet|so)\b/gi,
  // Relative pronouns
  /\b(who|whom|whose|which|that)\b/gi,
  // Subordinating conjunctions
  /\b(although|because|since|unless|while|when|where|if|after|before)\b/gi,
];

const CLAUSE_PUNCTUATION = /[,;:—]/g;

export function estimateClauses(sentence: string): number {
  let clauseCount = 1; // Start with one clause

  // Count clause markers
  for (const pattern of CLAUSE_MARKERS) {
    const matches = sentence.match(pattern);
    if (matches) {
      clauseCount += matches.length;
    }
  }

  // Count clause-separating punctuation
  const punctMatches = sentence.match(CLAUSE_PUNCTUATION);
  if (punctMatches) {
    // Don't double-count - use max of markers and punctuation
    clauseCount = Math.max(clauseCount, punctMatches.length + 1);
  }

  return clauseCount;
}

// =============================================================================
// LENGTH CATEGORIZATION
// =============================================================================

export function categorizeSentenceLength(wordCount: number): 'short' | 'medium' | 'long' | 'extended' {
  if (wordCount <= 8) return 'short';
  if (wordCount <= 18) return 'medium';
  if (wordCount <= 30) return 'long';
  return 'extended';
}

export function getLengthBucket(wordCount: number): 'S' | 'M' | 'L' | 'XL' {
  if (wordCount <= 8) return 'S';
  if (wordCount <= 18) return 'M';
  if (wordCount <= 30) return 'L';
  return 'XL';
}

// =============================================================================
// STRESS PATTERN ESTIMATION
// =============================================================================

export function estimateStressPattern(text: string): string {
  const sentences = splitIntoSentences(text);
  const pattern: string[] = [];

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount <= 8) {
      pattern.push('S');
    } else if (wordCount <= 18) {
      pattern.push('M');
    } else {
      pattern.push('L');
    }
  }

  return pattern.join('-');
}

// =============================================================================
// SENTENCE SPLITTING
// =============================================================================

export function splitIntoSentences(text: string): string[] {
  // Handle common abbreviations
  let processed = text
    .replace(/Mr\./g, 'Mr\u0000')
    .replace(/Mrs\./g, 'Mrs\u0000')
    .replace(/Ms\./g, 'Ms\u0000')
    .replace(/Dr\./g, 'Dr\u0000')
    .replace(/Prof\./g, 'Prof\u0000')
    .replace(/Sr\./g, 'Sr\u0000')
    .replace(/Jr\./g, 'Jr\u0000')
    .replace(/vs\./g, 'vs\u0000')
    .replace(/etc\./g, 'etc\u0000')
    .replace(/i\.e\./g, 'i\u0000e\u0000')
    .replace(/e\.g\./g, 'e\u0000g\u0000');

  // Split on sentence boundaries
  const sentences = processed
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.replace(/\u0000/g, '.').trim())
    .filter(s => s.length > 0);

  return sentences;
}

// =============================================================================
// RHYTHM PROFILE GENERATION
// =============================================================================

export function analyzeRhythm(text: string): RhythmProfile {
  const sentences = splitIntoSentences(text);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  const wordCount = words.length;
  const charCount = text.replace(/\s/g, '').length;
  const syllableEstimate = estimateTotalSyllables(text);
  const sentenceCount = sentences.length;

  // Estimate clauses across all sentences
  const totalClauses = sentences.reduce((sum, s) => sum + estimateClauses(s), 0);

  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

  return {
    wordCount,
    charCount,
    syllableEstimate,
    clauseCount: totalClauses,
    sentenceCount,
    avgWordsPerSentence,
    punctuationProfile: analyzePunctuation(text),
    lengthCategory: categorizeSentenceLength(avgWordsPerSentence),
    stressPattern: estimateStressPattern(text),
  };
}

// =============================================================================
// SENTENCE RHYTHM ANALYSIS
// =============================================================================

export function analyzeSentenceRhythm(sentence: string, position: number, totalSentences: number): SentenceRhythm {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Determine role based on position and characteristics
  let role: SentenceRhythm['role'];
  const relativePosition = position / Math.max(1, totalSentences - 1);

  if (position === 0) {
    role = 'setup';
  } else if (position === totalSentences - 1) {
    role = 'land';
  } else if (relativePosition < 0.4) {
    role = 'build';
  } else if (relativePosition < 0.7) {
    role = 'pivot';
  } else {
    role = 'coda';
  }

  return {
    position,
    text: sentence,
    wordCount,
    clauseEstimate: estimateClauses(sentence),
    punctuation: analyzePunctuation(sentence),
    role,
  };
}

// =============================================================================
// CADENCE CONTOUR ANALYSIS
// =============================================================================

const CADENCE_PATTERNS: Record<CadenceArchetype, { contour: string; minSentences: number; maxSentences: number }> = {
  crescendo_snap: { contour: 'ascending-short', minSentences: 3, maxSentences: 6 },
  staccato: { contour: 'short-short-short', minSentences: 3, maxSentences: 6 },
  wave: { contour: 'long-short-long-short', minSentences: 4, maxSentences: 8 },
  drumline: { contour: 'medium-medium-medium', minSentences: 3, maxSentences: 6 },
  slow_build: { contour: 'ascending', minSentences: 3, maxSentences: 5 },
  punch_punch_land: { contour: 'short-short-long', minSentences: 3, maxSentences: 4 },
  long_short_snap: { contour: 'long-short', minSentences: 2, maxSentences: 3 },
  parallel_march: { contour: 'equal-equal-equal', minSentences: 3, maxSentences: 5 },
  spiral: { contour: 'variable-returning', minSentences: 3, maxSentences: 6 },
  bookend: { contour: 'short-variable-short', minSentences: 3, maxSentences: 7 },
  ladder: { contour: 'stepping', minSentences: 3, maxSentences: 5 },
  heartbeat: { contour: 'paired', minSentences: 4, maxSentences: 6 },
  cascade: { contour: 'rapid-collect', minSentences: 4, maxSentences: 7 },
};

export function classifyCadence(lengthContour: number[]): { archetype: CadenceArchetype; confidence: number } {
  if (lengthContour.length < 2) {
    return { archetype: 'staccato', confidence: 0.3 };
  }

  const avgLength = lengthContour.reduce((a, b) => a + b, 0) / lengthContour.length;
  const buckets = lengthContour.map(l => getLengthBucket(l));
  const n = lengthContour.length;

  // Check for crescendo_snap: ascending then short final
  const lastIsShort = lengthContour[n - 1] <= 8;
  const isAscendingBeforeLast = n > 2 && lengthContour.slice(0, -1).every((l, i, arr) =>
    i === 0 || l >= arr[i - 1] * 0.8
  );
  if (lastIsShort && isAscendingBeforeLast && n >= 3) {
    return { archetype: 'crescendo_snap', confidence: 0.8 };
  }

  // Check for staccato: all short
  if (buckets.every(b => b === 'S')) {
    return { archetype: 'staccato', confidence: 0.9 };
  }

  // Check for wave: alternating long/short
  const isWave = n >= 4 && lengthContour.every((l, i) => {
    if (i === 0) return true;
    const prev = lengthContour[i - 1];
    const ratio = l / prev;
    return ratio < 0.6 || ratio > 1.5; // Significant change
  });
  if (isWave) {
    return { archetype: 'wave', confidence: 0.75 };
  }

  // Check for drumline: consistent medium
  const stdDev = Math.sqrt(
    lengthContour.reduce((sum, l) => sum + Math.pow(l - avgLength, 2), 0) / n
  );
  const coefficientOfVariation = stdDev / avgLength;
  if (coefficientOfVariation < 0.2 && buckets.every(b => b === 'M')) {
    return { archetype: 'drumline', confidence: 0.85 };
  }

  // Check for punch_punch_land: two short then long
  if (n === 3 && buckets[0] === 'S' && buckets[1] === 'S' && (buckets[2] === 'L' || buckets[2] === 'M')) {
    return { archetype: 'punch_punch_land', confidence: 0.8 };
  }

  // Check for long_short_snap
  if (n === 2 && (buckets[0] === 'L' || buckets[0] === 'XL') && buckets[1] === 'S') {
    return { archetype: 'long_short_snap', confidence: 0.85 };
  }

  // Check for slow_build: ascending
  const isAscending = lengthContour.every((l, i, arr) => i === 0 || l >= arr[i - 1] * 0.9);
  if (isAscending && n >= 3) {
    return { archetype: 'slow_build', confidence: 0.7 };
  }

  // Check for parallel_march: equal lengths
  if (coefficientOfVariation < 0.15 && n >= 3) {
    return { archetype: 'parallel_march', confidence: 0.75 };
  }

  // Check for bookend: first and last similar, different from middle
  if (n >= 3) {
    const firstLast = [lengthContour[0], lengthContour[n - 1]];
    const middle = lengthContour.slice(1, -1);
    const firstLastAvg = (firstLast[0] + firstLast[1]) / 2;
    const middleAvg = middle.reduce((a, b) => a + b, 0) / middle.length;
    if (Math.abs(firstLast[0] - firstLast[1]) / firstLastAvg < 0.3 &&
        Math.abs(firstLastAvg - middleAvg) / middleAvg > 0.4) {
      return { archetype: 'bookend', confidence: 0.7 };
    }
  }

  // Check for cascade: rapid short sentences then longer
  const shortCount = buckets.filter(b => b === 'S').length;
  if (shortCount >= n - 1 && (buckets[n - 1] === 'M' || buckets[n - 1] === 'L')) {
    return { archetype: 'cascade', confidence: 0.7 };
  }

  // Check for ladder: stepping pattern (each builds on previous)
  const isLadder = n >= 3 && lengthContour.every((l, i, arr) => {
    if (i === 0) return true;
    const diff = l - arr[i - 1];
    return Math.abs(diff) < avgLength * 0.3; // Small consistent steps
  });
  if (isLadder && coefficientOfVariation < 0.3) {
    return { archetype: 'ladder', confidence: 0.65 };
  }

  // Check for heartbeat: paired sentences
  if (n >= 4 && n % 2 === 0) {
    let isPaired = true;
    for (let i = 0; i < n; i += 2) {
      if (i + 1 < n) {
        const ratio = lengthContour[i] / lengthContour[i + 1];
        if (ratio > 0.6 && ratio < 1.5) isPaired = false;
      }
    }
    if (isPaired) {
      return { archetype: 'heartbeat', confidence: 0.65 };
    }
  }

  // Default: classify based on dominant characteristic
  if (avgLength < 10) return { archetype: 'staccato', confidence: 0.4 };
  if (avgLength > 20) return { archetype: 'slow_build', confidence: 0.4 };
  return { archetype: 'wave', confidence: 0.3 };
}

export function analyzeCadenceContour(text: string): CadenceContour {
  const sentences = splitIntoSentences(text);
  const sentenceRhythms = sentences.map((s, i) =>
    analyzeSentenceRhythm(s, i, sentences.length)
  );

  const lengthContour = sentenceRhythms.map(s => s.wordCount);
  const { archetype, confidence } = classifyCadence(lengthContour);

  // Find hinge sentence (pivot point)
  let hingeSentenceIndex: number | null = null;
  for (let i = 1; i < sentenceRhythms.length - 1; i++) {
    const prev = lengthContour[i - 1];
    const curr = lengthContour[i];
    const next = lengthContour[i + 1];
    // Hinge is where direction changes significantly
    if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
      hingeSentenceIndex = i;
      break;
    }
  }

  return {
    sentenceRhythms,
    lengthContour,
    archetype,
    archetypeConfidence: confidence,
    hingeSentenceIndex,
    totalSentences: sentences.length,
  };
}

// =============================================================================
// PATTERN TYPE DETECTION (SPU vs CPU)
// =============================================================================

export function detectPatternType(text: string): {
  type: PatternType;
  confidence: number;
  reason: string;
} {
  const sentences = splitIntoSentences(text);

  // Single sentence is always SPU
  if (sentences.length === 1) {
    return {
      type: 'SPU',
      confidence: 1.0,
      reason: 'Single sentence',
    };
  }

  // Very long (8+ sentences) is definitely CPU
  if (sentences.length >= 8) {
    return {
      type: 'CPU',
      confidence: 0.95,
      reason: `Multi-sentence paragraph (${sentences.length} sentences)`,
    };
  }

  // 2-7 sentences: analyze if rhythm is essential
  const cadence = analyzeCadenceContour(text);

  // High cadence confidence suggests the rhythm matters
  if (cadence.archetypeConfidence > 0.7) {
    return {
      type: 'CPU',
      confidence: cadence.archetypeConfidence,
      reason: `Distinct ${cadence.archetype} cadence pattern`,
    };
  }

  // Check for clear length variation (suggests intentional rhythm)
  const lengths = cadence.lengthContour;
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const maxDiff = Math.max(...lengths) - Math.min(...lengths);
  const hasIntentionalRhythm = maxDiff > avgLength * 0.5;

  if (hasIntentionalRhythm && sentences.length >= 3) {
    return {
      type: 'CPU',
      confidence: 0.7,
      reason: 'Significant length variation suggests intentional cadence',
    };
  }

  // Check for parallel structure (suggests unified pattern)
  const firstWords = sentences.map(s => s.split(/\s+/)[0]?.toLowerCase());
  const uniqueFirstWords = new Set(firstWords);
  if (uniqueFirstWords.size < sentences.length * 0.5 && sentences.length >= 3) {
    return {
      type: 'CPU',
      confidence: 0.75,
      reason: 'Parallel structure suggests unified paragraph pattern',
    };
  }

  // 2 sentences: could go either way
  if (sentences.length === 2) {
    // Check if second sentence depends on first
    const secondStarts = sentences[1].toLowerCase().trim();
    const dependencyMarkers = ['but', 'and', 'so', 'yet', 'however', 'still', 'it', 'this', 'that'];
    const hasDependency = dependencyMarkers.some(m => secondStarts.startsWith(m + ' '));

    if (hasDependency) {
      return {
        type: 'CPU',
        confidence: 0.6,
        reason: 'Second sentence depends on first',
      };
    }

    // Strong length contrast suggests intentional pairing
    const ratio = lengths[0] / lengths[1];
    if (ratio > 2 || ratio < 0.5) {
      return {
        type: 'CPU',
        confidence: 0.65,
        reason: 'Strong length contrast suggests intentional pairing',
      };
    }

    // Default to SPU for simple two-sentence
    return {
      type: 'SPU',
      confidence: 0.55,
      reason: 'Two independent sentences - treating as compound SPU',
    };
  }

  // Default: more sentences = more likely CPU
  const cpuLikelihood = Math.min(0.9, 0.4 + sentences.length * 0.1);
  return {
    type: cpuLikelihood > 0.5 ? 'CPU' : 'SPU',
    confidence: cpuLikelihood,
    reason: `${sentences.length} sentences with moderate rhythm coherence`,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  RhythmProfile,
  PunctuationProfile,
  SentenceRhythm,
  CadenceContour,
  CadenceArchetype,
};
