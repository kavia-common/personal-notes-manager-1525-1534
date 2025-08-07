import React, { useState } from 'react';
import './App.css';

// Color palette (used via inline styles as well as in css vars):
// primary:   #1976d2   (actions, focus, buttons)
// secondary: #424242   (sidebar bg, dividers)
// accent:    #ffeb3b   (active note, highlights)

function generateId() {
  // Generates a simple unique ID (timestamp + random)
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// PUBLIC_INTERFACE
function App() {
  // Notes state: array of {id, title, content}
  const [notes, setNotes] = useState([
    {
      id: generateId(),
      title: 'Welcome Note',
      content: 'Select or create a note to start editing!'
    }
  ]);
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id || null);
  const [editValue, setEditValue] = useState(null); // {title, content}

  // Select a note
  // PUBLIC_INTERFACE
  function handleSelectNote(noteId) {
    setSelectedNoteId(noteId);
    const note = notes.find(n => n.id === noteId);
    setEditValue(note ? { title: note.title, content: note.content } : null);
  }

  // PUBLIC_INTERFACE
  function handleStartNewNote() {
    setSelectedNoteId(null);
    setEditValue({ title: '', content: '' });
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    // Edit existing
    if (selectedNoteId && notes.some(n => n.id === selectedNoteId)) {
      setNotes(notes =>
        notes.map(n =>
          n.id === selectedNoteId
            ? { ...n, title: editValue.title.trim() || 'Untitled', content: editValue.content }
            : n
        )
      );
    } else {
      // Create new
      const newId = generateId();
      setNotes(notes => [
        ...notes,
        {
          id: newId,
          title: editValue.title.trim() || 'Untitled',
          content: editValue.content
        }
      ]);
      setSelectedNoteId(newId);
    }
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx >= 0) {
      const filtered = notes.filter(n => n.id !== noteId);
      setNotes(filtered);
      // Adjust selection: previous note, or next, or none
      if (filtered.length > 0) {
        const newIdx = idx > 0 ? idx - 1 : 0;
        setSelectedNoteId(filtered[newIdx].id);
        setEditValue({
          title: filtered[newIdx].title,
          content: filtered[newIdx].content
        });
      } else {
        setSelectedNoteId(null);
        setEditValue(null);
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleEditValueChange(field, val) {
    setEditValue({ ...editValue, [field]: val });
  }

  // Helper: note data for currently selected note
  const selectedNote = selectedNoteId
    ? notes.find(n => n.id === selectedNoteId)
    : null;

  // Minimal styling override for palette
  const palette = {
    '--primary': '#1976d2',
    '--secondary': '#424242',
    '--accent': '#ffeb3b'
  };

  // Placeholder for API integration:
  // Replace state-changing functions (handleSaveNote, handleDeleteNote, etc)
  // with calls to backend API and update state via responses.

  return (
    <div
      className="notes-root"
      style={{
        minHeight: '100vh',
        background: '#fff',
        color: '#222',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        ...palette
      }}
    >
      <div className="notes-container">
        {/* Sidebar: list of notes */}
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <span
              style={{
                fontWeight: 700,
                fontSize: '1.10rem',
                color: 'var(--primary)'
              }}
            >
              📝 Notes
            </span>
            <button
              className="sidebar-add"
              style={{
                marginLeft: 'auto',
                padding: '0 10px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 4,
                fontSize: 20,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              title="Add new note"
              onClick={handleStartNewNote}
            >
              +
            </button>
          </div>
          <ul className="sidebar-list">
            {notes.map(note => (
              <li
                key={note.id}
                className={`sidebar-item${selectedNoteId === note.id ? ' active' : ''}`}
                style={{
                  background:
                    selectedNoteId === note.id ? 'var(--accent)' : 'transparent',
                  color:
                    selectedNoteId === note.id
                      ? '#222'
                      : 'var(--secondary)',
                  borderRadius: 4,
                  marginBottom: 2,
                  fontWeight: selectedNoteId === note.id ? 700 : 400,
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectNote(note.id)}
                tabIndex={0}
                aria-label={`Select note: ${note.title}`}
              >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{note.title}</span>
                <button
                  className="sidebar-delete"
                  style={{
                    marginLeft: 7,
                    background: 'transparent',
                    border: 'none',
                    color: '#bb2d3b',
                    cursor: 'pointer',
                    fontSize: 15
                  }}
                  title="Delete note"
                  tabIndex={0}
                  aria-label={`Delete note: ${note.title}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Main: note detail and editor */}
        <main className="notes-main">
          {editValue ? (
            <section className="note-edit">
              <input
                className="note-title-input"
                aria-label="Note title"
                placeholder="Title"
                value={editValue.title}
                style={{
                  fontSize: 22,
                  padding: '6px 8px',
                  fontWeight: 600,
                  width: '100%',
                  marginBottom: 8,
                  border: 'none',
                  outline: 'none',
                  borderBottom: '2px solid var(--primary)',
                  background: '#fafbfc'
                }}
                onChange={e => handleEditValueChange('title', e.target.value)}
              />
              <textarea
                className="note-content-input"
                aria-label="Note content"
                placeholder="Start typing your note..."
                value={editValue.content}
                style={{
                  width: '100%',
                  minHeight: 180,
                  border: '1px solid #e0e0e0',
                  borderRadius: 6,
                  fontSize: 15,
                  padding: 10,
                  resize: 'vertical',
                  marginBottom: 15,
                  background: '#fff'
                }}
                onChange={e => handleEditValueChange('content', e.target.value)}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-save"
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 22px',
                    fontWeight: 500,
                    boxShadow: '0 1.5px 4px rgba(25,118,210,0.08)',
                    cursor: 'pointer'
                  }}
                  onClick={handleSaveNote}
                >
                  Save
                </button>
                <button
                  className="btn-cancel"
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 4,
                    padding: '8px 20px',
                    fontWeight: 400,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Cancel new: clear editor; cancel edit: restore previous
                    if (selectedNote) {
                      setEditValue({
                        title: selectedNote.title,
                        content: selectedNote.content
                      });
                    } else {
                      setEditValue(null);
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
              {selectedNoteId && (
                <button
                  className="btn-delete"
                  style={{
                    marginTop: 15,
                    background: 'none',
                    color: '#bb2d3b',
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleDeleteNote(selectedNoteId)}
                >
                  Delete Note
                </button>
              )}
            </section>
          ) : (
            <section className="note-empty" style={{margin: 'auto', color: '#777', fontStyle: 'italic', textAlign: 'center'}}>
              <p>
                Select a note to view or edit, or create a new one.
              </p>
            </section>
          )}
        </main>
      </div>
      <footer className="notes-footer" style={{
        fontSize: 13,
        color: '#aaa',
        borderTop: '1px solid #eee',
        padding: '8px 0 4px 0',
        textAlign: 'center',
        letterSpacing: '0.02rem',
        marginTop: 15
      }}>
        Minimal Notes Manager • <a href="https://kavia.ai" style={{color: 'var(--primary)', textDecoration: 'none'}}>KAVIA</a>
      </footer>
    </div>
  );
}

export default App;
