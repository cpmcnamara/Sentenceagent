# Mining Guide

A guide to building your pattern library effectively.

## Philosophy

The goal isn't to collect patterns randomly. It's to build a **complete, personally-calibrated writing brain** that captures:

1. **Sentence structures** that reliably produce specific effects
2. **Cadence patterns** that create rhythm and momentum
3. **Emotional effects** that move readers
4. **Your preferences** for how writing should feel

## The Mining Loop

### 1. Start with Intent

Don't just browse. Come with a purpose:

```bash
# I need an opening hook
npm run mine -- --role opening --intent hook

# I need a way to pivot an argument
npm run mine -- --intent pivot --role argument_turn

# I need a crescendo-snap for a conclusion
npm run mine -- --cadence crescendo-snap --role close
```

### 2. Evaluate with Rhythm in Mind

When a candidate appears, don't just read the words. Feel the rhythm:

- **For SPU (sentences)**: Where's the pivot? Where's the punch? What punctuation creates the effect?
- **For CPU (paragraphs)**: What's the contour? Where's the hinge? What makes it land?

Ask yourself:
- Would I actually use this?
- Can I feel the rhythm when I read it aloud?
- Does it do the job I need?

### 3. Reject with Precision

When you reject, be specific. The tool learns from your rejections:

| Key | Reason | What it teaches |
|-----|--------|-----------------|
| 1 | Too vague | You prefer concrete, specific patterns |
| 2 | Too cute | You prefer earnest over clever |
| 3 | Too long | You prefer compression |
| 4 | Too abstract | You prefer grounded language |
| 5 | Too academic | You prefer accessible prose |
| 6 | Cadence flat | You care about rhythm variety |
| 7 | Cadence manic | You prefer controlled energy |
| 8 | Meaning unclear | Clarity is non-negotiable |
| 9 | Sounds like AI | You're allergic to synthetic prose |

### 4. Accept with Confirmation

When you accept, confirm or adjust the predicted tags:

- **Role**: Where in an argument does this belong?
- **Intent**: What job does it do?
- **Cadence**: What rhythm archetype (if CPU)?
- **Family**: What structural family?

The more accurate your tagging, the better your search later.

## Building Coverage

### Track Your Gaps

Run `npm run stats` to see what you have and what you're missing:

```
LIBRARY COVERAGE
├─ Opening hooks: 5 (good)
├─ Pivots: 2 (needs more)
├─ Transitions: 0 (PRIORITY)
├─ Definitions: 3 (good)
```

### Prioritize Strategically

Focus mining sessions on your gaps:

1. **Structural gaps**: Missing roles or intents
2. **Stylistic gaps**: Missing cadence types you use
3. **Tonal gaps**: Missing audience-specific patterns

### Avoid Redundancy

The tool warns you when patterns are too similar. Trust the warning. A library of 50 distinct patterns beats 200 repetitive ones.

## Quality Over Quantity

### The Evidence Rule

New patterns go to **archive tier**. They graduate to **active tier** only after:

1. You've used them successfully 3+ times
2. They pass meaning-preservation tests
3. They pass cadence-preservation tests (for CPU)

Promote manually: `npm run promote -- <pattern_id>`

### The Overuse Cap

Set overuse caps for patterns that become stale quickly:

- Strong patterns: 1-2 uses per piece max
- Versatile patterns: 3-5 uses per piece
- Foundational patterns: Unlimited

### The Hard Ban

Some patterns should never appear in certain contexts. Use the detail mode (`d`) to set hard bans:

- "This pivot pattern shouldn't open a piece"
- "This hook is too aggressive for exec communication"

## Emotional Layer

Remember: structure is the delivery mechanism; emotion is the payload.

When evaluating patterns, ask:
- What emotion does this create?
- How intense is it?
- How is the emotion delivered?

The tool tracks:
- **Primary effect**: The main emotion created
- **Secondary effects**: Supporting emotions
- **Intensity**: Subtle → Moderate → Strong → Intense
- **Delivery**: Direct, implied, accumulated, contrasted, etc.

## Validation Loop

### Test Your Patterns

The library is only valuable if it actually improves your writing. Validate by:

1. **Before/after comparisons**: Write something, then rewrite using patterns
2. **A/B testing**: Try different patterns for the same job
3. **Usage tracking**: Note which patterns actually get used

### Update Preferences

Your preferences evolve. Periodically review:
- Banned phrases (add new AI tells as you spot them)
- Favored families (promote what works)
- Disliked families (demote what doesn't)

## Daily Workflow

### Morning Session (15 min)
1. Check gaps: `npm run stats`
2. Mine one focused gap: `npm run mine -- --role [gap]`
3. Accept 3-5 strong patterns
4. Reject with precision

### Writing Session
1. Search for what you need: `npm run search -- --intent hook`
2. Apply patterns consciously
3. Note what works (promote later)

### Weekly Review (30 min)
1. Review accepted patterns from the week
2. Promote patterns you've actually used
3. Update preferences based on what's working
4. Plan next week's mining focus

## Advanced: Style DNA

As your library grows, it becomes a fingerprint of your style:

- Your preferred sentence lengths
- Your cadence archetypes
- Your emotional range
- Your structural signatures

This is your **Writing Brain**—a complete model of how you write at your best.

## Commands Reference

```bash
# Mining
npm run mine -- --role <role> --intent <intent>
npm run mine -- --cadence <archetype>
npm run mine -- --paste
npm run mine -- --quick

# Search
npm run search -- --intent <intent>
npm run search -- --role <role>
npm run search -- --family <family>
npm run show -- <pattern_id>

# Management
npm run stats
npm run promote -- <pattern_id>
npm run demote -- <pattern_id>

# Sources
npm run sources -- add <url>
npm run sources -- list
npm run sources -- test <url>
```
