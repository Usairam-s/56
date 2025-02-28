import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LandingPage } from "./LandingPage";
import { SignupPage } from "./SignupPage";
import { SignInPage } from "../pages/SignInPage";
import { Dashboard } from "../pages/Dashboard";

import { useTeleprompterStore } from "../store/teleprompterStore";
import { FAQPage } from "./FAQPage";
import ProtectedRoute from "./ProtectedRouteComponent";

const App: React.FC = () => {
  const { isDarkMode } = useTeleprompterStore();

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
