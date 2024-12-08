import React from 'react';
import '../styling/FitScoreCard.css'; 

//=========== Japjot Bedi ===========
//The overall layout for the fit score page
//Task 25 Diego Velasquez 
  //Some changes
function FitScoreCard({ fitScore = 85 }) {
  return (
    <div className="card">
      <h2>Resume Fit Score</h2>
      <div className="progress-container">
        <div className="progress">
          <span className="score">{fitScore}%</span>
        </div>
      </div>
    </div>
  );
}

export default FitScoreCard;