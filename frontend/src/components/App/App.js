import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Table from "../Table/Table";
import ArchivePatients from "../ArchivedPatients/ArchivedPatients";
import Contact from "../Contact/Contact";

function App() {
  const [patients, setPatients] = useState([]);
  const [cardsMap, setCardsMap] = useState({});
  const [selectedCards, setSelectedCards] = useState({});
  const [selectedAppointments, setSelectedAppointments] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

	console.log("API URL:", process.env.REACT_APP_API_URL);


  // Функция для загрузки пациентов
  const fetchData = async (query = "") => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users?search=${query}`
      ), {
				method: "GET",
				credentials: "include",
			};
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных");
      }
      const result = await response.json();

      const patientsWithEmptyPayType = result.map((patient) => ({
        ...patient,
        pay_type: patient.pay_type || "",
      }));

      setPatients(patientsWithEmptyPayType);
    } catch (err) {
      console.error("Ошибка при загрузке пациентов:", err);
    }
  };

  // Функция для получения данных о приёмах по mdoc_id
  const fetchPatientAppointment = async (mdoc_id) => {
    try {
      console.log("Запрос данных о приеме для mdoc_id:", mdoc_id);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/patient/appointment/${mdoc_id}`
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

  // Функция для изменения выбранной карты
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
          `${process.env.REACT_APP_API_URL}/api/patient/${patientId}/saveCard`,
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

  // Функция для получения карт пациента
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
        `${process.env.REACT_APP_API_URL}/api/patient/cards?${queryParams.toString()}`
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

	const handleUpdatePatient = (updatedPatient) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
  };

  // Функция для изменения выбранного приёма
  const handleAppointmentChange = async (patientId, selectedNazName) => {
    setSelectedAppointments((prev) => ({
      ...prev,
      [patientId]: selectedNazName,
    }));

    if (!selectedNazName) {
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === patientId ? { ...p, first_appointment: "", pay_type: "" } : p
        )
      );
      return;
    }

    const patient = patients.find((p) => p.id === patientId);

    if (!patient) {
      console.error(`Пациент с id ${patientId} не найден.`);
      return;
    }
    const selectedAppointment = patient.appointments.find(
      (appointment) => appointment.naz_name === selectedNazName
    );

    if (!selectedAppointment) {
      console.warn(`Приём с названием "${selectedNazName}" не найден.`);
      return;
    }

    try {
      // Сохраняем приём и метод оплаты вместе
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/patient/${patientId}/saveAppointment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_appointment: selectedAppointment.naz_name,
            pay_type: selectedAppointment.pay_type || "",
          }),
        }
      );
      if (!response.ok) {
        throw new Error(
          "Ошибка при сохранении выбранного приёма и метода оплаты"
        );
      }

      console.log("Приём и метод оплаты успешно сохранены в БД");

      // Обновляем состояние пациента
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                first_appointment: selectedAppointment.naz_name,
                pay_type: selectedAppointment.pay_type || "",
              }
            : p
        )
      );
    } catch (err) {
      console.error("Ошибка при сохранении выбранного приёма:", err);
    }
  };

  // Функция для обновления статуса пациента
  const handleUpdateStatus = async (patientId, newStage) => {
    try {
      const isArchived = newStage === "completed" ? 1 : 0;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/patient/${patientId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crm_status: newStage,
            is_archived: isArchived,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении статуса сделки");
      }

      // Обновляем состояние пациентов
      setPatients((prevPatients) =>
        prevPatients.map((patient) =>
          patient.id === patientId
            ? { ...patient, crm_status: newStage, is_archived: isArchived }
            : patient
        )
      );
    } catch (err) {
      console.error("Ошибка при обновлении статуса сделки:", err);
    }
  };

  // Функция для удаления пациента
  const handleDeletePatient = async (patientId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${patientId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении пользователя");
      }

      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient.id !== patientId)
      );
    } catch (err) {
      console.error("Ошибка при удалении пользователя", err);
    }
  };

  // Функция для добавления нового пациента
  const handleAddPatient = (newPatient) => {
    setPatients((prevPatients) => [newPatient, ...prevPatients]);
  };

  // Фильтруем активных и архивных пациентов
  const activePatients = patients.filter((patient) => !patient.is_archived);
  const archivedPatients = patients.filter((patient) => patient.is_archived);

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <Table
              patients={activePatients}
              onUpdateStatus={handleUpdateStatus}
              onDeletePatient={handleDeletePatient}
              fetchData={fetchData}
              onAddPatient={handleAddPatient}
							onUpdatePatient={handleUpdatePatient}
              onCardChange={handleCardChange}
              fetchCards={fetchCards}
              cardsMap={cardsMap}
              selectedCards={selectedCards}
              selectedAppointments={selectedAppointments}
              handleAppointmentChange={handleAppointmentChange}
            />
          }
        />
        <Route
          path="/archived"
          element={
            <ArchivePatients
              patients={archivedPatients}
              onUpdateStatus={handleUpdateStatus}
            />
          }
        />
        <Route path="/contact/:id" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
