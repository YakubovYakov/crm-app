const express = require("express");
const router = express.Router();

const {
  searchCardsByPatient,
  updateCrmStatus,
	updatePatientStatus
} = require("../controllers/patient");

// Добавляем роут для поиска карт по пациенту
router.get("/patient/cards", searchCardsByPatient);
router.put("/patient/:id/status", updateCrmStatus);
router.put("/patient/:id/status", updatePatientStatus);

module.exports = router;
