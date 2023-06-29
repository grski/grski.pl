Title: Jak jedna cyferka może zepsuć aplikację - studium
Date: 2018-05-19
Authors: Olaf Górski
Slug: cyfra
Description: Kilka godzin pracy poświęcone temu, żeby zmienić jedną cyfrę? Czasami tak bywa - studium przypadku.

Ostatnio w pracy trafił mi się, moim zdaniem, dość ciekawy przypadek do zbadania. Otóż otrzymaliśmy od klienta zgłoszenie, że przestały działać pliki dla wybranych zasobów - klienci nie mogli uzyskać dostępu do miniatur, informacji, czasami były problemy z samym pobieraniem i tak dalej, ogółem mejdżor fakap, trzeba to naprawić asap.

Cóż, siadłem zatem do tego.

Moje pierwsze podejrzenie padło na mnie samego. Dlaczego? Otóż kilka miesięcy temu, wyraźnie pamiętam, że majstrowałem coś przy tym, jak pliki są zwracane i tak dalej, w każdym razie, byłem praktycznie pewny, że to moja sprawka.

Wyglądałem troszkę tak, jak Nawałka po mundialu.

# Uff

Niemniej jednak, po przeanalizowaniu zgłoszeń, okazało się, że problem zaczął pojawiać się nawet, zanim ja cokolwiek w tym konkretnym module zmodyfikowałem, zatem musiałem wykluczyć możliwość, że była to moja sprawka.

Hmm no dobra, co teraz. No nic, ruszmy dalej, może coś się ciekawego okaże.

Przeglądając kod, nie znalazłem niczego ciekawego, żadnych zmian, nic. Cóż zatem mogło spowodować występowanie problemu i to nagle?

Cóż, by znaleźć odpowiedź na to pytanie, musiałem przyjrzeć się temu, jak serwowane są pliki w aplikacji klienta.

Otóż hostowane są one na zewnętrznych serwerach, zależnie od regionu, które sobie wszystko przetwarzają, dbają o uwierzytelnianie i tak dalej, a następnie zwracają żądany content.

Okej. No to pora się przyjrzeć temu procesowi bliżej.

# Ścieżka pliku

Pierwszą cechą wspólną, jaka się wyłoniła u wszystkich zgłoszonych problematycznych plików, było to, że pochodziły one z jednego obszaru - znaczy to tyle, że wszystkie były serwowane przez jeden serwer. Dobrze, to już jakaś wskazówka.

Spróbowałem zatem, odtworzyć ścieżkę, jaką typowy user i jego request obiera, i sprawdzić zachowanie aplikacji w podczas takowej ścieżki. Pogrzebałem sobie w kodzie źródłowym, znalazłem kod, który odpowiada za obsługę wyświetlania i dostarczania linków do contentu dla użytkowników i wygenerowałem sobie zwykły url do danego zasobu, i faktycznie - kompletnie się on nie wyświetla, otrzymuje jakiś błąd. Ale moment. Spójrzmy na samego requesta, cóż się tam w nim dzieje.

W responsie nie pojawia się żaden błąd, zatem serwer nie widzi żadnego problemu i zwraca normalnego responsa. Hmmm, ciekawe...

# Co się okazuje?

Okazuje się, że mimo tego, iż request, jakiego walimy, ewidentnie powinien zwracać nam responsa z plikami video, to z jakiegoś powodu, zamiast zwracać tego, co powinien, response ma typ... obrazka.

Sprawdźmy, co jest w body responsa. Najpierw rozmiar - w porównaniu z oryginalnymi plikami mniej więcej się zgadza. A co mówią nagłówki?

Po małej analizie okazuje się, że mimo tego, iż w typie responsa znajduje się obrazek, to serwer w body responsa serwuje nic innego jak dany plik video, który jeśli go zapisać, jest poprawnym filmem, hm ciekawe. I wiadomo teraz, dlaczego content nie jest w ogóle wyświetlany - jak przeglądarka/aplikacja ma wyświetlić film, skoro response każe wyświetlać jej ten content jako obrazek?

# Zajrzyjmy do bazy

Postanowiłem zatem przejrzeć bazę danych w poszukiwaniu innych plików wideo, by zobaczyć, jaki mimetyp dla nich serwer wygeneruje.

Cóż, moje poszukiwania szybko pokazały mi, że serwer bez problemu identyfikuje pliki typu .avi czy .mpa jako video i zwraca je z poprawnym mimetypem, umożliwiając przeglądarce właściwe zachowanie. Skąd to zachowanie?

 # Format?

Cżyżby to wina formatu? No bo .avi działa, .mpa też, ale okazuje się, że pewne pliki .mp4 już nie.

Bynajmniej, gdyż udało mi się znaleźć pliki .mp4 działające - to nie to.

A jak jest na innych serwerach? Na innych wszystko gra - brak żadnego pliku .mp4, który by nie działał z nieznanych powodów. Jeszcze ciekawsze.

# Jak plik wygląda na dysku

Przypomniałem sobie troszkę jednak o tym, jak pliki w ogóle są zapisywane na dysku, jak można rozpoznać, że dany plik jest akurat danego typu - bynajmniej nie po rozszerzeniu i pomyślałem, że przecież to może być to - coś być może w nagłówkach plików jest nie tak i stąd serwer nie rozpoznaje poprawnie typu. Może gdzieś przy zapisie coś idzie nie tak. Porównałem zatem dwa pliki w tym samym formacie za pomocą HxD - jeden działający, drugi nie.

Niestety, mimo drobnych oczywistych różnic w kodzie heksowym, tam, gdzie powinno być to samo, to wszystko się zgadzało, mimo tego, że na początku wydawało mi się, iż znalazłem w strukturze pliku błąd.

Kurczę.

Wpadłem zatem na inny pomysł - sprawdzę to innym programem, mediainfo, zobaczymy czy on poprawnie rozkoduje informacje o formacie pliku i tak dalej.

No i tutaj znowu zdziwienie - mediainfo bez problemu rozczytało plik poprawnie, wszystkie informacje o nim. Dlaczego zatem, skoro inne programy poprawnie rozpoznają pliki jako video, to serwer tego nie robi? Nie wiem, no ale nic, popróbuję na innych, może tu mi się poszczęści.

I zacząłem tak przeglądać i przeglądać. Nic. Kompletnie nic. Nagle...

# Eureka

...dostrzegłem jednak pewien fakt. Otóż każdy działający, poprawnie rozpoznawany plik był kodowany, przy użyciu pewnej biblioteki w wersji załóżmy 2.11.2 lub starsze, natomiast wszystkie te pliki, które zostały zakodowane tą biblioteką w jakiejkolwiek późniejszej wersji, były błędnie rozpoznawane przez serwer. I tu się objaśniło wszystko.

Spojrzałem na stronę tej biblioteki i co się okazało? Mniej więcej w tym samym czasie, kiedy zaczął pojawiać się problem, miała miejsce premiera nowej wersji biblioteki. To utwierdziło mnie w przekonaniu, że ktoś gdzieś zrobił update jednej biblioteki na jednym tylko serwerze, nie biorąc pod uwagi faktu, że kod aplikacji działającej na serwerze wykorzystuje zależności akurat w pewnej specyficznej wersji i wersji starszych, oraz to do nich jest przystosowany, przez co plików kodowanych nowszymi wersjami nie wykrywa poprawnie a każdy plik, który ląduje na serwerze, zanim zostanie zaserwowany użytkownikom, jest przetwarzany właśnie za pomocą akurat zainstalowanej biblioteki.

# Podsumowanie

Mimo tego, że de facto samego programowania tu nie było, to przyznam, że i tak świetnie się bawiłem podczas wykonywania tego zadania. Trochę jak detektyw odkrywający tajemnice wielkiej zbrodni.

Pokazało mi ono również, że wiedza ogólna, o której to tak często się mówi 'a po co mi to', czasem się przydaje.

Podsumowując, czasami wystarczy zmienić jedną cyferkę z 2.11.2 na 2.11.3, by nagle coś gdzieś przestało działać a praca developera to nie zawsze tylko klepanie nowych landing pageów.

