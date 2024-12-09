import React from 'react';
import '../styling/FitScoreCard.css'; 
import LoadingWheel from './LoadingWheel';

//=========== Japjot Bedi ===========
//The overall layout for the fit score page
//Task 25 Diego Velasquez 
//Some changes
function FitScoreCard() {

  function getFitScore()
  {
    return localStorage.getItem("analysisResults")?JSON.parse(localStorage.getItem("analysisResults")).fitScore:"100";
  }

  return (
    <div className="card">
      <h2>Resume Fit Score</h2>
      <div className="progress-container" style={{background: `conic-gradient(#4caf50 ${getFitScore()}%, #ccc ${getFitScore()}%)`}}>
        <div className="progress">
          {localStorage.getItem("analysisResults") ? 
          <span className="score">{getFitScore()}%</span> :
          <span className="score"><LoadingWheel></LoadingWheel></span>
          }
        </div>
      </div>
    </div>
  );
}

export default FitScoreCard;