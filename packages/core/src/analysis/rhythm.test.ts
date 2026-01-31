/**
 * Tests for Rhythm Analysis
 */

import { describe, it, expect } from 'vitest';
import {
  estimateSyllables,
  estimateTotalSyllables,
  analyzePunctuation,
  estimateClauses,
  categorizeSentenceLength,
  splitIntoSentences,
  analyzeRhythm,
  analyzeCadenceContour,
  classifyCadence,
  detectPatternType,
} from './rhythm.js';

describe('Syllable Estimation', () => {
  it('should estimate syllables for simple words', () => {
    expect(estimateSyllables('cat')).toBe(1);
    expect(estimateSyllables('hello')).toBe(2);
    expect(estimateSyllables('beautiful')).toBe(4);
    expect(estimateSyllables('communication')).toBe(5);
  });

  it('should handle silent e', () => {
    expect(estimateSyllables('made')).toBe(1);
    expect(estimateSyllables('create')).toBe(2);
  });

  it('should estimate total syllables for text', () => {
    const text = 'The quick brown fox';
    expect(estimateTotalSyllables(text)).toBeGreaterThan(3);
  });
});

describe('Punctuation Analysis', () => {
  it('should count punctuation marks', () => {
    const text = 'Hello, world! How are you? I am—fine.';
    const profile = analyzePunctuation(text);

    expect(profile.periods).toBe(1);
    expect(profile.commas).toBe(1);
    expect(profile.questionMarks).toBe(1);
    expect(profile.exclamationMarks).toBe(1);
    expect(profile.emDashes).toBe(1);
  });

  it('should handle colons and semicolons', () => {
    const text = 'Here is the truth: it works; it always has.';
    const profile = analyzePunctuation(text);

    expect(profile.colons).toBe(1);
    expect(profile.semicolons).toBe(1);
  });
});

describe('Clause Estimation', () => {
  it('should detect single clause', () => {
    expect(estimateClauses('The cat sat on the mat.')).toBe(1);
  });

  it('should detect multiple clauses with conjunctions', () => {
    expect(estimateClauses('The cat sat and the dog ran.')).toBe(2);
  });

  it('should detect clauses with subordinating conjunctions', () => {
    expect(estimateClauses('When the sun sets, the stars appear.')).toBe(2);
  });

  it('should handle complex sentences', () => {
    const sentence = 'Although it was raining, we went outside, but we got wet.';
    expect(estimateClauses(sentence)).toBeGreaterThanOrEqual(3);
  });
});

describe('Sentence Length Categorization', () => {
  it('should categorize short sentences', () => {
    expect(categorizeSentenceLength(5)).toBe('short');
    expect(categorizeSentenceLength(8)).toBe('short');
  });

  it('should categorize medium sentences', () => {
    expect(categorizeSentenceLength(12)).toBe('medium');
    expect(categorizeSentenceLength(18)).toBe('medium');
  });

  it('should categorize long sentences', () => {
    expect(categorizeSentenceLength(25)).toBe('long');
    expect(categorizeSentenceLength(30)).toBe('long');
  });

  it('should categorize extended sentences', () => {
    expect(categorizeSentenceLength(35)).toBe('extended');
  });
});

describe('Sentence Splitting', () => {
  it('should split simple sentences', () => {
    const text = 'Hello world. How are you? I am fine!';
    const sentences = splitIntoSentences(text);

    expect(sentences).toHaveLength(3);
    expect(sentences[0]).toBe('Hello world.');
    expect(sentences[1]).toBe('How are you?');
    expect(sentences[2]).toBe('I am fine!');
  });

  it('should handle abbreviations', () => {
    const text = 'Dr. Smith works at the hospital. He is great.';
    const sentences = splitIntoSentences(text);

    expect(sentences).toHaveLength(2);
  });
});

describe('Rhythm Profile Analysis', () => {
  it('should analyze simple text', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const profile = analyzeRhythm(text);

    expect(profile.wordCount).toBe(9);
    expect(profile.sentenceCount).toBe(1);
    expect(profile.avgWordsPerSentence).toBe(9);
    expect(profile.lengthCategory).toBe('medium');
  });

  it('should analyze multi-sentence text', () => {
    const text = 'Short one. This is a medium length sentence here. And another.';
    const profile = analyzeRhythm(text);

    expect(profile.sentenceCount).toBe(3);
  });
});

describe('Cadence Classification', () => {
  it('should detect crescendo-snap pattern', () => {
    const contour = [4, 5, 10, 15, 3];
    const result = classifyCadence(contour);

    expect(result.archetype).toBe('crescendo_snap');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect staccato pattern', () => {
    const contour = [4, 5, 3, 4, 5];
    const result = classifyCadence(contour);

    expect(result.archetype).toBe('staccato');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should detect punch-punch-land pattern', () => {
    const contour = [4, 5, 18];
    const result = classifyCadence(contour);

    expect(result.archetype).toBe('punch_punch_land');
  });
});

describe('Cadence Contour Analysis', () => {
  it('should analyze paragraph cadence', () => {
    const text = 'Short setup. Another short. This is a much longer sentence that builds up. Snap.';
    const contour = analyzeCadenceContour(text);

    expect(contour.totalSentences).toBe(4);
    expect(contour.lengthContour).toHaveLength(4);
    expect(contour.archetype).toBeDefined();
  });

  it('should identify hinge sentence', () => {
    const text = 'Start small. Build up. This is the peak of the paragraph where everything comes together. Back down.';
    const contour = analyzeCadenceContour(text);

    expect(contour.hingeSentenceIndex).toBe(2);
  });
});

describe('Pattern Type Detection', () => {
  it('should detect single sentence as SPU', () => {
    const text = 'This is a single sentence.';
    const result = detectPatternType(text);

    expect(result.type).toBe('SPU');
    expect(result.confidence).toBe(1.0);
  });

  it('should detect multi-sentence with rhythm as CPU', () => {
    const text = 'Short one. Another short. Much longer sentence here. Snap.';
    const result = detectPatternType(text);

    expect(result.type).toBe('CPU');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect parallel structure as CPU', () => {
    const text = 'We came. We saw. We conquered.';
    const result = detectPatternType(text);

    expect(result.type).toBe('CPU');
  });
});
