// =============================================================================
//  ui.js – HTML-Bedienelemente über der Zeichenfläche
// =============================================================================
//  Positionen im logischen 1600×900-Raster (Helfer in basis.js).
// =============================================================================

function erstelleUi() {
  erstelleHuelle();
  erstelleBeispielReiter(szenarioWechseln);

  ui.neueDaten = knopf(1230, 12, 150, "Neue Messdaten", neueMessdaten, "kopf");
  ui.csv = knopf(1388, 12, 148, "CSV speichern", csvSpeichern, "kopf");

  // --- unter dem Diagramm ----------------------------------------------------
  ui.flaeche = knopf(40, 830, 236, "Halbebenen ausblenden", () => {
    flaecheAn = !flaecheAn;
  });
  ui.falsche = knopf(286, 830, 256, "Fehlklassifikationen ausblenden", () => {
    falscheAn = !falscheAn;
  });

  // --- Ablauf (Erklärfeld) ---------------------------------------------------
  ui.schritt = knopf(876, 284, 190, "Schritt ▶ (→)", schritt, "dunkel");
  ui.auto = knopf(1074, 284, 190, "▶ Automatisch", autoUmschalten, "primaer");
  ui.neu = knopf(1272, 284, 190, "↺ Neu starten (R)", neuStarten);
  ui.epoche = knopf(1470, 284, 92, "⏭ (E)", epocheWeiter);
  ui.epoche.attribute("title", "bis zum Ende der Epoche springen");

  // --- Einstellungen ---------------------------------------------------------
  platziere(createSpan("Verfahren"), 876, 380, 80);
  ui.verfahren = auswahl(
    956,
    380,
    262,
    [
      ["① Gewichte per Hand", "hand"],
      ["② Perzeptron-Lernregel", "lernen"],
    ],
    verfahren,
    verfahrenWechseln
  );

  platziere(createSpan("Lernrate η"), 1236, 380, 84);
  ui.lernrate = auswahl(
    1320,
    380,
    78,
    ["0.05", "0.1", "0.5", "1"].map((v) => [v.replace(".", ","), v]),
    String(lernrate),
    (v) => {
      lernrate = parseFloat(v);
      neuStarten();
    }
  );

  platziere(createSpan("Tempo"), 1418, 380, 56);
  ui.tempo = auswahl(
    1474,
    380,
    90,
    ["langsam", "mittel", "schnell"].map((v) => [v, v]),
    tempo,
    (v) => {
      tempo = v;
    }
  );

  ui.bias = kaestchen(876, 418, 330, "Bias b verwenden (Eingang immer 1)", mitBias, (an) => {
    biasUmschalten(an);
  });
  ui.start = knopf(1300, 414, 262, "🎲 Neue Startgewichte", neueStartgewichte);

  // --- Gewichte (im Neuron-Feld) ---------------------------------------------
  ui.regler = {};
  const zeilen = [
    ["w1", "w₁", 548],
    ["w2", "w₂", 590],
    ["b", "b", 632],
  ];
  for (const [id, name, y] of zeilen) {
    platziere(createSpan(`<b>${name}</b>`), 1342, y - 4, 30);
    const r = platziere(createSlider(-2, 2, 0, 0.01), 1372, y, 142);
    r.input(() => {
      if (verfahren === "hand") {
        handGewichte[id] = Number(r.value());
        if (id === "b" && !mitBias) {
          handGewichte.b = 0;
        }
      }
    });
    r.changed(() => r.elt.blur());
    ui.regler[id] = r;
    ui.regler[id + "Wert"] = platziere(createSpan(""), 1520, y - 4, 52);
  }
}

// Beschriftung eines Kästchens ändern (p5 legt den Text in ein <span> oder <label>)
function kaestchenText(el, text) {
  const ziel = el.elt.querySelector("span") || el.elt.querySelector("label");
  if (ziel && ziel.textContent !== " " + text) {
    ziel.textContent = " " + text;
  }
}

// wird in jedem Frame aufgerufen
function aktualisiereUi() {
  const lernen = verfahren === "lernen";
  const fertig = lernen && lernFertig();

  beschrifte(ui.auto, laufAuto ? "■ Anhalten" : "▶ Automatisch");
  klasse(ui.auto, "primaer", !laufAuto);
  klasse(ui.auto, "dunkel", laufAuto);
  if (!lernen) {
    beschrifte(ui.schritt, "Regler schieben ✋");
  } else {
    beschrifte(ui.schritt, schrittIndex < 0 ? "Erster Punkt ▶ (→)" : fertig ? "Fertig ✓" : "Nächster Punkt ▶ (→)");
  }
  sperre(ui.schritt, !lernen || laufAuto || fertig);
  sperre(ui.auto, !lernen || fertig);
  sperre(ui.epoche, !lernen || laufAuto || fertig);

  beschrifte(ui.flaeche, flaecheAn ? "Halbebenen ausblenden" : "Halbebenen zeigen");
  klasse(ui.flaeche, "kopf", true);
  klasse(ui.flaeche, "aktiv", flaecheAn);
  beschrifte(ui.falsche, falscheAn ? "Fehlklassifikationen ausblenden" : "Fehlklassifikationen zeigen");
  klasse(ui.falsche, "kopf", true);
  klasse(ui.falsche, "aktiv", falscheAn);

  if (ui.verfahren.value() !== verfahren) {
    ui.verfahren.selected(verfahren);
  }
  if (ui.bias.checked() !== mitBias) {
    ui.bias.checked(mitBias);
  }

  // Regler zeigen immer die aktuellen Gewichte; bedienbar nur per Hand
  const w = aktuelleGewichte();
  for (const id of ["w1", "w2", "b"]) {
    const r = ui.regler[id];
    if (Math.abs(Number(r.value()) - w[id]) > 0.005 && document.activeElement !== r.elt) {
      r.value(begrenzen(w[id], -2, 2));
    }
    sperre(r, lernen || laufAuto || (id === "b" && !mitBias));
    beschrifte(ui.regler[id + "Wert"], `<span style="font-family:'JetBrains Mono',monospace">${fKomma(w[id], 2)}</span>`);
  }

  aktualisiereBeispielReiter(szenario, laufAuto);
  sperre(ui.lernrate, laufAuto || !lernen);
  sperre(ui.neueDaten, laufAuto || !!SZ.fest);
  sperre(ui.verfahren, laufAuto);
  sperre(ui.neu, laufAuto);
  sperre(ui.bias, laufAuto);
  sperre(ui.start, laufAuto);
}
