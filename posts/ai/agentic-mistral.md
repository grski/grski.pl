Title: Building a Simple Agent with MCP, Conversation history, Streaming and Smart Frontend using Locally Deployed Mistral over vLLM
Description: Today we'll create an AI Agent with conversation history that can use an MCP Server (we'll write it ourselves), working with a Language Model deployed locally - Mistral over vLLM, all wrapped in FastAPI with Streaming support in Vercel AI SDK v5 format, connected to a frontend that handles collapsible Tool Calls, Streaming and persistence. Essentially, we'll make a ChatGPT clone.
Date: 2025-09-07
Authors: Olaf Górski
Slug: agentic-mistral
Language: en

In today's post, we'll tackle an ambitious task. We'll create an AI Agent with conversation history that can use MCP Server (we'll write it ourselves), working with a Language Model deployed locally with Mistral, all wrapped in FastAPI with Streaming support in Vercel AI SDK v5 format, connected to a frontend that handles collapsible Tool Calls, Streaming and persistence. Essentially, we'll make a ChatGPT clone. Everything running locally and built from scratch by us, except the frontend, where we'll fortunately use a ready-made solution. Additionally, we'll use two computers simultaneously - one will serve the model, the other for development.

So here's what we need to do:

1. Local deployment of Mistral
2. Creating an Agent
3. Writing our own MCP
4. Adding MCP to the Agent
5. Adding Streaming
6. Discussing multi-agent setup
7. Wrapping this in an agents sdk -> ai sdk v5 output parser with streaming
8. Serving via endpoint
9. Adding conversation context
10. Adding conversation persistence with auto-generated conversation titles

We'll use vLLM, OpenAI Agents SDK, assistant-ui with vercel ai sdk v5 for this.

Let's get to work!

## Running Mistral with vLLM

In the past I had some nasty experience installing vLLM and used llama.cpp. Well, I don't give up that easily and decided to try once more, as vLLM is rather recommended. Initially, I decided to approach it as recommended in the docs, where the instructions changed since I last saw them so it got me hopeful:

### Installing vLLM

```bash
git clone https://github.com/vllm-project/vllm.git
cd vllm
uv python install 3.12
uv venv --python 3.12
uv pip install -r requirements/cpu.txt
# in my case it was necessary to add one flag:
# uv pip install --index-strategy unsafe-best-match -r requirements/cpu.txt
uv pip install -e .
```

Surprisingly, it worked. However, there's one problem - installing vLLM this way will only be available in a specific virtual environment and I don't want that - I want it available globally. Need to do it differently. Turns out, it can be done simpler and faster.

```bash
uv python install 3.12
# 3.13 doesn't work
uv tool install --python 3.12 vllm
```

Using `uv tool` will make the vllm command available globally and not just inside a specific uv environment. Just as I'd like.

We have vllm, we have uv, what else do we need? [Hugging Face](https://huggingface.co/). Why? We'll be pulling the model from there - huggingface.co - it's like a repository with various models.

Create an account there, then go to Access Tokens and generate an access token with Read access, copy it. Then:

```bash
uv tool install --python 3.12 huggingface-hub
hf auth login
```

Now go to the Mistral model page that interests us, for example:

https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3

And confirm the conditions. Now nothing stops us from running the model locally so our account has download access. There's one more thing.

### Tool calling support

Mistral supports tool calling by default. I suggest using their parser over Hermes.

## Running Mistral via vLLM

Now finally:

```bash
vllm serve mistralai/Mistral-7B-Instruct-v0.3 \
    --host 0.0.0.0 \
    --port 8000 \
    --enable-auto-tool-choice \
    --max-num-batched-tokens 32768 \
    --tool-call-parser mistral
```

I'm GPU and RAM-poor so only the 7B option is viable. The 7B model consumed about 18 GB RAM for me. You could try downloading quantized files, however vLLM and their AWK format don't support poor folks with Macs and M4 chips, so unfortunately that option is out. Too bad, because then I could run larger models.

What does quantized mean?

You can think of it as compression. It's like a compressed model that requires fewer resources to run, works maybe SLIGHTLY less accurately, but uses X times fewer resources. A very good compromise. At least that's what I tell myself as GPU-poor. Back to our topic.

A moment of waiting and...

It's running beautifully. However, it lags a bit on my single laptop when I also run IDE, browser and other things. What to do about this?

### On two Macs

I have two Macs, one newer, one older. On the newer one I ran the model while doing development on the older one. How to make one talk to the other? If you have one wi-fi, it's quite trivial. On the one where you have the model running, type:

```bash
ifconfig en0 | grep inet
inet6 fe80::10b4:3cc6:e4b8:e5ec%en0 prefixlen 64 secured scopeid 0xe 
	inet 192.168.100.90 netmask 0xffffff00 broadcast 192.168.100.255
```

To get the internal IP address in the local network. For me it will be `192.168.100.90`. The API with the model runs on port 8000. `192.168.100.90:8000/docs` on the older Mac and... boom! It works. Remember to change my address to the one you receive in the code examples above.

If you can't connect, check if you have local network access enabled in settings for the application you're running the script from, probably terminal/warp/cursor/pycharm. How?

```
Menu -> Settings -> Privacy & Security -> Local Network
```

## Creating our agent with OpenAI Agents SDK

Let's move on to coding, finally. Let's start with a small reminder and make a regular chat completions request to our local model.

Well, almost, because first dependencies:

```bash
uv add openai openai-agents
```

Got it. What's with uv etc. Please read up on it yourself. UV is like a successor to poetry+pyenv in one. Plus it's fast and from the same authors as ruff.

```python
# completions.py
from openai import OpenAI

BASE_URL: str = "http://192.168.100.90:8000/v1"

client = OpenAI(base_url=BASE_URL, api_key="...")

def main():
    completion = client.chat.completions.create(
        model="mistralai/Mistral-7B-Instruct-v0.3",
        messages=[
            {"role": "assistant", "content": "Speak like Shakespeare."},
            {
                "role": "user",
                "content": "What is the meaning of life?",
            },
        ],
    )
    print(completion.choices[0].message.content)


if __name__ == "__main__":
    main()
uv run python completions.py
```

Works? Works. And how! A bit slow, but that's fine.

Time to create our agent.

We'll do this using OpenAI Agents SDK. There are alternatives like Agno or CrewAI, but we'll use agents sdk. In my opinion, it's quite nice tbh. I have Vietnam flashbacks from early versions of CrewAI.

But first, what even is an agent:

**Basic definition:** An AI Agent is an autonomous AI system that receives a task to complete and independently plans and executes the steps needed to complete it, using the tools available to it.

**How it works:**

- Gets a goal/task from the user
- Has access to a set of tools (APIs, databases, search engines, etc.)
- Plans a sequence of actions
- Executes them step by step
- Evaluates results and adjusts the plan if necessary
- Continues until it considers the task complete

**Key features:**

- **Autonomy** - acts independently without constant supervision
- **Tools** - can call functions, APIs, search the internet
- **Planning** - creates and modifies action plans
- **Decision loop** - "thinks, acts, evaluates, plans further"

It's like having an assistant to whom you say "book me a flight to Berlin" and they check dates, compare prices, book the ticket and hotel themselves, instead of just giving advice on how to do it.

It differs from a regular chatbot in that it not only responds but actually **performs** tasks in the real world.

Or in my words, not Claude's, we describe a task to the agent that it should complete itself using the tools available to it. In short, it's just regular chat completions running in a loop, planning, calling tools when needed and making decisions on its own, unless we implement human-in-the-loop, then it asks the human.

How does this look in code?

```python
# agent.py
import asyncio
import os

from agents import Agent, Runner, set_default_openai_api, set_default_openai_client
from openai import AsyncOpenAI


os.environ["OPENAI_BASE_URL"] = "http://192.168.100.90:8000/v1"
os.environ["OPENAI_API_KEY"] = "EMPTY"

model = "mistralai/Mistral-7B-Instruct-v0.3"

agent = Agent(
    name="Tutor",
    instructions="You help with mathematics. You receive a question from the user and answer it. Explain your reasoning and provide examples.",
    model=model,
)


async def main():
    result = await Runner.run(agent, "What is addition?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

Doesn't work.

Why? It turns out we need to define a custom model for our agent if we're running the model locally. How?

```python
# agent.py
import asyncio
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIResponsesModel

async def main():
    openai_client = AsyncOpenAI(
        base_url="http://192.168.100.90:8000/v1",
        api_key="EMPTY",
    )
    
    agent = Agent(
        name="Tutor",
        instructions="You help with mathematics. You receive a question from the user and answer it. Explain your reasoning and provide examples.",
        model=OpenAIResponsesModel(
            model="mistralai/Mistral-7B-Instruct-v0.3",
            openai_client=openai_client,
        ),
    )
    
    result = await Runner.run(agent, "What is addition?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
uv run python agent.py
```

Now it works. The agent we defined isn't very useful, has no tools, doesn't differ from regular chat completions. Time to change that.

## Adding MCP to the Agent

Now it's time to equip our agent with something more - MCP. What is MCP? MCP (Model Context Protocol) is a way for AI to connect with various applications and services - like Gmail, calendar, databases or programming tools. Instead of AI that just talks, it can now actually do things - check emails, add events to the calendar, or run code, or in our case (more on this later) check the current date. It's like giving AI "hands" to work with real tools that we use every day.

It's function calling wrapped in a fancy protocol that LLMs understand and which has now become the standard.

To do this, let's first create our own MCP. It will be very simple. First, let's install `fastmcp`.

```bash
uv add fastmcp
```

And that's it, now just...

```python
from fastmcp import FastMCP
from datetime import datetime

mcp = FastMCP("My MCP Server")


@mcp.tool
def get_current_date() -> str:
    """Returns the current date"""

    return datetime.now().strftime("%Y-%m-%d")


if __name__ == "__main__":
    mcp.run(transport="http", port=8001)
```

How to add this to our agent?

1. Change OpenAIResponsesModel to OpenAIChatCompletionsModel as Responses doesn't support tool calling for Mistral.
2. Add MCP.

```python
import asyncio
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel
from agents.mcp import MCPServerStreamableHttp


mcp_helper_server = MCPServerStreamableHttp(
    name="My MCP Server",
    params={
        "url": "http://127.0.0.1:8001/mcp",
    },
)


async def main():
    openai_client = AsyncOpenAI(
        base_url="http://192.168.100.90:8000/v1",
        api_key="EMPTY",
    )
    async with mcp_helper_server:
        agent = Agent(
            name="Date Assistant",
            instructions="You are a helpful assistant that can check the current date. When asked about dates or time, use the get_current_date tool to provide accurate information.",
            model=OpenAIChatCompletionsModel(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                openai_client=openai_client,
            ),
            mcp_servers=[mcp_helper_server],
            
        )
        
        # Run the agent
        result = await Runner.run(agent, "Can you tell me what date it is today using the get_current_date function?")
        print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

And watch...

In response we get:

```bash
**Today's date is: September 7, 2025.**
```

What does the response look like without MCP?

```bash
The current date is: 2022-03-15
```

Why is that?

**Architecture and how it works.** LLMs are trained on data from a specific period and their knowledge is "frozen" at the moment training ends. This means the model has knowledge only up to a certain point (called "knowledge cutoff") and cannot learn new information in real-time. So for an LLM to know what day it is, it must get or retrieve this data from somewhere, e.g., our MCP.

What happened under the hood?

The agent was initialized with a specific prompt and a list of tools, which it extracted from our MCP server. It received a question. It analyzed the question. It determined that to answer this question it should use the available tool - today's date. So it did. After receiving the response from the tool, it analyzed whether it had everything to answer the question - it did, so it formulated a response for the user. Sounds non-trivial, right? Because it is. More than one LLM query happened under the hood.

In more complex workflows, it can do some pretty amazing things. Speaking of which.

## Multi-agent

As our agent/application complexity grows, it will be better to split it into several smaller agents and one that orchestrates the whole gang. Like splitting large functions into smaller ones. In OpenAI Agents SDK this is done very simply. There are two ways - the first is handoff, the second is agent-as-tool. We'll use the latter because it's somewhat simpler.

What's it about?

We simply define our agents as if nothing happened and then pass them as tools to the orchestrating agent.

```python
import asyncio
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel
from agents.mcp import MCPServerStreamableHttp


mcp_helper_server = MCPServerStreamableHttp(
    name="My MCP Server",
    params={
        "url": "http://127.0.0.1:8001/mcp",
    },
)


async def main():
    openai_client = AsyncOpenAI(
        base_url="http://192.168.100.90:8000/v1",
        api_key="EMPTY",
    )
    async with mcp_helper_server:
        date_time_agent = Agent(
            name="Date and Time Agent",
            instructions="You MUST use the get_current_date tool to answer questions. Always call get_current_date when asked about dates. Do not guess or make up dates.",
            model=OpenAIChatCompletionsModel(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                openai_client=openai_client,
            ),
            mcp_servers=[mcp_helper_server],
        )
        haiku_agent = Agent(
            name="Haiku generator",
            instructions="You generate haiku but only 5 line ones.",
            model=OpenAIChatCompletionsModel(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                openai_client=openai_client,
            ),
        )
        orchestrator = Agent(
            name="Orchestrator",
            instructions="You MUST delegate tasks to specialized agents. Use date_time_agent for date questions. Use haiku_agent for haiku generation. Do NOT answer directly.",
            model=OpenAIChatCompletionsModel(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                openai_client=openai_client,
            ),
            tools=[
                date_time_agent.as_tool(tool_name="date_time_agent", tool_description="Agent that gets current date using get_current_date tool"), 
                haiku_agent.as_tool(tool_name="haiku_agent", tool_description="Generates haiku but only 5 line ones.")
                ],
        )
        # Run the agent
        result = await Runner.run(orchestrator, "Use date_time_agent to get today's date, then use haiku_agent to create a haiku")
        print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

And there we go. What did it output?

```bash
Here is a contemporary haiku based on today's date (2025-09-06):

**Clouds drift slowly**  
**Over the meadow in silence.**  
**Sun slowly fades.**  
**Time to return home.**  
**Night always believes fully.**

Your favorite haiku situation has been included!
```

However, I must admit that with a multi-agent setup, the 7B model gets quite confused - sometimes it calls tools/mcp, often not, instead explain gin what to do, so unfortunately I won't explore further and will return to a single agent setup. I noticed it gave the best responses on the first call for a given model run. That is, if I restarted the server responsible for serving the model - the response was good. Each subsequent one was not. I don't know what causes this.

By the way, most models can even call several tools simultaneously, it's worth knowing, though we won't delve into it because I don't even know if Mistral supports this.

## Streaming

Let's go in another direction.

We wait a long time for a response. Poor UX. How to improve this? Let's add streaming. We need to change this piece:

```python
        result = await Runner.run(agent, "....")
        print(result.final_output)
```

We change this to:

```python
import asyncio
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel
from openai.types.responses import ResponseTextDeltaEvent
from agents.mcp import MCPServerStreamableHttp


mcp_helper_server = MCPServerStreamableHttp(
    name="My MCP Server",
    params={
        "url": "http://127.0.0.1:8001/mcp",
    },
)


async def main():
    openai_client = AsyncOpenAI(
        base_url="http://192.168.100.90:8000/v1",
        api_key="EMPTY",
    )
    async with mcp_helper_server:
        agent = Agent(
            name="Date Assistant",
            instructions="You MUST use the get_current_date tool to answer questions. Always call get_current_date when asked about dates. Do not guess or make up dates.",
            model=OpenAIChatCompletionsModel(
                model="mistralai/Mistral-7B-Instruct-v0.3",
                openai_client=openai_client,
            ),
            mcp_servers=[mcp_helper_server],
        )
        
        result = Runner.run_streamed(agent, input="Use get_current_date tool to tell me today's date")
        async for event in result.stream_events():
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                print(event.data.delta, end="", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
```

Now instead of the entire response at once, we'll get it piece by piece. Damn, that's cool, right?

## Frontend - assistant-ui

The console is a bit weak, what if we wanted to add some frontend to this? Here's how we do it:

```bash
npx assistant-ui@latest create
# as project name we give 'frontend'
# for this to work we need to have nodejs installed
```

Then we modify:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/stream',
        destination: 'http://localhost:8002/stream',
      },
    ];
  },
};

export default nextConfig;
```

All we did here was add a proxy to our backend so we don't have to deal with CORS.

```ts
// assistant.tsx
export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });
```

Change to:

```ts
// assistant.tsx
export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/stream",
    }),
  });
```

And run:

```bash
npm run dev
```

Assistant-ui is awesome.

On localhost:3000 we should see a nice UI. However, it's not integrated with our backend in any way. How to change that? Simply. First, we need to figure out what payload the frontend sends to know how to implement the backend.

To find out what format the frontend sends data in, we just need to open Inspect -> Network in Developer Tools before making a query and boom, the entire request is before us, along with payload and headers. Everything becomes clear, the payload we receive is:

```json
{
    "tools": {},
    "id": "LCot9rqP2KsYY95f",
    "messages": [
        {
            "id": "X3FlmLD7Nk2NVzH6",
            "role": "user",
            "parts": [
                {
                    "type": "text",
                    "text": "What is today's date?"
                }
            ]
        }
    ],
    "trigger": "submit-message"
}
```

The above is the Vercel AI SDK v5 format. Want to know more? Read about Vercel AI SDK v5. In short:

Vercel AI SDK v5 Streaming Protocol is a **standard protocol** based on **Server-Sent Events (SSE)** with JSON objects for streaming AI data in real-time.

## **Protocol basics**

**Format:** Server-Sent Events with JSON payloads

```
data: {"type": "event_type", "payload": "data"}
```

**Header:** Requires `x-vercel-ai-ui-message-stream: v1`

## **Main event types**

### **1. Message lifecycle**

```
data: {"type": "start", "messageId": "msg_123"}
data: {"type": "finish"}
```

### **2. Text streaming (start/delta/end pattern)**

```
data: {"type": "text-start", "id": "text_block_id"}
data: {"type": "text-delta", "id": "text_block_id", "delta": "fragment"}
data: {"type": "text-end", "id": "text_block_id"}
```

### **3. Tool operations**

```
data: {"type": "tool-input-start", "toolCallId": "call_123", "toolName": "weather"}
data: {"type": "tool-input-delta", "toolCallId": "call_123", "inputTextDelta": "London"}
data: {"type": "tool-input-available", "toolCallId": "call_123", "input": {"city": "London"}}
data: {"type": "tool-output-available", "toolCallId": "call_123", "output": {"temp": 15}}
```

### **4. Custom data and sources**

```
data: {"type": "data-weather", "data": {"temperature": 20}}
data: {"type": "source-url", "sourceId": "url1", "url": "https://example.com"}
data: {"type": "file", "url": "https://example.com/file.pdf", "mediaType": "application/pdf"}
```

### **5. Errors and reasoning**

```
data: {"type": "error", "errorText": "Connection failed"}
data: {"type": "reasoning-start", "id": "reasoning_123"}
data: {"type": "reasoning-delta", "id": "reasoning_123", "delta": "thinking..."}
```

There's quite a bit of it. Fortunately, I'll help you out and give you a ready-made solution that handles most of this.

## Backend FastAPI

```bash
uv add fastapi
```

The above on our backend will look more or less like this:

```python
# models.py
from pydantic import BaseModel, Field
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# Frontend format models
class MessagePart(BaseModel):
    type: str
    text: str | None = None  # Make text optional to handle tool execution parts

    # Optional fields for tool execution data
    tool_call_id: str | None = Field(None, alias="toolCallId")
    state: str | None = None
    output: dict | None = None
    data: dict | None = None


class FrontendMessage(BaseModel):
    id: str
    role: MessageRole   
    parts: list[MessagePart]

    def get_text_content(self) -> str:
        """Extract text content from parts array."""
        return " ".join([part.text for part in self.parts if part.type == "text" and part.text])


class StreamRequest(BaseModel):
    tools: dict
    id: str
    messages: list[FrontendMessage]
    trigger: str

    def to_input_list(self) -> list[dict]:
        """Convert messages to input list format for session."""
        result = []
        for msg in self.messages:
            text_content = msg.get_text_content()
            # Only include messages that have actual text content
            if text_content:
                result.append({"content": text_content, "role": msg.role})
        return result
```

We have models, now we need something to convert what OpenAI Agents SDK returns to what Vercel AI SDK v5 understands. A piece of code:

```python
# streaming/ai_sdk_formatter.py
import json
import uuid
from enum import StrEnum


class EventTypes(StrEnum):
    """Event types used in AI SDK streaming."""
    START = "start"
    TEXT_START = "text-start"
    TEXT_DELTA = "text-delta"
    TEXT_END = "text-end"
    TOOL_INPUT_START = "tool-input-start"
    TOOL_INPUT_DELTA = "tool-input-delta"
    TOOL_INPUT_AVAILABLE = "tool-input-available"
    TOOL_OUTPUT_AVAILABLE = "tool-output-available"
    START_STEP = "start-step"
    FINISH_STEP = "finish-step"
    ERROR = "error"
    FINISH = "finish"


class AiSdkFormatter:
    """Server-Sent Events formatter for AI SDK v5 streaming responses."""
    @staticmethod
    def format_sse_event(data: dict) -> str:
        """Format data as Server-Sent Event."""
        return f"data: {json.dumps(data)}\n\n"

    @classmethod
    def format_message_start(cls, message_id: str = None) -> str:
        """Format message start event."""
        if message_id is None:
            message_id = f"msg_{uuid.uuid4().hex[:8]}"
        return cls.format_sse_event({"type": EventTypes.START, "messageId": message_id})

    @classmethod
    def format_text_start(cls, message_id: str) -> str:
        """Format text start event."""
        return cls.format_sse_event({"type": EventTypes.TEXT_START, "id": message_id})

    @classmethod
    def format_text_delta(cls, message_id: str, delta: str) -> str:
        """Format text delta event."""
        delta = delta.replace("\u2022", "-")
        return cls.format_sse_event({"type": EventTypes.TEXT_DELTA, "id": message_id, "delta": delta})

    @classmethod
    def format_text_end(cls, message_id: str) -> str:
        """Format text end event."""
        return cls.format_sse_event({"type": EventTypes.TEXT_END, "id": message_id})

    @classmethod
    def format_tool_input_start(cls, tool_call_id: str, tool_name: str) -> str:
        """Format tool input start event."""
        return cls.format_sse_event({"type": EventTypes.TOOL_INPUT_START, "toolCallId": tool_call_id, "toolName": tool_name})

    @classmethod
    def format_tool_input_delta(cls, tool_call_id: str, input_text_delta: str) -> str:
        """Format tool input delta event."""
        return cls.format_sse_event(
            {"type": EventTypes.TOOL_INPUT_DELTA, "toolCallId": tool_call_id, "inputTextDelta": input_text_delta}
        )

    @classmethod
    def format_tool_input_available(cls, tool_call_id: str, tool_name: str, input_data: dict) -> str:
        """Format tool input available event."""
        return cls.format_sse_event(
            {"type": EventTypes.TOOL_INPUT_AVAILABLE, "toolCallId": tool_call_id, "toolName": tool_name, "input": input_data}
        )

    @classmethod
    def format_tool_output_available(cls, tool_call_id: str, output: dict) -> str:
        """Format tool output available event."""
        return cls.format_sse_event({"type": EventTypes.TOOL_OUTPUT_AVAILABLE, "toolCallId": tool_call_id, "output": output})

    @classmethod
    def format_start_step(cls, step: int) -> str:
        """Format start step event."""
        return cls.format_sse_event({"type": EventTypes.START_STEP, "step": step})

    @classmethod
    def format_finish_step(cls, step: int, finish_reason: str = "tool-calls") -> str:
        """Format finish step event."""
        return cls.format_sse_event({"type": EventTypes.FINISH_STEP, "step": step, "finishReason": finish_reason})

    @classmethod
    def format_error(cls, error: str) -> str:
        """Format error event."""
        return cls.format_sse_event({"type": EventTypes.ERROR, "error": error})

    @classmethod
    def format_finish(cls) -> str:
        """Format finish event."""
        return cls.format_sse_event({"type": EventTypes.FINISH})

    @classmethod
    def format_done(cls) -> str:
        """Format stream termination."""
        return "data: [DONE]\n\n"

    @classmethod
    def generate_tool_call_id(cls, tool_name: str = None) -> str:
        """Generate unique tool call ID."""
        prefix = f"{tool_name}_" if tool_name else "call_"
        return f"{prefix}{uuid.uuid4().hex[:8]}"
      
# streaming/event_processor.py
import json
import logging
from enum import StrEnum
from openai.types.responses import ResponseTextDeltaEvent

logger = logging.getLogger(__name__)
from .ai_sdk_formatter import AiSdkFormatter


class StreamEventTypes(StrEnum):
    """Event types from the agent runner stream."""
    RAW_RESPONSE = "raw_response_event"
    RUN_ITEM_STREAM = "run_item_stream_event"


class RunItemTypes(StrEnum):
    """Types of run items in the stream."""
    TOOL_CALL = "tool_call_item"
    TOOL_OUTPUT = "tool_call_output_item"


class AgentsEventProcessor:
    """Processes streaming events from the agent runner."""

    def __init__(self):
        self.message_id = AiSdkFormatter.generate_tool_call_id("msg")
        self.active_tool_calls = []  # Use list to maintain order
        self.text_streaming = False

    @classmethod
    async def process_events(cls, result):
        """Main event processing loop."""
        processor = cls()

        # Send message start
        yield AiSdkFormatter.format_message_start(processor.message_id)


        async for event in result.stream_events():
            if event.type == StreamEventTypes.RAW_RESPONSE:
                chunk = processor._handle_raw_response_event(event)
                if chunk:
                    yield chunk
            elif event.type == StreamEventTypes.RUN_ITEM_STREAM:
                chunk = processor._handle_run_item_event(event)
                if chunk:
                    yield chunk

        # End any active text streaming
        if processor.text_streaming:
            yield AiSdkFormatter.format_text_end(processor.message_id)

        # Send finish event then completion
        yield AiSdkFormatter.format_finish()
        yield AiSdkFormatter.format_done()

    def _handle_raw_response_event(self, event) -> str:
        """Handle text delta events."""
        if isinstance(event.data, ResponseTextDeltaEvent):
            # Start text streaming if not already started
            if not self.text_streaming:
                self.text_streaming = True
                return AiSdkFormatter.format_text_start(self.message_id) + AiSdkFormatter.format_text_delta(
                    self.message_id, event.data.delta
                )
            else:
                return AiSdkFormatter.format_text_delta(self.message_id, event.data.delta)
        return ""

    def _handle_run_item_event(self, event) -> str:
        """Handle run item events (tool calls and outputs)."""
        if event.item.type == RunItemTypes.TOOL_CALL:
            return self._handle_tool_call_event(event)
        elif event.item.type == RunItemTypes.TOOL_OUTPUT:
            return self._handle_tool_output_event(event)
        return ""

    def _handle_tool_call_event(self, event) -> str:
        """Handle tool call events."""
        # End text streaming if active
        result = ""
        if self.text_streaming:
            result += AiSdkFormatter.format_text_end(self.message_id)
            self.text_streaming = False

        tool_name = self._extract_tool_name(event.item)
        tool_call_id = AiSdkFormatter.generate_tool_call_id(tool_name)

        # Store tool call info for later output handling
        self.active_tool_calls.append({"id": tool_call_id, "name": tool_name, "item": event.item})

        logger.debug(f"Tool called: {tool_name} with ID: {tool_call_id}")

        # Get tool input if available
        tool_input = self._extract_tool_input(event.item)

        result += AiSdkFormatter.format_tool_input_start(tool_call_id, tool_name)

        if tool_input:
            # For simplicity, send the entire input as available immediately
            result += AiSdkFormatter.format_tool_input_available(tool_call_id, tool_name, tool_input)

        return result

    def _handle_tool_output_event(self, event) -> str:
        """Handle tool output events."""
        # Use FIFO approach - match outputs to calls in order they were made
        tool_call_info = None

        # Get the first (oldest) pending tool call
        if self.active_tool_calls:
            tool_call_info = self.active_tool_calls.pop(0)  # Remove from list once matched

        if not tool_call_info:
            # Ultimate fallback if no pending tool calls
            tool_call_id = AiSdkFormatter.generate_tool_call_id()
        else:
            tool_call_id = tool_call_info["id"]

        output = getattr(event.item, "output", "No output")
        logger.debug(f"Tool output received: {len(str(output))} characters")

        # Try to parse output as JSON, otherwise use as string
        try:
            if isinstance(output, str):
                output_data = {"result": output}
            else:
                output_data = {"result": str(output)}
        except Exception:
            output_data = {"result": str(output)}

        return AiSdkFormatter.format_tool_output_available(tool_call_id, output_data)

    @classmethod
    def _extract_tool_name(cls, item) -> str:
        """Extract tool name from various item structures."""
        if hasattr(item, "raw_item"):
            raw_item = item.raw_item
            if hasattr(raw_item, "function") and hasattr(raw_item.function, "name"):
                return raw_item.function.name
            if hasattr(raw_item, "name"):
                return raw_item.name
            if hasattr(raw_item, "tool_name"):
                return raw_item.tool_name
            if hasattr(raw_item, "type"):
                return raw_item.type
        return "Unknown Tool"

    @classmethod
    def _extract_tool_input(cls, item) -> dict:
        """Extract tool input from item structure."""
        if hasattr(item, "raw_item"):
            raw_item = item.raw_item
            if hasattr(raw_item, "function") and hasattr(raw_item.function, "arguments"):
                try:
                    # Parse JSON arguments
                    args_str = raw_item.function.arguments
                    if isinstance(args_str, str):
                        return json.loads(args_str)
                    return args_str
                except json.JSONDecodeError:
                    return {"arguments": args_str}
            if hasattr(raw_item, "arguments"):
                return raw_item.arguments
            if hasattr(raw_item, "input"):
                return raw_item.input
        return {}
```

The whole thing could probably be written much more nicely, but Mr. Claude did quite a nice job so I won't correct him anymore.

Models? We have them. Formatter to Vercel AI SDK v5 format? Also. Processor converting events from OpenAI Agents SDK? Also.

What's left? The endpoint itself. What will it look like? Almost the same as our agent.

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn
import uuid
from streaming.agents_event_processor import AgentsEventProcessor
from models import StreamRequest
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, SQLiteSession
from agents.mcp import MCPServerStreamableHttp


mcp_helper_server = MCPServerStreamableHttp(
    name="My MCP Server",
    params={
        "url": "http://127.0.0.1:8001/mcp",
    },
)
openai_client = AsyncOpenAI(
    base_url="http://192.168.100.90:8000/v1",
    api_key="EMPTY",
)


app = FastAPI()

class StreamHandler:
    @classmethod
    async def _create_session(cls, stream_request):
        """Create and initialize a session with stream request.

        Returns:
            tuple: (session, latest_message)
        """
        session = SQLiteSession(f"conversation_{uuid.uuid4()}")
        latest_message = stream_request.messages.pop()

        # Filter out empty messages before adding to session
        session_messages = stream_request.to_input_list()
        print(session_messages)
        filtered_messages = cls._filter_empty_messages(session_messages)
        await session.add_items(items=filtered_messages)

        return session, latest_message
    
    @classmethod
    def _filter_empty_messages(cls, messages):
        """Filter out messages with empty content."""
        return [msg for msg in messages if msg.get('content', '').strip()]

@app.post("/stream")
async def stream(stream_request: StreamRequest, request: Request):
    async def generate():
        async with mcp_helper_server:
            # Create session with conversation history
            session, latest_message = await StreamHandler._create_session(stream_request)
            
            agent = Agent(
                name="Date Assistant",
                instructions="You MUST use the get_current_date tool to answer questions. Always call get_current_date when asked about dates. Do not guess or make up dates.",
                model=OpenAIChatCompletionsModel(
                    model="mistralai/Mistral-7B-Instruct-v0.3",  # Your model name
                    openai_client=openai_client,
                ),
                mcp_servers=[mcp_helper_server],
            )
            
            # Get input text from latest message
            input_text = latest_message.get_text_content()
            # Run the agent with session
            result = Runner.run_streamed(
                agent, 
                input=input_text,
                session=session
            )
            async for chunk in AgentsEventProcessor.process_events(result):
                if chunk:
                    yield chunk
    
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1"
    }
    
    return StreamingResponse(generate(), media_type="text/event-stream", headers=headers)

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8002, reload=True)
```

And bang. Around than 400 lines of code and we have this whole Agentic AI. Is there anything more beautiful? Oh yes.

The code above only handles the latest message, what if we want to include previous messages in the context we pass to the model?

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn
import uuid
from streaming.agents_event_processor import AgentsEventProcessor
from models import StreamRequest
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, SQLiteSession
from agents.mcp import MCPServerStreamableHttp


mcp_helper_server = MCPServerStreamableHttp(
    name="My MCP Server",
    params={
        "url": "http://127.0.0.1:8001/mcp",
    },
)
openai_client = AsyncOpenAI(
    base_url="http://192.168.100.90:8000/v1",
    api_key="EMPTY",
)


app = FastAPI()

class StreamHandler:
    @classmethod
    async def _create_session(cls, stream_request):
        """Create and initialize a session with stream request.

        Returns:
            tuple: (session, latest_message)
        """
        session = SQLiteSession(f"conversation_{uuid.uuid4()}")
        latest_message = stream_request.messages.pop()

        # Filter out empty messages before adding to session
        session_messages = stream_request.to_input_list()
        print(session_messages)
        filtered_messages = cls._filter_empty_messages(session_messages)
        await session.add_items(items=filtered_messages)

        return session, latest_message
    
    @classmethod
    def _filter_empty_messages(cls, messages):
        """Filter out messages with empty content."""
        return [msg for msg in messages if msg.get('content', '').strip()]

@app.post("/stream")
async def stream(stream_request: StreamRequest, request: Request):
    async def generate():
        async with mcp_helper_server:
            # Create session with conversation history
            session, latest_message = await StreamHandler._create_session(stream_request)
            
            agent = Agent(
                name="Tutor",
                instructions="You help with date and time.",
                model=OpenAIChatCompletionsModel(
                    model="mistralai/Mistral-7B-Instruct-v0.3",
                    openai_client=openai_client,
                ),
                mcp_servers=[mcp_helper_server],
            )
            
            # Get input text from latest message
            input_text = latest_message.get_text_content()
            # Run the agent with session
            result = Runner.run_streamed(
                agent, 
                input=input_text,
                session=session
            )
            async for chunk in AgentsEventProcessor.process_events(result):
                if chunk:
                    yield chunk
    
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1"
    }
    
    return StreamingResponse(generate(), media_type="text/event-stream", headers=headers)

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8002, reload=True)
```

What if we want persistence? In the simplest case, we can use assistant-ui cloud.

## assistant-ui cloud

Assistant-ui cloud will enable message persistence and automatic generation of conversation titles. They handle everything in their cloud. How?

https://cloud.assistant-ui.com

Settings -> api keys -> generate

And edit assistant.tsx

```tsx
"use client";

import { AssistantCloud, AssistantRuntimeProvider } from '@assistant-ui/react'
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const cloud = new AssistantCloud({
  baseUrl: youraddress,
  anonymous: true
})


export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/stream",
    }),
    cloud
  });
  ...... rest of file
```

Done.

Holy cow, that's cool, right? Not so hard, this AI stuff.

**Reality check though:** While this tutorial shows you how everything fits together, I have to be honest - 7B models like the Mistral we're using are pretty rough when it comes to orchestration and function calling. They'll stumble on multi-step reasoning, make questionable decisions about when to use tools, and generally struggle with the complex planning that makes agents truly useful. If you're building something for production, you really want 13B+ models or something specifically trained for function calling. But hey, this is about learning the architecture, and for that, our setup works just fine.
