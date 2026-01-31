# Rhythm-Aware Pattern Miner

A local-first, intention-driven mining tool for building sentence and cadence-paragraph pattern libraries. It learns your preferences over time and presents candidates that maximize usefulness for your specific writing goals.

## Stack Choice

**TypeScript/Node.js** was chosen for this project for several key reasons: (1) Superior interactive CLI libraries (inquirer, blessed-contrib, chalk) enable the sharp editorial instrument UX required, with proper hotkey support and responsive prompts; (2) Strong typing via TypeScript provides safety for the complex pattern structures (SPU/CPU), rhythm analysis data, and preference profiles; (3) better-sqlite3 offers synchronous SQLite access ideal for the fast, low-latency interaction model; (4) The async/await patterns work naturally for the Firecrawl integration and background indexing.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize the database
npm run mine -- --init

# Start mining with intent
npm run mine -- --role opening --intent hook

# Quick rate mode
npm run mine -- --quick --intent pivot

# Search your library
npm run search -- --intent pivot --audience exec
```

## Daily Workflow

### 1. Start a Mining Session

```bash
# Intent-targeted mining
npm run mine -- --role opening --intent hook
npm run mine -- --intent pivot --audience exec --metaphor low
npm run mine -- --cadence crescendo-snap --role argument_turn

# From a specific source
npm run mine -- --source "https://example.com/essay"

# From pasted text
npm run mine -- --paste
```

### 2. Review Candidates

The tool shows one candidate at a time with rhythm analysis:

```
┌─────────────────────────────────────────────────────────────┐
│ CANDIDATE #3                                    [SPU]       │
├─────────────────────────────────────────────────────────────┤
│ "The [X] isn't [Y]—it's [Z]."                               │
│                                                             │
│ RHYTHM PANEL                                                │
│ ├─ Length: 8 words · Short                                  │
│ ├─ Clauses: 2 (negation-pivot)                              │
│ ├─ Punctuation: em-dash pivot                               │
│ └─ Beat: staccato-snap                                      │
│                                                             │
│ PREDICTED TAGS                                              │
│ ├─ Role: definition · reframe                               │
│ ├─ Intent: crystallization                                  │
│ └─ Cadence: snap                                            │
│                                                             │
│ WHY IT WORKS: Clean negation-redefinition structure.        │
│ WHY IT MIGHT FAIL: Overused pattern; can feel formulaic.    │
└─────────────────────────────────────────────────────────────┘

[a] Accept  [r] Reject  [s] Skip  [m] Merge  [d] Detail  [q] Quit
```

### 3. Speed Keys

| Key | Action | Description |
|-----|--------|-------------|
| `a` / `y` | Accept | Store pattern, confirm tags |
| `r` / `n` | Reject | Log reason, find next better |
| `s` | Skip | Move to next without logging |
| `m` | Merge | Combine with existing pattern |
| `d` | Detail | Enter deep mode for more follow-ups |
| `q` | Quit | End session with summary |
| `?` | Help | Show all commands |

### 4. Rejection Reasons (Quick Select)

When you reject, pick why:
- `1` too vague
- `2` too cute/cheesy
- `3` too long
- `4` too abstract
- `5` too academic
- `6` cadence flat
- `7` cadence manic
- `8` meaning unclear
- `9` sounds like AI

The tool learns and avoids similar patterns.

### 5. Session Summary

At session end:
```
SESSION SUMMARY
├─ Accepted: 4 patterns (2 SPU, 2 CPU)
├─ Rejected: 7 (3 too-vague, 2 cadence-flat, 2 too-long)
├─ Skipped: 2
│
│ LIBRARY COVERAGE
├─ Opening hooks: 5 (good)
├─ Pivots: 2 (needs more)
├─ Transitions: 0 (PRIORITY)
├─ Definitions: 3 (good)
│
│ SUGGESTED NEXT FOCUS
└─ "You have no transition patterns. Try: mine --role transition"
```

## Architecture

```
/apps/cli           # Interactive CLI application
/packages/core      # Pattern analysis, scoring, storage
/packages/firecrawl # URL fetching and text extraction
/library/
  patterns/         # Accepted patterns (SPU/, CPU/)
  rejected/         # Anti-pattern memory
  taxonomy/         # Categories and classifications
  preferences/      # Your evolving profile
/index/             # SQLite database
/docs/              # Guides and documentation
```

## Pattern Types

### SPU (Sentence Pattern Unit)
Single sentence patterns with rhythm analysis:
- Length and word count
- Clause structure
- Punctuation profile
- Stress heuristics

### CPU (Cadence Paragraph Unit)
Multi-sentence patterns (2-8 sentences) capturing:
- Sentence length contour
- Rhythm flow
- Hinge sentence identification
- Cadence archetype (crescendo-snap, staccato, wave, etc.)

## Commands

### Mining
```bash
mine [options]
  --role <role>       Paragraph role (opening, pivot, transition, close)
  --intent <intent>   Intent tag (hook, reframe, crystallization)
  --audience <aud>    Target audience (exec, essay, technical)
  --metaphor <level>  Metaphor tolerance (low, medium, high)
  --compression <lv>  Compression level (low, medium, high)
  --cadence <type>    Cadence archetype preference
  --source <url>      Mine from specific URL
  --paste             Mine from pasted text
  --quick             Quick rate mode (y/n/s/m only)
  --init              Initialize database
```

### Search
```bash
search [options]
  --intent <intent>   Filter by intent
  --role <role>       Filter by paragraph role
  --cadence <type>    Filter by cadence archetype
  --audience <aud>    Filter by audience
  --compression <lv>  Filter by compression level
  --family <family>   Filter by sentence family
  --limit <n>         Max results (default: 10)
```

### Sources
```bash
sources add <url>           # Add source URL
sources list                # List all sources
sources tag <url> <tag>     # Tag a source
sources test <url>          # Test extraction
sources remove <url>        # Remove source
```

### Library
```bash
show <pattern_id>           # Show pattern details
promote <pattern_id>        # Promote archive → active
demote <pattern_id>         # Demote active → archive
stats                       # Library statistics
export [--format json|md]   # Export library
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Required:
- `FIRECRAWL_API_KEY` - Your Firecrawl API key

### Preferences

Edit `library/preferences/profile.json` to customize:
- Default audience
- Metaphor tolerance
- Compression preference
- Banned phrases
- Disliked failure modes
- Cadence preferences

## License

MIT
