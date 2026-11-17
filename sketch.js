// =============================================================================
//  KI-Klassifikation · Ein Neuron (Perzeptron) · lineare Trennung
//  Ein künstliches Neuron mit zwei Eingängen trennt zwei Klassen durch eine
//  gerade Linie – fünf Beispiele zur Auswahl:
//    - Skript 5.6: Enzian und Mohn aus Blattbreite und Blattlänge
//    - Logik: ODER (linear trennbar, wie MemBrain lsP)
//    - Sortierstation: Kunststoff oder Metall
//    - Förderband: normal oder Überlast (schräge Grenze, Bias nötig)
//    - Logik: XOR (nicht linear trennbar, wie MemBrain nlsP)
// =============================================================================
//
//  Dateien
//    basis.js        gemeinsame Grundlage (Layout, Farben, Kopfzeile, UI-Helfer)
//    daten.js        Daten der fünf Beispiele
//    perzeptron.js   das Neuron (Summe, Sprungfunktion, Lernregel)
//    ui.js           Knöpfe, Regler, Auswahllisten
//    sketch.js       Ablauf, Zeichnen, Erklärungen (diese Datei)
//
//  Zwei Verfahren
//    ① Gewichte per Hand   w₁, w₂ und b mit den Reglern einstellen
//    ② Perzeptron-Lernregel Punkt für Punkt: Fehler → Gewichte verschieben
//
//  Bedienung
//    →         nächster Punkt (Lernregel)
//    E         bis zum Ende der Epoche
//    Leertaste automatisch ablaufen lassen / anhalten
//    R         neu starten
//    Klick     auf einen Punkt: im Neuron-Feld nachrechnen
// =============================================================================

const APP_TITEL = "KI-Klassifikation";

const P_DATEN = { x: 24, y: 84, w: 820, h: 800, titel: "" };
const P_ERKL = { x: 860, y: 84, w: 716, h: 244, titel: "" };
const P_EINST = { x: 860, y: 344, w: 716, h: 132, titel: "Einstellungen" };
const P_NEURON = { x: 860, y: 492, w: 716, h: 184, titel: "" };
const P_KURVE = { x: 860, y: 692, w: 350, h: 192, titel: "Fehler je Epoche" };
const P_KONF = { x: 1226, y: 692, w: 350, h: 192, titel: "" };

const PLOT = { x: 104, y: 134, w: 700, h: 612 };
const SCHRITT_PAUSE = { langsam: 1800, mittel: 800, schnell: 160 };

// -----------------------------------------------------------------------------
// Zustand
// -----------------------------------------------------------------------------
let szenario = "skript";
let startwert = 0;
let daten = [];

let verfahren = "hand"; // hand | lernen
let lernrate = 0.1;
let tempo = "mittel";
let mitBias = true;

let startGewichte = { w1: 0.5, w2: -0.3, b: 0 };
let gewichtStart = 1; // Startwert für den Zufall der Startgewichte
let handGewichte = { w1: 0.5, w2: -0.3, b: 0 };

let verlauf = null; // vorberechnete Lernschritte
let schrittIndex = -1; // −1 = noch kein Punkt
let laufAuto = false;
let letzterSchritt = 0;
let anim = null; // {von, nach, t0, dauer}

let flaecheAn = true;
let falscheAn = true;
let auswahlIndex = 0; // Punkt im Neuron-Feld (per Hand)

// =============================================================================
// Start
// =============================================================================
function setup() {
  ladeSchriften();
  const [cw, ch] = zeichenflaeche();
  cnv = createCanvas(cw, ch);
  S = width / W;

  szenarioLaden("skript");
  erstelleUi();
  cnv.parent(huelle);
  layoutUi();
}

function nachFehler() {
  laufAuto = false;
  anim = null;
}

// =============================================================================
// Hauptschleife
// =============================================================================
function draw() {
  try {
    logik();
    zeichneRahmen(() => {
      zeichneStatusZeile(statusText());
      zeichneDatenPanel();
      zeichneErklaerung();
      zeichneEinstellungen();
      zeichneNeuron();
      zeichneFehlerKurve();
      zeichneKonfusion();
      zeichneTooltip();
    });
    aktualisiereUi();
  } catch (err) {
    behandleFehler(err);
  }
}

function logik() {
  if (anim && millis() - anim.t0 >= anim.dauer) {
    anim = null;
  }
  if (laufAuto && millis() - letzterSchritt > SCHRITT_PAUSE[tempo]) {
    schritt();
  }
  if (verfahren === "lernen" && lernFertig()) {
    laufAuto = false;
  }
}

// =============================================================================
// Daten und Ablauf
// =============================================================================
function szenarioLaden(id) {
  szenario = id;
  setzeSzenario(id);
  startwert = SZ.startwert || 0;
  daten = erzeugeDaten(startwert);
  for (const p of daten) {
    p.xn = normiere(p);
  }
  auswahlIndex = 0;
  gewichtStart = 1;
  waehleStartgewichte();
  handGewichte = { ...startGewichte };
  neuStarten();
}

function szenarioWechseln(id) {
  if (laufAuto || id === szenario) {
    return;
  }
  szenarioLaden(id);
}

function neueMessdaten() {
  if (SZ.fest) {
    zeigeHinweis("Dieses Beispiel hat feste Daten. Für zufällige Messdaten die Sortierstation oder das Förderband wählen.");
    return;
  }
  startwert = Math.floor(Math.random() * 1e9);
  daten = erzeugeDaten(startwert);
  for (const p of daten) {
    p.xn = normiere(p);
  }
  auswahlIndex = 0;
  neuStarten();
}

// Startgewichte: klein und zufällig, aber reproduzierbar (gleiche Zahlen bei jedem Start)
function waehleStartgewichte() {
  const rnd = zufallsGenerator(9001 + 37 * gewichtStart + (SZ.startwert || 0) + Object.keys(SZENARIEN).indexOf(szenario));
  const z = () => Math.round((rnd() * 1.6 - 0.8) * 100) / 100;
  startGewichte = { w1: z(), w2: z(), b: mitBias ? z() : 0 };
}

function neueStartgewichte() {
  if (laufAuto) {
    return;
  }
  gewichtStart++;
  waehleStartgewichte();
  handGewichte = { ...startGewichte };
  neuStarten();
  zeigeHinweis("Neue zufällige Startgewichte. Findet die Lernregel wieder eine Trennlinie – und ist es dieselbe?");
}

function verfahrenWechseln(neu) {
  if (laufAuto) {
    return;
  }
  verfahren = neu;
  if (neu === "hand") {
    // per Hand dort weitermachen, wo die Lernregel gerade steht
    handGewichte = { ...aktuelleLernGewichte() };
  }
  neuStarten(neu === "hand");
}

function biasUmschalten(an) {
  mitBias = an;
  if (!mitBias) {
    startGewichte.b = 0;
    handGewichte.b = 0;
  } else {
    waehleStartgewichte();
    handGewichte.b = startGewichte.b;
  }
  neuStarten(true);
  zeigeHinweis(
    an
      ? "Mit Bias kann sich die Trennlinie frei verschieben."
      : "Ohne Bias geht die Trennlinie immer durch die Mitte (0 | 0) der normierten Werte. Klappt die Trennung noch?"
  );
}

// handBehalten: die Regler-Einstellung bleibt erhalten (nur die Lernregel startet neu)
function neuStarten(handBehalten) {
  laufAuto = false;
  anim = null;
  schrittIndex = -1;
  if (!mitBias) {
    startGewichte.b = 0;
  }
  verlauf = lernVerlauf(daten, startGewichte, lernrate, mitBias, MAX_EPOCHEN);
  if (!handBehalten && verfahren === "hand") {
    handGewichte = { ...startGewichte };
  }
}

function lernFertig() {
  return verlauf && schrittIndex >= verlauf.schritte.length - 1;
}

function schritt() {
  if (verfahren !== "lernen" || lernFertig()) {
    return;
  }
  letzterSchritt = millis();
  const von = aktuelleLernGewichte();
  schrittIndex++;
  const s = verlauf.schritte[schrittIndex];
  auswahlIndex = s.index;
  if (s.e !== 0) {
    anim = { von, nach: s.nachher, t0: millis(), dauer: Math.min(600, SCHRITT_PAUSE[tempo] * 0.6) };
  } else {
    anim = null;
  }
}

function epocheWeiter() {
  if (verfahren !== "lernen" || laufAuto || lernFertig()) {
    return;
  }
  const n = daten.length;
  const ep = schrittIndex < 0 ? 0 : verlauf.schritte[schrittIndex].epoche + (verlauf.schritte[schrittIndex].index === n - 1 ? 1 : 0);
  const ziel = Math.min(verlauf.schritte.length - 1, (ep + 1) * n - 1);
  const von = aktuelleLernGewichte();
  schrittIndex = ziel;
  auswahlIndex = verlauf.schritte[ziel].index;
  anim = { von, nach: verlauf.schritte[ziel].nachher, t0: millis(), dauer: 500 };
  letzterSchritt = millis();
}

function autoUmschalten() {
  if (verfahren !== "lernen") {
    return;
  }
  if (laufAuto) {
    laufAuto = false;
    return;
  }
  if (lernFertig()) {
    return;
  }
  laufAuto = true;
  letzterSchritt = millis() - SCHRITT_PAUSE[tempo] + 200;
}

// Gewichte nach dem aktuellen Lernschritt (ohne Animation)
function aktuelleLernGewichte() {
  if (!verlauf || schrittIndex < 0) {
    return { ...startGewichte };
  }
  return verlauf.schritte[schrittIndex].nachher;
}

// Gewichte, die gerade gelten (per Hand oder Lernstand)
function aktuelleGewichte() {
  return verfahren === "hand" ? handGewichte : aktuelleLernGewichte();
}

// Gewichte zum Zeichnen der Linie (mit weicher Animation beim Verschieben)
function gezeichneteGewichte() {
  const w = aktuelleGewichte();
  if (!anim) {
    return w;
  }
  const t = weich(begrenzen((millis() - anim.t0) / anim.dauer, 0, 1));
  return {
    w1: anim.von.w1 + (anim.nach.w1 - anim.von.w1) * t,
    w2: anim.von.w2 + (anim.nach.w2 - anim.von.w2) * t,
    b: anim.von.b + (anim.nach.b - anim.von.b) * t,
  };
}

// aktueller Lernschritt (oder null)
function aktSchritt() {
  if (verfahren !== "lernen" || !verlauf || schrittIndex < 0) {
    return null;
  }
  return verlauf.schritte[schrittIndex];
}

// =============================================================================
// Zahlen und Texte
// =============================================================================
function fW(v) {
  return fKomma(v, 2);
}

function fZ(v) {
  return v > 0 ? "+1" : "−1";
}

function fE(e) {
  return e > 0 ? "+" + e : e < 0 ? "−" + Math.abs(e) : "0";
}

// Zahl in Klammern, wenn sie negativ ist (für eingesetzte Formeln)
function fK(v) {
  const s = fKomma(v, 2);
  return v < 0 ? `(${s})` : s;
}

function klassenName(k) {
  return SZ.klassen[k].name;
}

function statusText() {
  const w = aktuelleGewichte();
  const r = anzahlRichtig(daten, w);
  return (
    `${daten.length} ${SZ.wort.mehrzahl} · ${klassenName(0)} → −1, ${klassenName(1)} → +1 · ` +
    `w₁ = ${fW(w.w1)} · w₂ = ${fW(w.w2)} · b = ${mitBias ? fW(w.b) : "aus"} · richtig klassifiziert: ${r} von ${daten.length}`
  );
}

// =============================================================================
// Diagramm – Umrechnung
// =============================================================================
function zuPlot(x, y) {
  const [m1, m2] = MERKMALE;
  return [PLOT.x + ((x - m1.min) / (m1.max - m1.min)) * PLOT.w, PLOT.y + PLOT.h - ((y - m2.min) / (m2.max - m2.min)) * PLOT.h];
}

// normierte Koordinaten (−1 … +1) → Bildschirm
function nZuPlot(a, b) {
  return [PLOT.x + ((a + 1) / 2) * PLOT.w, PLOT.y + PLOT.h - ((b + 1) / 2) * PLOT.h];
}

function imPlot(px, py) {
  return px >= PLOT.x && px <= PLOT.x + PLOT.w && py >= PLOT.y && py <= PLOT.y + PLOT.h;
}

function punktUnterMaus() {
  const mx = mausX();
  const my = mausY();
  if (!imPlot(mx, my)) {
    return -1;
  }
  let bester = -1;
  let besterAbstand = 11;
  daten.forEach((p, i) => {
    const [px, py] = zuPlot(p.x, p.y);
    const d = dist(mx, my, px, py);
    if (d < besterAbstand) {
      besterAbstand = d;
      bester = i;
    }
  });
  return bester;
}

// =============================================================================
// Zeichnen – Formen
// =============================================================================
function zeichneForm(form, px, py, r) {
  if (form === "dreieck") {
    triangle(px, py - r * 1.15, px + r, py + r * 0.7, px - r, py + r * 0.7);
  } else if (form === "quadrat") {
    rectMode(CENTER);
    rect(px, py, r * 1.6, r * 1.6, 2);
    rectMode(CORNER);
  } else {
    circle(px, py, r * 2);
  }
}

function zeichneDatenpunkt(p, px, py, alpha, r) {
  const kl = SZ.klassen[p.k];
  stroke(...FARBE.flaeche);
  strokeWeight(1.4);
  fill(kl.farbe[0], kl.farbe[1], kl.farbe[2], alpha);
  zeichneForm(kl.form, px, py, r || 6.5);
}

// =============================================================================
// Datenfeld
// =============================================================================
function zeichneDatenPanel() {
  P_DATEN.titel = SZ.titel;
  panel(P_DATEN);
  zeichneLegende();

  const [m1, m2] = MERKMALE;
  const wz = gezeichneteGewichte();
  const wa = aktuelleGewichte();
  const s = aktSchritt();
  const gross = daten.length <= 12;

  stroke(...FARBE.linie);
  strokeWeight(1);
  fill(...FARBE.papier);
  rect(PLOT.x, PLOT.y, PLOT.w, PLOT.h);

  clipRechteck(PLOT.x, PLOT.y, PLOT.w, PLOT.h);

  // Halbebenen: wo das Neuron +1 bzw. −1 ausgibt
  if (flaecheAn) {
    for (const positiv of [true, false]) {
      const poly = halbebene(wz, positiv);
      if (poly.length >= 3) {
        const f = SZ.klassen[positiv ? 1 : 0].farbe;
        noStroke();
        fill(f[0], f[1], f[2], dunkelModus ? 34 : 26);
        beginShape();
        for (const q of poly) {
          vertex(...nZuPlot(q[0], q[1]));
        }
        endShape(CLOSE);
      }
    }
  }

  // Gitter
  const anzX = Math.round((m1.max - m1.min) / m1.gitter);
  const anzY = Math.round((m2.max - m2.min) / m2.gitter);
  stroke(...FARBE.text, 22);
  strokeWeight(1);
  for (let i = 0; i <= anzX; i++) {
    const [gx] = zuPlot(m1.min + i * m1.gitter, m2.min);
    line(gx, PLOT.y, gx, PLOT.y + PLOT.h);
  }
  for (let i = 0; i <= anzY; i++) {
    const [, gy] = zuPlot(m1.min, m2.min + i * m2.gitter);
    line(PLOT.x, gy, PLOT.x + PLOT.w, gy);
  }

  // Mitte der normierten Werte (0 | 0) – ohne Bias läuft die Linie hier durch
  const [mx0, my0] = nZuPlot(0, 0);
  stroke(...FARBE.blass);
  strokeWeight(1.4);
  line(mx0 - 7, my0, mx0 + 7, my0);
  line(mx0, my0 - 7, mx0, my0 + 7);
  noStroke();
  fill(...FARBE.blass);
  textFont(MONO);
  textSize(11);
  textAlign(LEFT, TOP);
  text("(0|0)", mx0 + 6, my0 + 4);

  // Trennlinie Σ = 0
  const tl = trennlinie(wz);
  if (tl) {
    const [ax, ay] = nZuPlot(tl[0][0], tl[0][1]);
    const [bx, by] = nZuPlot(tl[1][0], tl[1][1]);
    stroke(...FARBE.text);
    strokeWeight(3);
    line(ax, ay, bx, by);
    // Normalenpfeil: zeigt zur Seite Σ > 0 (ŷ = +1)
    const cx = (ax + bx) / 2;
    const cy = (ay + by) / 2;
    // Richtung, in der Σ wächst (Gradient in Bildschirmkoordinaten)
    const gxr = wz.w1 / PLOT.w;
    const gyr = -wz.w2 / PLOT.h;
    const nl = Math.hypot(gxr, gyr);
    if (nl > 1e-12) {
      const ex = gxr / nl;
      const ey = gyr / nl;
      const f = SZ.klassen[1].farbe;
      stroke(f[0], f[1], f[2]);
      strokeWeight(2);
      line(cx, cy, cx + ex * 34, cy + ey * 34);
      push();
      translate(cx + ex * 34, cy + ey * 34);
      rotate(Math.atan2(ey, ex));
      noStroke();
      fill(f[0], f[1], f[2]);
      triangle(0, 0, -9, -5, -9, 5);
      pop();
      etikett("ŷ = +1", cx + ex * 62, cy + ey * 62, f);
      etikett("ŷ = −1", cx - ex * 48, cy - ey * 48, SZ.klassen[0].farbe);
    }
  }

  // Punkte
  daten.forEach((p, i) => {
    const [px, py] = zuPlot(p.x, p.y);
    const falsch = vorhersage(wa, p.xn).y !== zielwert(p.k);
    zeichneDatenpunkt(p, px, py, 235, gross ? 9 : 6.5);
    if (falscheAn && falsch && !anim) {
      noFill();
      stroke(...FARBE.senf);
      strokeWeight(2.4);
      circle(px, py, gross ? 32 : 24);
    }
    if (gross) {
      noStroke();
      fill(...FARBE.grau);
      textFont(SCHRIFT);
      textSize(12);
      textAlign(LEFT, CENTER);
      text(p.name, px + 24, py + 1);
    }
    // aktueller Lernpunkt bzw. ausgewählter Punkt
    const markiert = s ? s.index === i : verfahren === "hand" && auswahlIndex === i;
    if (markiert) {
      noFill();
      stroke(...FARBE.text);
      strokeWeight(2);
      gestrichelt(true);
      circle(px, py, gross ? 42 : 34);
      gestrichelt(false);
    }
  });

  clipEnde();

  // Achsen
  noStroke();
  fill(...FARBE.grau);
  textFont(SCHRIFT);
  textSize(12);
  for (let i = 0; i <= anzX; i++) {
    const v = m1.min + i * m1.gitter;
    const [gx] = zuPlot(v, m2.min);
    textAlign(CENTER, TOP);
    text(Number(v.toFixed(3)).toString().replace(".", ","), gx, PLOT.y + PLOT.h + 6);
  }
  for (let i = 0; i <= anzY; i++) {
    const v = m2.min + i * m2.gitter;
    const [, gy] = zuPlot(m1.min, v);
    textAlign(RIGHT, CENTER);
    text(Number(v.toFixed(3)).toString().replace(".", ","), PLOT.x - 6, gy);
  }
  fill(...FARBE.text);
  textStyle(BOLD);
  textSize(13);
  textAlign(CENTER, TOP);
  text(`x₁ = ${m1.name}${m1.einheit ? " in " + m1.einheit : ""}`, PLOT.x + PLOT.w / 2, PLOT.y + PLOT.h + 26);
  push();
  translate(P_DATEN.x + 18, PLOT.y + PLOT.h / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  text(`x₂ = ${m2.name}${m2.einheit ? " in " + m2.einheit : ""}`, 0, 0);
  pop();
  textStyle(NORMAL);

  if (verfahren === "lernen" && schrittIndex < 0) {
    banner("Mit → lernt das Neuron Punkt für Punkt", PLOT.x + PLOT.w / 2, PLOT.y + 14, false);
  } else if (verfahren === "hand" && anzahlRichtig(daten, wa) === daten.length) {
    banner("Alle richtig – die Linie trennt die Klassen ✓", PLOT.x + PLOT.w / 2, PLOT.y + 14, false);
  }

  noStroke();
  fill(...FARBE.blass);
  textFont(SCHRIFT);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Klick auf einen Punkt: im Neuron nachrechnen", 556, 838);
  text("gelber Ring = falsch klassifiziert", 556, 856);

  cursor(punktUnterMaus() >= 0 ? HAND : ARROW);
}

// kleine Beschriftung mit heller Unterlage (bleibt auch über Punkten lesbar)
function etikett(s, x, y, farbe) {
  textFont(MONO);
  textStyle(BOLD);
  textSize(12);
  const b = textWidth(s) + 10;
  noStroke();
  fill(...FARBE.flaeche, 220);
  rect(x - b / 2, y - 10, b, 20, 5);
  fill(farbe[0], farbe[1], farbe[2]);
  textAlign(CENTER, CENTER);
  text(s, x, y);
  textStyle(NORMAL);
}

function zeichneLegende() {
  textFont(SCHRIFT);
  textSize(12);
  const y = P_DATEN.y + 17;
  const eintraege = SZ.klassen.map((k, i) => ({ name: `${k.name} (${i === 1 ? "+1" : "−1"})`, k: i }));
  eintraege.push({ name: "Trennlinie Σ = 0", k: -1 });
  let breite = 0;
  for (const e of eintraege) {
    breite += textWidth(e.name) + 34;
  }
  let x = P_DATEN.x + P_DATEN.w - 16 - breite;
  for (const e of eintraege) {
    if (e.k >= 0) {
      zeichneDatenpunkt({ k: e.k }, x + 6, y, 235);
    } else {
      stroke(...FARBE.text);
      strokeWeight(3);
      line(x - 2, y, x + 14, y);
    }
    noStroke();
    fill(...FARBE.text);
    textFont(SCHRIFT);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(e.name, x + 20, y + 1);
    x += textWidth(e.name) + 34;
  }
}

// =============================================================================
// Erklärfeld
// =============================================================================
function erklaerung() {
  const w = aktuelleGewichte();
  const r = anzahlRichtig(daten, w);
  const n = daten.length;

  if (verfahren === "hand") {
    let text =
      "Ein Neuron bildet die gewichtete Summe seiner Eingänge und „feuert“ (+1), wenn sie größer als 0 ist. " +
      "Alle Punkte mit Σ = 0 bilden eine gerade Linie. Stelle w₁, w₂ und b so ein, dass sie die beiden Klassen trennt.";
    if (!mitBias) {
      text = "Ohne Bias ist b = 0: Die Trennlinie geht immer durch die Mitte (0 | 0). Die Gewichte können sie nur drehen, nicht verschieben. " + (SZ.biasNoetig ? "Gelingt hier eine Trennung?" : "Hier klappt es trotzdem.");
    } else if (!SZ.trennbar && r < n) {
      text += " Tipp: Bei diesem Beispiel lohnt es sich, lange zu probieren – oder Verfahren ② zu fragen.";
    }
    return {
      titel: r === n ? `Alle ${n} ${SZ.wort.mehrzahl} richtig ✓` : "① Gewichte per Hand einstellen",
      text,
      zeilen: 4,
      formeln: [
        "Summe        Σ = w₁·x₁ + w₂·x₂ + b",
        "Aktivierung  ŷ = +1, wenn Σ > 0, sonst −1",
        "Trennlinie   Σ = 0",
        `Ergebnis     ${r} von ${n} richtig`,
      ],
    };
  }

  const s = aktSchritt();
  if (!s) {
    return {
      titel: "② Perzeptron-Lernregel · die KI lernt",
      text:
        `Das Neuron startet mit zufälligen Gewichten. Dann bekommt es die ${n} ${SZ.wort.mehrzahl} nacheinander: Liegt es richtig, bleibt alles, wie es ist. ` +
        `Liegt es falsch, werden die Gewichte ein Stück in Richtung des Punktes verschoben. Ein Durchlauf durch alle Daten heißt Epoche.`,
      zeilen: 4,
      formeln: ["Fehler     e = t − ŷ          (t = richtiger Wert, ±1)", "Anpassung  w₁ ← w₁ + η·e·x₁   w₂ ← w₂ + η·e·x₂", `           b  ← b + η·e·1       η = ${fKomma(lernrate, 2)} (Lernrate)`],
    };
  }

  const p = s.punkt;
  const v = s.vorher;
  const fertig = lernFertig();
  const kopf = `Epoche ${s.epoche + 1} · ${p.name} (${s.index + 1}/${n})`;
  const formeln = [
    `Σ = ${fK(v.w1)}·${fK(p.xn[0])} + ${fK(v.w2)}·${fK(p.xn[1])}${mitBias ? " + " + fK(v.b) : ""} = ${fKomma(s.summe, 2)}  →  ŷ = ${fZ(s.y)}`,
    `t = ${fZ(s.t)} (${klassenName(p.k)})  →  e = t − ŷ = ${fE(s.e)}`,
  ];
  let text;
  if (s.e === 0) {
    text = `Das Neuron sagt ${fZ(s.y)} und liegt richtig. Fehler 0 – die Gewichte bleiben unverändert.`;
  } else {
    text = `Das Neuron sagt ${fZ(s.y)}, richtig wäre ${fZ(s.t)}. Die Gewichte werden um η·e·x verschoben – die Linie kippt in Richtung des Punktes.`;
    formeln.push(`w₁ = ${fK(v.w1)} + ${fKomma(lernrate, 2)}·${fE(s.e)}·${fK(p.xn[0])} = ${fW(s.nachher.w1)}`);
    formeln.push(`w₂ = ${fK(v.w2)} + ${fKomma(lernrate, 2)}·${fE(s.e)}·${fK(p.xn[1])} = ${fW(s.nachher.w2)}`);
    if (mitBias) {
      formeln.push(`b  = ${fK(v.b)} + ${fKomma(lernrate, 2)}·${fE(s.e)}·1 = ${fW(s.nachher.b)}`);
    }
  }
  if (fertig) {
    if (verlauf.konvergiert) {
      return {
        titel: `Gelernt in ${verlauf.epochen.length} Epochen ✓`,
        text: `In der letzten Epoche hat das Neuron alle ${n} ${SZ.wort.mehrzahl} richtig eingeordnet. Die Linie trennt die Klassen – mit anderen Startgewichten oder einer anderen Lernrate kann es eine andere Linie sein.`,
        zeilen: 4,
        formeln: [`Ergebnis   w₁ = ${fW(w.w1)}   w₂ = ${fW(w.w2)}   b = ${mitBias ? fW(w.b) : "aus"}`, `           ${r} von ${n} richtig`],
      };
    }
    return {
      titel: `Nach ${MAX_EPOCHEN} Epochen immer noch Fehler ✗`,
      text: SZ.trennbar
        ? `Die Lernregel hat in ${MAX_EPOCHEN} Epochen keine fehlerfreie Linie gefunden. Ohne Bias muss die Linie durch (0 | 0) – hier reicht das nicht. Bias einschalten und neu starten!`
        : "Es gibt keine gerade Linie, die diese Klassen trennt (nicht linear trennbar). Die Lernregel korrigiert endlos hin und her. Abhilfe: versteckte Neuronen mit nicht-linearer Aktivierung (MemBrain nlsP, LS Neuronales Netz).",
      zeilen: 4,
      formeln: [`Ergebnis   ${r} von ${n} richtig`],
    };
  }
  return { titel: kopf, text, zeilen: 2, formeln };
}

function zeichneErklaerung() {
  const e = erklaerung();
  P_ERKL.titel = e.titel;
  panel(P_ERKL);
  zeichneErklaerText(P_ERKL, e);
}

function zeichneEinstellungen() {
  const p = P_EINST;
  panel(p);
  noStroke();
  fill(...FARBE.blass);
  textFont(SCHRIFT);
  textSize(12);
  textAlign(LEFT, TOP);
  let t;
  if (verfahren === "hand") {
    t = "Die Merkmale werden auf −1 … +1 umgerechnet (normiert), damit w₁ und w₂ vergleichbar sind.";
  } else if (lernrate >= 0.5) {
    t = "Große Lernrate: Die Linie springt weit – bei diesen Daten oft trotzdem schnell am Ziel.";
  } else {
    t = "Kleine Lernrate: Die Linie bewegt sich in kleinen Schritten.";
  }
  text(t, p.x + 16, p.y + p.h - 22);
}

// =============================================================================
// Neuron-Feld: Rechnung für einen Punkt
// =============================================================================
function zeichneNeuron() {
  const p = P_NEURON;
  const s = aktSchritt();
  const pi = s ? s.index : begrenzen(auswahlIndex, 0, daten.length - 1);
  const pkt = daten[pi];
  const w = s ? s.vorher : aktuelleGewichte();
  const { summe, y } = vorhersage(w, pkt.xn);
  const richtig = y === zielwert(pkt.k);
  p.titel = `Neuron · ${pkt.name}${s ? " (vor der Anpassung)" : ""}`;
  panel(p);

  const ix = p.x + 70;
  const reihen = [p.y + 62, p.y + 104, p.y + 146];
  const sx = p.x + 250;
  const sy = p.y + 104;
  const ox = p.x + 410;

  const eingaenge = [
    { name: "x₁", wert: pkt.xn[0], gew: w.w1, gname: "w₁", an: true },
    { name: "x₂", wert: pkt.xn[1], gew: w.w2, gname: "w₂", an: true },
    { name: "1", wert: 1, gew: w.b, gname: "b", an: mitBias },
  ];

  // Verbindungen
  eingaenge.forEach((e, i) => {
    const yy = reihen[i];
    const staerke = Math.min(5, 1 + Math.abs(e.gew) * 2);
    if (!e.an) {
      stroke(...FARBE.linie);
      gestrichelt(true);
      strokeWeight(1.2);
    } else {
      stroke(...(e.gew >= 0 ? FARBE.gruen : FARBE.akzent));
      strokeWeight(staerke);
    }
    line(ix + 20, yy, sx - 28, sy);
    gestrichelt(false);
    noStroke();
    fill(...(e.an ? FARBE.text : FARBE.blass));
    textFont(MONO);
    textSize(12);
    textAlign(CENTER, CENTER);
    const mx = ix + 20 + (sx - 28 - ix - 20) * 0.42;
    const my = yy + (sy - yy) * 0.42;
    fill(...FARBE.flaeche, 230);
    const lab = `${e.gname} = ${e.an ? fW(e.gew) : "0"}`;
    rect(mx - textWidth(lab) / 2 - 4, my - 9, textWidth(lab) + 8, 18, 4);
    fill(...(e.an ? FARBE.text : FARBE.blass));
    text(lab, mx, my);
  });

  // Eingänge
  eingaenge.forEach((e, i) => {
    const yy = reihen[i];
    stroke(...FARBE.linie);
    strokeWeight(1.2);
    fill(...(e.an ? FARBE.flaeche2 : FARBE.papier));
    circle(ix, yy, 40);
    noStroke();
    fill(...(e.an ? FARBE.text : FARBE.blass));
    textFont(MONO);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(i < 2 ? fW(e.wert) : "1", ix, yy);
    textFont(SCHRIFT);
    textStyle(BOLD);
    textSize(13);
    textAlign(RIGHT, CENTER);
    text(e.name, ix - 26, yy);
    textStyle(NORMAL);
  });

  // Summe
  stroke(...FARBE.text);
  strokeWeight(1.6);
  fill(...FARBE.flaeche);
  circle(sx, sy, 56);
  noStroke();
  fill(...FARBE.text);
  textFont(TITEL);
  textStyle(BOLD);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Σ", sx, sy - 2);
  textStyle(NORMAL);
  textFont(MONO);
  textSize(12);
  text(fW(summe), sx, sy + 42);

  // Sprungfunktion
  const fx = sx + 46;
  const fw = 64;
  const fh = 40;
  stroke(...FARBE.text);
  strokeWeight(1.4);
  line(sx + 28, sy, fx, sy);
  noFill();
  stroke(...FARBE.linie);
  rect(fx, sy - fh / 2, fw, fh, 6);
  stroke(...FARBE.text);
  strokeWeight(2);
  line(fx + 8, sy + 12, fx + fw / 2, sy + 12);
  line(fx + fw / 2, sy + 12, fx + fw / 2, sy - 12);
  line(fx + fw / 2, sy - 12, fx + fw - 8, sy - 12);
  noStroke();
  fill(...FARBE.blass);
  textFont(SCHRIFT);
  textSize(10.5);
  textAlign(CENTER, TOP);
  text("Sprungfunktion", fx + fw / 2, sy + fh / 2 + 4);
  // Marker: wo liegt Σ auf der Sprungfunktion?
  fill(...FARBE.akzent);
  circle(begrenzen(fx + fw / 2 + summe * 12, fx + 6, fx + fw - 6), y > 0 ? sy - 12 : sy + 12, 7);

  // Ausgang
  stroke(...FARBE.text);
  strokeWeight(1.4);
  line(fx + fw, sy, ox - 24, sy);
  const kf = SZ.klassen[klasseAus(y)].farbe;
  stroke(kf[0], kf[1], kf[2]);
  strokeWeight(2.4);
  fill(...FARBE.flaeche);
  circle(ox, sy, 48);
  noStroke();
  fill(kf[0], kf[1], kf[2]);
  textFont(MONO);
  textStyle(BOLD);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(fZ(y), ox, sy);
  textStyle(NORMAL);
  textFont(SCHRIFT);
  textSize(12);
  textAlign(CENTER, TOP);
  text(klassenName(klasseAus(y)), ox, sy + 30);
  fill(...(richtig ? FARBE.gruen : FARBE.akzent));
  textStyle(BOLD);
  text(richtig ? "richtig ✓" : `falsch ✗ (t = ${fZ(zielwert(pkt.k))})`, ox, sy + 46);
  textStyle(NORMAL);
  fill(...FARBE.blass);
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text("ŷ", ox, sy - 28);

  // Trenner zu den Reglern
  stroke(...FARBE.linie);
  strokeWeight(1);
  line(p.x + 468, p.y + KOPF_H + 10, p.x + 468, p.y + p.h - 12);
  noStroke();
  fill(...FARBE.blass);
  textFont(SCHRIFT);
  textSize(11.5);
  textAlign(LEFT, CENTER);
  text(verfahren === "hand" ? "Gewichte einstellen" : "Gewichte (lernt die KI)", p.x + 482, p.y + KOPF_H + 14);
  // Originalwerte des Punktes
  const [m1, m2] = MERKMALE;
  textSize(10.5);
  textAlign(LEFT, BOTTOM);
  text(`${m1.kurz} = ${wertText(pkt.x, m1)} → x₁ = ${fW(pkt.xn[0])} · ${m2.kurz} = ${wertText(pkt.y, m2)} → x₂ = ${fW(pkt.xn[1])}`, p.x + 16, p.y + p.h - 6);
}

// =============================================================================
// Fehler je Epoche
// =============================================================================
function zeichneFehlerKurve() {
  const p = P_KURVE;
  panel(p);
  if (verfahren !== "lernen") {
    leerText(p, "Die Kurve entsteht beim Lernen\n(Verfahren ② Perzeptron-Lernregel).");
    return;
  }
  const s = aktSchritt();
  if (!s) {
    leerText(p, "Noch keine Epoche gelernt.");
    return;
  }
  // Fehler bis zum aktuellen Schritt zählen (laufende Epoche nur teilweise)
  const bisEpoche = s.epoche;
  const werte = [];
  for (let e = 0; e <= bisEpoche; e++) {
    werte.push(0);
  }
  for (let i = 0; i <= schrittIndex; i++) {
    if (verlauf.schritte[i].e !== 0) {
      werte[verlauf.schritte[i].epoche]++;
    }
  }
  const n = daten.length;
  const gx = p.x + 46;
  const gy = p.y + KOPF_H + 14;
  const gw = p.w - 62;
  const gh = p.h - KOPF_H - 64;
  const anz = Math.max(10, werte.length);
  const bw = gw / anz;
  const maxF = Math.max(1, n);
  werte.forEach((f, e) => {
    const h = (f / maxF) * gh;
    noStroke();
    const laufend = e === bisEpoche && !(s.index === n - 1);
    fill(...(f === 0 ? FARBE.gruen : laufend ? FARBE.senf : FARBE.akzent), laufend ? 160 : 230);
    rect(gx + e * bw + 1, gy + gh - h, Math.max(1, bw - 2), Math.max(1.5, h), 2);
  });
  stroke(...FARBE.blass);
  strokeWeight(1);
  line(gx, gy + gh, gx + gw, gy + gh);
  line(gx, gy, gx, gy + gh);
  noStroke();
  fill(...FARBE.grau);
  textFont(SCHRIFT);
  textSize(10.5);
  textAlign(RIGHT, CENTER);
  text(String(maxF), gx - 4, gy + 4);
  text("0", gx - 4, gy + gh);
  textAlign(CENTER, TOP);
  for (let e = 0; e < anz; e += anz > 20 ? 5 : anz > 10 ? 2 : 1) {
    text(String(e + 1), gx + (e + 0.5) * bw, gy + gh + 3);
  }
  textAlign(LEFT, CENTER);
  textSize(11.5);
  fill(...FARBE.text);
  text(`Epoche ${bisEpoche + 1}: ${werte[bisEpoche]} Fehler${s.index === n - 1 ? "" : " (läuft)"}`, p.x + 16, p.y + p.h - 11);
  fill(...FARBE.blass);
  textAlign(RIGHT, CENTER);
  text("Fehler = Korrekturen", p.x + p.w - 16, p.y + p.h - 11);
}

// =============================================================================
// Konfusionsmatrix (aktuelle Gewichte, alle Daten)
// =============================================================================
function zeichneKonfusion() {
  const p = P_KONF;
  p.titel = "Konfusionsmatrix · aktuelle Gewichte";
  panel(p);
  const w = aktuelleGewichte();
  const m = konfusion(daten, w);
  const richtig = m[0][0] + m[1][1];
  const zw = 62;
  const zh = 38;
  const x0 = p.x + 120;
  const y0 = p.y + KOPF_H + 34;
  noStroke();
  fill(...FARBE.blass);
  textFont(SCHRIFT);
  textSize(10.5);
  textAlign(CENTER, BOTTOM);
  text("vorhergesagt", x0 + zw, y0 - 15);
  push();
  translate(p.x + 16, y0 + zh);
  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  text("tatsächlich", 0, 0);
  pop();
  for (let i = 0; i < 2; i++) {
    const kl = SZ.klassen[i];
    fill(kl.farbe[0], kl.farbe[1], kl.farbe[2]);
    textSize(10.5);
    textAlign(CENTER, BOTTOM);
    text(kurz(kl.name, 11), x0 + i * zw + zw / 2, y0 - 2);
    textAlign(RIGHT, CENTER);
    text(kurz(kl.name, 12), x0 - 6, y0 + i * zh + zh / 2);
  }
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const x = x0 + j * zw;
      const y = y0 + i * zh;
      stroke(...FARBE.linie);
      strokeWeight(1);
      fill(...(i === j ? FARBE.gruenFlaeche : m[i][j] > 0 ? FARBE.rotFlaeche : FARBE.papier));
      rect(x, y, zw, zh);
      noStroke();
      fill(...(i === j ? FARBE.gruen : m[i][j] > 0 ? FARBE.akzent : FARBE.blass));
      textFont(MONO);
      textStyle(BOLD);
      textSize(16);
      textAlign(CENTER, CENTER);
      text(String(m[i][j]), x + zw / 2, y + zh / 2);
      textStyle(NORMAL);
    }
  }
  noStroke();
  fill(...FARBE.text);
  textFont(SCHRIFT);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(`Genauigkeit: ${richtig} von ${daten.length} = ${prozent(richtig / daten.length, 1)}`, p.x + 16, p.y + p.h - 28);
  fill(...FARBE.blass);
  textSize(10.5);
  text("Alle Trainingsdaten mit den Gewichten von gerade.", p.x + 16, p.y + p.h - 12);
}

function kurz(s, n) {
  n = n || 9;
  return s.length > n ? s.slice(0, n - 1) + "." : s;
}

// -----------------------------------------------------------------------------
// Tooltip
// -----------------------------------------------------------------------------
function zeichneTooltip() {
  const i = punktUnterMaus();
  if (i < 0) {
    return;
  }
  const [m1, m2] = MERKMALE;
  const p = daten[i];
  const w = aktuelleGewichte();
  const { summe, y } = vorhersage(w, p.xn);
  tooltip([
    `${p.name} · ${klassenName(p.k)} (t = ${fZ(zielwert(p.k))}) · ${wertText(p.x, m1)} · ${wertText(p.y, m2)}`,
    `normiert x₁ = ${fW(p.xn[0])}, x₂ = ${fW(p.xn[1])} · Σ = ${fW(summe)} → ŷ = ${fZ(y)} ${y === zielwert(p.k) ? "✓" : "✗"}`,
  ]);
}

// =============================================================================
// Eingaben
// =============================================================================
function mousePressed() {
  const i = punktUnterMaus();
  if (i >= 0 && !laufAuto) {
    auswahlIndex = i;
    if (verfahren === "lernen" && schrittIndex >= 0) {
      zeigeHinweis("Beim Lernen zeigt das Neuron-Feld immer den aktuellen Lernpunkt. Für eigene Rechnungen Verfahren ① wählen.");
    }
  }
}

function keyPressed() {
  if (!tastaturFrei()) {
    return true;
  }
  if (key === "ArrowRight") {
    if (!laufAuto) {
      schritt();
    }
    return false;
  }
  if (key === " ") {
    autoUmschalten();
    return false;
  }
  if ((key === "r" || key === "R") && !laufAuto) {
    neuStarten();
    return false;
  }
  if ((key === "e" || key === "E") && !laufAuto) {
    epocheWeiter();
    return false;
  }
  return true;
}

// =============================================================================
// Daten als CSV speichern (z. B. für Orange, MemBrain oder Python)
// =============================================================================
function csvSpeichern() {
  const [m1, m2] = MERKMALE;
  const zeilen = [["nr", "name", m1.csv, m2.csv, "klasse", "zielwert"].join(";")];
  for (const p of daten.slice().sort((a, b) => a.id - b.id)) {
    zeilen.push([p.id, p.name, p.x.toFixed(m1.stellen), p.y.toFixed(m2.stellen), klassenName(p.k), zielwert(p.k)].join(";"));
  }
  ladeHerunter(SZ.csvDatei, zeilen.join("\n") + "\n");
}
