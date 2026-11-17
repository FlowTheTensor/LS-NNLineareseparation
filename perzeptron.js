// =============================================================================
//  perzeptron.js – ein einzelnes künstliches Neuron (reine Logik, ohne p5)
// =============================================================================
//  Eingänge x₁, x₂ (normiert auf −1 … +1), Gewichte w₁, w₂ und Bias b.
//
//    Summe        Σ = w₁·x₁ + w₂·x₂ + b
//    Aktivierung  ŷ = +1, wenn Σ > 0, sonst −1   (Sprungfunktion, step)
//
//  Lernregel (Perzeptron-Lernregel nach Rosenblatt):
//    Fehler       e = t − ŷ          (t = richtiger Zielwert, nur 0, +2 oder −2)
//    Anpassung    w₁ ← w₁ + η·e·x₁
//                 w₂ ← w₂ + η·e·x₂
//                 b  ← b  + η·e·1     (der Bias hat immer den Eingang 1)
//
//  Ist e = 0, bleibt alles, wie es ist. Eine Epoche ist ein Durchlauf durch
//  alle Trainingsdaten. Sind die Daten linear trennbar, findet die Lernregel
//  nach endlich vielen Epochen eine Trennlinie (Konvergenzsatz). Sonst
//  (z. B. XOR) korrigiert sie endlos weiter.
//
//  Alle Lernschritte werden vorab berechnet (lernVerlauf). Die Oberfläche
//  blättert nur durch die Liste.
// =============================================================================

const MAX_EPOCHEN = 40;

// Zielwert aus der Klasse: Klasse 0 → −1, Klasse 1 → +1
function zielwert(k) {
  return k === 1 ? 1 : -1;
}

function klasseAus(y) {
  return y > 0 ? 1 : 0;
}

function aktivierung(summe) {
  return summe > 0 ? 1 : -1;
}

// w = {w1, w2, b}; x = [x1, x2] (normiert)
function neuronSumme(w, x) {
  return w.w1 * x[0] + w.w2 * x[1] + w.b;
}

function vorhersage(w, x) {
  const summe = neuronSumme(w, x);
  return { summe, y: aktivierung(summe) };
}

// Ein Lernschritt für einen Trainingspunkt
function lernschritt(w, x, t, eta, mitBias) {
  const { summe, y } = vorhersage(w, x);
  const e = t - y;
  const neu = {
    w1: w.w1 + eta * e * x[0],
    w2: w.w2 + eta * e * x[1],
    b: mitBias ? w.b + eta * e : 0,
  };
  return { summe, y, e, neu, delta: { w1: neu.w1 - w.w1, w2: neu.w2 - w.w2, b: neu.b - w.b } };
}

// Alle Lernschritte vorab berechnen.
//   daten:  [{x, y, k, xn: [x1, x2]}]
//   start:  {w1, w2, b}
// Ergebnis: {schritte, epochen, konvergiert}
//   schritte[i] = {epoche, index, punkt, vorher, summe, y, t, e, nachher, delta}
//   epochen[j]  = {fehler, richtigAmEnde}
function lernVerlauf(daten, start, eta, mitBias, maxEpochen) {
  const schritte = [];
  const epochen = [];
  let w = { w1: start.w1, w2: start.w2, b: mitBias ? start.b : 0 };
  let konvergiert = false;
  const grenze = maxEpochen || MAX_EPOCHEN;
  for (let ep = 0; ep < grenze; ep++) {
    let fehler = 0;
    for (let i = 0; i < daten.length; i++) {
      const p = daten[i];
      const t = zielwert(p.k);
      const r = lernschritt(w, p.xn, t, eta, mitBias);
      if (r.e !== 0) {
        fehler++;
      }
      schritte.push({ epoche: ep, index: i, punkt: p, vorher: w, summe: r.summe, y: r.y, t, e: r.e, nachher: r.neu, delta: r.delta });
      w = r.neu;
    }
    epochen.push({ fehler, richtigAmEnde: anzahlRichtig(daten, w) });
    if (fehler === 0) {
      konvergiert = true;
      break;
    }
  }
  return { schritte, epochen, konvergiert };
}

function anzahlRichtig(daten, w) {
  let n = 0;
  for (const p of daten) {
    if (vorhersage(w, p.xn).y === zielwert(p.k)) {
      n++;
    }
  }
  return n;
}

// Konfusionsmatrix m[tatsächlich][vorhergesagt]
function konfusion(daten, w) {
  const m = [
    [0, 0],
    [0, 0],
  ];
  for (const p of daten) {
    m[p.k][klasseAus(vorhersage(w, p.xn).y)]++;
  }
  return m;
}

// Trennlinie Σ = 0 im normierten Quadrat [−1, 1]²: Schnittpunkte mit dem Rand
// (null, wenn die Linie das Quadrat nicht schneidet oder w₁ = w₂ = 0 ist)
function trennlinie(w) {
  if (Math.abs(w.w1) < 1e-12 && Math.abs(w.w2) < 1e-12) {
    return null;
  }
  const pkt = [];
  const add = (x, y) => {
    if (x >= -1 - 1e-9 && x <= 1 + 1e-9 && y >= -1 - 1e-9 && y <= 1 + 1e-9) {
      for (const q of pkt) {
        if (Math.abs(q[0] - x) < 1e-9 && Math.abs(q[1] - y) < 1e-9) {
          return;
        }
      }
      pkt.push([x, y]);
    }
  };
  if (Math.abs(w.w2) > 1e-12) {
    add(-1, (-w.b + w.w1) / w.w2);
    add(1, (-w.b - w.w1) / w.w2);
  }
  if (Math.abs(w.w1) > 1e-12) {
    add((-w.b + w.w2) / w.w1, -1);
    add((-w.b - w.w2) / w.w1, 1);
  }
  return pkt.length >= 2 ? [pkt[0], pkt[1]] : null;
}

// Halbebene Σ > 0 als Polygon innerhalb des Quadrats [−1, 1]² (Sutherland-Hodgman)
function halbebene(w, positiv) {
  const ecken = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const s = (p) => (positiv ? 1 : -1) * neuronSumme(w, p);
  const aus = [];
  for (let i = 0; i < ecken.length; i++) {
    const a = ecken[i];
    const b = ecken[(i + 1) % ecken.length];
    const sa = s(a);
    const sb = s(b);
    if (sa > 0) {
      aus.push(a);
    }
    if ((sa > 0 && sb <= 0) || (sa <= 0 && sb > 0)) {
      const t = sa / (sa - sb);
      aus.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return aus;
}

if (typeof module !== "undefined") {
  module.exports = { zielwert, klasseAus, aktivierung, neuronSumme, vorhersage, lernschritt, lernVerlauf, anzahlRichtig, konfusion, trennlinie, halbebene, MAX_EPOCHEN };
}
