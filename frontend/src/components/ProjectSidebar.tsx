import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CreateProjectModal from "./CreateProjectModal";
import JoinProjectModal from "./JoinProjectModal";

interface Project {
  id: number;
  name: string;
  projectKey: string;
  projectCode?: string;
}

interface CurrentUser {
  id: number;
  roles: string[];
}

interface ProjectSidebarProps {
  currentUser: CurrentUser | null;
  currentProjectId?: number;
  onProjectSelect: (projectId: number) => void;
}

export default function ProjectSidebar({
  currentUser,
  currentProjectId,
  onProjectSelect,
}: ProjectSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isJoinProjectOpen, setIsJoinProjectOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchProjects = async () => {
    if (!currentUser) return;

    try {
      const isSystemAdmin = currentUser.roles.includes("SYSTEM_ADMIN");
      // Admins see all projects, others see "my" projects

      const endpoint = isSystemAdmin ? "/api/projects" : "/api/projects/my";

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canCreateProject = currentUser?.roles.some(
    (role) => role === "PRODUCT_OWNER" || role === "SYSTEM_ADMIN"
  );

  const canJoinProject = currentUser?.roles.some(
    (role) => role === "DEVELOPER" || role === "SCRUM_MASTER"
  );

  return (
    <div className="project-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Projects</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          {canJoinProject && (
            <button
              className="sidebar-create-btn"
              onClick={() => setIsJoinProjectOpen(true)}
              title="Join Project"
              style={{ backgroundColor: "#4299e1" }}
            >
              ➜
            </button>
          )}
          {canCreateProject && (
            <button
              className="sidebar-create-btn"
              onClick={() => setIsCreateProjectOpen(true)}
              title="Create New Project"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="projects-list">
        {isLoading ? (
          <div className="sidebar-loading">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="sidebar-empty">No projects found.</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`project-item ${
                currentProjectId === project.id ? "active" : ""
              }`}
              onClick={() => onProjectSelect(project.id)}
            >
              <div className="project-item-name">{project.name}</div>
              <div className="project-item-meta">
                <span className="project-key">{project.projectKey}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="sidebar-footer">
        <div 
            className={`project-item ${location.pathname === '/account' ? 'active' : ''}`}
            onClick={() => navigate('/account')}
            style={{borderTop: '1px solid #2d3748'}}
        >
            <div className="project-item-name">⚙️ Account Settings</div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={() => {
          fetchProjects(); // Refresh list
          setIsCreateProjectOpen(false);
        }}
      />

      <JoinProjectModal
        isOpen={isJoinProjectOpen}
        onClose={() => setIsJoinProjectOpen(false)}
        onJoined={() => {
          fetchProjects(); // Refresh list
          setIsJoinProjectOpen(false);
        }}
      />
    </div>
  );
}
