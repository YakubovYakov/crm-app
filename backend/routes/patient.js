const express = require("express");
const router = express.Router();

const { searchCardsByPatient } = require("../controllers/patient");

// Добавляем роут для поиска карт по пациенту
router.get("/patient/cards", searchCardsByPatient);

module.exports = router;
