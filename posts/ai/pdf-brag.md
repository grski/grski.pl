Title: Build your own LLM RAG API without langchain using OpenAI, qdrant and PDF stack
Description: Want to go down the road less travelled while building LLM RAG API without langchain using just Qdrant and PDF-stack? I sure do.
Date: 2023-10-15
Authors: Olaf Górski
Slug: pdf-brag
Language: en

Assumption is the mother of fuckup. Let's see when we get rid of most of them regarding our tech stack choice. Let's get rid of Langchain, ORM and see what comes out.


## Well, that escalated quickly

Long story short, in my last post I mentioned that well,[ you do not need langchain](https://grski.pl/no-langchain). 
Somehow it kinda ended up with a comment from [Langchain's CEO](https://www.linkedin.com/feed/update/urn:li:ugcPost:7108316710566260736?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7108316710566260736%2C7111512324414324736%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287111512324414324736%2Curn%3Ali%3AugcPost%3A7108316710566260736%29). Whoops. TBH gotta admit, Harrison's comment was very humble and understanding. **I was amazed by how profesionally he took the feedback, even though I was a bit biased.** Impressive.

To be fair, I've taken a look at Langchain again and **changed my opinion on some points - they've improved tramendously,** however, my general point still stands - **in my case, Langchain isn't preferred.** 
What to use instead though? Good question. Let's find out what mr. smarty here went with and create a **B**asic **R**etrieval **A**ugmented Generation API or bRAG for short. [Here you can find the github repo with complete codebase.](https://github.com/grski/brag)

Beware though. This post will be long, it will cover lots of aspects and go beyond just plugging openai into fastapi endpoints.
We will pimp it up a bit.

We will use:

1. [plain python openai](https://github.com/openai/openai-python) client to interact with our LLM
2. [qdrant](https://qdrant.tech/) as our vector database of choice and their [client](https://github.com/qdrant/qdrant-client).
3.  For the embeddings we will use ~~openai~~ Qdrant's [fastembed](https://github.com/qdrant/fastembed) lib. 
4. the API will be written using [fastapi](https://github.com/tiangolo/fastapi)
5. no ORM for us. Instead we will roll with [pugsql](https://github.com/mcfunley/pugsql)
6. migrations will be done using plain sql and [dbMate](https://github.com/mcfunley/pugsql).
7. instead of poetry, we will go for [pyenv](https://github.com/pyenv/pyenv) + [pip-tools](https://github.com/jazzband/pip-tools)
8. on the db/persistance front - [postgres](https://www.postgresql.org/)
9. lastly, the app will be containerised - [docker](https://www.docker.com/)

Does that sound weird to you? Because it is! 




## Basics

To start, let's make sure you have pyenv installed. What is pyenv? You can read a bit about it on my blog.
[Pyenv, poetry and other rascals - modern Python dependency and version management.](https://grski.pl/pyenv-en)

Long story short it's like a virtualenv but for python versions that keeps everything isolated, without polluting your system interpreter or interpreters of other projects, which would be bad. You don't need to know much more than that.

If you are on mac you can just 
```bash
brew install pyenv
```

or if you do not like homebrew/are linux based:

```bash
curl https://pyenv.run | bash
```

Remember to [set up your shell for pyenv.](https://github.com/pyenv/pyenv#set-up-your-shell-environment-for-pyenv)..
In short you have to add some stuff to either your `.bashrc`, `.zshrc` or `.profile`. Why? So the proper 'commands' are available in your terminal and so that stuff works. How?

```bash
# For bash:
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# For Zsh:
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
```
Done? Now you just need to get pyenv to get python 3.11 downloaded & installed locally (no worries it won't change your system interpreter):

```bash
pyenv install 3.11
```
When you are done installing pyenv, we can get going.

We will name our project **bRAG** - the name coming from **b**asic **R**etrieval **A**ugmented **G**eneration API.
First of all, let's create a directory of the project:

```bash
mkdir bRAG
cd bRAG
```

Now we can set up a python version we want to use in this particular directory. How? With pyenv and pyenv-virtualenv, which is nowadays installed by default with the basic pyenv installer. If you need to, check the article I referred before to understand what's happening.

```bash
pyenv virtualenv 3.11 bRAG-3-11  # this creates a 'virtualenv' based on python 3.11 named bRAG-3-11
pyenv local bRAG-3-11
```

Now, if all goes well, pyenv should activate the context of this particular python version when we are inside the project directory. You might need to cd to some other catalog and back for changes to take effect.

Now we need to install pip-tools and pre-commit

```bash
python -m pip install pre-commit pip-tools
```

Why do we need pip-tools? Because we won't be using poetry. Why? Well, [here's why.](https://www.youtube.com/watch?v=Gr9o8MW_pb0) that plus, well, it's heavy.

Pre-commit allows us to handle stuff like linting/formatting automatically, we will talk about that later.

What now?
Let's define `pyproject.toml`. 

`pyproject.toml? Aren't we ditching poetry?` you might ask. Yes, we are, but this file has become the defacto standard for python configuration, so even if we are not using poetry, it's still needed.



```toml
[project]
name = "brag"
version = "0.0.1"
requires-python = ">=3.11"
dependencies = ["fastapi", "openai", "pydantic-settings", "uvicorn", "gunicorn", "qdrant-client[fastembed]", "sentry-sdk", "pugsql", "psycopg2-binary"]


[project.optional-dependencies]
dev = ["ruff", "black"]
```
Fastapi, openai and qdrant - all we need for the application. 

On top of that we will use pydantic-settings to manage our settings and secrets.

Uvicorn & gunicorn are what will serve our app later. 

That's all we need. For dev stuff we additionally need black, ruff.

Side note - If you are running into problems with locking/installation of qdrant-client (unlikely - maybe if you install the package on a python version that doesn't yet have wheels, but it means you know what you are doing, probably), go:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

In case of poetry, it takes the requirements specified in its custom format in pyproject.toml and resolves the deps based on that. We do not want that. We want something understandable by basic pip. Pip-tools to teh rescue.

## Pin 'em

We have our dependencies defined in pyproject.toml, time to create a proper requirements.txt that pip will understand. How? We will used pip-tools, namely `pip-compile` 

What pip-compile does is somewhat similar to creating the `.lock` file in poetry. Long story short it pins the dependencies so that pip knows which version to exactly install, how to resolve dependencies and so on.

Ah, about that, **dependency** **resolving** and **dependency** **locking**.

Basically it’s just a proces of making sure that **we** **know** **the** **dependencies** **of** **our** **dependencies** **and** **their** **dependencies**.

And also we have a clear account of their **versions**, **usually** **signed** **with a** **hash**.

This allows something called **deterministic builds** which is one of the keys of **modern CI/****CDs** and apps that adhere to **the** **Twelve-factor** **app** **pattern**. Meaning that unless you change something in your app, it should be built the same way regardless of where it was built and when. 

Withour further ado:

```bash
 pip-compile --generate-hashes -o requirements/requirements.txt pyproject.toml  # for production
 pip-compile --extra dev -o requirements/requirements-dev.txt pyproject.toml  # local usage
```
This takes our requirements from `pyproject.toml`, resolves dependencies, pins them, generates hashes. Why and what for? Again - **repeteable and deterministic builds.** Very **important**.
You wanna make sure that the app is built the same way regardless of where and when it is built. Otherwise debugging is a nightmare. So is CI/CD.

`requirements/requirements.txt` contains list of requirements together with their hashes and pinned versions, only for the dependencies strictly required for the app to work - production build.

`requirements/requirements-dev.txt` contain everything that `requirements.txt` does and some more - certain packages that are useful eg. during development, but are not needed on production. In our production builds we want as little dependencies as possible, to reduce bloat, speed up build time and reduce number of packages that could be vulnerable, introducing more security risks - I mean in the end every 3rd party dependency you do not controll is a potential threat. 

You should now have `requirements-dev.txt` file. Let's install the dependencies finally!
```bash
pip-sync requirements/requirements.txt requirements/requirements-dev.txt
```
What is pip-sync? pip-sync works alongside pip-compile as a part of pip-tools. Basically it installs packages that we need in our environment based on the output of pip-compile. Bit better than plain `pip install -r` but very similar.

Setup complete. That was long, wasn't it? And we havent' even written 1 line of code yet!

## App itself

Let's take a look at the file structure and what's in the project:

The file structure we will end up with is:
```
 |-- app/  # Main codebase directory
 |---- chat/
 |------ __init__.py
 |------ api.py
 |------ constants.py
 |------ message.py
 |------ models.py
 |------ streams.py
 |---- core/
 |------ __init__.py
 |------ api.py
 |------ logs.py
 |------ middlewares.py
 |------ models.py
 |---- __init__.py
 |---- db.py
 |---- main.py
 
 
 |-- db/  # Database/migration/pugsql related code
 |---- migrations/
 |---- queries/
 |---- schema.sql
 |-- settings/  # Settings files directory
 |---- base.py  # base config for our app
 |---- gunicorn.conf.py  # config for gunicorn
 |-- tests/  # Main tests directory
 |-- requirements/
 |-- .dockerignore
 |-- .env.example
 |-- .gitignore
 |-- pre-commit-config.yaml  # for linting in during development
 |-- docker-compose.yml
 |-- Dockerfile
 |-- Makefile  # useful shortcuts
 |-- README.md
```

Let's start small though. In our `bRAG` directory, let's create the following files/directories:
```
 bRAG
 |-- app/
 |---- core/
 |-- main.py
```

The minimum we can start with is (ofc we could skip logging but...):
```python
# app/core/logs.py
import logging

# we are setting the logging level to log everything at level info and above
logging.basicConfig(level=logging.INFO)

# we are creating one common logger for our application that we will later use
# everywhere we want to log stuff
# this provides common configuration and, if we want it, standard/format
logger = logging.getLogger(__name__)
# we will push the logs to the console/stdout
ConsoleOutputHandler = logging.StreamHandler()
logger.addHandler(ConsoleOutputHandler)


# main.py - at the top level of the project
from fastapi import FastAPI

from app.core.logs import logger

# in here we just initialise the fastapi app, without defining
# any endpoints
app = FastAPI()
logger.info("App is ready!")
```
that doesn't do much. does it though? Let's expand it at least a little bit to, for example, include the version of our app.

```python
# __init__.py - at the top level of the project
# read-only tomllib is now part of python core, so we do not need to install it
import tomllib

# we get the version from pyproject.toml and put it into a variable
with open("pyproject.toml", "rb") as f:
    data = tomllib.load(f)
    version = data["project"]["version"]


# main.py - at the top level of the project
from fastapi import FastAPI

from app import version
from app.core.logs import logger

app = FastAPI(version=version)

logger.info("App is ready!")
```
Still not much, but at least it's something - our FastApi knows which version of the api we currently are serving.

Let's create first real endpoint. Usually we like to have an endpoint in our application that allows us to tell if it's running and healthy. In our case it'll be trivial to implement, so let's do that.
```python
# core/api.py
from fastapi import APIRouter

from starlette import status
from starlette.requests import Request

# we define a router to hold all our core endpoints together
router = APIRouter(tags=["Core Endpoints"])  

@router.get("/healthcheck", status_code=status.HTTP_200_OK)
async def healthcheck(request: Request) -> dict:
    return {"version": request.app.version}

# main.py
from fastapi import FastAPI

from app import version
from app.core.api import router as core_router
from app.core.logs import logger

app = FastAPI(version=version)
app.include_router(core_router)
logger.info("App is ready!")

```
Sometimes people put all the endpoints into `main.py` or `app.py` file. While this is fine for applications that have few endpoints, it gets messy over time.

I have a preference of splitting the application into `modules` or `apps` that are related to a particular topic/domain problem.
All the `api`, `models`, `utils`, `constants`, `services` related to that particular piece of the domain, are put in there. Good examples of such apps are eg. `users`, `emails`, `chats` and so on. It's a bit like how you'd structure your app in Django.

1. api.py contains all the endpoints/views
2. models.py contain stuff related to data definition/validation/schema
3. constants.py is self-descriptory
4. services.py this is where business logic lives.

In an ideal world, we have API interaction flow that goes like this: 
User <-> Views <-> Services <-> Models <-> Data Sources/Database.

Sometimes Services deal directly with DS too, and that is fine.

Each `app` gets it's own APIRouter where we define proper endpoints and which we later include in our fastapi app object. 

Everything is nicely separated, prepared for growth.
Me gusta.

## Serving our app

But wait. How do we run our app? Just running:
```bash
python -m app.main
```
causes the interpreter to log that `App is ready!` but nothing else happens. The app just finishes. What's going on?

Long story short, we need some kind of Worker and a Server to serve our asynchronous (or synchronous) python web app in accoradance to certain standards. WSGI, ASGI. Google these terms.

Let's not delve into details, but **uvicorn & gunicorn** to the rescue. 

For **local** stuff/dev we are going to just use **uvicorn**. For **prod**-ready, we will **wrap uvicorn with gunicorn.** 

**Gunicorn** will be our 'process manager' and **uvicorn** the **Worker** **class**. what does that mean?

Imagine **gunicorn** as a supervisor at a construction site. For **big jobs, serious stuff** he needs to tell the workers what to do where etc to provide guarantess, to provide quality, make sure nothing bad happens.
He manages them and makes sure everything is good. If one worker is on vacation, he makes sure another one comes. If one is sick, same. If they need new workers, he makes sure that is known and fullfilled.
And so on.

Whereas **uvicron** is the **worker**. He does stuff. Doesn't think much. 
For **simple tasks he's self-sufficient** (think serving app for local dev), 
but for more complex stuff where you eg. need to coordinate work of multiple workers or do advanvced projects, **he needs help of the supervisor/manager.**

Hope it's clear now.

So how to run our app using uvicorn?

```bash
python -m uvicorn --reload app.main:app
```

Later we will create a shorthand command `make run-dev` for this.
Now go to `http://localhost:8000/docs`. Beng. It's alive! 

It's not much so far, we just got the heartbeat endpoint going.

## Settings
It's slowly the time to actually make some requests to OpenAI's api.
Before we do that, we will need something. Ah right, a way to store our secrets/settings and so on. Why?

Almost any 3rd party API requires you to authenticate in one way or another. Quite a popular way of doing that is using API-keys or other secrets. What are they? 

Long story short they are this 'secret' values that are known only to you and the service provider, in theory. It's usually a long and random string that is sufficiently hard to guess, that one can assume, that if you know this string, it must be you. 

Now, commiting secrets to the repo in plaintext is a big no-no. You need to keep your secrets, well, secret.

The practice is that we usually put & get the secrets from environment variables of the OS/container that the project is running in, instead of just putting it in plaintext to the repo as a string.

It's much more secure if done properly, however it's a bit more complext. I mean saving a string to the code is easy, this requires a bit more overhead, but it's well worth it. How to do it?

Pydantic-settings to the rescue.

```python
# core/constants.py
from enum import StrEnum

# on local we just need 1 worker, no need to spawn multiple threads
DEFAULT_NUMBER_OF_WORKERS_ON_LOCAL = 1  


# we could have any number of environments here, this is useful when
# defining settings/behavior per environment - eg on production
# you probably do not want debug enabled and so on.
class Environments(StrEnum):
    LOCAL = "local"
    PRODUCTION = "production"

# settings/base.py
from pydantic import Field
from pydantic_settings import BaseSettings

from app.core.constants import Environments


class Settings(BaseSettings):
    APP_NAME: str = "bRAG"
    ENVIRONMENT: str = Field(env="ENVIRONMENT", default=Environments.LOCAL.value)
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY")

    @property
    def is_local(self):
        return self.ENVIRONMENT == Environments.LOCAL.value
    
    # this will make it so that pydantic will look for our env variables
    # in a file called .env and automatically load them as such
    class Config:
        env_file = ".env"

# settings/__init__.py
from settings.base import Settings

# this enables us to easily import settings later by going 
# from settings import settings
# something like django settings
settings = Settings()

# .env.example 
OPENAI_API_KEY=sk-xxxxxx
```

Now, create a `.env` file, copy contents of the `.env.template` there and just replace the placeholder with your api key to openai. Do not ever commit `.env` file to the repository. `.env.template` is there with placeholders for a reason.

Now comes the anticipated part - let's have our API make requests to OpenAI.

## How to (b)rag - what it's all about

But before that. Let's talk a little about what we are going to do. 

This whole RAG thing, what is it. 

Back a while ago I wrote a quick introduction to [Vector DBs, LLM, Embeddings.](https://grski.pl/vdb) If you are new to the topic, I recommend you to go check it out. I'll assume you understand some of the topics covered in there from now onwards.

When we talk about LLM-related applications, there are platitude of different usages and examples. Most cases and applications however, orbit around or consist of the following terms/things:

1. Completions - completion is a simple one off message where you provide an input and the model generates a completion based on that. Completion is, as mentioned, in basic form, one off. So in this case we assume that there is no context, no nothing, no past messages. Just one single string and it's completion.
2. Chat Completions - similar to plain Completion, except here you usually have contextual conversation enabled, so you keep the history of the conversation in the context and as it is a conversation, you also often have different roles/authors of the message. I mean - if it's a conversation you need to have at least 2 different sides. In LLM world it's usually **user**, **system**, **assistant**. 

Now, both of these are plain ways of interacting with the LLMs. 

All LLMs have limited training data, limited knowledge, training data cutoff point and so on. In order to give the model access to more recent data, or maybe data that's private/unique to you, we've developed a **RAG** - Retrieval Augmented Generation. All it means is that during either Completion or Chat Completion, inside your request, you provide some additional information that is Retrived from somwhere, and then make the model generate the answer based on that particular information, which we put inside the request's context, or simply the string that we send to the model. Now, on a basic level, this is all there's to it. We **Retrieve** some information, to **Augment** our prompt/inquiry/request beofre the **Generation**. More often than not, because of various reasons, the Retrieval part happens through some kind of a **Vector Database**. What it is, how does it work? Go back to the previously mentioned article, if you already haven't. Introduction to [Vector DBs, LLM, Embeddings.](https://grski.pl/vdb) 

In the **RAG** type of service, we can single out the following types, which were nicely summed up by one of my former colleagues (Greetings!):

1. Document Q&A - this one is usually a simple Q&A service, something akin to Completions. It can have contextual conversation capabilities, but can be also one-off question just like completion. usually the latter. The data over which we do the Q&A is not persisted. It's just a temporary Q&A. 
2. Knowledge Base Q&A - it's basically Document Q&A, but the data we query is persisted somewhere. It's properly ingested and persisted. In our terminology. So Document Q&A without Contextual Conversation but over persisted data as opposed to temporary data in the Document Q&A.
3. Contextual Knowledge Base Q&A - same as above, but rather than being a one-off completion, we keep the context of the conversation in mind and have proper Chat Completions with contextual conversations. Not only we can ask questions over some persisted data, but the app also remembers our previous questions/answers (up to a certain point) and keeps that in mind.

Now let's start with the most basic stuff - completion. We will create a fairly simple Completion endpoint.

## Completion

Without further ado:

```python
# chat/constants.py
from enum import StrEnum


class FailureReasonsEnum(StrEnum):
    OPENAI_ERROR = "OpenAI call failed"
    STREAM_TIMEOUT = "Stream timed out"  # for later
    FAILED_PROCESSING = "Post processing failed"  # for later


class ChatRolesEnum(StrEnum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"


class ModelsEnum(StrEnum):
    GPT4 = "gpt-4-0613"


# chat/models.py
from pydantic import BaseModel, Field

from app.chat.constants import ChatRolesEnum, ModelsEnum
from app.core.models import TimestampAbstractModel


class BaseMessage(BaseModel):
    """ Base pydantic model that we use to interact with the API."""
    model: ModelsEnum = Field(default=ModelsEnum.GPT4.value)
    message: str


class Message(TimestampAbstractModel, BaseMessage):
    role: ChatRolesEnum



class Message(BaseMessage):
    role: ChatRolesEnum

# core/models.py
from datetime import datetime

from pydantic import BaseModel, Field


# utility base class to add creation time to all the models
# usually we would also have updated_at field to denote
# when the object was updated, but in our case I doubt we will do
# any updates
class TimestampAbstractModel(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)

```



Lastly, let's define the view:

```python
# chat/api.py

from fastapi import APIRouter

import openai

from app.chat.exceptions import OpenAIException
from app.chat.models import BaseMessage, Message
from app.chat.services import OpenAIService


router = APIRouter(tags=["Core Endpoints"])


@router.post("/v1/completion")
async def completion_create(input_message: BaseMessage) -> Message:
    try:
        return await OpenAIService.chat_completion(input_message=input_message)
    except openai.OpenAIError:
        raise OpenAIException
# main.py
# do not forget to include the new router:
(...)
from app.chat.api import router as chat_router
from app.core.api import router as core_router
app = FastAPI(version=version)
(...)
app.include_router(core_router)
app.include_router(chat_router)
(...)

```

Now you might wonder, where's all the code? As mentioned before, in the `services.py`.

```python
# chat/services.py
import openai
from openai import ChatCompletion

from app.chat.constants import ChatRolesEnum
from app.chat.models import BaseMessage, Message
from app.core.logs import logger
from settings import settings


class OpenAIService:
    @classmethod
    async def chat_completion(cls, input_message: BaseMessage) -> Message:
        logger.info(f"Received the following completion: {input_message}")
        completion: openai.ChatCompletion = await openai.ChatCompletion.acreate(
            model=input_message.model,
            api_key=settings.OPENAI_API_KEY,
            messages=[{"role": ChatRolesEnum.ASSISTANT.value, "content": input_message.message}],
        )
        logger.info(f"Got the following response: {completion}")
        return Message(
            model=input_message.model,
            message=cls.extract_response_from_completion(completion),
            role=input_message.role,
        )

    @staticmethod
    def extract_response_from_completion(chat_completion: ChatCompletion) -> str:
        return chat_completion.choices[0]["message"]["content"]
```

Now if you go over to http://localhost:8000/docs it should work.

That's just a simple completion though. 

Let's assume we want to stream the response, just like ChatGPT does, which can give the pretense as if we were talking to a human. Now we talking!

Get ready.



```python
# chats/exceptions.py
# here we define some exceptions that will come handy in the future
from fastapi import HTTPException
from starlette import status

from app.chat.constants import FailureReasonsEnum, NO_DOCUMENTS_FOUND


class OpenAIException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=FailureReasonsEnum.OPENAI_ERROR.value)


class OpenAIFailedProcessingException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=FailureReasonsEnum.FAILED_PROCESSING.value)


class OpenAIStreamTimeoutException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=FailureReasonsEnum.STREAM_TIMEOUT.value)


class RetrievalNoDocumentsFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=)


# chats/streaming.py
import asyncio
import json

import async_timeout

from app.chat.constants import ChatRolesEnum
from app.chat.exceptions import OpenAIStreamTimeoutException, OpenAIFailedProcessingException
from app.chat.models import Chunk, Message
from app.core.logs import logger
from settings import settings


async def stream_generator(subscription):
    """In the future if we are paranoid about performance we can pre-allocate a buffer and use it instead of f-string
    should save a cycle or two in the processor or be a fun exercise but totally not worth the effort or complexity
    currently (in the future too).
    """
    async with async_timeout.timeout(settings.GENERATION_TIMEOUT_SEC):
        try:
            complete_response: str = ""
            async for chunk in subscription:
                # f-string is faster than concatenation so we use it here
                complete_response = f"{complete_response}{Chunk.get_chunk_delta_content(chunk=chunk)}"
                yield format_to_event_stream(post_processing(chunk))
            message: Message = Message(model=chunk.model, message=complete_response, role=ChatRolesEnum.ASSISTANT.value)
            logger.info(f"Complete Streamed Message: {message}")
        except asyncio.TimeoutError:
            raise OpenAIStreamTimeoutException


def format_to_event_stream(data: str) -> str:
    """ We format the event to a format more in line with the standard SSE format. """
    return f"event: message\ndata: {data}\n\n"


def post_processing(chunk) -> str:
    try:
        logger.info(f"Chunk: {chunk}")
        formatted_chunk = Chunk.from_chunk(chunk=chunk)
        logger.info(f"Formatted Chunk: {formatted_chunk}")
        return json.dumps(formatted_chunk.model_dump())
    except Exception:
        raise OpenAIFailedProcessingException

# chats/services.py
class OpenAIService:
    @classmethod
    async def chat_completion_without_streaming(cls, input_message: BaseMessage) -> Message:
        completion: openai.ChatCompletion = await openai.ChatCompletion.acreate(
            model=input_message.model,
            api_key=settings.OPENAI_API_KEY,
            messages=[{"role": ChatRolesEnum.USER.value, "content": input_message.message}],
        )
        logger.info(f"Got the following response: {completion}")
        return Message(
            model=input_message.model,
            message=cls.extract_response_from_completion(completion),
            role=ChatRolesEnum.ASSISTANT.value
        )

    @staticmethod
    async def chat_completion_with_streaming(input_message: BaseMessage) -> StreamingResponse:
        subscription: openai.ChatCompletion = await openai.ChatCompletion.acreate(
            model=input_message.model,
            api_key=settings.OPENAI_API_KEY,
            messages=[{"role": ChatRolesEnum.USER.value, "content": input_message.message}],
            stream=True,
        )
        return StreamingResponse(stream_generator(subscription), media_type="text/event-stream")

    @staticmethod
    def extract_response_from_completion(chat_completion: ChatCompletion) -> str:
        return chat_completion.choices[0]["message"]["content"]


```

lastly, the `chats/api.py` becomes:

```python
from fastapi import APIRouter

import openai
from starlette.responses import StreamingResponse

from app.chat.exceptions import OpenAIException
from app.chat.models import Message, BaseMessage
from app.chat.services import OpenAIService


router = APIRouter(tags=["Chat Endpoints"])


@router.post("/v1/completion")
async def completion_create(input_message: BaseMessage) -> Message:
    try:
        return await OpenAIService.chat_completion_without_streaming(input_message=input_message)
    except openai.OpenAIError:
        raise OpenAIException


@router.post("/v1/completion-stream")
async def completion_stream(input_message: BaseMessage) -> StreamingResponse:
    """ Streaming response won't return json but rather a properly formatted string for SSE."""
    try:
        return await OpenAIService.chat_completion_with_streaming(input_message=input_message)
    except openai.OpenAIError:
        raise OpenAIException

```

Lots of stuff happening. In order to better understand what's happening where, try to check out the repo.

Whoa. That escalated quickly. What can I say. This article is indeed supposed to walk you through step by step, but at some points, you also gotta learn how to run. Try to analyse the above code, I think it's verbose enough to easily get the grasp. 

Now. We have a simple Completions, without contextual conversations, but with streaming.

What next? We either tackle the persistance, contextualisation or augmented generation.

Let's go with RAG ofc! Before that however...

## Embeddings - fastembed

We will be using  [fastembed](https://github.com/qdrant/fastembed) to as our embeddings lib. Why not use the most popular openai's embeddings? Well, let me tel you why.

Fastebmed is different in that it allows you to locally compute embeddings in a way that's more accurate and faster than default openai embeddings. You can save (tiny amount, but still) money, have better performance, more accuracy and lastly, you avoid making a network call to the API.

It's especially relevant eg. in azure openai's case, where when ingesting large amounts of data you get Rate Limited hard as they do not support batching so all batches are of size 1 (that might have changed.) 

The lib itself is efficient, no hidden deps to hugging face or other 3rd party, unlike some libs that claim to do this, but underneath they are just wrappers for HF/similar solutions.

It makes data ingestion using just qdrant-client way easier. It makes the need for complex wrapper (in simple use cases at least, so most of them) disappear.

It also simplifies the code.

Example:

```python
docs = [
  "Qdrant has Langchain integrations", 
  "Qdrant also has Llama Index integrations"
]
client.add(
  collection_name="demo_collection",
  documents=docs,
)

search_result = client.query(
  collection_name="demo_collection",
  query_text="This is a query document"
)
```

Long story short you do not have to bother with specifying what embeddings to use, prepare an api key. It just works. We will leverage that.

But... before we proceed.

The code starts to get long. I won't be copying it all from the repo now, instead I'll provide brief commentary over how we realised it in code, or will just paste pieces of it.

## Setting up our QDRANT locally and in cloud

To set up qdrant locally you can just:

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

or spin up a free instance in their cloud [over here.](https://cloud.qdrant.io/login) Then [here is how you can connect to said instance](https://github.com/qdrant/qdrant-client#connect-to-qdrant-server)

Otherwise what we have in the repo should work for you out of the box.

Make note that in the docker-compose qdrant is included by default.

## How to ingest data into our qdrant

In our `ingest.py` file we take a very naive approach - we simply ingest a couple of static texts. More on this topic we will talk about in coming articles. This one will be too long as it is already.

For testing it can look something like:

```python
from qdrant_client import QdrantClient

from settings import settings


def test_populate_vector_db(client: QdrantClient):
    # Prepare your documents, metadata, and IDs
    docs = (
        "LoremIpsum sit dolorem",
        "Completely random phrase",
        "Another random phrase",
        "pdf-BRAG is awesome.",
    )
    metadata = (
        {"source": "Olaf"},
        {"source": "grski"},
        {"source": "Olaf"},
        {"source": "grski"},
    )
    ids = [42, 2, 3, 5]

    # Use the new add method
    client.add(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        documents=docs,
        metadata=metadata,
        ids=ids,
    )
```



## Back to RAG - Vector similarity search over qdrant

As explained previously, we need to transform our text query into semantically meaningful vectors using embeddings, then do a Vector Similarity Search, Augment the context and do the generation. Sounds terrible, right? Well, it ain't . With qdrant we can basically do it like so:

```python
# settings/base.py
class Settings(BaseSettings):
    APP_NAME: str = "bRAG"
    ENVIRONMENT: str = Field(env="ENVIRONMENT", default=Environments.LOCAL.value)

    DATABASE_URL: str = Field(env="DATABASE_URL")
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY", default="None")
    GENERATION_TIMEOUT_SEC: int = Field(env="GENERATION_TIMEOUT_SEC", default=120)

    QDRANT_HOST: str = Field(env="QDRANT_HOST", default="localhost")
    QDRANT_PORT: int = Field(env="QDRANT_PORT", default=6333)
    QDRANT_COLLECTION_NAME: str = Field(env="QDRANT_COLLECTION_NAME", default="demo")

    @property
    def is_local(self):
        return self.ENVIRONMENT == Environments.LOCAL.value

    class Config:
        env_file = ".env"


# chats/retrieval.py
from qdrant_client import QdrantClient

from app.chat.exceptions import RetrievalNoDocumentsFoundException
from app.chat.models import BaseMessage
from settings import settings

client = QdrantClient(settings.QDRANT_HOST, port=settings.QDRANT_PORT)

# ONLY FOR TEST PURPOSE (you may call this func by hand or let it be)
test_populate_vector_db(client=client)


def process_retrieval(message: BaseMessage) -> BaseMessage:
    """ Search for a given query using vector similarity search. If no documents are found we raise an exception.
    If we do find documents we take the top 3 and put them into the context."""
    search_result = search(query=message.message)
    resulting_query: str = (
        f"Answer based only on the context, nothing else. \n"
        f"QUERY:\n{message.message}\n"
        f"CONTEXT:\n{search_result}"
    )
    logger.info(f"Resulting Query: {resulting_query}")
    return BaseMessage(message=resulting_query, model=message.model)


def search(query: str) -> str:
    """ This takes our query string, transforms the string into vectors and then searches for the most similar
    documents, returning the top 3. If no documents are found we raise an exception - as the user is asking
    about something not in the context of our documents."""
    search_result = client.query(collection_name=settings.QDRANT_COLLECTION_NAME, limit=3, query_text=query)
    if not search_result:
        raise RetrievalNoDocumentsFoundException
    return "\n".join(result.payload["page_content"] for result in search_result)

```

Now, back to `chat/services.py`

```python
# chat/constants.py
NO_DOCUMENTS_FOUND: str = "No documents found in context. Please try again with a different query."

# chat/services.py 
from app.chat.constants import ChatRolesEnum, NO_DOCUMENTS_FOUND
(...)

OpenAIService (...)
    @classmethod
    async def qa_without_stream(cls, input_message: BaseMessage) -> Message:
        try:
            augmented_message: BaseMessage = process_retrieval(message=input_message)
            return await cls.chat_completion_without_streaming(input_message=augmented_message)
        except RetrievalNoDocumentsFoundException:
            return Message(model=input_message.model, message=NO_DOCUMENTS_FOUND, role=ChatRolesEnum.ASSISTANT.value)
```

lastly, views:

```python
@router.post("/v1/qa-create")
async def qa_create(input_message: BaseMessage) -> Message:
    try:
        return await OpenAIService.qa_without_stream(input_message=input_message)
    except openai.OpenAIError:
        raise OpenAIException

```

Now - homework. Add streaming version of this endpoint. Should be fairly doable.

To test it and actually play around with it you'll need to add certain env variables to settings, .env file and also get qdrant running locally. 

## Persistance, migrations - postgres & dbmate

We probably will want to persist our Messages, right? Well, ask no further. We will do that using plain SQL, wrapped with pugSQL and with the migrations run using dbMate. Weird choice? It is indeed, my dear.

**PDF-stack**. **P**ugSQL, dbMate & **F**astAPI. I came to like it quite much. I've never seen this name before, so for now I'll assume to be the father of this acronym.

**pdF-bRAG.** Now that's cool! 

To check out how all of that is ran, I encourage you to read pugsql & dbmate's documentation.

In short, dbmate is a tool that runs our sql across our databases and makes sure the migrations go as planned, everything is nice and dandy. If they fail, it cleans up.

Who generates the migrations and based on what? Well, you do! You write them in plain SQL. YUP. Feeling the 90s vibes yet? Hope you do.

Now, install dbmate. It's a single binary as it's a project written in go. You can just download it and...

```bashor go with 
sudo curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64
sudo chmod +x /usr/local/bin/dbmate
```

or on mac go with:

```bash
brew install dbmate
```

That's about it.

Now navigate to our project's root dir and type:

```bash
dbmate new create_models # dbmate new <desciprtion_of_the_migrations>
```

Which will create `db/migrations/` directory that'll contain our migrations.

Inside of it you'll find a new file.

```sql
-- migrate:up
<migration code goes here>

-- migrate:down
<rollback code goes here>

```

Surprisingly empty, right? Well, as previously mentioned, you need to write the migrations yourself. In our case, It'll be fairly simple.

```sql
-- migrate:up

CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    model VARCHAR(255),
    role VARCHAR(255),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
);

-- migrate:down

DROP TABLE IF EXISTS message;

```

and that's about it.

Now we need to run our postgres. How? You can install it locally or as a part of docker-compose.yml

```yaml
  database:
    restart: always
    image: postgres:15-alpine
    volumes:
      - pg-data:/var/lib/postgresql/data
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U application" ]
      interval: 5s
      timeout: 5s
      retries: 5
    environment:
      POSTGRES_USER: application
      POSTGRES_PASSWORD: secret_pass
      POSTGRES_DB: application
    ports:
      - "5432:5432"
```

and then

```bash 
dbmate up
```

BOOM. Done.dbmate will look for a DATABASE_URL env inside .env file and apply the migrations to that db.

For more fancy approach - to automatically run our dbmate migrations when our postgres starts, we can add something like this (think if you need it):

```yaml
  dbmate:
    image: amacneil/dbmate:latest
    command:
      - "up"
    depends_on:
      database:
        condition: service_healthy
```

Also, instead of creating a separate service we may want to do the migration in our main container, it'll look like this:

```yaml
  api:
    build:
      context: .
    depends_on:
      database:
        condition: service_healthy
    restart: always
    deploy:
      replicas: 1
    ports:
      - "8000:8000"
    volumes:
      - .:/code/
    command: ["bash", "-c","dbmate up && gunicorn -c settings/gunicorn.conf.py app.main:app"]
    env_file:
      - .env
```

or even put it into the Dockerfile itself. Possibilities are endless.

as for the .env file in relation to `DATABASE_URL`:

it should look like this:

```bash
DATABASE_URL="postgres://application:secret_pass@database:5432/application?sslmode=disable"
# or
protocol://username:password@host:port/database_name?options

#make note that instead of `database` you might need to tpye in `localhost` depending where you are running - on localhost or inside docker container/network

```

note: When connecting to Postgres, you may need to add the `sslmode=disable` option to your connection string, as dbmate by default requires a TLS connection (some other frameworks/languages allow unencrypted connections by default). For local stuff this is fine, for production workload it's best to serve the trafic over ssl - this is the default for dbmate.

Now when we run:

```sql
SELECT * FROM pg_tables WHERE schemaname = 'public';
```

inside our database (google how to connect to your postgres instance) we should be able to see:

```bash
public,schema_migrations,application,,true,false,false,false
public,message,application,,true,false,false,false

```

which tells us our `message` table got created. Yay! 

Migrations done, time for...

## ORMs and their shenanigans - pugSQL for the win

We won't be using an ORM. Why? Just because! No real reason. 

In my case I decided for this becase 

1. pugsql is an awesome project with an awesome name 
2. i need to refresh my sql knowledge
3. it's good to get back to the basics
4.  it allows you to have precise control over everything

So in this project, we won't be using one. You can check out sqlmodel, sqlalchemy or whatever. I used sqlmodel in the past, but it's stuck in development, not supporting Pydantic v2. Tiangalo seems to have become a bottleneck not quite yet willing to give up control over his children to the community. Well, happens. Be it as it may, for now it ain't a viable choice.

So.

How does this thing work? Let me demonstrate with a simple example.

We have our `db` directory, right? Well, inside we have 'migrations' directory, right? Now just create `queries/messages` next to it.

```sql
# db/queries/messages/select_all.sql
-- :name select_all :many
SELECT * FROM message ORDER BY created_at DESC

# db/queries/messages/insert.sql
-- :name insert :insert
INSERT INTO message (model, role, message)
VALUES (:model, :role, :message);

```

This sql should be quite self-explonatory, right?

If not, in short it just either lists all messages or creates a new one.

Now a bit of python:

```python
# app/db.py
import pugsql

messages_queries = pugsql.module("db/queries/messages")
messages_connection = messages_queries.connect(settings.DATABASE_URL)

```

Now how to use it?

```python
from fastapi import APIRouter

import openai
from starlette.responses import StreamingResponse

from app.chats.exceptions import OpenAIException
from app.chats.models import Message, BaseMessage
from app.chats.services import OpenAIService
from app.db import messages_queries

router = APIRouter(tags=["Chat Endpoints"])


@router.get("/v1/messages")
async def get_messages() -> list[Message]:
    # a bit messy as we might want to move this to a service
    return [Message(**message) for message in messages_queries.select_all()]
```

or for create:

```python
class OpenAIService:
    @classmethod
    async def chat_completion_without_streaming(cls, input_message: BaseMessage) -> Message:
        completion: openai.ChatCompletion = await openai.ChatCompletion.acreate(
            model=input_message.model,
            api_key=settings.OPENAI_API_KEY,
            messages=[{"role": ChatRolesEnum.USER.value, "content": input_message.message}],
        )
        logger.info(f"Got the following response: {completion}")
        message = Message(
            model=input_message.model,
            message=cls.extract_response_from_completion(completion),
            role=ChatRolesEnum.ASSISTANT.value
        )
        messages_queries.insert(model=message.model, message=message.message, role=message.role)
        return message
# or for saving the complete response after streaming:

    async with async_timeout.timeout(settings.GENERATION_TIMEOUT_SEC):
        try:
            complete_response: str = ""
            async for chunk in subscription:
                # f-string is faster than concatenation so we use it here
                complete_response = f"{complete_response}{Chunk.get_chunk_delta_content(chunk=chunk)}"
                yield format_to_event_stream(post_processing(chunk))
            message: Message = Message(model=chunk.model, message=complete_response, role=ChatRolesEnum.ASSISTANT.value)
            messages_queries.insert(model=message.model, message=message.message, role=message.role)
            logger.info(f"Complete Streamed Message: {message}")
        except asyncio.TimeoutError:
            raise OpenAIStreamTimeoutException
```

This is just an example.

Try it out. Create a new completion, then for example try to list them.

Bloody stuff works ay! We managed to:

1. Set up migrations with pure SQL and dbMate
2. Get ourselves a nice way to query our database without ORM using pugSQL
3. See how we can ingest text data using fastembed
4. And store it into qdrant
5. Do very crude, but still RAG, using just openai and qdrant
6. Enable streaming in our API
7. Add persistance
8. Prepare local development environment to be quite easy to bring up (1-click deployment)
9. Include plenty of dev-ex tools

BOOM. That's nice.





## CI/CD and other processes - making life easier

On top of what you already got, let's include a bit more stuff that will come in handy:

```docker
# Dockerfile
FROM python:3.11.6 as server
RUN curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64 && \
    chmod +x /usr/local/bin/dbmate
RUN pip install --no-cache-dir --upgrade pip
WORKDIR /project
COPY /requirements/requirements.txt /project/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /project/requirements.txt
COPY . /project
CMD ["bash", "-c", "dbmate up & gunicorn -c settings/gunicorn.conf.py app.main:app"]

```

```yaml
# pre-commit-config.yaml
repos:
-   repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
    - id: black
      language_version: python3.11

- repo: https://github.com/charliermarsh/ruff-pre-commit
  rev: 'v0.0.274'
  hooks:
    - id: ruff
      args: ["--fix"]

```

Makefile for utility stuff:

```makefile
PATH  := $(PATH)
SHELL := /bin/bash

black:
	black .

ruff:
	ruff check . --fix

lint:
	make black
	make ruff

pre-commit:
	pre-commit run --all-files

test-without-clean:
	set -o pipefail; \
	pytest \
	  --color=yes \
	  --junitxml=pytest.xml \
	  --cov-report=term-missing:skip-covered \
	  --cov=app \
	  tests \
	  | tee pytest-coverage.txt

test:
	make test-without-clean
	make clean

upgrade:
	make pip-compile-upgrade
	make pip-compile-dev-upgrade


compile:
	make pip-compile
	make pip-compile-dev

sync:
	pip-sync requirements/requirements.txt
sync-dev:
	pip-sync requirements/requirements.txt requirements/requirements-dev.txt

pip-compile:
	pip-compile -o requirements/requirements.txt pyproject.toml
pip-compile-dev:
	pip-compile --extra dev -o requirements/requirements-dev.txt pyproject.toml

pip-compile-upgrade:
	pip-compile --strip-extras --upgrade -o requirements/requirements.txt pyproject.toml
pip-compile-dev-upgrade:
	pip-compile --extra dev --upgrade -o requirements/requirement-dev.txt pyproject.toml

run:
	python -m gunicorn -c settings/gunicorn.conf.py app.main:app

run-dev:
	python -m uvicorn --reload app.main:app

clean:
	rm -f pytest.xml
	rm -f pytest-coverage.txt
```

(Now you can just do stuff like `make run-dev` or `make pip-compile` or `make sync`)

```toml
[tool.black]
line-length = 120
target-version = ['py311']
include = '\.pyi?$'
exclude = '''
/(
    \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | _build
  | buck-out
  | build
  | dist
  | migrations
)/
'''

[tool.ruff]
line-length = 120
select = ["E", "F", "I"]
fixable = ["A", "B", "C", "D", "E", "F", "I"]
ignore = ["E712"]
exclude = [
    ".bzr",
    ".direnv",
    ".eggs",
    ".git",
    ".hg",
    ".mypy_cache",
    ".nox",
    ".pants.d",
    ".pytype",
    ".ruff_cache",
    ".svn",
    ".tox",
    ".venv",
    "__pypackages__",
    "_build",
    "buck-out",
    "build",
    "dist",
    "node_modules",
    "venv",
    "*migrations*",
]

[tool.ruff.isort]
section-order = ["fastapi", "future", "standard-library", "third-party",  "first-party", "local-folder"]

[tool.ruff.isort.sections]
fastapi = ["fastapi"]
```

While we are at it - `.gitignore` file.

```gitignore
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so
.idea
.env

# Distribution / packaging
.Python
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST


# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
cover/
pytest.xml
pytest-coverage.txt

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

profile_default/
ipython_config.py
.python-version


# PEP 582; used by e.g. github.com/David-OConnor/pyflow and github.com/pdm-project/pdm
__pypackages__/

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site
# Pyre type checker
.pyre/
# pytype static type analyzer
.pytype/
# Cython debug symbols
cython_debug/
# Ruff
.ruff_cache/
```

## Summary

Too tired to write it. This post was long af! 

## Homework - Ideas for further development

1. add chat capabilities
2. add the concept of a user to the application
3. add registration
4. add magic-link login for the user
5. tie messages in 'chats'
6. make chats assosciated with particular users
7. what about context windows and their size? read about it