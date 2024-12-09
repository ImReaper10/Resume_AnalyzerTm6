import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/DashboardLayout.css'; 
import { redirectIfNotLoggedIn, getUploadedData, deleteUploadedData, getDocumentMetrics } from '../utils/networkmanager.js';
import FitScoreCard from '../components/FitScoreCard'; // Importing Fit Score component
import MatchedKeywords from '../components/MatchedKeywords'; // Importing Keywords component
import ImprovementSuggestions from '../components/ImprovementSuggestions'; // Importing Suggestions component

//=========== Japjot Bedi ===========
//The overall layout for the dashboard
//Task 25 Diego Velasquez 
//Some changes
function DashboardLayout({ children }) {
  let navigate = useNavigate();

  React.useEffect(() => {
    redirectIfNotLoggedIn(navigate);

    // Fetch uploaded data
    getUploadedData().then((data) => {
      if (data.success) {
        if (Object.keys(data.data).length === 0) {
          navigate('/upload');
        }
      }
    });

    getDocumentMetrics().then((data) => {
      if (data.success) {

      }
    });
  }, [navigate]);

  return (
    <div className="container">
      <nav className="navbar">
        <Link to="/dashboard/fit-score" className="link">
          Fit Score
        </Link>
        <Link to="/dashboard/keywords" className="link">
          Keywords
        </Link>
        <Link to="/dashboard/suggestions" className="link">
          Suggestions
        </Link>
        <Link to="/dashboard/view" className="link">
          View uploaded data
        </Link>
        <button
          onClick={async () => {
            await deleteUploadedData();
            navigate('/upload');
          }}
        >
          Upload another
        </button>
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
