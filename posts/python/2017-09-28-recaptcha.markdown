Title: Dodawanie ReCaptcha do appki we Flasku
Date: 2017-09-28
Authors: Olaf Górski
Slug: recaptcha-flask
Description: Dziś kilka słów o tym, jak walczyć ze spamem prostym sposobem w aplikacjach korzystających z Flask

Jeśli mamy aplikację, która udostępnia wysyłanie wiadomości, komentarzy czy czegokolwiek podobnego, istnieje szansa, że prędzej czy później zaczniemy mieć problemy ze spamerami. Jak sobie zatem z tym prosto poradzić?

Na pomoc przychodzi nam Google i ReCaptcha - słynne 'Nie jestem robotem'.

Jak dodać ochronę ReCaptcha do naszej aplikacji? W prosty sposób.

Zacznijmy zabawę. Na początku musimy oczywiście zainstalować wymagany moduł.

Fajnie jest, kiedy listę wymaganych zależności trzymamy sobie w przeznaczonym do tego pliku, najczęściej requirements.txt, gdzie wypisane są wszystkie potrzebne biblioteki czy innego programy. Jeśli takowy posiadasz, to dodaj do niego flask-recaptcha. Dlaczego warto go mieć? Cóż, łatwość instalacji i przenośność. Następnym razem, kiedy będziesz chciał uruchomić appkę gdzie indziej możesz po prostu wpisać pip install -r requirements.txt a pip sam sobie wszystko odczyta i
zainstaluje. Chyba wygodniej niż ręcznie się z tym męczyć, czy klikać w IDE, prawda?
Jeśli cie nie przekonałem, to po prostu doinstaluj sobie ten moduł za pomocą pipa

```
pip install flask-recaptcha
```
Dobra, idziemy dalej.

Teraz musimy dodać kilka linijek do pliku `view.py` lub `app.py` jak tam zwał tak zwał, zależy jak nazwałeś plik i jak skonstruowana jest twoja applikacja.

app.py:

```
    from flask import Flask
    from flask_recaptcha import ReCaptcha

    app = Flask(__name__)
    recaptcha = ReCaptcha(app=app)
```

Jeżeli już wcześniej zadeklarowałeś obiekt app, to raczej nie ma co tworzyć go od nowa.

Teraz zmodyfikować musimy szablon formy, którą chcemy chronić.

```
    <form method="post" action="/submit">
        <!--- tutaj powinny znajdować się twoje inputy itd. -->
        {{ recaptcha }}
        <!--- tutaj submit button -->
    </form>
```
I gotowe.
Teraz musimy jedynie zweryfikować czy captcha nam zwróciła poprawne zdanie testu.

app.py/views.py or sth
```
    
    from flask import Flask
    from flask_recaptcha import ReCaptcha

    recaptcha = Recaptcha()
    recaptcha.init_app(app)
    @route("/submit", methods=['GET', 'POST'])
    def submit():
        if request.method == 'POST':
            if recaptcha.verify():
                # co zrobić w razie poprawnej odpowiedzi
                # najpewniej zapisać <form> do db lub wysłać wiadomość
                pass
            else:
                flash('Niepoprawny captcha!', 'danger')
```
Teraz musimy skonfigurować recaptche jedynie i wszystko będzie działało.
Konfiguruje się ją przez standardowe API configu Flaska.

Do skonfigurowania mamy następujące konieczne właściwości:
```
RECAPTCHA_ENABLED - True albo False

RECAPTCHA_SITE_KEY - klucz publiczny

RECAPTCHA_SECRET_KEY - klucz prywatny
```

Ważna uwaga. Trzymanie kluczy prywatnych w takiej formie, zwłaszcza jeśli korzystasz w githuba, nie jest mądre. O tym jak bezpiecznie trzymać różne hasła/klucz w aplikacji flaska musisz sobie sam poczytać.
Następujące pola są nieobowiązkowe:

```
RECAPTCHA_THEME - kolorystyka foremki 'dark' lub 'light', 'light' jest domyślne

RECAPTCHA_TYPE - rodzaj zabezpieczenia - może być to 'image' obrazek, lub 'audio' dźwięk do odsłuchania, domyślnie jest 'image'

RECAPTCHA_SIZE - rozmiar obrazka, 'normal' lub 'compact', domyślnie normal

RECAPTCHA_TABINDEX - (int) dla tych, którzy używają tabindexu
```

Jak to wygląda w mojej appce?

``` 
    RECAPTCHA_ENABLED = True
    RECAPTCHA_SITE_KEY = 'twoj_klucz_publiczny_z_api_recaptcha'
    RECAPTCHA_SECRET_KEY = 'twoj_klucz_prywatny_z_api_recaptcha'

    app = Flask(__name__)
    app.config.from_object(__name__)

    recaptcha = ReCaptcha()
    recaptcha.init_app(app)
```
Reszte przykładowego kodu możecie znaleźć chociażby [tu](https://gitlab.com/olafgorski/bloggo/blob/master/app.py)

Skąd wziąć klucz publiczny i prywatny?

[Stąd](https://www.google.com/recaptcha/)
Obsługa tej strony jest raczej nieskomplikowana. 
Mała uwaga: jeśli chcemy korzystać z recaptchy na naszym lokalnym środowisku developerskim, jako domenę wystarczy podać localhost.

Warto wspomnieć, że jest możliwość wybrania 'niewidzialnej' weryfikacji, poczytajcie o tym, bo to sprawi, że wasze recaptcha w ogóle nie będzie widoczne dla użytkownika, nie wymagając od niego żadnej akcji, a i tak spełni swoją funkcję dzięki algorytmom Google rozpoznającym zachowanie usera.

Tyle na dziś