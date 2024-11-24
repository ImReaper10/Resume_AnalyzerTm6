import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardLayout.css'; 

function DashboardLayout({ children }) {
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
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

export default DashboardLayout;
