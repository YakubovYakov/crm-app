const express = require("express");
const router = express.Router();

const {
  getAdditionalAppointments,
  addAdditionalAppointment,
  updateAdditionalAppointment,
  deleteAdditionalAppointment,
} = require("../controllers/additionalAppointments");

router.get(
  "/patients/:patientId/additional_appointments",
  getAdditionalAppointments
);
router.post(
  "/patients/:patientId/additional_appointments",
  addAdditionalAppointment
);
router.put("/additional_appointments/:id", updateAdditionalAppointment);
router.delete("/additional_appointments/:id", deleteAdditionalAppointment);

module.exports = router;