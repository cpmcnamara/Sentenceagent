/**
 * @rhythm-miner/core
 *
 * Core library for the Rhythm-Aware Pattern Miner
 */

// Types
export * from './types/index.js';
export * from './types/extended.js';
export * from './types/emotional.js';
export * from './types/emotional-v2.js'; // Research-aligned emotion taxonomy

// Analysis
export * from './analysis/rhythm.js';

// Scoring
export * from './scoring/index.js';

// Storage
export { PatternStorage, createStorage } from './storage/index.js';

// Validation
export * from './validation/index.js';
