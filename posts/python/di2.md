Title: Behind the Scenes of Data Inspector: Swagger, Makefile, Django project structure.
Authors: Olaf Górski
Date: 2019-04-09
Slug: data-inspector2
Language: en
Description: Continuation of the previous post. This time we'll talk about Django project structure, docs.
 
Hi, it’s me again. Olaf.

If the last entry wasn’t long, enough here comes its continuation, let’s see how long this one can get. Will we go over the record set by the previous one at 10 pages? Probably not, hopefully.

Previously, we’ve talked, or at least I did, a bit about the architecture, asynchronous nature of our project, the reasoning behind choosing our technological stack and also something about the workflow we’ll use.

Now let’s get down to the details, to the thing we all love and anticipate the most: code base.

As you might imagine, the code base for this project won’t be that big. Probably. We’re using Django. It gives you some freedom in how you want to structure your application. Well, in our case, this is what I did. Well, not exactly I per se. This approach to Django project’s structure, was shamelessly stolen by me taught to me by my friend, Sebastian Opałczyński, among many other things. Either way.
```
data-inspector/
	.githooks/
		pre-commit
	app/
		core/
		django_app1/
		django_app2/
		__init__.py
	docs/
		swaggery.yml
	requirements/
		app.txt
		ci.txt
		dev.txt
	settings/
		common.py
		development.py
		test.py
		production.py
		__init__.py
	urls/
		v1/
			urls.py
			__init__.py
		urls.py
		__init__.py
	.dockerignore
	.gitignore
	.style.yapf
	.yapfignore
	bitbucket-pipelines.yml
	docker-compose.yml
	Dockerfile
	Makefile
	manage.py
	README.md
	setup.cfg
	uwsgi.ini
	wsgi.py
```
Now that’s a lot of stuff for just a boilerplate django project, isn’t it? And you say you want to keep the code base small, design it with micro-services in mind? You crazy? RIGHT? RIGHT?

Hell no, all of this might look like `bloat powered software`, but well, quite honestly, it’s not. I won’t say anything like this is still nothing compared to Hello World in corporate Java project, nah no way, I’m too professional for making Java jokes. Anyway.

Every single file in this project has its purpose and is brought by a rational decision on my part. I’ll try to convince you that it indeed is the case.

Let’s start with general project structure.

# Structure

In my case, a directory called `data-inspector`, which just happens to be the project’s name, is the Python package root. As my coworker – another dev @ Marketplace, Tomasz said, I might’ve used `app` as the root, so going one level lower, or something else instead, thanks to which I’d make a micro-optimization of built Docker image size by not including files like bitbucket-pipelines or docker-compose in the image, but… 

That’s what it’d be – a micro optimization. And well, as we all know, certain someone by the name of Donald Knuth, said something like this: “premature optimization is the root of all evil”. And honestly, to whom should we listen if not to Donald? In case you don’t know who that is, stop reading this article and go catch up. Right now. Done? Let’s continue.

So the root is `data-inspector`. Now inside of it, we have lots of things. One of them is the directory called `.githooks`. It contains… git hooks. Yeah. Surprise. In our case it’s `pre-commit`. What do we need that for?

# Don’t make a mess
Well, I like to keep my projects clean. This means using thins like isort, yapf, flake8, bandit. We’ve previously talked about them in the context of pipelines, remember? Yeah. There’s this caveat to all of this. On pipelines, more often than not, I just do the checking whatever my code in repository, after a commit, merge or whatever, still adheres to the rules specified in these tools.

Making them work and change files in-place in pipeline wouldn’t be that smart I guess. It’d mean that every pipeline (caused by every change in repo) would produce a new commit if there was something to fix. Mess awaiting to happen. So we just check if the rules apply. If they don’t the pipeline fails, specifying why it did.Now you can either fix all the reported errors by hand, or keep it in mind to not break any rules, formatting style and imports order in the first place. Tldr – you do the job.

Or you can be smart and well, just use git hooks. If you want all your code to be styled in certain way before you commit, then well, uh, just use `pre-commit` hook. 

Thanks to that, every time you commit something, git will run all the checks, all the fixing and stuff, for you. Guaranteeing that your pipelines won’t fail the style checks. Keep in mind though – if there were things to fix, pre-commit won’t commit the changes made while fixing files in your repo by stuff in the pre-commit hook. 

You gotta do it yourself – just add all the changed files and amend it to previous commit or make git do it for you by modifying the hook. Your choice. Also – you don’t have to add hooks, running all the tools by hand is fine too, but it means you have to remember to do that and stuff. Why bother? Let’s be lazy. Computers are here for that – to do repetitive tasks which do not need human interaction.

Speaking of the hook, there’s how it looks:


```
#!/bin/sh
#
# A hook which will format code in yapf-way; do an isort and run flake8;
make code-fixes
```

This presumes you have make installed. And yapf too. Also, flake8, isort and bandit too.
What is this so called make?

It has many uses, but in our case it’s just something that will execute some commands for us. Why?

# To make or not to make? That is the question of life.
Well, let’s suppose we want, for some reason, run our `code-fixes` by hand, without make. 
In `code-fixes` we effectively make use of 4 tools. Yapf, isort, flake8, bandit. So we’d need to run 4 commands, each for every tool. Or create a bash script which would do that for us. WAY too much hassle for me – I’m a lazy creature. I’d rater just call one command and have it done for me.

That’s what we use make for, and speaking of make, let’s look into the `Makefile` which keeps all of our make commands, which are:

```
code-checks
code-fixes
requirements-dev
requirements-ci
yapf
hook-setup
flake8
isort
isort-inplace
bandit
bumpversion
version
```

As for the specific contents of these commands, I won’t give it to you. This will be a small exercise – if you want to implement this in your project, you can at least try, and search how to use this yourself.

Anyway. So, they’re simple, really. Code-checks – fires isort, yapf, flake8, bandit for checks only. Code-fixes – same thing, but it also does… fixing in-place.
Requirements-dev install requirements for dev, -ci same thing.
Hook-setup – it copies hooks from our .hooks to local git repository so that git recognizes this hook
bumpversion – bumps the version of our app
version – I use this to print current version – simple sed. Needed in pipelines.
and so on.

As for other miscellaneous files such as `.gitignore`, `.dockerignore`, `.yapfignore`, well I hope I don’t have to tell you what they do, or do I?

I’ll tell you one thing though. Pay attention to your README. Like really. Having documentation pays off. Really. It does. A lot.

I know it may be cumbersome and stuff. But in the long run it’ll help you document your knowledge, it will save you time coz people won’t bother you that much – a lot of their problems can be solved by a good README and what’s most important – you’ll have the information about your project stored.

Coz what happens if you stop working on a project, focus on something more important, for like two weeks or more? After such a long time, it’s highly probable, you might forget some subtle details. The thing is though: if you have a good README, it’ll allow you or for example a new coworker, to get back into the project a lot faster. So yeah. Same thing goes for the folder called `docs/`. 
Most people do not like writing documentation. I’m not surprised – we love writing code, not some boring documentation. But still. Do it. Really.

As for docs in my project, they’re done using swagger mostly. I hate that tool. Oh yes I do. But I still use it. Well my hate for swagger is still not comparable with my hate for confluence. WHY DO PEOPLE EVEN USE IT? UGHHHH.

Anyway. Sorry for that. 

# Docker

As you can see we have to mysterious files in our project – Dockerfile and docker-compose. What are they here for? Well, you probably might know that already, but if you don’t, let me introduce you to something called Docker. Docker is a containerization platform. WHAT?

If you are a bit older than 12, then you might remember that back in the days, if you wanted to install some new cool game, first you had to install DirectX, Flash and other stuff. Oh, it also often had to be in a correct version. Fun times, right?Well now imagine that you didn’t have to do that. It all came packed into a ‘container’ - you don’t have to install anything new on your computer. Everything a program needs to run is in that ‘container’. 

Well, now you kind of might know what Docker does on the basic level. It also brings in security, scalability and so on. Enough about that. So that’s what Dockerfile is for – it’s an instruction for Docker, telling it how to build your application’s image that you may distribute later, when you upload it to some kind of Image Repository – you can do that for example in… Pipelines : ) See how things fit together? Anyway.

Docker compose is there so that we can use docker-compose. It’s a type of tool used to easily wrap around base Docker commands, that’s all.

Manage.py is just django fluff that we will use tu ‘run’ our application. Wsgi.py and uwsgi.py have similar purpose – they say how the server should ‘serve’ our application. 

Most of the time I use python’s alpine version of the base image. 3.7 preferably. 

# Setup
Well in this file we have all kinds of configurations for different tools. Eg. flake8, isort and so on. Instead of creating a million files, you can just write it all here, most of the time.
Here you can see an example:
```
[bumpversion]
current_version = 0.1.27
commit = True
tag = True

[flake8]
max-line-length = 120
exclude = manage.py,migrations,venv

[isort]
line_length = 120
known_future_library = future
known_first_party = app
known_django = django
known_third_party = pykafka
multi_line_output = 3
indent = '    '
skip = manage.py,migrations,venv
sections = FUTURE, STDLIB, DJANGO, THIRDPARTY, FIRSTPARTY, LOCALFOLDER
...rest of the file...
```
Alright. Off to the other dirs let’s go.

# App
This is where I store the codebase. I either just call it `app` which is not descriptive, so I don’t do it that often – instead most of the time I just name this directory after the project’s name – in this case it’d be data-inspector, but you gotta remember that `-` in package name is not such a good practice, so instead I’d use for example `data_inspector`, which in turn is ugly, so let’s just stick with `inspector` still descriptive, but prettier. Yay. At least it is from my perspective. This time I just rolled with ‘app.’ Idk why really.

So in this directory, I store most of the source code, splitting it like follows:

for each django app I have a separate directory. In almost every project I include a directory called `core`. It contains things that are vital to every app in the project or things that relate to the whole project in general – eg. things like viewset handling documentation or versioning, some abstract models, middleware or handy utils widely used everywhere. I also put files related to `django-admin` if it’s very short - otherwise I create a separate app for it.

Example of something I’ll have in my `core` app is this:
```
class CreatedUpdatedAtModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

If my models inherit from this instead of inheriting from default django Model, then well, I’ll be able to easily track basic changes in every row – it often comes handy to know when the model was created and last modified. Really.

One thing you might want to consider. How do you structure your utils? What do I mean? Most of the time I see this approach: people just create a file called `utils` where they blatantly just put all their functions in a flat structure. 

Then, in other files, where they use the code from utils, they either import it all by doing `from utils import *` which is bad in my opinion, in most cases at least, or they import it all one by one creating something like this: `from utils import really_long_function_name1, really_long_function_name2, really_long_function_name_thats_also_longer_than_all_the_rest3` and so on. You get the idea?

Importing it all one by one may create a mess later. “There must be a better way.” I have a different approach here.

`services` or whatever.
I mean… Instead of having just `utils.py` and a flat code structure there, I either create a file called `services` or modify the utils a bit. How? I don’t just plainly put my functions/methods there in a flat structure, instead I create a class there and make these functions/methods into class methods.

Then I can just `from utils import UtilNameService` - that’s all for the imports. In the code it’d look like this: `UtilNameService.somet_method()` In my opinion this is cleaner. Just my preference though.

Alright. Off we go to the next dir. And that’d be `docs`.
# Docs
Well what does it do… Hm…
Just swagger. Nothing more, really. So not much to say here. Except for another reminder – DO write a documentation, it’s so important.

# Requirements

As you can see here, in this directory, I have a couple of files. Each has its own purpose. Let’s start with the most important one - `app.txt` here I include all the `pip` dependencies that need to be installed in order for the app to work in the basic case. This is absolute required minimum. 

`dev.txt` contains dependencies that might come in handy when developing the app locally – so things like test runners, maybe coverage and other stuff like that.

`ci.txt` is there so that I can specify what I want to install just during the pipelines duration, which is: flake8, yapf, coverage, isort, bandit. You get the idea? No point in including all these packages in our base image, making the build process longer and the image size larger and that’s bad.

# Settings

Oh well, this might seem a bit counterintuitive to some – why do I store settings outside of eg. `core` or some Django app? Well, it just suits me better and makes the code a bit cleaner – especially when it comes to imports.

That’s my opinion at least.

Either way. Here we have 4 files basically.
`common`, `development`, `test`,  `production`

As you might imagine, they’re all different settings for the project. Each one is used depending on the environment currently set.

Here is something I’d like you to remember. You have to tell Django which setting file to use. It has no idea by default. Just don’t do that by hard coding that in your code. No, don’t.  How to do that then? Just set default settings based on environment variable for example.

# Urls

Last but not least: urls.

I generally use something like that: 
```
urls/
    urls.py
    v1/
        urls.py
```
Versioning in API is important if you make it public and then create major backwards-incompatible changes. If you do so, you might think about creating another version of the api – eg. v2, so that the apps already created using you api v1, won’t stop working.

Well it’s better not to put yourself in that position in the first place – that’s why it’s important to think through carefully the design of every feature you do. Backwards incompatible changes suck. Avoid them when you can.

Anyway.

So, all the urls from `v1` live in a namespace…. `v1`. Yes.

Hm. 

That’d be all I think. 

This entry definitely was a bit shorter than the previous one. Thank god. 

After these two articles I think you should have a basic grasp over how I structure my Django projects, why I do it, how I came up with the project’s architecture and so on. Maybe you haven any ideas how to improve this?

Did it work out though? What were the results? Well, while the product is still in development, I can tell you that the code did turn out decent indeed. 

Modular, simple and easily reusable. I’m not trying to brag here – me being just a beginner is nothing but a fact, so nothing to brag about here. I just try to simplify things whenever I can and more often than not, it pays off. 

Here it did, and the fact, that when in the so called `meanwhile` we had to write another service which had a bit n common with this project, most of the functionalities there came from doing this `from inspector import xyz` or copy-pasting code without any changes really. And it just worked.


That’d be all for today. Thanks for reading.



