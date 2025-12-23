import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Notes() {
  const [notes, setNotes] = useState([
    { id: 1, text: "Sticky note", color: "#FFF7A8", updatedAt: "22 Dec 2025" },
    { id: 2, text: "Sticky note", color: "#FFF7A8", updatedAt: "22 Dec 2025" },
    { id: 3, text: "Sticky note", color: "#FFD6DC", updatedAt: "22 Dec 2025" },
    { id: 4, text: "Sticky note", color: "#E8F6F1", updatedAt: "22 Dec 2025" },
    { id: 5, text: "Sticky note", color: "#BBD7F0", updatedAt: "22 Dec 2025" },
  ]);

  const [showEditor, setShowEditor] = useState(false);
  const [draft, setDraft] = useState("");

  const addNote = () => {
    if (!draft.trim()) return;

    setNotes([
      ...notes,
      {
        id: Date.now(),
        text: draft,
        color: "#F2E9FF",
        updatedAt: new Date().toLocaleDateString(),
      },
    ]);

    setDraft("");
    setShowEditor(false);
  };

  return (
    <div style={styles.page}>
      <Sidebar />

      <div style={styles.main}>
        <Header role="Project Manager" />

        <div style={styles.content}>
          <div style={styles.layout}>
            {/* NOTES GRID */}
            <div style={styles.grid}>
              {notes.map(note => (
                <div
                  key={note.id}
                  style={{ ...styles.note, background: note.color }}
                >
                  <div style={styles.noteText}>{note.text}</div>
                  <div style={styles.noteDate}>
                    Last updated {note.updatedAt}
                  </div>
                  <div style={styles.fold} />
                </div>
              ))}
            </div>

            {/* EDITOR CARD */}
            {showEditor && (
              <div style={styles.editor}>
                <textarea
                  placeholder="Type anything to remember"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  style={styles.textarea}
                />

                <div style={styles.editorFooter}>
                  <div style={styles.toolbar}>
                    <b>B</b> <i>I</i> <u>U</u> <s>S</s> ≡
                  </div>

                  <button style={styles.checkBtn} onClick={addNote}>
                    ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ADD NOTE BUTTON */}
        <button style={styles.addBtn} onClick={() => setShowEditor(true)}>
          + Add note
        </button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f7f7f7",
  },

  main: {
    flex: 1,
    position: "relative",
    overflow: "auto",
  },

  content: {
    padding: 30,
  },

  layout: {
    display: "flex",
    gap: 30,
    alignItems: "flex-start",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
    flex: 1,
  },

  note: {
    position: "relative",
    height: 180,
    padding: 14,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: 13,
  },

  noteText: {
    whiteSpace: "pre-wrap",
  },

  noteDate: {
    fontSize: 11,
    color: "#555",
    textAlign: "right",
  },

  fold: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeft: "18px solid #00000020",
    borderTop: "18px solid transparent",
  },

  editor: {
    width: 320,
    height: 260,
    background: "#F2E9FF",
    borderRadius: 6,
    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    padding: 12,
  },

  textarea: {
    flex: 1,
    border: "none",
    outline: "none",
    resize: "none",
    background: "transparent",
    fontSize: 14,
  },

  editorFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  toolbar: {
    display: "flex",
    gap: 10,
    fontSize: 13,
    color: "#444",
  },

  checkBtn: {
    border: "none",
    background: "#4caf50",
    color: "#fff",
    borderRadius: "50%",
    width: 28,
    height: 28,
    cursor: "pointer",
  },

  addBtn: {
    position: "fixed",
    bottom: 30,
    right: 30,
    background: "#ff8a80",
    border: "none",
    padding: "12px 20px",
    borderRadius: 30,
    fontSize: 15,
    cursor: "pointer",
  },
};
