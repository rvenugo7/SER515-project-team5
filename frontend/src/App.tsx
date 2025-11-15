import React, { useEffect, useState } from "react";
import MainScreen from "./components/MainScreen.tsx";
import Login from "./components/Login.tsx";

export default function App(): JSX.Element {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/users/me", {
        credentials: "include",
      });

      if (response.ok) {
        setLoggedIn(true);
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
    setLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
      setLoggedIn(false);
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

  return (
    <div className="app">
      <main>
        {loggedIn ? (
          <MainScreen onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}
