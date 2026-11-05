# Writing rules for The Housam & Review

A short rulebook for posts that sound like a person wrote them. Check every post against it before it goes live.

## The voice

Housam writes in the first person. He is playful, a bit self-deprecating, and allowed the occasional long run-on sentence when he is excited about something. Keep that. Fix typos and broken grammar, but never sand a joke or an aside down into neutral polish. A post should sound like him explaining the thing to a friend, not like a press release about it.

## The classics, applied

**Orwell's six rules** ("Politics and the English Language", 1946):
1. Never use a metaphor or figure of speech you are used to seeing in print.
2. Never use a long word where a short one will do.
3. If it is possible to cut a word out, cut it out.
4. Never use the passive where you can use the active.
5. Never use jargon or a foreign phrase if there is an everyday English equivalent.
6. Break any of these rules sooner than say anything outright barbarous.

**Strunk & White: omit needless words.** "A sentence should contain no unnecessary words, a paragraph no unnecessary sentences." This does not mean every sentence is short. It means every word does work.

**Zinsser, "On Writing Well".** Clutter is the disease. Strip every sentence to its cleanest parts. Be yourself; the reader wants a person, not a committee. Use the specific word over the general one. End when you are done, not when you have summarized.

**Paul Graham, "write like you talk".** Read the sentence out loud. If you would never say it to a friend across a table, rewrite it until you would.

## Banned: the tells of AI and corporate prose

- **Inflated openers.** "In today's fast-paced world", "In the ever-evolving landscape of", "Have you ever wondered". Start with the thing.
- **The word list.** delve, tapestry, testament to, it's worth noting, it's important to note, navigate the landscape, unlock, unleash, seamless, robust, leverage (as a verb), game-changer, cutting-edge, elevate, empower, journey (for a project), realm, harness, crucial, pivotal, embark.
- **Rule-of-three padding.** "Fast, reliable and scalable." If only one of the three is true or interesting, say that one.
- **"Not just X, but Y"** and its cousins ("It's not about X, it's about Y", "X isn't a bug, it's a feature"). Say Y.
- **Tidy moral summaries** at the end of every section ("And that's the real lesson here."). One takeaway section per post at most, and only if it says something new.
- **Headings on every paragraph.** A heading marks a real change of subject. Three short paragraphs do not need three headings.
- **Hedging.** "Arguably", "in some sense", "it could be said that". Commit, or cut the claim.
- **Fake enthusiasm.** "Exciting", "amazing", "I'm thrilled to share". His real enthusiasm (caps, "ahaaaa", run-ons) is fine because it is attached to a specific moment.
- **Em dashes and en dashes.** None, anywhere. Use a comma, colon, period or parentheses. Hyphens in compound words are fine.

## What readers care about

- **A concrete problem.** What broke, what was in the way, what he wanted that did not exist.
- **The surprising detail.** The bug that was a unit mix-up, the compiler that kept a value in a register. Lead with it when you can.
- **Numbers that mean something.** Performance before and after, money, a real constraint, an error size. "14 dB of error" earns its place.
- **What went wrong.** Failures are the most interesting part of any build. Keep them.
- **What he would do differently.** Concrete and short.
- **Real code and real screenshots**, where they show something the prose cannot.

## What to cut

- **Inventory counts.** Do not quote how many things exist unless the number is the point. "45 files", "153 of 184 commits", "30 projects", "12 collections", "8 posts", "about 260 tools": cut or rephrase. Keep a number only when it is a result, a money amount, a constraint or a before/after.
- **Setup trivia.** What he typed to install something, which folder it lives in.
- **Lists of every library.** Name the one that matters to the story.
- **Throat-clearing.** "In this post I will walk through...". Just walk through it.
- **Recaps** of what the reader just read.
- **Paragraphs that exist only to sound thorough.** If a reader would skip it, cut it.

## Checks before publishing

1. Read the opening two sentences. Is the interesting thing there?
2. Search for the banned word list and for U+2014 and U+2013. Zero hits.
3. Look at every number. Is it a result, a constraint or money? If it is inventory, cut it.
4. Look at every heading. Does it mark a real change of subject?
5. Read the last paragraph. Does it add something, or only repeat?
6. Every fact, number, code block and image path must be true. Never invent a result or a quote. If a claim cannot be backed, cut it.
