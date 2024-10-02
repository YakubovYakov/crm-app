const express = require("express");
const router = express.Router();

const {
  searchCardsByPatient,
  updateCrmStatus,
  updatePatientStatus,
  savePatientData,
  saveCurdNumber,
  savePayType,
  getPatientAppointment,
  getMdocIdByPatientData,
} = require("../controllers/patient");

router.get("/patient/appointment/:mdoc_id", getPatientAppointment);
router.get("/patient/cards", searchCardsByPatient);
router.put("/patient/:id/status", updateCrmStatus);
router.put("/patient/:id/status", updatePatientStatus);
router.put("/patient/:id/save", savePatientData);
router.put("/patient/:id/saveCard", saveCurdNumber);
router.put("/patient/:id/payType", savePayType);
router.get("/patient/card/:cardNumber/mdoc", getMdocIdByPatientData);

module.exports = router;
