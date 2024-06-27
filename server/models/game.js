const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  players: [String],
  board: [String],
  turn: String,
  winner: String,
});

module.exports = mongoose.model("Game", GameSchema);
