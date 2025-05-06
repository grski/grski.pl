Title: Polacy nie gęsi swój język mają cz. I: Bielik.AI podrywa się do lotu. 
Description: Odpalamy pierwszy i największy polski model językowy lokalnie i dokonujemy pierwszego requesta
Date: 2025-05-06
Authors: Olaf Górski
Slug: bielik-cz-1
Language: pl



Tak jak w tytule - Polacy nie gęsi swój język mają, tak samo jak i swój model językowy. Bielik.ai to projekt tworzony przez polską społeczność, który ma na celu stworzenie najlepszego polskiego modela językowego, który doskonale zna niuanse i realia naszego pięknego języka jak i kraju.

Uważam, że to wspaniała inicjatywa, którą warto nagłaśniać, stąd też, w połączeniu z faktem, że mam jeszcze kilka dni wolnego, postanowiłem stworzyć cykl artykułów poświęconych bielikowi i jego wykorzystaniu w praktyce.

Pierwszy z nich będzie o... uruchamianiu. Jak to wyglądało u mnie i jak można to zrobić. Bo nie wiem czy wiecie, LLMy obecnie nie musza być aż tak duże jak to ich nazwa (Larga Language Models) wskazuje!

Większość z nich można odpalić na domowym sprzęcie. Dla przykładu skorzystam mojego Maca - Air z 16GB na pokładzie i M2. Nie jest to sprzęt z górnej półki zdecydowanie. Ciekawe czy damy radę odpalić na nim coś? Jak sądzicie? Zobaczmy.

Zanim to zrobimy jednak trzeba by zadać sobie pytanie w jaki sposób możemy odpalać modele językowe na naszych maszynach.

## Llama.cpp vs vllm

Obecnie na rynku jest sporo rozwiązań, takie dwa topowe, to moim zdaniem llama.cpp i vllm. Zachęcony obietnicami projektu postanowiłem skorzystać najpierw z vllm by odpalić bielika. Jak poszło?

### vllm

Vllm obiecał mi, że będzie trendy i cool i takie tam. Co dostarczył. Nie za dużo, przynajmniej jeśli idzie o instalacje.

```bash
brew install cmake pkg-config sentencepiece protobuf-c 
pip install --upgrade pip wheel setuptools 
pip install --pre torch==2.5.1 torchvision torchaudio
brew install ninja rust 
VLLM_TARGET_DEVICE=cpu pipx install vllm --verbose
```

Próbowałem cudów na kiju z tym wyżej, ale ni czorta się nie udało. Brakujące paczki, błędy w kompilacji, próbowałem pipem, pipxem, riserchowałem brakujące zależności, prawie mi się udało z tym co wyżej, ale wciąż kolejne błędy.

Postanowiłem zatem zmienić podejście i skorzystać z pewnego cacka, może ono zadziała - uv to the rescue.

Zainstalowałem zatem vllm za pomocą `uv` i proces instalacji zakończył się sukcesem, natomiast próba odpalenia modelu już nie, błędy związane z tritonem etc. 

Nie zrozumcie mnie źle, to pewnie moja niewiedza czy braki w dokumentacji, ale jeśli ja jako doświadczony programista nie jestem w stanie w ciągu kilku minut wyczytać lub uruchomić appki, postępując zgodnie z krokami w oficjalnych docsach, to ja mówię nie na ten moment.

Llama.cpp it is.

### llama.cpp

```bash
brew install llama.cpp
```

I już. Tak poszło od buta.

Teraz bierzemy się za samo uruchamianie.

Llama udostępnia kilka trybów uruchomienia, pierwszy z nich to poprzez cli - odpalamy nasz model i w konsoli możemy z nim gadać. My jednak nie chcemy interakcji przez konsole, chcemy mieć endpoint do którego będziemy mogli robić zapytania. Jak to zrobić? Pewnie się trzeba nagimnastykować. Otóż niekoniecznie. Llama.cpp przewiduje taką opcję (vllm też w teorii), pozwalając nam na zwykłe:

```bash
llama-server -hf speakleash/Bielik-11B-v2.3-Instruct-GGUF:Q4_K_M
```

I ciach, gotowe. 

Trochę też objaśnienia flaga `-hf` pozwala nam na zaciągnięcie modelu bezpośrednio z huggingface.co - to takie jakby repozytorium z różnymi modelami. Dzięki temu llama.cpp wie skąd pobrać sobie model. `speakleash/Bielik-11B-v2.3-Instruct-GGUF` to nazwa modelu `Q4_K_M` a to zaś taki jakby 'tag', ten konkretny oznacza, że pobieramy model skwantyfikowany do Q4. Yyyyy, co? Możecie o tym myśleć jako o takiej kompresji. To taki jakby skompresowany model, który wymaga mniej resourców do uruchomienia, działa może ODROBINKĘ dosłownie odrobinkę mniej dokładnie, ale za to X razy mniej zasobów żre. Bardzo dobry kompromis. Wracając.

## Serwer gra i buczy

Na http://localhost:8080 znajdziemy UI a http://localhost:8080/v1/chat/completions to nasz endpoint, kompatybilny z openai, do robienia requestów.

Czy ja wam właśnie chcę powiedzieć, że możecie mieć lokalnie działający polski model językowy za pomocą dwóch komend a w dodatku pójdzie on nawet na zwykłym macu? Tak, a o co chodzi? SLAY. Dobro robotę chłopaki z bielika zrobili. Teraz pora na brawa.

### Użyjmy go

Aby to zrobić potrzebujemy mieć kilka rzeczy, aby wyglądało to po bożemu.

Pipx - to taka paczka co nam pozwala instalować inne paczki w Pythonie nie brudząc w systemowym Pythonie.

Uv - taki następca poetry, szybszy, lepszy, cool & trendy.

```bash
brew install pipx
pipx install uv
uv init bielik
cd bielik
uv add openai
source .venv/bin/activate # aktywujemy naszego venva
```

Teraz otwórzmy plik `main.py`.

I tam wklejmy:

```python
from openai import OpenAI

BASE_URL: str = "http://localhost:8080/v1"

client = OpenAI(base_url=BASE_URL, api_key="...")  # kluczowy fragment, zmieniamy base_url na nasz lokalny

def main():
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "Mów niczym Herbert."},
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

potem

```bash
python main.py
```

> Sens życia to temat, który od wieków fascynuje i intryguje ludzi. Z punktu widzenia Herberta, sens życia może być różny dla każdej osoby, ale można wyróżnić pewne wspólne wątki. Oto kilka refleksji na ten temat:
>
> 1. **Dążenie do prawdy i piękna**:
>    - "Prawda jest jak kamień, który trzeba podnieść i zobaczyć."
>    - Herbert podkreślał znaczenie poszukiwania prawdy i piękna w życiu. To, co prawdziwe i piękne, ma wartość i nadaje sens naszym działaniom.
>
> 2. **Ochrona wartości humanistycznych**:
>    - "Niech wasza mowa będzie tak-tak, nie-nie, a co nadto pochodzi od złego."
>    - Dla Herberta kluczowe było zachowanie ludzkiej godności i wartości humanistycznych w obliczu nieludzkich warunków.
>
> 3. **Odpowiedzialność**:
>    - "Niech wasza mowa będzie prosta, lecz nie prostacka."
>    - Pisarz podkreślał znaczenie odpowiedzialności za słowa i czyny. Odpowiedzialność jest fundamentem naszych działań i decyzji.
>
> 4. **Poszukiwanie sensu w codzienności**:
>    - "Niechaj wasza mowa będzie wolna od obłudy."
>    - Herbert zachęcał do poszukiwania sensu w codziennych wydarzeniach, w prostych gestach i czynach.
>
> 5. **Krytyczne myślenie**:
>    - "Pamiętajcie, że jesteście wyspą."
>    - Pisarz podkreślał znaczenie krytycznego myślenia, umiejętności patrzenia na świat z dystansem i krytycznego podejścia do otaczającej rzeczywistości.
>
> 6. **Odkrywanie siebie**:
>    - "Niechaj wasza mowa będzie niezależna."
>    - Herbert zachęcał do odkrywania własnej tożsamości, niezależności i autonomii.
>
> 7. **Pamięć i historia**:
>    - "Pamiętajcie, że jesteście dziećmi pamięci."
>    - Pisarz podkreślał znaczenie pamięci historycznej i przekazywania jej następnym pokoleniom.
>
> Ostatecznie, sens życia dla Herberta leżał w poszukiwaniu prawdy, piękna, odpowiedzialności i niezależności. Był to proces ciągłego rozwoju, który wymagał odwagi, krytycyzmu i refleksji.

Działa? Działa.

Jestem szczerze zdumiony jak łatwo można obecnie hostować modele lokalnie i z nimi pracować.

AWESOME.
