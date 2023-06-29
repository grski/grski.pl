Title: Jak za darmo opublikować swoją stronę na GitLab Pages: Pelican(jekyll/hugo), CI Pipelines, Docker, Cloudflare, linia poleceń i customowa domena https
Date: 2018-06-27
Authors: Olaf Górski
Slug: gitlab-pages-intro
Description: Po krótce o tym, jak opublikować za darmo swoją własną stronę na GitLab Pages z customową domeną, obsługą https oraz continuous integration.

Ostatnio tak się jakoś złożyło, że Microsoft postanowił nabyć GitHuba i kilka innych firm. Nie jestem jakimś ogromnym przeciwnikiem Microsoftu, Windowsa czy innych ich produktów, niemniej jednak nie darzę ich też jakąś szczególną sympatią. Ten fakt, w połączeniu z tym, że już od jakiegoś czasu rozważałem przejście na GitLaba z racji tego, że po prostu udostępnia on znacznie więcej przydatnych funkcjonalności i swobody, sprawiły, że postanowiłem wreszcie zrobić co trzeba.

# Migracja na GitLaba

Migracja różnych repozytoriów jest bardzo prosta, GitLab udostępnia tu fajne narzędzie, mnie jednak chodziło o migrację swojego bloga, tutaj pracy trochę będzie.

A skoro i tak pracy będzie, to dorzucę sobie jeszcze więcej - zrobię go od nowa i do tego opiszę cały proces.

Blog postanowiłem zmienić z dwóch powodów: obecny nie był responsywny i wyglądał po prostu źle, nieprofesjonalnie. 

Faktem jest natomiast, że oprócz samej treści i jej merytoryki, bądź co bądź liczy się też sposób prezentacji zasobu. Niestety, albo może i stety. Na to, by kompletnie nie dbać o wygląd i sposób prezentacji mogą sobie pozwalać wielkie autorytety, których ludzie i tak chcą słuchać/czytać, a nie taki mały robaczek jak ja. To pierwszy.

Drugim było to, że na stronie chciałem wprowadzić serwowanie przez HTTPS, a GitHub Pages jakoś niezbyt mi pozwalał to zrobić - nie udało mi się tego poprawnie skonfigurować a nie miałem ochoty walczyć i walczyć z czymś, co i tak za niedługo zostanie wymienione.

# Zaczynamy

Obecny stack - serwując stronę na GitHub pages, jeśli chcemy mieć automatycznie generowaną stronę, to niestety z góry narzucany jest nam Jekyll jako generator. Także jego też używałem z racji braku wyboru. Wpisy pisane były i formatowane za pomocą Markdowna a templatka była dowolna, lekko przeze mnie zmodyfikowana.

Z racji tego, że na GitLabie można samodzielnie wybrać to, jakiego generatora statycznej strony użyjemy, zależy od nas, to postanowiłem użyć czegoś raczej z własnego Pythonowego podwórka - pelican.

Różnice w zasadzie praktycznie żadne, ale wciąż.

Do tego postanowiłem wybrać motyw [Flex](https://github.com/alexandrevicenzi/flex), wam może wystarczy domyślny, albo jakiś inny - [tutaj](http://www.pelicanthemes.com) jest biblioteka z której można sobie wybrać, lub ewentualnie stworzyć swój, co nie jest jakieś trudne. Do gustu przypadł mi również chociażby [hyde](https://github.com/jvanz/pelican-hyde/tree/1def3dd97609105f6ae31f0f88ab5ae6a94aa0c5), 
[medius](https://github.com/onuraslan/medius/tree/c4399ffdae1070fcd476157f4ab4109448d15b77), [mg](https://github.com/lucachr/pelican-mg/tree/5171f8719690dfe0bb7bfd2b6de428f15868602f), [MinimalXY](https://github.com/petrnohejl/MinimalXY/tree/87f0ebb57543b7810dffc9ebe05ed96bc897ffd1) i [nest](https://github.com/molivier/nest/tree/18aa1345f70219c00704848d321daf45c2f50ba7)

# Stawiamy lokalnie

Zakładam tutaj, że na twojej maszynie zainstalowany jest Python jak i Pip, także nie będę opisywał tu procesu konfiguracji tych dwóch programów.

Zaczniemy od instalacji `virtualenv` - paczki, którą każdy powinien znać i z niej korzystać.

```
    pip install virtualenv
```

Po zainstalowaniu stwórzmy katalog, gdzie żyć będzie nasza strona. Więc cyk otwieramy konsolę/cmd i przechodzimy w miejsce, gdzie trzeba trzymać różne projekty - u mnie to było `C:\dev\`

```
    cd C:\dev\
    mkdir gitlab_pages
    cd gitlab_pages
    mkdir grski_pl
```

Będąc w katalogu `gitlab_pages` wywołujemy

```
    virtualenv venv
```

Spowoduje to utworzenie nowego środowiska dla naszej stronki, dzięki czemu paczki, które zainstalujemy, będa dostępne tylko z poziomu tego środowiska - nie zabrudza nam instalacji systemowej. Następnie musimy uruchomić to wirtualne srodowisko. Jak to zrobić? Jeśli korzystasz z linuxa, to nie muszę ci tego tłumaczyć, zaś na Windowsie wystarczy użyć polecenia:

```
    venv\Scripts\activate
```

Teraz przed katalogiem podanym po lewej, powinno być widać (venv) - to znaczy, że obecne operacje dotyczące Pythona wykonasz właśnie w tym środowisku, a nie w globalnym. Pamiętaj też o tym, że nie musisz pisać całych nazw katalogów czy plików - jak zaczniesz pisac i klikniesz TAB, to konsola sama dopisze sobie resztę ; )

Kiedy venv'a już mamy ogarniętego, to pora zainstalować co nam trzeba. Przejdźmy zatem do katalogu naszej strony - w moim wypadku grski_pl, pamiętaj, że ty mogłeś nazwać katalog inaczej.

```
    cd grski_pl
    (
   	echo pelican
   	echo markdown
    ) > requirements.txt
    pip install -r requirements.txt
```
lub na linuxie:
```
    cd grski_pl
    echo -e "pelican\nmarkdown" > requirements.txt
    pip install -r requirements.txt
```

Halo halo, moment, co tu się właśnie stało? Cóż, lubię konsolę, więc raczej staram się z niej nie wychodzić. Korzystając z operatora przekierowania '>' kazałem konsoli, by ta, zamiast na standardowe wyjście, efekt wykonania echo pelican a potem echo markdown, wysłała efekty do pliku requirements.txt i tyle. Upraszaczając zaczynając komendę od '(' i enter, mówisz konsoli, że enter to nie koniec, jeszcze będę pisał więc nie wykonywuj jeszcze polecenia. Potem `echo pelican<enter>` i `echo markdown<enter>` - czyli tak w skrócie, po prostu wypisz pelican a potem, od nowej linii, markdown i tyle.
A potem jest `) > requirements.txt` co oznacza po prostu, że te dwa słowa zostaną wypisane do pliku zamiast do konsoli. Logiczne.

Dla przykładu podałem też wersję linuxową w jednej linijce, na windowsie można podobnie, ale warto znać różne sposoby.

Mała uwaga - jeśli korzystamy z operatora przekierowania wyjścia - '>', to należy pamiętać, że użycie '>' spowoduje nadpisanie całego pliku, natomiast '>>' spowoduje, że przekierowany tekst zostanie zapisany na końcu - niejako dodany do już istniejącego pliku.

A `pip install -r requirements.txt`, to chyba logiczne - to polecenie każe pipowi zainstalować zależności, które znajdzie w danym pliku (-r od read, czyli, że plik ma przeczytać) i je sobie pobrać w najnowszej (bo innej nie podaliśmy), wersji.

Uwaga, notka: markdown potrzebny wam będzie tylko wtedy, jeśli zamierzacie korzystać z markdowna przy pisaniu postów. Jeśli chcecie użyć nie wiem, restructredText, czy czegoś innego, to należy zmienić tę zależność na inną. Jaką? Zajrzyjcie do dokumentacji pelicana.

# Konfigurujemy ptaka, znaczy pelikana

Będąc w folderze, gdzie chcemy, żeby nasz projekt żył, piszemy

```
    pelican-quickstart
```

A następnie... klikany enter dla wszystkich opcji, poza jedną - pytaniem o to, czy chcemy customową domenę. Tam wciskany n i dopiero enter.

Okej.

Podstawowe pliki mamy. Pora na gita, którego kazdy powinien mieć zainstalowanego.
```
    git init
```
I już, repo zainicjowane.

Taka tylko mała notka, bo najpewniej pelican utworzył ci folder `output` - nie jest on nam potrzebny, więc możesz go usunąć, za pomocą: `rd output` lub `rm -rf output`.

Teraz tworzymy plik `.gitignore` (za pomocą konosli, jak ja, lub może wolisz jakimś edytorem czy czymkolwiek innym) i przepisujemy tam:
```
public/*
__pycache__
*.pyc
```
spowoduje to, że git nie będzie nam tych plików indeksował i dobrze, bo ich nie chcemy - pliki cache i ewentualnie wygenerowana już strona. Zbędne.

Dodatkowo w folderze `content` musimy utworzyć sobie plik `.gitkeep`, żeby ten indeksował pusty folder, bo normalnie tego nie robi.

Gotowe?

To jeszcze jedna mała zmiana i nowy plik.

W pliku `pelicanconf.py` musimy troszkę zmienić. Otóż by default pelican umieszcza wygenerowaną stronę w folderze `output`, na gitlab pages to nie zadziała, bo gl szuka gotowej strony w katalogu `public`. Nic to jednak, łatwo to zmienić - wystarczy jedna zmiana w `pelicanconf.py`
```
    OUTPUT_PATH = 'public'
```
I już.

To teraz ten nowy pliczek - w grski_pl tworzymy: `.gitlab-ci.yml`, a tam:
```
image: python:3.6-alpine

pages:
  script:
  - pip install -r requirements.txt
  - pelican -s publishconf.py
  artifacts:
    paths:
    - public/

```
O co tu chodzi? Nasza strona buildowana (i testowana) jest przez darmowe Pipeliny Gitlaba do Continous Integration. To, co widzisz wyżej, to plik konfiguracyjny dockera, który mówi mu, z jakiego obrazu ma korzystać, jakie komendy wykonać i gdzie znajdzie się nasza strona. Co to docker? W uproszczeniu to takie poręczne narzędzie, które uruchamia sobie malutkiego linuxa w tle, pobiera paczki, które nakażemy mu w pliku konfiguracyjnym i wykonuje określone komendy. Generalnie bardzo ważne i przydatne narzędzie, ale to nie o nim dzisiejszy wpis. Poczytaj sobie o tym, polecam.

No, teraz już możemy zrobić coś takiego:

```
    git add .
    git commit -m "initial commit"
```

Zakomitowaliśmy nasz początkowy stan. Jest fajnie. Teraz na gitlabie utwórz repo. Tylko, uwaga. Nie może się ono nazywać przypadkowo.

Otóż, jeśli nazwiesz swoje repo <username>.gitlab.io, to będzie to twoja 'strona główna' - taką możesz mieć tylko jedną. W innym przypadku będzie to 'strona projektu'. Nie wdawajmy się w szczegóły, w naszym wypadku repo powinno nazywać się <username>.gitlab.io i tyle.

Teraz dodajemy naszemu lokalnemu gitowi adres remota, żeby wiedział, gdzie te nasze pliki słać:
```
    git remote add origin https://gitlab.com/olafgorski/olafgorski.gitlab.io.git
    git push origin master
```
Pamiętaj, żeby podać odpowiedni adres u siebie.

Teraz przejdź na stronę swojego repo na gitlabie i w zakładkę CI/CD - job powinien albo się uruchamiać, albo już zakończyć sukcesem. Jak coś nie działa, to poczytaj dokładnie co.
Stronę możesz obejrzeć pod adresem: <username>.gitlab.io

Brawo. Strona stoi, ale jest pusta i brzydka, i w ogóle.

# Dodajemy szablon

Żeby strona taka brzydka nie była, to dodajmy do niej nowy szablonik. W moim wypadku Flex wspomniany wcześniej. Jak? Nic trudnego. Edytujmy nasz plik - `.gitlab.ci.yml`
```
image: python:3.6-alpine

pages:
  script:
  - pip install -r requirements.txt
  - apk add --update git
  - git clone https://github.com/alexandrevicenzi/Flex.git Flex
  - pelican-themes -i Flex
  - pelican -s publishconf.py
  artifacts:
    paths:
    - public/
```

W skrócie - najpierw kazałem dockerowi zainstalować git'a, bo obraz python:3.6-alpine, zawiera w sobie domyślnie zainstalowanego pythona3.6 i w sumie tyle, więc gita sobi trzeba doinstalować. Następnie git sklonuje sobie repozytorium danego szablonu, a pelican-themes zainstaluje go i udostępni pelicanowi.

Teraz spore zmiany w `pelicanconf.py`:

```
#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Olaf Górski'
SITENAME = "grski's blog"
SITEURL = 'https://grski.pl'
FAVICON = SITEURL + '/static/favicon.png'
SITELOGO = SITEURL + '/static/profile.png'

SITETITLE = 'Olaf Górski'
SITESUBTITLE = 'Software Developer'
SITEDESCRIPTION = 'Stuff mostly about, really, Python, Django, Flask, Dart, AngularDart and Computer Science in general.'


ROBOTS = 'index, follow'

PATH = 'content'

TIMEZONE = 'Europe/Warsaw'

DEFAULT_LANG = 'Polish'

# Blogroll
LINKS = (('Archives', '/archives.html'),
             ('Categories', '/categories.html'),)

# Social widget
SOCIAL = (('linkedin', 'https://linkedin.com/in/olaf-górski-755244160/'),
          ('gitlab', 'https://gitlab.com/olafgorski/'),
          ('rss', 'https://grski.pl/feeds/all.atom.xml'))


DEFAULT_PAGINATION = 10

OUTPUT_PATH = 'public'
THEME = 'Flex'

PYGMENTS_STYLE = 'monokai'
STATIC_PATHS = ['static']

```

Upewnijcie się, że `SITEURL` nie jest nadpisane w pliku `publishconf.py`, jeśli jest, to usuńcie i już.

Następnie należy dodać troszkę contentu do, żeby było co wyświetlić, można to zrobić poprzez wrzucenie dowolnych postów do folderu `content`

Notka: jeśli w content utworzymy sobie katalog - np. `python` to posty umieszczone w tym katalogu będą też przypisane do kategorii Python : ) Taki mądry ten pelikan.

Jak wygląda przykładowy post?


Chociażby tak:
```
Title: Jak za darmo opublikować swoją stronę na GitLab Pages: Pelican(jekyll/hugo), CI Pipelines, Docker, Cloudflare, linia poleceń i customowa domena https
Date: 2018-06-27
Authors: Olaf Górski
Slug: gitlab-pages-intro
Description: Po krótce o tym, jak opublikować za darmo swoją własną stronę na GitLab Pages z customową domeną, obsługą https oraz continuous integration.

Treść

#Nagłóweczek

lalala
```

Git add, commit, push i gotowe.

Co teraz?

# Domena

Tutaj opiszę to wszystko w miarę skrótowo, bo to w sumie proste klikanie.

Na stronie repo na gitlabie:
Settings -> Pages
Tutaj na chwilę obecną odznaczamy 'force domain with SSL' jeśli jest zaznaczone

Teraz New Domain i wypełniamy tylko nazwę domeny, w moim wypadku: grski.pl

Teraz siup szybko na stronę rejestratora domeny i dodajemy A rekord o wartości: 52.167.214.135 - ip serwera GitLaba (sprawdź sobie, bo może się zmienić, za kilka lat, miesięcy or sth)

No to teraz szybko na cloudflara, zakładamy tam konto, dodajemy tą domenę i zmieniamy dnsy naszej domeny na podane tam przez nich w cloudflarze. Dodatkowo należy pamiętać o dodaniu kodu weryfikacyjnego w postaci rekordu TXT - name to będzie nasza domena, a wartość możecie znaleźć details domeny na gitlabie.

Jak dnsy nam przeparkują, to wchodzimy sobie znów na cloudflara, zakładka Crypto, zjeżdżamy na dół( przy okazji zaznaczając gdzie się da, by wymuszało https/ssl i te sprawy) i klikamy New Origin.

Klik Dalej i mamy oto wygenerowane dwa dziwne pliczki. Pierwszy to Certyfikat - wklejamy go w pole certificate w zakładce naszej domeny na repo w gitlabie, a klucz prywatny niżej.

Aaaale, to nie wszystko. CF wymaga jeszcze takiego myku, że poniżej naszego Certyfikatu musimy wkleić jeszcze to:

```
tutaj jest twój prywatny certyfikat
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIID/DCCAuagAwIBAgIID+rOSdTGfGcwCwYJKoZIhvcNAQELMIGLMQswCQYDVQQG
EwJVUzEZMBcGA1UEChMQQ2xvdWRGbGFyZSwgSW5jLjE0MDIGA1UECxMrQ2xvdWRG
bGFyZSBPcmlnaW4gU1NMIENlcnRpZmljYXRlIEF1dGhvcml0eTEWMBQGA1UEBxMN
U2FuIEZyYW5jaXNjbzETMBEGA1UECBMKQ2FsaWZvcm5pYTAeFw0xNDExMTMyMDM4
NTBaFw0xOTExMTQwMTQzNTBaMIGLMQswCQYDVQQGEwJVUzEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjE0MDIGA1UECxMrQ2xvdWRGbGFyZSBPcmlnaW4gU1NMIENl
cnRpZmljYXRlIEF1dGhvcml0eTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzETMBEG
A1UECBMKQ2FsaWZvcm5pYTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AMBIlWf1KEKR5hbB75OYrAcUXobpD/AxvSYRXr91mbRu+lqE7YbyyRUShQh15lem
ef+umeEtPZoLFLhcLyczJxOhI+siLGDQm/a/UDkWvAXYa5DZ+pHU5ct5nZ8pGzqJ
p8G1Hy5RMVYDXZT9F6EaHjMG0OOffH6Ih25TtgfyyrjXycwDH0u6GXt+G/rywcqz
/9W4Aki3XNQMUHNQAtBLEEIYHMkyTYJxuL2tXO6ID5cCsoWw8meHufTeZW2DyUpl
yP3AHt4149RQSyWZMJ6AyntL9d8Xhfpxd9rJkh9Kge2iV9rQTFuE1rRT5s7OSJcK
xUsklgHcGHYMcNfNMilNHb8CAwEAAaNmMGQwDgYDVR0PAQH/BAQDAgAGMBIGA1Ud
EwEB/wQIMAYBAf8CAQIwHQYDVR0OBBYEFCToU1ddfDRAh6nrlNu64RZ4/CmkMB8G
A1UdIwQYMBaAFCToU1ddfDRAh6nrlNu64RZ4/CmkMAsGCSqGSIb3DQEBCwOCAQEA
cQDBVAoRrhhsGegsSFsv1w8v27zzHKaJNv6ffLGIRvXK8VKKK0gKXh2zQtN9SnaD
gYNe7Pr4C3I8ooYKRJJWLsmEHdGdnYYmj0OJfGrfQf6MLIc/11bQhLepZTxdhFYh
QGgDl6gRmb8aDwk7Q92BPvek5nMzaWlP82ixavvYI+okoSY8pwdcVKobx6rWzMWz
ZEC9M6H3F0dDYE23XcCFIdgNSAmmGyXPBstOe0aAJXwJTxOEPn36VWr0PKIQJy5Y
4o1wpMpqCOIwWc8J9REV/REzN6Z1LXImdUgXIXOwrz56gKUJzPejtBQyIGj0mveX
Fu6q54beR89jDc+oABmOgg==
-----END CERTIFICATE-----
```
I to w takim formacie, jak wyzej - czyli linijka przerwy od naszego prywatnego certyfiaktu.
Uwaga, tych prywatnych certyfikatów ani klucz to nigdzie lepiej nie podawajcie. Poważnie. Zwłaszcza publicznie.

Ta druga część jest publiczna i udostępniana przez cloudflara, także spoko.

Klikamy save.

# Gotowe?

Nie no jeszcze nie. Musimy teraz zmienić `SITEURL` w `pelicanconf.py` na odpowiedni - u mnie `https://grski.pl`, commitnąć i pushnąć. Ponownie upewnij się, czy przypadkiem ta stała nie jest nadpisywana potem w `publishconf.py` i jeśli tak, to wyrzuć stamtąd deklarację SITEURL. Teraz powinno być gotowe. Uwaga - pliki statyczne mamy w content/static. Inaczej można tez to skonfigurować, ale jak to zrobić ogarnijcie z dokumentacji :) 

Po co to całe zamieszanie z Cloudflarem? Cóż, zyskujemy za darmo CDN, certyfikat SSL, https wszędzie, darmową analizę ruchu, przyśpieszenie strony dzięki CDN'owi i tak dalej. Super sprawa. Co to CDN? Pisałem o tym, poczytaj.

# Podsumowanie
Strona? Gotowa. Blog? Gotowy. Automatyczne buildowanie? Gotowe. HTTPS everywhere? Gotowe. Feed atom/rss? No jasne. 

Super.

Dodatkowo do Flex'a dość prosto można dodać np. disqusa jak ktoś sobie komentarze życzy, ale o tym to już w dokumentacji poczytajcie.

Dzięki za uwagę.