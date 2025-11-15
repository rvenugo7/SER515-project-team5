import React, { useState } from "react";

interface LoginProps {
  onLoginSuccess: () => void;
}

type Tab = "login" | "register";

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regRoles, setRegRoles] = useState<string[]>([]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", loginUsername);
      formData.append("password", loginPassword);

      const response = await fetch("/perform-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
        credentials: "include",
      });

      if (response.ok) {
        onLoginSuccess();
      } else {
        const errorText = await response.text();
        setError(
          errorText || "Invalid username or password. Please try again."
        );
      }
    } catch (err) {
      setError("Login failed. Please check your connection and try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (regRoles.length === 0) {
      setError("Please select at least one role.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          roles: regRoles,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Registration successful! Please login.");
        setActiveTab("login");
        setRegUsername("");
        setRegEmail("");
        setRegPassword("");
        setRegFullName("");
        setRegRoles([]);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Registration failed");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setRegRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">✓</div>
          <h1>Scrum Management System</h1>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setError("");
              setSuccess("");
            }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("register");
              setError("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="auth-alert error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert success">
            <span>✓ {success}</span>
          </div>
        )}

        {activeTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                type="text"
                id="login-username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="username"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="password"
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-username">
                Username <span className="required">*</span>
              </label>
              <input
                type="text"
                id="reg-username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="reg-email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="reg-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-fullname">Full Name</label>
              <input
                type="text"
                id="reg-fullname"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Full name"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>
                Select Your Role(s) <span className="required">*</span>
              </label>
              <div className="role-selector">
                <div className="role-option">
                  <input
                    type="checkbox"
                    id="role-dev"
                    checked={regRoles.includes("DEVELOPER")}
                    onChange={() => toggleRole("DEVELOPER")}
                    disabled={isLoading}
                  />
                  <label htmlFor="role-dev">Developer</label>
                </div>
                <div className="role-option">
                  <input
                    type="checkbox"
                    id="role-po"
                    checked={regRoles.includes("PRODUCT_OWNER")}
                    onChange={() => toggleRole("PRODUCT_OWNER")}
                    disabled={isLoading}
                  />
                  <label htmlFor="role-po">Product Owner</label>
                </div>
                <div className="role-option">
                  <input
                    type="checkbox"
                    id="role-sm"
                    checked={regRoles.includes("SCRUM_MASTER")}
                    onChange={() => toggleRole("SCRUM_MASTER")}
                    disabled={isLoading}
                  />
                  <label htmlFor="role-sm">Scrum Master</label>
                </div>
                <div className="role-option">
                  <input
                    type="checkbox"
                    id="role-admin"
                    checked={regRoles.includes("SYSTEM_ADMIN")}
                    onChange={() => toggleRole("SYSTEM_ADMIN")}
                    disabled={isLoading}
                  />
                  <label htmlFor="role-admin">System Admin</label>
                </div>
              </div>
              <p className="help-text">Select one role</p>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
