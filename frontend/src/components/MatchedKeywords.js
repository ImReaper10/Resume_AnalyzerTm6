import React from 'react';
import '../styling/MatchedKeywords.css'; 
import LoadingWheel from './LoadingWheel';

//=========== Japjot Bedi ===========
//The overall layout for the keywords page
function MatchedKeywords({ matchedKeywords = localStorage.getItem("analysisResults")?JSON.parse(localStorage.getItem("analysisResults")).matchedKeywordsInResume:[<LoadingWheel></LoadingWheel>]}) {
  //Task 25 Diego Velasquez 
  //Some changes
  //Fallback to default static keywords if dynamic data is not provided
  const keywords = matchedKeywords && matchedKeywords.length > 0 
    ? matchedKeywords 
    : ['No matched keywords!'];

  return (
    <div className="card">
      <h2>Matched Skills and Keywords</h2>
      <ul className="list">
        {keywords.map((keyword, index) => (
          <li key={index} className="list-item">
            {keyword}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MatchedKeywords;
