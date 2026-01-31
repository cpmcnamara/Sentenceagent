/**
 * Display utilities for the CLI
 *
 * Handles:
 * - Candidate card rendering
 * - Rhythm panel display
 * - Session summary
 * - Library statistics
 */

import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';

import type {
  Candidate,
  PatternUnit,
  RhythmProfile,
  CadenceContour,
  ParagraphRole,
  IntentTag,
  CadenceArchetype,
  SentenceFamily,
} from '@rhythm-miner/core';

// =============================================================================
// COLORS & STYLING
// =============================================================================

const colors = {
  primary: chalk.cyan,
  secondary: chalk.gray,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  accent: chalk.magenta,
  muted: chalk.dim,
  highlight: chalk.bold.white,
};

// =============================================================================
// CANDIDATE DISPLAY
// =============================================================================

export function displayCandidate(candidate: Candidate, index: number): string {
  const typeLabel = candidate.type === 'SPU' ? chalk.blue('[SPU]') : chalk.magenta('[CPU]');

  // Header
  const header = `${colors.primary('CANDIDATE')} ${colors.secondary(`#${index}`)}                                    ${typeLabel}`;

  // Template/Text display (truncate if too long)
  const displayText = candidate.text.length > 200
    ? candidate.text.slice(0, 197) + '...'
    : candidate.text;

  // Rhythm Panel
  const rhythmPanel = formatRhythmPanel(candidate.rhythmProfile, candidate.cadenceContour);

  // Predicted Tags
  const predictedTags = formatPredictedTags(
    candidate.predictedRoles,
    candidate.predictedIntents,
    candidate.predictedCadence,
    candidate.predictedFamily
  );

  // Why it works / Why it might fail
  const annotations = [
    `${colors.success('WHY IT WORKS:')} ${candidate.whyItWorks}`,
    `${colors.warning('WHY IT MIGHT FAIL:')} ${candidate.whyItMightFail}`,
  ].join('\n');

  // Score breakdown (subtle)
  const scoreInfo = formatScoreBreakdown(candidate.score);

  const content = [
    '',
    colors.highlight(`"${displayText}"`),
    '',
    rhythmPanel,
    '',
    predictedTags,
    '',
    annotations,
    '',
    scoreInfo,
  ].join('\n');

  return boxen(content, {
    title: header,
    titleAlignment: 'left',
    padding: 1,
    margin: { top: 1, bottom: 0, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'cyan',
  });
}

function formatRhythmPanel(rhythm: RhythmProfile, cadence: CadenceContour | null): string {
  const lines = [colors.primary('RHYTHM PANEL')];

  // Length info
  const lengthLabel = {
    short: 'Short',
    medium: 'Medium',
    long: 'Long',
    extended: 'Extended',
  }[rhythm.lengthCategory];

  lines.push(`├─ Length: ${rhythm.wordCount} words · ${colors.accent(lengthLabel)}`);
  lines.push(`├─ Clauses: ${rhythm.clauseCount}${rhythm.clauseCount > 1 ? ` (${describeClauses(rhythm)})` : ''}`);

  // Punctuation
  const punctDesc = describePunctuation(rhythm.punctuationProfile);
  if (punctDesc) {
    lines.push(`├─ Punctuation: ${punctDesc}`);
  }

  // Cadence (for CPU)
  if (cadence) {
    const confidenceLabel = cadence.archetypeConfidence > 0.7 ? 'strong' :
      cadence.archetypeConfidence > 0.5 ? 'moderate' : 'weak';
    lines.push(`├─ Cadence: ${formatCadenceArchetype(cadence.archetype)} (${confidenceLabel})`);
    lines.push(`├─ Contour: ${cadence.lengthContour.join(' → ')}`);
    if (cadence.hingeSentenceIndex !== null) {
      lines.push(`└─ Hinge: sentence ${cadence.hingeSentenceIndex + 1}`);
    } else {
      lines.push(`└─ Beat: ${rhythm.stressPattern}`);
    }
  } else {
    lines.push(`└─ Beat: ${describeBeat(rhythm)}`);
  }

  return lines.join('\n');
}

function describeClauses(rhythm: RhythmProfile): string {
  const punct = rhythm.punctuationProfile;
  if (punct.emDashes > 0) return 'em-dash pivot';
  if (punct.colons > 0) return 'colon structure';
  if (punct.semicolons > 0) return 'parallel';
  if (punct.commas > 2) return 'complex';
  return 'compound';
}

function describePunctuation(punct: { periods: number; commas: number; semicolons: number; colons: number; emDashes: number; questionMarks: number; exclamationMarks: number }): string {
  const parts: string[] = [];
  if (punct.emDashes > 0) parts.push('em-dash');
  if (punct.colons > 0) parts.push('colon');
  if (punct.semicolons > 0) parts.push('semicolon');
  if (punct.questionMarks > 0) parts.push('question');
  if (punct.exclamationMarks > 0) parts.push('exclamation');
  if (parts.length === 0 && punct.commas > 0) parts.push(`${punct.commas} commas`);
  return parts.join(', ');
}

function describeBeat(rhythm: RhythmProfile): string {
  if (rhythm.wordCount <= 6) return 'staccato-punch';
  if (rhythm.wordCount <= 12) return 'crisp';
  if (rhythm.wordCount <= 20) return 'flowing';
  return 'extended';
}

function formatCadenceArchetype(archetype: CadenceArchetype): string {
  return archetype.replace(/_/g, '-');
}

function formatPredictedTags(
  roles: ParagraphRole[],
  intents: IntentTag[],
  cadence: CadenceArchetype | null,
  family: SentenceFamily | null
): string {
  const lines = [colors.primary('PREDICTED TAGS')];

  if (roles.length > 0) {
    lines.push(`├─ Role: ${roles.map(r => colors.accent(r)).join(' · ')}`);
  }
  if (intents.length > 0) {
    lines.push(`├─ Intent: ${intents.map(i => colors.accent(i)).join(' · ')}`);
  }
  if (cadence) {
    lines.push(`├─ Cadence: ${colors.accent(formatCadenceArchetype(cadence))}`);
  }
  if (family) {
    lines.push(`└─ Family: ${colors.accent(family.replace(/_/g, '-'))}`);
  } else {
    lines[lines.length - 1] = lines[lines.length - 1].replace('├─', '└─');
  }

  return lines.join('\n');
}

function formatScoreBreakdown(score: Candidate['score']): string {
  const bar = (value: number) => {
    const filled = Math.round(value * 10);
    const empty = 10 - filled;
    return colors.success('█'.repeat(filled)) + colors.muted('░'.repeat(empty));
  };

  return colors.muted([
    `Score: ${(score.total * 100).toFixed(0)}%`,
    `  Intent ${bar(score.intentMatch)} | Novelty ${bar(score.novelty)} | Pref ${bar(score.preferenceMatch)}`,
  ].join('\n'));
}

// =============================================================================
// ACTION BAR
// =============================================================================

export function displayActionBar(quickMode: boolean): string {
  if (quickMode) {
    return chalk.bgBlue.white(' QUICK MODE ') + ' ' +
      chalk.green('[a/y]') + ' Accept  ' +
      chalk.red('[r/n]') + ' Reject  ' +
      chalk.yellow('[s]') + ' Skip  ' +
      chalk.blue('[m]') + ' Merge  ' +
      chalk.cyan('[d]') + ' Detail  ' +
      chalk.gray('[q]') + ' Quit';
  }

  return chalk.green('[a]') + ' Accept  ' +
    chalk.red('[r]') + ' Reject  ' +
    chalk.yellow('[s]') + ' Skip  ' +
    chalk.blue('[m]') + ' Merge  ' +
    chalk.cyan('[d]') + ' Detail  ' +
    chalk.gray('[q]') + ' Quit  ' +
    chalk.gray('[?]') + ' Help';
}

// =============================================================================
// REJECTION REASONS
// =============================================================================

export function displayRejectionReasons(): string {
  const reasons = [
    { key: '1', label: 'too vague' },
    { key: '2', label: 'too cute/cheesy' },
    { key: '3', label: 'too long' },
    { key: '4', label: 'too abstract' },
    { key: '5', label: 'too academic' },
    { key: '6', label: 'cadence flat' },
    { key: '7', label: 'cadence manic' },
    { key: '8', label: 'meaning unclear' },
    { key: '9', label: 'sounds like AI' },
    { key: '0', label: 'other' },
  ];

  return colors.primary('Why reject?') + '\n' +
    reasons.map(r => `  ${colors.accent(`[${r.key}]`)} ${r.label}`).join('\n');
}

export function mapRejectionKey(key: string): string | null {
  const map: Record<string, string> = {
    '1': 'too_vague',
    '2': 'too_cute',
    '3': 'too_long',
    '4': 'too_abstract',
    '5': 'too_academic',
    '6': 'cadence_flat',
    '7': 'cadence_manic',
    '8': 'meaning_unclear',
    '9': 'sounds_like_ai',
    '0': 'other',
  };
  return map[key] || null;
}

// =============================================================================
// SESSION DISPLAY
// =============================================================================

export function displaySessionProgress(
  accepted: number,
  rejected: number,
  skipped: number,
  total: number
): string {
  const processed = accepted + rejected + skipped;
  return colors.muted(
    `Session: ${colors.success(`${accepted} accepted`)} | ${colors.error(`${rejected} rejected`)} | ${colors.warning(`${skipped} skipped`)} | ${processed} processed`
  );
}

export function displaySessionSummary(
  session: { accepted: number; rejected: number; skipped: number; merged: number },
  coverage: { byRole: Record<string, number>; byIntent: Record<string, number> },
  suggestions: string[]
): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(colors.primary('═'.repeat(60)));
  lines.push(colors.primary('SESSION SUMMARY'));
  lines.push(colors.primary('═'.repeat(60)));
  lines.push('');

  // Counts
  lines.push(`├─ ${colors.success(`Accepted: ${session.accepted} patterns`)}`);
  lines.push(`├─ ${colors.error(`Rejected: ${session.rejected}`)}`);
  lines.push(`├─ ${colors.warning(`Skipped: ${session.skipped}`)}`);
  if (session.merged > 0) {
    lines.push(`├─ ${colors.blue(`Merged: ${session.merged}`)}`);
  }
  lines.push('');

  // Coverage
  lines.push(colors.primary('LIBRARY COVERAGE'));
  const allRoles: ParagraphRole[] = ['opening', 'hook', 'pivot', 'transition', 'definition', 'close'];
  for (const role of allRoles) {
    const count = coverage.byRole[role] || 0;
    const status = count === 0 ? colors.error('PRIORITY') :
      count < 3 ? colors.warning('needs more') :
        colors.success('good');
    lines.push(`├─ ${role}: ${count} (${status})`);
  }
  lines.push('');

  // Suggestions
  if (suggestions.length > 0) {
    lines.push(colors.primary('SUGGESTED NEXT FOCUS'));
    for (const suggestion of suggestions) {
      lines.push(`└─ ${colors.accent(suggestion)}`);
    }
  }

  lines.push('');
  lines.push(colors.primary('═'.repeat(60)));

  return lines.join('\n');
}

// =============================================================================
// PATTERN DISPLAY (for search results)
// =============================================================================

export function displayPattern(pattern: PatternUnit): string {
  const typeLabel = pattern.type === 'SPU' ? chalk.blue('[SPU]') : chalk.magenta('[CPU]');
  const tierLabel = pattern.tier === 'active' ? chalk.green('[active]') : chalk.gray('[archive]');

  const header = `${typeLabel} ${tierLabel} ${colors.muted(pattern.id)}`;

  const content = [
    '',
    colors.highlight(`"${pattern.exampleSnippet}"`),
    '',
    colors.secondary(`Template: ${pattern.template}`),
    '',
    `Roles: ${pattern.paragraphRoles.map(r => colors.accent(r)).join(', ')}`,
    `Intents: ${pattern.intentTags.map(i => colors.accent(i)).join(', ')}`,
    pattern.family ? `Family: ${colors.accent(pattern.family)}` : '',
    pattern.cadenceArchetype ? `Cadence: ${colors.accent(formatCadenceArchetype(pattern.cadenceArchetype))}` : '',
    '',
    colors.success(`Why it works: ${pattern.whyItWorks}`),
    colors.warning(`Caution: ${pattern.whyItMightFail}`),
  ].filter(Boolean).join('\n');

  return boxen(content, {
    title: header,
    titleAlignment: 'left',
    padding: 1,
    borderStyle: 'round',
    borderColor: pattern.tier === 'active' ? 'green' : 'gray',
  });
}

// =============================================================================
// LIBRARY STATS
// =============================================================================

export function displayLibraryStats(stats: {
  total: number;
  bySPU: number;
  byCPU: number;
  byTier: Record<string, number>;
  byFamily: Record<string, number>;
  byIntent: Record<string, number>;
  byRole: Record<string, number>;
  rejected: number;
}): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(colors.primary('═'.repeat(60)));
  lines.push(colors.primary('LIBRARY STATISTICS'));
  lines.push(colors.primary('═'.repeat(60)));
  lines.push('');

  lines.push(colors.primary('OVERVIEW'));
  lines.push(`├─ Total patterns: ${colors.highlight(stats.total.toString())}`);
  lines.push(`├─ SPU (sentences): ${stats.bySPU}`);
  lines.push(`├─ CPU (paragraphs): ${stats.byCPU}`);
  lines.push(`├─ Active tier: ${stats.byTier['active'] || 0}`);
  lines.push(`├─ Archive tier: ${stats.byTier['archive'] || 0}`);
  lines.push(`└─ Rejected: ${stats.rejected}`);
  lines.push('');

  if (Object.keys(stats.byRole).length > 0) {
    lines.push(colors.primary('BY ROLE'));
    const roles = Object.entries(stats.byRole).sort((a, b) => b[1] - a[1]);
    for (const [role, count] of roles) {
      lines.push(`├─ ${role}: ${count}`);
    }
    lines.push('');
  }

  if (Object.keys(stats.byIntent).length > 0) {
    lines.push(colors.primary('BY INTENT'));
    const intents = Object.entries(stats.byIntent).sort((a, b) => b[1] - a[1]);
    for (const [intent, count] of intents) {
      lines.push(`├─ ${intent}: ${count}`);
    }
    lines.push('');
  }

  lines.push(colors.primary('═'.repeat(60)));

  return lines.join('\n');
}

// =============================================================================
// HELP
// =============================================================================

export function displayHelp(): string {
  return boxen([
    colors.primary('RHYTHM PATTERN MINER - HELP'),
    '',
    colors.secondary('Mining Commands:'),
    '  mine                          Start mining session',
    '  mine --role opening           Mine opening patterns',
    '  mine --intent pivot           Mine pivot patterns',
    '  mine --cadence crescendo-snap Mine specific cadence',
    '  mine --paste                  Mine from pasted text',
    '  mine --source <url>           Mine from URL',
    '  mine --quick                  Quick mode (hotkeys only)',
    '',
    colors.secondary('Search Commands:'),
    '  search --intent hook          Search by intent',
    '  search --role pivot           Search by role',
    '  search --family negation-pivot Search by family',
    '  show <pattern_id>             Show pattern details',
    '',
    colors.secondary('Source Commands:'),
    '  sources add <url>             Add source URL',
    '  sources list                  List all sources',
    '  sources tag <url> <tag>       Tag a source',
    '  sources test <url>            Test URL extraction',
    '',
    colors.secondary('Library Commands:'),
    '  stats                         Show library statistics',
    '  promote <id>                  Promote to active tier',
    '  demote <id>                   Demote to archive tier',
    '',
    colors.secondary('Session Hotkeys:'),
    '  a/y    Accept pattern',
    '  r/n    Reject pattern',
    '  s      Skip pattern',
    '  m      Merge with existing',
    '  d      Enter detail mode',
    '  q      Quit session',
    '  ?      Show this help',
  ].join('\n'), {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  });
}
