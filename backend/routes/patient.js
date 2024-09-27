const express = require("express");
const router = express.Router();

const {
  searchCardsByPatient,
  updateCrmStatus,
  updatePatientStatus,
  savePatientData,
  saveCurdNumber,
  savePayType,
} = require("../controllers/patient");

// Добавляем роут для поиска карт по пациенту
router.get("/patient/cards", searchCardsByPatient);
router.put("/patient/:id/status", updateCrmStatus);
router.put("/patient/:id/status", updatePatientStatus);
router.put("/patient/:id/save", savePatientData);
router.put("/patient/:id/saveCard", saveCurdNumber);
router.put("/patient/:id/savePayType", savePayType)

module.exports = router;
