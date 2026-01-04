import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getNotes, createNote as createNoteApi, updateNote as updateNoteApi, deleteNote as deleteNoteApi } from "../api/notes";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  MoreHorizontal,
  Check,
  Pencil,
  Copy,
  Trash2,
  SquareX,
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

  // New Note Widget State
  const [newNoteColor, setNewNoteColor] = useState(COLORS[0]);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(false);
  const [setNewNoteContent] = useState("");

  // Inline Editing State
  const [editingId, setEditingId] = useState(null); // ID of note being edited
  const [editContent, setEditContent] = useState("");
  const [editColor, setEditColor] = useState(null);

  // Menu State
  const [openCardMenuId, setOpenCardMenuId] = useState(null);


  /* -------- FETCH NOTES -------- */
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      const formatted = data.map(n => ({
        id: n.id,
        html: n.content_html,
        color: COLORS.find(c => c.id === n.color_id) || COLORS[0],
        updatedAt: new Date(n.updated_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        })
      }));
      setNotes(formatted);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  /* -------- TEXT FORMATTING -------- */
  const format = (cmd, isInline = false) => {
    // Determine which editor to focus
    const el = isInline
      ? document.getElementById(`inline-editor-${editingId}`)
      : document.getElementById("new-note-editor");

    if (el) {
      el.focus();
      document.execCommand(cmd);
    }
  };

  /* -------- CREATE NEW NOTE -------- */
  const createNote = async () => {
    const el = document.getElementById("new-note-editor");
    if (!el) return;
    const content = el.innerHTML.trim();
    if (!content) return;

    try {
      await createNoteApi({
        content_html: content,
        color_id: newNoteColor.id
      });

      fetchNotes();
      el.innerHTML = "";
      setNewNoteContent("");
      setNewNoteColor(COLORS[0]);

    } catch (err) {
      console.error("Create Note Error:", err);
      alert("Failed to create note");
    }
  };

  /* -------- UPDATE EXISTING NOTE -------- */
  const updateNote = async (id) => {
    const el = document.getElementById(`inline-editor-${id}`);
    if (!el) return;
    const content = el.innerHTML.trim();
    // if (!content) return; // Allow empty? 

    try {
      await updateNoteApi(id, {
        content_html: content,
        color_id: editColor?.id
      });
      fetchNotes();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }

    setEditingId(null);
    setEditContent("");
    setEditColor(null);
  };

  /* -------- ACTIONS -------- */
  const deleteNote = async (id) => {
    // Optimistic remove
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);

    try {
      await deleteNoteApi(id);
    } catch (err) {
      console.error("Failed to delete", err);
      fetchNotes(); // Revert on failure
      alert("Failed to delete note");
    }
  };

  const copyNote = (html) => {
    const text = html.replace(/<[^>]*>/g, "");
    navigator.clipboard.writeText(text);
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditContent(note.html);
    setEditColor(note.color);
    setOpenCardMenuId(null);

    // Defer focus
    setTimeout(() => {
      const el = document.getElementById(`inline-editor-${note.id}`);
      if (el) {
        el.innerHTML = note.html;
        el.focus();
        // Move cursor to end (simplified)
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 50);
  };

  /* -------- HELPER: CLOSE MENUS -------- */
  const closeAllMenus = () => {
    setOpenCardMenuId(null);
    setIsWidgetMenuOpen(false);
    // If we need to close the inline editor menu specifically, we might need state for it?
    // Currently using openCardMenuId for inline editor menu too? 
    // Let's verify state usage.
  };

  /* -------- CLICK OUTSIDE TO SAVE (INLINE EDITOR) -------- */
  useEffect(() => {
    const handleMouseDown = (e) => {
      // 1. Handle Menu Closing
      if (openCardMenuId !== null || isWidgetMenuOpen) {
        const menu = document.getElementById("active-menu");
        // If click is outside the menu, close it.
        if (menu && !menu.contains(e.target)) {
          closeAllMenus();
          return; // Stop here
        }
      }

      // 2. Handle Auto-Save & Close Editor
      if (editingId) {
        const card = document.getElementById(`editing-card-${editingId}`);
        // If click is outside the card, save and close
        if (card && !card.contains(e.target)) {
          updateNote(editingId);
        }
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [editingId, openCardMenuId, isWidgetMenuOpen, notes, editColor]);
  // Added dependencies to ensure updateNote has access to latest state scope if needed (though updateNote uses refs mostly)

  /* ================= RENDER ================= */

  return (
    <div style={styles.page}>
      <Sidebar />

      {/* GLOBAL CLICK OUTSIDE BACKDROP */}
      {(openCardMenuId !== null || isWidgetMenuOpen) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 998, cursor: "default" }}
          onClick={closeAllMenus}
        />
      )}

      <div style={styles.main}>
        <Header title="Notes" />

        <div style={styles.content}>

          <div style={styles.grid}>
            {notes.map((note) => {
              const isEditing = editingId === note.id;
              const displayColor = isEditing ? (editColor || note.color) : note.color;

              if (isEditing) {
                /* -------- INLINE EDITOR CARD -------- */
                // Ensure z-index is high enough to be above backdrop (998) when menu is open or just generally for priority
                const zIndex = (openCardMenuId === note.id) ? 1000 : 10;

                return (
                  <div
                    key={note.id}
                    id={`editing-card-${note.id}`}
                    style={{ ...styles.note, background: displayColor.body, zIndex: zIndex, outline: "2px solid #333" }}
                  >
                    {/* Header Strip & Controls */}
                    <div style={{ position: "relative", height: 12 }}>
                      <div style={{ ...styles.colorStrip, background: displayColor.header, position: "absolute", top: 0 }} />

                      {/* INLINE EDIT MENU BUTTON */}
                      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 11 }}>
                        <button
                          style={styles.iconBtnSmall}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCardMenuId(openCardMenuId === note.id ? null : note.id);
                          }}
                        >
                          <MoreHorizontal size={16} color="#333" />
                        </button>

                        {openCardMenuId === note.id && (
                          <ColorMenu
                            showColors={true}
                            activeColor={displayColor}
                            onSelectColor={(c) => setEditColor(c)}
                            onCopy={() => copyNote(editContent)} // Copy current edit content
                            onDelete={() => deleteNote(note.id)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Inline Content */}
                    <div
                      id={`inline-editor-${note.id}`}
                      contentEditable
                      suppressContentEditableWarning
                      style={{ ...styles.inlineEditorInput, marginTop: 24 }} // add space for top menu
                      onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
                    />

                    {/* Inline Toolbar & Save */}
                    <div style={styles.inlineToolbar}>
                      <div style={styles.toolsLeftSmall}>
                        <button onClick={() => format("bold", true)} style={styles.toolBtnSmall}><Bold size={14} /></button>
                        <button onClick={() => format("italic", true)} style={styles.toolBtnSmall}><Italic size={14} /></button>
                        <button onClick={() => format("underline", true)} style={styles.toolBtnSmall}><Underline size={14} /></button>
                        <button onClick={() => format("strikeThrough", true)} style={styles.toolBtnSmall}><Strikethrough size={14} /></button>
                        <button onClick={() => format("insertUnorderedList", true)} style={styles.toolBtnSmall}><List size={14} /></button>
                      </div>
                      <button onClick={() => updateNote(note.id)} style={styles.saveBtnSmall}>
                        <Check size={16} color="#333" />
                      </button>
                    </div>
                  </div>
                );
              }

              /* -------- NORMAL VIEW CARD -------- */
              const noteZIndex = (openCardMenuId === note.id) ? 1000 : "auto"; // Raise if menu currently open

              const gridStyle = { ...styles.note, background: note.color.body, zIndex: noteZIndex };

              const i = notes.indexOf(note); // Get index carefully (map provides it but we need cleanly)


              if (i > 3 && (i - 4) % 3 === 0) {
                gridStyle.gridColumnStart = 1;
              }

              return (
                <div
                  key={note.id}
                  style={gridStyle}
                >
                  <div style={{ ...styles.colorStrip, background: note.color.header }} />

                  <div
                    style={styles.noteBody}
                    className="hide-scrollbar"
                    dangerouslySetInnerHTML={{ __html: note.html }}
                  />

                  <div style={styles.noteFooter}>
                    <span style={styles.date}>{note.updatedAt}</span>

                    <div style={styles.relativeContainer}>
                      <button
                        style={styles.iconBtnSmall}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCardMenuId(openCardMenuId === note.id ? null : note.id);
                        }}
                      >
                        <MoreHorizontal size={16} color="#555" />
                      </button>

                      {openCardMenuId === note.id && (
                        <ColorMenu
                          showColors={false}
                          activeColor={note.color}
                          // onSelectColor not needed
                          onEdit={() => startEditing(note)}
                          onCopy={() => copyNote(note.html)}
                          onDelete={() => {
                            deleteNote(note.id);
                            setOpenCardMenuId(null);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ================= FIXED WIDGET (NEW NOTE ONLY) ================= */}
        <div style={{ ...styles.editorWidget, background: newNoteColor.body, zIndex: isWidgetMenuOpen ? 1000 : 100 }}>
          <div style={styles.editorHeader}>
            <div style={{ ...styles.colorStrip, background: newNoteColor.header, position: "absolute", top: 0, left: 0, right: 0, borderRadius: "12px 12px 0 0" }} />

            <div style={styles.editorTopControls}>
              <div style={styles.relativeContainer}>
                <button
                  style={styles.iconBtnSmall}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWidgetMenuOpen(!isWidgetMenuOpen);
                  }}
                >
                  <MoreHorizontal size={18} color="#333" />
                </button>
                {isWidgetMenuOpen && (
                  <ColorMenu
                    showColors={true}
                    activeColor={newNoteColor}
                    onSelectColor={(c) => setNewNoteColor(c)}
                    onCopy={() => {
                      const el = document.getElementById("new-note-editor");
                      if (el) copyNote(el.innerHTML);
                      setIsWidgetMenuOpen(false);
                    }}
                    // No Edit option here, only Color/Copy/Clear
                    customActions={
                      <div style={styles.menuItemDanger} onClick={() => {
                        document.getElementById("new-note-editor").innerHTML = "";
                        setIsWidgetMenuOpen(false);
                      }}>
                        <span><SquareX size={16} color="#EF4444" style={{ marginRight: 8 }} /> Clear</span>
                      </div>
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Input */}
          <div
            id="new-note-editor"
            contentEditable
            suppressContentEditableWarning
            style={styles.editorInput}
            placeholder="Type anything to remember..."
            onInput={(e) => setNewNoteContent(e.currentTarget.innerHTML)}
          />

          {/* Toolbar */}
          <div style={styles.editorToolbar}>
            <div style={styles.toolsLeft}>
              <button onClick={() => format("bold")} style={styles.toolBtn}><Bold size={16} /></button>
              <button onClick={() => format("italic")} style={styles.toolBtn}><Italic size={16} /></button>
              <button onClick={() => format("underline")} style={styles.toolBtn}><Underline size={16} /></button>
              <button onClick={() => format("strikeThrough")} style={styles.toolBtn}><Strikethrough size={16} /></button>
              <button onClick={() => format("insertUnorderedList")} style={styles.toolBtn}><List size={16} /></button>
            </div>

            <button onClick={createNote} style={styles.saveBtn}>
              <Check size={20} color="#333" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= HELPER COMPONENT ================= */

function ColorMenu({ showColors = true, activeColor, onSelectColor, onEdit, onCopy, onDelete, customActions }) {
  return (
    <div id="active-menu" style={styles.popupMenu}>
      {showColors && (
        <>
          <div style={styles.menuColorRow}>
            {COLORS.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectColor && onSelectColor(c)}
                style={{
                  ...styles.menuColorSwatch,
                  background: c.body,
                  border: activeColor?.id === c.id ? "1px solid #000" : "1px solid rgba(0,0,0,0.1)"
                }}
              >
                {activeColor?.id === c.id && <Check size={10} color="#000" />}
              </div>
            ))}
          </div>
          <div style={styles.menuDivider} />
        </>
      )}

      {onEdit && (
        <div style={styles.menuItem} onClick={onEdit}>
          <Pencil size={14} style={{ marginRight: 8 }} />
          <span>Edit Note</span>
        </div>
      )}
      <div style={styles.menuItem} onClick={onCopy}>
        <Copy size={14} style={{ marginRight: 8 }} />
        <span>Copy Note</span>
      </div>

      {onDelete ? (
        <div style={styles.menuItemDanger} onClick={onDelete}>
          <Trash2 size={14} style={{ marginRight: 8 }} />
          <span>Delete</span>
        </div>
      ) : customActions}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#F9FAFB",
    fontFamily: "'Poppins', sans-serif"
  },
  main: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  },
  content: {
    padding: "15px",
    flex: 1,
    overflowY: "auto"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // Fixed 4 columns as requested
    gap: 24,
    paddingBottom: 100
  },

  /* ---- NOTE CARD ---- */
  note: {
    height: 200, // Fixed height so all cards are same size
    borderRadius: 16,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  colorStrip: {
    height: 12,
    width: "100%",
    borderRadius: "16px 16px 0 0"
  },
  noteBody: {
    padding: "16px 20px 8px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    color: "#1F2937",
    fontSize: 15,
    lineHeight: 1.6,
    flex: 1,
    overflowY: "auto", // Scrollable if content is long
    // scrollbarWidth removed, handled by CSS class
  },
  noteFooter: {
    padding: "10px 16px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  date: {
    fontSize: 12,
    color: "rgba(0,0,0,0.5)"
  },
  iconBtnSmall: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 4,
    borderRadius: 4,
    display: "flex",
    alignItems: "center"
  },
  relativeContainer: {
    position: "relative"
  },

  /* ---- INLINE EDITING STYLES ---- */
  inlineEditorInput: {
    flex: 1,
    padding: "16px 20px 8px",
    outline: "none",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#333",
    background: "rgba(255,255,255,0.4)",
    margin: "0 10px",
    borderRadius: 8
  },
  inlineToolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    borderTop: "1px solid rgba(0,0,0,0.05)"
  },
  toolsLeftSmall: {
    display: "flex",
    gap: 2
  },
  toolBtnSmall: {
    border: "none",
    background: "transparent",
    padding: 4,
    borderRadius: 4,
    cursor: "pointer",
    color: "#555",
    display: "flex"
  },
  saveBtnSmall: {
    border: "none",
    background: "rgba(255,255,255,0.5)",
    padding: 6,
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
  },

  /* ---- FIXED EDITOR WIDGET ---- */
  editorWidget: {
    position: "fixed", // Changed from absolute to fixed
    bottom: 30,
    right: 30,
    width: 320,
    minHeight: 280,
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100
  },
  editorHeader: {
    height: 40,
    position: "relative"
  },
  editorTopControls: {
    position: "absolute",
    top: 6,
    right: 8,
    zIndex: 2,
    display: "flex",
    gap: 8,
    alignItems: "center"
  },
  editingBadge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    background: "rgba(0,0,0,0.1)",
    padding: "2px 6px",
    borderRadius: 4,
    color: "#555"
  },
  editorInput: {
    flex: 1,
    padding: "10px 20px 20px",
    outline: "none",
    fontSize: 16,
    lineHeight: 1.5,
    color: "#333",
    background: "transparent",
    minHeight: 180
  },
  editorToolbar: {
    height: 50,
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px"
  },
  toolsLeft: {
    display: "flex",
    gap: 4
  },
  toolBtn: {
    border: "none",
    background: "transparent",
    padding: 6,
    borderRadius: 4,
    cursor: "pointer",
    color: "#555",
    display: "flex"
  },
  saveBtn: {
    border: "none",
    background: "transparent",
    padding: 6,
    borderRadius: 4,
    cursor: "pointer",
    display: "flex"
  },

  /* ---- POPUP MENU ---- */
  popupMenu: {
    position: "absolute",
    right: 0,
    top: "100%",
    marginTop: 6,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.05)",
    width: 200,
    overflow: "hidden",
    zIndex: 999
  },
  menuColorRow: {
    display: "flex",
    padding: 10,
    gap: 6,
    justifyContent: "center"
  },
  menuColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  menuDivider: {
    height: 1,
    background: "#eee",
    margin: "0"
  },
  menuItem: {
    padding: "10px 16px",
    fontSize: 14,
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  menuItemDanger: {
    padding: "10px 16px",
    fontSize: 14,
    color: "#EF4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  }
};
