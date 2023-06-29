Title: Jak ustawić automatyczne mountowanie dysku w linuxie?
Date: 2018-06-25
Authors: Olaf Górski
Slug: mount-linux
Description: Krótki opis tego jak permanentnie rozwiązać problem mountowania dysku na linuxie.

Ostatnio przy przesiadce na nowy sprzęt, który posiadał dwa dyski, natknąłem się na problem.

Jak wiadomo, dysk, na którym była partycja systemu - w tym wypadku była to dystrybucja Manjaro, oczywiście była normalnie rozpoznowana i przetwarzana, jednak jeśli chodziło o drugi dysk, to niekoniecznie.

Zasadniczo też mi się on pojawiał w menadżerze plików, lecz nie był zamontowany tam, gdzie tego chciałem to raz, a dwa, że odpalany był z opóźnieniem i nie był traktowany jak 'dysk', ale urządzenie zewnętrzne, przez co takie programy jak Megasync czy inny software do tworzenia backupów, miał problem z rozpoznaniem lokalizacji po restarcie i tak dalej.

Jak zatem to rozwiązać?

Bardzo prosta sprawa jak się okazało.

Najpierw trzeba znelźć UUID naszego urządzenia. Jak możemy to zrobić?

`sudo blkid`

Z wyniku tego polecenia musimy skopiować sobie UUID.

następnie trzeba zedytować plik fstab, znajdujący się zazwyczaj w `/etc/fstab`

dowolnym edytorem tekstu, czyli załóżmy

`sudo nano /etc/fstab`

teraz już tylko na sam dół wystarczy dorzucić:

`UUID=12ef3dd3-45c0-4f95-a363-61ft321a09ff /your/path ext4 defaults  0      2`

pamiętajcie tylko o zmianie UUID na swoje.

Teraz utworzyć należy folder, który podaliśmy w fstab.

Czyli:

`mkdir -p /your/path`

paramter -p zadba o to, by cała ścieżka została utworzona a nie tylko jeden folder.

Pamiętać trzeba też o tym, by ustawić odpowiednie prawa dostępu/zapisu dla zamontowanego folderu. Jeśli chcemy by absolutnie wszyscy mieli dostęp do zapisu i odczytu (niezbyt bezpieczne), możemy to uzyskać za pomocą:

`sudo chmod 777 /your/path`

chociaż chyba mądrzej będzie ustawić 755, co pozwoli właścicielowi na odczyt/zapis/uruchomienie a reszcie tylko na te dwa ostatnie. 
Wtedy z kolei trzeba pamiętać, żeby właściciel był odpowiedni - 

`sudo chown user:group /your/path`

Na sam koniec, by odświeżyc nasze zmiany:

`sudo mount -a`

Krótki wpis, tyle na dziś.
