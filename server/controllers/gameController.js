const Game = require("../models/game");

const findOrCreateGame = async (req, res) => {
  try {
    let game = await Game.findOne({ players: { $size: 1 } });
    if (game) {
      game.players.push(req.body.playerId);
      await game.save();
    } else {
      game = new Game({
        players: [req.body.playerId],
        board: Array(9).fill(null),
        turn: req.body.playerId,
        winner: null,
      });
      await game.save();
    }
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { findOrCreateGame };
