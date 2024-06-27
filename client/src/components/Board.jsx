import Square from "./Square";
import PropTypes from "prop-types";

const Board = ({ board, onClick }) => (
  <div className="board">
    {board.map((value, index) => (
      <Square key={index} value={value} onClick={() => onClick(index)} />
    ))}
  </div>
);

Board.propTypes = {
  board: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.func,
};

export default Board;
