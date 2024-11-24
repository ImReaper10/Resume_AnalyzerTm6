import React from 'react';
import '../styling/ImprovementSuggestions.css'; 

function ImprovementSuggestions() {
  const suggestions = [
    'Include measurable achievements.',
    'Highlight certifications in cloud computing.',
    'Add technical skills relevant to the job.',
  ];

  return (
    <div className="card">
      <h2>Improvement Suggestions</h2>
      <ul className="list">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="list-item">
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ImprovementSuggestions;
