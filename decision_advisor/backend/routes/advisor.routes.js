const express = require("express");

const {
  askAdvisor
} = require("../controllers/advisor.controller");

const router = express.Router();

router.post("/ask", askAdvisor);

module.exports = router;