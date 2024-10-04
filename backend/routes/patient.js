const express = require("express");
const router = express.Router();
const { postgresClient, pool } = require("../db");

const {
  searchCardsByPatient,
  updateCrmStatus,
  // updatePatientStatus,
  savePatientData,
  saveCurdNumber,
  saveNotes,
  getPatientAppointment,
  getMdocIdByPatientData,
  saveAppointment,
} = require("../controllers/patient");

router.get("/patient/appointment/:mdoc_id", getPatientAppointment);

router.get("/patients/archived", async (req, res) => {
  try {
    const [patients] = await pool.query(
      "SELECT * FROM crm.people WHERE is_archived = true"
    );
    res.status(200).json(patients);
  } catch (err) {
    console.error("Ошибка при получении архивных пациентов", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/patient/cards", searchCardsByPatient);
router.put("/patient/:id/status", updateCrmStatus);
// router.put("/patient/:id/status", updatePatientStatus);
router.put("/patient/:id/save", savePatientData);
router.put("/patient/:id/saveCard", saveCurdNumber);
router.put("/patient/:id/saveAppointment", saveAppointment);
router.put("/patient/:id/saveNotes", saveNotes);
router.get("/patient/card/:cardNumber/mdoc", getMdocIdByPatientData);

module.exports = router;
