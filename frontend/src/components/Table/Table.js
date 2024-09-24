import React, { useState, useEffect } from "react";
import "./Table.css";
import { useNavigate } from "react-router-dom";
// import Contact from "../Contact/Contact";
import Search from "../Search/Search";
import PopupDelete from "../PopupDelete/PopupDelete";
import img from "../../images/delete.svg";

function Table() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const navigate = useNavigate();

  const handleRowClick = (patient) => {
    navigate(`/contact/${patient.id}`, { state: { patient } });
  };

  //Получение пользователей из БД
  const fetchData = async (query = "") => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users?search=${query}`
      );
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных");
      }
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Изначально получаем все данные
  }, []);

  // Обработка поиска
  const handleSearch = (searchTerm) => {
    fetchData(searchTerm);
  };

  // Преобразование даты в формат DD.MM.YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  // Удаление пользователя
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении пользователя");
      }

      setData((prevData) => prevData.filter((user) => user.id !== id));
      setShowDeletePopup(false); // Закрываем попап
    } catch (err) {
      console.error("Ошибка при удалении пользователя", err);
    }
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeletePopup(true);
  };

  const handleClosePopupDelete = () => {
    setShowDeletePopup(false);
    setUserToDelete(null); // Сбрасываем ID пользователя
  };

  //Создание нового пациента
  const handleChange = (e) => {
    const { name, value } = e.target;

    const onlyLettersRegex = /^[A-Za-zА-Яа-яЁё\s]*$/;

		const formattedValue = value.replace(/\s/g, '').toUpperCase();

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

    if (!newUser.birthday) {
      console.error("Дата рождения обязательна");
      return;
    }

    // Приведение данных к верхнему регистру
    const formattedUser = {
      ...newUser,
      name: newUser.name.toUpperCase(),
      surname: newUser.surname.toUpperCase(),
      patron: newUser.patron ? newUser.patron.toUpperCase() : "", // Обработка пустого отчества
    };

    try {
      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Отправляем данные пользователя, приведенные к верхнему регистру
        body: JSON.stringify(formattedUser),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении пользователя");
      }

      const addedUser = await response.json();
      setData((prevData) => [...prevData, addedUser]); // Добавляем нового пользователя в таблицу
      setShowForm(false); // Закрываем форму после добавления

      // Сброс полей формы
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
            type="button"
            className="table__add-button"
            onClick={() => setShowForm(true)}
          >
            Добавить пользователя
          </button>
        </div>

        {/* Индикация загрузки */}
        {loading && <p>Загрузка данных...</p>}

        {/* Обработка ошибок */}
        {error && <p className="error">{error}</p>}

        {/* Таблица */}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Фамилия</th>
                <th>Имя</th>
                <th>Отчество</th>
                <th>Дата рождения</th>
                {/* <th>Номер карты</th> */}
              </tr>
            </thead>
            <tbody className="table__tbody">
              {data.map((item) => (
                <tr
                  className="table__row"
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                >
                  <td>{item.id}</td>
                  <td>{item.surname}</td>
                  <td>{item.name}</td>
                  <td>{item.patron}</td>
                  <td>{formatDate(item.birthday)}</td>
                  {/* <td>{item.crm_status}</td> */}
                  <td>
                    <button
                      className="table__delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item.id);
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

        <PopupDelete
          showDeletePopup={showDeletePopup}
          userToDelete={userToDelete}
          handleDelete={handleDelete}
          handleClosePopupDelete={handleClosePopupDelete}
        />

        {showForm && (
          <div className="table__form-container">
            <h3 className="table__form-container_title">Добавить нового пользователя</h3>
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
