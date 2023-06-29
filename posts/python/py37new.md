Title: Właśnie wyszedł Python 3.7, co nowego wąż nam syczy?
Date: 2018-06-28
Authors: Olaf Górski
Slug: python-37
Description: Krótki opis nowych funkcjonalności, które pojawią się w Pythonie 3.7.

Hej! Ekscytujący dzień, wczoraj premierę miała miejsce nowa wersje Pythona o numerze 3.7, w której troszkę się dzieje, dlatego dziś po krotce opiszę, cóż nowego przyniosły nam kolejne PEPy.

# Zacznijmy od czegoś, na co czekałem: async i await

Te dwa wyrazy są od teraz zarezerwowane jako słowa kluczowe, jest to zmiana łamiąca kompatybilność wsteczną, ale to nic!

Te keywordy wprowadzają do Pythona piękne ułatwienie co do programowania asynchronicznego, dzięki którym kod wykonywany asynchronicznie można pisać praktycznie tak, jak kod wykonywany tradycyjnie.

Rozwiązane znane, chociażby z Darta, gdzie robi piękną robotę, czy nawet JS'a. Cieszy mnie, że i w Pythonie teraz oficjalnie można z tych keywordów korzystać w samym języku.

# PEP 563 - opóźniona ewaluacja adnotacji typów

Python jest językiem typowanym dynamicznie, niemniej jednak od jakiegoś czasu już, mamy w nim coś takiego jak adnotacje typów - możemy dać znać programiście, jaki typ dana metoda powinna zwracać. Zwrócenie innego co prawda nie spowoduje, że nam się program wysypie, co najwyżej jakieś ostrzeżenie, ale wciąż, to jakaś pomoc przy debugowaniu.

Do tej pory adnotacje typów negatywnie wpływały na czas startu pythonowych skryptów - wydłużały go. Naprawiono ten błąd. To pierwsza sprawa.

Druga, nie mniej ważna, to fakt, że do tej pory w adnotacjach typów można było używać jedynie istniejących w chwili deklaracji typów/nazw. Co to znaczy?

```
class C:
@classmethod
def from_string(cls, source: str) -> C:
	...

def validate_b(self, obj: B) -> bool:
	...

class B:
	...
```
Żeby ten kod kiedyś zadziałał, to musiałby wyglądać tak:
```
class B:
	...
class C:
@classmethod
def from_string(cls, source: str) -> C:
	...

def validate_b(self, obj: B) -> bool:
	...
```

To tak jakby w Pythonie coś niżej miało powodować błąd.
```
def f_a():
	f_b()

def f_b():
	...
```

Z racji tego, że powyższy zapis jest poprawny, bo metody mają opóźnioną ewaluację, to i do adnotacji typów trzeba było to dodać. Dokładniej, o co chodzi?

Po prostu w adnotacjach typów dostępne były jedynie te nazwy, które są wbudowane, lub były dostępne już w lokalnym scope w 'linijce' dodawania adnotacji. Od teraz nie ma takiego problemu, gdyż ewaluacja adnotacji została opóźniona.

Dodatkowo warto wspomnieć, że ten PEP został przygotowany przez Polaka - [Łukasza Langa](http://lukasz.langa.pl/?lang=pl)

# PEP 538: poprawiona obsługa strategii 7-bitowego ASCII i tekstu na starych platformach

Python jako język jest starszy od Unicode. Nieźle, co? Przez to w jego pierwszej implementacji nie było domyślnego wsparcia dla Unicodu, a wszystko siedziało w ASCII. Obecnie jednak, w czasach globalizacji, nie jest to rozwiązanie możliwe do utrzymania, stąd obecnie zarówno Python2 jak i Python3 wspierają UTF-8, przy czym wersja nr 3 domyślnie używa utf'a. Python2 ze względów kompatybilności wciąż na ASCII głównie siedzi, ale to nic. Do 2020 przestanie być w końcu wspierany także fajnie : )

# PEP 540: Wymuszanie tryby uruchomienia UTF-8
Używając argumentu -X utf8 czy też zmiennej środowiskowej PYTHONUTF8, można wymusić na CPythonie tryb UTF-8. Wtedy CPython ignoruje kompletnie lokalne ustawienia systemu i wali sobie wszystko w UTF-8.

Wada: to wymuszanie nie ma wpływu na niektóre moduły (np. GNU readline), procesy potomne nie-Pythonwych appek i procesy potomne wywołujące starsze wersje Pythona.

# PEP 553: Wbudowany breakpoint()
Nowa wbudowana metoda - breakpoint(). Łatwy i nowy sposób na to, jak sobie w danym fragmencie kodu przejść do debuggera.

Robi on nic innego, jak wywołuje metodę 'sys.breakpointhook()', tyle, że ta metoda domyślnie importuje 'pdb' natomiast 'breakpoint()' może wywołać dowolnie wybrany przez nas debugger.

Można wyłączyć poprzez ustawienie PYTHONBREAKPOINT w env variables na 0.

# PEP 539: Nowe C API dla Thread-Local Storage

Cóż, tutaj za dużo się nie będę rozpisywał, tak jak mówi sam tytuł.

# PEP 562: Zmieniony dostęp do atrybutów modułów

Mówiąc krótko - zmiana tego jak i gdzie można używać __geattr__() na modułach.

# PEP 564: Nowe funkcje z dokładnością co do nanosekundy.

Jak wam kiedyś brakowało dokładności w mierzeniu czasu pythonem, to teraz już chyba nie.

PEP 564 dodaje 6 nowych wariantów istniejących już funkcji z modułu 'time', które pozwalają operować na nanosekundach.
```
time.clock_gettime_ns()
time.clock_settime_ns()
time.monotonic_ns()
time.perf_counter_ns()
time.process_time_ns()
time.time_ns()
```

Na Windowsie i Linuxie dokładność tych funkcji jest ponad 3 razy lepsza niż np. time.time().

# PEP 565: wyświetlanie DeprecationWarning w `__main__`
Jeśli w naszym skrypcie znajdzie się jakiś kod, który jest już zdeprecjonowany, i będziemy go używać, chociażby w jakimś naszym skrypcie, w ciele `__main__`, od teraz będziemy widzieć powiadomienia o deprecjacji danego rozwiązania.

Głównie chodzi tutaj o jakieś proste skrypty czy sytuacje gdy używamy Pythona interaktywnie.

Ostrzeżenia wywołane przez zaimportowane moduły czy biblioteki wciąż pozostaną domyślnie ukryte.

Wcześniej 'DeprecationWarning' było widoczne tylko podczas uruchamiania testów. Not anymore! I dobrze.

Dlatego od teraz w Pythonie, a konkretniej w bibliotece standardowej, mamy trzy różne warning deprecation o różnych zachowaniach.

```
FutureWarning: domyślnie zawsze wyświetlany
DeprecationWarning: domyślnie wyświetlany, tylko jeśli kod uruchomiony w `__main__` i kiedy uruchomimy testy
PendingDeprecationWarning: domyślnie wyświetlany, tylko jeśli kod uruchomiony jest w testach i mówi nam to o tym, że w przyszłości będzie dane zachowanie zmienione
```

# PEP 560: wsparcie core języka dla modułu typing i Generic Types
Nic dodać, nic ująć.

# Nowy tryb runtime: -X dev
-X dev czy też zmienna środowiskowa PYTHONDEVMODE sprawia, że w CPythonie włączy się development mode, który zaś powoduje, że CPython wykonuje pewne dodatkowe operacje, sprawdzenia, podczas uruchomienia, które jednak zajmują za dużo czasu, więc by default są wyłączone.

# PEP 552: pliki .pyc oparte na Hashu!
Wcześniej było tak, że python sprawdzał sobie to, czy bajtkod jest aktualny poprzez porównanie nagłówków zcachowanych plików (.pyc) do metadata plików źródłowych - data ostatniej modyfikacji i rozmiar. Był z tym problem, kiedy zmiany były na tyle blisko siebie w czasie lub na tyle małe, że Python ich 'nie widział', zatem nie kompilował sobie ponownie kodu źródłowego do bajtkodu, co mogło okazać się problematyczne, np. w odtwarzaniu bugów z produkcji czy coś.

Od teraz sprawdzanie będzie po hashu zamiast po timestampie czy rozmiarze, jednakże nie jest to opcja domyślna - runtime Python dalej będzie używać timestampów, jednakże możemy wygenerować sobie .pyc walidujące po hashu za pomocą 'py_compile' czy 'compileall'.

# Yield w comprehensions i generator expressions
Dostał deprecated. Na razie tylko DeprecationWarning, ale od 3.8 wyrzuci nam już SyntaxError, także uważajcie na nowy kod. Chodzi o to, by nie mieszać tam, gdzie nie trzeba i żeby lisit comprehensions zawsze zwracał jakąś listę a nie np. właśnie generator.

# Nowe moduły

Kilka nowych modułów też wpadło, opisujemy!

## contextvars
Wsparcie dla context variables - podobne są one dla zmiennych lokalnych dla danych wątków, jednakże w przeciwieństwie do nich, poprawnie obsługują one kod asynchroniczny. Kolejna zmiana, która mnie cieszy.

'asyncio' i 'decimal' od teraz domyślnie używają i wspierają context variables.

## dataclasses
Coś, co mi się podobało od dawna - dzięki temu dekoratorowi możemy zaoszczędzić sobie pisania sporej ilości bojlerkodu. Co prawda w Pythonie i tak jest go niedużo, ale wciąż.

Ten dekorator generuje dość standardowy konstruktor, czy metody takie jak `__repr__()`, `__eq__()`, `__hash()__` za nas. Oczywiście sami możemy wybrać, co konkretnie wygeneruje a co nie.

[Poczytajcie, bo ciekawy temat.](https://www.python.org/dev/peps/pep-0557)

## importlib.resources
Nowe APi i jedna nowa ABC (Abstract Base Class) do obsługi resourców z innych paczek.

# Zmiany w modułach

## argparse
Nowa metoda 'ArgumentParser.parse_intermixed_args()' pozwala na mieszanie ze sobą w kolejności opcji i argumentów pozycyjnych.

## asyncio
Tutaj sporo zmian, nowych ficzerków i upgrejd jeśli chodzi o wydajność.
Jest ich tu na tyle dużo, że raczej zachęcam do zapoznania się z nimi samodzielnie.

## fpectl został usunięty

## FreeBSD 9 i starszy już nie są oficjalnie wspieranymi platformami

# Pomniejsze zmiany

Od teraz w konsoli można przekazywać więcej niż 255 argumentów, podobnie funkcje mogą mieć również więcej niż 255 parametrów.

'bytes.fromhex()' oraz 'bytearray.fromhex()' od teraz ignorują wszelakie whitespace z ASCII - nie tylko spacje.

'str, bytes, bytearray' od teraz obsługują nową metodę 'isascii()', która sprawdza czy string albo bajty zawierają tylko znaki ASCII.

od teraz 'object.__format__(x. '')' będzie znaczył to samo co 'str(x)' a nie tak jak wcześniej 'format(str(sefl), '')'

sorted() i list.sort() jeszcze szybsze - dla pewnych określonych przypadków te metody działają nawet 40-75% szybciej.

Podobnie dict.copy() - on jednak jest 5.5 raza szybszy obecnie.

Zmieniono również sposób generacji bajtkodu, dzięki którym wywołania metod będą 20% szybsze!

Czas uruchomienia Pythona na linuxie zmniejszono o 10% a na macu o 30%!

OrderedDict został ogłoszony jako oficjalna część specyfikacji core Pythona!

# Podsumowanie

W pythonie 3.7 zmieniło się to i wiele, wiele więcej, jednakże ja sam nie jestem w stanie tego wszystkie opisać. By dowiedzieć się więcej zachęcam do zajrzenia do [dokumentacji](https://docs.python.org/3.7/whatsnew/3.7.html).