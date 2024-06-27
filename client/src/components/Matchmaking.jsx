import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const Matchmaking = () => {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("connected to server");
    });

    newSocket.on("disconnect", () => {
      console.log("disconnected from server");
    });

    newSocket.on("matchFound", ({ gameId, player }) => {
      console.log("Match found", gameId, player);
      setGameId(gameId);
      setPlayer(player);
      newSocket.emit("joinGame", gameId);
    });

    newSocket.on("waitingForMatch", () => {
      console.log("Waiting for another player...");
    });

    newSocket.on("updateGame", ({ board, turn }) => {
      console.log("Game update received", board, turn);
      setBoard(board);
      setTurn(turn);
    });

    newSocket.on("gameOver", ({ result, winner }) => {
      console.log("Game over", result, winner);
      setGameOver(true);
      setWinner(winner);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleMove = (index) => {
    if (board[index] || turn !== player || gameOver) return;
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);
    setTurn(player === "X" ? "O" : "X");
    if (socket) {
      socket.emit("move", {
        gameId,
        board: newBoard,
        turn: player === "X" ? "O" : "X",
      });
    }
  };

  const renderCell = (index) => (
    <button onClick={() => handleMove(index)}>{board[index]}</button>
  );

  return (
    <div>
      <h1>Matchmaking</h1>
      {!gameId && (
        <button onClick={() => socket.emit("findMatch")}>Find Match</button>
      )}
      {gameId && (
        <div>
          <p>
            Game ID: {gameId}, You are player {player}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 100px)",
              gap: "10px",
            }}
          >
            {board.map((cell, index) => renderCell(index))}
          </div>
          <p>Turn: {turn}</p>
          {gameOver && (
            <p>{winner ? `Player ${winner} wins!` : "It's a draw!"}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Matchmaking;
