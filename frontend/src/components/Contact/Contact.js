import React, { useEffect, useState } from "react";
import "./Contact.css";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

function Contact({ patientId, selectedAppointments }) {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState("");
  const [isSelectEnable, setIsSelectEnable] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [payType, setPayType] = useState("");
  const [description, setDescription] = useState("");
  // Диагноз
  const [diagnoses, setDiagnoses] = useState([]);
  const [diag, setDiag] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  // Первичный прием
  const [firstIsCome, setFirstIsCome] = useState("");
  const [firstSignDt, setFirstSignDt] = useState("");
  const [firsCancelReason, setFirstCancelReason] = useState("");
  const [firstIsPayed, setFirstIsPayed] = useState("");
  // Вторичный прием
  const [secondRecorded, setSecondRecorded] = useState("");
  const [secondIsPayed, setSecondIsPayed] = useState("");
  const [secondSignDt, setSecondSignDt] = useState("");
  const [secondIsCome, setSecondIsCome] = useState("");
  const [secondCancelReason, setSecondCancelReason] = useState("");
  const [isHosp, setIsHosp] = useState("");
  // Заметки
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isNotesPopupOpen, setIsNotesPopupOpen] = useState(false);

  const addNote = (newNote) => {
    setNotes((prevNotes) => [...prevNotes, newNote]);
  };

  //Фунукция для получения диагноза
  const fetchDiagnoses = async (query) => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/diagnoses?search=${query}`
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
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${id}`);
        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных пациента");
        }

        const data = await response.json();
        setPatient(data);
        setNotes(JSON.parse(data.description || "[]"));
        setSelectedCard(data.card_number || "");
        setPayType(data.pay_type || "");
        setAppointment(data.first_appointment || "");
        setDescription(data.description || "");
        setCurrentStage(data.crm_status);
        setFirstIsCome(data.first_is_come || "");
        setFirstSignDt(data.first_sign_dt || "");
        setFirstCancelReason(data.first_cancel_reason || "");
        setFirstIsPayed(data.first_is_payed || "");
        setSecondRecorded(data.second_recorded || "");
        setSecondIsPayed(data.second_is_payed || "");
        setSecondSignDt(data.second_sign_dt || "");
        setSecondIsCome(data.second_is_come || "");
        setIsHosp(data.is_hosp || "");
        setSecondCancelReason(data.second_cancel_reason || "");
        setSelectedDiagnosis(data.diag || "");

        if (data.first_is_come !== null && data.first_is_come !== undefined) {
          setSelectedOption(data.first_is_come.toString());
        } else {
          setSelectedOption("");
        }
      } catch (err) {
        console.error("Ошибка", err);
      }
    };

    fetchPatientData();
  }, [id]);

  // Функция для сохранения данных пациента
  const handleSave = async () => {
    if (!patient) {
      console.error("Данные о пациенте отсутствуют или неполные");
      return;
    }

    // Validate required fields
    if (!selectedOption || !firstSignDt || !firstIsPayed) {
      console.error("Пожалуйста, сделайте выбор");
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const body = {
      cardNumber: selectedCard,
      pay_type: payType || "",
      description: JSON.stringify(notes),
      first_appointment: appointment || null,
      first_is_come: parseInt(selectedOption, 10),
      first_sign_dt: firstSignDt || null,
      first_cancel_reason: firsCancelReason || null,
      first_is_payed: firstIsPayed || null,
      second_recorded: secondRecorded ? parseInt(secondRecorded, 10) : null,
      second_is_payed: secondIsPayed || null,
      second_sign_dt: secondSignDt || null,
      second_is_come: secondIsCome || null,
      is_hosp: isHosp || null,
      second_cancel_reason: secondCancelReason || null,
      diag: selectedDiagnosis || null,
    };

    console.log("Отправляемые данные:", body);

    try {
      const response = await fetch(
        `http://localhost:3002/api/patient/${patient.id}/save`,
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

      const updatedPatient = await response.json();
      console.log("Данные успешно сохранены:", updatedPatient);

      // Update patient state
      setPatient(updatedPatient);

      // Update notes state with the latest description
      setNotes(JSON.parse(updatedPatient.description || "[]"));

      alert("Данные пациента успешно сохранены!");
    } catch (err) {
      console.error("Ошибка при сохранении данных:", err);
    }
  };

  // Обновляем функцию добавления заметки, но без отдельного сохранения
  const handleAddNote = (e) => {
    e.preventDefault();

    if (newNote.trim()) {
      // Добавляем новую заметку в массив заметок, но не сохраняем в БД
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setNewNote(""); // Очищаем поле для новой заметки
    }
  };

	 

  // Условие для возврата, если данных о пациенте нет
  if (!patient) {
    return <p>Загрузка данных пациента...</p>;
  }

  return (
    <section className="contact">
      <div className="contact__container">
        <Link to="/">
          <button className="contact__back-button">Назад к таблице</button>
        </Link>
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
            disabled
          />

          <label className="contact__label" htmlFor="name">
            Имя
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Имя"
            value={patient.name || ""}
            disabled
          />
          <label className="contact__label" htmlFor="name">
            Отчество
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Отчество"
            value={patient.patron || ""}
            disabled
          />
          <label className="contact__label" htmlFor="card_number">
            Номер карты
          </label>
          <input
            className="contact__input"
            type="text"
            value={selectedCard || ""}
            disabled
          />

          <label className="contact__label" htmlFor="appointment">
            Прием (специализация врача,выполненые манипуляции)
          </label>
          <input
            className="contact__input"
            type="text"
            placeholder="Прием"
            value={appointment || ""}
            disabled
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
            <button
              className="contact__clear-button"
              type="button"
              onClick={() => {
                setSelectedDiagnosis("");
                setSearchTerm("");
              }}
            >
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
            disabled
          ></input>

          {/* Первичный прием */}
          <label className="contact__subtitle-label">Первичный прием:</label>
          <label className="contact__label">Дата приема</label>
          <input
            className="contact__input"
            type="date"
            value={firstSignDt}
            onChange={(e) => setFirstSignDt(e.target.value)}
            required
          />
          <label className="contact__label">Пришел/не пришел</label>
          <select
            className="contact__select"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            required
          >
            <option className="contact__option" value="">
              Выберите:
            </option>
            <option className="contact__option" value="1">
              Пришел
            </option>
            <option className="contact__option" value="0">
              Не пришел
            </option>
          </select>

          <label className="contact__label">Причина отказа</label>
          <input
            className="contact__input"
            type="text"
            value={firsCancelReason}
            onChange={(e) => setFirstCancelReason(e.target.value)}
          />
          <label className="contact__label">Оплатил/нет</label>
          <select
            className="contact__select"
            value={firstIsPayed}
            onChange={(e) => setFirstIsPayed(e.target.value)}
            required
          >
            <option className="contact__option" value="">
              Выберите:
            </option>
            <option className="contact__option" value="1">
              Да
            </option>
            <option className="contact__option" value="0">
              Нет
            </option>
          </select>

          {/* вторичный прием */}
          <label className="contact__subtitle-label">Вторичный прием:</label>
          <label className="contact__label">
            Записан/не записан на повторный прием
          </label>
          <select
            className="contact__select"
            value={secondRecorded}
            onChange={(e) => setSecondRecorded(e.target.value)}
          >
            <option value="">Выберите...</option>
            <option className="contact__option" value="1">
              Да
            </option>
            <option className="contact__option" value="2">
              Нет
            </option>
          </select>
          <label className="contact__label">Дата повторного приема</label>
          <input
            className="contact__input"
            type="date"
            value={secondSignDt}
            onChange={(e) => setSecondSignDt(e.target.value)}
          />
          <label className="contact__label">Пришел/не пришел</label>
          <select
            className="contact__select"
            value={secondIsCome}
            onChange={(e) => setSecondIsCome(e.target.value)}
          >
            <option className="contact__option" value="">
              Выберите:
            </option>
            <option className="contact__option" value="1">
              Пришел
            </option>
            <option className="contact__option" value="2">
              Не пришел
            </option>
          </select>
          <label className="contact__label">Причина отказа</label>
          <input
            className="contact__input"
            type="text"
            value={secondCancelReason}
            onChange={(e) => setSecondCancelReason(e.target.value)}
          />
          <label className="contact__label">
            Госпитализация/ нет (с пометкой ОМС, ПМУ, ДМС)
          </label>
          <select
            className="contact__select"
            value={isHosp}
            onChange={(e) => setIsHosp(e.target.value)}
          >
            <option className="contact__option" value="">
              Выберите:
            </option>
            <option className="contact__option" value="1">
              ОМС
            </option>
            <option className="contact__option" value="2">
              ПМУ
            </option>
            <option className="contact__option" value="3">
              ДМС
            </option>
          </select>
          <label className="contact__label">Оплатил/нет</label>
          <select
            className="contact__select"
            value={secondIsPayed}
            onChange={(e) => setSecondIsPayed(e.target.value)}
          >
            <option className="contact__option" value="">
              Выберите:
            </option>
            <option className="contact__option" value="1">
              Да
            </option>
            <option className="contact__option" value="0">
              Нет
            </option>
          </select>

          <label className="contact__label">Заметки о пациенте:</label>
          <textarea
            className="contact__notes"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          ></textarea>
          <button
            type="button"
            className="contact__save-notes"
            onClick={handleAddNote}
          >
            Добавить заметку
          </button>

          <div className="contact__notes-container">
            {notes.map((note, index) => (
              <div key={index} className="contact__note-item">
                {note}
              </div>
            ))}
          </div>
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
