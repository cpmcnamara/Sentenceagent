/**
 * Pattern Validation & Quality Testing
 *
 * Validates that patterns actually work by:
 * 1. Testing meaning preservation when applying patterns
 * 2. Testing cadence preservation for CPU patterns
 * 3. Tracking usage success rates over time
 * 4. A/B comparison of pattern variations
 * 5. Progressive improvement metrics
 */

import type {
  PatternUnit,
  SPU,
  CPU,
  RhythmProfile,
  CadenceContour,
  CadenceArchetype,
  UserPreferences,
} from '../types/index.js';

import { analyzeRhythm, analyzeCadenceContour, classifyCadence } from '../analysis/rhythm.js';

// =============================================================================
// TEST RESULT TYPES
// =============================================================================

export interface PatternTestResult {
  patternId: string;
  testType: PatternTestType;
  passed: boolean;
  score: number; // 0-1
  details: string;
  testedAt: string;
  testInput?: string;
  testOutput?: string;
}

export type PatternTestType =
  | 'meaning_preservation'    // Does applying pattern preserve intended meaning?
  | 'cadence_preservation'    // Does the rhythm survive modification?
  | 'clarity_improvement'     // Is the result clearer?
  | 'engagement_improvement'  // Is it more engaging?
  | 'distinctiveness'         // Is it distinct from other patterns?
  | 'reusability'             // Can it be applied to diverse content?
  | 'naturalness';            // Does it sound natural, not formulaic?

export interface PatternUsageRecord {
  patternId: string;
  usedAt: string;
  context: string;
  outcome: 'success' | 'partial' | 'failure';
  notes?: string;
}

export interface PatternQualityMetrics {
  patternId: string;
  totalTests: number;
  passRate: number;
  totalUsages: number;
  successRate: number;
  lastTested: string;
  lastUsed: string;
  qualityScore: number; // Composite 0-1
  readyForPromotion: boolean;
}

// =============================================================================
// IMPROVEMENT TRACKING
// =============================================================================

export interface LibraryProgressMetrics {
  // Coverage metrics
  totalPatterns: number;
  activePatterns: number;
  rolesCovered: number;
  intentsCovered: number;
  coverageScore: number; // 0-1

  // Quality metrics
  averagePatternQuality: number;
  testedPatternRatio: number;
  highQualityPatternCount: number;

  // Usage metrics
  totalUsages: number;
  usageSuccessRate: number;

  // Trend metrics
  patternsAddedLast7Days: number;
  qualityTrendLast7Days: 'improving' | 'stable' | 'declining';

  // Recommendations
  weakAreas: string[];
  nextPriorities: string[];
}

export interface WritingQualityComparison {
  // Before applying library patterns
  before: WritingAnalysis;
  // After applying library patterns
  after: WritingAnalysis;
  // Delta
  improvement: WritingImprovement;
}

export interface WritingAnalysis {
  text: string;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  rhythmVariety: number; // 0-1, variety in sentence lengths
  structuralPatternCount: number;
  cadenceStrength: number; // 0-1
  estimatedEngagement: number; // 0-1
  estimatedClarity: number; // 0-1
}

export interface WritingImprovement {
  wordCountDelta: number;
  avgSentenceLengthDelta: number;
  rhythmVarietyDelta: number;
  structuralPatternDelta: number;
  cadenceStrengthDelta: number;
  engagementDelta: number;
  clarityDelta: number;
  overallImprovement: number; // -1 to 1
  significantChanges: string[];
}

// =============================================================================
// PATTERN TESTS
// =============================================================================

/**
 * Test if a pattern preserves meaning when applied to different content
 */
export function testMeaningPreservation(
  pattern: PatternUnit,
  originalContent: string,
  patternAppliedContent: string
): PatternTestResult {
  // Extract key nouns/verbs from original
  const originalKeywords = extractKeywords(originalContent);
  const appliedKeywords = extractKeywords(patternAppliedContent);

  // Check overlap
  const preserved = originalKeywords.filter(k => appliedKeywords.includes(k));
  const preservationRate = originalKeywords.length > 0
    ? preserved.length / originalKeywords.length
    : 1;

  const passed = preservationRate >= 0.7;

  return {
    patternId: pattern.id,
    testType: 'meaning_preservation',
    passed,
    score: preservationRate,
    details: passed
      ? `${(preservationRate * 100).toFixed(0)}% of key concepts preserved`
      : `Only ${(preservationRate * 100).toFixed(0)}% of key concepts preserved - pattern may distort meaning`,
    testedAt: new Date().toISOString(),
    testInput: originalContent,
    testOutput: patternAppliedContent,
  };
}

/**
 * Test if a CPU pattern's cadence survives when applied to new content
 */
export function testCadencePreservation(
  pattern: CPU,
  appliedContent: string
): PatternTestResult {
  const originalCadence = pattern.cadenceContour;
  const appliedCadence = analyzeCadenceContour(appliedContent);

  // Check if archetype matches
  const archetypeMatch = appliedCadence.archetype === originalCadence.archetype;

  // Check contour shape similarity
  const contourSimilarity = compareContours(
    originalCadence.lengthContour,
    appliedCadence.lengthContour
  );

  const score = archetypeMatch ? (0.5 + contourSimilarity * 0.5) : contourSimilarity * 0.5;
  const passed = score >= 0.6;

  return {
    patternId: pattern.id,
    testType: 'cadence_preservation',
    passed,
    score,
    details: archetypeMatch
      ? `Cadence archetype preserved (${pattern.cadenceArchetype}), contour ${(contourSimilarity * 100).toFixed(0)}% similar`
      : `Cadence shifted from ${originalCadence.archetype} to ${appliedCadence.archetype}`,
    testedAt: new Date().toISOString(),
    testOutput: appliedContent,
  };
}

/**
 * Test pattern distinctiveness from existing library
 */
export function testDistinctiveness(
  pattern: PatternUnit,
  existingPatterns: PatternUnit[]
): PatternTestResult {
  let maxSimilarity = 0;
  let mostSimilarId = '';

  for (const existing of existingPatterns) {
    if (existing.id === pattern.id) continue;
    const similarity = computePatternSimilarity(pattern, existing);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarId = existing.id;
    }
  }

  const distinctiveness = 1 - maxSimilarity;
  const passed = distinctiveness >= 0.3; // At least 30% distinct

  return {
    patternId: pattern.id,
    testType: 'distinctiveness',
    passed,
    score: distinctiveness,
    details: passed
      ? `${(distinctiveness * 100).toFixed(0)}% distinct from existing patterns`
      : `Too similar to ${mostSimilarId} (${(maxSimilarity * 100).toFixed(0)}% overlap)`,
    testedAt: new Date().toISOString(),
  };
}

/**
 * Test pattern reusability across different content types
 */
export function testReusability(
  pattern: PatternUnit,
  testCases: string[]
): PatternTestResult {
  // For each test case, check if pattern can be meaningfully applied
  let successCount = 0;

  for (const testCase of testCases) {
    // Simulate pattern application by checking structural compatibility
    if (canApplyPattern(pattern, testCase)) {
      successCount++;
    }
  }

  const reusabilityRate = testCases.length > 0
    ? successCount / testCases.length
    : 0;

  const passed = reusabilityRate >= 0.5;

  return {
    patternId: pattern.id,
    testType: 'reusability',
    passed,
    score: reusabilityRate,
    details: `Applicable to ${successCount}/${testCases.length} test cases`,
    testedAt: new Date().toISOString(),
  };
}

// =============================================================================
// WRITING ANALYSIS
// =============================================================================

/**
 * Analyze a piece of writing for quality metrics
 */
export function analyzeWriting(text: string): WritingAnalysis {
  const rhythm = analyzeRhythm(text);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Calculate rhythm variety (std dev of sentence lengths)
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const rhythmVariety = Math.min(1, stdDev / 10); // Normalize

  // Detect structural patterns
  const structuralPatternCount = countStructuralPatterns(text);

  // Estimate cadence strength
  const cadenceStrength = estimateCadenceStrength(text);

  // Estimate engagement (based on questions, strong verbs, etc.)
  const estimatedEngagement = estimateEngagement(text);

  // Estimate clarity (based on sentence length, word complexity)
  const estimatedClarity = estimateClarity(text, rhythm);

  return {
    text,
    wordCount: rhythm.wordCount,
    sentenceCount: rhythm.sentenceCount,
    avgSentenceLength: rhythm.avgWordsPerSentence,
    rhythmVariety,
    structuralPatternCount,
    cadenceStrength,
    estimatedEngagement,
    estimatedClarity,
  };
}

/**
 * Compare before/after writing quality
 */
export function compareWritingQuality(
  before: string,
  after: string
): WritingQualityComparison {
  const beforeAnalysis = analyzeWriting(before);
  const afterAnalysis = analyzeWriting(after);

  const improvement: WritingImprovement = {
    wordCountDelta: afterAnalysis.wordCount - beforeAnalysis.wordCount,
    avgSentenceLengthDelta: afterAnalysis.avgSentenceLength - beforeAnalysis.avgSentenceLength,
    rhythmVarietyDelta: afterAnalysis.rhythmVariety - beforeAnalysis.rhythmVariety,
    structuralPatternDelta: afterAnalysis.structuralPatternCount - beforeAnalysis.structuralPatternCount,
    cadenceStrengthDelta: afterAnalysis.cadenceStrength - beforeAnalysis.cadenceStrength,
    engagementDelta: afterAnalysis.estimatedEngagement - beforeAnalysis.estimatedEngagement,
    clarityDelta: afterAnalysis.estimatedClarity - beforeAnalysis.estimatedClarity,
    overallImprovement: 0,
    significantChanges: [],
  };

  // Calculate overall improvement
  const weights = {
    rhythmVariety: 0.2,
    structuralPattern: 0.15,
    cadenceStrength: 0.2,
    engagement: 0.25,
    clarity: 0.2,
  };

  improvement.overallImprovement =
    improvement.rhythmVarietyDelta * weights.rhythmVariety +
    (improvement.structuralPatternDelta / 5) * weights.structuralPattern +
    improvement.cadenceStrengthDelta * weights.cadenceStrength +
    improvement.engagementDelta * weights.engagement +
    improvement.clarityDelta * weights.clarity;

  // Identify significant changes
  if (Math.abs(improvement.rhythmVarietyDelta) > 0.1) {
    improvement.significantChanges.push(
      improvement.rhythmVarietyDelta > 0
        ? 'Improved rhythm variety'
        : 'Reduced rhythm variety'
    );
  }
  if (improvement.structuralPatternDelta > 0) {
    improvement.significantChanges.push('Added structural patterns');
  }
  if (Math.abs(improvement.engagementDelta) > 0.1) {
    improvement.significantChanges.push(
      improvement.engagementDelta > 0
        ? 'Increased engagement'
        : 'Decreased engagement'
    );
  }
  if (Math.abs(improvement.clarityDelta) > 0.1) {
    improvement.significantChanges.push(
      improvement.clarityDelta > 0
        ? 'Improved clarity'
        : 'Reduced clarity'
    );
  }

  return {
    before: beforeAnalysis,
    after: afterAnalysis,
    improvement,
  };
}

// =============================================================================
// LIBRARY PROGRESS TRACKING
// =============================================================================

/**
 * Calculate comprehensive library progress metrics
 */
export function calculateLibraryProgress(
  patterns: PatternUnit[],
  usageRecords: PatternUsageRecord[],
  testResults: PatternTestResult[]
): LibraryProgressMetrics {
  const activePatterns = patterns.filter(p => p.tier === 'active');

  // Coverage
  const coveredRoles = new Set(patterns.flatMap(p => p.paragraphRoles));
  const coveredIntents = new Set(patterns.flatMap(p => p.intentTags));
  const targetRoles = 12; // Total possible roles
  const targetIntents = 12; // Total possible intents

  const coverageScore = (coveredRoles.size / targetRoles + coveredIntents.size / targetIntents) / 2;

  // Quality
  const patternQualityScores = patterns.map(p => {
    const tests = testResults.filter(t => t.patternId === p.id);
    if (tests.length === 0) return 0.5; // Unknown quality
    return tests.reduce((sum, t) => sum + t.score, 0) / tests.length;
  });

  const averagePatternQuality = patternQualityScores.reduce((a, b) => a + b, 0) / patterns.length;
  const testedPatterns = patterns.filter(p =>
    testResults.some(t => t.patternId === p.id)
  );
  const highQualityPatterns = patterns.filter((p, i) => patternQualityScores[i] >= 0.7);

  // Usage
  const successfulUsages = usageRecords.filter(u => u.outcome === 'success');
  const usageSuccessRate = usageRecords.length > 0
    ? successfulUsages.length / usageRecords.length
    : 0;

  // Trends (would need date-based filtering in real implementation)
  const patternsAddedLast7Days = patterns.filter(p => {
    const created = new Date(p.createdAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return created > sevenDaysAgo;
  }).length;

  // Identify weak areas
  const weakAreas: string[] = [];
  const allRoles = ['opening', 'hook', 'pivot', 'transition', 'definition', 'close'];
  for (const role of allRoles) {
    const count = patterns.filter(p => p.paragraphRoles.includes(role as any)).length;
    if (count < 3) {
      weakAreas.push(`${role} patterns (only ${count})`);
    }
  }

  const nextPriorities = weakAreas.slice(0, 3).map(area =>
    `Add more ${area.split(' ')[0]} patterns`
  );

  return {
    totalPatterns: patterns.length,
    activePatterns: activePatterns.length,
    rolesCovered: coveredRoles.size,
    intentsCovered: coveredIntents.size,
    coverageScore,
    averagePatternQuality,
    testedPatternRatio: patterns.length > 0 ? testedPatterns.length / patterns.length : 0,
    highQualityPatternCount: highQualityPatterns.length,
    totalUsages: usageRecords.length,
    usageSuccessRate,
    patternsAddedLast7Days,
    qualityTrendLast7Days: 'stable', // Simplified
    weakAreas,
    nextPriorities,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - would be more sophisticated in production
  const words = text.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4);

  // Remove common words
  const stopWords = new Set(['about', 'after', 'before', 'could', 'would', 'should', 'their', 'there', 'these', 'those', 'which', 'where', 'while', 'being', 'having', 'doing']);
  return words.filter(w => !stopWords.has(w));
}

function compareContours(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  // Normalize lengths by resampling
  const maxLen = Math.max(a.length, b.length);
  const normalizedA = resampleContour(a, maxLen);
  const normalizedB = resampleContour(b, maxLen);

  // Calculate correlation
  const avgA = normalizedA.reduce((s, v) => s + v, 0) / maxLen;
  const avgB = normalizedB.reduce((s, v) => s + v, 0) / maxLen;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < maxLen; i++) {
    const diffA = normalizedA[i] - avgA;
    const diffB = normalizedB[i] - avgB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  if (denomA === 0 || denomB === 0) return 0;
  return Math.max(0, numerator / Math.sqrt(denomA * denomB));
}

function resampleContour(contour: number[], targetLen: number): number[] {
  if (contour.length === targetLen) return contour;

  const result: number[] = [];
  for (let i = 0; i < targetLen; i++) {
    const srcIndex = (i / (targetLen - 1)) * (contour.length - 1);
    const lower = Math.floor(srcIndex);
    const upper = Math.min(lower + 1, contour.length - 1);
    const t = srcIndex - lower;
    result.push(contour[lower] * (1 - t) + contour[upper] * t);
  }
  return result;
}

function computePatternSimilarity(a: PatternUnit, b: PatternUnit): number {
  // Compare templates
  const templateSim = wordOverlapSimilarity(a.template, b.template);

  // Compare roles
  const roleOverlap = a.paragraphRoles.filter(r => b.paragraphRoles.includes(r)).length /
    Math.max(a.paragraphRoles.length, b.paragraphRoles.length, 1);

  // Compare intents
  const intentOverlap = a.intentTags.filter(i => b.intentTags.includes(i)).length /
    Math.max(a.intentTags.length, b.intentTags.length, 1);

  // Same family?
  const familySame = a.family && b.family && a.family === b.family ? 1 : 0;

  return templateSim * 0.5 + roleOverlap * 0.2 + intentOverlap * 0.2 + familySame * 0.1;
}

function wordOverlapSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function canApplyPattern(pattern: PatternUnit, content: string): boolean {
  // Check if content has similar structural characteristics
  const contentRhythm = analyzeRhythm(content);

  // Similar length range?
  const patternLength = pattern.rhythmProfile.wordCount;
  const contentLength = contentRhythm.wordCount;
  const lengthRatio = Math.min(patternLength, contentLength) / Math.max(patternLength, contentLength);

  return lengthRatio > 0.3;
}

function countStructuralPatterns(text: string): number {
  let count = 0;

  // Check for common structural patterns
  if (/—/.test(text)) count++; // Em-dash
  if (/:/.test(text)) count++; // Colon reveal
  if (/\bbut\b/i.test(text)) count++; // Reversal
  if (/\?.*[A-Z]/.test(text)) count++; // Question-answer
  if (/[^.]+\.[^.]+\.[^.]+\./.test(text)) count++; // Multiple short sentences

  return count;
}

function estimateCadenceStrength(text: string): number {
  const cadence = analyzeCadenceContour(text);
  return cadence.archetypeConfidence;
}

function estimateEngagement(text: string): number {
  let score = 0.5;

  // Questions increase engagement
  const questionCount = (text.match(/\?/g) || []).length;
  score += Math.min(0.2, questionCount * 0.1);

  // Strong verbs
  const strongVerbs = /\b(smash|crush|rocket|explode|transform|ignite|surge)\b/gi;
  if (strongVerbs.test(text)) score += 0.1;

  // Direct address (you)
  if (/\byou\b/i.test(text)) score += 0.1;

  // Variety in sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length >= 2) {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const hasVariety = Math.max(...lengths) / Math.min(...lengths) > 1.5;
    if (hasVariety) score += 0.1;
  }

  return Math.min(1, score);
}

function estimateClarity(text: string, rhythm: RhythmProfile): number {
  let score = 0.5;

  // Shorter average sentences = clearer
  if (rhythm.avgWordsPerSentence < 15) score += 0.2;
  else if (rhythm.avgWordsPerSentence > 25) score -= 0.2;

  // Fewer commas per sentence = simpler
  const commasPerSentence = rhythm.punctuationProfile.commas / rhythm.sentenceCount;
  if (commasPerSentence < 2) score += 0.1;
  else if (commasPerSentence > 4) score -= 0.1;

  // Active voice markers
  if (!/\bwas\b.*\bby\b|\bwere\b.*\bby\b/i.test(text)) score += 0.1;

  return Math.max(0, Math.min(1, score));
}

export {
  extractKeywords,
  compareContours,
  computePatternSimilarity,
};
