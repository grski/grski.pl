Title: Dlaczego w programowaniu indeksujemy od 0? - wskaźniki, adresy w pamięci
Date: 2018-06-30
Authors: Olaf Górski
Slug: indexing-from-zero
Description: Rozwikłajmy zagadkę - dlaczego w programowaniu indeksujemy zazwyczaj od zera?

Ostatnio pod [jednym z moich wpisów](https://4programmers.net/Mikroblogi/View/30661#entry-30661) na mikroblogu 4p, nawiązała się krótka rozmowa nt indeksowania elementów w tablicach - gdyż stwierdziłem, iż logiczne i normalne jest ich indeksowanie od 0, natomiast języki, które indeksują od 1, czy innych liczb, no są troszkę nietypowo-dziwno-śmieszne.

Padł jednak komentarz, że jest w zasadzie na odwrót a my, programiści, indeksujemy sobie od 0 tak po prostu, bo się przyzywczailiśmy.

Otóż nie. [Mimo tego, że sam kiedyś podobnie myślałem](https://4programmers.net/Mikroblogi/View/8661#entry-8661), to indeksowanie od 0 jest logiczne i ma swoją zasadność, dlatego też w tej krótkiej notce opiszę z czego ono wynika na przykładzie języka C.

# Skąd to 0?

Sprawa jest dość prosta.

	#!c
	#include <stdio.h>

	int main(void) {
		int numbers[] = {1,2,3,4};
		printf("numbers in general: %p -- %p\n", &numbers, numbers+0);
		for (int i = 0; i < sizeof(numbers)/sizeof(numbers[0]); i++) {
			printf("number no. %i: %p -- %p -- value: %d\n", i, &numbers[i], numbers+i, *(numbers+i));
		}
		printf("int size: %d\n", sizeof(int));
		return 0;
	}


Powyższy kod wyświetli nam w konsoli coś takiego:

```
numbers in general: 0x7ffc9f728f20 -- 0x7ffc9f728f20
number no. 0: 0x7ffc9f728f20 -- 0x7ffc9f728f20 -- value: 1
number no. 1: 0x7ffc9f728f24 -- 0x7ffc9f728f24 -- value: 2
number no. 2: 0x7ffc9f728f28 -- 0x7ffc9f728f28 -- value: 3
number no. 3: 0x7ffc9f728f2c -- 0x7ffc9f728f2c -- value: 4
int size: 4
```

Przeanalizujmy troszkę o cóż tu chodzi.

Zanim to zrobimy, zaznaczę tylko, że Ty, jeśli uruchomiłeś ten kod u siebie, mogłeś dostać nieco inne wyniki. To normalne.

Dla większości osób nieznajomych z C/C++ ten kod może wydawać się nieco kryptyczny, ale w gruncie rzeczy jest dość prosty.

# Co znaczy ten kod?

Zacznijmy może od linijki

	:::c
	printf("numbers in general: %p -- %p\n", &numbers, numbers+0);

Zakładam, że pierwsza część printa jest zrozumiała dla każdego, może poza `%p` - to po prostu nam mówi, że argument do wyprintowania będzie specyficznym typem danych.

# & - co to jest?

`&numbers` - operator & zaś mówi, że chcę otrzymać adres danej zmiennej - czyli jej lokację w pamięci. Bo jak dobrze wiemy, zmienne alokowane są w pamięci, w pewnym miejscu wybranym przez komputer. To miejsce zazwyczaj opisuje się jako 'adres' - czyli liczba bajtów od 'poczatku' pamięci, którą procesor musi 'przeskoczyć', by dotrzeć do danej zmiennej. 

Nasza tablica (czyli taka jakby lista z Pythona, ale nie do końca), znajduje się pod adresem: 0x7ffc9f728f20 (zapis szesnastkowy), i jest to tym samym adres naszego pierwszego elementu.

Kompilator musi musi jednak wiedzieć, pod jakim adresem znajduje się następny element naszej tablicy. Skąd? Otóż prosta sprawa. 

Zadeklarowaliśmy, że elementy naszej tablicy będą typu `int`. Typ `int` na komputerze, z którego korzystam, jest akurat 4 bajtowy, czyli 32 bitowy. Jest to w zasadzie standard (chociaż oficjalnie standard mówi o tym, że int ma być po prostu przynajmniej 16 bitowy, nie specyfikuje jego rozmiaru dokładnie), ale czasami są odstępstwa od reguły, zależnie od architektury, stąd też ten `sizeof(int)` w kodzie - zwraca on rozmiar danego typu w obecnym środowisku.

Dlatego też, jeśli 0x7ffc9f728f20 jest adresem pierwszego elementu, który zajmuje w pamięci 4 bajty o adresach: `0x7ffc9f728f20`, `0x7ffc9f728f21`, `0x7ffc9f728f22`, `0x7ffc9f728f23`, to możemy wnioskować, że następny element tej tablicy będzie po nim, pod adresem 0x7ffc9f728f24, czyli 4 bajty dalej. Następny znowu kolejne 4 bajty i tak dalej, aż do ostatniego elementu.

# Prosty wzór

Zatem adres konkretnego elementu tablicy można określić wzorem `adres_pierwszego_elementu+(index*rozmiar_typu)`. Z takiego też wzoru korzysta komputer - za każdym razem, gdy piszesz `numbers[index]` kompilator tłumaczy to sobie wewnętrznie na `*(numbers+(index*rozmiar_typu))`. Co znaczy `*`? Nic innego, jak 'idź pod dany adres i weź wartość znajdującą się pod tym adresem.'

Zatem gdy napiszemy numbers[0], to nasz kompilator przetłumaczy to na `*(0x7ffc9f728f20+0)`, czyli `*(0x7ffc9f728f20)`, co z kolei znaczy: weź wartość z tego adresu i wstaw ją tutaj. 

W przypadku np. numbers[1], będzie to `*(0x7ffc9f728f20+(1*sizeof(int))) = *(0x7ffc9f728f20+(1*4)) = *(0x7ffc9f728f20+4)`, czyli `*(0x7ffc9f728f24)`. Jasne? Jak dla mnie tak. Jeśli masz problem ze zrozumieniem tego konceptu, nie przejmuj się, wiele osób nie do końca rozumie wskaźniki, adres i pamięć. Ja też miałem z tym problem. Przynajmniej na początku. 

Możesz wspomóc się [filmikami Gynvaela](https://www.youtube.com/watch?v=bewTJaboGIw) czy [wykładami z CS50 - kursu z Harvardu](https://www.youtube.com/watch?v=PYJYiBlto5M) oni, jako osoby o znacznie większej wiedzy, tłumaczą całe zagadnienie znacznie lepiej niż ja.

# Jak by to wyglądało, gdybyśmy indeksowali od 1?

Załóżmy, że indeksujemy od 1. Wtedy wzór musiałby ulec modyfikacji - i wyglądałby on tak:

```
adres_pierwszego_elementu+((index-1)*rozmiar_typu)
```

Innym rozwiązaniem byłoby przesunięcie lokacji pierwszego elementu tablicy o 4 bajty do przodu względem adresu samej tablicy, ale wtedy nasza tablica zajmowała by dodatkowe miejsce w pamięci i to niepotrzebnie, gdyż te pierwsze x bajtów, gdzie x to rozmiar danego typu danych, byłoby po prostu puste. To raz, dwa, że trzeba by pamiętać, że adres tablicy nie jest adresem pierwszego jej elementu.

Oba te rozwiązania są bezsensowne, bo o ile nie jest to niby dużo - kilka bajtów na każdej tablicy, czy jedna operacja odejmowania, to gdy pomnożymy to sobie przez ilość takich zmiennych, które mamy w pamięci, to już wyjdzie całkiem pokaźna sumka bajtów/operacji, które w istocie rzeczy, są zbędnie zajmowane.

Dodatkowo ileż kodu bazuje już na indeksowaniu od 0. Niemożliwym by było to wszystko zmienić.

Oczywiście, są również inne argumenty, by indeksować czy liczyć elementy od zera, jak chociażby [te, głoszone przez Dijsktrę](https://www.cs.utexas.edu/users/EWD/transcriptions/EWD08xx/EWD831.html). To taki raczej znany i ważny Pan, dla tych, którzy nie kojarzą ;) 


# Podsumowanie

Jak widać powyżej, indeksowanie od 1 jest nieco absurdalne, kiedy wiesz, jak proces dostępu do elementów tablicy wygląda od środka.

We wpisie użyłem troszkę 'uproszczeń', także za niedokładności z góry przepraszam.
