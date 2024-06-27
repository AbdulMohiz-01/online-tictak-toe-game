// import React from "react";
import PropTypes from "prop-types";

const Square = ({ value, onClick }) => (
  <button className="square" onClick={onClick}>
    {value}
  </button>
);

// validate Props
Square.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
};

export default Square;
