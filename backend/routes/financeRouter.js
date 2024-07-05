const express = require("express");
const financeController = require("../controllers/financeController");

const router = express.Router();

router.route("/tokens/:chainId").get(financeController.getSupportedTokens);
router.route("/quotes").post(financeController.getQuotes);
router.route("/params").post(financeController.processTransaction);

module.exports = router;
