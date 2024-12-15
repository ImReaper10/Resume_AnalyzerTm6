import React, { useState } from 'react';
import '../styling/ImprovementSuggestions.css'; 
import LoadingWheel from './LoadingWheel';

//=========== Japjot Bedi ===========
//The overall layout for the suggestions page with filtering
//Task 25 and 27 Diego Velasquez 
  //Some changes
  // Fallback default suggestions if none are provided
function ImprovementSuggestions({ suggestions = localStorage.getItem("analysisResults") ? JSON.parse(localStorage.getItem("analysisResults")).improvementSuggestions : [<LoadingWheel />] }) {
  // Default categories for filtering
  const [filter, setFilter] = useState('all');

  // Categories that we will filter by (based on the backend)
  const categories = ['all', 'skills', 'experience', 'formatting'];

  // Filter suggestions based on the selected category
  const filteredSuggestions = suggestions.filter((suggestion) =>
    filter === 'all' || !suggestion.category || suggestion.category === filter
  );

  return (
    <div className="card">
      <h2>Improvement Suggestions</h2>

      {/* Filter Dropdown */}
      <select className="filter-dropdown" onChange={(e) => setFilter(e.target.value)} value={filter}>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>

      {/* Displaying filtered suggestions */}
      <ul className="list">
        {localStorage.getItem("analysisResults")?(filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => (
            <li key={index} className="list-item">
              {suggestion.text}
            </li>
          ))
        ) : (
          // Fallback suggestion if there are no results
          <li className="list-item">No suggestions!</li>
        )) :
          <li><LoadingWheel></LoadingWheel></li>
        }
      </ul>
    </div>
  );
}

export default ImprovementSuggestions;
