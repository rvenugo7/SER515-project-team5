import React, { useState, useEffect } from "react";

interface Project {
  id: number;
  name: string;
  description: string;
  projectKey: string;
  projectCode: string;
}

interface ProjectListProps {
  onLogout: () => void;
}

export default function ProjectList({ onLogout }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    window.location.href = `/project/${projectId}`;
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scrum-container">
        <div className="error-banner">
          <span>Error: {error}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="scrum-container">
      {/* Header */}
      <div className="scrum-header">
        <div className="header-left">
          <div className="logo">✓</div>
          <div>
            <h1 className="scrum-title">All Projects</h1>
            <p className="scrum-subtitle">System Administrator View</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
          marginTop: "20px",
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className="project-card"
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(0,0,0,0.1)";
              e.currentTarget.style.borderColor = "#cbd5e0";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#2d3748",
                  lineHeight: "1.4",
                }}
              >
                {project.name}
              </h3>
              <span
                style={{
                  background: project.active ? "#c6f6d5" : "#fed7d7",
                  color: project.active ? "#22543d" : "#9b2c2c",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                }}
              >
                {project.active ? "Active" : "Inactive"}
              </span>
            </div>

            <p
              style={{
                margin: "0 0 20px 0",
                color: "#718096",
                fontSize: "14px",
                lineHeight: "1.6",
                flex: "1",
              }}
            >
              {project.description || "No description provided."}
            </p>

            <div
              style={{
                paddingTop: "16px",
                borderTop: "1px solid #edf2f7",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                color: "#4a5568",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#a0aec0", fontWeight: "500" }}>KEY</span>
                <span
                  style={{
                    background: "#edf2f7",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontWeight: "600",
                  }}
                >
                  {project.projectKey}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#a0aec0", fontWeight: "500" }}>CODE</span>
                <span
                  style={{
                    background: "#edf2f7",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                  }}
                >
                  {project.projectCode || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
