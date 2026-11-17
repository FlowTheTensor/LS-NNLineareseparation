// =============================================================================
//  daten.js – Daten für die Beispiele (zwei Merkmale, jeweils MIT Klasse)
// =============================================================================
//  Ein einzelnes künstliches Neuron (Perzeptron) trennt zwei Klassen durch eine
//  gerade Linie. Klasse 0 bekommt den Zielwert −1, Klasse 1 den Zielwert +1.
//
//  Beispiel "skript" (Standard):
//    Skript 5.6: Enzian und Mohn aus Blattbreite und Blattlänge (10 Pflanzen,
//    gleiche Werte wie in der Tabelle im Skript und im Notebook NN1).
//
//  Beispiel "oder":
//    Logisches ODER mit vier Mustern – wie in der Praxiswerkstatt MemBrain (lsP).
//
//  Beispiel "sortierung":
//    Sortierstation der Modellanlage: induktiver Sensor und Reflexion
//    → Kunststoff oder Metall?
//
//  Beispiel "motor":
//    Förderband-Antrieb: Beladung und Motorstrom → normal oder Überlast?
//    Die Grenze liegt schräg – ohne Bias und ohne beide Gewichte geht es nicht.
//
//  Beispiel "xor":
//    Logisches XOR – nicht linear trennbar. Ein einzelnes Neuron findet keine
//    Lösung. Dafür braucht man versteckte Neuronen (MemBrain nlsP).
// =============================================================================

const SZENARIEN = {
  skript: {
    name: "Skript · Enzian und Mohn",
    titel: "Trainingsdaten · Pflanzen klassifizieren",
    untertitel: "Beispiel aus dem Skript (5.6) · ein Neuron · lineare Trennung",
    merkmale: [
      { name: "Blattbreite", kurz: "Breite", einheit: "", min: 0, max: 1.5, gitter: 0.25, stellen: 1, csv: "breite" },
      { name: "Blattlänge", kurz: "Länge", einheit: "", min: 0, max: 1.5, gitter: 0.25, stellen: 1, csv: "laenge" },
    ],
    klassen: [
      { name: "Enzian", farbe: FARBE.blau, form: "kreis" },
      { name: "Mohn", farbe: FARBE.akzent, form: "dreieck" },
    ],
    // [Breite, Länge, Klasse, Name] – Werte aus der Tabelle im Skript
    fest: [
      [0.3, 0.7, 0, "Enzian 1"],
      [0.9, 0.2, 0, "Enzian 2"],
      [0.2, 0.5, 0, "Enzian 3"],
      [0.4, 0.2, 0, "Enzian 4"],
      [0.6, 0.3, 0, "Enzian 5"],
      [1.0, 0.9, 1, "Mohn 1"],
      [0.8, 0.6, 1, "Mohn 2"],
      [1.2, 0.5, 1, "Mohn 3"],
      [0.6, 0.8, 1, "Mohn 4"],
      [1.3, 0.7, 1, "Mohn 5"],
    ],
    trennbar: true,
    biasNoetig: true,
    wort: { einzahl: "Pflanze", mehrzahl: "Pflanzen" },
    csvDatei: "pflanzen_skript.csv",
  },

  oder: {
    name: "Logik · ODER",
    titel: "Wahrheitstabelle · logisches ODER",
    untertitel: "wie in der Praxiswerkstatt MemBrain (lsP) · ein Neuron · linear trennbar",
    merkmale: [
      { name: "Eingang A", kurz: "A", einheit: "", min: -0.25, max: 1.25, gitter: 0.25, stellen: 0, csv: "a" },
      { name: "Eingang B", kurz: "B", einheit: "", min: -0.25, max: 1.25, gitter: 0.25, stellen: 0, csv: "b" },
    ],
    klassen: [
      { name: "Ausgang 0", farbe: FARBE.blau, form: "kreis" },
      { name: "Ausgang 1", farbe: FARBE.akzent, form: "dreieck" },
    ],
    fest: [
      [0, 0, 0, "0 ODER 0"],
      [0, 1, 1, "0 ODER 1"],
      [1, 0, 1, "1 ODER 0"],
      [1, 1, 1, "1 ODER 1"],
    ],
    trennbar: true,
    biasNoetig: true,
    wort: { einzahl: "Muster", mehrzahl: "Muster" },
    csvDatei: "logik_oder.csv",
  },

  sortierung: {
    name: "Sortierstation · Material",
    titel: "Sensordaten · Sortierstation",
    untertitel: "Werkstücke erkennen · ein Neuron · Kunststoff oder Metall?",
    startwert: 20261117,
    merkmale: [
      { name: "Induktiver Sensor", kurz: "U_ind", einheit: "V", min: 0, max: 10, gitter: 1, stellen: 1, csv: "induktiv_v" },
      { name: "Reflexion", kurz: "Refl", einheit: "%", min: 0, max: 100, gitter: 10, stellen: 0, csv: "reflexion_prozent" },
    ],
    klassen: [
      { name: "Kunststoff", farbe: FARBE.blau, form: "kreis" },
      { name: "Metall", farbe: FARBE.akzent, form: "dreieck" },
    ],
    // je Klasse: Mittelwert und Streuung beider Merkmale, Anzahl
    wolken: [
      { mx: 2.6, sx: 0.9, my: 36, sy: 11, n: 18 },
      { mx: 6.8, sx: 0.9, my: 64, sy: 11, n: 18 },
    ],
    trennbar: true,
    biasNoetig: false,
    wort: { einzahl: "Werkstück", mehrzahl: "Werkstücke" },
    csvDatei: "sensordaten_sortierstation.csv",
  },

  motor: {
    name: "Förderband · Überlast",
    titel: "Antriebsdaten · Förderband M1",
    untertitel: "Zustandsüberwachung · ein Neuron · die Grenze liegt schräg",
    startwert: 20261118,
    merkmale: [
      { name: "Beladung", kurz: "m", einheit: "kg", min: 0, max: 10, gitter: 1, stellen: 1, csv: "beladung_kg" },
      { name: "Motorstrom", kurz: "I", einheit: "A", min: 0, max: 1.6, gitter: 0.2, stellen: 2, csv: "motorstrom_a" },
    ],
    klassen: [
      { name: "normal", farbe: FARBE.blau, form: "kreis" },
      { name: "Überlast", farbe: FARBE.akzent, form: "dreieck" },
    ],
    // Motorstrom abhängig von der Beladung: I = a + b · m + Rauschen
    linien: [
      { von: 0.5, bis: 9.5, a: 0.1, b: 0.07, s: 0.035, n: 20 },
      { von: 0.5, bis: 9.5, a: 0.44, b: 0.07, s: 0.04, n: 16 },
    ],
    trennbar: true,
    biasNoetig: true,
    wort: { einzahl: "Messung", mehrzahl: "Messungen" },
    csvDatei: "antriebsdaten_foerderband.csv",
  },

  xor: {
    name: "Logik · XOR",
    titel: "Wahrheitstabelle · logisches XOR",
    untertitel: "wie in der Praxiswerkstatt MemBrain (nlsP) · nicht linear trennbar",
    merkmale: [
      { name: "Eingang A", kurz: "A", einheit: "", min: -0.25, max: 1.25, gitter: 0.25, stellen: 0, csv: "a" },
      { name: "Eingang B", kurz: "B", einheit: "", min: -0.25, max: 1.25, gitter: 0.25, stellen: 0, csv: "b" },
    ],
    klassen: [
      { name: "Ausgang 0", farbe: FARBE.blau, form: "kreis" },
      { name: "Ausgang 1", farbe: FARBE.akzent, form: "dreieck" },
    ],
    fest: [
      [0, 0, 0, "0 XOR 0"],
      [0, 1, 1, "0 XOR 1"],
      [1, 0, 1, "1 XOR 0"],
      [1, 1, 0, "1 XOR 1"],
    ],
    trennbar: false,
    biasNoetig: true,
    wort: { einzahl: "Muster", mehrzahl: "Muster" },
    csvDatei: "logik_xor.csv",
  },
};

// aktives Beispiel – wird mit setzeSzenario() umgeschaltet
let SZ = SZENARIEN.skript;
let MERKMALE = SZ.merkmale;

function setzeSzenario(schluessel) {
  SZ = SZENARIEN[schluessel];
  MERKMALE = SZ.merkmale;
}

function runde(v, m) {
  return Number(v.toFixed(m.stellen));
}

function erzeugeDaten(startwert) {
  const [m1, m2] = MERKMALE;
  const liste = [];
  const neu = (x, y, k, name) => {
    liste.push({
      x: runde(begrenzen(x, m1.min, m1.max), m1),
      y: runde(begrenzen(y, m2.min, m2.max), m2),
      k,
      name,
    });
  };
  if (SZ.fest) {
    for (const [x, y, k, name] of SZ.fest) {
      neu(x, y, k, name);
    }
  } else {
    const rnd = zufallsGenerator(startwert);
    if (SZ.wolken) {
      SZ.wolken.forEach((w, k) => {
        for (let i = 0; i < w.n; i++) {
          neu(w.mx + gaussZahl(rnd) * w.sx, w.my + gaussZahl(rnd) * w.sy, k);
        }
      });
    } else if (SZ.linien) {
      SZ.linien.forEach((l, k) => {
        for (let i = 0; i < l.n; i++) {
          const x = l.von + rnd() * (l.bis - l.von);
          neu(x, l.a + l.b * x + gaussZahl(rnd) * l.s, k);
        }
      });
    }
    // Überschneidungen entfernen, damit das Beispiel linear trennbar bleibt
    if (SZ.trennbar) {
      bereinigeUeberlappung(liste);
    }
    // in zufälliger Reihenfolge (wie gemessen)
    for (const p of liste) {
      p.r = rnd();
    }
    liste.sort((a, b) => a.r - b.r);
  }
  for (let i = 0; i < liste.length; i++) {
    liste[i].id = (SZ.fest ? 1 : 101) + i;
    if (!liste[i].name) {
      liste[i].name = `${SZ.wort.einzahl} ${liste[i].id}`;
    }
    delete liste[i].r;
  }
  return liste;
}

// Entfernt Punkte, die auf der "falschen" Seite der Mittellinie zwischen den
// beiden Klassenschwerpunkten liegen (in normierten Koordinaten). So bleibt
// ein simuliertes Beispiel sicher linear trennbar.
function bereinigeUeberlappung(liste) {
  if (SZ.linien) {
    // schräge Grenze: Mittellinie zwischen den beiden Geraden mit Sicherheitsabstand
    const [l0, l1] = SZ.linien;
    const rand = (l1.a - l0.a) * 0.12;
    for (let i = liste.length - 1; i >= 0; i--) {
      const p = liste[i];
      const mitte = (l0.a + l1.a) / 2 + ((l0.b + l1.b) / 2) * p.x;
      if ((p.k === 0 && p.y > mitte - rand) || (p.k === 1 && p.y < mitte + rand)) {
        liste.splice(i, 1);
      }
    }
    return;
  }
  const s = [
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (const p of liste) {
    const [a, b] = normiere(p);
    s[p.k][0] += a;
    s[p.k][1] += b;
    s[p.k][2]++;
  }
  const m0 = [s[0][0] / s[0][2], s[0][1] / s[0][2]];
  const m1 = [s[1][0] / s[1][2], s[1][1] / s[1][2]];
  const n = [m1[0] - m0[0], m1[1] - m0[1]];
  const mitte = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2];
  const abstand = (p) => {
    const [a, b] = normiere(p);
    return ((a - mitte[0]) * n[0] + (b - mitte[1]) * n[1]) / Math.hypot(n[0], n[1]);
  };
  for (let i = liste.length - 1; i >= 0; i--) {
    const d = abstand(liste[i]);
    if ((liste[i].k === 0 && d > -0.06) || (liste[i].k === 1 && d < 0.06)) {
      liste.splice(i, 1);
    }
  }
}

// Merkmale auf −1 … +1 umrechnen (normieren) – damit rechnet das Neuron
function normiere(p) {
  const [m1, m2] = MERKMALE;
  return [(2 * (p.x - m1.min)) / (m1.max - m1.min) - 1, (2 * (p.y - m2.min)) / (m2.max - m2.min) - 1];
}

function wertText(v, m) {
  return v.toFixed(m.stellen).replace(".", ",") + (m.einheit ? " " + m.einheit : "");
}

if (typeof module !== "undefined") {
  module.exports = { SZENARIEN, setzeSzenario, erzeugeDaten, normiere };
}
