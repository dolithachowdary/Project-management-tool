import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  getNotes,
  createNote as createNoteApi,
  updateNote as updateNoteApi,
} from "../api/notes";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Check,
  Pencil,
} from "lucide-react";

/* ================= CONSTANTS ================= */

const COLORS = [
  { body: "#F3E8FF", header: "#E9D5FF", id: "purple" },
  { body: "#FEF9C3", header: "#FEF08A", id: "yellow" },
  { body: "#DCFCE7", header: "#BBF7D0", id: "green" },
  { body: "#FCE7F3", header: "#FBCFE8", id: "pink" },
  { body: "#DBEAFE", header: "#BFDBFE", id: "blue" },
  { body: "#E5E7EB", header: "#D1D5DB", id: "gray" },
  { body: "#4B5563", header: "#374151", id: "dark" }
];

export default function Notes() {
  const [notes, setNotes] = useState([]);

  // Widget
  const [newNoteColor, setNewNoteColor] = useState(COLORS[0]);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);

  // Editing
  const [editingId, setEditingId] = useState(null);
  const [editColor, setEditColor] = useState(null);

  // Menus
  const [openCardMenuId, setOpenCardMenuId] = useState(null);

  /* ================= FETCH NOTES ================= */

  const fetchNotes = useCallback(async () => {
    const data = await getNotes();
    setNotes(
      data.map(n => ({
        id: n.id,
        html: n.content_html,
        color: COLORS.find(c => c.id === n.color_id) || COLORS[0],
        updatedAt: new Date(n.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      }))
    );
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  /* ================= FORMATTING ================= */

  const format = (cmd, inline = false) => {
    const el = inline
      ? document.getElementById(`inline-editor-${editingId}`)
      : document.getElementById("new-note-editor");

    if (el) {
      el.focus();
      document.execCommand(cmd);
    }
  };

  /* ================= CREATE ================= */

  const createNote = async () => {
    const el = document.getElementById("new-note-editor");
    if (!el || !el.innerHTML.trim()) return;

    await createNoteApi({
      content_html: el.innerHTML,
      color_id: newNoteColor.id
    });

    el.innerHTML = "";
    setNewNoteColor(COLORS[0]);
    fetchNotes();
  };

  /* ================= UPDATE ================= */

  const updateNote = useCallback(async (id) => {
    const el = document.getElementById(`inline-editor-${id}`);
    if (!el) return;

    await updateNoteApi(id, {
      content_html: el.innerHTML,
      color_id: editColor?.id
    });

    setEditingId(null);
    setEditColor(null);
    fetchNotes();
  }, [editColor, fetchNotes]);

  /* ================= HELPERS ================= */

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditColor(note.color);
    setOpenCardMenuId(null);

    setTimeout(() => {
      const el = document.getElementById(`inline-editor-${note.id}`);
      if (el) {
        el.innerHTML = note.html;
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 50);
  };

  const closeAllMenus = () => {
    setOpenCardMenuId(null);
    setIsWidgetMenuOpen(false);
  };

  /* ================= CLICK OUTSIDE SAVE ================= */

  useEffect(() => {
    const handler = (e) => {
      if (editingId) {
        const card = document.getElementById(`editing-card-${editingId}`);
        if (card && !card.contains(e.target)) {
          updateNote(editingId);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editingId, updateNote]);

  /* ================= RENDER ================= */

  return (
    <div style={styles.page}>
      <Sidebar />

      {(openCardMenuId || isWidgetMenuOpen) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={closeAllMenus} />
      )}

      <div style={styles.main}>
        <Header title="Notes" />

        <div style={styles.content}>
          <div style={styles.grid}>
            {notes.map(note => {
              const isEditing = editingId === note.id;
              const color = isEditing ? (editColor || note.color) : note.color;

              if (isEditing) {
                return (
                  <div
                    key={note.id}
                    id={`editing-card-${note.id}`}
                    style={{ ...styles.note, background: color.body, outline: "2px solid #333" }}
                  >
                    <div style={{ ...styles.colorStrip, background: color.header }} />

                    <div
                      id={`inline-editor-${note.id}`}
                      contentEditable
                      suppressContentEditableWarning
                      style={styles.inlineEditorInput}
                    />

                    <div style={styles.inlineToolbar}>
                      <div style={styles.toolsLeftSmall}>
                        <button onClick={() => format("bold", true)} style={styles.toolBtnSmall}><Bold size={14} /></button>
                        <button onClick={() => format("italic", true)} style={styles.toolBtnSmall}><Italic size={14} /></button>
                        <button onClick={() => format("underline", true)} style={styles.toolBtnSmall}><Underline size={14} /></button>
                        <button onClick={() => format("strikeThrough", true)} style={styles.toolBtnSmall}><Strikethrough size={14} /></button>
                        <button onClick={() => format("insertUnorderedList", true)} style={styles.toolBtnSmall}><List size={14} /></button>
                      </div>
                      <button onClick={() => updateNote(note.id)} style={styles.saveBtnSmall}>
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={note.id} style={{ ...styles.note, background: note.color.body }}>
                  <div style={{ ...styles.colorStrip, background: note.color.header }} />
                  <div
                    style={styles.noteBody}
                    dangerouslySetInnerHTML={{ __html: note.html }}
                  />
                  <div style={styles.noteFooter}>
                    <span style={styles.date}>{note.updatedAt}</span>
                    <button
                      style={styles.iconBtnSmall}
                      onClick={() => startEditing(note)}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== NEW NOTE WIDGET ===== */}
        <div style={{ ...styles.editorWidget, background: newNoteColor.body }}>
          <div style={{ ...styles.colorStrip, background: newNoteColor.header }} />

          <div
            id="new-note-editor"
            contentEditable
            suppressContentEditableWarning
            style={styles.editorInput}
          />

          <div style={styles.editorToolbar}>
            <div style={styles.toolsLeft}>
              <button onClick={() => format("bold")} style={styles.toolBtn}><Bold size={16} /></button>
              <button onClick={() => format("italic")} style={styles.toolBtn}><Italic size={16} /></button>
              <button onClick={() => format("underline")} style={styles.toolBtn}><Underline size={16} /></button>
              <button onClick={() => format("strikeThrough")} style={styles.toolBtn}><Strikethrough size={16} /></button>
              <button onClick={() => format("insertUnorderedList")} style={styles.toolBtn}><List size={16} /></button>
            </div>

            <button onClick={createNote} style={styles.saveBtn}>
              <Check size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES (UNCHANGED FROM OLD CODE) ================= */

const styles = {
  page: { display: "flex", height: "100vh", background: "#F9FAFB" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  content: { padding: 15, flex: 1, overflowY: "auto" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 },

  note: {
    height: 200,
    borderRadius: 16,
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column"
  },

  colorStrip: { height: 12, borderRadius: "16px 16px 0 0" },

  noteBody: {
    padding: "16px 20px",
    flex: 1,
    overflowY: "auto",
    fontSize: 15
  },

  noteFooter: {
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between"
  },

  date: { fontSize: 12, opacity: 0.6 },

  inlineEditorInput: {
    flex: 1,
    padding: 16,
    outline: "none",
    fontSize: 15
  },

  inlineToolbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: 8
  },

  toolsLeftSmall: { display: "flex", gap: 4 },
  toolBtnSmall: { border: "none", background: "transparent", cursor: "pointer" },
  saveBtnSmall: { border: "none", background: "transparent", cursor: "pointer" },

  editorWidget: {
    position: "fixed",
    bottom: 30,
    right: 30,
    width: 320,
    minHeight: 260,
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column"
  },

  editorInput: {
    flex: 1,
    padding: 16,
    outline: "none",
    fontSize: 16
  },

  editorToolbar: {
    height: 50,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    padding: "0 16px"
  },

  toolsLeft: { display: "flex", gap: 4 },
  toolBtn: { border: "none", background: "transparent", cursor: "pointer" },
  saveBtn: { border: "none", background: "transparent", cursor: "pointer" }
};
