Title:  Gothic 2 Noc Kruka na Linuxie (Manjaro)
Date:   2016-07-16
Authors: Olaf Górski
Slug: gothic2-noc-kruka-na-linux
Description: Jak uruchomić gothic 2 noc kruka na linuxie za pomocą wine - instrukcja krok po kroku. 

Naszła mnie ostatnio wielka ochota na to, żeby pograć sobię w jedną z pierwszych gier, w które kiedykolwiek grałem - Gothic 2. Wielu wspomina tę grę z sentymentem i uważa ją za jedną z lepszych. Ja również.
Pojawił się jednak problem - przecież mam linuxa, w nic nie pogram, nie? No właśnie nie do końca.

# Proste rozwiązanie

Przeglądając sieć w poszukiwaniu relacji z prób odpalenia Gothic 2 na linuxie, spotkałem się raczej z pozytywnymi odpowiedziami, zatem się zdecydowałem spróbować. Po szybkich zakupach na [cdp.pl](https://cdp.pl/), gdzie za Gothic 2 razem z dodatkiem Noc Kruka, zapłaciłem jakoś 8 czy 9 złotych, szybko grę pobrałem i zabrałem się za próbę jej instalacji.

# Co będzie potrzebne

Niżej znajdują się dwa narzędzia, które będą nam potrzebne, obok napisałem jeszcze wersje, z których ja korzystałem, gdyż czasami zdarza się, że gra dobrze działa na jednej wersji Wine a źle na innej, ale tutaj chyba takiego problemu nie ma. Niemniej jednak dla pewności podam użyte przeze mnie wersje na `Manjaro Linux, linux44`

```
    
    wine 1.9.12-1
    winetricks 20160622-1
```

Instalacja tych programów jest raczej banalna, można to zrobić czy to przez graficzny menadżer, czy też klepiąc w konsoli (w przypadku manjaro z menadżerem pakietów pacman):
```
    
    sudo pacman -S wine winetricks
```

i gotowe. Co prawda na innych dystrybucjach sytuacja może być kapkę trudniejsza, ale w takim razie wystarczy poszukać w googlach.

# Wine?

Wine to warstwa kompatybilności między Linuxem a Windowsem pozwalająca na uruchamianie części programów Windowsowych na Linuxie. Winetricks zaś to przydatne narzędzie do instalacji różnych pakietów do Wine.

# Instalacja

Instalacja poszła dość gładko - nieco wolniej niż na Windowsie, ale mimo wszystko dość gładko. Dalej, dalej i gotowe. Ważnym jest jednak, by na końcu odznaczyć checkbox oferujący uruchomienie gry. Na razie nie możemy tego zrobić. Teraz momencik. Gdzie w ogóle nasza gra się znajduje? Skrótu na pulpicie nie ma - jak ją uruchomić.

# Lokalizacja

Domyślnie folder Wine znajdować się będzie w katalogu domowym użytkownika pod nazwą `.wine`, jednakże zazwyczaj nie jest on widoczny - należy się posłużyć magiczną kombinacją klawiszy `CTRL+H`, która to włączy wyświetlanie ukrytych folderów w naszym menadżerze plików. Tak przynajmniej jest, jeśli korzystacie z Thunara. W innych menadżerach sytuacja może wyglądać inaczej.

Po przejściu do katalogu `.wine`, sprawa jest już prosta i tutaj chyba każdy poradzi sobie sam.

# Pierwsze uruchomienie...

Gdy znajdziemy już katalog Gothica i zrobimy sobie do niego skrót, żeby następnym razem tyle nie klikać, to zabieramy się za odpalanie gry.

# ...i pierwsze problemy

Na początku powinien przywitać nas komunikat o zatrzymaniu się procesu `Vdfs32e.exe`. Nie ma co się tym jednak przejmować - gra mimo tego się uruchamia, mamy menu jest cacy.

Problemy pojawiać się zaczną jednak po zaczęciu nowej gry - u mnie dosłownie chwilę po odpaleniu gra się crashowała. Winowajcą jest tu muzyka i moduł `directmusic`, którego to musimy doinstalować za pomocą `winetricks`, klepiąc:
```
    
    winetricks directmusic
```

i próbując ponownie. Co to jednak? Znowu błąd. Tym razem gra się nawet nie uruchamia! To dlatego, że musimy zrobić jeszcze jedno, a mianowicie 'wyłączyć' jedną z zainstalowanych przed chwilą bibliotek. 

Otwieramy konsolę i wpisujemy:
```
    
    winecfg 
```
następnie należy przejść do zakładki Libraries, gdzie należy usunąć moduł `dsound`, który to powoduje nasz błąd.

Ewentualnie można jeszcze wyłączyć kompletnie muzykę i też problem zostanie rozwiązany - jak to zrobić?

Przechodzimy do folderu Gothica, katalog `System`, otwieramy plik `gothic.ini` i edytujemy
```
    
    musicEnabled=1
```
na
```
    
    musicEnabled=0
```
myślę jednak, że lepiej już jednak tę muzykę mieć. Klimatyczna jest, nie ma co.

Teraz już chyba wszystko gotowe? No nie. Jeszcze nie. 

# Wyższa rozdzielczość w Gothic 2

Jeśli tak jak ja korzystacie z ekranu o nieco większej rozdzielczości np. 1920x1080, to będziecie mieć problem - w menu Gothic podczas ustawiania obrazu, nie ma dostępnych wyższych rozdzielczości widescreen. Co teraz?

Rozwiązanie jest proste.

Ponownie przechodzimy do folderu, gdzie zainstalowaliśmy Gothica, wchodzimy do folderu System i otwieramy plik `gothic.ini`, następnie znajdujemy pozycję
```
    
    extendedMenu=0
```
i zmieniamy na
```
    
    extendedMenu=1
```
teraz możemy już cieszyć się Gothiciem z muzyką i w pełnej rozdzielczości naszego ekranu.

To tyle. Gra działa dość stabilnie i płynnie - nie spotkałem się z jakimiś problemami do tej pory, a już sporo przegranych godzin zleciało, także polecam.


