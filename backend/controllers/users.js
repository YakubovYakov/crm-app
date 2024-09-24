const { pool, postgresClient } = require("../db");
const NotFoundError = require("../errors/NotFoundError");
const InternalServerError = require("../errors/InternalServerError");
const { json } = require("express");

// Получение всех пользователей
const getUsers = async (req, res, next) => {
  const { search } = req.query;
  let query = "SELECT * FROM people";

  if (search) {
    query += ` WHERE name LIKE '%${search}%' OR surname LIKE '%${search}%'`;
  }

  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
    next(err);
  }
};

// Получение одного пользователя по ID
const getUserById = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM people WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0) {
      throw new NotFoundError("Пользователь не найден");
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Ошибка при получении пользователя:", err);
    next(err);
  }
};

// Создание нового пользователя
const createUser = async (req, res, next) => {
  const { name, surname, patron, birthday } = req.body;

  try {
    // Добавляем нового пользователя в основную базу данных
    const [result] = await pool.query(
      "INSERT INTO people (name, surname, patron, birthday) VALUES (?, ?, ?, ?)",
      [
        name.toUpperCase(),
        surname.toUpperCase(),
        patron ? patron.toUpperCase() : null,
        birthday,
      ]
    );

    // После создания пользователя синхронизируем с базой данных PostgreSQL
    let cardQuery = `
		SELECT mm.mdoc_get_num_format(md.num, md.year, md.num_org, md.num_filial, md.num_type, mdtp.id, mdtp.class, 'IBN-YYYY-P') AS card_number
		FROM mm.mdoc md
		INNER JOIN mm.mdoc_type mdtp ON mdtp.id = md.mdoc_type_id
		JOIN mm.people p ON p.id = md.people_id
		WHERE md.SURNAME = $1 AND md.NAME = $2
    `;

    const cardQueryParams = [surname.toUpperCase(), name.toUpperCase()];
		
    if (patron) {
      cardQuery += " AND md.PATRON = $3";
      cardQueryParams.push(patron.toUpperCase());
    }
    if (birthday) {
      cardQuery += " AND p.BIRTH = $4";
      cardQueryParams.push(birthday);
    }

    // Запрашиваем номер карты для нового пользователя
    const { rows } = await postgresClient.query(cardQuery, cardQueryParams);

    if (rows.length > 0) {
      const cards = rows.map((row) => row.card_number);
      res
        .status(201)
        .json({ id: result.insertId, name, surname, patron, birthday, cards });
    } else {
      res
        .status(201)
        .json({
          id: result.insertId,
          name,
          surname,
          patron,
          birthday,
          cards: [],
        });
    }
  } catch (err) {
    console.error("Ошибка при создании пользователя:", err);
    next(err);
  }
};

// Обновление пользователя по ID
const updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const { name, surname, patron, birthday } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE people SET name = ?, surname = ?, patron = ?, birthday = ? WHERE id = ?",
      [name, surname, patron, birthday, userId]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError("Пользователь не найден");
    }
    res.json({ message: "Пользователь обновлен" });
  } catch (err) {
    console.error("Ошибка при обновлении пользователя:", err);
    next(err);
  }
};

// Удаление пользователя по ID
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const [result] = await pool.query("DELETE FROM people WHERE id = ?", [
      userId,
    ]);
    if (result.affectedRows === 0) {
      throw new NotFoundError("Пользователь не найден");
    }
    res.json({ message: "Пользователь удален" });
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err);
    next(err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
