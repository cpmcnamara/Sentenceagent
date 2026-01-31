/**
 * Interactive Labeling Script
 *
 * Present candidates one at a time and collect user feedback
 */

import * as readline from 'readline';
import { processText } from '@rhythm-miner/firecrawl';
import { generateCandidate, PatternStorage } from '@rhythm-miner/core';
import type { MiningQuery, ParagraphRole, IntentTag, RejectionReason } from '@rhythm-miner/core';

// Sample text for mining
const SAMPLE_TEXT = `
The problem isn't resources—it's coordination.

What if everything you knew about productivity was wrong? Not slightly off, but fundamentally, structurally wrong.

Here's what nobody tells you: the hardest part isn't starting. It's continuing after the initial excitement fades.

Trust is the ultimate efficiency. Without it, every interaction requires verification, every handoff needs documentation, every decision demands consensus.

Strategy is saying no. It's not about what you'll do—it's about the thousand things you won't.

But here's the thing: most advice is survivorship bias dressed up as wisdom.

Why did it fail? Because nobody owned it. Ownership isn't assigned—it's taken.

The best writing doesn't inform—it transforms. It leaves the reader different than it found them.

Success isn't a ladder. It's a jungle gym: you can move sideways, backwards, even down—as long as you're moving toward what matters.

Research shows that 80% of teams struggle with this one thing: not communication itself, but the assumption that communication happened.

I expected chaos, but found a strange kind of order—the order that emerges when everyone knows their piece of the puzzle.

Complexity is easy. Simplicity is hard. The job isn't to add more—it's to find what can be removed.

At some point, you have to stop preparing and start doing. The gap between knowing and doing is where dreams go to die.

The meeting that should have been an email isn't just inefficient—it's a symptom of something deeper: a culture afraid of written commitment.

Real expertise isn't knowing all the answers. It's knowing which questions matter.
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('RHYTHM PATTERN MINER - Interactive Labeling');
  console.log('='.repeat(60));
  console.log('');
  console.log('Commands:');
  console.log('  a/accept  - Accept pattern (will ask for details)');
  console.log('  r/reject  - Reject pattern (will ask for reason)');
  console.log('  s/skip    - Skip for now');
  console.log('  q/quit    - Exit labeling');
  console.log('');

  // Initialize storage
  const storage = new PatternStorage('./index/patterns.db', './library');
  const preferences = storage.loadPreferences();

  // Process sample text
  const result = processText(SAMPLE_TEXT);
  console.log(`Loaded ${result.sentences.length} sentences for labeling.`);
  console.log('');

  // Build mining context
  const context = {
    query: {} as MiningQuery,
    preferences,
    existingPatterns: [],
    rejectedPatterns: [],
    recentFingerprints: [] as string[],
  };

  // Generate candidates
  const candidates = result.sentences
    .map((text) => generateCandidate(text, null, 'paste', context))
    .sort((a, b) => b.score.total - a.score.total);

  let accepted = 0;
  let rejected = 0;
  let skipped = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];

    console.log('='.repeat(60));
    console.log(`[${i + 1}/${candidates.length}] Score: ${(c.score.total * 100).toFixed(0)}%`);
    console.log('='.repeat(60));
    console.log('');
    console.log(`"${c.text}"`);
    console.log('');
    console.log(`Family: ${c.family || c.predictedFamily || 'unknown'}`);
    console.log(`Intents: ${c.predictedIntents.join(', ') || 'none'}`);
    console.log(`Roles: ${c.predictedRoles.join(', ') || 'none'}`);
    console.log(`Words: ${c.rhythmProfile.wordCount}`);
    console.log('');

    const action = await question('Action (a/r/s/q): ');

    if (action === 'q' || action === 'quit') {
      console.log('Exiting labeling session.');
      break;
    }

    if (action === 'a' || action === 'accept') {
      // Get role
      console.log('');
      console.log('Roles: opening, hook, pivot, transition, close, definition, evidence, argument, example, summary');
      const roleInput = await question('Role: ');
      const role = roleInput as ParagraphRole || 'opening';

      // Get intent
      console.log('');
      console.log('Intents: hook, frame, pivot, reframe, crystallization, summarize, build_momentum, create_contrast, establish_authority, land');
      const intentInput = await question('Intent: ');
      const intent = intentInput as IntentTag || 'hook';

      // Get heat
      console.log('');
      console.log('Heat: cool, warm, hot');
      const heatInput = await question('Heat (default: warm): ');
      const heat = heatInput || 'warm';

      // Save to library
      const pattern = {
        ...c,
        assignedRole: role,
        assignedIntents: [intent],
        heat: heat as 'cool' | 'warm' | 'hot',
        tier: 'active' as const,
        audiences: ['essay', 'general'] as const[],
      };

      try {
        storage.savePattern(pattern);
        storage.incrementAccepted();
        accepted++;
        console.log(`\n✓ Pattern saved to library with role=${role}, intent=${intent}, heat=${heat}\n`);
      } catch (e) {
        console.log(`\n✗ Error saving pattern: ${e}\n`);
      }
    } else if (action === 'r' || action === 'reject') {
      console.log('');
      console.log('Reasons: too_generic, cliche, weak_rhythm, wrong_tone, context_dependent, overused_family, poor_compression, unclear_intent, style_mismatch');
      const reasonInput = await question('Reason: ');
      const reason = (reasonInput || 'too_generic') as RejectionReason;

      storage.incrementRejected(reason);
      rejected++;
      console.log(`\n✗ Pattern rejected (${reason})\n`);
    } else {
      skipped++;
      console.log('\n→ Skipped\n');
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SESSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Accepted: ${accepted}`);
  console.log(`Rejected: ${rejected}`);
  console.log(`Skipped: ${skipped}`);
  console.log('');

  // Show library stats
  const stats = storage.getStats();
  console.log('LIBRARY STATS:');
  console.log(`Total patterns: ${stats.totalPatterns}`);
  console.log(`Active patterns: ${stats.activeTierCount}`);
  console.log('');

  rl.close();
}

main().catch(console.error);
