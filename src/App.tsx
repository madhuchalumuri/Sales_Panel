import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import RegisteredClients from "./components/RegisteredClients";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SalesUsersList from "./components/SalesUsersList";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Router basename="/CloneTab/">
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
            path="/"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/users"
            element={isLoggedIn ? <SalesUsersList /> : <Navigate to="/" />}
          />
          <Route
            path="/registered-clients"
            element={isLoggedIn ? <RegisteredClients /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}
