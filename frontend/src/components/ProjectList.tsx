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

  if (isLoading) return <div style={{ padding: 20 }}>Loading projects...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>All Projects (System Admin)</h1>
        <button onClick={onLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              cursor: "pointer",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18 }}>{project.name}</h3>
            <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: 14 }}>{project.description}</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999" }}>
              <span>Key: {project.projectKey}</span>
              <span>Code: {project.projectCode || "N/A"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
