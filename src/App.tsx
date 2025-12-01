import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ClientRegistration from "./components/ClientRegistration";
import RegisteredClients from "./components/RegisteredClients";
import ClientDetails from "./components/ClientDetails";
import LicenseKeyGenerator from "./components/LicenseKeyGenerator";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SalesUsersList from "./components/SalesUsersList";
import UserRegistration from "./components/UserRegistration";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Router basename="/CloneTab">
        <Routes>
          <Route
            path="/"
            element={
              !isLoggedIn ? (
                <LoginPage onLogin={() => setIsLoggedIn(true)} />
              ) : (
                <Dashboard />
              )
            }
          />
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/users"
            element={isLoggedIn ? <SalesUsersList /> : <Navigate to="/" />}
          />
          <Route
            path="/client-registration"
            element={isLoggedIn ? <ClientRegistration /> : <Navigate to="/" />}
          />
          <Route
            path="/user-registration"
            element={isLoggedIn ? <UserRegistration /> : <Navigate to="/" />}
          />
          <Route
            path="/registered-clients"
            element={isLoggedIn ? <RegisteredClients /> : <Navigate to="/" />}
          />
          {/* <Route
            path="/client-details/:id"
            element={isLoggedIn ? <ClientDetails /> : <Navigate to="/" />}
          /> */}
          <Route
            path="/license-generator"
            element={isLoggedIn ? <LicenseKeyGenerator /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </>
  );
}
