import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/DashboardLayout.css'; 
import { redirectIfNotLoggedIn , getUploadedData, deleteUploadedData} from '../utils/networkmanager.js';


//=========== Japjot Bedi ===========
//The overall layout for the dashboard
function DashboardLayout({ children }) {
  let navigate = useNavigate();

  React.useEffect(() => {
    redirectIfNotLoggedIn(navigate);
    getUploadedData().then((data) => {
      if(data.success)
      {
          if(Object.keys(data.data).length === 0)
          {
              navigate("/upload");
          }
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
        <button onClick={async () => {await deleteUploadedData(); navigate("/upload")}}>Upload another</button>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

export default DashboardLayout;
