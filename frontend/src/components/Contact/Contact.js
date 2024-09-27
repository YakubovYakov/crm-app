import React, { useEffect, useState } from "react";
import "./Contact.css";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

function Contact() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [isSelectEnable, setIsSelectEnable] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [appointment, setAppointment] = useState("");
  const [payType, setPayType] = useState("");
  const [description, setDescription] = useState("");
  // Диагноз
  const [diagnoses, setDiagnoses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");

  const [currentStage, setCurrentStage] = useState("");

  const [selectedOption, setSelectedOption] = useState("");
  const [firstIsCome, setFirstIsCome] = useState("");
  //Фунукция для получения диагноза
  const fetchDiagnoses = async (query) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/diagnoses?search=${query}`
      );
      if (!response.ok) {
        throw new Error("Ошибка при поиске диагнозов");
      }
      const data = await response.json();
      setDiagnoses(data);
    } catch (err) {
      console.error("Ошибка", err);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchDiagnoses(searchTerm);
    } else {
      setDiagnoses([]);
    }
  }, [searchTerm]);

  const clearDiagnosis = () => {
    setSelectedDiagnosis("");
    setSearchTerm("");
  };

  // Функция загрузки данных пациента по ID
  const fetchPatientData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных пациента");
      }
      const data = await response.json();
      // setAppointment(data.first_appointment || "");
      setPatient(data);
      setSelectedCard(data.card_number || "");
      setPayType(data.pay_type || "");
      setDescription(data.description || "");
      setCurrentStage(data.crm_status);
      setFirstIsCome(data.first_is_come || "");

      if (data.first_is_come !== null && data.first_is_come !== undefined) {
        setSelectedOption(data.first_is_come.toString());
      } else {
        setSelectedOption("");
      }
    } catch (err) {
      console.error("Ошибка", err);
    }
  };
  useEffect(() => {
    fetchPatientData();
  }, [id]);

  // Функция для сохранения данных пациента
  const handleSave = async () => {
    if (!patient) {
      console.error("Данные о пациенте отсутвуют или не полные");
      return;
    }

    if (!selectedOption) {
      console.error("Выберите статус 'Пришел/не пришел'");
      alert("Пожалуйста, выберите статус 'Пришел' или 'Не пришел'");
      return;
    }

    const body = {
      cardNumber: selectedCard,
      first_appointment: appointment,
      pay_type: payType,
      description: description,
      first_is_come: parseInt(selectedOption, 10),
      // appointmentStatus: selectedOption,
    };
    console.log("Отправляемые данные:", body);

    try {
      const response = await fetch(
        `http://localhost:3001/api/patient/${patient.id}/save`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при сохранении данных пациента");
      }

      const data = await response.json();
      console.log("Данные успешно сохранены:", data);
      console.log("Номер карты пациента:", data.cardNumber);
      fetchPatientData();
    } catch (err) {
      console.error("Ошибка при сохранении данных:", err);
    }
  };

  // Условие для возврата, если данных о пациенте нет
  if (!patient) {
    return <p>Загрузка данных пациента...</p>;
  }

  return (
    <section className="contact">
      <Link to="/">
        <button className="contact__back-button">Назад к таблице</button>
      </Link>
      <div className="contact__container">
        <label className="contact__title-label">Информация о пациенте:</label>
        <h1 className="contact__title">
          Пациент: {patient.surname} {patient.name}
        </h1>
        <form className="contact__form">
          <label className="contact__label" htmlFor="name">
            Фамилия
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Фамилия"
            value={patient.surname || ""}
            readOnly
          />

          <label className="contact__label" htmlFor="name">
            Имя
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Имя"
            value={patient.name || ""}
            readOnly
          />
          <label className="contact__label" htmlFor="name">
            Отчество
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Отчество"
            value={patient.patron || ""}
            readOnly
          />
          <label className="contact__label" htmlFor="card_number">
            Номер карты
          </label>

          <select id="card_number" value={selectedCard || ""} disabled>
            {selectedCard ? (
              <option value={selectedCard}>{selectedCard}</option>
            ) : (
              <option value="">Выберете номер карты</option>
            )}
          </select>

          <label className="contact__label" htmlFor="name">
            Прием (специализация врача,выполненые манипуляции)
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Прием"
            value={appointment}
            onChange={(e) => setAppointment(e.target.value)}
          />
          <label className="contact__label" htmlFor="diagnosis">
            Диагноз
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Диагноз"
            value={searchTerm || selectedDiagnosis}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!selectedDiagnosis}
          />

          {selectedDiagnosis && (
            <button type="button" onClick={clearDiagnosis}>
              Очистить диагноз
            </button>
          )}

          {diagnoses.length > 0 && !selectedDiagnosis && (
            <ul className="diagnosis-list">
              {diagnoses.map((diag) => (
                <li
                  key={diag.id}
                  onClick={() => {
                    setSelectedDiagnosis(diag.diag);
                    setSearchTerm("");
                  }}
                >
                  {diag.diag}
                </li>
              ))}
            </ul>
          )}
          <label className="contact__label">Канал обращения</label>
          <input
            id="payType"
            value={payType || ""}
            className="contact__select"
            // onChange={(e) => setPayType(e.target.value)}
            disabled
          ></input>

          {/* Первичный прием */}
          <label className="contact__title-label">Первичный прием:</label>
          <label className="contact__label">Дата приема</label>
          <input className="contact__input" type="date" />
          <label className="contact__label">Пришел/не пришел</label>
          <select
            className="contact__select"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            required
          >
            <option value="">Выберите:</option>
            <option value="1">Пришел</option>
            <option value="0">Не пришел</option>
          </select>

          <label className="contact__label">Причина отказа</label>
          <input className="contact__input" type="text" />
          <label className="contact__label">Оплатил/нет</label>
          <select className="contact__select">
            <option className="contact__option">Выберите:</option>
            <option className="contact__option">Да</option>
            <option className="contact__option">Нет</option>
          </select>
          <label className="contact__title-label">Вторичный прием:</label>
          <label className="contact__label">
            Записан/не записан на повторный прием
          </label>
          <select
            className="contact__select"
            // disabled={!isSelectEnable}
            // value={selectedOption}
            // onClick={(e) => setSelectedOption(true)}
            // onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="">Выберите...</option>
            <option className="contact__option">Да</option>
            <option className="contact__option">Нет</option>
          </select>
          <label className="contact__label">Дата повторного приема</label>
          <input className="contact__input" type="date" />
          <label className="contact__label">Пришел/не пришел</label>
          <select className="contact__select">
            <option className="contact__option">Выберите:</option>
            <option className="contact__option">Пришел</option>
            <option className="contact__option">Не пришел</option>
          </select>
          <label className="contact__label">Причина отказа</label>
          <input className="contact__input" type="text" />
          <label className="contact__label">
            Госпитализация/ нет (с пометкой ОМС, ПМУ, ДМС)
          </label>
          <select className="contact__select">
            <option className="contact__option">Выберите</option>
            <option className="contact__option">ОМС</option>
            <option className="contact__option">ПМУ</option>
            <option className="contact__option">ДМС</option>
          </select>
          <label className="contact__label">Оплатил/нет</label>
          <select className="contact__select">
            <option className="contact__option">Оплатил/нет</option>
            <option className="contact__option">Да</option>
            <option className="contact__option">Нет</option>
          </select>
          <label className="contact__label">Заметки о пациенте:</label>
          <textarea
            className="contact__notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </form>

        <button
          className="contact__save-button"
          type="button"
          onClick={handleSave}
        >
          Сохранить
        </button>
      </div>
    </section>
  );
}

export default Contact;
