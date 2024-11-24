import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/DashboardLayout.css'; 
import { redirectIfNotLoggedIn } from '../utils/networkmanager';

function DashboardLayout({ children }) {
  let navigate = useNavigate();
  React.useEffect(() => {
    redirectIfNotLoggedIn(navigate);
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
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

export default DashboardLayout;
