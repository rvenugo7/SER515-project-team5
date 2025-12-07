import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import MainScreen from "./components/MainScreen.tsx";
import Login from "./components/Login.tsx";
import ProjectList from "./components/ProjectList.tsx";

// Wrapper to pass route params to MainScreen
const MainScreenWrapper = ({ onLogout }: { onLogout: () => void }) => {
  const { projectId } = useParams<{ projectId: string }>();
  // If no projectId, we might want to default to something or show an error
  // For now, MainScreen handles it or we assume user is redirected
  return <MainScreen onLogout={onLogout} projectId={projectId ? Number(projectId) : undefined} />;
};

const ProtectedRoute = ({ children, loggedIn }: { children: JSX.Element; loggedIn: boolean }) => {
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/users/me", {
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        setLoggedIn(true);
        setUserRoles(user.roles || []);
      } else {
        setLoggedIn(false);
      }
    } catch (err) {
      setLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    // Re-check auth to get roles and update state
    checkAuthentication().then(() => {
        navigate("/");
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
      setLoggedIn(false);
      setUserRoles([]);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setLoggedIn(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="app">
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const isSystemAdmin = userRoles.includes("SYSTEM_ADMIN");

  return (
    <Routes>
      <Route path="/login" element={!loggedIn ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
      
      <Route
        path="/projects"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            {isSystemAdmin ? <ProjectList onLogout={handleLogout} /> : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/project/:projectId"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <MainScreenWrapper onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
             {/* If System Admin, go to projects list by default, otherwise MainScreen (assuming single project for now or defaulting to first) */}
            {isSystemAdmin ? <Navigate to="/projects" /> : <MainScreenWrapper onLogout={handleLogout} />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
