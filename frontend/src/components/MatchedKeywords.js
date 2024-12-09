import React from 'react';
import '../styling/MatchedKeywords.css'; 

//=========== Japjot Bedi ===========
//The overall layout for the keywords page
function MatchedKeywords() {
  const keywords = ['Python', 'Team Leadership', 'Data Analysis'];

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
