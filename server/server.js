const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

connectDB();

app.use(express.json());
app.use("/api/game", gameRoutes);

let waitingPlayer = null;

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
};

const isBoardFull = (board) => {
  return board.every((cell) => cell !== null);
};

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("findMatch", () => {
    console.log("Find match requested by", socket.id);
    if (waitingPlayer) {
      const player1 = waitingPlayer;
      const player2 = socket;
      const gameId = `${player1.id}-${player2.id}`;

      player1.emit("matchFound", { gameId, player: "X" });
      player2.emit("matchFound", { gameId, player: "O" });

      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
      socket.emit("waitingForMatch");
    }
  });

  socket.on("joinGame", (gameId) => {
    console.log(`${socket.id} joining game ${gameId}`);
    socket.join(gameId);
  });

  socket.on("move", ({ gameId, board, turn }) => {
    console.log(`Move received for game ${gameId}`, board, turn);

    const winner = checkWinner(board);
    if (winner) {
      io.in(gameId).emit("gameOver", { result: "win", winner });
    } else if (isBoardFull(board)) {
      io.in(gameId).emit("gameOver", { result: "draw" });
    } else {
      io.in(gameId).emit("updateGame", { board, turn });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
