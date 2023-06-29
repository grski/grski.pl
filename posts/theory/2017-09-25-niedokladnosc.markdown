Title:  Niedokładność liczb zmiennoprzecinkowych, czyli dlaczego 0.1+0.2 != 0.3
Date:   2017-09-25
Authors: Olaf Górski
Slug: floating-point
Description: Trochę teorii dlaczego 0.1+0.2 != 0.3, niedokładności liczb zmiennoprzecinkowych w języku binarnym.

Floating point imprecision, czy też może po polsku(chyba) niedokładność liczb zmiennoprzecinkowych. Brzmi poważnie, co? A no trochę jest, przynajmniej czasami. Zwłaszcza, jak operujemy na pieniądzach w jakiś sposób. A to w programowaniu dość częsty przypadek, no bo przecież te wszystkie templatki dla banków same się nie napiszą, prawda? W każdym razie... O co chodzi?

Dziś temat taki raczej prosty do zrozumienia i krótki. Floating point imprecision to powód dla którego nie powinno używać się floatów czy prymitywów zmiennoprzecinkowych jeśli mamy do czynienia z pieniędzmi czy też może wykonujemy dokładne obliczenia.

Konkretniej.

Rozważmy prosty program w C(sprawa dotyczy praktycznie każdego języka):
```
    #!c
    #include <stdio.h>

    int main()
    {
        float example_float = 0.1;
        if(example_float == 0.1)
        {
            printf("Equal");
        }
        return 0;
    }
```
Prosty kod, prawda? Myślę, ża każdy powinien go zrozumieć, jeśli zna choćby podstawy programowania. Oczekiwanym przez sporą część wynikiem działania tego kodu byłoby wydrukowanie 'Equal' w konsoli, racja? Ja też oczywiście tak myślałem na początku. Sprawdźcie jednak sami, co się stanie gdy kod skompilujecie i uruchomicie.

O dziwo "Equal" się nie wyświetliło. Dlaczego? Coś się pomyliło? Liczby pozornie te same, no bo i tu 0.1 i tu 0.1, co jest? Hm, może zmienną nam źle zapisało. Wypiszmy ją sobie i zobaczmy.
```
    #!c
    printf("%f", example_float);
```

Dodajcie sobie tę linijkę kodu po zakończonym ifie. Uruchomcie kod... I co?
Oto wynik:

```
0.100000
```

Chwila. Czyli jednak coś źle działa w naszym programie, prawda? No bo `example_float` jest przecież równy 0.1, prawda? A no nie.

Tutaj tego nie widać, bo precyzja jest zbyt niska, ale poprawny to, zmuśmy funkcję `printf` do wyświetlenia naszego floata z większą dokładnością niż domyślna, bo jak widzicie, printf domyślnie wyświetla tylko 6 cyfr po przecinku.
```
    #!c
    #include <stdio.h>

    int main()
    {
        float example_float = 0.1;
        if(example_float == 0.1)
        {
            printf("Equal");
        }
        printf("%.16f", example_float);
        return 0;
    }
```

Daje nam

```
0.1000000014901161
```

Lekka modyfikacja naszego kodu i wszystko jasne. Nasz `example_float` nie jest równy dokładnie 0.1, tylko troszkę więcej. Dlaczego?

# Winowajca

Wszystko wynika stąd, że komputer 'operuje' na języku binarnym. Oznacza to, że przy tworzeniu liczb dostępne są jedynie potęgi dwójki, mnożone odpowiednio przez 1 lub 0, które można sumować(tak w dużym uproszczeniu). Nic zatem dziwnego, że nasz float tak wygląga. No bo spróbujcie z takich liczb `{..., 1/128, 1/64, 1/32, 1/16, 1/8, 1/4, 1/2, 0, 1, 2, 4, 8, 16, ...}` zbudować dokładnie 0.1. Nie da się tego zazwyczaj zrobić idealnie. Teoretycznie w wyimaginowanym świecie,
gdzie mielibyśmy nieskończoną ilość pamięci do dyspozycji i nieskończoną ilość czasu, to moglibyśmy zbliżyć się nieskończenie blisko, nawet ją osiągnąć czasem, do dowolnej liczby. Ale o tym jak chcecie więcje, to o limitach sobie poczytajcie albo przypomnijcie z liceum i z matematyki.

Stąd ta niedokładność - wynika ona jedynie z tego jak reprezentowane są liczby zmiennoprzecinkowe w pamięci komputera. O ile w większości przypadków, za pomocą skończonej ilości pamięci można uzyskać zadowalającą dokładność, tak są takie przypadki, gdzie niestety ta dokładność nie będzie wystarczająca.

Do takich przypadków mamy specjalne biblioteki czy też może specjalne podejście, które inaczej zajmuje się tematem, niemniej jednak warto o tym wiedzieć. Dlatego też, jeśli piszemy jakiś program, który cokolwiek ma wspólnego z pieniędzmi, warto zastanowić się dwa razy zanim użyjemy floata czy doubla. Może lepiej złotówki trzymać w oddzielnym incie, a grosze w oddzielnym? Who knows.

A jak dokładnie wygląda reprezentacja tego floata w pamięci? Cóż, to już trochę bardziej skomplikowany temat, raczej na inny wpis.

To tyle, hej!

