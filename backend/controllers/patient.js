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
    WHERE md.SURNAME = $1 AND md.NAME = $2
  `;

  const queryParams = [surname, name]; // Используем параметры для безопасного запроса

  if (patron) {
    query += " AND md.PATRON = $3";
    queryParams.push(patron);
  }

  if (birth) {
    query += ` AND p.BIRTH = $${queryParams.length + 1}`; // Индекс переменной для параметра birth
    queryParams.push(birth);
  }

  query += " LIMIT 100";

  try {
    const { rows } = await postgresClient.query(query, queryParams); // Используем postgresClient
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

const updateCrmStatus = async (req, res, next) => {
  const { id } = req.params;
  const { crm_status } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE people SET crm_status = ? WHERE id = ?",
      [crm_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Пациент не найден" });
    }

    res.status(200).json({ messgae: "Статус сделки обновлен" });
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

module.exports = {
  updateCrmStatus,
  searchCardsByPatient,
	updatePatientStatus,
};
