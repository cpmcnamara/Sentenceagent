#!/usr/bin/env node

/**
 * Rhythm-Aware Pattern Miner CLI
 *
 * A local-first, intention-driven mining tool for building
 * sentence and cadence-paragraph pattern libraries.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { mine, MineOptions } from './commands/mine.js';
import { search, showPattern, stats, promote, demote, SearchOptions } from './commands/search.js';
import sources from './commands/sources.js';
import { displayHelp } from './ui/display.js';

const program = new Command();

program
  .name('rhythm-miner')
  .description('A rhythm-aware pattern mining tool for building sentence and cadence-paragraph libraries')
  .version('1.0.0');

// =============================================================================
// MINE COMMAND
// =============================================================================

program
  .command('mine')
  .description('Start an interactive mining session')
  .option('--role <role>', 'Paragraph role (opening, pivot, transition, close, etc.)')
  .option('--intent <intent>', 'Intent tag (hook, reframe, crystallization, etc.)')
  .option('--audience <audience>', 'Target audience (exec, essay, technical, general)')
  .option('--metaphor <level>', 'Metaphor tolerance (low, medium, high)')
  .option('--compression <level>', 'Compression level (low, medium, high)')
  .option('--heat <level>', 'Energy/heat level (cool, warm, hot)')
  .option('--cadence <type>', 'Cadence archetype (crescendo-snap, staccato, wave, etc.)')
  .option('--source <url>', 'Mine from specific URL')
  .option('--paste', 'Mine from pasted text')
  .option('--quick', 'Quick mode (hotkeys only, minimal prompts)')
  .option('--init', 'Initialize the database')
  .action(async (options: MineOptions) => {
    try {
      await mine(options);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// =============================================================================
// SEARCH COMMAND
// =============================================================================

program
  .command('search')
  .description('Search the pattern library')
  .option('--intent <intent>', 'Filter by intent tag')
  .option('--role <role>', 'Filter by paragraph role')
  .option('--cadence <type>', 'Filter by cadence archetype')
  .option('--audience <audience>', 'Filter by audience')
  .option('--family <family>', 'Filter by sentence family')
  .option('--type <type>', 'Filter by type (spu, cpu)')
  .option('--tier <tier>', 'Filter by tier (active, archive)')
  .option('--limit <n>', 'Max results', '10')
  .action(async (options: SearchOptions) => {
    try {
      await search(options);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// =============================================================================
// SHOW COMMAND
// =============================================================================

program
  .command('show <pattern_id>')
  .description('Show details of a specific pattern')
  .action(async (patternId: string) => {
    try {
      await showPattern(patternId);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// =============================================================================
// STATS COMMAND
// =============================================================================

program
  .command('stats')
  .description('Show library statistics')
  .action(async () => {
    try {
      await stats();
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// =============================================================================
// PROMOTE/DEMOTE COMMANDS
// =============================================================================

program
  .command('promote <pattern_id>')
  .description('Promote a pattern to active tier')
  .action(async (patternId: string) => {
    try {
      await promote(patternId);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command('demote <pattern_id>')
  .description('Demote a pattern to archive tier')
  .action(async (patternId: string) => {
    try {
      await demote(patternId);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// =============================================================================
// SOURCES COMMAND
// =============================================================================

const sourcesCmd = program
  .command('sources')
  .description('Manage source URLs');

sourcesCmd
  .command('add <url>')
  .description('Add a source URL')
  .option('--category <category>', 'Source category')
  .action(async (url: string, options: { category?: string }) => {
    try {
      await sources.add(url, options.category);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

sourcesCmd
  .command('list')
  .description('List all sources')
  .action(async () => {
    try {
      await sources.list();
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

sourcesCmd
  .command('tag <url> <tag>')
  .description('Tag a source')
  .action(async (url: string, tag: string) => {
    try {
      await sources.tag(url, tag);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

sourcesCmd
  .command('test <url>')
  .description('Test URL extraction')
  .action(async (url: string) => {
    try {
      await sources.test(url);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

sourcesCmd
  .command('remove <url>')
  .description('Remove a source')
  .action(async (url: string) => {
    try {
      await sources.remove(url);
    } catch (err) {
      console.error(chalk.red('Error:'), err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// =============================================================================
// HELP COMMAND
// =============================================================================

program
  .command('help')
  .description('Show detailed help')
  .action(() => {
    console.log(displayHelp());
  });

// =============================================================================
// RUN
// =============================================================================

// Show help if no command provided
if (process.argv.length <= 2) {
  console.log(chalk.cyan.bold('\n🎵 RHYTHM PATTERN MINER\n'));
  console.log(chalk.gray('A tool for building sentence and cadence-paragraph pattern libraries.\n'));
  program.help();
}

program.parse();
