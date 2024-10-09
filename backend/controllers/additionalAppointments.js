const { pool } = require("../db");

const getAdditionalAppointments = async (req, res) => {
  const { patientId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM additional_appointments WHERE people_id = ?",
      [patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при получении дополнительных приемов:", err);
    res.status(500).json({ error: err.message });
  }
};

const addAdditionalAppointment = async (req, res) => {
  const { patientId } = req.params;
  const { appointment_date, is_come, cancel_reason, is_payed } = req.body;

  if (!patientId || !appointment_date) {
    return res.status(404).json({ error: "Отсутствуют обязательные данные" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO additional_appointments (people_id, appointment_date, is_come, cancel_reason, is_payed)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, appointment_date, is_come, cancel_reason, is_payed]
    );
    res.json({
      id: result.insertId,
      patientId,
      appointment_date,
      is_come,
      cancel_reason,
      is_payed,
    });
  } catch (err) {
    console.error("Ошибка при добавлении дополнительного приема:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateAdditionalAppointment = async (req, res) => {
  const { id } = req.params;
  const { appointment_date, is_come, cancel_reason, is_payed } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE additional_appointments
       SET appointment_date = ?, is_come = ?, cancel_reason = ?, is_payed = ?
       WHERE id = ?`,
      [appointment_date, is_come, cancel_reason, is_payed, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Прием не найден" });
    }

    res.json({ id, appointment_date, is_come, cancel_reason, is_payed });
  } catch (err) {
    console.error("Ошибка при обновлении приема:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteAdditionalAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM additional_appointments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Прием не найден" });
    }

    res.json({ message: "Дополнительный прием удален" });
  } catch (err) {
    console.error("Ошибка при удалении приема:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAdditionalAppointments,
  addAdditionalAppointment,
  updateAdditionalAppointment,
  deleteAdditionalAppointment,
};
