# KI-Klassifikation · Ein Neuron (Perzeptron) · lineare Trennung

Ein einzelnes künstliches Neuron zum Zuschauen und Ausprobieren: Es bildet aus zwei Merkmalen eine gewichtete Summe und entscheidet mit einer Sprungfunktion, zu welcher von zwei Klassen ein Punkt gehört. Alle Punkte mit der Summe 0 bilden eine **gerade Trennlinie**. Die Gewichte lassen sich erst per Hand einstellen, dann sieht man zu, wie die **Perzeptron-Lernregel** sie Punkt für Punkt selbst findet – oder, beim XOR, eben nicht.

Erstellt für den Unterricht an der Jakob-Preh-Schule ([bsnes.de](https://www.bsnes.de)) im Fach Konzepte der KI (KoKI), Skript Kap. 5.6 Neuronale Netze, Lerngebiet 1 und 2.

**Live-Version:** [Hier direkt anschauen](https://flowthetensor.github.io/LS-NNLineareseparation/)

---

## Worum geht es?

Ein Neuron hat hier zwei Eingänge x₁ und x₂ (die beiden Merkmale) und einen dritten Eingang, der immer 1 ist (für den **Bias** b):

```
Summe        Σ = w₁·x₁ + w₂·x₂ + b
Aktivierung  ŷ = +1, wenn Σ > 0, sonst −1      (Sprungfunktion)
Trennlinie   Σ = 0
```

Die Gewichte w₁ und w₂ drehen die Trennlinie, der Bias verschiebt sie. **Ohne Bias** geht die Linie immer durch die Mitte (0 | 0) – bei manchen Beispielen reicht das nicht.

Die Merkmale werden vorher auf −1 … +1 umgerechnet (**normiert**), damit beide gleich viel zählen und die Gewichte vergleichbar sind. Klasse 0 bekommt den Zielwert t = −1, Klasse 1 den Zielwert t = +1.

In der roten **Beispiel-Leiste** unter der Kopfzeile stehen fünf Beispiele zur Verfügung. Reiter 1 ist das Beispiel aus dem Skript, die Reiter 2 und 5 passen zu den Praxiswerkstätten mit MemBrain, die Reiter 3 und 4 kommen aus der Industrie.

> Die Industrie-Werte sind simuliert und an eine typische 24-V-Modellanlage für Industrie 4.0 angelehnt.

### 1. Skript · Enzian und Mohn (Standard)

Die zehn Pflanzen aus der Tabelle im Skript (und im Notebook NN1), fest und unverändert:

| Pflanze | Länge | Breite | | Pflanze | Länge | Breite |
|---|---|---|---|---|---|---|
| Enzian 1 | 0,7 | 0,3 | | Mohn 1 | 0,9 | 1,0 |
| Enzian 2 | 0,2 | 0,9 | | Mohn 2 | 0,6 | 0,8 |
| Enzian 3 | 0,5 | 0,2 | | Mohn 3 | 0,5 | 1,2 |
| Enzian 4 | 0,2 | 0,4 | | Mohn 4 | 0,8 | 0,6 |
| Enzian 5 | 0,3 | 0,6 | | Mohn 5 | 0,7 | 1,3 |

Wie im Skript liegt die Breite auf der x-Achse und die Länge auf der y-Achse. Die Klassen sind linear trennbar, aber **nur mit Bias**: Keine Linie durch die Mitte trennt alle zehn Pflanzen richtig.

### 2. Logik · ODER

Die vier Muster der ODER-Funktion – dieselbe Aufgabe wie in der Praxiswerkstatt **MemBrain (lsP)**. Linear trennbar, auch hier wird der Bias gebraucht.

### 3. Sortierstation · Material

Ein induktiver Sensor (0 … 10 V) und ein Reflexionssensor (0 … 100 %) messen jedes Werkstück. Metallteile liefern bei beiden höhere Werte als Kunststoffteile. 35 Werkstücke, klar getrennt. Hier klappt die Trennung **auch ohne Bias**, weil die Grenze ungefähr durch die Mitte läuft.

### 4. Förderband · Überlast

Am Förderband-Antrieb M1 werden Beladung (0 … 10 kg) und Motorstrom (0 … 1,6 A) gemessen. Mit mehr Beladung steigt der Strom. Überlast (schwergängig, blockiert) erkennt man daran, dass der Strom **für die jeweilige Beladung** zu hoch ist. Die Grenze liegt also schräg: Beide Gewichte und der Bias werden gebraucht. 36 Messungen.

### 5. Logik · XOR (nicht linear trennbar)

Die vier Muster der XOR-Funktion, wie in der Praxiswerkstatt **MemBrain (nlsP)**. Keine gerade Linie trennt die beiden Klassen. Die Lernregel korrigiert endlos hin und her und hört nach 40 Epochen auf. Lösung: versteckte Neuronen mit nicht-linearer Aktivierung – weiter in MemBrain und in der Lernsituation **KI-Qualitätsprüfung: Neuronales Netz**.

## Die Perzeptron-Lernregel

```
für jede Epoche:
  für jeden Trainingspunkt (x₁, x₂) mit Zielwert t:
    ŷ = Sprung(w₁·x₁ + w₂·x₂ + b)
    e = t − ŷ                       (0, +2 oder −2)
    w₁ ← w₁ + η·e·x₁
    w₂ ← w₂ + η·e·x₂
    b  ← b  + η·e·1
bis eine Epoche keinen Fehler mehr hat
```

- Liegt das Neuron richtig, ist e = 0 und nichts ändert sich.
- Liegt es falsch, kippt die Linie ein Stück in Richtung des Punktes. Wie weit, legt die **Lernrate η** fest.
- Sind die Daten linear trennbar, findet die Lernregel nach endlich vielen Epochen eine fehlerfreie Linie. Welche, hängt von den **Startgewichten** und der Reihenfolge ab.
- Das Feld **„Fehler je Epoche“** zeigt, wie viele Korrekturen in jeder Epoche nötig waren.

## Zwei Verfahren

| Verfahren | Was man tut |
|---|---|
| ① Gewichte per Hand | w₁, w₂ und b mit den Reglern im Neuron-Feld einstellen. Ein Klick auf einen Punkt rechnet ihn im Neuron nach. |
| ② Perzeptron-Lernregel | mit → Punkt für Punkt lernen lassen. Das Erklärfeld zeigt die eingesetzte Rechnung, das Neuron-Feld die Werte vor der Anpassung, das Diagramm die kippende Linie. |

## Bedienung

| Aktion | Wirkung |
|---|---|
| Beispiel-Leiste (Reiter 1–5) | Enzian/Mohn, ODER, Sortierstation, Förderband oder XOR |
| **→** oder „Nächster Punkt“ | ein Lernschritt (ein Trainingspunkt) |
| **E** oder „⏭“ | bis zum Ende der laufenden Epoche springen |
| **Leertaste** oder „Automatisch“ | bis zum Ende durchlaufen lassen / anhalten |
| **R** oder „Neu starten“ | wieder mit den Startgewichten beginnen |
| Regler w₁, w₂, b | Gewichte per Hand einstellen (Verfahren ①) |
| „Bias b verwenden“ | Bias ein- oder ausschalten (aus: b = 0, Linie durch die Mitte) |
| „Neue Startgewichte“ | andere zufällige Startgewichte |
| Klick auf einen Punkt | Punkt im Neuron-Feld nachrechnen (Verfahren ①) |
| Maus über einem Punkt | Merkmale, normierte Werte, Σ und Ergebnis |
| Mond / Sonne oben rechts | dunkles oder helles Farbschema; die Wahl gilt für alle Lernsituationen |

Unter dem Diagramm lassen sich die **Halbebenen** (wo das Neuron +1 bzw. −1 sagt) und die Markierung der **Fehlklassifikationen** (gelbe Ringe) ein- und ausblenden. Der Pfeil an der Trennlinie zeigt in die Richtung, in der Σ wächst. „Neue Messdaten“ erzeugt neue Daten (nur Sortierstation und Förderband), „CSV speichern“ lädt die Daten herunter.

## Ideen für den Unterricht

- **Per Hand trennen:** Beim Skript-Beispiel die Regler so einstellen, dass alle zehn Pflanzen richtig sind. Wer findet die Linie mit dem größten Abstand zu den Punkten?
- **Was macht welches Gewicht?** Nur w₁ verändern, dann nur w₂, dann nur b. Wann dreht sich die Linie, wann verschiebt sie sich? Warum ändert ein negatives b die Seite?
- **Ohne Bias:** Bias ausschalten. Warum geht die Linie jetzt immer durch (0 | 0)? Bei welchen Beispielen reicht das – und warum bei der Sortierstation, beim Förderband aber nicht?
- **Einen Lernschritt nachrechnen:** Mit → einen falschen Punkt abwarten und die neuen Gewichte mit dem Taschenrechner nachrechnen.
- **Lernrate:** Mit η = 0,05 und η = 1 lernen lassen. Wie viele Epochen braucht es? Warum findet die Lernregel trotzdem eine Lösung?
- **Startgewichte:** Mehrmals „Neue Startgewichte“ und lernen lassen. Ist die gefundene Linie immer gleich? Ist sie die „beste“?
- **XOR:** Warum kann keine gerade Linie die vier Muster trennen? Was zeigt die Fehlerkurve? Anschließend MemBrain (nlsP) mit versteckten Neuronen.
- **Brücke zum Notebook:** Die Gewichte aus der Lernsituation mit NN1 und NN2 vergleichen. Daten als CSV speichern und in Python weiterverwenden.
- **Ausblick:** Ein neuronales Netz ist aus vielen solchen Neuronen aufgebaut. Statt der Sprungfunktion nimmt man dann Sigmoid oder ReLU, damit man mit dem Gradientenverfahren lernen kann (Notebook „Eisverkäufer“, LS Neuronales Netz).

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Seite, bindet Schriften, p5.js und die Skripte ein |
| `style.css` | Gestaltung im Corporate Design der Schule |
| `basis.js` | gemeinsame Grundlage der KI-Lernsituationen (Layout, Farben, Kopfzeile, Beispiel-Leiste, UI-Helfer) |
| `daten.js` | die fünf Beispiele (Merkmale, Klassen, Daten, Texte), der Datengenerator und die Normierung |
| `perzeptron.js` | das Neuron – Summe, Sprungfunktion, Lernregel, Trennlinie, Halbebenen – reines JavaScript, ohne p5 |
| `ui.js` | Knöpfe, Regler, Auswahllisten, Kästchen |
| `sketch.js` | Ablauf, Zeichnen, Erklärtexte |
| `assets/logo-jps.png` | Logo der Jakob-Preh-Schule |
| `assets/logo-jps-hell.png` | Logo in Weiß für das dunkle Farbschema |
| `libraries/p5.min.js` | p5.js (lokal, damit die Seite auch offline läuft) |

Die Dateien `Perceptron.js`, `Punkt.js` und `libraries/p5.sound.min.js` stammen aus der ersten Fassung und werden nicht mehr gebraucht.

## Ein eigenes Beispiel ergänzen

In `daten.js` einen Eintrag in `SZENARIEN` hinzufügen. Er erscheint automatisch als weiterer Reiter in der Beispiel-Leiste:

```js
mein: {
  name: "Mein Beispiel",
  titel: "Meine Messdaten",
  untertitel: "Worum es geht · ein Neuron",
  merkmale: [
    { name: "Merkmal 1", kurz: "m1", einheit: "V", min: 0, max: 10, gitter: 1, stellen: 1, csv: "m1_v" },
    { name: "Merkmal 2", kurz: "m2", einheit: "%", min: 0, max: 100, gitter: 10, stellen: 0, csv: "m2_prozent" },
  ],
  klassen: [
    { name: "Klasse A", farbe: FARBE.blau, form: "kreis" },
    { name: "Klasse B", farbe: FARBE.akzent, form: "dreieck" },
  ],
  fest: [
    [2.0, 30, 0, "Teil 1"],
    [7.5, 70, 1, "Teil 2"],
  ],
  trennbar: true,
  biasNoetig: false,
  wort: { einzahl: "Teil", mehrzahl: "Teile" },
  csvDatei: "meine_daten.csv",
},
```

Statt `fest` gehen auch Punktwolken (`wolken`, mit `startwert`) oder Geraden mit Rauschen (`linien`), siehe Sortierstation und Förderband.

## Lokal starten

Am einfachsten in VS Code mit der Erweiterung **Live Server**: Rechtsklick auf `index.html` → „Open with Live Server“.

## Technische Hinweise

- Läuft mit **p5.js 1.x** (lokal mitgeliefert) und **p5.js 2.x**. Dafür verzichtet der Code bewusst auf Funktionen, die sich zwischen den Versionen geändert haben (z. B. `preload`, `loadFont`).
- Die Schriften (Quicksand, Inter, JetBrains Mono) kommen von Google Fonts. Ohne Internet weicht die Seite automatisch auf Systemschriften aus.
- Alle Schleifen haben geschweifte Klammern: Der p5-Web-Editor baut in Schleifen eine Endlosschleifen-Sicherung ein, die bei Schleifen ohne Klammern fehlschlägt.
- Alle Lernschritte werden beim Start vorab berechnet (`lernVerlauf` in `perzeptron.js`). Die Oberfläche blättert nur durch die Liste und animiert die Linie zwischen zwei Schritten.
- Fehler in `draw()` werden abgefangen und als Hinweis angezeigt, statt das Programm einzufrieren.
- Die simulierten Datensätze werden mit festem Startwert erzeugt und so bereinigt, dass sie sicher linear trennbar sind. Auch die Startgewichte sind bei jedem Start gleich, bis man „Neue Startgewichte“ wählt.
- `basis.js` und `style.css` sind dieselben wie in den anderen KI-Lernsituationen (Logistische Regression, kNN, Naiver Bayes, Entscheidungsbaum).
- Die Idee, das Perzeptron mit Reglern und Trennlinie zu zeigen, geht auf das Perzeptron-Beispiel aus *The Nature of Code* von Daniel Shiffman zurück.

## Lizenz

[![CC BY 4.0](https://img.shields.io/badge/Lizenz-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/deed.de)

**KI-Klassifikation · Ein Neuron (Perzeptron) · lineare Trennung** von **Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt**, steht unter der Lizenz [Creative Commons Namensnennung 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.de). Der vollständige Lizenztext steht in der Datei [`LICENSE`](LICENSE).

Du darfst das Material (Quellcode, Texte, Aufgaben und Grafiken) kopieren, weitergeben und verändern, auch kommerziell. Dafür musst du

- den Urheber nennen: *Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt*,
- auf die Lizenz verlinken: <https://creativecommons.org/licenses/by/4.0/deed.de>,
- angeben, ob du etwas verändert hast.

Vorschlag für die Namensnennung: *„KI-Klassifikation · Ein Neuron (Perzeptron) · lineare Trennung“ von Christoph Rothaug, Jakob-Preh-Schule Bad Neustadt, CC BY 4.0, https://github.com/FlowTheTensor/LS-NNLineareseparation*

**Ausgenommen** von dieser Lizenz sind:

| Bestandteil | Rechte |
|---|---|
| `libraries/p5.min.js` | [p5.js](https://p5js.org), GNU LGPL 2.1 |
| `assets/logo-jps.png`, `assets/logo-jps-hell.png` | Logo der Jakob-Preh-Schule – alle Rechte bei der Schule |
| Schriften Quicksand, Inter, JetBrains Mono | über Google Fonts eingebunden, SIL Open Font License 1.1 |
