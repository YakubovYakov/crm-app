const { postgresClient, pool } = require("../db");

// Поиск пациента по номеру карты
const searchCardsByPatient = async (req, res, next) => {
  const { surname, name, patron, birth } = req.query;

  let query = `
			SELECT 
			mm.mdoc_get_num_format(md.num, md.year, md.num_org, md.num_filial, md.num_type, mdtp.id, mdtp.class, 'IBN-YYYY-P') AS card_number
			, md.id AS mdoc_id
			FROM mm.mdoc md
			INNER JOIN mm.mdoc_type mdtp ON mdtp.id = md.mdoc_type_id
			JOIN mm.people p ON p.id = md.people_id
			WHERE md.SURNAME = $1 
			AND md.NAME = $2
			AND mdtp.mdoc_num_type_id = 2
  `;

  const queryParams = [surname, name];

  if (patron) {
    query += " AND md.PATRON = $3";
    queryParams.push(patron);
  }

  if (birth) {
    query += ` AND p.BIRTH = $${queryParams.length + 1}`;
    queryParams.push(birth);
  }

  query += " LIMIT 100";

  try {
    const { rows } = await postgresClient.query(query, queryParams);
    if (rows.length === 0) {
      res.json({ message: "Пациент не найден или у него нет карты." });
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error("Ошибка при поиске карт пациента:", err);
    next(err);
  }
};

const saveCurdNumber = async (req, res, next) => {
  const { id } = req.params;
  const { cardNumber, mdoc_id } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE people SET card_number = ?, mdoc_id = ? WHERE id = ?",
      [cardNumber, mdoc_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res
      .status(200)
      .json({ message: "Номер карты и mdoc_id успешно сохранены" });
  } catch (err) {
    console.error("Ошибка при сохранении номера карты и mdoc_id", err);
    next(err);
  }
};

const getMdocIdByPatientData = async (req, res, next) => {
  try {
    const cardNumber = decodeURIComponent(req.params.cardNumber);
    console.log("Полученный cardNumber:", cardNumber);

    const query = `
      SELECT 
        mm.mdoc_get_num_format(
          md.num, md.year, md.num_org, md.num_filial, md.num_type, 
          mdtp.id, mdtp.class, 'IBN-YYYY-P'
        )::text AS card_number,
        md.id AS mdoc_id
      FROM mm.mdoc md
      INNER JOIN mm.mdoc_type mdtp ON mdtp.id = md.mdoc_type_id
      JOIN mm.people p ON p.id = md.people_id
      WHERE mm.mdoc_get_num_format(
        md.num, md.year, md.num_org, md.num_filial, md.num_type, 
        mdtp.id, mdtp.class, 'IBN-YYYY-P'
      ) = $1
    `;

    const { rows } = await postgresClient.query(query, [cardNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Номер карты не найден" });
    }

    res.status(200).json({ mdoc_id: rows[0].mdoc_id });
  } catch (err) {
    console.error("Ошибка при получении mdoc_id по номеру карты:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Получение данных о приеме и методе оплаты по mdoc_id
const getPatientAppointment = async (req, res, next) => {
  const { mdoc_id } = req.params;
  console.log("Получен mdoc_id:", mdoc_id);

  try {
    const query = `
				 SELECT
				n.name as naz_name, 
				pt.name as pay_type, 
				n.sign_dt as naz_sign_dt,
				CASE WHEN n.sign_dt IS NOT NULL THEN TRUE ELSE FALSE END as is_come 
				FROM mm.naz n
				JOIN mm.pay_type pt ON pt.id = n.pay_type_id
				WHERE n.mdoc_id = $1
		`;

    const { rows } = await postgresClient.query(query, [mdoc_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Данные не найдены" });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Ошибка при получении данных о приеме и виде оплаты", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Контроллер для сохранения приема
const saveAppointment = async (req, res, next) => {
  console.log("Вызван saveAppointment с параметрами:", req.params, req.body);
  const { id } = req.params;
  const { first_appointment, pay_type } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE crm.people SET 
         first_appointment = ?,
				 pay_type = ? 
       WHERE id = ?`,
      [first_appointment, pay_type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res.status(200).json({ message: "Приём и метод оплаты успешно сохранены" });
  } catch (err) {
    console.error("Ошибка при сохранении приёма:", err);
    next(err);
  }
};

// const updateCrmStatus = async (req, res, next) => {
//   const { id } = req.params;
//   const { crm_status } = req.body;
//   if (!id) {
//     return res.status(400).json({ message: "ID пациента не указан" });
//   }

//   try {
//     const [result] = await pool.query(
//       "UPDATE people SET crm_status = ? WHERE id = ?",
//       [crm_status, id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Пациент не найден" });
//     }

//     res.status(200).json({ message: "Статус сделки обновлен" });
//   } catch (err) {
//     console.error("Ошибка при обновлении CRM статуса", err);
//     next(err);
//   }
// };

const updateCrmStatus = async (req, res, next) => {
  const { id } = req.params;
  const { crm_status } = req.body;

  try {
    const isArchived = crm_status === "completed" ? 1 : 0;

    const [result] = await pool.query(
      "UPDATE crm.people SET crm_status = ?, is_archived = ? WHERE id = ?",
      [crm_status, isArchived, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res.status(200).json({ message: "Статус сделки и архивный статус обновлены" });
  } catch (err) {
    console.error("Ошибка при обновлении статуса сделки:", err);
    next(err);
  }
};





const saveNotes = async (req, res, next) => {
  const { id } = req.params;
  const { description } = req.body; // Это может быть строка или массив

  try {
    const [result] = await pool.query(
      "UPDATE crm.people SET description = ? WHERE id = ?",
      [
        Array.isArray(description)
          ? JSON.stringify(description) // Преобразуем массив в строку
          : description,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res.status(200).json({ message: "Заметки успешно сохранены" });
  } catch (err) {
    console.error("Ошибка при сохранении заметок", err);
    next(err);
  }
};


const savePatientData = async (req, res, next) => {
  const { id } = req.params;
  const {
    cardNumber,
    pay_type,
    first_appointment,
    description,
    first_is_come,
    first_sign_dt,
    first_cancel_reason,
    first_is_payed,
    second_recorded,
    second_is_payed,
    second_sign_dt,
    second_is_come,
    second_cancel_reason,
    is_hosp,
    diag,
  } = req.body;

  try {
    // Обновляем данные пациента
    await pool.query(
      `UPDATE crm.people SET 
        card_number = ?, 
        pay_type = ?,
        first_appointment = ?,
        description = ?,
        first_is_come = ?,
        first_sign_dt = ?,
        first_cancel_reason = ?,
        first_is_payed = ?,
        second_recorded = ?,
        second_is_payed = ?,
        second_sign_dt = ?,
        second_is_come = ?,
        second_cancel_reason = ?,
        is_hosp = ?,
        diag = ?
        WHERE id = ?`,
      [
        cardNumber,
        pay_type,
        first_appointment,
        description,
        first_is_come,
        first_sign_dt,
        first_cancel_reason,
        first_is_payed,
        second_recorded,
        second_is_payed,
        second_sign_dt,
        second_is_come,
        second_cancel_reason,
        is_hosp,
        diag,
        id,
      ]
    );

    // Извлекаем обновленные данные пациента
    const [rows] = await pool.query('SELECT * FROM crm.people WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Пациент не найден' });
    }

    const updatedPatient = rows[0];
    res.status(200).json(updatedPatient);
  } catch (err) {
    console.error('Ошибка при обновлении данных пациента', err);
    next(err);
  }
};


module.exports = {
  updateCrmStatus,
  searchCardsByPatient,
  // updatePatientStatus,
  savePatientData,
  saveCurdNumber,
  saveAppointment,
  getPatientAppointment,
  getMdocIdByPatientData,
  saveNotes,
};
