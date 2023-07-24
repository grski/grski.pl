Title: Why your brain is 3 milion more times efficient than GPT-4 - dead simple introduction to Embeddings, HNSW, ANNS, Vector Databases and their comparison based on experience from production project
Description: Wild ramblings, raport from the field about choosing Vector Database for a particular project and a little bit of a rant about the current state of AI and how it's perceived, why human brains are a wonder of nature, and why it's far from 'thinking' and 'consciousness'.
Date: 2023-07-22
Authors: Olaf Górski
Slug: vdb
Language: en

Recently I had to go on journey into the Vector Database world and pick one for a particular project. And oh boy, was it a ride. Recently Vector Databases have gained a newfound attraction and spotlight thanks to the rise of LLMs. Such situation is both a blessing and a little bit of a curse, bringing some of the things attributed to LLMs to Vector Databases too - the perception they are 'a new thing', untested technology or some shiny crap good only for LLM-based stuff. All of which is wrong.

Vector Databases have been with us for waaay longer than most know. There's legit engineering, science and rigorous testing behind most of them over the span of multiple years. And there's a lot of them, they all have their own quirks, just a little bit like RDBMSes do, except the situation there is quite clear, at least for me, in most cases postgres FTW, I mean it's not 2005 anymore, we won't go with mysql or LAMP stack, right? Do most of you even remember what it is or am I exaggerating things?

In case of Vector Databases I was, and still am, actually, completely green. So I had to go around, gather facts, check stuff out and form my opinion regarding each particular database, as to select one for my particular use case.

Before we begin, let me put a disclaimer here. I do not title myself as an expert in AI. There are all my just personal ramblings, opinions, certainly biased. Take everything you read with a grain of salt and do your own due dilligence.

## Introduction to Vectors, Similarity and our amazing brains

Before we actually begin I think we should dig a bit deeper into what exactly we are playing around. If you are not interested in understanding how this all works in detail and how it relates to generative AI, feel free to skip this part and go over to the next section.

First we must lay down certain axioms (smart word for the common sense/ground rules we all agree upon and accept as true). 

One of such would be the fact that currently computers do not really understand words. They operate in what is called binary language, so a string of 0s and 1s. It's related to how electric charge, electrons and atoms work. Physics stuff. Very basics of CS and electronics.

So:

1. Computers do not understand words, they operate on binary language, which is just 1s and 0s, so numbers. Computers only understand numbers.

Knowing that, it becomes obvious, that we may face some problems. First of all if it's all just 1 or 0, how do we express different numbers? Well, that part is easy, because thanks to the decimal counting system. Long story short, we have 10 digits to express stuff, in binary you have 2. That means that you still can represent other numbers with base 2, the resulting number will be just a bit longer and calculated differently. I won't to into too much of a detail here, you can look it up yourself -> binary system, decimal system and how to convert from one to another. Or ask chatgpt for an explanation. It does a fine job. Just know that any natural number can be easily converted from base ten to binary e.g. "4" in decimal i s "100" in binary. They hold equivalent value, but are expressed differently. The case is a bit more complicated for floating point numbers, but let's not get into that now.

So first layer of abstraction is down. We have computers. Electric. Electrons. High current/low current, current/no current. 1s and 0s. 

These 1s and 0s of ours now can magically become numbers. This is what our computers operate on - in every case. When you dig deep enough, everything you interact with in the virtual world is in fact a number, so a particular configuration of these tiny little something's in the computer that either have electricity running through them, or they don't and that is interpreted as a number. Imagine 3 light bulbs. 1st is on, 2nd and 3rd are off. 1-0-0. We magically agreed that this means 4. Now make the size smaller probably by a thousand, a milion times or something, and you get an idea what's going on in that shiny macbook of yours. Back to the topic.

Numbers. Yes, we have then and are able to somehow interpret the current state of your computer, or it's part as it being a particular number.

Now that's not very useful, right? We, humans, mostly operate on text and language, right? Yup. Imagine a world where you have to decode numbers. in some magic dictionary to a word. The computers wouldn't be so useful now, would they? But that's how it looks in the background. Long time ago some smart dudes have gathered around that agreed that from now on, if we know we are dealing with text, we should interpret the number 65 as "A", "B" as 66 and so on. Of course, it changed, different people had different standards and agreements but who cares, let's simplify. We come to understand the second axiom:

2. We, as socity, have assigned certain roles/meaning to particular numbers, in this case it's letters.

Now that we have our computer, that understands numbers, and we know which numbers in which case are which letters, we kinda can start forming words for example. And if you have words you can have sentences, code, whatnot. That's more useful. All of your software builds on top of this base truth.

Now that we know that all words in fact, are nothing but numbers for your computer, we can go further than that.

For the computer, a given word, regardless of the context, based on the above, holds the same 'meaning' or 'value'. So even though you can say 'dust the furniture' as in clean or 'dust on the furniture' as in there's a mess, the representation (and the meaning) for the computer would stay the same, even though there's a mess and clean are two totally different things. So, even though we can convert a word for a distinctive number for the computer so it 'knows' kind of, what's up, there's missing 'context' to judge the meaning.

3. Words simply represented as binary numbers lack context.

Well, humans can be ingenious in the ways they do wicked things, but also in the ways the do great things. One such example here would be Contextualized word embeddings. What does that stand for? Well, let me tell you. 

So we have this now simple case of turning a series of 1s and 0s into numbers, numbers into letters and then words. That you already understood, right? We kinda explained the problem with that - lack of context. Well. We have developed methods that allow us to generate different and unique numbers for words, depending on their context or semantic meaning. So if we used Contextualized Word Embeddings in our example above, the 'dust' from 'dust the furniture' would get totally different number than the word dust in 'dust on the floor'. Now the computer knows that these two have different meaning! How does that exactly work? It's a piece of work, let me tell you, but we won't cover that in this text. First of all I'd have to understand that myself haha. 

Long story short, we have a magic function that does this:

```python
number_representation_of_a_word_and_meaning("dust", context="dust on the floor") == 42
number_representation_of_a_word_and_meaning("dust", context="dust the floor") == 24
```

The values are not random - words that within certain context have different meaning probably will have very different number assigned to them. A number that is far apart from the other one. If the meanings were similar, but just slightly different depending on the context, we'd have numbers that are closer to each other.

```python
number_representation_of_a_word_and_meaning("bark", context="bark is a noun") == 12
number_representation_of_a_word_and_meaning("bark", context="bark is a verb") == 19
```

Why is that? "Bark" and "bark" both relate to something that is assosciated with outer protection or covering. If a dog barks usually it is a sign of danger, something related to safety, protection. The tree has a bark in order to protect itself from the environment. It's different, still, but this time we share a certain common theme at least in some sense, hence the numbers we got are closer together than in the previous case, because they are more similar.

Also

4. Similar meaning of words, in a particular context, converted to numbers, are closer to each other than radically different meanings.

By the way, what are embeddings you might wonder? Why did I not describe it earlier? Because we need to understand the above to understand embeddings. More or less it's what we described, so the way of representing a number based on particular set of criteria (in our case the semantic meaning) as similar numbers, even if they are not similar raw value wise. So in the embeddings world, 'dust' would be, as a number, closer to 'clean' than 'dust' would be to 'dirt'. At least that's how I understand it. And 'dust' as in 'dust the floor' would be far away from both 'dust on the floor' or 'dirt'.

Alright, this one was a bit trickier, but we got there eventually. 

Again, let me reiterate. We have electrons and then electricity. Because of electricity (or to be more exact high/low current) we have 1s and 0s, so binary language. Next are numbers, binary numbers, so just numbers but expressed only with 1s and 0s, base 2. That gets converted to base 10, so the decimal system that we humans mostly use (not everywhere and not always lol). These numbers then get simply mapped to words with the same values regardless of the context, of the meaning, in the base case.

But nowadays, we iterated over that and can assosciate words with their meaning and assign different numbers, based on the context of the text or a sentence (sentence transformers sounds familiar?) and their semantic meaning. The groundbreaking publication about Transformer model. Go look it up. By the way look at the year it was published and how quickly we went from theoreticall stuff to something as amazing as GPT-4. INSANE. Either way. Semantic meaning, embeddings and transformer model. This is the reason that the LLMs or generative AI can sound so convincing, as if it really knew the stuff it generated. Nope, it doesn't. It just processes numbers, they do not intrinsically understand the meaning, they understand that 1 is closer to 2 than 24 is to 42, which is the answer to everything. See what I did there? This does not imply it 'understands' the meaning in the human sense and why I'm quite sure that AGI (Artificial General Intelligence), so something that 'really' thinks in the most human way, is so far away. The current technology and models, simply do not work like we assume them to.

Okay champ. We have these words mapped to different numbers, which are either closer or further away, depending on the semantic meaning in a particular context. What now?

Well, math magic comes in. I ain't no maths guy, I do enjoy the thought exercises or elementary and truthfully representation of stuff it can provide, nowadays I'd struggle to solve quadratic equation probably, being just a simple highschool dropout, but let me share with you my understanding of this absolutely marevelous phenomenon that happens.

So, numbers. In maths we have this thing called Algebra. It's a study of relationships between things that vary over time, which are represented by symbols, usually letters, which also can represent things, usually numbers. What? ... Yeah. That would be my reaction to this statement too, at least was in the past. Let's make it a bit more digestible. To put it in simple terms, for us numbers are things that allow us to measure reality, count things, they are building blocks of reality you could say. Almost everything (or as some would argue - everything), given a proper formula, could be represented as a number. Be it something so physical as the length of your arm, number of apples in your kitchen or something as abstract as human language or even the meaning of a word, which we have demonstrated above. That however relates to this particular branch of mathemathics and 'real' stuff. In here numbers are immanent, simple, natural, the best. What about branches of maths that operate on a bit different set of rules and so on? Different universes of sorts? Well, in there numbers might not be the best base unit of operation, in different universes we might need either different base building blocks or we might want to take numbers and extend them a bit, if you will, to make life easier. 

One such example is the study of Linear Algebra. Linear Algebra has 'vectors' (which in fact are numbers with certain additional stuff to abstract ideas and make life easier) the same way basic Algebra has numbers/symbols/variables. I won't go into the details here too much as my understanding is also not so perfect, and probably I'd spout some gibberish, but I hope you get the analogy.

So in Linear Algebra we have vector spaces, which deal with vectors, that have something to do with 'space' in general. Space might sound familiar because we talked about it. Remember the 'distance' between the numbers which were representations of meaning of a given word in a particular context? Yep, the same stuff let's say. 

Space can have many 'dimensions', similarly with vectors. If you have one dimension, it's just [1]. If we have two, e.g. X & Y axis, we can position a point in place by having, well, two numbers for each dimension, eg [1,1], this should ring a bell if you remember anything from your middleschool math class.
What if we have 3D space? Well, similar stuff. Notice how each additional dimension multiplies the number of all the possible vectors. So let's assume we are working on a limited range of natural numbers, 10. In 1D case, we have 10 options. In 2D space we have 10 possibilities for first one, 10 for the second one, which totals to 10 * 10 = 100 possible different combinations. In case of 3d? You get the idea.

So now imagine how insanely big the possibilities are, if we are working with a bit of a broader range (e.g. 65536 or 256) and not with 3 dimensions, but with 1536! That's INSANE. Absolutely insane, but also what allows our LLMs to seemingly perceive so many nuances in the meanings of the words and what nots. 

I know it was a long digression, but bear with me. Again. We have electrons and then electricity. Yeah, I'll spare you that repetition again. Number representation of a word based on semantic meaning. So we have a number per meaning in a given context let's say. This number gets then turned into a vector which lives inside vector space. To accomodate for the many meanings and contexts and how contextual our actions, words and speech are, this vector space should have appropriate number of dimensions. It can't have too much as it'd get too huge to process. OpenAI settled for 1536 dimensions. Remember each 'dimension' can be assigned a different 'value', so the total number of possible meanings is THE_MAX_NUMBER_WE_OPERATE_ON to the power of 1536. THAT"S A LOT. Anyhow.

We went from having 1s and 0s, to our words being evaluated in 1536 dimensions or 'meanings'. The more true to a particular meaning is that word, the higher the value it'll get in that dimension.

As you can see we have a problem now. How do we actually process such a humongous amount of data? Traditional methods don't really work well or would be too expensive computationally or economically. This is what we call "curse of dimensionality". To deal with this stuff like Approximate Nearest Neighbour Search problem show up. Meaning: how do we find similar vectors (numbers) in very high dimensional spaces? 

To resolve that puzzle we came up with Hierarchical Navigable Small World or HNSW. What is that? Long story short, even though the space is so HUGE, usually, in large networks, eg. human ones or social ones, despite the size, most nodes can be reached from any place in the network with surprisingly few steps. It's often reffered to as "six phones rule", that states that you are at maximum six phone call aways from anyone in the world. You know someone who knows someone and so on, then boom. Your message gets delivered to Obama. It's quite interesting actually. Important to note is that not all nodes in the network are connected equally. There are these things called as hyperconnectors, which connect to A LOT of nodes, and the contrary so, the nodes that are a bit lonely. I think you get the idea and seen an example in your life - almost everybody knows that someone who seems to know everybody everywhere. Either way, as I digress. If we take this Small World thing and add one more thing on top of it - hierarchy, managing even such a huge amount of data becomes doable. What does it look like? Simple. Think in terms of enterprise org chart. It's as if, let's say, you were a CEO and wanted to know something about if your company does use type hinting in python like human beings do. In HNSW the approach would be to first select a candidate, who might know something (be similar to the topic/value you search for) from a very few selected people in the company (mby the hyperconnectors should be at the top? ;)). Let's say the are Lead/Director level people. So you e.g. have Director of PeopleOPs, Director of Product, Director of Engineering and so on. Out of these, the semantic value of Director of Engineering will be most similar to "do we use type hinting in python". So we go to him and there we repeat the process. However our guys here are lazy for whatever reason. he doesn't want to check or write the answer, so he delegates.  -> who does the director know, who in the hierarchy is the level below him (these are the guys he knows best, he doesn't know the ones lower too well as he doesn't interact with them often) that should know the answer? So he repeats the process: Engineering Manager in Frontend team, EM in DevOps, EM in Backend team. Backend Team it is.

Now this process gets repeted till we hit the bottom most layer of hierarchy, how many there are is up to the organisation to decide.

This way instead of the CEO asking maximum number of N people in the worst case, assuming that only the last person knew, the question gets asked only N maximum number of times, where N is the number of layers in the hierarchy we have. Or something like that.

Of course if he asked the question to everyone he would have better data and could select the best answer. The one he will get in the case of using HNSW will be good enough (how good we want will require us to define a certain metric, but the more accurate the answer needs to be, the tricker it is computationally) but will cost SIGNIFICANTLY less to get. Think sth like rolling out a feature that covers 80% of the needs in 2 weeks vs perfecting it to 99.99% in 2 years. 80% (or 50 or 95) is usually good enough when you weight the pros and cons, cost/benefit.

WOAH. Long story long, this is what enables us to process such huge amounts of data taht is so high in dimensionality, that can accomodate the various context, nuances and meanings that is assosciated with for example human speech or thinking process.

Now imagine our brains do this at a higher and more profund level than this, they do it constantly, all the time, they fit into something small like our skull and run on the equivalent of 24 Watts of power per hour. In comparison GPT-4 hardware requires SWATHES of data-centre space and an estimated 7.5 MW per hour.  So around **312 500x** less while doing stuff that is thousand times more sophisticated. WHAT THE FLYING FK. We are a wonder of Nature. An amazing, fu**ing mess of a wonder but a wonder nonetheless. Also, keep in mind that our brains don't dedicate 100% of the horsepower to conscious thinking processes. According to Auburn Unviersity paper I found, cognitive neuroscientists believe that only 5% of our cognitive activity is conscious. So multiply this number by anything from 20 to a 100. Let's be conservative and say 10 for some reason. That's still over 3 million times the efficiency than GPT-4, while also having at least a magnitude (or at least N) greater complexity. I got carried away in the amazement. 

TLDR: 
Electrons -> Electricity -> Binary -> Binary Numbers -> "Human" or base 10 numbers -> Letters -> Words -> Embeddings -> (Semantically) Contextual Word Embeddings ->  Vectors -> Vector Spaces -> High Dimension Vector Spaces -> Approximate Nearest Neighbour Search or just Nearest Neighbour Search (ANNS/NNS) -> Hierarchical Navigable Small World (HNSW)

Soak up all these terms and write them down.

From here we are almost done. If you've been following closely you might start to piece the puzzles together.

LLMs are in fact just algorithms, very complex ones, that have indexed or ingested A LOT of data/words, vectorized and embedded them and their meanings in particular context. Then, based on that data, they just 'guess', based on context, that if we have this particular thing or meaning in a semantic context, so embeddings, so nubmers or vectors in high dimensional space, just right here, we probably have in mind this particular response which is nothing but a set of other embeddings. 

Also usually when we speak about embeddings, we deal with tokens, which usually are not whole words but like ~4 characters in English. 

So if based on the context and approximation, we know that this particular query seems like something that will be assosciated with this particular token, we will use it. Then if we have one token ahead, we can repeat the process till we start hitting lower levels of assosciation, which in turn means that we can probably stop generating as the answer is complete.

So... Yup. There's no thinking happening. Just assosciating numbers and guessing. You read that right. GPT-4 does not 'think' at all. It's as far away from human consciousness as we are from Putin being a good guy. This simply does not come even close. So it's the reason I do not worry at night (at least yet) AGI will come and replace me or go on a consciouss crusade against humanity.

Bear in mind, my understanding of the stuff is VERY limited, I'm all new to this. I've simplified A LOT not only for the reader, but also for myself. If any of this is unjustly inaccurate, let me know. I've googled most of the stuff along the way. 

WHOAH. DAMN THAT WAS LONG. 

Let's answer the initial question then. How do vector databases work then? Well, they take the text. Vectorize it. Embedd in high-dimension space, then if you query it, they search for approximate similar tokens/pieces/texts. Simple, right?

Now with that over, let's get to the stuff I had in mind when starting the article, so comparison of vector databases and a raport from using some of the more popular ones.

## Starting point - chromaDB

My starting point was [chromaDB](https://www.trychroma.com/). It allowed me get up & running quickly and seamlessly. It was dead simple and it got the job done. However it wasn't the best approach TBH. For a PoC? Yup, it did get the job done. But for more serious, potentially production-grade stuff? Not given how I implemented it. 

Long story short, for a PoC, I created this Q&A over a scraped knowledge centre app let's say. I needed a VectorDB deseprately. Pinecone was off-record for obious reasons that I'll list later on in the article, even though it was the easiest to implement I'd say. There was stuff like FAISS and what not, but the choice, over initial exploration, fell on chromaDB. 

I used a very dirty approach, where I packaged it together in one container with the API backend part of the application. ChromaDB persisted the vectors in their internal format in a certain directory in my project's repo. I simply commited it to the repo. Not the best, I know. 

Now, the whole VDB (Vector Database) was a part of our repo. I locally ingested the data that I needed in the VDB, then commited the state of the VDB to the repo.

chromadb got added as a project dependency (installing it is quite trivial - it's just a python package) to pyproject.toml and boom. Initialise it somewhere in the code during application startup and boom, you done. Again, this is very dirty approach. 

API is packaged in the same container as the DB. In this setup changes in the VDB  are not really persisted unless you commit them to the repo  - only the commited state matters (so read-only apps or go home champ). They share resources. If one fails, the other does too. It was somehow scalable given that we had read-only app, so it was self-contained but... 

The git repo got big, fast. The docker image build time got very long for my standards. I mean imagine 25-30m build time for a simple fastAPI app. Not exactly desirable. This came from the fact that the chromadb was inside the container and had to be rebuilt each time the code changed, and as you can imagine, rebuilding db package can be quite time consuming (looking at you, psycopg).

We couldn't go on for long with this approach. Ofc you can run chromadb as a separate container, self-hosted, but that added overhead I didn't need at that time for a PoC. At that time, from what I remember, there was also no option to do proper clustering that'd allow you to get prod-level scalability, survavibality and so on. TLDR: you could run with a single instance and that's it. I also didn't see helm/k8s OOB support that'd make it easy to deploy in a cluster somewhere. On top of that other projects were in the pipeline, then what? Each of them should have their own instance? How would we share data? All of this meant, it had to go away.

But it allowed me to get off the ground, integrate fast, LEARN a lot and so on. For this purpose it did an AMAZING job.

Also, what needs to be said is **that some of the features mentioned weren't supported at the time** I was creating the project, which was **couple of months ago**. Since then **Chroma has closed $18M seed round,** developed a solid roadmap and started addressing some of what was mentioned here. We had a nice talk with Jeff Huber, chromadb's Founder, about all of this. I really loved a lot how he was humble and helpful enough to admit, that **given the preconditions for the project & productionisation**, chroma **at that time** wasn't exactly the best choice, and choosing something else for our needs was a smart move! He is a **very intelligent, passionate and brilliant guy,** so I'm more than eager to see how they develop, **however till we see the features shipped**, in the use cases we had in mind, it was a no-go. However to get started, have one-self-contained app with db inside and be done in 4h instead of 4 days (I know i exaggurate)? Sure, why not. If I was to make a comparison to something people are more familiar with,RDMBSes, I'd say the current chroma is like sqlite. Easier to comprehend now where it can shine and where it won't? Great. Also remember, my approach was simple. If you do it properly, set up all the proper stuff, configure it nicely, adhere to best practices, you probably won't run into any problems. I did not do that, lack of time & expertise.

A short edit here needed to happen. I've reviewed this together with Jeff (THANKS) and he shed light on how most of these issues got addresed in v0.4. 

They made an architectural shift in their design, changed the storage engine, the build is now at least 20x faster (which now makes my point invalid), requires way less memory (that was not an issue though, but is good to see) and is far more performand and durable (even in April I did not run into any issues with durability). Overall, as I've predicted before actually getting the message from Jeff, it's been a short time, yet they've made amazing progress. This made me reshuffle the recomendations part a bit and this + the coming changes, make chroma a strong candidate to evaluate. I still need to play around with it more to see the exact progress but seems promising.

So now, most of the stuff that I mentioned in this section, that were relevant at the time of making the choice - April, are not a concern now. Keep this in mind.

## Next steps 

So if chromaDB was out of the picture. What next? Let's see what's out there.

Let's start with stuff that failed fairly quickly.

### Pinecone

Long story short. It's a black box hosted somewhere, VDB as a Service. Proprietary. No-go. I want control over my data, where my db is deployed, where it lives and so on. Sorry. Privacy & Compliance would not be happy, same with myself.

### Faiss

It's just a library. not a full fledged VDB. It'd be a step back compared to chroma, so no. But for tiny PoCs? Possible. Evalute it. I didn't do that in detail.

### Milvus

This one seemed promising. Initially I thought we'd roll with them. Promised all the new shiny nice stuff, but then I actually started using it. Had troubles to even index the data. Started running into bugs (or documentation not explaining stuff dumb enough for me to get it or not explaining at all), weird edge cases and complications that I was not in for. In case of chroma I just plugged it in, ran my Langchain-based data-ingestion service and I was done. Here? Forget it. However it was farily decent and pleasant to run locally in docker, a bit less so in k8s, but still passable. Bonus points for OS, self-hosted version and on-prem + cloud possibilty. If I was to make a similar comaprison as I did in case of chromadb, I'd say Milvus is the old Oracle DB of Vector Database world. Plus I've heard some similar opinions and unconfirmed rumours regarding ceratin dubious possible origins/practices and policies. It did seem promising but ended up as  a failure last minute.

Eventually I did succeed in ingesting the data and so on, but the results were not satisfactory. Performance was okay, but I was done with frustration.

### pgvector

This one disappointed me greatly.

Bad performance. Unusual selection of the underlying algorithm. Some problems with accuracy, especially when concurrency comes into play. Think carefully if the ease of integration is worth it. In my opinion this + the performance weren't. Take a look at the benchmarks. It's not satisfactory to say the least.

It also turned out that it's not supported everywhere as it's relatively new extension, for postgres standards. 

And it's me who says this, guy who is team postgres. But postgres is a great RDBMS. Again, it does not specialise in vectors. 

The benefit here is it being a standard piece of infrastructure, having your data in one place, all the other benefits postgres brings. It's still useful piece of software.

Bear in mind though, that in AWS world, aurora does not support it yet. Meaning if you are in aurora world, you'll need to deploy a separate base postgres instance with pgvector enabled. This eliminates the main benefit.

However if you do not care about that, you are running your own pgvector instance, and just want to get started? Hm, maybe. So there might be some relevant and valid use cases, but not in my case.

The performance was not there, accuracy also, especially when concurrency is considered and throughput. We couldn't deploy it in our Aurora cluster, we'd need to go for separate RDS. I think I'll pass, however it was indeed tempting because of the postgres brand, it being so reliable and common, but let's consider the borader picture - this was 2nd iteration where I expected things to be done in a proper, future-proof manner.

For RDBMS just go postgres. For VDB? Think twice about using pgvector.

### Redis

Redis was a strong possible candidate. Good performance. Standard piece of infrastructure. Everyone knows redis, right? Features on the thin side though. I wasn't sure if, given some time, it'd be enough. But I kept it in place. It more or less worked. However It lingered in my mind that Redis is not specialised in Vectors. It's key value store. This is not the core of their business. Sure it'd be nice to be able to just deploy redis and have it done with. Everyone knows redis. However doubts sprouted in my mind, rightfully so eg. given their recent sunsetting of Redis Graph. 

However if you already have a Redis cluster running somewhere, for starting it might be enough. 

There is the question of perfromance, sure, but it's acceptable.

So, yeah, viable choice, but make a conscious decision.

### Qdrant

Open source? Check. Self-hosted option? Check. Cloud if you are lazy? Check. K8s? Check. Clustering? Check. Survavibality? Check. Performance? Off the charts. Community? Great. Integration with langchain and other libs? Yup. One-line docker and you good to go locally? You bet. I was sold. 

But then it got better. Within hours of signing up for their cloud offering to test things out I was approached by the founders to check in. Big shotout to @Andre Zayarni, @Fabrizio Schmidt and @Andrey Vasnetsov. Keep doing what you doing. We had a meeting set up right after. Tremendous knowledge. I really like the spirit they operate in or the values they highlight in some of their blog articles, especially the one related to closing the seed round. Andre's writing is sharp AF. Snarky remarks about the article not being written by chatGPT get bonus points (btw gonna steal that one).

They offered help (despite me not earning them a dime at that moment and stating that it'd be the case for the coming future or it'll be dime a dollar) with everything. Accommodated to our needs. Shared slack channel if problems arise? There you go. You wanna learn more? Sure, here are the resources. Workshops? Possible.

Also, big shotout to @Kacper Łukawski, which is just in love with spreading knowledge and helping out people. He provided lots of insights and offered help to get started out. Real beneficial stuff. Tutorials, blog posts, integrations with most popular libraries.

Free tier in the cloud offering to test stuff out (that actually can take you far along?) provided to anyone. 

Qdrant wins by far, in my experience, when it comes to performance, scalability, durability, ease of use, feature set, flexibility and most importantly community plus the company values.

On top of that you can get started in minutes. It was best performance, easiest to use & set up, well documented, nice community. Clear win.

As you can see I'm totally biased and sold, so take what I wrote with a grain of salt and verify yourself all of the above. I'll however remain quite bullish 

### Weaviate

Heard some good stuff here, especially regarding the feature set. However did not try it out personally. Compared to qdrant tho, they do have to improve on performance probably, but it might be a valid potential choice. Plus their community seems nice. Or I'm being biased only because @Philip Vollet, so their head of Dev Growth laughed at my joke about pgvector, so he seems salty in similar way to myself, which implicates good stuff. Eh, Olaf and his shenanigans again. Either way. Check it out, should be ok.

## Tie it all together

So now, we understand some basic concepts regarding the vectors, embeddings, fundaments of CS, HNSW, ANNS. What Vector Databases do, is to tie this all together, provide more functionalities on top of that and some abstraction layer, so you don't have to reinvent the while, and on top of that, they also take care about the regular stuff that databases do.

What are they? Well, it's mostly stuff related to scalability (so you can easily handle millions of users), persistence (so stuff doesn't get lost), survivability (so it doesn't randomly die easily), data consistency and so on. 

It's A LOT of work to do. We don't want to take care about all of these ourselves, do we?

So that's why we let Vector Databases take care of that. It's something they should excell at, other than performance and accuracy, obviously. It's not easy at all.

Also, I think that before you call your product a Database, it's required it meets at least some of these conditions as lately, in the hype driven world, it's not always the case.

Given that, all of the above and certain set of requirements I had for the project, I did the evaluation and research as to which product to actually choose.

Below you'll find a very brief and to the point summary of it. I didn't want to dig deep into the tech details to keep this article digestible, so these will come eventually in another article.

## Summary 

1. Qdrant rocks and wins. In all categories. It's postgres of the VDB world.
2. Weaviate seems to be nice too, but don't quote me on that. Features seem nice and rich for LLMs.
3. Pinecone gets you started in minutes, but so does qdrant and why would you lock yourself in their ecosystem? Plus the performance and price, but might be valid choice for some folks just coz of the Managed mindset and convenience.
4. Chromadb lacks certain features, but develops quickly, however it needs evaluation and observation for bigger projects or situations where we need real clusters. For smaller ones with proper setup I'd say it's a valid choice + look out for their development and upcoming features. A bit like sqlite of the VDB world, but on steroids currently.
5. Redis is acceptable, but doesn't shine IMO. Positive surprise performance wise. It's not core of their business tho, plus they seem to be sunsetting certain parts that do not belong to the core like RedisGraph.
6. pgvector is disappointing, but still can be valid in some use cases and scenarios, it levarage the postgres brand and benefits which also enforce certain limitations on it. Do not count on great performance though or accuracy with concurrency.
7. Milvus is what I'd stay away from. Old Oracle of VDB world.
8. For anything that can hit production, FAISS is a no-go, it's just a lib. For simple play-around hobby projects? Why not.

Yes, this was written by a human in a 4h long flow state powered act of uninterrupted creativity. It was fun, I've actually learned a lot. 
I've written this in one go almost, except minor stuff or including the feedback from Jeff. I'll leave it mostly unedited, with original wording and typos.
