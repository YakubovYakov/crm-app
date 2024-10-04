import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Table.css";
import Search from "../Search/Search";
import PopupDelete from "../PopupDelete/PopupDelete";
import img from "../../images/delete.svg";

function Table({
  patients,
  onUpdateStatus,
  onDeletePatient,
  fetchData,
  onAddPatient,
  onUpdatePatient,
  onCardChange,
  fetchCards,
  cardsMap,
  selectedCards,
  selectedAppointments,
  handleAppointmentChange,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    surname: "",
    patron: "",
    birthday: "",
    crm_status: "",
  });
  const [editingPatient, setEditingPatient] = useState(null);

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingPatient((prevPatient) => ({
      ...prevPatient,
      [name]: value,
    }));
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3002/api/users/${editingPatient.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingPatient),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении данных пациента");
      }

      // Обновляем состояние в App
      onUpdatePatient(editingPatient);

      // Закрываем форму редактирования
      setEditingPatient(null);
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  // Функция для поиска пациентов
  const handleSearch = (searchTerm) => {
    fetchData(searchTerm);
  };

  // Преобразование даты в формат DD.MM.YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Функция для получения класса строки по статусу сделки
  const getRowClassByStatus = (status) => {
    if (status === "start") return "row-red";
    if (status === "in_progress") return "row-yellow";
    if (status === "completed") return "row-green";
    return "";
  };

  // Проваливание в контакт
  const handleRowClick = (patient) => {
    window.open(`/contact/${patient.id}`, "_blank");
  };

  // Удаление пользователя
  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    onDeletePatient(userToDelete);
    setShowDeletePopup(false);
    setUserToDelete(null);
  };

  const handleClosePopupDelete = () => {
    setShowDeletePopup(false);
    setUserToDelete(null);
  };

  // Создание нового пациента
  const handleChange = (e) => {
    const { name, value } = e.target;

    const onlyLettersRegex = /^[A-Za-zА-Яа-яЁё\s]*$/;

    const formattedValue = value.replace(/\s/g, "").toUpperCase();

    if (onlyLettersRegex.test(formattedValue) || value === "") {
      setNewUser((prev) => ({ ...prev, [name]: formattedValue }));
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedUser = {
      ...newUser,
      name: newUser.name.toUpperCase(),
      surname: newUser.surname.toUpperCase(),
      patron: newUser.patron ? newUser.patron.toUpperCase() : "",
      birthday: newUser.birthday || null,
    };

    try {
      const response = await fetch("http://localhost:3002/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedUser),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении пользователя");
      }

      const addedUser = await response.json();
      onAddPatient(addedUser);
      setShowForm(false);
      setNewUser({
        name: "",
        surname: "",
        patron: "",
        birthday: "",
        crm_status: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="table__section">
      <div className="table__container">
        <div className="table__bar">
          <Search onSearch={handleSearch} />
          <button
            className="table__button-archived"
            onClick={() => navigate("/archived")}
          >
            Посмотреть архив
          </button>
          <button
            type="button"
            className="table__add-button"
            onClick={() => setShowForm(true)}
          >
            Добавить пользователя
          </button>
        </div>

        {/* Индикация загрузки */}
        {loading ? (
          <p>Загрузка данных...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          /* Таблица */
          <table className="table">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Дата рождения</th>
                <th>Номер карты</th>
                <th>Прием (специализация врача, выполненные манипуляции)</th>
                <th>Канал обращения</th>
                <th>Стадия сделки</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="table__tbody">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className={getRowClassByStatus(patient.crm_status)}
                  onClick={() => handleRowClick(patient)}
                >
                  <td className="td__fio">{`${patient.surname} ${patient.name} ${patient.patron}`}</td>
                  <td>{formatDate(patient.birthday)}</td>
                  <td>
                    <button
											className="edit-form__open-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(patient);
                      }}
                    >
                      Редактировать
                    </button>
                    {/* выбор номер карты */}
                    <select
                      value={selectedCards[patient.id] || ""}
                      onChange={(e) => onCardChange(patient.id, e.target.value)}
                      onFocus={() => fetchCards(patient)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Выберете номер карты</option>
                      {cardsMap[patient.id]?.map((card) => (
                        <option key={card.card_number} value={card.card_number}>
                          {card.card_number}
                        </option>
                      ))}
                      {cardsMap[patient.id]?.length === 0 && (
                        <option>Нет карты</option>
                      )}
                    </select>
                  </td>
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {patient.appointments && patient.appointments.length > 0 ? (
                      <select
                        value={selectedAppointments[patient.id] || ""}
                        onChange={(e) =>
                          handleAppointmentChange(patient.id, e.target.value)
                        }
                      >
                        <option value="">Выберите приём</option>
                        {patient.appointments.map((appointment, index) => (
                          <option key={index} value={appointment.naz_name}>
                            {appointment.naz_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="contact__input"
                        type="text"
                        placeholder="Приём"
                        value="Нет доступных приёмов"
                        readOnly
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </td>
                  <td>
                    <input
                      className="contact__input"
                      type="text"
                      placeholder="Метод оплаты"
                      value={
                        selectedAppointments[patient.id]
                          ? patient.pay_type || ""
                          : ""
                      }
                      readOnly
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>
                    <div className="contact__stage">
                      <button
                        className={`contact__stage-button ${
                          patient.crm_status === "start" ? "active red" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(patient.id, "start");
                        }}
                      >
                        Начальная
                      </button>
                      <button
                        className={`contact__stage-button ${
                          patient.crm_status === "in_progress"
                            ? "active yellow"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(patient.id, "in_progress");
                        }}
                      >
                        В процессе
                      </button>
                      <button
                        className={`contact__stage-button ${
                          patient.crm_status === "completed"
                            ? "active green"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(patient.id, "completed");
                        }}
                      >
                        Завершена
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      className="table__delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(patient.id);
                      }}
                    >
                      <img src={img} alt="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
			<section className="edit-form__section">

        {editingPatient && (
          <div className="edit-form-container">
            <h3 className="edit-form__title">Редактировать данные пациента</h3>
            <form className="edit-form__form" onSubmit={handleUpdatePatient}>
              <input
								className="edit-form__input"
                type="text"
                name="surname"
                placeholder="Фамилия"
                value={editingPatient.surname}
                onChange={handleEditFormChange}
                required
              />
              <input
								className="edit-form__input"
                type="text"
                name="name"
                placeholder="Имя"
                value={editingPatient.name}
                onChange={handleEditFormChange}
                required
              />
              <input
								className="edit-form__input"
                type="text"
                name="patron"
                placeholder="Отчество"
                value={editingPatient.patron || ""}
                onChange={handleEditFormChange}
              />
              <input
								className="edit-form__input"
                type="date"
                name="birthday"
                value={editingPatient.birthday}
                onChange={handleEditFormChange}
                required
              />
              <button className="edit-form__save" type="submit">Сохранить</button>
              <button className="edit-form__cancel" type="button" onClick={() => setEditingPatient(null)}>
                Отмена
              </button>
            </form>
          </div>
        )}
			</section>


        <PopupDelete
          showDeletePopup={showDeletePopup}
          userToDelete={userToDelete}
          handleDelete={handleConfirmDelete}
          handleClosePopupDelete={handleClosePopupDelete}
        />

        {showForm && (
          <div className="table__form-container">
            <h3 className="table__form-container_title">
              Добавить нового пользователя
            </h3>
            <form className="table__form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="surname"
                placeholder="Фамилия"
                value={newUser.surname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Имя"
                value={newUser.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="patron"
                placeholder="Отчество"
                value={newUser.patron}
                onChange={handleChange}
              />
              <input
                type="date"
                name="birthday"
                value={newUser.birthday}
                onChange={handleDateChange}
                required
              />

              <button type="submit" className="table__form-button">
                Добавить
              </button>
              <button
                type="button"
                className="table__close-button"
                onClick={() => setShowForm(false)}
              >
                <span></span>
                <span></span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default Table;
