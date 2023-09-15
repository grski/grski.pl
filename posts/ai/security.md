Title: Let's talk LLM security & privacy
Description:
Date: 2023-07-22
Authors: Olaf Górski
Slug: ai-security
Language: en

# Let's talk AI & LLM security & privacy. 

Topic that's not so often brought up, but it should. Why? Let me tell you.

With all the hype around AI and LLMs in particular.

Currently you have two main options that are considered in production-grade enterprise use-cases.
You either roll with OpenAI's API, which can prove to be a bit tricky privacy-wise and compliance-wise. GDPR and stuff. No control over your data. OpenAI is a bit of a black box.
The data you input in the API by default isn't used for training (as opposed to ChatGPT's data...), but still. We do not know enough about OpenAI and it's data standards to usually roll with it.

The other option I've seen considered is Azure OpenAI. So, almost the same as OpenAI but hosted within Azure, usually models deployed within your infrastructure.

So let's draw that disctinction clear. This is way better for privacy. If you want to be sure you are compliant I'd go wtih Azure OpenAI. We trust Microsoft's lawyers a bit more than we do for OpenAI.

Microsoft offers GDPR-compliance agreements for some of its bigger consumers. You can even get them to disable logs given that you are big enough. Lots of stuff is negotiable.
You can choose where your data is processed (EU/US/Asia etc.). It's all up to you.

If you are worried about privacy, go with Azure OpenAI. You can have a model deployed within your Azure infra with some governance over it. Over access, logs and what not. 

There ofcourse are other solutions like hugging face (that you can host on your own, kinda) or competetive solutions but given their popularity and use-cases, I won't go over them. 

Just to sum it up - currently you can either
1. Go with OpenAI to gain the fastest updates when it comes to new features, but potentially compromise your privacy.
2. Go with Azure OpenAI, which will always be a bit behind newest OpenAI features, but will enable you a fine grained control over your data, privacy, access and logs.
3. Self-host any model within your own infrastructure.

They are ordered privacy-wise.

If you are a small startup that doesn't have to comply with much regulation -> openai should do you fine. Easiest to integrate & iterate on.
Are you a company that worries a bit about regulations, data privacy and compliance? Well, Azure OpenAI is your best bet. Sure, you won't get all the newest features right off the bat, but you won't need them either way. 
Is your use case custom, and you have a strong AI team? Self-host stuff (only reliable and possible in some cases) plus use Azure OpenAI.

Small startups that iterate fast and are not a subject to sensitive user data -> plain OpenAI.
Bigger companies or companies that deal with sensitivte data (that should not enter the LLM anyway!) or trade secrets/internal/sensitive stuff? Azure OpenAI. 
Companies with custom use cases and strong AI team that know what they are doing? Usually self-hosted custom models for certain use cases and Azure OpenAI for the rest.

Please note by default none of these options (API usage) collect the data for training purposes (ChatGPT does though, watch out there!).

## Prompt injection
Let's take a step back and go back to the good old SQL & traditional Databases. Remember that stuff called sql injection, where if not properly escaped, user inputted string could be used to run arbitrary sql code by the attacker?
Well here, we have something similar. It's called prompt injection. Long story short the attacker can make it so that our model ignores the instruction in its prompt and generates evil stuff. Stuff that could potentially be malicious or politically incorrect.

Imagine that an attacker manages to sucessfully hijack your public-facing model and then use it to generate a personalised spamming campaign or racist jokes. That's a very real scenario. I've seen people trying to do prompt injection attacks within days from launch of simialr feature, even though it was deployed to only like 1/100 of our clients.
Now, if you are a bigger company... Well, think for yourself.

Other than that the attacker could cause prompt spillage, in certain setups, meaning user data from another session gets spilled to another session if not properly controlled. 
This shoudln't be bothersome, but it is. Why? We are dealing with user inputted data and sometimes user input things they should not. PCI. PII. You name it. 
We can't allow such a thing.

## Hallucinations
Sometimes our LLMs can hallucinate, which is normal, given their nature or the fact that they don't actual 'reason' as we understand it, they just predict stuff, guess.
To LLMs statements that are truthful and false in a human context, can be equally valid output.
When LLM spews out lies, made up stuff or just outright lies or contradicts itself (it can do that too), we say that it hallucinates.

Hallucinations can be quite harmful and make your company liable in some cases.

Lakera

Gandalf
### Platform
#### Security OOB 
#### Prompt-injection protection
#### Hallucinations protection
#### Low latency & high performance
#### Reasonable cost
#### Ease of integration
#### Big names
Cohere use some of their services :) IF you are in LLM field, this name should ring a bell. What more do I need to say?
#### The team behind it
Pleasure to work with.

## Summary
In general, if I were you and was deciding how to approach AI/LLM security/privacy, I'd roll with Azure OpenAI, properly configured (private access, proper logging, permissions and access control) and Lakera at application layer to secure things.
There are open source solutions for this problem too, that you could use, but I've found none to be so reliable and comprehensive as to what Lakera has to offer.

No, this post was not sponsored. I just enjoy working with these guys and find their service useful, so spreading the word, but if you deem it nice, I'm always open to some perks ;P 

And to think this is just some of the things you have to tackle when dealing with production-grade LLM usage. There's a lot of research that's usually needed. I give it out to you for free. If you are interested in other topics and you want to stay updated, follow me on LinkedIn for more.
Written by a human, no part of this was generated by ChatGPT :) 
