import React from "react";
import "./PopupDelete.css";

function PopupDelete({ showDeletePopup, userToDelete, handleDelete, handleClosePopupDelete }) {
  if (!showDeletePopup) return null; // Если попап не должен быть показан, возвращаем null

  return (
    <div className="popup-delete">
      <div className="popup-delete__content">
        <p>Вы уверены, что хотите удалить пользователя?</p>
        <button
          className="popup-delete__button popup-delete__button-confirm"
          onClick={() => handleDelete(userToDelete)}
        >
          Да
        </button>
        <button
          className="popup-delete__button popup-delete__button-cancel"
          onClick={handleClosePopupDelete} // Используем правильное имя пропса
        >
          Нет
        </button>
      </div>
    </div>
  );
}

export default PopupDelete;
