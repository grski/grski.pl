Title: Wydajność różnych metod łączenia stringów w Pythonie - dlaczego f-stringi są spoko
Authors: Olaf Górski
Date: 2020-01-10
Slug: fstringi-sa-spoko
Description: Krótki wywód o tym dlaczego f-stringi to król konkatenacji jak sum jest król wód.

Jestem dość dużym zwolennikiem f-stringów w Pythonie. Podobają mi się one, są eleganckie, czytelne i proste w użyciu. Ciekawiło mnie jednak, jak wypadają jeśli chodzi o wydajność pod spodem, gdyż cóż, ta elegancja pewnie musi mieć jakiś ukryty koszt. Nic w życiu nie ma za darmo, prawda? Postanowiłem to sprawdzić i zestawić ze sobą różne metody manipulacji stringów w Pythonie pod względem wydajności.

W konkurencji znalazły się: f-stringi, konkatenacja (dodawanie) stringów, metoda join(), metoda format(), template string.
W zestawieniu nie znalazł się operator %. Dlaczego? Nie przepadam za nim tak szczerze. Moja osobista preferancja. Uważam, że powinno się go raczej unikać z pewnych względów. Relikt przeszłości, mamy dziś lepsze rozwiązania.

## Metodyka testowania

Testował będę za pomocą modułu timeit wbudowanego w Pythona, wywołując polecenia z terminala. Wszystkie zmienne wykorzystywane w modyfikowanym stringu, będą definiowane i ładowane zanim rozpocznie się mierzenie czasu.
Każde polecenie będzie uruchamiane pętlach o 1000000 iteracjach, każda taka pętla będzie uruchomiona 3 razy. Z tejże pętli wyłoniony zostanie najkrótszy przebieg pojedynczej iteracji. Przejdźmy do samego testowania.

## Porównanie.

Zaczynajmy zatem. Poniżej kod, jakiego użyłem. Wybaczcie prymitywne nazwy zmiennych, ale pisałem go kompletnie na kolanie.

``` bash
python3 -m timeit -s "x = 'f'; y = 'z'" "f'{x} {y}'" # f-string
python3 -m timeit -s "x = 'f'; y = 'z'" "x + ' ' + y" # konkatenacja
python3 -m timeit -s "x = 'f'; y = 'z'" "' '.join((x,y))" # join
python3 -m timeit -s "x = 'f'; y = 'z'; t = ' '.join" "t((x,y))" # join2
python3 -m timeit -s "x = 'f'; y = 'z'" "'{} {}'.format(x,y)" # format
python3 -m timeit -s "x = 'f'; y = 'z'; t = '{} {}'.format" "t(x,y)" # format2
python3 -m timeit -s "from string import Template; x = 'f'; y = 'z'" "Template('$x $y').substitute(x=x, y=y)" # template string
python3 -m timeit -s "from string import Template; x = 'f'; y = 'z'; t = Template('$x $y')" "t.substitute(x=x, y=y)" # template string2
python3 -m timeit -s "from string import Template; x = 'f'; y = 'z'; t = Template('$x $y').substitute" "t(x=x, y=y)" # template string3
```

Wszystko raczej proste. Template stringa rozważyłem w trzech opcjach: pierwsza to taka, w której inicjalizacja instancji następuje w czasie liczonym do wyniku, druga to taka, gdzie sama inicjalizacja będzie poza pętlą, mierzony będzie tylko czas wykonania metody substitute(), która zostanie znaleziona na instancji klasy za pomocą operatora ., ostatnia będzie opcja trzecia, gdzie znalezienie metody nastąpi w setupie, a w czasie mierzonym tylko i wyłącznie jej wywołanie.

Co mam na myśli, kiedy mówię, że metoda zostanie znaleziona za pomocą operatora .? Otóż Python tam pod spodem robi sobie tak, że atrybuty danej klasy/nazwy metod i tak dalej, trzyma sobie zhashowane w słowniku. Zatem gdy piszemy obiekt.atrybut, pod spodem leci sobie szukanie w słowniku/dictionary lookup czy coś takiego jest w tej klasie. To oczywiście dodaje to czasu wykonania bo same instrukcje lookupu zajmują czas, co prawda niedużo, ale wciąż, do tego dochodzi jeszcze czas potrzebny na zaalokowanie pamięci i dodanie elementów do dicta pod spodem przy konstruowaniu instancji.

Podobnie zrobiłem z joinem i formatem. Tu rozważyłem dwie opcje - normalne wywołanie z lookupem i to bez niego.

A oto wyniki:

```
f-string: 10000000 loops, best of 3: 0.0791 usec per loop
konkatenacja: 10000000 loops, best of 3: 0.0985 usec per loop
join bez lookupu: 10000000 loops, best of 3: 0.112 usec per loop
join: 10000000 loops, best of 3: 0.144 usec per loop
format bez lookupu: 1000000 loops, best of 3: 0.232 usec per loop
format: 1000000 loops, best of 3: 0.264 usec per loop
template string3: 1000000 loops, best of 3: 1.01 usec per loop
template string2 loops, best of 3: 1.06 usec per loop
template string: 1000000 loops, best of 3: 1.36 usec per loop
```

## Zaskoczenie

Powiem szczerze, że nie spodziewałem się tego, że f-stringi są nie tylko eleganckim rozwiązaniem, ale i najszybszym! Bardzo mnie to cieszy.
Na drugin miejscu uplasowała się konkatenacja, join bez lookupu, join, format bez lookupu, format, a na samym końcu template string. Z racji tego, że optymalizacja, którą poczyniłem, jest dość niepraktyczna i raczej w kodzie nikt takich potworów nie będzie tworzył poza pewnymi wyjątkami, które być może powinny być napisane w C a nie w Pythonie, to nie umieszczam wyników bez lookupów w rankingu, który wygląda tak:

1. f-string
2. Konkatenacja
3. join()
4. format()
5. Template-string

## Nieco bardziej skomplikowany przykład

Pokazałem prosty przykład - wstawienie dwóch zmiennych oddzielonych spacją. Co jeśli zmiennych mamy nieco więcej niż 2? Załóżmy przypadek z 13 zmiennymi, które chcemy połączyć spacją. Kod:

``` bash
python3 -m timeit -s "a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "f'{a} {b} {c} {d} {e} {f} {g} {h} {i} {j} {k} {l} {m}'" # f-string
python3 -m timeit -s "a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ' ' + g + ' ' + h + ' ' + i + ' ' + j + ' ' + k + ' ' + l + ' ' + m" # konkatencja
python3 -m timeit -s "a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "' '.join((a, b, c, d, e, f, g, h, i j, k, l, m))" # join
python3 -m timeit -s "a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "'{} {} {} {} {} {} {} {} {} {} {} {} {}'.format(a, b, c, d, e, f, g, h, i, j, k, l, m)" # format
python3 -m timeit -s "from string import Template; a, b, c, d, e, f, g, h, i, j, k, l, m = [str(s) for s in range(13)]" "Template('$a $b $c $d $e $f $g $h $i $j $k $l $m').substitute(a=a, b=b, c=c, d=d, e=e, f=f, g=g, h=h, i=i, j=j, k=k, l=l, m=m)" # template string
```

Ciekawi mnie jak tutaj sytuacja będzie wyglądała.

Wyniki:

```
join: 1000000 loops, best of 3: 0.352 usec per loop
f string: 1000000 loops, best of 3: 0.399 usec per loop
format: 1000000 loops, best of 3: 0.872 usec per loop
concat: 1000000 loops, best of 3: 1.13 usec per loop
template string: 100000 loops, best of 3: 2.04 usec per loop
```

Bazując na poprzednich wynikach, nie zdziwiły mnie one za bardzo. Dlaczego?
Zacznijmy od tego, co się zmieniło. Join wskoczył z 3. miejsca na 1. Konkatenacja spadła z 2. na przedostatnie. Format na 3. z czwartego. W sumie dość zasadne, dlaczego.

Pierwsze miejsce join w takiej sytuacji jest oczywiste - popatrzmy co tam robimy - joinujemy tak jakby ze sobą wiele stringów ze wspólnym stringiem, czyli dokładnie to, do czego join został stworzony. Jestem niemalże pewnym, iż pod spodem na poziomie implementacji metody czy nawet interpretera są zrobione pod to optymalizacje, dzięki czemu join świetnie poradzi sobie z dużą ilością argumentów. Cieszy mnie to - ponownie rozwiązanie, które w tym przypadku wygląda najbardziej elegancko, wypada pierwsze.

Drugie miejsce f-string. Tutaj też się nie zdziwiłem. Dlaczego? Otóz f-stringi, pierwotnie co prawda były wolne, bardzo wolne, - w pierwszej implementacji były one "kompilowane" na nic innego jak zbiór odpowiednich joinów albo formatów, nie pamiętam. Niemniej jednak w kolejnej implementacji f-stringi doczekały się własnego, zoptymalizowanego OPCODE w CPythonie, co pozwoliło poczynić znaczne oszczędności i lepiej dostosować kod C, który jest pod spodem.

Dlaczego format wyprzedził konkatenacje? Cóż, domyślam się. Wydaje mi się, iż chodzi o ewaluację. Być może Python, z racji tego, że stringi są niemutowalne w Pythonie, za każdym razem, kiedy wykonywał operacje dodania na dwóch stringach, musiał zaalokować nowy kawałek pamięci, który pomieści X znaków, gdzie X to suma długości dwóch stringów, potem je tam przekopiować, by otrzymać finalną wartość. Z racji doświadczenia tego, jak python działa, to założę się, że w naszym wypadku, kiedy mieliśmy kod w postacie a + ' ' + b + ..., Python wykonywał każdą operacje dodawania oddzielnie. To znaczy, prawdopodobnie instrukcje pod spodem wyglądały tak:

1. Zaalokuj pamięć, która pomieści zmienną a oraz string ' '.
2. Przekopiuj wartość a
3. Przekopiuj wartość ' '
4. Otrzymany wynik dodaj do zmiennej b.
5. Zaalokuj pamięć, która pomieści poprzedni wynik oraz zmienną b.
6. ...

I tak dalej. A to wszystko kosztuje czas - nowe alokacje, kopiowanie. Tak mi się przynajmniej wydaje, że to zadziałało w ten sposób, nie jestem jednak pewien, czy developerzy pythona nie poczynili jakiś optymalizacji na ten przypadek i może robią to inaczej? Nie wiem, aż tak głęboko nie zaglądałem, ale patrząc po wynikach, nie sądzę.

Na końcu oczywiście nasza kobyłka, czyli template string.

## Podsumowanie

W pythonie mechanizmy, które zdają się wyglądać elegancko w danej sytuacji, zazwyczaj są pod takową zoptymalizowane i przygotowane, stąd warto ich używać. Piękny ten wąż po prostu. Elegancki kod.

Używajcie zatem f-stringów gdziekolwiek tylko możecie i cieszcie się z życia, tam gdzie dużo stringów do połączenia w przewidywalny sposób, join. Dzięki temu wasz kod będzie ładniejszy ale i szybszy!

