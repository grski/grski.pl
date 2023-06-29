Title: Krótki opis wad i zalet Pythona
Date: 2018-07-03
Authors: Olaf Górski
Slug: python-plus-minus
Description: Krótko o kilku wadach jak i zaletach Pythona okiem kogoś, kto z niego korzysta. Bardziej dla początkujących.

# Zalety

## Ekspresywność

Python jest bardzo ekspresywny. Co to znaczy? Otóż w Pythonie za pomocą relatywnie niewielkiej ilości kodu, można osiągnąć to, co w innych językach zajęłoby czasami kilka razy tyle. Żeby nie być gołosłownym, popatrzmy na przykład klasycznego programu, którym zaczyna się naukę programowania – Hello World, czy po polsku, Witaj Świecie.
W Pythonie wygląda on tak:

	:::python
    print(‘Hello World’)

Dość proste i zrozumiałe, prawda? Jedna linijka i gotowe.
Przyjrzymy się natomiast innym językom.
Zacznijmy od Javy:

	:::java
	public class HelloWorld{
	    public static void main(void) {
	        System.out.println(”Hello World”);
	      }
	}

Tu dalej w miarę jasno, mimo kilku pozornie tajemniczych komend, wciąż można łatwo odczytać, co dany program robi, ale weźmy, załóżmy, na celownik C++:

	:::c++
	#include <iostream> 
	using namespace std;
	int main() {
	    cout << "Hello World!";
	    return 0;
	}

Tutaj już troszkę mniej oczywistym jest, co dany program robi, prawda? W dodatku popatrzcie na ilość linii użytych do wykonania zadania. Nie ma porównania. Zaznaczam jednak, że w obu tych językach można by wydrukować hello world’a za pomocą krótszego kodu, niemniej jednak chodzi mi tutaj o samo pokazanie idei.

Innym przykładem tego, jak krótki może być kod w Pythonie względem porównywalnego kodu w C++/Javie czy innych języków, jest niżej, to kod nieco bardziej skomplikowany, ale być może coś z niego zrozumiesz. Dostarczył mi go w komentarzu @jacekw na Steemit i to jego autorstwa jest tenże kod. Dzięki : )

A więc cóż będzie nasz zadany kod robił? Jego zadanie jest proste:

1. stwórz listę liczb w kolejności malejącej 19 do 0.
2. Pomiń liczby parzyste.
3. Podnieś każdą liczbę do kwadratu.
4. Posortuj rosnąco.
5. Wypisz wynik.

Swoją drogą, jest to forma algorytmu, przedstawiona w postaci krokowej, coś, do czego jeszcze wrócimy w przyszłości. Obecnie zapamiętaj sobie jedno – algorytm to po prostu jakaś jednoznaczny zbiór instrukcji służących wykonaniu jakiegoś celu.

W każdym razie.

Zacznijmy tym razem od C++ może.

	#!c++
	#include <iostream> 
	#include <vector> 
	#include <algorithm> 
	#include <functional> 
	using namespace std; 
	int main() { 
	    vector<int> s, a; 
	    for (int i = 20; i > 0; i--) s.push_back(i);
	    copy_if (s.begin(), s.end(), back_inserter(a), [](int x { 
	        return x % 2 == 1 ;} );
	    transform(a.begin(), a.end(), a.begin(), [](int x){
	        return x*x;});
	    sort(a.begin(), a.end()); 
	    for (auto&& i : a) cout << i << " "; return 0; 
	} 

Teraz Java…
	
	#!java
	import java.util.Arrays;
	import java.util.stream.IntStream;
	public class Main {
	    public static void main(String[] args) {
	        int[] a = IntStream.range(0, 20)
	                .map(i -> 20 - i - 1)
	                .filter(x -> x % 2 == 1)
	                .map(x -> x * x)
	                .sorted()
	                .toArray();
	        System.out.println(Arrays.toString(a));
	    }
	}

I na koniec Python.
	
	#!python
	a = filter(lambda x: x % 2 == 1, reversed(range(20)))
	a = list(map(lambda x: x*x, a))
	print(list(sorted(a)))

Alterantywnie jeszcze moja wersja:

	#!python
	print(sorted([i*i for i in reversed(range(20)) if i % 2]))

Pozostawię bez komentarza.

Czy to znaczy, że te języki są gorsze, a Python jest królem? Absolutnie nie, nigdy tak nie myśl.

Każdy język jest jak narzędzie – ma swoje zastosowania, w których jest dobry, wyśmienity, ale ma też takie, do których kompletnie się nie nadaje. Tak jest i tutaj. Tak jest wszędzie. Owszem, czasem zdarzają się fanatycy danych technologii czy rozwiązań, którym językowo-technologiczne zapalenie opon mózgowych przyćmiewa obiektywny osąd, ale to nic. My nie chcemy tacy być. Bądźmy mądrzy i rozsądni, ułatwiajmy sobie życie, używając odpowiednich narzędzi do odpowiednich zadań.

Niemniej jednak Python pozwala nam pisać więcej w mniejszej ilości kodu. To oczywiście przychodzi w zamian za pewną cenę, którą trzeba zapłacić, i która sprawia, że Python dobry jest w pewnych sytuacjach a w innych już nie. 

## Prostota
Wróćmy do poprzedniego punktu – jak popatrzymy na kod Pythona, to można by rzec, że to w zasadzie po prostu zapisane polecenie po angielsku. Cóż bowiem znaczy słowo print? Nic innego jak drukuj/wydrukuj. 

Od razu można się domyślić, że programiście chodzi o to, by komputer coś wypisał na ekran. Podobnie sprawa się ma z innymi elementami języka, naprawdę, wystarczy znać angielski i już prawie możemy zrozumieć sporą część Pythona. W dużej ilości  języków jest podobnie, ale nie aż tak bardzo podobne są one do angielskiego, jak Python. Naprawdę, drugiego tak prostego języka jeszcze nie spotkałem, a trochę ich, przynajmniej pobieżnie, zdarzyło mi się używać – czy to JavaScript, Java, C, C++, Dart, Scala.

Jedynym językiem, który może konkurować z Pythonem prostotą, jest chyba C – ale to z racji tego, że core tego języka jest po prostu malutkie. Gdy przyjdzie nam do zarządzania pamięcią, wskaźników i innych, równie fajnych rzeczy z C, to zaczyna się tęsknić za Pythonem.

## Python językiem dynamicznie typowanym
Co to znaczy? Cóż, jeśli jesteś nowicjuszem w programowaniu, to możesz kompletnie nie mieć pojęcia, o co chodzi, ale to nic. 

W skrócie sprawa tyczy się faktu takiego, że w statycznie typowanych językach, podczas deklaracji zmiennych, należy podać, jakiego typu dane będzie ta zmienna przechowywała. Za przykład niech posłuży nam tutaj Java:

	:::java
	int someNumber = 123;

Zapis powyżej mówi ‘javie’, że chcemy utworzyć zmienną o nazwie `someNumber`, która będzie zawierała dane typu `int` – `integer`, czyli nic innego jak liczby całkowite. 

A co to w ogóle znaczy, że ma utworzyć zmienną? A no coś takiego:

	Słuchaj komputer, tu masz jakieś dane, (w tym wypadku ‘123’), zapamiętaj sobie tę wartość, zapisz ją gdzieś, i od teraz, za każdym razem, gdy napiszę w programie `someNumber`, to wiedz, że chodzi mi właśnie o wartość zapisaną w tamtym miejscu.

Próba zapisania innych danych do tej zmiennej, załóżmy, tablicy czy liczby rzeczywistej, nie skończy się zbyt dobrze lub po naszej myśli.

W Pythonie takich obostrzeń i wymogów nie ma. Po pierwsze, podczas inicjalizacji zmiennej, nie musimy podawać jej typu, a po drugie później, możemy bez problemu zmieniać rodzaj danych, jaki przechowujemy w danej zmiennej, zatem ekwiwalentem zapisu wyżej w Pythonie, byłby kod:

	:::python
	some_number = 123

Później bez problemu zaś, możemy wpisać sobie:
	
	:::python
	some_number = ‘Hi there’

Z czego to wynika, dowiesz się już w nieco innym artykule.

## Społeczność
Python ma jedną, naprawdę dużą zaletę. Jest to jego społeczność, która raz, że jest naprawdę pomocna, dwa, że jej rozmiar jest imponujący. Dzięki temu ilość dostępnych materiałów, poradników, bibliotek, frameworków i skryptów potrafi po prostu pozytywnie zaskoczyć.

Dzięki otwarto-źródłowej kulturze Pythona wiele niesamowitych narzędzi codziennie jest oddawanych w nasze ręce do użytku, zupełnie za darmo, tak po prostu. 

Powoduje to, że często nie musimy wymyślać koła na nowo – wystarczy import jakiejś biblioteki, którą ktoś już kiedyś napisał. Oszczędza to często czasu i zmartwień, pozwalając się skupić na tym, co w naszej implementacji ważne.

Poza tym, co zrobić, kiedy utkniemy w którymś miejscu pisania programu i nie wiemy co dalej, gdy napotkamy jakiś błąd, którego nie potrafimy rozwiązać? Cóż, z racji wieku samego Pythona oraz rozmiaru jego społeczności, można w większości przypadków założyć, że ktoś przed nami napotkał już podobny problem i zapytał o to w Internecie, lub opisał rozwiązanie danego problemu.

Ludzie chętnie dzielą się wiedzą wbrew pozorom. Dzięki temu nie musimy sami szukać rozwiązania godzinami, grzebiąc w dokumentacji, źródłach czy po prostu eksperymentując. Możemy najzwyczajniej w świecie kogoś zapytać, bo jest względnie dużo osób znających Pythona, albo znaleźć odpowiedź innych, którzy rozwiązali ten problem przed nami. Nie zawsze tak jest.

Jako kontr przykład, podam język Dart. Dość nowy język, niezbyt popularny, ogółem mała społeczność. Niemniej jednak czasem tworzę w tym języku i zdarza się nierzadko, iż napotykam jakiś problem, o którym informacji nie znajdę nigdzie, bo po prostu akurat nikomu innemu się nie przydarzył jeszcze, lub też nikt inny go nie opisał, więc muszę sam szukać rozwiązania, przeczesując dokumentacje, źródła i po prostu eksperymentując. 

Do tego czasami dochodzi niedogodność w postaci tego, że niektóre rzeczy, które np. w Pythonie czy Javie zostały już napisane przez kogoś innego, ładnie zapakowane w jakąś paczkę i rozpowszechnione do użycia, w Darcie niekoniecznie są i trzeba je napisać samodzielnie.

Podobnie, jeśli chodzi o samą naukę języka – materiałów jest znacznie mniej, często są one przestarzałe z racji tego, że Dart jest językiem ciągle się rozwijającym i to mocno, co tydzień wychodzą nowe wersje samego języka, a z racji niskiej popularności mało osób o nim pisze, jeszcze mniej tworzy o nim książki czy poradniki. To nie ułatwia nauki, zwłaszcza początkującym programistom. Dobrze, że chociaż dokumentacja jest całkiem dobra, co prawda nie tak dobra, jak dokumentacja np. Django, ale i tak – nie jest źle.

Dlatego też twierdzę, że społeczność Pythona jest jego największą zaletą i to ona, dosłownie, tworzy ten wspaniały język, czyniąc go tym, czym jest.

## Mnogość zastosowań
Python jest językiem ogólnego przeznaczenia. Można w nim stworzyć praktycznie wszystko, poza pewnym, raczej wąskim gronem zastosowań, do których kompletnie się nie nadaje i do których nie był projektowany. Niemniej jednak znając Pythona, możemy tworzyć aplikacje desktopowe, gry, aplikacje webowe, skrypty, emulatory, interpretery, kompilatory, aplikacje do obliczeń naukowych, aplikacje do wizualizacji danych i ich scrapowania z sieci, uczenie maszynowe i tak dalej. Lista jest naprawdę długa.

Oczywiście, do jednych zadań Python jest lepszy, do innych gorszy, bo na przykład rzadko zdarza się, że aplikacje desktopowe czy gry tworzy się w Pythonie, gdyż są do tego lepsze języki, ale w każdym razie, jest to możliwe i niezbyt trudne tak szczerze.

W tym, że Pythona można wykorzystywać do wielu rzeczy, pomaga to, o czym pisałem wyżej – czyli duża społeczność tworząca ogromne ilości bibliotek, frameworków i gotowych skryptów.

Pozwala to na wygodne użycie Pythona w różnych dziedzinach i to dzięki temu oraz samej prostocie języka, zdobywa on szturmem inne pola, poza webdevem, jak Data Science, Artificial Intelligence, Neural Networks czy na ogół obliczenia naukowe.

Po prostu czasem utworzenie programu w Pythonie sprowadza się tak naprawdę do zaimportowania jakiegoś modułu i dodaniu kilku drobnych komend mówiących mu, co ma dla nas zrobić. Prościej się nie da.

## Czytelność
Python projektowany był z czytelnością w zamyśle. W Pythonie przynależność kodu do danego bloku oznaczamy za pomocą wcięć, czyli nieco inaczej, niż w większości języków, gdzie zazwyczaj używa się do tego celu klamer lub nawiasów, ewentualnie słów kluczowych jak BEGIN czy END.

W Pythonie zaś liczą się wcięcia, których niepoprawne użycie powoduje błędy uruchomienia. Daje to efekt w postaci tego, że praktycznie każdy poprawny kod Pythona jest w miarę elegancki i łatwo czytelny. Oczywiście, istnieją odstępstwa od tej normy, ale mówię o ogóle ludzi, którzy stosują dobre praktyki czy standardy, takie jak PEP8, chociażby, o którym to pomówimy jeszcze później.

Gdy dodamy do tego prostotę i ekspresywność samego języka, to szybko wyjdzie nam na to, że kod w Pythonie jest często po prostu ładny, łatwy do odczytania, zmodyfikowania i przyjazny nowicjuszom.

Owszem, osobom przechodzącym z innych języków może się to wydać, przynajmniej na początku, dziwne, że w Pythonie używamy wcięć zamiast nawiasów czy klamer, ale jest to ładne rozwiązanie moim zdaniem. 

Dodatkowo brak w Pythonie jeszcze jednej rzeczy – średniki na końcu wyrażeń nie są konieczne. Mniej pisania i czystszy kod.

Oczywiście, czasem stosujemy średniki w Pythonie, niemniej jednak są to sytuacje rzadkie i z góry określone, naprawdę nieliczne.

To chyba też kolejna rzecz, która może dziwić programistów innych języków, chociaż w obecnych czasach nie jest to aż taka rzadka praktyka, by w języku nie były konieczne średniki.

Dlaczego w ogóle jednak czytelność jest ważna? Czas programisty jest drogi, nasze mózgi mają mocno ograniczone zdolności. Dobrze jest, gdy pewne rzeczy od razu widać, gdy nie musimy się nad czymś zastanawiać, bo jest to oczywiste. 

Jeśli program jest bardzo czytelnie napisany, to szybciej uda nam się go zrozumieć, a to jest krytyczne w tym, by wykonać zadanie.

## Automatyczne zarządzanie pamięcią
W Pythonie zarządzanie pamięcią odbywa się automatycznie – programista nie ma w tym udziału, robi to za nas sam język za pomocą takich mechanizmów jak Garbage Collector, dba on o odpowiednie uwalnianie zasobów i pamięci po obiektach, których już nie używamy.

Także nie musimy przejmować się takimi rzeczami jak alokacja i de-alokacja pamięci, jak to ma miejsce np. w C czy C++. Dlaczego to zaleta? Z racji tego, że niepoprawne zarządzanie pamięcią może doprowadzić do bardzo poważnych błędów, które narażają na szwank cały system, a to, by takowe nie wystąpiły, jest na głowie programisty i często nie jest to rzecz prosta, ba! Czasami banalne konstrukcje związane z alokacją i de-alokacją pamięci, rzeczy, które wydają się oczywiste, mają skomplikowane podłoża, które doprowadzają do poważnych błędów, jeśli źle zrozumiane.

W przypadku Pythona tak nie ma – programista na ogół nie ma nawet dostępu do bezpośrednich operacji na pamięci. Jest to bardzo mądre ograniczenie, przydatne w tego typu języku. Podobnie jest, chociażby w Javie.

## Bezpieczeństwo
Z wyżej wymienionego powodu Python jest też językiem względnie o wiele bezpieczniejszym niż wspomniany C czy C++. To oczywista zaleta.

## Wspieranie różnych paradygmatów programowania
Są języki, które wspierają mocno w zasadzie tylko jeden paradygmat programowania – jak np. Java, czy Smalltalk, które zaprojektowane są, by ściśle spełniać założenia paradygmatu obiektowego, czy Haskell, który jest językiem funkcyjnym i tylko funkcyjnym, ale są też takie jak Python, które wspierają wiele paradygmatów. O co z tym chodzi, tak po ludzku?

W Javie czy Haskellu masz nieco z góry narzucone to, jak masz ‘myśleć’ i w jakim kluczu powinieneś realizować rozwiązania pewnych problemów za pomocą kodu. Co to znaczy tak dokładnie, omówimy innym razem.

W Pythonie natomiast masz wolność wyboru. To ty sam decydujesz o tym, które podejście Ci się podoba i którego chciałbyś użyć. Uważam to za zaletę, gdyż ponownie - w jednych sytuacjach lepiej sprawdzają się jedne rozwiązania, w innych drugie. Mając wybór, możesz użyć tego właściwego i już.

## Wiele wspieranych platform
Jak już wspomniałem gdzieś wcześniej, Python obsługuje praktycznie dowolną używaną dziś platformę. Windows, Linux, AIX, IBM, iOS, OS/390, z/OS, Solaris, VMS, HP-UX. Co sobie kto zażyczy, prawie na pewno jest.

## Dojrzałość
Python jest językiem, który powstaje od roku 1991 – obecnie ma on 27 lat. Przez ten czas jego ekosystem, narzędzia i biblioteki zdążyły dojrzeć, przejść przez problemy wieku dziecięcego, które niektóre języki mają jeszcze przed sobą.

Znaczy to mniej więcej tyle, że Pythonowi zazwyczaj można ufać. O ile sam programista czemuś nie zawini, to język raczej nas nie zawiedzie, z racji tego, że przetrwał próbę czasu, a większość błędów i rażących bugów, została już dawno wyłapana, załatana.

Czy to znaczy, że to język idealny czy bez błędów? W żadnym razie. Niemniej jednak, z racji tego, że wykorzystywany był/jest on w setkach tysięcy ważnych aplikacji biznesowych, można śmiało stwierdzić, że pewną dozą zaufania można naszego węża obdarzyć.

## Prostota w integracji z innymi językami
Pythona dość łatwo można integrować z innymi językami na różnych platformach. Programy napisane w Pythonie zazwyczaj dość łatwo współpracują z innymi programami, napisanymi, chociażby w odmiennych językach.

Nie każdy język ma tę cechę, gdyż niektóre języki tworzą dość hermetyczną, specyficzną i zamkniętą kulturę, gdzie połączenie czy integracja ich z innymi środowiskami jest nad wyraz lub niepotrzebnie trudna.

Dodatkowym atutem Pythona jest to, że można pisać do niego ‘rozszerzenia’ w języku C czy C++, które będą działały o wiele szybciej, niż sam Python. Dzięki temu możemy mieć większość aplikacji napisaną w Pythonie – kod prosty, krótki i przyjemny tam, gdzie może być, a akurat jakieś wąskie jej gardło, które musi wykonywać się naprawdę szybko, w C czy C++. Raczej się tego nie stosuje, ale czasem pojawiają się różne, dziwne powody, dla których warto.

## Szybkość tworzenia kodu
Z racji prostoty i mnogości bibliotek w Pythonie, aplikacje, jak i sam kod, można w nim tworzyć wręcz błyskawicznie. To niewątpliwa zaleta, zwłaszcza w czasach, kiedy większość klientów chce, by ich produkt był zrobiony na wczoraj, a terminy zawsze gonią.

Mało tego, zazwyczaj ten zrobiony na szybko kod jest też dość przyzwoitej jakości.

No i faktem jest też, że nawet jeśli nie chcemy wykorzystać Pythona produkcyjnie, tylko stworzyć malutkie MVP – minimal viable product, czy jakiś prototyp po prostu, w Pythonie możemy zrobić to błyskawicznie, sprawdzić, czy dane rozwiązanie działa, jeśli tak, to cóż, zawsze można wersję produkcyjną zaimplementować w innym języku.

# Wady

## Python językiem dynamicznie typowanym
Chwila, moment, przed sekundą jeszcze, pisałem, że jest to zaleta. Co jest? Dynamiczne typowanie Pythona to zaleta, która umożliwia nam tworzenie pewnych świetnych mechanizmów, ale i również, w rękach niedoświadczonego programisty, wada. 

Umożliwia ona bowiem stworzenie kodu, który spowoduje kompletnie nieoczekiwane, trudne w debugowaniu błędy, którym można by zapobiec w języku statycznie typowanym, w którym to taki kod w ogóle by nie został skompilowany.

W Pythonie, czy innych dynamicznie typowanych językach, takiego mechanizmu nie ma, więc trzeba tutaj nieco uważać, by nie stworzyć błędu, który będzie później trudny do zdiagnozowania i zdebugowania. 

Oczywiście obecnie mamy narzędzia, które nam ułatwiają to zadanie, czy nawet upodobniają w pewnym stopniu Pythona do języków statycznie typowanych, gdyż istnieją, chociażby, adnotacje typów, pozwalające nam podawać to, jaki typ powinna mieć zmienna/funkcja. Niemniej jednak nie jest to obowiązkowy czy konieczny element języka i nie spowoduje on błędu podczas próby uruchomienia aplikacji, a jedynie co najwyżej ostrzeżenie, które można zwyczajnie zignorować.

Zatem dynamiczne typowanie jest nieco jak nóż, z jednej strony możesz użyć go do zrobienia czegoś fajnego, dobrego posiłku na przykład, a z drugiej strony, musisz żyć, ze świadomością, że należy zwracać szczególną uwagę, gdy się z nim obchodzisz, bo możesz się skaleczyć.

Jednakże czy z tego faktu należy rezygnować z korzyści i zastosowań, jakie on ma? Nie w tym wypadku.

## Wydajność
Jedno jest jasne – jeśli chodzi o kwestie ściśle wydajnościowe, Pythonowi daleko do miana króla.

Oczywiście, obecnie się to zmienia, ale sama natura Pythona jako języka interpretowanego sprawia, że nigdy nie będzie on tak szybki, jak kompilowany do natywnego kodu C, czy inne języki tego typu. Trzeba się z tym pogodzić i już.

Oczywiście nie twierdzę tutaj, że Python jest bardzo powolny, czy ociężały. Nie. Python nie jest wolny, wręcz przeciwnie – dzięki różnym optymalizacjom poczynionym na przestrzeni lat, Python naprawdę zyskał na szybkości i dziś śmiało stwierdzam, że jest to język wystarczająco szybki, ale mocno należy zaznaczyć, że nie jest to język najszybszy. I tyle.

A jak już o wydajności mówimy to i o rozmiarach wspomnę – wymagania sprzętowe Pythona sprawiają, że na niektórych platformach go po prostu nie uruchomimy. Są pewne obszary świata embedded, gdzie króluje C czy assembler, Python tam nie istnieje i nie ma co z tym dyskutować.

Oczywiście są też projekty jak RaspberryPi, gdzie faktycznie, Python również rządzi wszystkim.

Czyli jeśli chcesz pisać wysoce wydajne gry z piękną grafiką, czy też może wielowątkowe aplikacje, które w rzeczywistym czasie obsługują ogromne ilości obliczeń, albo może malutkie mikro-kontrolery, to cóż, Python nie jest raczej zbyt dobrym wyborem w takim razie.

W innych przypadkach raczej śmiało można Pythona używać i nie przejmować się szybkością wykonania/zasobami. Dlaczego? Otóż żyjemy w takich czasach, że czas serwera jest znacznie tańszy niż czas dewelopera. To znaczy lepiej, żeby język był może i kapkę wolniejszy, ale za to, jeśli pisze się w nim znacznie szybciej, to go wybieramy. Tak jest po prostu taniej, lepiej, zdrowiej.

Tak to przynajmniej się ma w znacznej większości projektów, gdyż tych, które nie mogą sobie pozwolić na to minimalne zwolnienie, jest niezbyt dużo.

## GIL
W Pythonie mamy coś takiego jak GIL – Global Interpreter Lock. Nie będę się tutaj rozwodził nad szczegółami tego mechanizmu, wystarczy, że będziesz wiedział, iż to przez niego Python nie do końca jest idealnym wyborem, kiedy przyjdzie nam rozmawiać o wielowątkowych aplikacjach, gdyż tylko jeden wątek w danym momencie może mieć dostęp do interpretera, bo GIL blokuje resztę.

Co prawda da się to teraz w miarę łatwo obejść, ale wciąż coś takiego pozostaje i trzeba nauczyć się z tym radzić.

## Wysoka ekspresywność
Ponownie, coś, co jest zaletą, jest również troszkę wadą. Dlaczego? Python ukrywa pewne rzeczy przed tobą, programistą, co powoduje, że nie zawsze wiesz, jak jest to zrobione ‘od podszewki’. Nie jest to do końca dobre, bo czasami przydaje się wiedzieć, jak pewne rzeczy zostały zaimplementowane i dlaczego akurat tak. 

Sporo to wyjaśnia. Prostym tego przykładem jest częste pytanie – dlaczego indeksujemy listy czy tablice od 0? Jeżeli jesteś programistą C/C++, najprawdopodobniej znasz odpowiedź.

Programiście języków wysokopoziomowych zaś nie zawsze ją znają. Nie bój się, jeśli nie wiesz, ten temat poruszymy w innym artykule.

Jest to jednak mała cena, jaką trzeba za płacić w porównaniu z tym, co ta ekspresywność i wysoka abstrakcja oferuje. Po prostu to problem łatwy do naprawienia – wystarczy trochę chęci, by poczytać kapkę więcej. A czas, który poświęcimy na zgłębienie tych różnych tematów, jest o wiele krótszy niż czas, który poświęcilibyśmy, pisząc swój program w języku o niższym stopniu abstrakcji/ekspresywności.
Python nie istnieje w świecie mobile
Aplikacje mobilne i Python to raczej dwa odmienne światy. Tak po prostu i już. Na pewno istnieją projekty próbujące coś w tym zakresie wskórać, ale nie ma co się łudzić.

## Python jest zbyt… wygodny
Często może być tak, że po tym, jak zaczniesz pisać w Pythonie, przesiadka na inne języki, gdzie pewne rzeczy musisz zrobić zupełnie inaczej, jest troszkę bolesna. To również potencjalna wada Pythona.


