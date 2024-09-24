const express = require("express");
const { searchDiagnoses } = require("../controllers/diagnoses");

const router = express.Router();

router.get("/diagnoses", searchDiagnoses);

module.exports = router;
