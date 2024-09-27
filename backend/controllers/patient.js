const { postgresClient, pool } = require("../db");

// Поиск пациента по номеру карты
const searchCardsByPatient = async (req, res, next) => {
  const { surname, name, patron, birth } = req.query;

  let query = `
			SELECT 
			mm.mdoc_get_num_format(md.num, md.year, md.num_org, md.num_filial, md.num_type, mdtp.id, mdtp.class, 'IBN-YYYY-P') AS card_number
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
  const { cardNumber } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE people SET card_number = ? WHERE id = ?",
      [cardNumber, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res.status(200).json({ message: "Номер карты успешно сохранен" });
  } catch (err) {
    console.error("Ошибка при сохранении номера карты", err);
    next(err);
  }
};

const savePayType = async (req, res, next) => {
  const { id } = req.params;
  const { payType } = req.body;

	try {
		const [result] = await pool.query(
			"UPDATE people SET pay_type = ? WHERE id = ?",
			[payType, id]
		);

		if (result.affectedRows === 0 ) {
			return res.status(404).json({ message: "Пациент не найден" })
		}

		res.status(200).json({ message: "Канал обращения успешно сохранен" })
	} catch (err) {
		console.error("Ошибка при сохранении канала обращения", err);
		next(err)
	}
};

const updateCrmStatus = async (req, res, next) => {
  const { id } = req.params;
  const { crm_status } = req.body;
  if (!id) {
    return res.status(400).json({ message: "ID пациента не указан" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE people SET crm_status = ? WHERE id = ?",
      [crm_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res.status(200).json({ message: "Статус сделки обновлен" });
  } catch (err) {
    console.error("Ошибка при обновлении CRM статуса", err);
    next(err);
  }
};

const updatePatientStatus = async (req, res, next) => {
  const { id } = req.params;
  const { crm_status } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE people SET crm_status = ? WHERE id = ?",
      [crm_status, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Пациент не найден" });
    } else {
      res.status(200).json({ message: "Пользователь обновлен" });
    }
  } catch (err) {
    console.error("Ошибка при обновлении статуса сделки:", err);
    next(err);
  }
};

const savePatientData = async (req, res, next) => {
  const { id } = req.params;
  const { cardNumber, first_appointment, pay_type, description, first_is_come } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE people SET card_number = ?, first_appointment = ?, pay_type = ?, description = ?, first_is_come = ? WHERE id = ?",
      [cardNumber, first_appointment, pay_type, description, first_is_come, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }
    res.status(200).json({ message: "Данные пациента обновены" });
  } catch (err) {
    console.error("Ошибка при сохранении данных пациента", err);
    next(err);
  }
};

module.exports = {
  updateCrmStatus,
  searchCardsByPatient,
  updatePatientStatus,
  savePatientData,
  saveCurdNumber,
	savePayType,
};
