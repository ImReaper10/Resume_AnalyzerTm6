import React from 'react';
import '../styling/ImprovementSuggestions.css'; 

//=========== Japjot Bedi ===========
//The overall layout for the suggestions page
function ImprovementSuggestions({ suggestions = localStorage.getItem("analysisResults")?JSON.parse(localStorage.getItem("analysisResults")).improvementSuggestions:["Loading..."] }) {
  //Task 25 Diego Velasquez 
  //Some changes
  //Fallback default suggestions if none are provided
  const defaultSuggestions = [
    'No suggestions!',
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="card">
      <h2>Improvement Suggestions</h2>
      <ul className="list">
        {displaySuggestions.map((suggestion, index) => (
          <li key={index} className="list-item">
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ImprovementSuggestions;
