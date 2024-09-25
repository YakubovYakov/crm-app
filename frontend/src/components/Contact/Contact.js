import React, { useEffect, useState } from "react";
import "./Contact.css";
import { useParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
// import { useLocation } from "react-router-dom";

function Contact() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [diagnoses, setDiagnoses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  // const location = useLocation();
  // const patient = location.state?.patient;
  // const patientData = location.state?.patient;

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

  // Функция загрузки данных пациента по ID
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${id}`);
        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных пациента");
        }
        const data = await response.json();
        setPatient(data);
        setCurrentStage(data.crm_status);
      } catch (err) {
        console.error("Ошибка", err);
      }
    };
    fetchPatientData();
  }, [id]);

  const handleStageClick = async (newStage) => {
    setCurrentStage(newStage);

    try {
      const response = await fetch(
        `http://localhost:3001/api/patient/${id}/status`,
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

      const data = await response.json();
      console.log("Статус сделки обновлен:", data);
    } catch (err) {
      console.error("Ошибка при обновлении статуса сделки:", err);
    }
  };
  // Поиск карт пациента
  useEffect(() => {
    if (patient && patient.surname && patient.name && patient.birthday) {
      const fetchCards = async () => {
        const queryParams = new URLSearchParams({
          surname: patient.surname,
          name: patient.name,
          birthday: patient.birthday,
        });

        if (patient.patron) queryParams.append("patron", patient.patron);

        try {
          const response = await fetch(
            `http://localhost:3001/api/patient/cards?${queryParams.toString()}`
          );

          if (!response.ok) {
            throw new Error("Ошибка при поиске карт");
          }

          const data = await response.json();
          setCards(data);
        } catch (err) {
          console.error("Ошибка при поиске карт:", err);
        }
      };

      fetchCards();
    } else {
      console.error("Данные пациента отсутствуют или неполные.");
    }
  }, [patient]);

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
          <select
            id="card_number"
            value={selectedCard}
            onChange={(e) => setSelectedCard(e.target.value)}
          >
            <option value="">Выберете номер карты</option>
            {cards.map((card) => (
              <option key={card.card_number} value={card.card_number}>
                {card.card_number}
              </option>
            ))}
            {cards.length === 0 && <option>Нет карты</option>}
          </select>

          <label className="contact__label" htmlFor="name">
            Прием (специализация врача,выполненые манипуляции)
          </label>
          <input className="contact__input" type="text" placeholder="Прием" />
          <label className="contact__label" htmlFor="diagnosis">
            Диагноз
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Диагноз"
            value={searchTerm || selectedDiagnosis}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {diagnoses.length > 0 && (
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
          <select className="contact__select">
            <option className="contact__option">Канал обращения</option>
            <option className="contact__option">ОМС</option>
            <option className="contact__option">ПМУ</option>
            <option className="contact__option">ДМС</option>
          </select>
          <label className="contact__label">Дата приема</label>
          <input className="contact__input" type="date" />
          <label className="contact__label">Пришел/не пришел</label>
          <select className="contact__select">
            <option className="contact__option">Пришел</option>
            <option className="contact__option">Не пришел</option>
          </select>
          <label className="contact__label">Причина отказа</label>
          <input className="contact__input" type="text" />
          {/* тест */}
          <select className="contact__select">
            <option className="contact__option">
              Записан/не записан на повторный прием
            </option>
            <option className="contact__option">Да</option>
            <option className="contact__option">Нет</option>
          </select>
          <label className="contact__label">Дата повторного приема</label>
          <input className="contact__input" type="date" />
          <label className="contact__label">Пришел/не пришел</label>
          <select className="contact__select">
            <option className="contact__option">Пришел</option>
            <option className="contact__option">Не пришел</option>
          </select>
          <label className="contact__label">Причина отказа</label>
          <input className="contact__input" type="text" />
          <select className="contact__select">
            <option className="contact__option">
              Госпитализация/ нет (с пометкой ОМС, ПМУ, ДМС)
            </option>
            <option className="contact__option">ОМС</option>
            <option className="contact__option">ПМУ</option>
            <option className="contact__option">ДМС</option>
          </select>
          <select className="contact__select">
            <option className="contact__option">Оплатил/нет</option>
            <option className="contact__option">Да</option>
            <option className="contact__option">Нет</option>
          </select>
        </form>
        <div className="contact__stage">
          <h2>Стадия сделки</h2>
          <button
            className={`contact__stage-button ${
              currentStage === "start" ? "active" : ""
            }`}
            onClick={() => handleStageClick("start")}
          >
            Начальная
          </button>
          <button
            className={`contact__stage-button ${
              currentStage === "in_progress" ? "active" : ""
            }`}
            onClick={() => handleStageClick("in_progress")}
          >
            В процессе
          </button>
          <button
            className={`contact__stage-button ${
              currentStage === "completed" ? "active" : ""
            }`}
            onClick={() => handleStageClick("completed")}
          >
            Завершена
          </button>
        </div>
        <form className="contact__form-notes">
          Заметки о пациенте:
          <textarea className="contact__notes"></textarea>
        </form>
      </div>
    </section>
  );
}

export default Contact;
