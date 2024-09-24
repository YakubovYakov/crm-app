const { postgresClient } = require("../db"); // Правильное подключение Postgres клиента

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

module.exports = {
  searchCardsByPatient,
};
