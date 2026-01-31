/**
 * Seed Library Script
 *
 * Add some sample patterns to demonstrate the library
 */

import { generateCandidate, PatternStorage } from '@rhythm-miner/core';
import type { MiningQuery, ParagraphRole, IntentTag, SPU, PatternUnit } from '@rhythm-miner/core';

// Sample high-quality sentences to seed the library
const SEED_PATTERNS = [
  {
    text: "The problem isn't resources—it's coordination.",
    role: 'pivot' as ParagraphRole,
    intent: 'reframe' as IntentTag,
    heat: 'warm' as const,
    audiences: ['exec', 'essay'] as const[],
    notes: 'Classic negation pivot. Reframes a complex issue simply.',
  },
  {
    text: "Strategy is saying no.",
    role: 'definition' as ParagraphRole,
    intent: 'crystallization' as IntentTag,
    heat: 'hot' as const,
    audiences: ['exec', 'essay'] as const[],
    notes: 'Punchy definition. Maximum compression.',
  },
  {
    text: "What if everything you knew about productivity was wrong?",
    role: 'opening' as ParagraphRole,
    intent: 'hook' as IntentTag,
    heat: 'warm' as const,
    audiences: ['essay', 'general'] as const[],
    notes: 'Classic hook opener. Creates immediate curiosity.',
  },
  {
    text: "Here's what nobody tells you: the hardest part isn't starting.",
    role: 'hook' as ParagraphRole,
    intent: 'hook' as IntentTag,
    heat: 'warm' as const,
    audiences: ['essay', 'general'] as const[],
    notes: 'Colon reveal pattern. Promise of insider knowledge.',
  },
  {
    text: "Trust is the ultimate efficiency.",
    role: 'definition' as ParagraphRole,
    intent: 'crystallization' as IntentTag,
    heat: 'cool' as const,
    audiences: ['exec', 'essay'] as const[],
    notes: 'Definition-is pattern. Elevates abstract concept.',
  },
  {
    text: "Why did it fail? Because nobody owned it.",
    role: 'pivot' as ParagraphRole,
    intent: 'reframe' as IntentTag,
    heat: 'warm' as const,
    audiences: ['exec', 'essay'] as const[],
    notes: 'Question-answer pattern. Direct cause attribution.',
  },
  {
    text: "The best writing doesn't inform—it transforms.",
    role: 'definition' as ParagraphRole,
    intent: 'crystallization' as IntentTag,
    heat: 'warm' as const,
    audiences: ['essay', 'general'] as const[],
    notes: 'Negation pivot with elevated stakes.',
  },
  {
    text: "Real expertise isn't knowing all the answers. It's knowing which questions matter.",
    role: 'close' as ParagraphRole,
    intent: 'land' as IntentTag,
    heat: 'cool' as const,
    audiences: ['exec', 'essay'] as const[],
    notes: 'Two-part definition. Redefines expertise.',
  },
];

/**
 * Generate a fingerprint from text
 */
function generateFingerprint(text: string): string {
  // Simple fingerprint based on normalized text
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

async function main() {
  console.log('='.repeat(60));
  console.log('SEEDING PATTERN LIBRARY');
  console.log('='.repeat(60));
  console.log('');

  // Initialize storage
  const storage = new PatternStorage('./index/patterns.db', './library');
  const preferences = storage.loadPreferences();

  // Build mining context
  const context = {
    query: {} as MiningQuery,
    preferences,
    existingPatterns: [],
    rejectedPatterns: [],
    recentFingerprints: [] as string[],
  };

  let added = 0;

  for (const seed of SEED_PATTERNS) {
    // Generate candidate with full analysis
    const candidate = generateCandidate(seed.text, null, 'paste', context);
    const now = new Date().toISOString();

    // Convert Candidate to full SPU format
    const pattern: PatternUnit = {
      id: candidate.id,
      type: 'SPU' as const,
      tier: 'active' as const,
      createdAt: now,
      updatedAt: now,
      version: 1,

      // Core content
      template: candidate.template,
      constraints: [],
      exampleSnippet: seed.text,

      // Classification
      family: candidate.predictedFamily,
      paragraphRoles: [seed.role],
      intentTags: [seed.intent],
      cadenceArchetype: candidate.predictedCadence,

      // Audience & style
      audienceSuitability: seed.audiences,
      metaphorLevel: 'medium' as const,
      compressionLevel: seed.text.split(/\s+/).length <= 10 ? 'high' as const : 'medium' as const,
      heatLevel: seed.heat,

      // Rhythm
      rhythmProfile: candidate.rhythmProfile,

      // Quality & usage
      evidenceCount: 1,
      testsPassed: 0,
      overuseCap: null,
      hardBans: [],

      // Annotations
      whyItWorks: candidate.whyItWorks,
      whyItMightFail: candidate.whyItMightFail,
      notes: seed.notes,

      // Fingerprinting
      fingerprint: generateFingerprint(seed.text),
      featureVector: [],

      // Source tracking
      sourceUrl: null,
      sourceType: 'paste' as const,
    };

    try {
      storage.savePattern(pattern);
      storage.incrementAccepted();
      added++;
      console.log(`✓ Added: "${seed.text.slice(0, 50)}..."`);
      console.log(`  Role: ${seed.role}, Intent: ${seed.intent}, Heat: ${seed.heat}`);
      console.log('');
    } catch (e) {
      console.log(`✗ Error: ${e}`);
    }
  }

  console.log('='.repeat(60));
  console.log(`Added ${added} patterns to library.`);
  console.log('');

  // Show count
  const allPatterns = storage.getAllPatterns();
  console.log('LIBRARY STATS:');
  console.log(`Total patterns: ${allPatterns.length}`);
  console.log('');

  // Show by role
  const byRole: Record<string, number> = {};
  for (const p of allPatterns) {
    for (const role of p.paragraphRoles) {
      byRole[role] = (byRole[role] || 0) + 1;
    }
  }
  console.log('BY ROLE:');
  for (const [role, count] of Object.entries(byRole)) {
    console.log(`  ${role}: ${count}`);
  }
}

main().catch(console.error);
