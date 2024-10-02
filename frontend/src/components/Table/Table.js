import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
import "./Table.css";
import Search from "../Search/Search";
import PopupDelete from "../PopupDelete/PopupDelete";
import img from "../../images/delete.svg";

function Table() {
  // const { id } = useParams();
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

  const [cardsMap, setCardsMap] = useState({});
  const [selectedCards, setSelectedCards] = useState({});

  const [patients, setPatients] = useState([]);
  const [selectedPayTypes, setSelectedPayTypes] = useState({});
  const [selectedAppointments, setSelectedAppointments] = useState({});

  const [selectedPatient, setSelectedPatient] = useState(null);

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

      const patientsWithEmtyPayType = result.map((patient) => ({
        ...patient,
        pay_type: "",
      }));

      setPatients(patientsWithEmtyPayType);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPatientAppointment = async (mdoc_id) => {
    try {
      console.log("Запрос данных о приеме для mdoc_id:", mdoc_id);
      const response = await fetch(
        `http://localhost:3001/api/patient/appointment/${mdoc_id}`
      );

      if (!response.ok) {
        console.error(`Ошибка: ${response.status} ${response.statusText}`);
        throw new Error("Ошибка при загрузке данных о приеме и методе оплаты");
      }

      const appointmentData = await response.json();
      console.log(
        "Полученные данные о приеме и методе оплаты:",
        appointmentData
      );

      return appointmentData;
    } catch (err) {
      console.error(
        "Ошибка при загрузке данных о приеме и методе оплаты:",
        err
      );
      return []; // Возвращаем пустой массив, если данные не найдены
    }
  };

  const handleCardChange = async (patientId, cardNumber) => {
    try {
      setSelectedCards((prev) => ({
        ...prev,
        [patientId]: cardNumber,
      }));

      console.log(`Передача номера карты на сервер: ${cardNumber}`);

      // Получаем mdoc_id из cardsMap
      const cardData = cardsMap[patientId]?.find(
        (card) => card.card_number === cardNumber
      );

      const mdoc_id = cardData?.mdoc_id;

      console.log(`mdoc_id для карты ${cardNumber}:`, mdoc_id);

      if (mdoc_id) {
        // Получаем данные о приемах по mdoc_id
        const appointmentData = await fetchPatientAppointment(mdoc_id);

        if (appointmentData && appointmentData.length > 0) {
          console.log("Данные о приемах:", appointmentData);

          // Обновляем состояние пациента, добавляя список приемов
          setPatients((prevPatients) =>
            prevPatients.map((p) =>
              p.id === patientId
                ? {
                    ...p,
                    appointments: appointmentData,
                    pay_type: "",
                  }
                : p
            )
          );
        } else {
          console.warn("Данные о приемах не найдены");
          setPatients((prevPatients) =>
            prevPatients.map((p) =>
              p.id === patientId ? { ...p, appointments: [], pay_type: "" } : p
            )
          );
        }

        // Отправляем mdoc_id и cardNumber на сервер для сохранения в БД
        const response = await fetch(
          `http://localhost:3001/api/patient/${patientId}/saveCard`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cardNumber,
              mdoc_id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при сохранении карты и mdoc_id");
        }

        console.log("Номер карты и mdoc_id успешно сохранены в БД");
      } else {
        console.error("mdoc_id не найден для указанной карты");
      }
    } catch (err) {
      console.error("Ошибка при изменении номера карты:", err);
    }
  };

  const handleAppointmentChange = async (patientId, selectedNazName) => {
    // Обновляем выбранный приём
    setSelectedAppointments((prev) => ({
      ...prev,
      [patientId]: selectedNazName,
    }));

    if (!selectedNazName) {
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                pay_type: "",
              }
            : p
        )
      );
      return;
    }

    // Находим данные выбранного приёма из списка приёмов пациента
    const patient = patients.find((p) => p.id === patientId);

    if (!patient) {
      console.error(`Пациент с id ${patientId} не найден.`);
      return;
    }

    if (!patient.appointments || patient.appointments.length === 0) {
      console.warn(`У пациента с id ${patientId} нет доступных приёмов.`);
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                pay_type: selectedAppointment.pay_type || "",
              }
            : p
        )
      );
      return;
    }

    const selectedAppointment = patient.appointments.find(
      (appointment) => appointment.naz_name === selectedNazName
    );

    if (!selectedAppointment) {
      console.warn(
        `Приём с названием "${selectedNazName}" не найден у пациента с id ${patientId}.`
      );

      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                pay_type: "",
              }
            : p
        )
      );
      return;
    }

    setPatients((prevPatients) =>
      prevPatients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              pay_type: selectedAppointment.pay_type || "",
            }
          : p
      )
    );

    // Сохраняем pay_type в базе данных
    try {
      const response = await fetch(
        `http://localhost:3001/api/patient/${patientId}/payType`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pay_type: selectedAppointment.pay_type || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при сохранении метода оплаты");
      }

      console.log("Метод оплаты успешно сохранен в БД");
    } catch (err) {
      console.error("Ошибка при сохранении метода оплаты:", err);
    }
  };

  const fetchCards = async (patient) => {
    if (cardsMap[patient.id]) {
      console.log(`Карты для пациента ${patient.id} уже загружены`);
      return;
    }

    const queryParams = new URLSearchParams({
      surname: patient.surname,
      name: patient.name,
      birthday: patient.birthday,
    });
    if (patient.patron) queryParams.append("patron", patient.patron);

    try {
      console.log(
        `Отправка запроса на получение карт для пациента ${patient.id}`
      );
      const response = await fetch(
        `http://localhost:3001/api/patient/cards?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Ошибка при поиске карт");
      }
      const data = await response.json();
      console.log(`Полученные карты для пациента ${patient.id}:`, data);

      if (data.length > 0) {
        setCardsMap((prevCardsMap) => ({
          ...prevCardsMap,
          [patient.id]: data,
        }));
      } else {
        console.log("Карты не найдены для пациента");
      }
    } catch (err) {
      console.error("Ошибка при поиске карт:", err);
    }
  };

  // Проваливание в контакт
	const handleRowClick = (patient) => {
    window.open(`/contact/${patient.id}`, "_blank");
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
      setShowDeletePopup(false);
    } catch (err) {
      console.error("Ошибка при удалении пользователя", err);
    }
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowDeletePopup(true);
  };

  // Обработка поиска
  const handleSearch = (searchTerm) => {
    fetchData(searchTerm);
  };

  const handleClosePopupDelete = () => {
    setShowDeletePopup(false);
    setUserToDelete(null); // Сбрасываем ID пользователя
  };

  // Стадия сделки
  const handleStageClick = async (patientId, newStage) => {
    try {
      setPatients((prevPatients) =>
        prevPatients.map((patient) =>
          patient.id === patientId
            ? { ...patient, crm_status: newStage }
            : patient
        )
      );

      const response = await fetch(
        `http://localhost:3001/api/patient/${patientId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ crm_status: newStage }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении статуса сделки");
      }
    } catch (err) {
      console.error("Ошибка при обновлении статуса сделки:", err);
    }
  };

  const getRowClassByStatus = (status) => {
    if (status === "start") return "row-red";
    if (status === "in_progress") return "row-yellow";
    if (status === "completed") return "row-green";
    return "";
  };

  //Создание нового пациента
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

    if (!newUser.birthday) {
      console.error("Дата рождения обязательна");
      return;
    }

    // Приведение данных к верхнему регистру
    const formattedUser = {
      ...newUser,
      name: newUser.name.toUpperCase(),
      surname: newUser.surname.toUpperCase(),
      patron: newUser.patron ? newUser.patron.toUpperCase() : "",
    };

    try {
      const response = await fetch("http://localhost:3001/api/users", {
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
      setData((prevData) => [...prevData, addedUser]); // Добавляем нового пользователя в таблицу
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
        ) : (
          error && <p className="error">{error}</p>
        )}

        {/* Таблица */}
        {!loading && !error && (
          <table className="table">
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Дата рождения</th>
                <th>Номер карты</th>
                <th>Прием (специализация врача,выполненые манипуляции)</th>
                <th>Канал обращения</th>
                <th>Стадия сделки</th>
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
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {/* выбор номер карты */}
                    <select
                      value={selectedCards[patient.id] || ""}
                      onChange={(e) =>
                        handleCardChange(patient.id, e.target.value)
                      }
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
                      value={patient.pay_type || ""}
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
                          handleStageClick(patient.id, "start");
                        }}
                        onFocus={(e) => e.stopPropagation()}
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
                          handleStageClick(patient.id, "in_progress");
                        }}
                      >
                        В процесее
                      </button>
                      <button
                        className={`contact__stage-button ${
                          patient.crm_status === "completed"
                            ? "active green"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStageClick(patient.id, "completed");
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

        <PopupDelete
          showDeletePopup={showDeletePopup}
          userToDelete={userToDelete}
          handleDelete={handleDelete}
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
