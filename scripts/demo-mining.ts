/**
 * Demo Mining Script
 *
 * Fetches sample texts via Firecrawl and presents candidates for labeling
 */

import { FirecrawlClient, processText } from '@rhythm-miner/firecrawl';
import { generateCandidate, PatternStorage } from '@rhythm-miner/core';
import type { MiningQuery } from '@rhythm-miner/core';

// Sample URLs of well-written essays/articles for mining
const SAMPLE_SOURCES = [
  'https://fs.blog/mental-models/',
  'https://waitbutwhy.com/2014/05/fermi-paradox.html',
];

// Fallback sample text if URL fetching fails
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


async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not set');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('RHYTHM PATTERN MINER - Demo Session');
  console.log('='.repeat(60));
  console.log('');

  // Initialize storage
  const storage = new PatternStorage('./index/patterns.db', './library');
  const preferences = storage.loadPreferences();

  // Create Firecrawl client
  const client = new FirecrawlClient({ apiKey });

  // Try to fetch from URL, fall back to sample text
  let result;
  const url = SAMPLE_SOURCES[0];

  try {
    console.log(`Attempting to fetch content from: ${url}`);
    result = await client.scrapeUrl(url);

    if (!result.success) {
      console.log(`URL fetch failed (${result.error}), using sample text instead.`);
      result = processText(SAMPLE_TEXT);
    } else {
      console.log(`Title: ${result.title}`);
    }
  } catch (e) {
    console.log(`URL fetch error, using sample text instead.`);
    result = processText(SAMPLE_TEXT);
  }

  console.log('');
  console.log(`Extracted: ${result.paragraphs.length} paragraphs, ${result.sentences.length} sentences`);
  console.log('');
  console.log('='.repeat(60));
  console.log('CANDIDATE PATTERNS FOR LABELING');
  console.log('='.repeat(60));
  console.log('');

  // Build mining context
  const context = {
    query: {} as MiningQuery,
    preferences,
    existingPatterns: [],
    rejectedPatterns: [],
    recentFingerprints: [] as string[],
  };

  // Process each sentence and show top candidates
  const candidates = result.sentences
    .slice(0, 30) // Limit to first 30 for demo
    .map((text) => generateCandidate(text, null, 'firecrawl', context))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, 10); // Show top 10 by score

  // Display each candidate
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    console.log(`[Candidate ${i + 1}/${candidates.length}] Score: ${(c.score.total * 100).toFixed(0)}%`);
    console.log('-'.repeat(60));
    console.log('');
    console.log(`"${c.text}"`);
    console.log('');
    console.log('ANALYSIS:');
    console.log(`  Family: ${c.family || 'unknown'}`);
    console.log(`  Intents: ${c.predictedIntents.join(', ') || 'none detected'}`);
    console.log(`  Roles: ${c.predictedRoles.join(', ') || 'none detected'}`);
    console.log(`  Template: ${c.template}`);
    console.log('');
    console.log('RHYTHM:');
    console.log(`  Words: ${c.rhythmProfile.wordCount}`);
    console.log(`  Syllables: ${c.rhythmProfile.syllableCount}`);
    console.log(`  Cadence: ${c.rhythmProfile.cadence || 'undefined'}`);
    console.log(`  Punctuation: em-dashes=${c.rhythmProfile.punctuationProfile.emDashes}, colons=${c.rhythmProfile.punctuationProfile.colons}`);
    console.log('');
    console.log('SCORING:');
    console.log(`  Intent Match: ${(c.score.intentMatch * 100).toFixed(0)}%`);
    console.log(`  Novelty: ${(c.score.novelty * 100).toFixed(0)}%`);
    console.log(`  Anti-cliche: ${(c.score.antiCliche * 100).toFixed(0)}%`);
    console.log(`  Rhythm Quality: ${(c.score.rhythmQuality * 100).toFixed(0)}%`);
    console.log('');
    console.log('WHY IT WORKS:');
    console.log(`  - ${c.whyItWorks}`);
    console.log('');
    console.log('POTENTIAL FAILURE MODES:');
    console.log(`  - ${c.whyItMightFail}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
  }

  console.log('');
  console.log('NEXT STEPS FOR LABELING:');
  console.log('For each candidate above, you would:');
  console.log('');
  console.log('  [A]ccept - Add to library, specify:');
  console.log('    - Role (opening, pivot, transition, close, etc.)');
  console.log('    - Intent (hook, reframe, crystallization, etc.)');
  console.log('    - Audiences (exec, essay, technical)');
  console.log('    - Heat level (cool, warm, hot)');
  console.log('');
  console.log('  [R]eject - Exclude from library, specify reason:');
  console.log('    - too_generic, cliche, weak_rhythm, wrong_tone, etc.');
  console.log('');
  console.log('  [S]kip - Come back to later');
  console.log('');
  console.log('To run interactive mining session:');
  console.log('  npm run mine -- --source "' + url + '"');
  console.log('');
}

main().catch(console.error);
