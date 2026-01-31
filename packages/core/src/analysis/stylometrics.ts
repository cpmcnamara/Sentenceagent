/**
 * Stylometric Analysis Engine
 *
 * Implements computational stylistics techniques used in:
 * - Authorship attribution
 * - Style fingerprinting
 * - Writing quality assessment
 *
 * References:
 * - Burrows, J. (2002). "Delta: A measure of stylistic difference"
 * - Stamatatos, E. (2009). "A survey of modern authorship attribution methods"
 * - Koppel, M. et al. (2009). "Computational methods in authorship attribution"
 */

// =============================================================================
// LEXICAL FEATURES
// =============================================================================

export interface LexicalFeatures {
  // Vocabulary richness
  typeTokenRatio: number;           // Unique words / total words
  hapaxLegomenaRatio: number;       // Words appearing once / total words
  hapaxDislegomenaRatio: number;    // Words appearing twice / total words
  yuleK: number;                    // Yule's K characteristic (vocabulary richness)
  sichelS: number;                  // Sichel's S measure
  honoréR: number;                  // Honoré's R statistic

  // Word length distribution
  avgWordLength: number;
  wordLengthStdDev: number;
  shortWordRatio: number;           // Words <= 3 chars
  longWordRatio: number;            // Words >= 8 chars

  // Vocabulary complexity
  avgSyllablesPerWord: number;
  complexWordRatio: number;         // Words with 3+ syllables
  fleschReadingEase: number;
  fleschKincaidGrade: number;
}

export interface SyntacticFeatures {
  // Sentence structure
  avgSentenceLength: number;
  sentenceLengthStdDev: number;
  shortSentenceRatio: number;       // Sentences <= 10 words
  longSentenceRatio: number;        // Sentences >= 30 words

  // Punctuation patterns
  commasPerSentence: number;
  semicolonsPerSentence: number;
  colonsPerSentence: number;
  dashesPerSentence: number;
  questionRatio: number;
  exclamationRatio: number;

  // Clause structure
  avgClausesPerSentence: number;
  subordinateClauseRatio: number;
  coordinateClauseRatio: number;
}

export interface FunctionWordProfile {
  // Pronouns
  firstPersonSingular: number;      // I, me, my
  firstPersonPlural: number;        // We, us, our
  secondPerson: number;             // You, your
  thirdPerson: number;              // He, she, they, etc.

  // Conjunctions
  coordinatingConj: number;         // and, but, or
  subordinatingConj: number;        // because, although, when

  // Determiners
  articles: number;                 // a, an, the
  demonstratives: number;           // this, that, these, those

  // Prepositions (top 10)
  prepositionFreq: Record<string, number>;

  // Modal verbs
  modalVerbs: number;               // can, could, may, might, etc.
}

// =============================================================================
// STYLE FINGERPRINT
// =============================================================================

export interface StyleFingerprint {
  // Core metrics
  lexical: LexicalFeatures;
  syntactic: SyntacticFeatures;
  functionWords: FunctionWordProfile;

  // Derived characteristics
  formality: number;                // 0-1 scale
  complexity: number;               // 0-1 scale
  dynamism: number;                 // 0-1 scale (sentence length variation)
  intimacy: number;                 // 0-1 scale (pronoun usage patterns)

  // Signature patterns
  sentenceLengthDistribution: number[];  // Histogram
  punctuationSignature: number[];        // Normalized punctuation frequencies
  topFunctionWords: [string, number][];  // Top 50 function words by frequency

  // Burrows Delta components
  zScores: Record<string, number>;       // Z-scores for top function words
}

// =============================================================================
// FUNCTION WORD LISTS
// =============================================================================

const FIRST_PERSON_SINGULAR = ['i', 'me', 'my', 'mine', 'myself'];
const FIRST_PERSON_PLURAL = ['we', 'us', 'our', 'ours', 'ourselves'];
const SECOND_PERSON = ['you', 'your', 'yours', 'yourself', 'yourselves'];
const THIRD_PERSON = ['he', 'she', 'it', 'him', 'her', 'his', 'hers', 'its', 'they', 'them', 'their', 'theirs', 'himself', 'herself', 'itself', 'themselves'];

const COORDINATING_CONJ = ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'];
const SUBORDINATING_CONJ = ['after', 'although', 'as', 'because', 'before', 'if', 'once', 'since', 'than', 'that', 'though', 'till', 'until', 'when', 'where', 'whether', 'while'];

const ARTICLES = ['a', 'an', 'the'];
const DEMONSTRATIVES = ['this', 'that', 'these', 'those'];
const MODAL_VERBS = ['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'];
const TOP_PREPOSITIONS = ['of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'about'];

// Top 100 function words for Burrows Delta
const FUNCTION_WORDS_100 = [
  'the', 'and', 'of', 'to', 'a', 'in', 'that', 'is', 'was', 'he',
  'for', 'it', 'with', 'as', 'his', 'on', 'be', 'at', 'by', 'i',
  'this', 'had', 'not', 'are', 'but', 'from', 'or', 'have', 'an', 'they',
  'which', 'one', 'you', 'were', 'her', 'all', 'she', 'there', 'would', 'their',
  'we', 'him', 'been', 'has', 'when', 'who', 'will', 'more', 'no', 'if',
  'out', 'so', 'said', 'what', 'up', 'its', 'about', 'into', 'than', 'them',
  'can', 'only', 'other', 'new', 'some', 'could', 'time', 'these', 'two', 'may',
  'then', 'do', 'first', 'any', 'my', 'now', 'such', 'like', 'our', 'over',
  'man', 'me', 'even', 'most', 'made', 'after', 'also', 'did', 'many', 'before',
  'must', 'through', 'back', 'years', 'where', 'much', 'your', 'way', 'well', 'down',
];

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

export function extractLexicalFeatures(text: string): LexicalFeatures {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const totalWords = words.length;

  if (totalWords === 0) {
    return createEmptyLexicalFeatures();
  }

  // Word frequency distribution
  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }

  const uniqueWords = Object.keys(wordFreq).length;
  const freqDistribution = Object.values(wordFreq);

  // Type-token ratio
  const typeTokenRatio = uniqueWords / totalWords;

  // Hapax legomena (words appearing once)
  const hapaxCount = freqDistribution.filter(f => f === 1).length;
  const hapaxLegomenaRatio = hapaxCount / totalWords;

  // Hapax dislegomena (words appearing twice)
  const hapaxDisCount = freqDistribution.filter(f => f === 2).length;
  const hapaxDislegomenaRatio = hapaxDisCount / totalWords;

  // Yule's K (vocabulary richness - higher = less rich)
  const m1 = totalWords;
  const m2 = freqDistribution.reduce((sum, f) => sum + f * f, 0);
  const yuleK = 10000 * (m2 - m1) / (m1 * m1);

  // Sichel's S
  const sichelS = hapaxDisCount / uniqueWords;

  // Honoré's R
  const honoréR = hapaxCount > 0
    ? (100 * Math.log(totalWords)) / (1 - hapaxCount / uniqueWords)
    : 0;

  // Word length analysis
  const wordLengths = words.map(w => w.length);
  const avgWordLength = wordLengths.reduce((a, b) => a + b, 0) / totalWords;
  const wordLengthVariance = wordLengths.reduce((sum, l) => sum + Math.pow(l - avgWordLength, 2), 0) / totalWords;
  const wordLengthStdDev = Math.sqrt(wordLengthVariance);

  const shortWordRatio = wordLengths.filter(l => l <= 3).length / totalWords;
  const longWordRatio = wordLengths.filter(l => l >= 8).length / totalWords;

  // Syllable analysis (simplified)
  const syllableCounts = words.map(estimateSyllables);
  const avgSyllablesPerWord = syllableCounts.reduce((a, b) => a + b, 0) / totalWords;
  const complexWordRatio = syllableCounts.filter(s => s >= 3).length / totalWords;

  // Readability
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const totalSyllables = syllableCounts.reduce((a, b) => a + b, 0);

  const fleschReadingEase = 206.835
    - 1.015 * (totalWords / sentenceCount)
    - 84.6 * (totalSyllables / totalWords);

  const fleschKincaidGrade = 0.39 * (totalWords / sentenceCount)
    + 11.8 * (totalSyllables / totalWords)
    - 15.59;

  return {
    typeTokenRatio,
    hapaxLegomenaRatio,
    hapaxDislegomenaRatio,
    yuleK,
    sichelS,
    honoréR,
    avgWordLength,
    wordLengthStdDev,
    shortWordRatio,
    longWordRatio,
    avgSyllablesPerWord,
    complexWordRatio,
    fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
  };
}

export function extractSyntacticFeatures(text: string): SyntacticFeatures {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount;

  const sentenceLengthVariance = sentenceLengths.reduce((sum, l) => sum + Math.pow(l - avgSentenceLength, 2), 0) / sentenceCount;
  const sentenceLengthStdDev = Math.sqrt(sentenceLengthVariance);

  const shortSentenceRatio = sentenceLengths.filter(l => l <= 10).length / sentenceCount;
  const longSentenceRatio = sentenceLengths.filter(l => l >= 30).length / sentenceCount;

  // Punctuation analysis
  const commas = (text.match(/,/g) || []).length;
  const semicolons = (text.match(/;/g) || []).length;
  const colons = (text.match(/:/g) || []).length;
  const dashes = (text.match(/—|--/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;

  // Clause estimation
  const lowerText = text.toLowerCase();
  const subordinatingMatches = SUBORDINATING_CONJ.reduce((count, conj) =>
    count + (lowerText.match(new RegExp(`\\b${conj}\\b`, 'g')) || []).length, 0);
  const coordinatingMatches = COORDINATING_CONJ.reduce((count, conj) =>
    count + (lowerText.match(new RegExp(`\\b${conj}\\b`, 'g')) || []).length, 0);

  const totalClauses = sentenceCount + subordinatingMatches + coordinatingMatches;
  const avgClausesPerSentence = totalClauses / sentenceCount;

  return {
    avgSentenceLength,
    sentenceLengthStdDev,
    shortSentenceRatio,
    longSentenceRatio,
    commasPerSentence: commas / sentenceCount,
    semicolonsPerSentence: semicolons / sentenceCount,
    colonsPerSentence: colons / sentenceCount,
    dashesPerSentence: dashes / sentenceCount,
    questionRatio: questions / sentenceCount,
    exclamationRatio: exclamations / sentenceCount,
    avgClausesPerSentence,
    subordinateClauseRatio: subordinatingMatches / Math.max(1, totalClauses),
    coordinateClauseRatio: coordinatingMatches / Math.max(1, totalClauses),
  };
}

export function extractFunctionWordProfile(text: string): FunctionWordProfile {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const totalWords = Math.max(1, words.length);

  const countWords = (list: string[]) =>
    list.reduce((count, w) => count + words.filter(word => word === w).length, 0) / totalWords;

  const prepositionFreq: Record<string, number> = {};
  for (const prep of TOP_PREPOSITIONS) {
    const count = words.filter(w => w === prep).length;
    if (count > 0) {
      prepositionFreq[prep] = count / totalWords;
    }
  }

  return {
    firstPersonSingular: countWords(FIRST_PERSON_SINGULAR),
    firstPersonPlural: countWords(FIRST_PERSON_PLURAL),
    secondPerson: countWords(SECOND_PERSON),
    thirdPerson: countWords(THIRD_PERSON),
    coordinatingConj: countWords(COORDINATING_CONJ),
    subordinatingConj: countWords(SUBORDINATING_CONJ),
    articles: countWords(ARTICLES),
    demonstratives: countWords(DEMONSTRATIVES),
    prepositionFreq,
    modalVerbs: countWords(MODAL_VERBS),
  };
}

// =============================================================================
// BURROWS DELTA (Stylistic Distance)
// =============================================================================

/**
 * Calculate Burrows Delta between two texts
 * Lower delta = more similar style
 * Reference: Burrows, J. (2002). "'Delta': a measure of stylistic difference"
 */
export function calculateBurrowsDelta(
  text1: string,
  text2: string,
  corpusMean?: Record<string, number>,
  corpusStdDev?: Record<string, number>
): number {
  const words1 = text1.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const words2 = text2.toLowerCase().match(/\b[a-z]+\b/g) || [];

  // Calculate frequency for function words
  const freq1 = calculateFunctionWordFrequencies(words1);
  const freq2 = calculateFunctionWordFrequencies(words2);

  // If no corpus stats provided, use text1 as reference
  const mean = corpusMean || freq1;
  const stdDev = corpusStdDev || calculateStdDevFromTexts([freq1, freq2]);

  // Calculate z-scores and delta
  let deltaSum = 0;
  let count = 0;

  for (const word of FUNCTION_WORDS_100.slice(0, 50)) { // Use top 50
    const z1 = stdDev[word] > 0 ? ((freq1[word] || 0) - (mean[word] || 0)) / stdDev[word] : 0;
    const z2 = stdDev[word] > 0 ? ((freq2[word] || 0) - (mean[word] || 0)) / stdDev[word] : 0;

    deltaSum += Math.abs(z1 - z2);
    count++;
  }

  return count > 0 ? deltaSum / count : 0;
}

function calculateFunctionWordFrequencies(words: string[]): Record<string, number> {
  const total = Math.max(1, words.length);
  const freq: Record<string, number> = {};

  for (const fw of FUNCTION_WORDS_100) {
    freq[fw] = words.filter(w => w === fw).length / total;
  }

  return freq;
}

function calculateStdDevFromTexts(freqs: Record<string, number>[]): Record<string, number> {
  const stdDev: Record<string, number> = {};

  for (const word of FUNCTION_WORDS_100) {
    const values = freqs.map(f => f[word] || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    stdDev[word] = Math.sqrt(variance) || 0.001; // Avoid division by zero
  }

  return stdDev;
}

// =============================================================================
// STYLE FINGERPRINT GENERATION
// =============================================================================

export function generateStyleFingerprint(text: string): StyleFingerprint {
  const lexical = extractLexicalFeatures(text);
  const syntactic = extractSyntacticFeatures(text);
  const functionWords = extractFunctionWordProfile(text);

  // Calculate derived characteristics
  const formality = calculateFormality(lexical, syntactic, functionWords);
  const complexity = calculateComplexity(lexical, syntactic);
  const dynamism = calculateDynamism(syntactic);
  const intimacy = calculateIntimacy(functionWords);

  // Sentence length distribution (histogram: 0-5, 6-10, 11-15, 16-20, 21-25, 26-30, 30+)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
  const sentenceLengthDistribution = [
    sentenceLengths.filter(l => l <= 5).length,
    sentenceLengths.filter(l => l > 5 && l <= 10).length,
    sentenceLengths.filter(l => l > 10 && l <= 15).length,
    sentenceLengths.filter(l => l > 15 && l <= 20).length,
    sentenceLengths.filter(l => l > 20 && l <= 25).length,
    sentenceLengths.filter(l => l > 25 && l <= 30).length,
    sentenceLengths.filter(l => l > 30).length,
  ].map(n => n / Math.max(1, sentences.length));

  // Punctuation signature
  const punctuationSignature = [
    syntactic.commasPerSentence,
    syntactic.semicolonsPerSentence,
    syntactic.colonsPerSentence,
    syntactic.dashesPerSentence,
    syntactic.questionRatio,
    syntactic.exclamationRatio,
  ];

  // Top function words
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    if (FUNCTION_WORDS_100.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  const topFunctionWords = Object.entries(wordFreq)
    .map(([word, count]) => [word, count / words.length] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  // Z-scores for function words (relative to general English)
  const zScores = calculateZScores(wordFreq, words.length);

  return {
    lexical,
    syntactic,
    functionWords,
    formality,
    complexity,
    dynamism,
    intimacy,
    sentenceLengthDistribution,
    punctuationSignature,
    topFunctionWords,
    zScores,
  };
}

// =============================================================================
// DERIVED METRICS
// =============================================================================

function calculateFormality(
  lexical: LexicalFeatures,
  syntactic: SyntacticFeatures,
  functionWords: FunctionWordProfile
): number {
  // Formality = F-score from Heylighen & Dewaele (1999)
  // F = (noun + adjective + preposition + article - pronoun - verb - adverb - interjection + 100) / 2
  // Simplified version using available features

  let score = 0.5;

  // More formal: longer words, complex sentences, fewer first-person
  score += (lexical.avgWordLength - 4) * 0.05;
  score += (syntactic.avgSentenceLength - 15) * 0.01;
  score -= functionWords.firstPersonSingular * 2;
  score -= functionWords.secondPerson * 1.5;
  score += lexical.complexWordRatio * 0.3;
  score -= syntactic.exclamationRatio * 0.5;

  return Math.max(0, Math.min(1, score));
}

function calculateComplexity(
  lexical: LexicalFeatures,
  syntactic: SyntacticFeatures
): number {
  let score = 0;

  // Lexical complexity
  score += (100 - lexical.fleschReadingEase) / 100 * 0.3;
  score += lexical.complexWordRatio * 0.2;
  score += (lexical.avgWordLength - 4) / 4 * 0.2;

  // Syntactic complexity
  score += (syntactic.avgSentenceLength - 10) / 30 * 0.15;
  score += syntactic.avgClausesPerSentence / 4 * 0.15;

  return Math.max(0, Math.min(1, score));
}

function calculateDynamism(syntactic: SyntacticFeatures): number {
  // Dynamism = variation in sentence length (coefficient of variation)
  if (syntactic.avgSentenceLength === 0) return 0;
  const cv = syntactic.sentenceLengthStdDev / syntactic.avgSentenceLength;
  return Math.min(1, cv);
}

function calculateIntimacy(functionWords: FunctionWordProfile): number {
  // Intimacy = use of first/second person, fewer third person
  return Math.min(1,
    functionWords.firstPersonSingular * 3 +
    functionWords.firstPersonPlural * 2 +
    functionWords.secondPerson * 2
  );
}

function calculateZScores(wordFreq: Record<string, number>, totalWords: number): Record<string, number> {
  // General English function word frequencies (approximate)
  const englishMeans: Record<string, number> = {
    the: 0.07, and: 0.03, of: 0.035, to: 0.025, a: 0.02,
    in: 0.02, that: 0.01, is: 0.01, was: 0.01, he: 0.008,
    // ... simplified for key words
  };

  const englishStdDev = 0.005; // Simplified constant

  const zScores: Record<string, number> = {};
  for (const [word, count] of Object.entries(wordFreq)) {
    const freq = count / totalWords;
    const mean = englishMeans[word] || 0.001;
    zScores[word] = (freq - mean) / englishStdDev;
  }

  return zScores;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function estimateSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length <= 3) return 1;

  const vowelGroups = cleaned.match(/[aeiouy]+/gi) || [];
  let syllables = vowelGroups.length;

  if (/[^laeiouy]e$/i.test(cleaned)) syllables--;
  if (/[^aeiou]ed$/i.test(cleaned) && syllables > 1) syllables--;
  if (/[^aeiouy]le$/i.test(cleaned)) syllables++;

  return Math.max(1, syllables);
}

function createEmptyLexicalFeatures(): LexicalFeatures {
  return {
    typeTokenRatio: 0,
    hapaxLegomenaRatio: 0,
    hapaxDislegomenaRatio: 0,
    yuleK: 0,
    sichelS: 0,
    honoréR: 0,
    avgWordLength: 0,
    wordLengthStdDev: 0,
    shortWordRatio: 0,
    longWordRatio: 0,
    avgSyllablesPerWord: 0,
    complexWordRatio: 0,
    fleschReadingEase: 0,
    fleschKincaidGrade: 0,
  };
}

// =============================================================================
// STYLE SIMILARITY
// =============================================================================

/**
 * Calculate overall style similarity between two texts
 * Returns 0-1 (1 = identical style)
 */
export function calculateStyleSimilarity(text1: string, text2: string): {
  similarity: number;
  breakdown: {
    lexical: number;
    syntactic: number;
    functionWord: number;
    burrowsDelta: number;
  };
} {
  const fp1 = generateStyleFingerprint(text1);
  const fp2 = generateStyleFingerprint(text2);

  // Lexical similarity
  const lexicalSim = 1 - Math.abs(fp1.lexical.typeTokenRatio - fp2.lexical.typeTokenRatio)
    - Math.abs(fp1.lexical.avgWordLength - fp2.lexical.avgWordLength) / 10
    - Math.abs(fp1.lexical.complexWordRatio - fp2.lexical.complexWordRatio);

  // Syntactic similarity
  const syntacticSim = 1 - Math.abs(fp1.syntactic.avgSentenceLength - fp2.syntactic.avgSentenceLength) / 30
    - Math.abs(fp1.syntactic.sentenceLengthStdDev - fp2.syntactic.sentenceLengthStdDev) / 20;

  // Function word similarity
  const functionWordSim = 1 - Math.abs(fp1.functionWords.firstPersonSingular - fp2.functionWords.firstPersonSingular) * 10
    - Math.abs(fp1.functionWords.articles - fp2.functionWords.articles) * 5;

  // Burrows Delta (convert to similarity)
  const delta = calculateBurrowsDelta(text1, text2);
  const deltaSim = Math.max(0, 1 - delta / 2);

  const similarity = (
    Math.max(0, lexicalSim) * 0.25 +
    Math.max(0, syntacticSim) * 0.25 +
    Math.max(0, functionWordSim) * 0.2 +
    deltaSim * 0.3
  );

  return {
    similarity: Math.max(0, Math.min(1, similarity)),
    breakdown: {
      lexical: Math.max(0, Math.min(1, lexicalSim)),
      syntactic: Math.max(0, Math.min(1, syntacticSim)),
      functionWord: Math.max(0, Math.min(1, functionWordSim)),
      burrowsDelta: deltaSim,
    },
  };
}

export { FUNCTION_WORDS_100 };
