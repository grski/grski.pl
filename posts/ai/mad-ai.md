Title: When AI/LLMs go MAD. Training LLMs on LLM-generated data and on fintetuning vs context augmentation
Description: Humans might not become obselete as soon as you think or why I still sleep soundly at night without worrying about AI taking over the world.
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

