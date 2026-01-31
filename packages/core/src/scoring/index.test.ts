/**
 * Tests for Candidate Scoring Pipeline
 */

import { describe, it, expect } from 'vitest';
import {
  detectCliches,
  detectAITells,
  detectFamily,
  detectIntents,
  detectRoles,
  extractTemplate,
  scoreIntentMatch,
  scoreNovelty,
  scoreAntiCliche,
  scoreRhythmQuality,
  generateCandidate,
} from './index.js';
import { analyzeRhythm } from '../analysis/rhythm.js';
import type { MiningQuery, UserPreferences, RejectionReason } from '../types/index.js';

describe('Cliché Detection', () => {
  it('should detect common clichés', () => {
    const text = 'At the end of the day, we need to think outside the box.';
    const cliches = detectCliches(text);

    expect(cliches).toContain('at the end of the day');
    expect(cliches).toContain('think outside the box');
  });

  it('should return empty for clean text', () => {
    const text = 'The strategy requires clear priorities and disciplined execution.';
    const cliches = detectCliches(text);

    expect(cliches).toHaveLength(0);
  });
});

describe('AI Tell Detection', () => {
  it('should detect AI writing tells', () => {
    const text = "Let's dive into the intricacies of this multifaceted problem.";
    const tells = detectAITells(text);

    expect(tells.length).toBeGreaterThan(0);
    expect(tells.some(t => t.toLowerCase().includes('dive'))).toBe(true);
  });

  it('should detect multiple tells', () => {
    const text = "It's important to note that, interestingly, this is a nuanced issue.";
    const tells = detectAITells(text);

    expect(tells.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Family Detection', () => {
  it('should detect negation_pivot', () => {
    const text = "The problem isn't resources—it's coordination.";
    const family = detectFamily(text);

    expect(family).toBe('negation_pivot');
  });

  it('should detect colon_reveal', () => {
    const text = "Here's what nobody tells you: the hardest part is starting.";
    const family = detectFamily(text);

    expect(family).toBe('colon_reveal');
  });

  it('should detect question_answer', () => {
    const text = 'Why did it fail? Because nobody owned it.';
    const family = detectFamily(text);

    expect(family).toBe('question_answer');
  });

  it('should detect reversal_but', () => {
    const text = 'I expected success, but something else happened.';
    const family = detectFamily(text);

    expect(family).toBe('reversal_but');
  });
});

describe('Intent Detection', () => {
  it('should detect hook intent', () => {
    const text = 'What if everything you knew was wrong?';
    const rhythm = analyzeRhythm(text);
    const intents = detectIntents(text, rhythm);

    expect(intents).toContain('hook');
  });

  it('should detect pivot intent', () => {
    const text = 'But here is what changed everything.';
    const rhythm = analyzeRhythm(text);
    const intents = detectIntents(text, rhythm);

    expect(intents).toContain('pivot');
  });

  it('should detect crystallization intent', () => {
    const text = 'Strategy is saying no.';
    const rhythm = analyzeRhythm(text);
    const intents = detectIntents(text, rhythm);

    expect(intents).toContain('crystallization');
  });
});

describe('Role Detection', () => {
  it('should detect definition role', () => {
    const text = 'Trust is the ultimate efficiency.';
    const rhythm = analyzeRhythm(text);
    const roles = detectRoles(text, rhythm);

    expect(roles).toContain('definition');
  });

  it('should detect evidence role', () => {
    const text = 'Research shows that 80% of teams struggle with this.';
    const rhythm = analyzeRhythm(text);
    const roles = detectRoles(text, rhythm);

    expect(roles).toContain('evidence');
  });
});

describe('Template Extraction', () => {
  it('should replace proper nouns with placeholders', () => {
    const text = 'John Smith leads the initiative at Google.';
    const template = extractTemplate(text);

    expect(template).toContain('[Name]');
    expect(template).not.toContain('John');
  });

  it('should replace numbers with placeholders', () => {
    const text = 'The project took 6 months and cost $5000.';
    const template = extractTemplate(text);

    expect(template).toContain('[N]');
    expect(template).not.toContain('6');
  });
});

describe('Intent Match Scoring', () => {
  it('should score high for matching intent', () => {
    const query: MiningQuery = { intent: 'hook' };
    const candidate = {
      predictedIntents: ['hook', 'frame'] as const,
      predictedRoles: ['opening'] as const,
    };

    const score = scoreIntentMatch(candidate as any, query);
    expect(score).toBeGreaterThan(0.7);
  });

  it('should score lower for non-matching intent', () => {
    const query: MiningQuery = { intent: 'hook' };
    const candidate = {
      predictedIntents: ['summarize'] as const,
      predictedRoles: ['close'] as const,
    };

    const score = scoreIntentMatch(candidate as any, query);
    expect(score).toBeLessThan(0.5);
  });

  it('should give partial credit for related intents', () => {
    const query: MiningQuery = { intent: 'hook' };
    const candidate = {
      predictedIntents: ['frame'] as const, // Related to hook
      predictedRoles: ['opening'] as const,
    };

    const score = scoreIntentMatch(candidate as any, query);
    expect(score).toBeGreaterThan(0.3);
    expect(score).toBeLessThan(1.0);
  });
});

describe('Novelty Scoring', () => {
  it('should score high for novel patterns', () => {
    const candidate = { template: 'This is a completely unique pattern.' };
    const existingPatterns: any[] = [];
    const recentFingerprints: string[] = [];

    const score = scoreNovelty(candidate, existingPatterns, recentFingerprints);
    expect(score).toBe(1);
  });

  it('should score low for duplicate fingerprints', () => {
    const template = 'Duplicate pattern here.';
    const candidate = { template };
    const recentFingerprints = [template];

    const score = scoreNovelty(candidate, [], recentFingerprints);
    expect(score).toBeLessThan(0.3);
  });
});

describe('Anti-Cliché Scoring', () => {
  it('should score high for clean text', () => {
    const candidate = { text: 'The strategy requires focus.' };
    const preferences: Partial<UserPreferences> = {
      bannedPhrases: [],
      dislikedTells: [],
    };

    const score = scoreAntiCliche(candidate, [], preferences as UserPreferences);
    expect(score).toBeGreaterThan(0.8);
  });

  it('should penalize clichés', () => {
    const candidate = { text: 'At the end of the day, we move the needle.' };
    const preferences: Partial<UserPreferences> = {
      bannedPhrases: ['at the end of the day', 'move the needle'],
      dislikedTells: [],
    };

    const score = scoreAntiCliche(candidate, [], preferences as UserPreferences);
    expect(score).toBeLessThan(0.7);
  });
});

describe('Rhythm Quality Scoring', () => {
  it('should score higher for text with punctuation variety', () => {
    const candidate = {
      rhythmProfile: {
        wordCount: 15,
        avgWordsPerSentence: 15,
        clauseCount: 2,
        punctuationProfile: {
          emDashes: 1,
          colons: 1,
          periods: 1,
          commas: 0,
          semicolons: 0,
          questionMarks: 0,
          exclamationMarks: 0,
          parentheses: 0,
          ellipses: 0,
        },
      },
    };

    const score = scoreRhythmQuality(candidate as any);
    expect(score).toBeGreaterThan(0.6);
  });

  it('should penalize very long sentences', () => {
    const candidate = {
      rhythmProfile: {
        wordCount: 40,
        avgWordsPerSentence: 40,
        clauseCount: 5,
        punctuationProfile: {
          periods: 1,
          commas: 4,
          semicolons: 0,
          colons: 0,
          emDashes: 0,
          questionMarks: 0,
          exclamationMarks: 0,
          parentheses: 0,
          ellipses: 0,
        },
      },
    };

    const score = scoreRhythmQuality(candidate as any);
    expect(score).toBeLessThan(0.6);
  });
});

describe('Candidate Generation', () => {
  it('should generate a complete candidate', () => {
    const text = "The problem isn't resources—it's coordination.";
    const context = {
      query: { intent: 'reframe' as const },
      preferences: {
        defaultAudience: ['essay'] as const,
        preferredSentenceLengthRange: [8, 25] as [number, number],
        preferredCadenceArchetypes: [],
        dislikedCadenceArchetypes: [],
        favoredFamilies: [],
        dislikedFamilies: [],
        bannedPhrases: [],
        dislikedTells: [],
        dislikedFailureModes: [],
        totalAccepted: 0,
        totalRejected: 0,
        rejectionReasonCounts: {} as Record<RejectionReason, number>,
        lastUpdated: new Date().toISOString(),
      } as UserPreferences,
      existingPatterns: [],
      rejectedPatterns: [],
      recentFingerprints: [],
    };

    const candidate = generateCandidate(text, null, 'paste', context);

    expect(candidate.id).toBeDefined();
    expect(candidate.text).toBe(text);
    expect(candidate.template).toBeDefined();
    expect(candidate.type).toBe('SPU');
    expect(candidate.rhythmProfile).toBeDefined();
    expect(candidate.score).toBeDefined();
    expect(candidate.score.total).toBeGreaterThan(0);
    expect(candidate.whyItWorks).toBeDefined();
    expect(candidate.whyItMightFail).toBeDefined();
  });
});
