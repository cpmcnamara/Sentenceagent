/**
 * Mine Command
 *
 * The core interactive mining loop. Handles:
 * - Intent-targeted mining
 * - Candidate presentation
 * - Accept/Reject/Skip/Merge workflow
 * - Quick mode and detail mode
 * - Session tracking and preference learning
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as readline from 'readline';

import {
  createStorage,
  PatternStorage,
  generateCandidate,
  Candidate,
  PatternUnit,
  SPU,
  CPU,
  RejectedPattern,
  MiningQuery,
  UserPreferences,
  RejectionReason,
  ScoringContext,
  SentenceFamily,
  ParagraphRole,
  IntentTag,
  CadenceArchetype,
  analyzeRhythm,
  analyzeCadenceContour,
  detectPatternType,
} from '@rhythm-miner/core';

import { FirecrawlClient, processText, createClient } from '@rhythm-miner/firecrawl';

import {
  displayCandidate,
  displayActionBar,
  displayRejectionReasons,
  mapRejectionKey,
  displaySessionProgress,
  displaySessionSummary,
  displayHelp,
} from '../ui/display.js';

// =============================================================================
// TYPES
// =============================================================================

export interface MineOptions {
  role?: string;
  intent?: string;
  audience?: string;
  metaphor?: string;
  compression?: string;
  heat?: string;
  cadence?: string;
  source?: string;
  paste?: boolean;
  quick?: boolean;
  init?: boolean;
}

interface MiningState {
  sessionId: string;
  query: MiningQuery;
  preferences: UserPreferences;
  storage: PatternStorage;
  candidates: Candidate[];
  currentIndex: number;
  accepted: number;
  rejected: number;
  skipped: number;
  merged: number;
  recentFingerprints: string[];
  quickMode: boolean;
  running: boolean;
}

// =============================================================================
// MAIN MINING FUNCTION
// =============================================================================

export async function mine(options: MineOptions): Promise<void> {
  const storage = createStorage();

  // Handle init
  if (options.init) {
    console.log(chalk.green('Database initialized successfully.'));
    console.log(`Library path: ${process.env.LIBRARY_PATH || './library'}`);
    console.log(`Database path: ${process.env.DATABASE_PATH || './index/patterns.db'}`);
    storage.close();
    return;
  }

  // Build query from options
  const query: MiningQuery = {};
  if (options.role) query.role = options.role as ParagraphRole;
  if (options.intent) query.intent = options.intent as IntentTag;
  if (options.audience) query.audience = options.audience as any;
  if (options.metaphor) query.metaphor = options.metaphor as any;
  if (options.compression) query.compression = options.compression as any;
  if (options.heat) query.heat = options.heat as any;
  if (options.cadence) query.cadence = options.cadence.replace(/-/g, '_') as CadenceArchetype;
  if (options.source) query.sourceUrl = options.source;

  const preferences = storage.loadPreferences();
  const sessionId = storage.createSession(query as unknown as Record<string, unknown>);

  // Get text to mine from
  let textToMine: string[] = [];

  const spinner = ora('Preparing mining session...').start();

  try {
    if (options.paste) {
      spinner.stop();
      const { text } = await inquirer.prompt([{
        type: 'editor',
        name: 'text',
        message: 'Paste text to mine (opens editor):',
      }]);
      const extracted = processText(text);
      textToMine = [...extracted.sentences, ...extracted.paragraphs];
      spinner.start('Processing pasted text...');
    } else if (options.source) {
      spinner.text = `Fetching ${options.source}...`;
      const client = createClient();
      const result = await client.scrapeUrl(options.source);
      if (result.success) {
        textToMine = [...result.sentences, ...result.paragraphs];
        storage.incrementSourceFetch(options.source, textToMine.length);
      } else {
        spinner.fail(`Failed to fetch: ${result.error}`);
        storage.close();
        return;
      }
    } else {
      // Use stored sources
      spinner.text = 'Loading from source roster...';
      const sources = storage.getAllSources().filter(s => s.status === 'active');

      if (sources.length === 0) {
        spinner.warn('No sources configured. Use --paste or add sources with: sources add <url>');
        storage.close();
        return;
      }

      const client = createClient();
      for (const source of sources.slice(0, 3)) { // Limit to 3 sources per session
        try {
          const result = await client.scrapeUrl(source.url);
          if (result.success) {
            textToMine.push(...result.sentences, ...result.paragraphs);
            storage.incrementSourceFetch(source.url, result.sentences.length);
          }
        } catch (err) {
          // Skip failed sources
        }
      }
    }

    if (textToMine.length === 0) {
      spinner.fail('No text found to mine.');
      storage.close();
      return;
    }

    spinner.succeed(`Found ${textToMine.length} potential patterns to evaluate.`);

  } catch (err) {
    spinner.fail(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    storage.close();
    return;
  }

  // Generate candidates
  const existingPatterns = storage.getAllPatterns();
  const rejectedPatterns = storage.getRecentRejectedPatterns(100);

  const scoringContext: ScoringContext = {
    query,
    preferences,
    existingPatterns,
    rejectedPatterns,
    recentFingerprints: [],
  };

  const candidates = textToMine
    .filter(text => text.length >= 20 && text.length <= 500)
    .map(text => generateCandidate(
      text,
      options.source || null,
      options.source ? 'url' : 'paste',
      scoringContext
    ))
    .sort((a, b) => b.score.total - a.score.total);

  if (candidates.length === 0) {
    console.log(chalk.yellow('No suitable candidates found.'));
    storage.close();
    return;
  }

  console.log(chalk.cyan(`\n${candidates.length} candidates scored and ranked.\n`));

  // Start interactive session
  const state: MiningState = {
    sessionId,
    query,
    preferences,
    storage,
    candidates,
    currentIndex: 0,
    accepted: 0,
    rejected: 0,
    skipped: 0,
    merged: 0,
    recentFingerprints: [],
    quickMode: options.quick || false,
    running: true,
  };

  await runInteractiveSession(state);
}

// =============================================================================
// INTERACTIVE SESSION
// =============================================================================

async function runInteractiveSession(state: MiningState): Promise<void> {
  // Set up raw mode for hotkeys
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
  }

  console.clear();
  console.log(chalk.cyan.bold('\n🎵 RHYTHM PATTERN MINER\n'));

  if (state.query.intent || state.query.role) {
    console.log(chalk.gray(`Mining for: ${[state.query.role, state.query.intent].filter(Boolean).join(' · ')}`));
  }

  await showCurrentCandidate(state);

  // Main loop
  while (state.running && state.currentIndex < state.candidates.length) {
    const action = await waitForAction(state.quickMode);
    await handleAction(state, action);
  }

  // End session
  state.storage.endSession(state.sessionId);

  // Show summary
  const stats = state.storage.getLibraryStats();
  const suggestions = generateSuggestions(stats);

  console.log(displaySessionSummary(
    {
      accepted: state.accepted,
      rejected: state.rejected,
      skipped: state.skipped,
      merged: state.merged,
    },
    { byRole: stats.byRole, byIntent: stats.byIntent },
    suggestions
  ));

  state.storage.close();

  // Restore terminal
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.exit(0);
}

async function showCurrentCandidate(state: MiningState): Promise<void> {
  if (state.currentIndex >= state.candidates.length) {
    console.log(chalk.yellow('\nNo more candidates to review.'));
    state.running = false;
    return;
  }

  const candidate = state.candidates[state.currentIndex];

  console.clear();
  console.log(displayCandidate(candidate, state.currentIndex + 1));
  console.log('');
  console.log(displaySessionProgress(state.accepted, state.rejected, state.skipped, state.candidates.length));
  console.log('');
  console.log(displayActionBar(state.quickMode));
}

async function waitForAction(quickMode: boolean): Promise<string> {
  return new Promise((resolve) => {
    const handler = (str: string, key: { name: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === 'c') {
        resolve('q');
        return;
      }

      const validKeys = ['a', 'y', 'r', 'n', 's', 'm', 'd', 'q', '?'];
      if (quickMode) {
        validKeys.push('1', '2', '3', '4', '5', '6', '7', '8', '9', '0');
      }

      if (validKeys.includes(key.name) || validKeys.includes(str)) {
        process.stdin.removeListener('keypress', handler);
        resolve(str || key.name);
      }
    };

    process.stdin.on('keypress', handler);
  });
}

async function handleAction(state: MiningState, action: string): Promise<void> {
  switch (action.toLowerCase()) {
    case 'a':
    case 'y':
      await handleAccept(state);
      break;

    case 'r':
    case 'n':
      await handleReject(state);
      break;

    case 's':
      handleSkip(state);
      break;

    case 'm':
      await handleMerge(state);
      break;

    case 'd':
      await handleDetail(state);
      break;

    case 'q':
      state.running = false;
      console.log(chalk.yellow('\nEnding session...'));
      break;

    case '?':
      console.log(displayHelp());
      await waitForAnyKey();
      await showCurrentCandidate(state);
      break;

    default:
      // Ignore unknown keys
      break;
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

async function handleAccept(state: MiningState): Promise<void> {
  const candidate = state.candidates[state.currentIndex];

  // Quick confirm tags
  let confirmedRoles = candidate.predictedRoles;
  let confirmedIntents = candidate.predictedIntents;

  if (!state.quickMode) {
    console.log(chalk.cyan('\nConfirm tags (press Enter to accept defaults):'));

    const { roles } = await inquirer.prompt([{
      type: 'input',
      name: 'roles',
      message: `Roles [${candidate.predictedRoles.join(', ')}]:`,
      default: candidate.predictedRoles.join(', '),
    }]);

    const { intents } = await inquirer.prompt([{
      type: 'input',
      name: 'intents',
      message: `Intents [${candidate.predictedIntents.join(', ')}]:`,
      default: candidate.predictedIntents.join(', '),
    }]);

    confirmedRoles = roles.split(',').map((r: string) => r.trim()).filter(Boolean);
    confirmedIntents = intents.split(',').map((i: string) => i.trim()).filter(Boolean);
  }

  // Create pattern
  const pattern = createPatternFromCandidate(candidate, confirmedRoles, confirmedIntents);

  // Check for duplicates
  const existing = state.storage.checkFingerprint(pattern.fingerprint);
  if (existing.exists) {
    console.log(chalk.yellow('\n⚠️  Similar pattern already exists. Skipping.'));
    state.skipped++;
    state.currentIndex++;
    await showCurrentCandidate(state);
    return;
  }

  // Save pattern
  state.storage.savePattern(pattern);
  state.storage.updatePreferencesOnAccept(pattern);
  state.storage.updateSession(state.sessionId, { accepted: 1 });

  state.recentFingerprints.push(pattern.fingerprint);
  state.accepted++;
  state.currentIndex++;

  console.log(chalk.green(`\n✓ Accepted: ${pattern.id}`));
  await delay(300);

  await showCurrentCandidate(state);
}

async function handleReject(state: MiningState): Promise<void> {
  const candidate = state.candidates[state.currentIndex];

  // Get rejection reason
  console.log('');
  console.log(displayRejectionReasons());

  const reasonKey = await waitForAction(true);
  const reason = mapRejectionKey(reasonKey);

  if (!reason) {
    // Cancelled
    await showCurrentCandidate(state);
    return;
  }

  // Save rejection
  const rejected: RejectedPattern = {
    id: 'rej_' + Date.now().toString(36),
    originalText: candidate.text,
    template: candidate.template,
    fingerprint: candidate.template, // Simple fingerprint
    rejectionReason: reason as RejectionReason,
    rejectionNotes: '',
    rejectedAt: new Date().toISOString(),
    sourceUrl: candidate.sourceUrl,
  };

  state.storage.saveRejectedPattern(rejected);
  state.storage.updatePreferencesOnReject(reason as RejectionReason, candidate.template);
  state.storage.updateSession(state.sessionId, { rejected: 1 });

  state.rejected++;
  state.currentIndex++;

  console.log(chalk.red(`\n✗ Rejected: ${reason.replace(/_/g, ' ')}`));
  await delay(300);

  await showCurrentCandidate(state);
}

function handleSkip(state: MiningState): void {
  state.storage.updateSession(state.sessionId, { skipped: 1 });
  state.skipped++;
  state.currentIndex++;
  showCurrentCandidate(state);
}

async function handleMerge(state: MiningState): Promise<void> {
  const candidate = state.candidates[state.currentIndex];

  // Find similar patterns
  const similar = state.storage.findSimilarPatterns(candidate.template, 0.5);

  if (similar.length === 0) {
    console.log(chalk.yellow('\nNo similar patterns found to merge with.'));
    await waitForAnyKey();
    await showCurrentCandidate(state);
    return;
  }

  console.log(chalk.cyan('\nSimilar patterns found:'));
  const choices = similar.slice(0, 5).map((match, i) => ({
    name: `${match.pattern.id} (${(match.similarity * 100).toFixed(0)}% similar): ${match.pattern.template.slice(0, 50)}...`,
    value: match.pattern.id,
  }));
  choices.push({ name: 'Cancel', value: '' });

  const { mergeWith } = await inquirer.prompt([{
    type: 'list',
    name: 'mergeWith',
    message: 'Merge with:',
    choices,
  }]);

  if (!mergeWith) {
    await showCurrentCandidate(state);
    return;
  }

  // Add as variant (increment evidence count)
  const existingPattern = state.storage.getPattern(mergeWith);
  if (existingPattern) {
    existingPattern.evidenceCount++;
    existingPattern.updatedAt = new Date().toISOString();
    state.storage.savePattern(existingPattern);

    state.storage.updateSession(state.sessionId, { merged: 1 });
    state.merged++;
    state.currentIndex++;

    console.log(chalk.blue(`\n⊕ Merged with ${mergeWith}`));
    await delay(300);
  }

  await showCurrentCandidate(state);
}

async function handleDetail(state: MiningState): Promise<void> {
  const candidate = state.candidates[state.currentIndex];

  console.log(chalk.cyan('\n═══ DETAIL MODE ═══\n'));

  // Intent/job confirmation
  const { purpose } = await inquirer.prompt([{
    type: 'input',
    name: 'purpose',
    message: 'What job does this pattern do? (optional):',
  }]);

  // Allowed contexts
  const { contexts } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'contexts',
    message: 'Suitable contexts:',
    choices: [
      { name: 'Executive communication', value: 'exec' },
      { name: 'Essay/longform', value: 'essay' },
      { name: 'Technical writing', value: 'technical' },
      { name: 'General/any', value: 'general' },
    ],
    default: candidate.predictedAudience,
  }]);

  // Overuse cap
  const { overuseCap } = await inquirer.prompt([{
    type: 'number',
    name: 'overuseCap',
    message: 'Max times to use per piece (0 = no limit):',
    default: 0,
  }]);

  // For CPU: essential elements
  if (candidate.type === 'CPU') {
    const { essential } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'essential',
      message: 'Essential elements of this cadence:',
      choices: [
        { name: 'Crescendo (building intensity)', value: 'crescendo' },
        { name: 'Snap (sharp ending)', value: 'snap' },
        { name: 'Parallelism (repeated structure)', value: 'parallelism' },
        { name: 'Contrast (juxtaposition)', value: 'contrast' },
        { name: 'Repetition (callbacks)', value: 'repetition' },
      ],
    }]);
  }

  console.log(chalk.cyan('\nDetail mode complete. Now choose action:'));
  console.log(displayActionBar(false));

  // Wait for final action
  const action = await waitForAction(false);

  // Store the extra info if accepting
  if (action === 'a' || action === 'y') {
    // Pass through to accept handler with enriched data
    candidate.predictedAudience = contexts;
  }

  await handleAction(state, action);
}

// =============================================================================
// HELPERS
// =============================================================================

function createPatternFromCandidate(
  candidate: Candidate,
  roles: string[],
  intents: string[]
): PatternUnit {
  const now = new Date().toISOString();
  const id = (candidate.type === 'SPU' ? 'spu_' : 'cpu_') + Date.now().toString(36);

  const base = {
    id,
    type: candidate.type,
    tier: 'archive' as const,
    createdAt: now,
    updatedAt: now,
    version: 1,
    template: candidate.template,
    constraints: [],
    exampleSnippet: candidate.text.slice(0, 100),
    family: candidate.predictedFamily,
    paragraphRoles: roles as ParagraphRole[],
    intentTags: intents as IntentTag[],
    cadenceArchetype: candidate.predictedCadence,
    audienceSuitability: candidate.predictedAudience,
    metaphorLevel: 'medium' as const,
    compressionLevel: 'medium' as const,
    heatLevel: 'warm' as const,
    rhythmProfile: candidate.rhythmProfile,
    evidenceCount: 1,
    testsPassed: 0,
    overuseCap: null,
    hardBans: [],
    whyItWorks: candidate.whyItWorks,
    whyItMightFail: candidate.whyItMightFail,
    notes: '',
    fingerprint: candidate.template,
    featureVector: [],
    sourceUrl: candidate.sourceUrl,
    sourceType: candidate.sourceType,
  };

  if (candidate.type === 'CPU' && candidate.cadenceContour) {
    return {
      ...base,
      type: 'CPU',
      cadenceContour: candidate.cadenceContour,
      hingeSentenceTemplate: null,
      essentialElements: [],
    } as CPU;
  }

  return base as SPU;
}

function generateSuggestions(stats: {
  byRole: Record<string, number>;
  byIntent: Record<string, number>;
}): string[] {
  const suggestions: string[] = [];

  const roleGaps: [string, number][] = [
    ['opening', stats.byRole['opening'] || 0],
    ['pivot', stats.byRole['pivot'] || 0],
    ['transition', stats.byRole['transition'] || 0],
    ['close', stats.byRole['close'] || 0],
  ];

  roleGaps.sort((a, b) => a[1] - b[1]);

  if (roleGaps[0][1] < 3) {
    suggestions.push(`You have ${roleGaps[0][1]} ${roleGaps[0][0]} patterns. Try: mine --role ${roleGaps[0][0]}`);
  }

  const intentGaps: [string, number][] = [
    ['hook', stats.byIntent['hook'] || 0],
    ['crystallization', stats.byIntent['crystallization'] || 0],
    ['pivot', stats.byIntent['pivot'] || 0],
  ];

  intentGaps.sort((a, b) => a[1] - b[1]);

  if (intentGaps[0][1] < 3 && suggestions.length < 2) {
    suggestions.push(`Need more ${intentGaps[0][0]} patterns. Try: mine --intent ${intentGaps[0][0]}`);
  }

  return suggestions;
}

async function waitForAnyKey(): Promise<void> {
  console.log(chalk.gray('\nPress any key to continue...'));
  return new Promise((resolve) => {
    const handler = () => {
      process.stdin.removeListener('keypress', handler);
      resolve();
    };
    process.stdin.on('keypress', handler);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default mine;
