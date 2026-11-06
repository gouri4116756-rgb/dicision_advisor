const express = require("express");

const {
  askAdvisor,
  recordDecisionOutcome
} = require("../controllers/advisor.controller");

const router = express.Router();

router.post("/ask", askAdvisor);
router.post("/memories", recordDecisionOutcome);

module.exports = router;