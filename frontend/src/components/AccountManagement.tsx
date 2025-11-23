import React, { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
}

export default function AccountManagement(): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile update states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Role management states
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);

  const availableRoles = [
    { value: "PRODUCT_OWNER", label: "Product Owner" },
    { value: "SCRUM_MASTER", label: "Scrum Master" },
    { value: "DEVELOPER", label: "Developer" },
    { value: "SYSTEM_ADMIN", label: "System Admin" },
  ];

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/me", {
        credentials: "include",
      });

      if (response.ok) {
        const user: User = await response.json();
        setCurrentUser(user);
        setFullName(user.fullName || "");
        setEmail(user.email || "");

        // If user is admin, fetch all users
        if (user.roles.includes("SYSTEM_ADMIN")) {
          fetchAllUsers();
        }
      } else {
        setError("Failed to load user profile");
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
      });

      if (response.ok) {
        const users: User[] = await response.json();
        setAllUsers(users);
      } else {
        console.error("Failed to load users list");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsUpdatingProfile(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email }),
      });

      if (response.ok) {
        const updatedUser: User = await response.json();
        setCurrentUser(updatedUser);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleEditRoles = (user: User) => {
    setEditingUserId(user.id);
    setSelectedRoles([...user.roles]);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRoles([]);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleUpdateRoles = async (userId: number) => {
    if (selectedRoles.length === 0) {
      setError("At least one role must be selected");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsUpdatingRoles(true);

    try {
      const response = await fetch(`/api/users/${userId}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (response.ok) {
        setSuccess("User roles updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        setEditingUserId(null);
        setSelectedRoles([]);
        await fetchAllUsers();
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to update roles");
      }
    } catch (err) {
      console.error("Error updating roles:", err);
      setError("Failed to update roles. Please try again.");
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  const isSystemAdmin = currentUser?.roles.includes("SYSTEM_ADMIN");

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div className="spinner"></div>
        <p>Loading account information...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Alert Messages */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            background: "#d1fae5",
            border: "1px solid #6ee7b7",
            borderRadius: "8px",
            color: "#065f46",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {/* My Profile Section */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 600 }}>
          My Profile
        </h2>

        <form onSubmit={handleProfileUpdate}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#4a5568",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={currentUser?.username || ""}
              disabled
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                background: "#f7fafc",
                color: "#718096",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#4a5568",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#4a5568",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#4a5568",
              }}
            >
              Current Roles
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {currentUser?.roles.map((role) => (
                <span
                  key={role}
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "#dbeafe",
                    color: "#1e40af",
                    borderRadius: "16px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {availableRoles.find((r) => r.value === role)?.label || role}
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            style={{
              padding: "8px 16px",
              background: isUpdatingProfile ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isUpdatingProfile ? "not-allowed" : "pointer",
            }}
          >
            {isUpdatingProfile ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* User Management Section (Admin Only) */}
      {isSystemAdmin && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "24px",
          }}
        >
          <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 600 }}>
            User Management
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#4a5568",
                    }}
                  >
                    Username
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#4a5568",
                    }}
                  >
                    Full Name
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#4a5568",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#4a5568",
                    }}
                  >
                    Roles
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#4a5568",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {user.username}
                      {user.id === currentUser?.id && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "12px",
                            color: "#718096",
                            fontStyle: "italic",
                          }}
                        >
                          (You)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {user.fullName || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {editingUserId === user.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {availableRoles.map((role) => (
                            <label
                              key={role.value}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(role.value)}
                                onChange={() => toggleRole(role.value)}
                                style={{ cursor: "pointer" }}
                              />
                              {role.label}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                background: "#dbeafe",
                                color: "#1e40af",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 500,
                              }}
                            >
                              {availableRoles.find((r) => r.value === role)?.label || role}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {editingUserId === user.id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleUpdateRoles(user.id)}
                            disabled={isUpdatingRoles}
                            style={{
                              padding: "6px 12px",
                              background: isUpdatingRoles ? "#94a3b8" : "#2563eb",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              cursor: isUpdatingRoles ? "not-allowed" : "pointer",
                            }}
                          >
                            {isUpdatingRoles ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdatingRoles}
                            style={{
                              padding: "6px 12px",
                              background: "#e2e8f0",
                              color: "#4a5568",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              cursor: isUpdatingRoles ? "not-allowed" : "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditRoles(user)}
                          style={{
                            padding: "6px 12px",
                            background: "#f1f5f9",
                            color: "#475569",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Edit Roles
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {allUsers.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#718096",
                  fontSize: "14px",
                }}
              >
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
