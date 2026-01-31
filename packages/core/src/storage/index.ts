/**
 * Storage Layer for Pattern Library
 *
 * Handles:
 * - SQLite database for indexing and search
 * - JSON file storage for pattern details
 * - Preference profile management
 * - Source management
 * - Session tracking
 */

import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as path from 'path';

import {
  PatternUnit,
  SPU,
  CPU,
  RejectedPattern,
  UserPreferences,
  Source,
  MiningSession,
  SearchQuery,
  SearchResult,
  SimilarityMatch,
  PatternTier,
  PatternType,
  RejectionReason,
  SentenceFamily,
  ParagraphRole,
  IntentTag,
  CadenceArchetype,
  Audience,
  CadenceContour,
  RhythmProfile,
} from '../types/index.js';

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

const SCHEMA = `
-- Patterns table (main index)
CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('SPU', 'CPU')),
  tier TEXT NOT NULL DEFAULT 'archive' CHECK(tier IN ('active', 'archive')),
  template TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  family TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  tests_passed INTEGER NOT NULL DEFAULT 0,
  source_url TEXT,
  source_type TEXT CHECK(source_type IN ('url', 'paste', 'manual'))
);

-- Pattern roles (many-to-many)
CREATE TABLE IF NOT EXISTS pattern_roles (
  pattern_id TEXT NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (pattern_id, role),
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);

-- Pattern intents (many-to-many)
CREATE TABLE IF NOT EXISTS pattern_intents (
  pattern_id TEXT NOT NULL,
  intent TEXT NOT NULL,
  PRIMARY KEY (pattern_id, intent),
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);

-- Pattern audiences (many-to-many)
CREATE TABLE IF NOT EXISTS pattern_audiences (
  pattern_id TEXT NOT NULL,
  audience TEXT NOT NULL,
  PRIMARY KEY (pattern_id, audience),
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);

-- Rejected patterns
CREATE TABLE IF NOT EXISTS rejected_patterns (
  id TEXT PRIMARY KEY,
  template TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  rejection_reason TEXT NOT NULL,
  rejection_notes TEXT,
  rejected_at TEXT NOT NULL,
  source_url TEXT
);

-- Sources
CREATE TABLE IF NOT EXISTS sources (
  url TEXT PRIMARY KEY,
  added_at TEXT NOT NULL,
  last_fetched TEXT,
  category TEXT,
  tags TEXT, -- JSON array
  fetch_count INTEGER NOT NULL DEFAULT 0,
  patterns_extracted INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'failed', 'disabled')),
  error_message TEXT
);

-- Mining sessions
CREATE TABLE IF NOT EXISTS mining_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  query TEXT NOT NULL, -- JSON
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  merged_count INTEGER NOT NULL DEFAULT 0
);

-- Fingerprints for deduplication
CREATE TABLE IF NOT EXISTS fingerprints (
  fingerprint TEXT PRIMARY KEY,
  pattern_id TEXT,
  is_rejected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(type);
CREATE INDEX IF NOT EXISTS idx_patterns_tier ON patterns(tier);
CREATE INDEX IF NOT EXISTS idx_patterns_family ON patterns(family);
CREATE INDEX IF NOT EXISTS idx_patterns_fingerprint ON patterns(fingerprint);
CREATE INDEX IF NOT EXISTS idx_rejected_fingerprint ON rejected_patterns(fingerprint);
CREATE INDEX IF NOT EXISTS idx_fingerprints_pattern ON fingerprints(pattern_id);
`;

// =============================================================================
// STORAGE CLASS
// =============================================================================

export class PatternStorage {
  private db: Database.Database;
  private libraryPath: string;
  private preferencesPath: string;

  constructor(dbPath: string, libraryPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.libraryPath = libraryPath;
    this.preferencesPath = path.join(libraryPath, 'preferences', 'profile.json');

    // Ensure directories exist
    this.ensureDirectories();

    // Initialize schema
    this.db.exec(SCHEMA);
  }

  private ensureDirectories(): void {
    const dirs = [
      path.join(this.libraryPath, 'patterns', 'spu'),
      path.join(this.libraryPath, 'patterns', 'cpu'),
      path.join(this.libraryPath, 'rejected'),
      path.join(this.libraryPath, 'preferences'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  // ===========================================================================
  // PATTERN OPERATIONS
  // ===========================================================================

  savePattern(pattern: PatternUnit): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO patterns (
        id, type, tier, template, fingerprint, family,
        created_at, updated_at, version, evidence_count, tests_passed,
        source_url, source_type
      ) VALUES (
        @id, @type, @tier, @template, @fingerprint, @family,
        @createdAt, @updatedAt, @version, @evidenceCount, @testsPassed,
        @sourceUrl, @sourceType
      )
    `);

    stmt.run({
      id: pattern.id,
      type: pattern.type,
      tier: pattern.tier,
      template: pattern.template,
      fingerprint: pattern.fingerprint,
      family: pattern.family,
      createdAt: pattern.createdAt,
      updatedAt: pattern.updatedAt,
      version: pattern.version,
      evidenceCount: pattern.evidenceCount,
      testsPassed: pattern.testsPassed,
      sourceUrl: pattern.sourceUrl,
      sourceType: pattern.sourceType,
    });

    // Save roles
    this.db.prepare('DELETE FROM pattern_roles WHERE pattern_id = ?').run(pattern.id);
    const roleStmt = this.db.prepare('INSERT INTO pattern_roles (pattern_id, role) VALUES (?, ?)');
    for (const role of pattern.paragraphRoles) {
      roleStmt.run(pattern.id, role);
    }

    // Save intents
    this.db.prepare('DELETE FROM pattern_intents WHERE pattern_id = ?').run(pattern.id);
    const intentStmt = this.db.prepare('INSERT INTO pattern_intents (pattern_id, intent) VALUES (?, ?)');
    for (const intent of pattern.intentTags) {
      intentStmt.run(pattern.id, intent);
    }

    // Save audiences
    this.db.prepare('DELETE FROM pattern_audiences WHERE pattern_id = ?').run(pattern.id);
    const audienceStmt = this.db.prepare('INSERT INTO pattern_audiences (pattern_id, audience) VALUES (?, ?)');
    for (const audience of pattern.audienceSuitability) {
      audienceStmt.run(pattern.id, audience);
    }

    // Save fingerprint
    this.db.prepare(`
      INSERT OR REPLACE INTO fingerprints (fingerprint, pattern_id, is_rejected, created_at)
      VALUES (?, ?, FALSE, ?)
    `).run(pattern.fingerprint, pattern.id, new Date().toISOString());

    // Save full pattern to JSON file
    const typePath = pattern.type.toLowerCase();
    const filePath = path.join(this.libraryPath, 'patterns', typePath, `${pattern.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(pattern, null, 2));
  }

  getPattern(id: string): PatternUnit | null {
    const row = this.db.prepare('SELECT type FROM patterns WHERE id = ?').get(id) as { type: string } | undefined;
    if (!row) return null;

    const typePath = row.type.toLowerCase();
    const filePath = path.join(this.libraryPath, 'patterns', typePath, `${id}.json`);

    if (!fs.existsSync(filePath)) return null;

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as PatternUnit;
  }

  deletePattern(id: string): boolean {
    const row = this.db.prepare('SELECT type, fingerprint FROM patterns WHERE id = ?').get(id) as { type: string; fingerprint: string } | undefined;
    if (!row) return false;

    // Delete from database
    this.db.prepare('DELETE FROM patterns WHERE id = ?').run(id);
    this.db.prepare('DELETE FROM fingerprints WHERE pattern_id = ?').run(id);

    // Delete JSON file
    const typePath = row.type.toLowerCase();
    const filePath = path.join(this.libraryPath, 'patterns', typePath, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return true;
  }

  promotePattern(id: string): boolean {
    const result = this.db.prepare(`
      UPDATE patterns SET tier = 'active', updated_at = ? WHERE id = ?
    `).run(new Date().toISOString(), id);

    if (result.changes > 0) {
      const pattern = this.getPattern(id);
      if (pattern) {
        pattern.tier = 'active';
        pattern.updatedAt = new Date().toISOString();
        this.savePattern(pattern);
      }
      return true;
    }
    return false;
  }

  demotePattern(id: string): boolean {
    const result = this.db.prepare(`
      UPDATE patterns SET tier = 'archive', updated_at = ? WHERE id = ?
    `).run(new Date().toISOString(), id);

    if (result.changes > 0) {
      const pattern = this.getPattern(id);
      if (pattern) {
        pattern.tier = 'archive';
        pattern.updatedAt = new Date().toISOString();
        this.savePattern(pattern);
      }
      return true;
    }
    return false;
  }

  // ===========================================================================
  // SEARCH OPERATIONS
  // ===========================================================================

  searchPatterns(query: SearchQuery): SearchResult[] {
    let sql = 'SELECT DISTINCT p.id FROM patterns p';
    const joins: string[] = [];
    const conditions: string[] = [];
    const params: Record<string, string | number> = {};

    if (query.role) {
      joins.push('JOIN pattern_roles pr ON p.id = pr.pattern_id');
      conditions.push('pr.role = @role');
      params.role = query.role;
    }

    if (query.intent) {
      joins.push('JOIN pattern_intents pi ON p.id = pi.pattern_id');
      conditions.push('pi.intent = @intent');
      params.intent = query.intent;
    }

    if (query.audience) {
      joins.push('JOIN pattern_audiences pa ON p.id = pa.pattern_id');
      conditions.push('pa.audience = @audience');
      params.audience = query.audience;
    }

    if (query.type) {
      conditions.push('p.type = @type');
      params.type = query.type;
    }

    if (query.tier) {
      conditions.push('p.tier = @tier');
      params.tier = query.tier;
    }

    if (query.family) {
      conditions.push('p.family = @family');
      params.family = query.family;
    }

    sql += ' ' + joins.join(' ');
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY p.updated_at DESC';

    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }
    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    const rows = this.db.prepare(sql).all(params) as { id: string }[];

    const results: SearchResult[] = [];
    for (const row of rows) {
      const pattern = this.getPattern(row.id);
      if (pattern) {
        results.push({
          pattern,
          relevanceScore: 1.0, // Could compute based on match quality
        });
      }
    }

    return results;
  }

  getAllPatterns(type?: PatternType, tier?: PatternTier): PatternUnit[] {
    let sql = 'SELECT id FROM patterns';
    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (type) {
      conditions.push('type = @type');
      params.type = type;
    }
    if (tier) {
      conditions.push('tier = @tier');
      params.tier = tier;
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const rows = this.db.prepare(sql).all(params) as { id: string }[];
    return rows.map(row => this.getPattern(row.id)).filter((p): p is PatternUnit => p !== null);
  }

  // ===========================================================================
  // REJECTED PATTERNS
  // ===========================================================================

  saveRejectedPattern(rejected: RejectedPattern): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO rejected_patterns (
        id, template, fingerprint, rejection_reason, rejection_notes,
        rejected_at, source_url
      ) VALUES (
        @id, @template, @fingerprint, @rejectionReason, @rejectionNotes,
        @rejectedAt, @sourceUrl
      )
    `).run({
      id: rejected.id,
      template: rejected.template,
      fingerprint: rejected.fingerprint,
      rejectionReason: rejected.rejectionReason,
      rejectionNotes: rejected.rejectionNotes,
      rejectedAt: rejected.rejectedAt,
      sourceUrl: rejected.sourceUrl,
    });

    // Save fingerprint
    this.db.prepare(`
      INSERT OR REPLACE INTO fingerprints (fingerprint, pattern_id, is_rejected, created_at)
      VALUES (?, NULL, TRUE, ?)
    `).run(rejected.fingerprint, new Date().toISOString());

    // Save to JSON file
    const filePath = path.join(this.libraryPath, 'rejected', `${rejected.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rejected, null, 2));
  }

  getRecentRejectedPatterns(limit: number = 50): RejectedPattern[] {
    const rows = this.db.prepare(`
      SELECT id FROM rejected_patterns ORDER BY rejected_at DESC LIMIT ?
    `).all(limit) as { id: string }[];

    return rows.map(row => {
      const filePath = path.join(this.libraryPath, 'rejected', `${row.id}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RejectedPattern;
      }
      return null;
    }).filter((r): r is RejectedPattern => r !== null);
  }

  // ===========================================================================
  // SIMILARITY & FINGERPRINTING
  // ===========================================================================

  checkFingerprint(fingerprint: string): { exists: boolean; isRejected: boolean; patternId: string | null } {
    const row = this.db.prepare(`
      SELECT pattern_id, is_rejected FROM fingerprints WHERE fingerprint = ?
    `).get(fingerprint) as { pattern_id: string | null; is_rejected: number } | undefined;

    if (!row) {
      return { exists: false, isRejected: false, patternId: null };
    }

    return {
      exists: true,
      isRejected: Boolean(row.is_rejected),
      patternId: row.pattern_id,
    };
  }

  findSimilarPatterns(template: string, threshold: number = 0.7): SimilarityMatch[] {
    const patterns = this.getAllPatterns();
    const matches: SimilarityMatch[] = [];

    for (const pattern of patterns) {
      const similarity = this.computeSimilarity(template, pattern.template);
      if (similarity >= threshold) {
        matches.push({ patternId: pattern.id, similarity, pattern });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  private computeSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    const union = wordsA.size + wordsB.size - intersection;
    return intersection / union;
  }

  // ===========================================================================
  // SOURCES
  // ===========================================================================

  addSource(url: string, category?: string): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO sources (url, added_at, category, tags, fetch_count, patterns_extracted, status)
      VALUES (?, ?, ?, '[]', 0, 0, 'active')
    `).run(url, new Date().toISOString(), category || null);
  }

  getSource(url: string): Source | null {
    const row = this.db.prepare('SELECT * FROM sources WHERE url = ?').get(url) as {
      url: string;
      added_at: string;
      last_fetched: string | null;
      category: string | null;
      tags: string;
      fetch_count: number;
      patterns_extracted: number;
      status: string;
      error_message: string | null;
    } | undefined;

    if (!row) return null;

    return {
      url: row.url,
      addedAt: row.added_at,
      lastFetched: row.last_fetched,
      category: row.category,
      tags: JSON.parse(row.tags),
      fetchCount: row.fetch_count,
      patternsExtracted: row.patterns_extracted,
      status: row.status as 'active' | 'failed' | 'disabled',
      errorMessage: row.error_message,
    };
  }

  getAllSources(): Source[] {
    const rows = this.db.prepare('SELECT url FROM sources ORDER BY added_at DESC').all() as { url: string }[];
    return rows.map(row => this.getSource(row.url)).filter((s): s is Source => s !== null);
  }

  updateSourceStatus(url: string, status: 'active' | 'failed' | 'disabled', errorMessage?: string): void {
    this.db.prepare(`
      UPDATE sources SET status = ?, error_message = ?, last_fetched = ? WHERE url = ?
    `).run(status, errorMessage || null, new Date().toISOString(), url);
  }

  incrementSourceFetch(url: string, patternsFound: number): void {
    this.db.prepare(`
      UPDATE sources
      SET fetch_count = fetch_count + 1,
          patterns_extracted = patterns_extracted + ?,
          last_fetched = ?
      WHERE url = ?
    `).run(patternsFound, new Date().toISOString(), url);
  }

  tagSource(url: string, tag: string): void {
    const source = this.getSource(url);
    if (!source) return;

    if (!source.tags.includes(tag)) {
      source.tags.push(tag);
      this.db.prepare('UPDATE sources SET tags = ? WHERE url = ?').run(JSON.stringify(source.tags), url);
    }
  }

  removeSource(url: string): boolean {
    const result = this.db.prepare('DELETE FROM sources WHERE url = ?').run(url);
    return result.changes > 0;
  }

  // ===========================================================================
  // PREFERENCES
  // ===========================================================================

  loadPreferences(): UserPreferences {
    if (fs.existsSync(this.preferencesPath)) {
      const content = fs.readFileSync(this.preferencesPath, 'utf-8');
      const data = JSON.parse(content);

      // Map from file structure to UserPreferences type
      return {
        defaultAudience: data.defaults?.audience || ['essay', 'exec'],
        defaultMetaphorTolerance: data.defaults?.metaphorTolerance || 'medium',
        defaultCompression: data.defaults?.compression || 'medium',
        preferredSentenceLengthRange: data.sentenceLength?.preferredRange || [8, 25],
        preferredParagraphLengthRange: data.paragraphLength?.preferredSentenceRange || [2, 6],
        preferredCadenceArchetypes: data.cadencePreferences?.favored || [],
        dislikedCadenceArchetypes: data.cadencePreferences?.disliked || [],
        metaphorTolerance: data.stylePreferences?.metaphorTolerance || 'medium',
        bannedPhrases: data.bannedPhrases || [],
        dislikedTells: data.dislikedTells || [],
        favoredFamilies: data.familyPreferences?.favored || [],
        dislikedFamilies: data.familyPreferences?.disliked || [],
        dislikedFailureModes: data.failureModeRanking || [],
        totalAccepted: data.stats?.totalAccepted || 0,
        totalRejected: data.stats?.totalRejected || 0,
        rejectionReasonCounts: data.stats?.rejectionReasons || {},
        lastUpdated: data.meta?.lastUpdated || new Date().toISOString(),
        scoringWeights: data.scoringWeights,
      };
    }

    // Return defaults
    return {
      defaultAudience: ['essay', 'exec'],
      defaultMetaphorTolerance: 'medium',
      defaultCompression: 'medium',
      preferredSentenceLengthRange: [8, 25],
      preferredParagraphLengthRange: [2, 6],
      preferredCadenceArchetypes: ['crescendo_snap', 'punch_punch_land'],
      dislikedCadenceArchetypes: [],
      metaphorTolerance: 'medium',
      bannedPhrases: [],
      dislikedTells: [],
      favoredFamilies: [],
      dislikedFamilies: [],
      dislikedFailureModes: [],
      totalAccepted: 0,
      totalRejected: 0,
      rejectionReasonCounts: {} as Record<RejectionReason, number>,
      lastUpdated: new Date().toISOString(),
    };
  }

  savePreferences(prefs: UserPreferences): void {
    // Convert back to file structure
    const data = {
      defaults: {
        audience: prefs.defaultAudience,
        metaphorTolerance: prefs.defaultMetaphorTolerance,
        compression: prefs.defaultCompression,
      },
      sentenceLength: {
        preferredRange: prefs.preferredSentenceLengthRange,
      },
      paragraphLength: {
        preferredSentenceRange: prefs.preferredParagraphLengthRange,
      },
      cadencePreferences: {
        favored: prefs.preferredCadenceArchetypes,
        disliked: prefs.dislikedCadenceArchetypes,
      },
      stylePreferences: {
        metaphorTolerance: prefs.metaphorTolerance,
      },
      bannedPhrases: prefs.bannedPhrases,
      dislikedTells: prefs.dislikedTells,
      familyPreferences: {
        favored: prefs.favoredFamilies,
        disliked: prefs.dislikedFamilies,
      },
      failureModeRanking: prefs.dislikedFailureModes,
      scoringWeights: prefs.scoringWeights,
      stats: {
        totalAccepted: prefs.totalAccepted,
        totalRejected: prefs.totalRejected,
        rejectionReasons: prefs.rejectionReasonCounts,
      },
      meta: {
        lastUpdated: new Date().toISOString(),
      },
    };

    fs.writeFileSync(this.preferencesPath, JSON.stringify(data, null, 2));
  }

  updatePreferencesOnAccept(pattern: PatternUnit): void {
    const prefs = this.loadPreferences();
    prefs.totalAccepted++;

    // Update favored families
    if (pattern.family && !prefs.favoredFamilies.includes(pattern.family)) {
      // Track acceptance counts and potentially promote
    }

    // Update cadence preferences
    if (pattern.cadenceArchetype && !prefs.preferredCadenceArchetypes.includes(pattern.cadenceArchetype)) {
      // Track and potentially add to favored
    }

    prefs.lastUpdated = new Date().toISOString();
    this.savePreferences(prefs);
  }

  updatePreferencesOnReject(reason: RejectionReason, template: string): void {
    const prefs = this.loadPreferences();
    prefs.totalRejected++;

    if (!prefs.rejectionReasonCounts[reason]) {
      prefs.rejectionReasonCounts[reason] = 0;
    }
    prefs.rejectionReasonCounts[reason]++;

    prefs.lastUpdated = new Date().toISOString();
    this.savePreferences(prefs);
  }

  // ===========================================================================
  // SESSIONS
  // ===========================================================================

  createSession(query: Record<string, unknown>): string {
    const id = 'sess_' + nanoid(12);
    this.db.prepare(`
      INSERT INTO mining_sessions (id, started_at, query)
      VALUES (?, ?, ?)
    `).run(id, new Date().toISOString(), JSON.stringify(query));
    return id;
  }

  updateSession(id: string, counts: { accepted?: number; rejected?: number; skipped?: number; merged?: number }): void {
    const updates: string[] = [];
    const params: Record<string, number | string> = { id };

    if (counts.accepted !== undefined) {
      updates.push('accepted_count = accepted_count + @accepted');
      params.accepted = counts.accepted;
    }
    if (counts.rejected !== undefined) {
      updates.push('rejected_count = rejected_count + @rejected');
      params.rejected = counts.rejected;
    }
    if (counts.skipped !== undefined) {
      updates.push('skipped_count = skipped_count + @skipped');
      params.skipped = counts.skipped;
    }
    if (counts.merged !== undefined) {
      updates.push('merged_count = merged_count + @merged');
      params.merged = counts.merged;
    }

    if (updates.length > 0) {
      this.db.prepare(`UPDATE mining_sessions SET ${updates.join(', ')} WHERE id = @id`).run(params);
    }
  }

  endSession(id: string): void {
    this.db.prepare('UPDATE mining_sessions SET ended_at = ? WHERE id = ?').run(new Date().toISOString(), id);
  }

  getSessionStats(id: string): { accepted: number; rejected: number; skipped: number; merged: number } | null {
    const row = this.db.prepare(`
      SELECT accepted_count, rejected_count, skipped_count, merged_count
      FROM mining_sessions WHERE id = ?
    `).get(id) as { accepted_count: number; rejected_count: number; skipped_count: number; merged_count: number } | undefined;

    if (!row) return null;

    return {
      accepted: row.accepted_count,
      rejected: row.rejected_count,
      skipped: row.skipped_count,
      merged: row.merged_count,
    };
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  getLibraryStats(): {
    total: number;
    bySPU: number;
    byCPU: number;
    byTier: Record<string, number>;
    byFamily: Record<string, number>;
    byIntent: Record<string, number>;
    byRole: Record<string, number>;
    rejected: number;
  } {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM patterns').get() as { count: number }).count;
    const bySPU = (this.db.prepare('SELECT COUNT(*) as count FROM patterns WHERE type = ?').get('SPU') as { count: number }).count;
    const byCPU = (this.db.prepare('SELECT COUNT(*) as count FROM patterns WHERE type = ?').get('CPU') as { count: number }).count;

    const tierRows = this.db.prepare('SELECT tier, COUNT(*) as count FROM patterns GROUP BY tier').all() as { tier: string; count: number }[];
    const byTier: Record<string, number> = {};
    for (const row of tierRows) {
      byTier[row.tier] = row.count;
    }

    const familyRows = this.db.prepare('SELECT family, COUNT(*) as count FROM patterns WHERE family IS NOT NULL GROUP BY family').all() as { family: string; count: number }[];
    const byFamily: Record<string, number> = {};
    for (const row of familyRows) {
      byFamily[row.family] = row.count;
    }

    const intentRows = this.db.prepare('SELECT intent, COUNT(*) as count FROM pattern_intents GROUP BY intent').all() as { intent: string; count: number }[];
    const byIntent: Record<string, number> = {};
    for (const row of intentRows) {
      byIntent[row.intent] = row.count;
    }

    const roleRows = this.db.prepare('SELECT role, COUNT(*) as count FROM pattern_roles GROUP BY role').all() as { role: string; count: number }[];
    const byRole: Record<string, number> = {};
    for (const row of roleRows) {
      byRole[row.role] = row.count;
    }

    const rejected = (this.db.prepare('SELECT COUNT(*) as count FROM rejected_patterns').get() as { count: number }).count;

    return { total, bySPU, byCPU, byTier, byFamily, byIntent, byRole, rejected };
  }

  close(): void {
    this.db.close();
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createStorage(dbPath?: string, libraryPath?: string): PatternStorage {
  const defaultDbPath = process.env.DATABASE_PATH || './index/patterns.db';
  const defaultLibraryPath = process.env.LIBRARY_PATH || './library';

  return new PatternStorage(dbPath || defaultDbPath, libraryPath || defaultLibraryPath);
}

export default PatternStorage;
