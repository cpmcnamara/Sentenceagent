# The Vocabulary Test

## CREDENTIALS_ESTABLISHED

I've read maybe two hundred AI strategy documents. Not skimmed—read, with a highlighter, looking for what companies actually say when they're trying to sound serious about AI. After a while you start to notice patterns. The same phrases appear in document after document, company after company, as if there's a template everyone copies from.

There is. And what's in it tells you more about why AI projects fail than any technical post-mortem.

## CONTROVERSIAL_CLAIM

Here's my thesis: the language companies use to talk about AI predicts whether their projects will succeed. Not the strategy. Not the budget. Not the talent. The words.

When a company writes "AI Center of Excellence," that project will fail. When they write "Data-Driven Transformation," that project will fail. When they write "Democratize AI Across the Organization," that project will fail. I can tell you the outcome from the vocabulary before a single line of code gets written.

This sounds like superstition. It's not. The vocabulary reveals how the company thinks, and how they think determines what they build.

## SKEPTIC_ANTICIPATED

The obvious objection: surely the words don't matter. What matters is execution. A company could use buzzword-heavy language and still ship great AI systems, or use plain language and fail completely.

In theory, yes. In practice, I've never seen it.

The reason is that vocabulary isn't decoration—it's diagnosis. When someone writes "Center of Excellence," they're revealing that they think AI is a capability to be centralized, controlled, and dispensed. When someone writes "Democratize AI," they're revealing they think AI is a resource to be distributed, like office supplies. Both framings are wrong, and both lead to the same place: projects that look good in presentations and die in production.

Consider what "Center of Excellence" actually means. A center implies a periphery—people who aren't in the center, who must come to the center for AI. Excellence implies the center knows something others don't. The phrase encodes a model where AI expertise lives in one place and gets requested by other places. This model works for shared services like legal review or graphic design. It fails for AI because AI isn't a service you request. It's a capability that has to be embedded in the problem, shaped by the people who understand the problem, iterated based on what actually happens when you deploy.

A "Center of Excellence" can't do this. It's too far from the problems. It doesn't know which edge cases matter. It builds generic solutions and hands them off, and the handoff is where things die.

The vocabulary predicted this. Not because the words are magic, but because the words reveal the mental model, and the mental model determines the architecture, and the architecture determines the outcome.

## CONCEPTUAL_TOOL

I want to introduce a test I call the "vocabulary audit."

Take any AI strategy document and circle every abstract noun and every passive construction. "Transformation," "enablement," "acceleration," "leverage." "AI will be deployed." "Value will be created." "Capabilities will be developed."

Then ask: who does what to whom?

In most strategy documents, you can't answer this question. The language is deliberately agentless. Things happen, but nobody does them. AI "transforms" the business—but who builds it? Who maintains it? Who decides if it's working? The passive voice isn't just bad writing. It's evasion. The authors don't know who will do the work, so they write sentences where nobody has to.

Now compare to documents from projects that shipped. The language is concrete and active. "The inventory team will test the demand forecasting model with Q3 data." "Maria's group owns the data pipeline and will flag quality issues weekly." "We'll kill the project if accuracy is below 85% after eight weeks."

The vocabulary audit catches the difference immediately. Passive abstractions mean nobody owns anything. Active specifics mean someone will be embarrassed if it doesn't work.

## MECHANISM_EXPLAINED

Why does vocabulary predict outcomes so reliably? Three mechanisms.

First, abstract language lets everyone agree while meaning different things. "AI Transformation" sounds like consensus. But the CFO hears cost reduction, the CTO hears infrastructure modernization, the CMO hears customer personalization, and the COO hears process automation. They all nod at the same phrase while expecting different outcomes. When the project starts, these differences surface as conflict. The vocabulary didn't cause the misalignment—it hid it.

Second, passive constructions let nobody be responsible. "Capabilities will be developed" doesn't specify who develops them, who pays for them, who gets blamed if they're late, who decides if they're good enough. The absence of agents in the language creates an absence of ownership in the organization. I've seen projects run for eighteen months with no clear owner because the strategy document never named one. The vacancy was built into the vocabulary.

Third, buzzwords signal that a document was written to impress rather than to guide. "Democratize AI" isn't a plan. It's a wish. "Leverage machine learning to drive value" isn't an instruction. It's a placeholder for an instruction someone hopes to write later. When a strategy document is full of these, it means nobody has figured out what to actually do. They've written a document that sounds like a strategy because writing an actual strategy was too hard.

The mechanism in each case is the same: the vocabulary reflects the thinking, and unclear thinking produces failed projects. You could try to fix the vocabulary while leaving the thinking unchanged—replace every buzzword with a plain word—but it wouldn't help. The vocabulary is a symptom. The disease is that nobody has done the hard work of deciding who does what.

## EVIDENCE_STACKED

I started keeping track of the correlation three years ago. Not scientifically—just a spreadsheet with project names, key vocabulary from their strategy documents, and outcomes.

The patterns are stark.

Every project with "Center of Excellence" in its charter either failed outright or delivered something nobody used. Eight for eight. The phrase is a perfect predictor. The closest any came to success was an internal chatbot that technically worked but was abandoned after three months because the center didn't have capacity to maintain it for every team that wanted customizations.

Projects with "Transformation" in the title did slightly better—about a third delivered something—but the ones that succeeded invariably dropped the word from their working documents within the first quarter. The teams that shipped started calling it things like "the inventory forecaster" or "the routing model." Concrete nouns replaced abstract ones. The vocabulary shift marked a shift from performing strategy to doing work.

The best predictor of success wasn't any single word. It was the ratio of nouns to verbs. Documents heavy on nouns—"transformation," "excellence," "enablement," "capability"—failed. Documents heavy on verbs—"predict," "route," "flag," "alert"—succeeded. Verbs require actors and objects. They force you to say who does what. The grammar enforces clarity.

One document I remember had seventeen instances of "leverage" in twelve pages. That project burned through two million dollars and produced a proof-of-concept that was never deployed. Another document used "leverage" zero times but specified in the second paragraph that the project would be killed if it couldn't predict demand within 8% accuracy by week ten. That project shipped in nine weeks.

## COMPETITIVE_FRAME

Most consultants treat strategy documents as politics—necessary for buy-in, separate from real work. They write one version to get executives excited and another version to guide implementation. The assumption is that the fluffy language is harmless overhead.

It's not harmless. It's diagnostic.

When I review a potential project now, I ask for their AI strategy document first. If it reads like a press release—lots of "leverage," "transform," "enable," no names, no deadlines, no kill criteria—I know the project is in trouble regardless of budget or talent. The thinking isn't there. The document proves it.

This gives you an edge: while others evaluate projects based on technology or team or timeline, you can evaluate based on vocabulary. Before the first meeting, before the first demo, you can read ten pages and know whether the project will ship. Not because words are magic, but because words reveal thinking, and thinking determines outcomes.

## CLOSE_PROVOCATIVE

Pull up the last AI strategy document you wrote or received. Count the passive constructions. Count the abstract nouns. Look for "Center of Excellence," "Transformation," "Democratize."

Then ask: who does what to whom?

If you can't answer, the project was dead before it started. The vocabulary told you. You just didn't know to listen.
