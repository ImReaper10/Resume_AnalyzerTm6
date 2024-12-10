import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Upload from "./components/Upload";
import DashboardLayout from "./layouts/DashboardLayout";
import FitScoreCard from "./components/FitScoreCard";
import MatchedKeywords from "./components/MatchedKeywords";
import ImprovementSuggestions from "./components/ImprovementSuggestions";
import { getAccountInfo, getBackendStatus, deleteUploadedData} from "./utils/networkmanager.js";
import "./App.css"
import View from "./components/View";

//=========== James Goode ===========
//Made to detect if a route changes so we can set the username at the top of the page
function RouteChangeDetector({usernameSetter}) {
  const location = useLocation();

  React.useEffect(() => {
    getAccountInfo().then((account) => {
      if(account.success)
      {
        usernameSetter(account.info.username)
      }
      else
      {
        usernameSetter("");
      }
    });
  }, [location]);

  return null;
}

//=========== James Goode and Japjot Bedi (for dashboard and routes) ===========
//Below holds all of our routes along with the header at the top of the page
const App = () => {
  const [username, setUsername] = React.useState("");
  const [backendStatus, setStatus] = React.useState(true);

  useEffect(() => {
    getBackendStatus().then((status) => {
      if(!status.success)
      {
        setStatus(false);
        return;
      }
    });
  }, []);

  return (
    <div className="main-container">
      <header className="main-header">
        <h1 className="main-title">Resume Analyzer</h1>
        {username &&
          <div className="user-controls">
            <span className="username-placeholder">{username}</span>
            <button onClick={async () => {await deleteUploadedData(); localStorage.setItem('jwt', ''); window.location.reload()}} className="signout-button">Sign Out</button>
          </div>
        }
      </header>
      {backendStatus &&
      <main>
        <Router>
          <RouteChangeDetector usernameSetter={setUsername} />
          <Routes>

            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/upload" element={<Upload />} />

            <Route
              path="/dashboard/*"
              element={
                <DashboardLayout>
                  <Routes>
                    <Route path="fit-score" element={<FitScoreCard />} />
                    <Route path="keywords" element={<MatchedKeywords />} />
                    <Route path="suggestions" element={<ImprovementSuggestions />} />
                    <Route path="view" element={<View />} />
                    <Route path="*" element={<Navigate to="fit-score" />} />
                  </Routes>
                </DashboardLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </main>}
      {!backendStatus &&
        <h1>Unfortunatly we were unable to reach our backend, please try again later...</h1>
      }
      <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&amp;display=swap"
      />
    </div>
  );
};

export default App;
