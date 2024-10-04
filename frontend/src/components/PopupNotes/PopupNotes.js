import React, { useState } from "react";
import "./PopupNotes.css";

function PopupNotes({ isOpen, onClose, notes, addNote }) {
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote(newNote);
      setNewNote("");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="popup-notes">
      <div className="popup-notes__content">
        <h2>Заметки о пациенте</h2>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Введите новую заметку"
        />
        <button onClick={handleAddNote}>Добавить заметку</button>

        <div className="popup-notes__list">
          {notes.map((note, index) => (
            <div key={index} className="popup-notes__note">
              {note}
            </div>
          ))}
        </div>

        <button className="popup-notes__close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

export default PopupNotes;
