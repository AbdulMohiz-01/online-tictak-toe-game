const express = require("express");
const router = express.Router();
const { findOrCreateGame } = require("../controllers/gameController");

router.post("/find-match", findOrCreateGame);

module.exports = router;
