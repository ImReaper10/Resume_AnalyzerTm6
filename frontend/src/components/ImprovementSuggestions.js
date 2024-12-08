import React from 'react';
import '../styling/ImprovementSuggestions.css'; 

//=========== Japjot Bedi ===========
//The overall layout for the suggestions page
function ImprovementSuggestions({ suggestions = [] }) {
  //Task 25 Diego Velasquez 
  //Some changes
  // Fallback default suggestions if none are provided
  const defaultSuggestions = [
    'Include measurable achievements.',
    'Highlight certifications in cloud computing.',
    'Add technical skills relevant to the job.',
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
