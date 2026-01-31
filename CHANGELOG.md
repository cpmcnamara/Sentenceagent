# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-31

### Added

- **Core Pattern Mining**
  - Intent-targeted mining with role, intent, cadence, and audience filters
  - SPU (Sentence Pattern Unit) and CPU (Cadence Paragraph Unit) classification
  - Rhythm analysis engine with syllable, clause, and punctuation profiling
  - Cadence archetype detection (13 archetypes)
  - Sentence family classification (16 families)

- **Intelligent Scoring Pipeline**
  - Intent match scoring
  - Novelty scoring against existing library
  - Preference match scoring based on user profile
  - Reusability scoring
  - Anti-cliché detection
  - Rhythm quality scoring

- **Interactive UX**
  - Quick mode with hotkey-only interaction (y/n/s/m)
  - Detail mode for comprehensive pattern configuration
  - Rejection reason tracking with preference learning
  - Session progress and coverage reporting
  - Suggested next mining focus

- **Storage & Indexing**
  - SQLite-based pattern indexing
  - JSON file storage for full pattern details
  - Fingerprinting and deduplication
  - Similarity search for merge suggestions
  - Active/archive tier system

- **Source Management**
  - Firecrawl integration for URL extraction
  - Source roster management
  - Paste fallback for manual text input

- **Preference Learning**
  - Evolving user preference profile
  - Banned phrase tracking
  - AI tell detection
  - Cadence and family preference learning

- **Validation Framework**
  - Meaning preservation testing
  - Cadence preservation testing
  - Writing quality comparison (before/after)
  - Library progress metrics

- **Emotional Layer**
  - Emotional effect taxonomy (24 effects)
  - Emotional intensity classification
  - Emotional delivery mechanism detection
  - Structure-to-emotion mapping

- **Taxonomies**
  - 16 sentence families with failure mode notes
  - 13 cadence archetypes with essential elements
  - 12 paragraph roles with compatibility mappings
  - 12 intent tags with quality tests

- **Documentation**
  - Comprehensive README with daily workflow
  - Mining guide with philosophy and best practices
  - Hotkey reference

### Technical

- TypeScript/Node.js stack
- Monorepo structure with workspaces
- better-sqlite3 for fast local storage
- Vitest for testing
- Commander for CLI
- Inquirer + chalk for interactive UI
