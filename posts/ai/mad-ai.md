Title: When AI/LLMs go MAD. Training LLMs on LLM-generated data and on fintetuning vs context augmentation
Date: 2023-07-17
Authors: Olaf Górski
Slug: mad-ai
Language: en


## MAD 

If you think self-improving, omnipotent AI is right behind the corner, and it's coming to take your job and life, I'd rethink that. 💥

AI, especially genAI, has its limitations. It still remains an amazing piece of technology and huge thing, especially in certain fields and if properly used/chained, but worry not, 
we are still far away from REAL breakthroughs that will stun the world. "THE" stuff is not here yet and won't be for some time. How long? No one knows. 🤔

What is coming keeps me excited, same as what's already here. Let's stay pragmatic though and not get carried away with the hype.

This however has interesting implications. In my opinion it's another case for going for context-augmented approach rather than fine-tuning, unless you have a large & curated corpus of data.
Providing context to a large and advanced general-purpose model eg. from a vector database such as [Qdrant](https://qdrant.tech/) will get you a VERY long way in my opinion and experience. Disclaimer: I love their product, so I'm biased. There are other vector dbs out there, but why bother.

In current state of advances and use-cases, for text-based genAI focusing eg on Customer Support use cases, I think very few companies can pull off fine-tuning a model to the point it'll be worth it and justified in terms of time & money spent. The case is different for other use cases or eg. numerical, system-generated data, so stuff like Fraud Detection, Churn & Intent prediction, so in general stuff that folks like [airt](https://www.linkedin.com/feed/update/urn:li:activity:7086388395559501824/#) do. In such cases what you can achieve with context based approach is limited. For the uses cases described here however, the case is as stated above, it's rare to be at that fine-tuning-is-worth-it point.

It's hard to judge the when you reach it, but I think once you are there it, you know. Most companies however, that are not focused purely on data, but on building particular products, might find their resources and talent pool lacking in this area. Context-based approach doesn't put such high standard on the volume of the data and expertise required.


I think it'd be interesting to see actual benchmarks that compare the relation between time/cost/complexity that you need to add in order to fine-tune a model vs the performance of simple prompt context augmentation based on vector similarity search. ANYHOW. Ramblings aside.

TLDR: to properly train AI you need curated large corpus of human-generated data. For now just using eg. Qdrant as a vector database that augments your general purpose model's input with context should have you covered for a long time to come, and this may be approach to consider rather than finetuning on poor data.

Back to the article - this part had me cracking:
"We term this condition Model Autophagy Disorder (MAD)."
aaand this one too:
"But then again, that might not be so hopeful after all. When AI takes over the world, maybe it won't kill humans; perhaps it'll just corral us into content farms, where we'll all be forced to write listicles about the "Star Wars" franchise and sacrifice our family recipes to Botatouille to keep the models running without collapsing."

The paper they mention: https://lnkd.in/eBZ-xkm4

## GPT-4 nerfed

Was GPT-4 so powerful, they nerfed it? 🧐 Yes, they did. Massively. 😿

Some interesting paper from Stanford & UC Berkeley researchers just got published in this matter.

We might wonder why exactly this happened, whatever it was economic viability, performance or scalability issues or if some companies/organisations have found that as it was this tool gave too big of a power to the masses, closing the gap that was previously rigorously maintained, between selected, chosen group of orgs/people and the rest of the society, the gap that the original GPT-4 helped to bridge, allowing wide swathes of people to do things that previously were out of their reach.

This is pure speculation of course, we don't know that, however my tin-hat sense is tingling here. Jokes aside, it's probably a little bit of both. Economic viability and scalability are important factor when running any software and then various orgs being annoyed how their fancy coding challenges, they worked years on, could be, until recently, thrown into the bin, plus their advantage they had from the scale effect got reduced too much. That's why I think we are observing this phenomena.

Can't confirm the details, but AFAIK stuff changed from GPT-4 being one 'big piece' into having more but smaller, more specialised 'pieces' tied together. And turns out these smaller pieces don't play as well together as one central piece. Or some pieces got disabled, or were made smaller.

Also I bet you my money that what we have access to as GA GPT-4 is one thing, but somewhere out there there's the original un-nerfed GPT-4 running with only a selected few having access to it.

Now, this, instead of bridging the gap, will only increase it.

Or it's just me and my conspiracy theories. Who knows.

Maybe it's just that suddenly the training data changed or whatever :)

The nerf however is quite considerable:
"For example, GPT-4 (March 2023) was very good at identifying prime numbers (accuracy 97.6%) but GPT-4 (June 2023) was very poor on these same questions (accuracy 2.4%). Interestingly GPT-3.5 (June 2023) was much better than GPT-3.5 (March 2023) in this task. GPT-4 was less willing to answer sensitive questions in June than in March, and both GPT-4 and GPT-3.5 had more formatting mistakes in code generation in June than in March."

Don't take me wrong - GPT-4, even nerfed, is still AMAZING. However not as good as it used to be.

The paper mentioned: https://lnkd.in/erVeSGt7

ven with the reduced capabilities, it still remains an amazing tool. IMO, a lot of people, except tech-savvy passionates of the topic, will not even notice, but IMO this will set a precedent so I expect more competition to pop out and greater diversification of the models/companies at least, but I doubt any of the truly powerful ones will be publicly available, unless the Open Source catches up. So I'd expect the GA stuff to be always at least a step or two behind. Unless they release it too quickly like they did with gpt-4 and only after they realised (or got pressured coz of economic viability OR various powers)

I think the best stuff will be reserved for big enterprises/orgs, however it's a good motivation to work on the OS efforts. 
LLaMa 2 being released (and available through Azure soon as on-prem option!) 
Cloudev2 just got released.
We've had couple of talks with eg. Google's team and they are also doing interesting stuff, new updates incoming.
IMO the direction is towards a future where it won't be just openai as the only sensible solution, maybe even already we are there. 


TLDR: i think more diversity in the topics is incoming

## Evaluating

GPT Assisted Evaluation Metrics
 Correctness
 Factuality
Obedience
 Instruction following

