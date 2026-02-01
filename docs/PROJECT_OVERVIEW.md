# Rhythm-Aware Pattern Miner: Complete Project Overview

## Executive Summary

**Rhythm-Aware Pattern Miner** (also called "Sentenceagent") is a local-first, command-line tool designed to help writers build personalized sentence and paragraph pattern libraries. The core innovation is treating writing patterns not just as templates, but as **rhythm instruments**—structures with measurable cadence, stress patterns, and emotional effects.

The tool enables a writer to:
1. **Mine** prose from URLs or pasted text to discover patterns
2. **Evaluate** candidates through an interactive accept/reject loop
3. **Learn** user preferences over time to surface better matches
4. **Search** their curated library when writing

---

## Core Philosophy

### The Problem It Solves

Writers often recognize good prose when they see it but struggle to systematically capture and reuse the structural patterns that make it work. Traditional "templates" miss the crucial element: **rhythm**.

A sentence like:

> "The data was clear. The team had aligned. The stakeholders had finally stopped fighting about scope. Ship it."

...works not because of the words, but because of the **crescendo-snap cadence**: three building sentences followed by a two-word punch. This project captures that rhythmic structure as a reusable pattern.

### Key Insight: Structure as Rhythm

The project treats writing structures as having:
- **Contour**: The shape of sentence lengths in a paragraph
- **Cadence**: The rhythmic archetype (staccato, wave, crescendo-snap, etc.)
- **Hinge points**: Where the rhythm pivots or lands
- **Emotional payload**: What the rhythm makes readers feel

This rhythm-first approach distinguishes it from simple template collections.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Application                          │
│                     (apps/cli/src/index.ts)                     │
├─────────────────────────────────────────────────────────────────┤
│  Commands:                                                      │
│  • mine    → Interactive pattern discovery                      │
│  • search  → Query the pattern library                          │
│  • show    → Display pattern details                            │
│  • stats   → Library coverage statistics                        │
│  • promote → Move archive → active tier                         │
│  • demote  → Move active → archive tier                         │
│  • sources → Manage source URLs                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Scoring   │  │   Rhythm    │  │   Storage   │
│   Pipeline  │  │   Analysis  │  │   Layer     │
│ (packages/  │  │ (packages/  │  │ (packages/  │
│  core/)     │  │  core/)     │  │  core/)     │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
         ┌───────────┐     ┌───────────┐
         │  SQLite   │     │   JSON    │
         │   Index   │     │  Library  │
         └───────────┘     └───────────┘
```

### Monorepo Structure

```
/
├── apps/
│   └── cli/                    # Interactive command-line interface
│       ├── src/
│       │   ├── index.ts        # Entry point, command definitions
│       │   ├── commands/
│       │   │   ├── mine.ts     # Mining session logic
│       │   │   ├── search.ts   # Library search & management
│       │   │   └── sources.ts  # Source URL management
│       │   └── ui/
│       │       └── display.ts  # Terminal rendering
│       └── package.json
│
├── packages/
│   ├── core/                   # Core analysis & storage engine
│   │   ├── src/
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   │   ├── index.ts    # Core types (400+ lines)
│   │   │   │   ├── extended.ts # Extended pattern metadata
│   │   │   │   └── emotional.ts # Emotional effect taxonomy
│   │   │   ├── analysis/
│   │   │   │   ├── rhythm.ts   # Rhythm analysis engine
│   │   │   │   └── stylometrics.ts # Writing style metrics
│   │   │   ├── scoring/
│   │   │   │   └── index.ts    # Candidate scoring pipeline
│   │   │   ├── storage/
│   │   │   │   └── index.ts    # SQLite storage layer
│   │   │   └── validation/
│   │   │       └── index.ts    # Pattern validation framework
│   │   └── package.json
│   │
│   └── firecrawl/              # URL extraction integration
│       ├── src/
│       │   └── index.ts        # Firecrawl API wrapper
│       └── package.json
│
├── library/                    # Pattern storage (JSON files)
│   ├── patterns/
│   │   ├── spu/               # Sentence Pattern Units
│   │   └── cpu/               # Cadence Paragraph Units
│   ├── rejected/              # Anti-pattern memory
│   ├── preferences/           # User preference profile
│   └── taxonomy/              # Classification systems
│
├── data/
│   └── labeled-patterns.json  # Pre-labeled training patterns
│
├── docs/
│   └── MINING_GUIDE.md        # User guide
│
└── index/
    └── patterns.db            # SQLite search index
```

---

## Core Concepts

### Pattern Types

#### SPU (Sentence Pattern Unit)

A single sentence structure with rhythm characteristics:

```json
{
  "type": "SPU",
  "template": "The [X] isn't [Y]—it's [Z].",
  "family": "negation_pivot",
  "rhythmProfile": {
    "wordCount": 8,
    "syllableEstimate": 10,
    "clauseCount": 2,
    "punctuationProfile": { "emDashes": 1 }
  }
}
```

**16 Sentence Families:**
- `negation_pivot` - "The X isn't Y—it's Z"
- `colon_reveal` - "Here's what we learned: X"
- `em_dash_insert` - "The plan—however unlikely—worked"
- `question_answer` - "Why now? Because X"
- `list_resolve` - "A, B, and C: all point to X"
- `contrast_pair` - "X; Y"
- `conditional_snap` - "If X, then Y"
- `definition_is` - "Strategy is X"
- `analogy_bridge` - "Think of it like X"
- `parallel_triple` - "X. Y. Z."
- `reversal_but` - "X, but Y"
- `accumulation` - "X and X and X"
- `understatement` - "Not entirely X"
- `direct_command` - "Ship it."
- `fragment_punch` - "Complete sentence. Fragment."
- `extended_qualifier` - "Although X, despite Y, Z"

#### CPU (Cadence Paragraph Unit)

Multi-sentence patterns (2-8 sentences) capturing rhythm flow:

```json
{
  "type": "CPU",
  "template": "[Short]. [Medium]. [Longer]. [Snap].",
  "cadenceArchetype": "crescendo_snap",
  "cadenceContour": {
    "lengthContour": [4, 5, 15, 2],
    "archetype": "crescendo_snap",
    "archetypeConfidence": 0.8,
    "hingeSentenceIndex": 2
  }
}
```

**13 Cadence Archetypes:**

| Archetype | Contour | Signature | Best For |
|-----------|---------|-----------|----------|
| `crescendo_snap` | S-M-L-S | build-build-snap | Argument climaxes |
| `staccato` | S-S-S-S | punch-punch-punch | Urgency |
| `wave` | L-S-L-S | expand-contract | Narratives |
| `drumline` | M-M-M-M | march-march-march | Establishing authority |
| `slow_build` | S-M-L-XL | start-small-grow | Building to revelation |
| `punch_punch_land` | S-S-L | jab-jab-hook | Reveals |
| `long_short_snap` | L-S | expand-snap | Emphasis |
| `parallel_march` | M-M-M | same-same-same | Memorability |
| `spiral` | Variable | return-advance | Building themes |
| `bookend` | S-*-S | frame-develop-frame | Complete arguments |
| `ladder` | Variable | step-step-step | Logical arguments |
| `heartbeat` | S-M,S-M | beat-rest-beat-rest | Comparisons |
| `cascade` | S-S-S-M | trigger-collect | Cause-effect chains |

---

## How It Works

### 1. Text Extraction

When mining from a URL, the system:

```typescript
// packages/firecrawl/src/index.ts
async scrapeUrl(url: string): Promise<{ markdown: string }> {
  // Uses Firecrawl API to convert webpage to clean markdown
}

extractParagraphs(markdown: string): string[] {
  // Splits markdown into paragraph blocks
  // Filters noise (navs, footers, code blocks)
}

extractSentences(paragraph: string): string[] {
  // Splits paragraphs into sentences
  // Handles abbreviations (Mr., Dr., etc.)
}
```

### 2. Rhythm Analysis

Each text chunk is analyzed for rhythm characteristics:

```typescript
// packages/core/src/analysis/rhythm.ts

function analyzeRhythm(text: string): RhythmProfile {
  return {
    wordCount: countWords(text),
    charCount: countChars(text),
    syllableEstimate: estimateSyllables(text),  // English phonetic rules
    clauseCount: estimateClauses(text),          // Grammar markers
    sentenceCount: splitIntoSentences(text).length,
    avgWordsPerSentence: wordCount / sentenceCount,
    punctuationProfile: analyzePunctuation(text), // Periods, commas, em-dashes...
    lengthCategory: categorize(avgWords),         // short/medium/long/extended
    stressPattern: "S-M-L-S"                      // Sentence length sequence
  };
}
```

**Syllable Estimation Algorithm:**
```typescript
function estimateSyllables(word: string): number {
  // 1. Count vowel groups (basic syllable count)
  const vowelGroups = word.match(/[aeiouy]+/gi);
  let syllables = vowelGroups.length;

  // 2. Apply English phonetic adjustments
  if (/[^laeiouy]e$/i.test(word)) syllables--;  // Silent e
  if (/[^aeiou]ed$/i.test(word)) syllables--;   // -ed endings
  if (/[^aeiouy]le$/i.test(word)) syllables++;  // -le endings

  return Math.max(1, syllables);
}
```

**Cadence Classification:**
```typescript
function classifyCadence(lengthContour: number[]): CadenceArchetype {
  // Example: [4, 5, 15, 2] → crescendo_snap

  const lastIsShort = lengthContour[n - 1] <= 8;
  const isAscendingBeforeLast = contour.slice(0, -1).every((l, i, arr) =>
    i === 0 || l >= arr[i - 1] * 0.8
  );

  if (lastIsShort && isAscendingBeforeLast && n >= 3) {
    return 'crescendo_snap';
  }

  // Check other archetypes...
}
```

### 3. Candidate Generation & Scoring

Extracted patterns become candidates scored on 6 dimensions:

```typescript
// packages/core/src/scoring/index.ts

interface CandidateScore {
  total: number;          // Weighted composite
  intentMatch: number;    // Matches requested intent/role?
  novelty: number;        // Different from existing library?
  preferenceMatch: number;// Matches user preferences?
  reusability: number;    // Broadly applicable?
  antiCliche: number;     // Avoids overused phrases?
  rhythmQuality: number;  // Strong rhythmic characteristics?
}

function scoreCandidate(candidate, context): CandidateScore {
  // Default weights:
  // intentMatch: 25%, novelty: 20%, preferenceMatch: 20%
  // reusability: 15%, antiCliche: 10%, rhythmQuality: 10%

  return {
    total: weightedSum(dimensions, weights),
    ...dimensions
  };
}
```

**Anti-Cliché Detection:**
```typescript
// 80+ banned cliché phrases
const CLICHES = [
  'at the end of the day', 'think outside the box',
  'low-hanging fruit', 'move the needle', 'synergy'...
];

// 40+ "AI tells" (phrases that sound synthetic)
const AI_TELLS = [
  "let's dive into", "it's important to note",
  "interestingly,", "multifaceted", "navigate",
  "landscape", "tapestry", "myriad", "plethora"...
];
```

### 4. Interactive Evaluation Loop

The mining session presents candidates one at a time:

```
┌─────────────────────────────────────────────────────────────────┐
│ CANDIDATE #3                                            [SPU]   │
├─────────────────────────────────────────────────────────────────┤
│ "The [X] isn't [Y]—it's [Z]."                                   │
│                                                                 │
│ RHYTHM PANEL                                                    │
│ ├─ Length: 8 words · Short                                      │
│ ├─ Clauses: 2 (negation-pivot)                                  │
│ ├─ Punctuation: em-dash pivot                                   │
│ └─ Beat: staccato-snap                                          │
│                                                                 │
│ WHY IT WORKS: Clean negation-redefinition structure.            │
│ WHY IT MIGHT FAIL: Overused pattern; can feel formulaic.        │
└─────────────────────────────────────────────────────────────────┘

[a] Accept  [r] Reject  [s] Skip  [m] Merge  [d] Detail  [q] Quit
```

**Rejection Reasons (learned over time):**
| Key | Reason | Effect on Future Scoring |
|-----|--------|--------------------------|
| 1 | Too vague | Prefer concrete patterns |
| 2 | Too cute | Prefer earnest over clever |
| 3 | Too long | Prefer compression |
| 4 | Too abstract | Prefer grounded language |
| 5 | Too academic | Prefer accessible prose |
| 6 | Cadence flat | Value rhythm variety |
| 7 | Cadence manic | Prefer controlled energy |
| 8 | Meaning unclear | Clarity non-negotiable |
| 9 | Sounds like AI | Allergic to synthetic prose |

### 5. Preference Learning

User decisions update the preference profile:

```typescript
// library/preferences/profile.json
{
  "defaultAudience": ["essay", "exec"],
  "preferredSentenceLengthRange": [8, 20],
  "preferredCadenceArchetypes": ["crescendo_snap", "punch_punch_land"],
  "dislikedCadenceArchetypes": ["staccato"],
  "favoredFamilies": ["negation_pivot", "colon_reveal"],
  "dislikedFamilies": [],
  "bannedPhrases": ["synergy", "paradigm shift"],
  "dislikedTells": ["let's dive into", "it's important to note"],
  "scoringWeights": {
    "intentMatch": 0.25,
    "novelty": 0.20,
    "preferenceMatch": 0.20,
    "reusability": 0.15,
    "antiCliche": 0.10,
    "rhythmQuality": 0.10
  },
  "totalAccepted": 47,
  "totalRejected": 123,
  "rejectionReasonCounts": {
    "too_vague": 34,
    "sounds_like_ai": 28,
    "too_long": 22,
    ...
  }
}
```

### 6. Storage & Search

**Dual Storage System:**

1. **SQLite Index** (`index/patterns.db`) - Fast search
   - Pattern metadata indexed for quick filtering
   - Full-text search capability
   - Fingerprint-based deduplication

2. **JSON Files** (`library/patterns/`) - Complete data
   - Full pattern details with annotations
   - Version history
   - Human-readable for manual editing

**Search Pipeline:**
```typescript
function searchPatterns(query: SearchQuery): PatternUnit[] {
  // 1. Filter by type, tier, audience
  let results = db.query(`
    SELECT p.* FROM patterns p
    LEFT JOIN pattern_intents pi ON p.id = pi.pattern_id
    LEFT JOIN pattern_roles pr ON p.id = pr.pattern_id
    WHERE (? IS NULL OR pi.intent = ?)
    AND (? IS NULL OR pr.role = ?)
    AND (? IS NULL OR p.cadence_archetype = ?)
    ...
  `);

  // 2. Score relevance
  results = results.map(p => ({
    pattern: p,
    relevanceScore: computeRelevance(p, query)
  }));

  // 3. Sort and limit
  return results.sort((a, b) => b.score - a.score).slice(0, query.limit);
}
```

---

## Intent & Role Taxonomy

### 12 Intent Tags

Intents describe the **job** a pattern does:

| Intent | Description | Signal Words |
|--------|-------------|--------------|
| `hook` | Grab attention, create curiosity | "suddenly", "but", "what if" |
| `frame` | Establish context/lens | "the real question is", "think of it as" |
| `reframe` | Shift reader's perspective | "actually", "isn't X, it's Y" |
| `crystallization` | Compress into memorable form | "in other words", "simply put" |
| `pivot` | Turn argument direction | "but", "however", "yet" |
| `reversal` | Flip expectations | "actually", "the opposite" |
| `concede_counterpunch` | Acknowledge then respond | "yes, but", "granted, however" |
| `build_momentum` | Increase intensity | "and then", "even more" |
| `slow_down` | Create productive pause | "let's pause", "consider" |
| `summarize` | Condense to takeaway | "in short", "the point is" |
| `foreshadow` | Hint at what's coming | "soon", "as we'll see" |
| `callback` | Reference earlier content | "remember when", "as we said" |

### 12 Paragraph Roles

Roles describe **where** in an argument a pattern belongs:

| Role | Description |
|------|-------------|
| `opening` | First words of a piece |
| `hook` | Attention-grabber |
| `frame` | Context-setter |
| `argument` | Core claim-making |
| `evidence` | Supporting material |
| `pivot` | Direction change |
| `transition` | Section connector |
| `concession` | Acknowledging opposition |
| `counterpunch` | Responding to concession |
| `definition` | Defining terms |
| `elaboration` | Adding detail |
| `close` | Final statement |

---

## Technical Implementation Details

### Template Extraction

Patterns are abstracted into reusable templates:

```typescript
function extractTemplate(text: string): string {
  return text
    // Proper nouns → [Name]
    .replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g, '[Name]')
    // Numbers → [N]
    .replace(/\b\d+(\.\d+)?(%|st|nd|rd|th)?\b/g, '[N]')
    // Quotes → [Quote]
    .replace(/"[^"]+"/g, '"[Quote]"')
    // Long noun phrases → [X]
    .replace(/\b(the|a|an)\s+([a-z]+\s+){2,}[a-z]+\b/gi, '[X]');
}

// "Amazon reported $134B in Q3" → "[Name] reported [N] in [N]"
```

### Fingerprinting & Deduplication

Each pattern gets a fingerprint for similarity matching:

```typescript
interface FingerprintComponents {
  structure: string;          // Abstracted syntactic structure
  lengthBucket: 'S'|'M'|'L'|'XL';
  punctuationSignature: string; // "C-E-P" = comma, em-dash, period
  clausePattern: string;        // "2-1" = 2 clauses then 1
}

function similarity(a: string, b: string): number {
  // Jaccard similarity on word sets
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));

  const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
  const union = wordsA.size + wordsB.size - intersection;

  return intersection / union;
}
```

### Sentence Splitting

Handles abbreviations and edge cases:

```typescript
function splitIntoSentences(text: string): string[] {
  // Protect abbreviations
  let processed = text
    .replace(/Mr\./g, 'Mr\u0000')
    .replace(/Mrs\./g, 'Mrs\u0000')
    .replace(/Dr\./g, 'Dr\u0000')
    .replace(/vs\./g, 'vs\u0000')
    .replace(/e\.g\./g, 'e\u0000g\u0000')
    .replace(/i\.e\./g, 'i\u0000e\u0000');

  // Split on sentence boundaries
  return processed
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.replace(/\u0000/g, '.').trim());
}
```

---

## Data Flow Example

### Mining Session Flow

```
1. User: npm run mine -- --intent pivot --role argument

2. CLI parses intent=pivot, role=argument

3. Firecrawl fetches URL or user pastes text

4. Text split into paragraphs, then sentences

5. For each candidate:
   ├─ Analyze rhythm profile
   ├─ Detect pattern type (SPU/CPU)
   ├─ Classify sentence family
   ├─ Predict intents and roles
   ├─ Score against 6 dimensions
   └─ Generate why it works/fails

6. Display candidate with rhythm panel

7. User decision:
   ├─ [a] Accept → Store pattern, update preferences
   ├─ [r] Reject → Log reason, learn preference
   ├─ [s] Skip → Move to next
   ├─ [m] Merge → Combine with existing
   └─ [q] Quit → Show session summary

8. Session ends:
   ├─ Save accepted patterns to library/patterns/
   ├─ Save rejected to library/rejected/
   ├─ Update library/preferences/profile.json
   └─ Show coverage report and next focus suggestion
```

---

## Quality Assurance

### Pattern Validation

Before patterns become "active", they should pass:

1. **Meaning Preservation Test**: Can the pattern be filled in different ways while preserving the structural effect?

2. **Cadence Preservation Test** (CPU only): Does swapping content maintain the rhythmic contour?

3. **Evidence Threshold**: Pattern used successfully 3+ times in real writing

### Tier System

- **Archive Tier**: New patterns start here
- **Active Tier**: Battle-tested patterns

```bash
npm run promote -- pattern_123   # Archive → Active
npm run demote -- pattern_123    # Active → Archive
```

---

## Usage Examples

### Basic Mining

```bash
# Mine for opening hooks
npm run mine -- --role opening --intent hook

# Mine for pivot patterns suitable for executives
npm run mine -- --intent pivot --audience exec

# Mine for crescendo-snap cadences
npm run mine -- --cadence crescendo_snap

# Quick mode (hotkeys only, no detailed prompts)
npm run mine -- --quick --intent reframe
```

### Searching the Library

```bash
# Find pivot patterns
npm run search -- --intent pivot

# Find short, punchy closers
npm run search -- --role close --family fragment_punch

# Show pattern details
npm run show -- pattern_abc123
```

### Library Statistics

```bash
npm run stats

# Output:
# LIBRARY COVERAGE
# ├─ Opening hooks: 5 (good)
# ├─ Pivots: 2 (needs more)
# ├─ Transitions: 0 (PRIORITY)
# └─ Definitions: 3 (good)
```

---

## Configuration

### Environment Variables

```bash
# .env
FIRECRAWL_API_KEY=your_api_key_here
```

### Preference Customization

Edit `library/preferences/profile.json` to:
- Set default audience
- Adjust scoring weights
- Add banned phrases
- Configure cadence preferences

---

## Technology Choices

| Choice | Rationale |
|--------|-----------|
| TypeScript | Strong typing for complex pattern structures |
| Node.js | Superior CLI libraries (inquirer, chalk, commander) |
| better-sqlite3 | Synchronous SQLite for fast, low-latency interaction |
| Firecrawl | Clean URL-to-markdown extraction |
| Vitest | Fast, modern testing |
| Monorepo | Clear separation between CLI, core, and integrations |

---

## File Reference

| Path | Purpose |
|------|---------|
| `apps/cli/src/index.ts` | CLI entry point |
| `apps/cli/src/commands/mine.ts` | Mining session logic |
| `packages/core/src/types/index.ts` | Core type definitions |
| `packages/core/src/analysis/rhythm.ts` | Rhythm analysis engine |
| `packages/core/src/scoring/index.ts` | Candidate scoring pipeline |
| `packages/core/src/storage/index.ts` | SQLite storage layer |
| `library/taxonomy/intent-tags.json` | Intent taxonomy |
| `library/taxonomy/cadence-archetypes.json` | Cadence archetype definitions |
| `library/preferences/profile.json` | User preference profile |

---

## Version History

- **1.0.0** (2024-01-31): Initial release with complete mining, scoring, storage, and preference learning systems

---

## Summary

Rhythm-Aware Pattern Miner transforms the art of collecting writing patterns into a systematic, rhythm-aware practice. By treating sentence structures as instruments with measurable cadence, and by learning user preferences over time, it enables writers to build a personal "writing brain"—a curated library of patterns that reliably produce specific effects.

The system's key innovations:
1. **Rhythm-first analysis**: Cadence archetypes, sentence families, stress patterns
2. **Multi-dimensional scoring**: Intent match, novelty, preference alignment, anti-cliché
3. **Preference learning**: Rejection reasons and acceptance patterns train the scorer
4. **Dual storage**: Fast SQLite search + complete JSON records
5. **Interactive evaluation**: Accept/reject loop with immediate feedback

This creates a feedback loop where mining sessions continuously improve pattern quality and alignment with the writer's personal style.
