Title: Polacy nie gęsi swój język mają cz. II: Bielik.AI na randce z vLLM, Agentami, MCP, assistant-ui i streamingiem.
Description: Dziś stworzymy sobie AI Agenta z historią konwersacji, który potrafi korzystać z MCP Servera (sami napiszemy), działającego z Polskim Modelem Językowym, odpalonym lokalnie Bielikiem, to wszystko owiniemy w FastAPI z obsługą Streamingu w formacie Vercel AI SDK v5, podepniemy frontend, który ogarnia collapsible Tool Calle, Streaming i persystencję. Czyli niejako zrobimy klona ChatGPT
Date: 2025-09-06
Authors: Olaf Górski
Slug: bielik-cz-2
Language: pl

W dzisiejszym wpisie podejdziemy do ambitnego zadania. Otóż stworzymy sobie AI Agenta z historią konwersacji, który potrafi korzystać z MCP Server (sami napiszemy), działającego z Polskim Modelem Językowym, odpalonym lokalnie Bielikiem, to wszystko owiniemy w FastAPI z obsługą Streamingu w formacie Vercel AI SDK v5, podepniemy frontend, który ogarnia collapsible Tool Calle, Streaming i persystencję. Czyli niejako zrobimy klona ChatGPT. Wszystko działające lokalnie i zrobione od zera przez nas, poza frontem, tu poleci gotowiec na szczęście. W dodatku skorzystamy do tego z dwóch komputerów jednocześnie - jeden będzie serwował model drugi do developmentu.

Czyli mamy do zrobienia tak:

1. Lokalne odpalenie Bielika
2. Uzbrojenie Bielika w zdolność obsługi tool callsów
3. Stworzenie Agenta
4. Napisanie własnego MCP
5. Dodanie MCP do Agenta
6. Dodanie Streamingu
7. Pogadanie o multi-agent setupie
8. Owinięcie tego w parser outputu agents sdk -> ai sdk v5 ze streamingiem
9. Serwowanie za pomocą endpointu
10. Dodanie kontekstu konwersacji
11. Dodanie persystencji konwersacji z auto generowaniem tytułów rozmów

Skorzystamy do tego z vLLM, OpenAI Agents SDK, assistant-ui z vercel ai sdk v5. 

Do roboty! 

## Odpalamy Bielika z pomocą vLLM

W poprzednim wpisie opisywałem problemy z instalacją vLLM i to, jak użyłem llama.cpp. Cóż, tak łatwo się nie poddaje i postanowiłem spróbować raz jeszcze, gdyż to raczej vLLM jest polecany. Początkowo postanowiłem zabrać się za to tak, jak rekomendują w docsach, co zmieniło się od ostatniego wpisu:

### Instalacja vLLM

```
git clone https://github.com/vllm-project/vllm.git
cd vllm
uv python install 3.12
uv venv --python 3.12
uv pip install -r requirements/cpu.txt
# w moim przypadku konieczne było dodanie jednej flagi:
# uv pip install --index-strategy unsafe-best-match -r requirements/cpu.txt
uv pip install -e .
```

O dziwo zadziałało. Natomiast powstaje jeden problem - instalując tak vLLM będzie dostępny tylko w określonym środowisku wirtualnym a ja tak nie chcę - chcę mieć go dostępnego globalnie. Trzeba by inaczej. Okazuje się, że można prościej i szybciej.

```
uv python install 3.12
# 3.13 nie działa
uv tool install --python 3.12 vllm
```

Użycie `uv tool` sprawi, że komenda vllm będzie dostępna globalnie a nie tylko wewnątrz określonego środowiska uv. Czyli tak, jak bym chciał.

Mamy vllm, mamy uv, co potrzeba jeszcze? [Hugging Face](https://huggingface.co/). Po co? Otóż będziemy stamtąd zaciągać model - huggingface.co - to takie jakby repozytorium z różnymi modelami. 

Tworzymy tam konto, następnie przechodzimy do Access Tokens i generujemy tam token dostępu z Read access, kopiujemy go. Następnie:

```
uv tool install --python 3.12  huggingface-hub
hf auth login
```

Teraz przechodzimy na stronę modelu bielika który nas interesuje, dla przykładu: 

https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct 

https://huggingface.co/speakleash/Bielik-11B-v2.6-Instruct

I potwierdzamy warunki. Teraz już nic nie broni nam by odpalić model lokalnie by nasze konto miało dostęp do download. Została jedna rzecz.

### Dodajemy obsługę tool calling

Otóż żeby Bielik mógł obsługiwać Wywołania funkcji/narzędzi (tool calling) potrzebujemy customowego chat template oraz parsera. Skąd wziąć?

Wystarczy sklonować to [repo](https://github.com/speakleash/bielik-tools). Tam będą potrzebne nam pliki - customowa templatka rozmowy oraz parser.

```bash
git clone https://github.com/speakleash/bielik-tools
```

## Odpalamy Bielika za pomocą vLLM

Teraz wreszcie:

```bash
vllm serve "speakleash/Bielik-11B-v2.6-Instruct" \
    --enable-auto-tool-choice \
    --tool-parser-plugin ./bielik-tools/tools/bielik_vllm_tool_parser.py \
    --tool-call-parser bielik \
    --chat-template ./bielik-tools/tools/bielik_advanced_chat_template.jinja \
    --port 8000 --host 0.0.0.0 \
    --max-num-batched-tokens 32768
    
```

Dla Bielika w wersji z 11 miliardami parametrów, lub:

```bash
vllm serve "speakleash/Bielik-4.5B-v3.0-Instruct" \
    --enable-auto-tool-choice \
    --tool-parser-plugin ./bielik-tools/tools/bielik_vllm_tool_parser.py \
    --tool-call-parser bielik \
    --chat-template ./bielik-tools/tools/bielik_advanced_chat_template.jinja \
    --port 8000 --host 0.0.0.0 \
    --max-num-batched-tokens 32768
    
```

Dla wersji z 4.5 miliardami parametrów. 

11 jest cięższa od 4.5 natomiast jest też 'mądrzejsza', tak w dużym skrócie. Ja jestem GPU i RAM-poor więc tylko opcja 4.5B wchodzi w grę. 4.5B żarło mi 15 GB ram, 11B około 25GB. Można by tu pokusić się o pobranie quantized plików, natomiast vLLM i ich format AWK nie obsługuje biedaków z makami i czipami M4, zatem niestety ta opcja odpadła. A szkoda, bo wtedy mógłbym odpalić sobie 11. 

To co znaczy quantized? Pisałem o tym w poprzednim artykule.

Możecie o tym myśleć jako o takiej kompresji. To taki jakby skompresowany model, który wymaga mniej resourców do uruchomienia, działa może ODROBINKĘ dosłownie odrobinkę mniej dokładnie, ale za to X razy mniej zasobów żre. Bardzo dobry kompromis. Wracając.

Chwila czekania i...

Pięknie gra i buczy. Natomiast nieco lagguje na moim jednym lapku jak odpalę do tego IDE, przeglądarkę i inne rzeczy. Cóż z tym począć? 

### Na dwa maczki

Otóż mam dwa maczki, jeden nowszy drugi starszy, leciwy. Na tym nowszym odpaliłem sobie model zaś development robię na tym starszym. Jak sprawić by jeden gadał z drugim? Otóż jeśli macie jedno wi-fi jest to dość trywialne. Na tym, gdzie macie odpalony model, wpisujecie:

```bash
ifconfig en0 | grep inet
inet6 fe80::10b4:3cc6:e4b8:e5ec%en0 prefixlen 64 secured scopeid 0xe 
	inet 192.168.100.90 netmask 0xffffff00 broadcast 192.168.100.255
```

By uzyskać wewnętrzny adres ip w sieci lokalnej. U mnie to będzie `192.168.100.90`. API z modelem śmiga na porcie 8000. ``192.168.100.90:8000/docs` na starszym maczku i... bum! Śmiga. Pamiętajcie, by w przykładach kodu niżej zmienić mój adres na ten, który otrzymacie.

Jeśli nie możesz się połączyć sprawdź czy masz włączony dostęp do sieci lokalnej w ustawieniach dla aplikacji z której odpalasz skrypt, czyli pewnie terminal/warp/cursor/pycharm. Jak?

````
Menu -> Ustawienia -> Prywatność i Bezpieczeństwo -> Local Network
````

## Tworzymy naszego agenta z OpenAI Agents SDK

Przechodzimy do kodowania, nareszcie. Zacznijmy od małej przypominajki i zróbmy zwykły chat completions request do naszego lokalnego modelu.

Znaczy prawie, bo najpierw zależności:

```bash
uv add openai openai-agents
```

Mamy to. O co chodzi z uv etc. Doczytajcie proszę sami. UV to taki następca poetry+pyenva w jednym. Do tego szybki i od tych samych autorów co ruff.

```python
# completions.py
from openai import OpenAI

BASE_URL: str = "http://192.168.100.90:8000/v1"

client = OpenAI(base_url=BASE_URL, api_key="...")

def main():
    completion = client.chat.completions.create(
        model="speakleash/Bielik-4.5B-v3.0-Instruct", # lub 4b
        messages=[
            {"role": "assistant", "content": "Mów niczym Herbert."},
            {
                "role": "user",
                "content": "Jaki jest sens życia?",
            },
        ],
    )
    print(completion.choices[0].message.content)


if __name__ == "__main__":
    main()

```

```bash
uv run python completions.py
```

Działa? Działa. I to jak! Trochę wolno znaczy się, ale to nic. 

Pora stworzyć naszego agenta.

Zrobimy to za pomocą OpenAI Agents SDK. Są alternatywy jak Agno czy CrewAI, natomiast my użyjemy agents sdk. W moim odczuciu całkiem fajne tbh. Z CrewAI mam fleszbeki z Wietnamu z wczesnych wersji. 

Przed tym może jednak czym w ogóle jest agent:

**Podstawowa definicja:** AI Agent to autonomiczny system AI, który otrzymuje zadanie do wykonania i samodzielnie planuje oraz realizuje kroki potrzebne do jego ukończenia, używając dostępnych mu narzędzi.

**Jak to działa:**

- Dostaje cel/zadanie od użytkownika
- Ma dostęp do zestawu narzędzi (API, bazy danych, wyszukiwarki, itp.)
- Planuje sekwencję działań
- Wykonuje je krok po kroku
- Ocenia wyniki i dostosowuje plan w razie potrzeby
- Kontynuuje aż uzna zadanie za wykonane

**Kluczowe cechy:**

- **Autonomiczność** - działa samodzielnie bez ciągłego nadzoru
- **Narzędzia** - może wywoływać funkcje, API, przeszukiwać internet
- **Planowanie** - tworzy i modyfikuje plan działania
- **Pętla decyzyjna** - "myśli, działa, ocenia, planuje dalej"

To jak mieć asystenta, któremu mówisz "załatw mi lot do Berlina" i on sam sprawdza daty, porównuje ceny, rezerwuje bilet i hotel, zamiast tylko udzielać rad jak to zrobić.

Różni się od zwykłego chatbota tym, że nie tylko odpowiada, ale faktycznie **wykonuje** zadania w rzeczywistym świecie.

Albo moimi, a nie Claude słowami, to chodzi o to, że agentowi opisujemy zadanie które sam ma wykonać. za pomocą dostępnych mu narzedzi. Tak w skrócie to takie zwykłe chat completions uruchomione w pętli, planuje, jak trzeba odpala narzędzia i sam decyduje o rzeczach, chyba, że zaimplementujemy human-in-the-loop, wtedy dopytuje człowieka.

Jak to wygląda w kodzie?

```python
# agent.py
import asyncio
import os

from agents import Agent, Runner, set_default_openai_api, set_default_openai_client
from openai import AsyncOpenAI


os.environ["OPENAI_BASE_URL"] = "http://192.168.100.90:8000/v1"
os.environ["OPENAI_API_KEY"] = "EMPTY"

model = "speakleash/Bielik-4.5B-v3.0-Instruct"

agent = Agent(
    name="Korepetytor",
    instructions="Pomagasz z matematyką. Dostajesz pytanie od użytkownika i odpowiadasz na nie. Wyjaśnij swoje rozumowanie i podaj przykłady.",
    model=model,
)


async def main():
    result = await Runner.run(agent, "Czym jest dodawanie?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())


```

Nie działa.

Dlaczego?  Otóż okazuje się, że musimy zdefiniować custom model dla naszego agenta jeśli uruchamiamy model lokalnie. Jak? 

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
        name="Korepetytor",
        instructions="Pomagasz z matematyką. Dostajesz pytanie od użytkownika i odpowiadasz na nie. Wyjaśnij swoje rozumowanie i podaj przykłady.",
        model=OpenAIResponsesModel(
            model="speakleash/Bielik-4.5B-v3.0-Instruct",
            openai_client=openai_client,
        ),
    )
    
    result = await Runner.run(agent, "Czym jest dodawanie?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

```bash
uv run python agent.py
```

No, teraz działa. Agent którego zdefiniowaliśmy nie jest zbyt użyteczny, nie ma żadnych narzędzi, niczym nie różni się od zwykłego chat completions. Pora to zmienić.

## Dodajemy MCP do Agenta

Teraz pora uzbroić naszego agenta w coś więcej - MCP. Czym jest MCP? MCP (Model Context Protocol) to sposób na to, żeby AI mógł łączyć się z różnymi aplikacjami i usługami - jak Gmail, kalendarz, bazy danych czy narzędzia programistyczne. Zamiast AI, który tylko gada, teraz może rzeczywiście robić rzeczy - sprawdzać maile, dodawać wydarzenia do kalendarza, czy uruchamiać kod, albo w naszym wypadku (o tym później) sprawdzać obecną datę. To tak jakby dać AI "ręce" do współpracy z prawdziwymi narzędziami, które używamy na co dzień. 

Taki function calling owinięty w fancy protokół który LLM rozumie i który stał się obecnie standardem.

By to zrobić najpierw stwórzmy własny mcp. Będzie to bardzo proste. Najpierw zainstalujmy `fastmcp`. 

```bash
uv add fastmcp
```

I już, teraz tylko...

```python
from fastmcp import FastMCP
from datetime import datetime

mcp = FastMCP("My MCP Server")

@mcp.tool
def dzisiejsza_data() -> str: # czy tylko mnie funkcje po polsku mrożą?
    """ Zwraca dzisiejszą datę """

    return datetime.now().strftime("%Y-%m-%d")

if __name__ == "__main__":
    mcp.run(transport="http", port=8001)


```

Jak dodać to do naszego agenta?

1. Zmieniamy OpenAIResponsesModel na OpenAIChatCompletionsModel gdyż Responses nie obsługuje tool callingu dla bielika.
2. Dodajemy MCP.

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
            name="Zegarmistrz światła purpurowy",
            instructions="Pomagasz z datą i czasem.",
            model=OpenAIChatCompletionsModel(
                model="speakleash/Bielik-4.5B-v3.0-Instruct",  # Your model name
                openai_client=openai_client,
            ),
            mcp_servers=[mcp_helper_server],
        )
        
        # Run the agent
        result = await Runner.run(agent, "Jaka jest dzisiejsza data?")
        print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())

```

I uwaga...

W odpowiedzi dostajemy:

```bash
**Dzisiejsza data to: 6 września 2025 roku.**
```

Jak wygląda odpowiedź bez MCP?

```bash
Obecna data to **„14 stycznia 2024”** (lub inna data w zależności od momentu, w którym zadajesz pytanie).
 
Jeśli potrzebujesz konkretnej daty, podaj proszę dokładną godzinę pytania.
```

Dlaczego tak? 

**Architektura i sposób działania.** LLM-y są trenowane na danych z określonego okresu i ich wiedza jest "zamrożona" w momencie zakończenia treningu. To znaczy, że model ma wiedzę tylko do pewnego momentu (nazywanego "knowledge cutoff") i nie może się uczyć nowych informacji w czasie rzeczywistym. Zatem by LLM wiedział jaki jest dzień, musi te dane skądś dostać albo pobrać np. Właśnie naszego MCP.

Co tam się zadziało pod spodem? 

Agent został zainicjalizowany z określonym promptem i listą narzędzi, którą sam wyciągnął z naszego serwera MCP. Dostał pytanie. Przeanalizował pytanie. Uznał, że by odpowiedzieć na to pytanie powinien użyć dostępnego mu narzędzia - dzisiejsza data. Tak też zrobił. Po otrzymaniu odpowiedzi z narzędzia przeanalizował czy ma wszystko by odpowiedzieć na pytanie - ma, zatem sformuował odpowiedź dla użytkownika. Brzmi nietrywialnie, prawda? Bo tak jest. Tam pod spodem zadziało się więcej niż jedno zapytanie do LLMa. 

W bardziej skomplikowanych workflowach potrafi to zrobić niezłe cudeńka. Właśnie, a jak już o nich mowa.

## Multi-agent 

Wraz ze wzrostem złożoności naszego agenta/aplikacji lepiej będzie podzielić go na kilka mniejszych agentów i jednego, który orkiestruje całą hałastrę. Coś jak z dzieleniem dużych funkcji na mniejsze. W OpenAI Agents SDK robi się to bardzo prosto. Są dwa sposoby - pierwszym jest handoff, drugim jest agent-as-tool. My skorzystamy z tego drugiego bo jest nieco prostszy. 

Na czym polega?

Otóż najzwyczajniej w świecie definiujemy swoich agentów jak gdyby nigdy nic a następnie przekazujemy je jako narzędzia do agenta orkiestrującego.

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
            name="Agent od daty i czasu",
            instructions="Pomagasz z obecną datą i czasem.",
            model=OpenAIChatCompletionsModel(
                model="speakleash/Bielik-4.5B-v3.0-Instruct",
                openai_client=openai_client,
            ),
            mcp_servers=[mcp_helper_server],
        )
        haiku_agent = Agent(
            name="Haiku generator",
            instructions="Generujesz haiku ale tylko 5 zdaniowe.",
            model=OpenAIChatCompletionsModel(
                model="speakleash/Bielik-4.5B-v3.0-Instruct",
                openai_client=openai_client,
            ),
        )
        orchestrator = Agent(
            name="Orchestrator",
            instructions="Organizujesz działanie agentów. Sam nie podejmuj akcji.",
            model=OpenAIChatCompletionsModel(
                model="speakleash/Bielik-4.5B-v3.0-Instruct",
                openai_client=openai_client,
            ),
            tools=[
                date_time_agent.as_tool(tool_name="date_time_agent", tool_description="Pomagasz z datą i czasem."), 
                haiku_agent.as_tool(tool_name="haiku_agent", tool_description="Generuje haiku ale tylko 5 zdaniowe.")
                ],
        )
        # Run the agent
        result = await Runner.run(orchestrator, "Powiedz jaka jest dzisiejsza data a potem wygeneruj haiku.")
        print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

I ciach. Co wypluł?

```bash
Oto współczesne haiku na podstawie dzisiejszej daty (2025-09-06):

**Obłoki suną**  
**Nad łąką w ciszę łka.**  
**Słońce powoli gaśnie.**  
**Czas do chaty wrócić.**  
**Noc w pełni zawsze wierzy.** 

Twoja ulubiona sytuacja z haiku została w nim uwzględniona!
```

Natomiast tutaj muszę przyznać, że z multi-agent setupem model 4.5B już się mocno gubi - czasem zawoła narzędzia/mcp, często nie, więc niestety nie będę dale eksplorował i wrócę do single agent setupu. Zauważyłem, że najlepsze odpowiedzi dawał za pierwszym wywołaniem dla danego runu modelu. Czyli jeśli zrestartowałem serwer odpowiedzialny za serwowanie modelu - odpowiedź była dobra. Każda kolejna już nie. Nie wiem czego to kwestia. 

Swoją drogą większość modeli potrafi nawet równocześnie wywoływać kilka narzędzi, warto to wiedzieć, natomiast nie będziemy się w to zagłębiać bo i nawet nie wiem czy bielik to obsługuje.

## Streaming

Idźmy w inną stronę.

Długo czekamy na odpowiedź. Słaby UX. Jak to poprawić? Dodajmy streaming. Musimy zmienić ten kawałek:

```python
        result = await Runner.run(agent, "....")
        print(result.final_output)
```

To zamieniamy na: 

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
            name="Korepetytor",
            instructions="Pomagasz z datą i czasem.",
            model=OpenAIChatCompletionsModel(
                model="speakleash/Bielik-4.5B-v3.0-Instruct",
                openai_client=openai_client,
            ),
            mcp_servers=[mcp_helper_server],
        )
        
        result = Runner.run_streamed(agent, input="Jaka jest dzisiejsza data?")
        async for event in result.stream_events():
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                print(event.data.delta, end="", flush=True)

if __name__ == "__main__":
    asyncio.run(main())

```

Teraz zamiast całej odpowiedzi na raz, będziemy dostawać ją kawałek po kawałku. Kurna, jest w pyte, co?

## Frontend - assistant-ui

W konsoli tak słabo trochę, co jeśli chcielibyśmy dodać jakiś frontend do tego? Otóż robimy tak:

```
npx assistant-ui@latest create
# jako nazwę projektu dajemy 'frontend'
# żeby to wyżej zadziałało musimy mieć zainstalowane nodejs
```

Potem modyfikujemy

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

Jedyne co tu zrobiliśmy, to dodaliśmy sobie proxy do naszego backednu co by się z CORSami nie grzmocić. 

```ts
// assistant.tsx
export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

```

Zmieniamy na:

```ts
// assistant.tsx
export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/stream",
    }),
  });
```

I odpalamy:

```bash
npm run dev
```

Assistant-ui jest bomba. 

Na localhost:3000 naszym oczom powinno ukazać się ładne UI. Natomiast nie jest ono zintegrowane z naszym backendem w żaden sposób. Jak to zmienić. Ano prosto. Najpierw musimy ogarnąć jaki payload wysyła frontend by wiedzieć jak zaimplementować backend. 

Aby dowiedzieć się w jakim formacie frontend wysyła dane musimy jedynie przed zapytaniem odpalić Inspect -> Network w Developer Tools przeglądarki i ciach, cały request przed nami, razem z payloadem i headerami.
Tam wszystko stanie się jasne, payload jaki otrzymujemy to:

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
                    "text": "Jaka jest dziś data?"
                }
            ]
        }
    ],
    "trigger": "submit-message"
}
```

To wyżej to format Vercel AI SDK v5. Chcecie wiedzieć więcej? Poczytajcie o Vercel AI SDK v5. W skrócie:

Vercel AI SDK v5 Streaming Protocol to **standardowy protokół** oparty na **Server-Sent Events (SSE)** z JSON objects do streamowania danych AI w czasie rzeczywistym.

## **Podstawy protokołu**

**Format:** Server-Sent Events z JSON payloads

```
data: {"type": "event_type", "payload": "data"}
```

**Nagłówek:** Wymaga `x-vercel-ai-ui-message-stream: v1`

## **Główne typy eventów**

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

### **4. Custom data i sources**

```
data: {"type": "data-weather", "data": {"temperature": 20}}
data: {"type": "source-url", "sourceId": "url1", "url": "https://example.com"}
data: {"type": "file", "url": "https://example.com/file.pdf", "mediaType": "application/pdf"}
```

### **5. Errors i reasoning**

```
data: {"type": "error", "errorText": "Connection failed"}
data: {"type": "reasoning-start", "id": "reasoning_123"}
data: {"type": "reasoning-delta", "id": "reasoning_123", "delta": "thinking..."}
```

Jest trochę tego. Na szczęście poratuje was i dam gotowca który obsługuje część z tego, w sumie większość.

## Backend fastAPI

```bash
uv add fastapi
```

To wyżej na naszym backendzie będzie wyglądało plus minus tak: 

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

Modele mamy, teraz potrzeba nam czegoś co przekonwertuje to, co zwraca OpenAI Agents SDK do tego, co rozumie Vercel AI SDK v5. Kawałek kodu:

```python
# streaming/sse_formatter.py
import json
import uuid


class SSEFormatter:
    """Server-Sent Events formatter for streaming responses for vercel ai-sdk v5."""

    @staticmethod
    def format_sse_event(data: dict) -> str:
        """Format data as Server-Sent Event."""
        return f"data: {json.dumps(data)}\n\n"

    @classmethod
    def format_message_start(cls, message_id: str = None) -> str:
        """Format message start event."""
        if message_id is None:
            message_id = f"msg_{uuid.uuid4().hex[:8]}"
        return cls.format_sse_event({"type": "start", "messageId": message_id})

    @classmethod
    def format_text_start(cls, message_id: str) -> str:
        """Format text start event."""
        return cls.format_sse_event({"type": "text-start", "id": message_id})

    @classmethod
    def format_text_delta(cls, message_id: str, delta: str) -> str:
        """Format text delta event."""
        delta = delta.replace("\u2022", "-")
        return cls.format_sse_event({"type": "text-delta", "id": message_id, "delta": delta})

    @classmethod
    def format_text_end(cls, message_id: str) -> str:
        """Format text end event."""
        return cls.format_sse_event({"type": "text-end", "id": message_id})

    @classmethod
    def format_tool_input_start(cls, tool_call_id: str, tool_name: str) -> str:
        """Format tool input start event."""
        return cls.format_sse_event({"type": "tool-input-start", "toolCallId": tool_call_id, "toolName": tool_name})

    @classmethod
    def format_tool_input_delta(cls, tool_call_id: str, input_text_delta: str) -> str:
        """Format tool input delta event."""
        return cls.format_sse_event(
            {"type": "tool-input-delta", "toolCallId": tool_call_id, "inputTextDelta": input_text_delta}
        )

    @classmethod
    def format_tool_input_available(cls, tool_call_id: str, tool_name: str, input_data: dict) -> str:
        """Format tool input available event."""
        return cls.format_sse_event(
            {"type": "tool-input-available", "toolCallId": tool_call_id, "toolName": tool_name, "input": input_data}
        )

    @classmethod
    def format_tool_output_available(cls, tool_call_id: str, output: dict) -> str:
        """Format tool output available event."""
        return cls.format_sse_event({"type": "tool-output-available", "toolCallId": tool_call_id, "output": output})

    @classmethod
    def format_start_step(cls, step: int) -> str:
        """Format start step event."""
        return cls.format_sse_event({"type": "start-step", "step": step})

    @classmethod
    def format_finish_step(cls, step: int, finish_reason: str = "tool-calls") -> str:
        """Format finish step event."""
        return cls.format_sse_event({"type": "finish-step", "step": step, "finishReason": finish_reason})

    @classmethod
    def format_error(cls, error: str) -> str:
        """Format error event."""
        return cls.format_sse_event({"type": "error", "error": error})

    @classmethod
    def format_finish(cls) -> str:
        """Format finish event."""
        return cls.format_sse_event({"type": "finish"})

    @classmethod
    def format_done(cls) -> str:
        """Format stream termination."""
        return "data: [DONE]\n\n"

    @classmethod
    def generate_tool_call_id(cls, tool_name: str = None) -> str:
        """Generate unique tool call ID."""
        prefix = f"{tool_name}_" if tool_name else "call_"
        return f"{prefix}{uuid.uuid4().hex[:8]}"

```

```python
# streaming/event_processor.py
import json
import logging
from openai.types.responses import ResponseTextDeltaEvent

logger = logging.getLogger(__name__)
from .sse_formatter import SSEFormatter


class StreamEventProcessor:
    """Processes streaming events from the agent runner."""

    def __init__(self):
        self.message_id = SSEFormatter.generate_tool_call_id("msg")
        self.active_tool_calls = []  # Use list to maintain order
        self.text_streaming = False

    @classmethod
    async def process_events(cls, result):
        """Main event processing loop."""
        processor = cls()

        # Send message start
        yield SSEFormatter.format_message_start(processor.message_id)


        async for event in result.stream_events():
            if event.type == "raw_response_event":
                chunk = processor._handle_raw_response_event(event)
                if chunk:
                    yield chunk
            elif event.type == "run_item_stream_event":
                chunk = processor._handle_run_item_event(event)
                if chunk:
                    yield chunk

        # End any active text streaming
        if processor.text_streaming:
            yield SSEFormatter.format_text_end(processor.message_id)

        # Send finish event then completion
        yield SSEFormatter.format_finish()
        yield SSEFormatter.format_done()

    def _handle_raw_response_event(self, event) -> str:
        """Handle text delta events."""
        if isinstance(event.data, ResponseTextDeltaEvent):
            # Start text streaming if not already started
            if not self.text_streaming:
                self.text_streaming = True
                return SSEFormatter.format_text_start(self.message_id) + SSEFormatter.format_text_delta(
                    self.message_id, event.data.delta
                )
            else:
                return SSEFormatter.format_text_delta(self.message_id, event.data.delta)
        return ""

    def _handle_run_item_event(self, event) -> str:
        """Handle run item events (tool calls and outputs)."""
        if event.item.type == "tool_call_item":
            return self._handle_tool_call_event(event)
        elif event.item.type == "tool_call_output_item":
            return self._handle_tool_output_event(event)
        return ""

    def _handle_tool_call_event(self, event) -> str:
        """Handle tool call events."""
        # End text streaming if active
        result = ""
        if self.text_streaming:
            result += SSEFormatter.format_text_end(self.message_id)
            self.text_streaming = False

        tool_name = self._extract_tool_name(event.item)
        tool_call_id = SSEFormatter.generate_tool_call_id(tool_name)

        # Store tool call info for later output handling
        self.active_tool_calls.append({"id": tool_call_id, "name": tool_name, "item": event.item})

        logger.debug(f"Tool called: {tool_name} with ID: {tool_call_id}")

        # Get tool input if available
        tool_input = self._extract_tool_input(event.item)

        result += SSEFormatter.format_tool_input_start(tool_call_id, tool_name)

        if tool_input:
            # For simplicity, send the entire input as available immediately
            result += SSEFormatter.format_tool_input_available(tool_call_id, tool_name, tool_input)

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
            tool_call_id = SSEFormatter.generate_tool_call_id()
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

        return SSEFormatter.format_tool_output_available(tool_call_id, output_data)

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

Całość można by pewnie napisać znacznie ładniej, ale pan Claude zrobił całkiem niezła robotę więc nie będę go już poprawiał.

Modele? Mamy. Formater do formatu Vercel AI SDK v5? Też. Procesor zamieniający event z OpenAI Agents SDK? Również. 

Co zostało? Sam endpoint. Jak będzie wyglądał? Prawie tak samo, jak nasz agent. 

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn
from streaming.event_processor import StreamEventProcessor
from models import StreamRequest
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel
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

@app.post("/stream")
async def stream(stream_request: StreamRequest, request: Request):
    async def generate():
        async with mcp_helper_server:
            agent = Agent(
                name="Korepetytor",
                instructions="Pomagasz z datą i czasem.",
                model=OpenAIChatCompletionsModel(
                    model="speakleash/Bielik-4.5B-v3.0-Instruct",  # Your model name
                    openai_client=openai_client,
                ),
                mcp_servers=[mcp_helper_server],
            )
            
            # Get the latest message from the request
            latest_message = stream_request.messages[-1]
            input_text = latest_message.get_text_content()
            
            # Run the agent
            result = Runner.run_streamed(agent, input=input_text)
            async for chunk in StreamEventProcessor.process_events(result):
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

I bangla. Mniej niż 400 linijek kodu i mamy to całe Agentic EJAJ. Czy jest coś bardziej pięknego? A jakże.

Kod wyżej obsługuje tylko najnowszą wiadomość, co jeśli chcemy włączyć poprzednie wiadomości do kontekstu, który przekazujemy modelowi?

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn
import uuid
from streaming.event_processor import StreamEventProcessor
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
                name="Korepetytor",
                instructions="Pomagasz z datą i czasem.",
                model=OpenAIChatCompletionsModel(
                    model="speakleash/Bielik-4.5B-v3.0-Instruct",
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
            async for chunk in StreamEventProcessor.process_events(result):
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

Co jeśli chcemy persystencje? W najprostszym wypadku możemy użyć assistant-ui cloud.

## assistant-ui cloud

Assistant-ui cloud umożliwi nam persystencję wiadomości i automatyczne generowane tytułów konwersacji. Wszystko obsługują w ich cloudzie. Jak?

https://cloud.assistant-ui.com

Settings -> api keys -> generate

I edytujemy assistant.tx

```python
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
  baseUrl: twojadres,
  anonymous: true
})


export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/stream",
    }),
    cloud
  });
  ...... reszta pliku
```

Gotowe.

Matko bosko, fajne, co? Nie takie trudne te ejaje.

