import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Upload from "./components/Upload";
import DashboardLayout from "./layouts/DashboardLayout";
import FitScoreCard from "./components/FitScoreCard";
import MatchedKeywords from "./components/MatchedKeywords";
import ImprovementSuggestions from "./components/ImprovementSuggestions";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<Upload />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="fit-score" element={<FitScoreCard />} />
                  <Route path="keywords" element={<MatchedKeywords />} />
                  <Route path="suggestions" element={<ImprovementSuggestions />} />
                  <Route path="*" element={<Navigate to="fit-score" />} />
                </Routes>
              </DashboardLayout>
            </PrivateRoute>
          }
        />

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
