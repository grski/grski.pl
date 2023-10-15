Title: NO, YOU DO NOT NEED LANGCHAIN
Description: Observations from using langchain to develop a little more complex project and state of llm-based development.
Date: 2023-09-15
Authors: Olaf Górski
Slug: no-langchain
Language: en

Langchain is nowhere near sensible production-grade level and for anything other than fancy happy-path demos it makes stuff increasingly harder. ¯\_(ツ)_/¯


## Down the rabbit hole.

For 80% of the projects I've heard bout, **NO, YOU DO NEED LANGCHAIN.**

Sure, they've started to increase the code quality recently, but. tbh, till now I've seen lack of proper support, architecture or just sane engineering practices.
It's bloated, slow and adds shit tone of abstractions upon abstractions. OOP and dependency hell.

Inconsistent often. Won't even mention how I had 'Michael Jackson was not mentioned in this context " in our production code after one release. Also breaking changes without any warning? Sure why not. Real sensible Open Source software release processes? What's that?
Tests? Maybe they added something so far.

Docs are messy, sometimes out of date.

Some of these are being tackled by eg. langsmit but, as you can imagine, they are fighting problems now known anywhere else, for a price too.

Worst part is lots of people still use it. Given how it's still all very early in the lifecycle of AI/LLM-related projects, for now, this is fine (not everywhere tho). Some of the early adopters or people that have been using it for a bit more time with their apps growing in complexity, are probably already seeing this.

I say it still has some use-cases, especially around data ingestion part (which I think llamaindex might do better anyway) which it's good at, but as for the rest? No idea.

The basic ecosystem of eg. plain openai client has grown enough for us to just do better with even the bare client. Langchain is becoming an unncessary wrapper whose detriments outweight the benefits.

And, well, it's not rare with all the other AI/LLM-craze related packages. Latest new cool kid on the block: open-interpreter (or let's-wrap-llm-output-in-eval()-and-see-what-goes-wrong). 21k stars on github. Fancy demo, nice README, but then we look into the code - 2nd commit has added the whole venv to the repo. In the third one similar with pycache files.
Then you see stuff like on screenshot.

My prediction is in 6 months either langchain (and a lot of similar libs/projects) will start seeing the effects of the decisions made, when it all goes to production where real debugging/obervability or resilience is required. They'll either have to dramatically improve, which given the codebase, is unlikely, or a need for smaller, more down-to-the-basics libs will explode.

Stop being lazy, read additional 5-10 lines of documentation and use the goddamn base lib, you'll thank me later. For simple RAG scenarios that 90% have, it's all you need.

And I'm not the only one. Recently saw a post by Francesco Saverio Zuppichini https://lnkd.in/e2HVePRe with similar thoughts. BTW follow the guy, if you find my posts relevant, with my sometimes 'angry-kid-raging-flow', he's next level there, gotta love it.)

Thanks Maciek Szczesniak for sharing these gems
