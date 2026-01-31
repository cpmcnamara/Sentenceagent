/**
 * Sources Command
 *
 * Manage source URLs for mining.
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

import { createStorage } from '@rhythm-miner/core';
import { createClient } from '@rhythm-miner/firecrawl';

export async function addSource(url: string, category?: string): Promise<void> {
  const storage = createStorage();

  // Validate URL
  try {
    new URL(url);
  } catch {
    console.log(chalk.red('Invalid URL format.'));
    storage.close();
    return;
  }

  storage.addSource(url, category);
  console.log(chalk.green(`Added source: ${url}`));

  if (category) {
    console.log(chalk.gray(`Category: ${category}`));
  }

  storage.close();
}

export async function listSources(): Promise<void> {
  const storage = createStorage();
  const sources = storage.getAllSources();

  if (sources.length === 0) {
    console.log(chalk.yellow('\nNo sources configured.'));
    console.log(chalk.gray('Add sources with: sources add <url>'));
    storage.close();
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('URL'),
      chalk.cyan('Status'),
      chalk.cyan('Category'),
      chalk.cyan('Fetched'),
      chalk.cyan('Patterns'),
    ],
    style: { head: [], border: [] },
  });

  for (const source of sources) {
    const statusColor = source.status === 'active' ? chalk.green :
      source.status === 'failed' ? chalk.red : chalk.gray;

    table.push([
      source.url.length > 40 ? source.url.slice(0, 37) + '...' : source.url,
      statusColor(source.status),
      source.category || '-',
      source.fetchCount.toString(),
      source.patternsExtracted.toString(),
    ]);
  }

  console.log('\n' + table.toString() + '\n');
  storage.close();
}

export async function tagSource(url: string, tag: string): Promise<void> {
  const storage = createStorage();
  const source = storage.getSource(url);

  if (!source) {
    console.log(chalk.red(`Source not found: ${url}`));
    storage.close();
    return;
  }

  storage.tagSource(url, tag);
  console.log(chalk.green(`Tagged ${url} with: ${tag}`));
  storage.close();
}

export async function testSource(url: string): Promise<void> {
  const storage = createStorage();
  const spinner = ora(`Testing ${url}...`).start();

  try {
    const client = createClient();
    const result = await client.testUrl(url);

    if (result.success) {
      spinner.succeed(result.message);
      storage.updateSourceStatus(url, 'active');
    } else {
      spinner.fail(result.message);
      storage.updateSourceStatus(url, 'failed', result.message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    spinner.fail(message);
    storage.updateSourceStatus(url, 'failed', message);
  }

  storage.close();
}

export async function removeSource(url: string): Promise<void> {
  const storage = createStorage();
  const success = storage.removeSource(url);

  if (success) {
    console.log(chalk.green(`Removed source: ${url}`));
  } else {
    console.log(chalk.red(`Source not found: ${url}`));
  }

  storage.close();
}

export default {
  add: addSource,
  list: listSources,
  tag: tagSource,
  test: testSource,
  remove: removeSource,
};
