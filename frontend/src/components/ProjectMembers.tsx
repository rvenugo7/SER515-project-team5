import React, { useState, useEffect } from "react";

interface ProjectMember {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  projectRoles: string[];
}

interface ProjectMembersProps {
  projectId: number;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps): JSX.Element {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableRoles = [
    { value: "PRODUCT_OWNER", label: "Product Owner" },
    { value: "SCRUM_MASTER", label: "Scrum Master" },
    { value: "DEVELOPER", label: "Developer" },
  ];

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        setError("Failed to fetch project members");
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to fetch project members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleEditRoles = (member: ProjectMember) => {
    setEditingUserId(member.userId);
    setSelectedRoles(member.projectRoles);
    setError(null);
    setSuccess(null);
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

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${userId}/roles`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, roles: selectedRoles }),
        }
      );

      if (response.ok) {
        setSuccess("User roles updated successfully");
        setEditingUserId(null);
        fetchMembers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to update roles");
      }
    } catch (err) {
      console.error("Error updating roles:", err);
      setError("Failed to update roles");
    }
  };

  const handleRemoveMember = async (userId: number, username: string) => {
    if (!window.confirm(`Remove ${username} from this project?`)) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setSuccess("User removed from project successfully");
        fetchMembers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to remove member");
      }
    } catch (err) {
      console.error("Error removing member:", err);
      setError("Failed to remove member");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRoles([]);
    setError(null);
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading project members...</div>;
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "24px",
        marginTop: "20px",
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: 600 }}>
        Project Members
      </h2>

      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "12px",
            background: "#f0fdf4",
            color: "#166534",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

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
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#718096",
                    fontSize: "14px",
                  }}
                >
                  No members in this project
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.userId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                    {member.username}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                    {member.fullName || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                    {member.email}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {editingUserId === member.userId ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
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
                        {member.projectRoles.map((role) => (
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
                    {editingUserId === member.userId ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleUpdateRoles(member.userId)}
                          style={{
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: "6px 12px",
                            background: "#e2e8f0",
                            color: "#4a5568",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEditRoles(member)}
                          style={{
                            padding: "6px 12px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Edit Roles
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.userId, member.username)}
                          style={{
                            padding: "6px 12px",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
