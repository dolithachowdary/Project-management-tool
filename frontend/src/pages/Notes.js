import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  MoreHorizontal,
  Check
} from "lucide-react";

/* ================= CONSTANTS ================= */

const COLORS = [
  "#FFF6A8",
  "#DFF3DC",
  "#F9D3E3",
  "#E6DAFF",
  "#DCEBFF",
  "#E5E5E5",
  "#9E9E9E"
];

/* ================= COMPONENT ================= */

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const editorRef = useRef(null);

  /* -------- TEXT FORMATTING -------- */
  const format = (cmd) => {
    editorRef.current.focus();
    document.execCommand(cmd);
  };

  /* -------- SAVE NOTE (✓ ONLY) -------- */
  const saveNote = () => {
    const html = editorRef.current.innerHTML.trim();
    if (!html) return;

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? {
                ...n,
                html,
                color: activeColor,
                updatedAt: new Date().toLocaleDateString()
              }
            : n
        )
      );
    } else {
      setNotes((prev) => [
        {
          id: Date.now(),
          html,
          color: activeColor,
          updatedAt: new Date().toLocaleDateString()
        },
        ...prev
      ]);
    }

    editorRef.current.innerHTML = "";
    setEditingId(null);
  };

  /* -------- MENU ACTIONS -------- */
  const deleteNote = (id) =>
    setNotes((prev) => prev.filter((n) => n.id !== id));

  const copyNote = (html) =>
    navigator.clipboard.writeText(
      html.replace(/<[^>]*>/g, "")
    );

  const editNote = (note) => {
    editorRef.current.innerHTML = note.html;
    setActiveColor(note.color);
    setEditingId(note.id);
    setOpenMenu(null);
  };

  /* ================= RENDER ================= */

  return (
    <div style={styles.page}>
      <Sidebar />

      <div style={styles.main}>
        <Header title="Notes" />

        <div style={styles.content}>
          <div style={styles.layout}>

            {/* ================= NOTES GRID ================= */}
            <div style={styles.grid}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{ ...styles.note, background: note.color }}
                >
                  <div
                    style={styles.noteBody}
                    dangerouslySetInnerHTML={{ __html: note.html }}
                  />

                  <div style={styles.noteFooter}>
                    <span>Last updated {note.updatedAt}</span>

                    <div style={styles.menuWrapper}>
                      <MoreHorizontal
                        size={16}
                        onClick={() =>
                          setOpenMenu(openMenu === note.id ? null : note.id)
                        }
                      />

                      {openMenu === note.id && (
                        <div style={styles.menu}>
                          <MenuItem onClick={() => editNote(note)}>
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => copyNote(note.html)}>
                            Copy
                          </MenuItem>
                          <MenuItem danger onClick={() => deleteNote(note.id)}>
                            Delete
                          </MenuItem>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= EDITOR ================= */}
            <div style={{ ...styles.editor, background: activeColor }}>

              {/* COLOR PICKER */}
              <div style={styles.colorRow}>
                {COLORS.map((c) => (
                  <span
                    key={c}
                    onClick={() => setActiveColor(c)}
                    style={{
                      ...styles.colorDot,
                      background: c,
                      outline:
                        c === activeColor ? "2px solid #333" : "none"
                    }}
                  />
                ))}
              </div>

              {/* EDITABLE AREA */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                style={styles.editorBody}
                placeholder="Type anything to remember"
              />

              {/* TOOLBAR */}
              <div style={styles.toolbar}>
                <IconBtn onClick={() => format("bold")}>
                  <Bold size={14} />
                </IconBtn>
                <IconBtn onClick={() => format("italic")}>
                  <Italic size={14} />
                </IconBtn>
                <IconBtn onClick={() => format("underline")}>
                  <Underline size={14} />
                </IconBtn>
                <IconBtn onClick={() => format("strikeThrough")}>
                  <Strikethrough size={14} />
                </IconBtn>
                <IconBtn onClick={() => format("insertUnorderedList")}>
                  <List size={14} />
                </IconBtn>

                <IconBtn primary onClick={saveNote}>
                  <Check size={16} />
                </IconBtn>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL UI COMPONENTS ================= */

function IconBtn({ children, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.iconBtn,
        background: primary ? "#111" : "transparent",
        color: primary ? "#fff" : "#333"
      }}
    >
      {children}
    </button>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 14px",
        fontSize: 13,
        cursor: "pointer",
        color: danger ? "#c62828" : "#333"
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "#f2f2f2")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      {children}
    </div>
  );
}

/* ================= INTERNAL CSS ================= */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f5f6f8"
  },

  main: {
    flex: 1,
    overflow: "auto"
  },

  content: {
    padding: 28
  },

  layout: {
    display: "flex",
    gap: 40,
    alignItems: "flex-start"
  },

  /* -------- NOTES GRID -------- */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 220px)",
    gap: 20,
    flex: 1
  },

  note: {
    minHeight: 180,
    padding: 14,
    borderRadius: 10,
    boxShadow: "0 6px 18px rgba(0,0,0,.15)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: 14
  },

  noteBody: {
    whiteSpace: "pre-wrap"
  },

  noteFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#555",
    marginTop: 12
  },

  menuWrapper: {
    position: "relative",
    cursor: "pointer"
  },

  menu: {
    position: "absolute",
    right: 0,
    top: 20,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0,0,0,.25)",
    minWidth: 120,
    zIndex: 20
  },

  /* -------- EDITOR -------- */
  editor: {
    width: 340,
    height: 280,
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,.25)",
    display: "flex",
    flexDirection: "column"
  },

  colorRow: {
    display: "flex",
    gap: 8,
    marginBottom: 10
  },

  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    cursor: "pointer"
  },

  editorBody: {
    flex: 1,
    outline: "none",
    fontSize: 14,
    lineHeight: 1.5
  },

  toolbar: {
    display: "flex",
    gap: 6,
    paddingTop: 8
  },

  iconBtn: {
    border: "none",
    padding: 6,
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
