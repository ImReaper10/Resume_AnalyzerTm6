import React from 'react';
import '../styling/FitScoreCard.css'; 

//=========== Japjot Bedi ===========
//The overall layout for the fit score page
function FitScoreCard() {
  return (
    <div className="card">
      <h2>Resume Fit Score</h2>
      <div className="progress-container">
        <div className="progress">
          <span className="score">85%</span>
        </div>
      </div>
    </div>
  );
}

export default FitScoreCard;