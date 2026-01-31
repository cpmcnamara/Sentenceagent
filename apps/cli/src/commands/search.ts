/**
 * Search Command
 *
 * Search and browse the pattern library.
 */

import chalk from 'chalk';

import {
  createStorage,
  SearchQuery,
  PatternType,
  PatternTier,
  ParagraphRole,
  IntentTag,
  CadenceArchetype,
  SentenceFamily,
  Audience,
} from '@rhythm-miner/core';

import { displayPattern, displayLibraryStats } from '../ui/display.js';

export interface SearchOptions {
  intent?: string;
  role?: string;
  cadence?: string;
  audience?: string;
  family?: string;
  type?: string;
  tier?: string;
  limit?: number;
}

export async function search(options: SearchOptions): Promise<void> {
  const storage = createStorage();

  const query: SearchQuery = {};

  if (options.intent) query.intent = options.intent as IntentTag;
  if (options.role) query.role = options.role as ParagraphRole;
  if (options.cadence) query.cadence = options.cadence.replace(/-/g, '_') as CadenceArchetype;
  if (options.audience) query.audience = options.audience as Audience;
  if (options.family) query.family = options.family.replace(/-/g, '_') as SentenceFamily;
  if (options.type) query.type = options.type.toUpperCase() as PatternType;
  if (options.tier) query.tier = options.tier as PatternTier;
  query.limit = options.limit || 10;

  // Check if any filters
  const hasFilters = Object.keys(query).length > 1; // limit doesn't count

  if (!hasFilters) {
    // Show library stats instead
    const stats = storage.getLibraryStats();
    console.log(displayLibraryStats(stats));
    storage.close();
    return;
  }

  const results = storage.searchPatterns(query);

  if (results.length === 0) {
    console.log(chalk.yellow('\nNo patterns found matching your criteria.\n'));
    console.log(chalk.gray('Try:'));
    console.log(chalk.gray('  search --role opening'));
    console.log(chalk.gray('  search --intent hook'));
    console.log(chalk.gray('  search --family negation-pivot'));
    storage.close();
    return;
  }

  console.log(chalk.cyan(`\nFound ${results.length} pattern(s):\n`));

  for (const result of results) {
    console.log(displayPattern(result.pattern));
    console.log('');
  }

  storage.close();
}

export async function showPattern(patternId: string): Promise<void> {
  const storage = createStorage();
  const pattern = storage.getPattern(patternId);

  if (!pattern) {
    console.log(chalk.red(`Pattern not found: ${patternId}`));
    storage.close();
    return;
  }

  console.log(displayPattern(pattern));
  storage.close();
}

export async function stats(): Promise<void> {
  const storage = createStorage();
  const libraryStats = storage.getLibraryStats();
  console.log(displayLibraryStats(libraryStats));
  storage.close();
}

export async function promote(patternId: string): Promise<void> {
  const storage = createStorage();
  const success = storage.promotePattern(patternId);

  if (success) {
    console.log(chalk.green(`Promoted ${patternId} to active tier.`));
  } else {
    console.log(chalk.red(`Pattern not found: ${patternId}`));
  }

  storage.close();
}

export async function demote(patternId: string): Promise<void> {
  const storage = createStorage();
  const success = storage.demotePattern(patternId);

  if (success) {
    console.log(chalk.yellow(`Demoted ${patternId} to archive tier.`));
  } else {
    console.log(chalk.red(`Pattern not found: ${patternId}`));
  }

  storage.close();
}

export default search;
