# What I Wish I'd Known About Building AI Teams

## SITUATION_SETUP

Three years ago I was asked to build an AI practice from scratch. One person, no team, no playbook. Just a mandate to figure out how AI consulting should work.

I made every mistake you can make. I'm going to tell you what I learned, because the lessons aren't obvious and nobody told me.

## EXPECTED_ADVICE_REJECTED

The standard advice for building an AI team is to hire AI experts. Get people with machine learning credentials. Recruit from FAANG. Poach data scientists with impressive publication records. The talent market is competitive, so pay whatever it takes to get people who already know the technology.

This advice isn't wrong exactly. It's useless.

Every team I've seen follow this advice built the same thing: a collection of smart people who couldn't ship. The data scientists could explain attention mechanisms but couldn't explain why a client should care. The ML engineers built models that worked on their laptops and nowhere else. The "AI strategists" produced strategies that were McKinsey decks with "AI" inserted.

The problem isn't that expertise doesn't matter. The problem is that AI expertise alone produces demos, not products. You end up with people who can build impressive things that don't solve real problems. The gap between "technically works" and "actually useful" is where most AI projects die, and pure technical talent can't cross it.

I hired three data scientists with perfect credentials. Two of them couldn't talk to clients without lapsing into jargon. The third could talk to clients but couldn't ship code without someone else cleaning up after him. None of them understood why the boring work—data pipelines, integration, governance—was where projects actually succeeded or failed.

## REFRAMING_PREMISE

The real question isn't "who has AI skills?" It's "who can learn what matters while building things that work?"

AI skills have a short half-life. What you know about transformers today will be outdated in eighteen months. The frameworks change. The capabilities change. The best practices change. If you hire for current expertise, you're hiring for yesterday's problems.

But the ability to learn while shipping—to figure out what a problem actually needs while building a solution—that doesn't expire. The people who can do this are the ones who ship, and they're not the ones with the most impressive credentials.

This reframe changes everything about how you build the team. You stop looking for people who know AI. You start looking for people who can learn AI while doing something useful with it.

## MECHANISM_REVEALED

Here's why this works.

AI projects fail in the gap between technical possibility and practical reality. The model works in the lab but not in production. The accuracy looks good until you see what 2% error means at scale. The system handles the easy cases but breaks on the edge cases that actually matter to the client.

Crossing this gap requires understanding constraints. Not the technical constraints—those are documented, learnable. The real constraints: what users will actually do, where the workflow breaks, which edge cases kill adoption. You only learn these by building and watching things fail.

The people who navigate this well are obsessed with constraints. They get excited when something doesn't work because it tells them something. They ask questions like "what happens when the data is missing?" and "who decides if this output is good enough?" before they ask "what model should we use?"

Credentials don't predict this. Neither does raw intelligence. What predicts it is curiosity and a tolerance for unglamorous work.

I once interviewed a candidate who spent thirty minutes asking about our data quality processes. No other candidate had mentioned data quality at all. They all wanted to talk about models and algorithms. She wanted to know how we knew if our inputs were trustworthy. I hired her on the spot. She became one of our best people, not because she was smarter than the others, but because she cared about the thing that determines whether projects ship.

## CONTRAST_SERIES

The contrasts that matter:

**Curiosity vs. credentials.** Credentials tell you what someone learned in the past. Curiosity predicts whether they'll learn what matters in the future. I've started asking candidates about the last thing that genuinely confused them. The people you want light up. They have three examples ready. The people you don't want get defensive or change the subject.

**Constraints vs. problems.** "Build a recommendation engine" is a problem. "Build a recommendation engine that works with 30% missing data, runs in 200ms, and can't access customer PII" is a design challenge. Most people focus on the problem. The best people focus on constraints because constraints are the actual specification. A solution that ignores constraints isn't a solution.

**Boring vs. shiny.** The demo gets the applause. The data pipeline gets deployed. I've started asking candidates about their experience with data governance. If their eyes glaze over, they're a liability. If they perk up, they might be someone who can actually ship. Nobody wants to work on governance. Everyone wants to work on models. But governance determines whether models see production.

**Learning vs. knowing.** Engineers adapt to AI better than strategists. Not because engineers are smarter, but because engineering culture assumes you'll learn on the job. You're expected to encounter things you don't understand and figure them out. Strategists often come from cultures where expertise is the point—you're supposed to know things. AI breaks that expectation constantly. The strategists who thrive are the ones who can tolerate not knowing.

## ACTIONABLE_ADVICE

Hire new graduates over experienced people. This sounds wrong, but experienced consultants carry habits from a world that doesn't exist anymore. Someone with ten years in traditional consulting has ten years of "how things are done" to unlearn. Someone fresh can be shaped by your culture from the start. Three of my best hires came straight from undergrad. They outperformed expensive senior people within six months because they didn't know what was supposed to be impossible.

Look for engineers who want to think bigger. Not pure engineering backgrounds—engineers who feel constrained by execution, who want to work on problems that matter, but who have the discipline of building things that actually work. Engineering culture expects things to break. That expectation is valuable. People without it assume their ideas will work and are devastated when they don't.

Pair every visionary with an operator. You can have the best ideas in the world, but you can't go from zero to one without someone who knows how to ship. Solo visionaries produce PowerPoints. Visionary-operator pairs produce products. Build this into your team structure from the start.

Retain with projects, not perks. The people you want can go anywhere. They stay because the work is interesting. If someone's desire to learn outpaces what you can offer them, you'll lose them—and you should. The question is whether your projects are interesting enough to keep them. I lost two excellent people last year. Not to competitors. To boredom. The day I started treating project interestingness as a retention problem was the day retention improved.

## OBJECTION_ANTICIPATED

The obvious objection: you still need technical skill. You can't just hire curious people and hope they figure out machine learning. AI has a learning curve. Some baseline of capability is required.

True, but the baseline is lower than people think. The technology has democratized. Tools like PyTorch and Hugging Face have collapsed the barrier between "understands the concepts" and "can build something useful." Someone with six months of serious self-study can ship real AI systems now. The scarce resource isn't technical knowledge—it's the judgment to know what to build.

The harder objection: what about specialized domains? Some AI applications require deep expertise in medicine, law, finance. Surely you need people who already have that knowledge?

Yes, but the expertise you need is domain expertise, not AI expertise. Hire doctors who are curious about AI, not AI people who've read about medicine. The domain knowledge takes decades to acquire. The AI knowledge takes months. Get them in the right order.

## CLOSE_WITH_GIFT

The secret I wish someone had told me: you're not looking for people who are good at AI. You're looking for people who are good at learning and building, who happen to be working on AI right now.

Those people are easier to find than credentialed AI experts, and they're better at the job. They don't have prestige attached to a particular technique. They don't have egos invested in a particular architecture. They just want to solve problems and ship solutions.

Find people who ask about data quality before they ask about models. Build around them. The rest takes care of itself.
