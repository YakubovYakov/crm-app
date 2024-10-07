// ArchivePatients.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../Table/Table.css";

function ArchivePatients({ patients, onUpdateStatus }) {
  const navigate = useNavigate();

	 // Проваливание в контакт
	 const handleRowClick = (patient) => {
		window.open(`/contact/${patient.id}`, "_blank");
	};

  return (
    <section className="table__section">
      <div className="table__container">
        <div className="table__bar">
          <h2>Архив пациентов</h2>
          <button
            className="archived-patients__back-active"
            onClick={() => navigate("/")}
          >
            Назад к активным пациентам
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Дата рождения</th>
              <th>Номер карты</th>
              <th>Прием</th>
              <th>Канал обращения</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="archived-patients__tbody">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id}
								onClick={() => handleRowClick(patient)}>
                  <td>{`${patient.surname} ${patient.name} ${patient.patron}`}</td>
                  <td>{patient.birthday}</td>
                  <td>{patient.card_number || "Нет карты"}</td>
                  <td>{patient.first_appointment || "Нет данных"}</td>
                  <td>{patient.pay_type || "Нет данных"}</td>
                  <td>
                    <button
                      className="archived-patients__return-active"
                      onClick={() => {
												onUpdateStatus(patient.id, "in_progress");
												navigate(`/archived`);
										}}
                    >
                      Вернуть в активные
                    </button>
                    <button
                      className="archived-patients__contact"
                      onClick={() => navigate(`/contact/${patient.id}`)}
                    >
                      Перейти в контакт
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Нет архивных пациентов</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ArchivePatients;
