# What I Wish I'd Known About Building AI Teams

## SITUATION_SETUP

Three years ago I was asked to build an AI practice from scratch. One person, no team, no playbook. Just a mandate to figure out how AI consulting should work.

I made every mistake you can make. I'm going to tell you what I learned, because the lessons aren't obvious and nobody told me.

## EXPECTED_ADVICE_REJECTED

The standard advice for building an AI team is to hire AI experts. Get people with machine learning credentials. Recruit from FAANG. Poach data scientists with impressive publication records. The talent market is competitive, so pay whatever it takes to get people who already know the technology.

This advice sounds right. It's poison.

Every team I've seen follow it built the same thing: a collection of smart people who couldn't ship. The data scientists could explain attention mechanisms but couldn't explain why a client should care. The ML engineers built models that worked on their laptops and nowhere else. The "AI strategists" produced strategies that were McKinsey decks with "AI" inserted. Impressive credentials. Zero deployed systems.

The problem isn't that expertise doesn't matter. The problem is that AI expertise alone produces what I've started calling "demo-ware"—impressive demonstrations that solve no real problem. The gap between "technically works" and "actually useful" is where most AI projects go to die. Pure technical talent can't cross it.

I hired three data scientists with perfect credentials. Two couldn't talk to clients without drowning them in jargon. The third could talk but couldn't ship code without someone cleaning up after him. None of them understood that the boring work—data pipelines, integration, governance—was where projects actually lived or died.

## REFRAMING_PREMISE

The real question isn't "who has AI skills?" It's "who can learn what matters while building things that work?"

This changes everything.

AI skills have a half-life of maybe eighteen months. What you know about transformers today will be trivia by 2027. The frameworks change. The capabilities change. The best practices change. Hire for current expertise and you're hiring for yesterday's problems.

But the ability to learn while shipping—to figure out what a problem actually needs while building a solution—that doesn't expire. The people who can do this are the ones who ship. They're rarely the ones with the most impressive credentials.

You stop looking for people who know AI. You start looking for people who can learn AI while doing something useful with it.

## MECHANISM_REVEALED

Here's why this works.

AI projects fail in what I call the "ship-or-die gap"—the space between technical possibility and practical reality. The model works in the lab but not in production. The accuracy looks good until you see what 2% error means at scale: two thousand wrong decisions per hundred thousand transactions. The system handles easy cases but breaks on the edge cases that actually matter.

Crossing this gap requires understanding constraints. Not technical constraints—those are documented, learnable, Google-able. The real constraints: what users will actually do, where the workflow breaks, which edge case kills adoption. You only learn these by building and watching things fail.

The people who navigate this well share a trait: they're obsessed with constraints. They get excited when something doesn't work because it tells them something new. They ask "what happens when the data is missing?" before they ask "what model should we use?" They care about the boring parts.

Credentials don't predict this. Raw intelligence doesn't predict this. What predicts it is curiosity—specifically, curiosity about the unglamorous.

I interviewed a candidate who spent thirty minutes asking about our data quality processes. Thirty minutes. No other candidate had mentioned data quality at all. They wanted to talk about models and architectures and the exciting stuff. She wanted to know how we knew our inputs were trustworthy. I hired her immediately. She became one of our best people—not because she was smarter, but because she cared about the thing that determines whether projects ship.

## CONTRAST_SERIES

Four contrasts predict who will actually deliver:

**Curiosity vs. credentials.** Credentials tell you what someone learned in the past. Curiosity predicts whether they'll learn what matters in the future. I ask candidates about the last thing that genuinely confused them. The people you want light up—they have three examples ready, they're excited to tell you. The people you don't want get defensive or change the subject. Curiosity is visible. You just have to look.

**Constraints vs. problems.** "Build a recommendation engine" is a problem. "Build a recommendation engine that works with 30% missing data, runs in 200ms, and can't access customer PII" is a design challenge. Most people focus on problems. The best people focus on constraints, because constraints are the actual specification. A solution that ignores constraints isn't a solution. It's demo-ware.

**Boring vs. shiny.** The demo gets the applause. The data pipeline gets deployed. I ask candidates about data governance now. If their eyes glaze over, they're a liability. If they perk up—if they have opinions about data governance—they might be someone who can ship. Everyone wants to work on models. Nobody wants to work on pipelines. But pipelines determine whether models see production.

**Learning vs. knowing.** Engineers adapt to AI better than strategists. Not because they're smarter—because engineering culture assumes you'll encounter things you don't understand and figure them out. Strategists often come from cultures where expertise is the point. You're supposed to know things. AI breaks that expectation constantly. The strategists who thrive are the ones who can tolerate not knowing, who find it exciting rather than threatening.

## ACTIONABLE_ADVICE

Hire new graduates over experienced people. I know this sounds backwards. But experienced consultants carry habits from a world that doesn't exist anymore. Ten years in traditional consulting means ten years of "how things are done" to unlearn. Someone fresh can be shaped by your culture from the start.

Three of my best hires came straight from undergrad. They outperformed expensive senior people within six months. Why? They didn't know what was supposed to be impossible.

Look for engineers who feel constrained by pure execution—who want to work on problems that matter but have the discipline of building things that actually work. Engineering culture expects things to break. That expectation is valuable. People without it assume their ideas will work and are devastated when they don't.

Pair every visionary with an operator. Best ideas in the world won't help you if nobody knows how to ship. Solo visionaries produce PowerPoints. Visionary-operator pairs produce products.

Retain with projects, not perks. The people you want can go anywhere. They stay because the work is interesting. If someone's desire to learn outpaces what you can offer, you'll lose them—and you should. The question is whether your projects are interesting enough to keep them. I lost two excellent people last year. Not to competitors. To boredom. They didn't leave for more money. They left because we weren't giving them hard enough problems.

Here's the counterintuitive part: the team that should have been able to ignore this advice—the one with the most resources, the biggest budget, the most PhDs—was the one that needed it most. Google has more AI talent than anyone. They've also killed more AI products than anyone. DeepMind built AlphaGo. It took them years to ship anything a normal business could use. Capability isn't the bottleneck. The ability to cross the ship-or-die gap is.

## OBJECTION_ANTICIPATED

The obvious objection: you still need technical skill. You can't just hire curious people and hope they figure out machine learning.

True. But the baseline is lower than you think. The technology has democratized. PyTorch and Hugging Face have collapsed the distance between "understands the concepts" and "can build something useful." Six months of serious self-study and someone can ship real AI systems. The scarce resource isn't technical knowledge. It's the judgment to know what to build.

The harder objection: what about specialized domains? Medicine, law, finance—surely you need people who already have that knowledge?

Yes. But the expertise you need is domain expertise, not AI expertise. Hire doctors who are curious about AI, not AI people who've read about medicine. Domain knowledge takes decades. AI knowledge takes months. Get them in the right order.

## CLOSE_WITH_GIFT

The secret I wish someone had told me three years ago: you're not looking for people who are good at AI. You're looking for people who are good at learning and building, who happen to be pointed at AI right now.

Those people are easier to find than credentialed experts. They're better at the job. They don't have prestige attached to a particular technique. They don't have egos invested in a particular architecture. They don't need to prove they're smart. They just want to solve problems and ship solutions.

Find the person who asks about data quality before they ask about models. The one who gets excited about constraints. The one who wants to know how things fail.

Build around them.

That's it. That's the whole secret nobody told me.
