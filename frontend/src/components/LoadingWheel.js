import React from "react";
import "../styling/LoadingWheel.css";

//=========== Husain Awan and James Goode ===========
//Set up for loading wheel
const LoadingWheel = () => {
  return (
    <div className="loading-wheel-container">
      <span>Loading... </span>
      <div className="loading-wheel"></div>
    </div>
  );
};

export default LoadingWheel;
