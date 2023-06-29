Title: Backend to nie produkt
Date: 2018-10-30
Authors: Olaf Górski
Slug: backend-produkt
Description: Trochę inna perspektywa, aniżeli typowego backendowca - dziś stawiamy się w butach team playera.

Dziś chciałem kilka słów napisać nie o programowaniu per se, ale o programowaniu jako pracy.

Otóż jestem dość młodym developerem, mam plus minus, w tej chwili, około roku doświadczenia komercyjnego. To malutko. Lat na karku też za dużo nie mam, bo przecież nawet 20-stka mi jeszcze nie wybiła.

Dlatego też ciągle uczę się wielu rzeczy i jednocześnie widzę, że inni ludzie, z większym stażem, starsi ludzie, mają podobnie — również się uczą, stąd też wrażenie, że warto poruszyć temat, o którym dziś piszę, bo wydaje mi się, że niezależnie od wieku i stażu, dużo osób tego nie rozumie.

# Małe oświecenie

Otóż niedawno zaświeciła mi się w głowie lampka — zadaniem zespołu jest stworzenie rozwiązania, produktu, czegoś, co zadowoli klienta, spełni jakiś cel, rozwiąże dany problem. No właśnie. Co w związku z tym? Piszę to z perspektywy backend developera, otóż: backend nie jest produktem sam w sobie. Frontend też nie. O co mi chodzi dokładnie?

Do pewnego czasu miałem podejście w stylu — nic mnie nie obchodzi, że funkcjonalność X nie została dowieziona na czas/nie działa/są problemy z implementacją — ja swoje zrobiłem, backend działa i jest piękny, to frontend/qa/ktokolwiek nie dopiął i produkt nie działa. To kompletnie błędne podejście, zrozumiałem to.

Po części pomogło zrozumieć mi to, jak wyglądał proces dowożenia aplikacji w naszym zespole, oraz jakie problemy napotykaliśmy po drodze, które wynikały głównie właśnie przez takie myślenie, a z drugiej strony, zostałem lekko skierowany, by spojrzeć na ten problem w moim myśleniu, przez starszego stażem pracownika. Tu też fajna sprawa — zamiast od razu o czymś mówić, pozwolono mi spróbować czegoś na własną rękę, przemyśleć sprawę, a potem dojść do poprawnego rozwiązania samodzielnie — szacunek za to, jeśli to czytasz :)

# Jak powinno być

Kończąc dygresję — gdy piszemy backend/frontend, cokolwiek, nie możemy myśleć tylko o tym, jaki on będzie fajny, piękny i niesamowity z perspektywy czysto backendowej/frontendowej. Musimy pomyśleć, jak innym będzie się współpracowało z kodem, serwisem, który tworzymy. Czy rozwiązanie, które akurat tworzymy, będzie wygodne dla frontu? Czy wszystko jasno opisałem tak, by osoba pisząca integrację z API nie miała już żadnych pytań, bo wszystko zostało klarownie opisane w dokumentacji, dodatkowych notatkach? Może mogę im pomóc w inny sposób, rozmawiając z nimi, przed w trakcie i po implementacji?

Dobre pytania, które, uważam, warto przemyśleć.

Wydaje mi się, że trzeba uważać na to, by nie wpaść w taki swego rodzaju egoizm, gdzie wydaje nam się, że nasza praca jest najważniejsza, my ją wykonaliśmy dobrze, to ktoś inny jest kompletnie winien i koniec, my mamy czyste ręce.

To tak nie działa.

Oczywiście, są odstępstwa od reguły — ktoś celowo sabotuje prace, cokolwiek, ale to tak rzadkie sytuacje, że nie warto o nich wspominać.

Programowanie to zazwyczaj praca zespołowa, a kluczowym elementem pracy zespołowej jest... no właśnie praca zespołowa. Zespół jest bardzo ważny, tak samo, jak ważne jest to, by poszczególne 'elementy' zespołu, dobrze współgrały. Dzięki temu cały mechanizm będzie świetnie działał. A o to chodzi.

Nie zrozumcie mnie źle — nie mówię tu o tym, że cały czas trzeba robić jakiś 'team building', 'integracje', 'meetingi', 'spotkania' czy inne cholerstwa wciskane często na siłę. Nie. Nie jestem adwokatem scruma czy innych podobnych albo mniej podobnych, metodologii dziwnych. Nie.

# Apel

Takim zasadniczym celem tego wpisu jest jedynie zaszczepienie takiej myśli, swoista prośba bym wręcz powiedział. Brzmi ona następująco: podczas tworzenia swojej części kodu, serwisu, czegokolwiek, pomyśl o osobie, która będzie twój kod czytała, która będzie korzystała z twojego API, może się skonsultuj z nią, opisz wszystko, udokumentuj. Postaw się na miejscu tego fronta, backenda. Być może jesteś w stanie zrobić coś inaczej, co wciąż będzie technologicznie dobrym rozwiązaniem, a pozwoli drugiej stronie zrobić coś szybciej, przy czym nie spowolni to twojej pracy? Kto wie.

Takie tylko pytanie. Warto je sobie chyba zadać.

Oczywiście nie ma co przesadzać w drugą stronę — tworzenie bubla programistycznego, bo front poprosił czy cokolwiek — nie, to zły kierunek. Jak zwykle — trzeba znaleźć jakiś środek, bo przesadzanie w którąkolwiek ze stron jest złe.

Konkludując już: nie bądźmy takimi egoistami. Backend nie jest produktem, frontend też nie. Możesz mieć state-of-the-art backend/front/stronę devopsową, ale jak ten inny komponent nie będzie działał, to produkt będzie ssał.
