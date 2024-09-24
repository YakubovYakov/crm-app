// controllers/diagnoses.js

const { postgresClient } = require("../db");

// Поиск диагнозов по введенному тексту
const searchDiagnoses = async (req, res, next) => {
  const { search } = req.query;
  let query = `
    SELECT id, concat(kod1,' ',name) as diag 
    FROM mm.icd10 
    WHERE del=0 AND selectable=true
  `;

  // Если введено значение для поиска
  if (search) {
    query += ` AND name LIKE '%${search}%' OR kod1 LIKE '%${search}%'`;
  }

  query += " ORDER BY id";

  try {
    const result = await postgresClient.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при поиске диагнозов:", err);
    next(err);
  }
};

module.exports = {
  searchDiagnoses,
};
