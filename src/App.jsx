import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "monopoly_custom_cards_v10";
const MAX_CARD_TEXT_LENGTH = 90;
const MAX_EFFECT_TEXT_LENGTH = 70;

function createId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id_${String(Date.now())}_${String(Math.random()).replace("0.", "")}`;
}

function limitText(value, maxLength) {
  return String(value || "").slice(0, maxLength);
}

function getAdaptiveFontSize(text, largeSize, mediumSize, smallSize, extraSmallSize) {
  const length = String(text || "").length;
  if (length > 78) return extraSmallSize;
  if (length > 58) return smallSize;
  if (length > 38) return mediumSize;
  return largeSize;
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function getTypeLabel(type) {
  return type === "community" ? "CAISSE DE COMMUNAUTÉ" : "CHANCE";
}

function getButtonLabel(type) {
  return type === "community" ? "CAISSE DE\nCOMMUNAUTÉ" : "CHANCE";
}

function getTypeColor(type) {
  return type === "community" ? "#2468f2" : "#f01924";
}

function normalizeEffectsArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((effect) => limitText(effect, MAX_EFFECT_TEXT_LENGTH).trim())
    .filter(Boolean);
}

const defaultData = {
  cards: [
    {
      id: "demo_chance_1",
      type: "chance",
      text: "Tu as oublié l’anniversaire",
      effects: ["Donne 50 à la banque", "Passe ton prochain tour"]
    },
    {
      id: "demo_community_1",
      type: "community",
      text: "Tout le monde sait que tu vas négocier pendant 20 minutes",
      effects: ["Reçois 100", "Donne 20 à chaque joueur"]
    }
  ]
};

function normalizeData(value) {
  if (!value || !Array.isArray(value.cards)) return defaultData;
  return {
    cards: value.cards
      .filter((card) => card && typeof card.text === "string")
      .map((card) => ({
        id: card.id || createId(),
        type: card.type === "community" ? "community" : "chance",
        text: limitText(card.text, MAX_CARD_TEXT_LENGTH),
        effects: normalizeEffectsArray(card.effects)
      }))
  };
}

function canUseLocalStorage() {
  try {
    if (typeof window === "undefined") return false;
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadData() {
  if (!canUseLocalStorage()) return defaultData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeData(JSON.parse(raw)) : defaultData;
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
  } catch {
    console.warn("Impossible de sauvegarder.");
  }
}

const styles = {
  page: { minHeight: "100vh", background: "#f4f4f4", fontFamily: "Arial, sans-serif" },
  phone: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", padding: 14, boxSizing: "border-box" },
  topButton: { width: "100%", minHeight: 74, border: "none", borderRadius: 22, background: "white", fontSize: 18, fontWeight: 900, boxShadow: "0 10px 24px rgba(0,0,0,0.12)", marginBottom: 18, cursor: "pointer", padding: "0 18px" },
  cardOuter: { width: "100%", height: 560, borderRadius: 42, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 16px 32px rgba(0,0,0,0.18)", marginBottom: 22 },
  cardHeader: { minHeight: 120, color: "white", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 30, fontWeight: 900, lineHeight: 1 },
  cardInner: { flex: 1, background: "white", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  cardText: { width: "100%", height: 210, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 900, lineHeight: 1.08, overflow: "hidden", overflowWrap: "break-word", wordBreak: "normal", hyphens: "none" },
  divider: { width: "70%", height: 2, background: "#dddddd", margin: "8px 0 28px" },
  effectText: { width: "100%", height: 90, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 900, overflow: "hidden", overflowWrap: "break-word", wordBreak: "normal", hyphens: "none" },
  bottomButtons: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  drawButton: { border: "none", borderRadius: 24, color: "white", height: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontWeight: 900, fontSize: 18, cursor: "pointer", boxShadow: "0 12px 26px rgba(0,0,0,0.16)", whiteSpace: "pre-line" },
  deckSvg: { width: 84, height: 60 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  headerRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 },
  blackButton: { width: "100%", minHeight: 52, border: "none", borderRadius: 16, background: "#111", color: "white", fontWeight: 900, cursor: "pointer" },
  whiteButton: { minHeight: 52, border: "2px solid #111", borderRadius: 16, background: "white", color: "#111", fontWeight: 900, cursor: "pointer" },
  smallGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 },
  cardListItem: { background: "white", border: "3px solid #111", borderRadius: 20, padding: 14, marginBottom: 12, boxShadow: "0 8px 18px rgba(0,0,0,0.10)" },
  listType: { fontSize: 13, fontWeight: 900, margin: "0 0 10px" },
  listText: { fontSize: 17, fontWeight: 800, lineHeight: 1.25, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", wordBreak: "break-word" },
  listEffects: { fontSize: 13, color: "#555", fontWeight: 700, lineHeight: 1.25, margin: "0 0 12px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", wordBreak: "break-word" },
  redButton: { width: "100%", minHeight: 52, border: "none", borderRadius: 16, background: "#f01924", color: "white", fontWeight: 900, cursor: "pointer" },
  blueButton: { width: "100%", minHeight: 52, border: "none", borderRadius: 16, background: "#2468f2", color: "white", fontWeight: 900, cursor: "pointer" },
  effectRow: { display: "grid", gridTemplateColumns: "1fr 52px", gap: 8, marginBottom: 8, alignItems: "stretch" },
  effectInput: { width: "100%", boxSizing: "border-box", border: "3px solid #111", borderRadius: 14, padding: 10, fontFamily: "Arial, sans-serif", fontSize: 15, fontWeight: 800 },
  smallDeleteButton: { width: 52, minHeight: 48, border: "none", borderRadius: 14, background: "#f01924", color: "white", fontWeight: 900, cursor: "pointer" },
  editor: { background: "white", border: "3px solid #111", borderRadius: 22, padding: 14, boxShadow: "0 8px 18px rgba(0,0,0,0.10)" },
  choiceGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 },
  choiceButton: { minHeight: 58, border: "2px solid #111", borderRadius: 16, background: "white", fontWeight: 900, cursor: "pointer" },
  textarea: { width: "100%", boxSizing: "border-box", border: "3px solid #111", borderRadius: 16, padding: 12, fontFamily: "Arial, sans-serif", fontSize: 16, fontWeight: 800, resize: "vertical", marginTop: 8 },
  label: { display: "block", fontSize: 14, fontWeight: 900, marginBottom: 14 },
  counter: { display: "block", marginTop: 6, fontSize: 12, color: "#777" },
  error: { color: "#f01924", fontWeight: 800 }
};

function DeckIcon() {
  return (
    <svg style={styles.deckSvg} viewBox="0 0 110 78" aria-hidden="true">
      <rect x="16" y="18" width="36" height="50" rx="7" fill="none" stroke="white" strokeWidth="7" transform="rotate(-10 34 43)" />
      <rect x="58" y="18" width="36" height="50" rx="7" fill="none" stroke="white" strokeWidth="7" transform="rotate(10 76 43)" />
      <rect x="37" y="10" width="36" height="56" rx="7" fill="none" stroke="white" strokeWidth="7" />
    </svg>
  );
}

function DrawnCard({ card }) {
  const headerColor = getTypeColor(card.type);
  const textSize = getAdaptiveFontSize(card.text, 42, 34, 28, 22);
  const effectSize = getAdaptiveFontSize(card.effect, 32, 26, 22, 18);
  return (
    <div style={{ ...styles.cardOuter, background: headerColor }}>
      <div style={{ ...styles.cardHeader, background: headerColor }}>{getTypeLabel(card.type)}</div>
      <div style={styles.cardInner}>
        <div style={{ ...styles.cardText, fontSize: textSize }}>{card.text}</div>
        <div style={styles.divider} />
        <div style={{ ...styles.effectText, fontSize: effectSize }}>{card.effect}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [mode, setMode] = useState("draw");
  const [editingCard, setEditingCard] = useState(null);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    setData(loadData());
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const counts = useMemo(() => ({
    chance: data.cards.filter((card) => card.type === "chance").length,
    community: data.cards.filter((card) => card.type === "community").length
  }), [data]);

  function drawCard(type) {
    const card = pickRandom(data.cards.filter((item) => item.type === type));
    if (!card) return;
    setCurrentDraw({ ...card, effect: pickRandom(card.effects) || "Aucun effet" });
    setMode("draw");
  }

  function startNewCard(type = "chance") {
    setEditingCard({ id: createId(), type, text: "", effects: [""] });
    setMode("edit");
  }

  function startEditCard(card) {
    setEditingCard({ ...card, effects: Array.isArray(card.effects) && card.effects.length ? [...card.effects] : [""] });
    setMode("edit");
  }

  function saveCard() {
    if (!editingCard) return;
    const cleanCard = {
      id: editingCard.id || createId(),
      type: editingCard.type === "community" ? "community" : "chance",
      text: limitText(editingCard.text.trim(), MAX_CARD_TEXT_LENGTH),
      effects: normalizeEffectsArray(editingCard.effects)
    };
    if (!cleanCard.text) return;
    setData((prev) => {
      const exists = prev.cards.some((card) => card.id === cleanCard.id);
      const cards = exists
        ? prev.cards.map((card) => (card.id === cleanCard.id ? cleanCard : card))
        : [...prev.cards, cleanCard];
      return normalizeData({ cards });
    });
    setEditingCard(null);
    setMode("library");
  }

  function updateEditingEffect(index, value) {
    if (!editingCard) return;
    const nextEffects = [...(editingCard.effects || [])];
    nextEffects[index] = limitText(value, MAX_EFFECT_TEXT_LENGTH);
    setEditingCard({ ...editingCard, effects: nextEffects });
  }

  function addEditingEffect() {
    if (!editingCard) return;
    setEditingCard({ ...editingCard, effects: [...(editingCard.effects || []), ""] });
  }

  function removeEditingEffect(index) {
    if (!editingCard) return;
    const nextEffects = (editingCard.effects || []).filter((_, itemIndex) => itemIndex !== index);
    setEditingCard({ ...editingCard, effects: nextEffects.length ? nextEffects : [""] });
  }

  function deleteCard(id) {
    setData((prev) => normalizeData({ cards: prev.cards.filter((card) => card.id !== id) }));
    if (currentDraw && currentDraw.id === id) setCurrentDraw(null);
  }

  function exportCards() {
    const blob = new Blob([JSON.stringify(normalizeData(data), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cartes-monopoly-personnalisees.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importCards(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setData(normalizeData(JSON.parse(String(reader.result || "{}"))));
        setImportError("");
        setCurrentDraw(null);
      } catch {
        setImportError("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <main style={styles.page}>
      <div style={styles.phone}>
        {mode === "draw" && (
          <>
            <button style={styles.topButton} onClick={() => setMode("library")}>⚙ Voir / Modifier / Ajouter une carte</button>
            {currentDraw ? <DrawnCard card={currentDraw} /> : <div style={{ ...styles.cardOuter, background: "#e5e5e5" }} />}
            <div style={styles.bottomButtons}>
              <button style={{ ...styles.drawButton, background: "#f01924" }} onClick={() => drawCard("chance")} title={`Chance (${counts.chance})`}><DeckIcon />{getButtonLabel("chance")}</button>
              <button style={{ ...styles.drawButton, background: "#2468f2" }} onClick={() => drawCard("community")} title={`Communauté (${counts.community})`}><DeckIcon />{getButtonLabel("community")}</button>
            </div>
          </>
        )}

        {mode === "library" && (
          <>
            <div style={styles.headerRow}>
              <button style={styles.whiteButton} onClick={() => setMode("draw")}>Retour</button>
              <button style={styles.blackButton} onClick={() => startNewCard("chance")}>Ajouter</button>
            </div>
            <div style={styles.smallGrid}>
              <button style={styles.whiteButton} onClick={exportCards}>Exporter</button>
              <label style={{ ...styles.whiteButton, display: "flex", alignItems: "center", justifyContent: "center" }}>Importer<input type="file" accept="application/json" style={{ display: "none" }} onChange={importCards} /></label>
            </div>
            {importError && <p style={styles.error}>{importError}</p>}
            {data.cards.map((card) => (
              <article key={card.id} style={{ ...styles.cardListItem, borderColor: getTypeColor(card.type) }}>
                <p style={{ ...styles.listType, color: getTypeColor(card.type) }}>{getTypeLabel(card.type)}</p>
                <p style={styles.listText}>{card.text}</p>
                <p style={styles.listEffects}>Conséquences : {card.effects.length ? card.effects.join(" / ") : "aucune"}</p>
                <div style={styles.row}>
                  <button style={styles.blackButton} onClick={() => startEditCard(card)}>Modifier</button>
                  <button style={styles.redButton} onClick={() => deleteCard(card.id)}>Supprimer</button>
                </div>
              </article>
            ))}
          </>
        )}

        {mode === "edit" && editingCard && (
          <>
            <div style={styles.headerRow}><button style={styles.whiteButton} onClick={() => setMode("library")}>Retour</button></div>
            <article style={styles.editor}>
              <div style={styles.choiceGrid}>
                <button style={{ ...styles.choiceButton, background: editingCard.type === "chance" ? "#f01924" : "white", color: editingCard.type === "chance" ? "white" : "#111" }} onClick={() => setEditingCard({ ...editingCard, type: "chance" })}>Chance</button>
                <button style={{ ...styles.choiceButton, background: editingCard.type === "community" ? "#2468f2" : "white", color: editingCard.type === "community" ? "white" : "#111" }} onClick={() => setEditingCard({ ...editingCard, type: "community" })}>Caisse</button>
              </div>
              <label style={styles.label}>Texte de la carte<textarea style={{ ...styles.textarea, minHeight: 130 }} maxLength={MAX_CARD_TEXT_LENGTH} value={editingCard.text} onChange={(event) => setEditingCard({ ...editingCard, text: limitText(event.target.value, MAX_CARD_TEXT_LENGTH) })} /></label>
              <span style={styles.counter}>{editingCard.text.length}/{MAX_CARD_TEXT_LENGTH} caractères</span>
              <div style={styles.label}>
                Conséquences possibles
                {(editingCard.effects || [""]).map((effect, index) => (
                  <div key={index} style={styles.effectRow}>
                    <input
                      style={styles.effectInput}
                      value={effect}
                      maxLength={MAX_EFFECT_TEXT_LENGTH}
                      placeholder={`Conséquence ${index + 1}`}
                      onChange={(event) => updateEditingEffect(index, event.target.value)}
                    />
                    <button style={styles.smallDeleteButton} onClick={() => removeEditingEffect(index)}>×</button>
                  </div>
                ))}
                <button style={styles.blueButton} onClick={addEditingEffect}>Ajouter une conséquence</button>
              </div>
              <div style={styles.row}>
                <button style={styles.blackButton} onClick={saveCard}>Enregistrer</button>
                <button style={styles.whiteButton} onClick={() => setMode("library")}>Annuler</button>
              </div>
            </article>
          </>
        )}
      </div>
    </main>
  );
}
