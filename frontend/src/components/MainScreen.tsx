import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StoryCard from "./StoryCard";
import KanbanColumn from "./KanbanColumn";
import ProductBacklog from "./ProductBacklog";
import ReleasePlans from "./ReleasePlans";
import CreateUserStoryModal from "./CreateUserStoryModal";
import AccountManagement from "./AccountManagement";
import ProjectSidebar from "./ProjectSidebar";

interface MainScreenProps {
  onLogout?: () => void;
  projectId?: number;
}

interface BackendStory {
  id: number;
  title: string;
  description: string;
  priority: string;
  storyPoints?: number;
  status: string;
  acceptanceCriteria?: string;
  businessValue?: number;
  sprintReady?: boolean;
  isStarred?: boolean;
  releasePlanId?: number;
  releasePlanKey?: string;
  releasePlanName?: string;
}

interface FrontendStory {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  points: number;
  status: string;
  labels: string[];
  assignee: string;
  assigneeName?: string;
  tags?: string[];
  isStarred?: boolean;
  isSprintReady?: boolean;
  acceptanceCriteria?: string;
  businessValue?: number;
  releasePlanId?: number;
  releasePlanKey?: string;
  releasePlanName?: string;
}

interface CurrentUser {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
}

export default function MainScreen({
  onLogout,
  projectId,
}: MainScreenProps): JSX.Element {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Scrum Board");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [stories, setStories] = useState<FrontendStory[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const toastTimer = useRef<number | null>(null);

  // Map backend status to frontend status
  const mapBackendStatusToFrontend = (backendStatus: string): string => {
    const statusUpper = backendStatus?.toUpperCase() || "NEW";
    switch (statusUpper) {
      case "NEW":
        return "Backlog";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      case "IN_REVIEW":
        return "In Progress";
      case "BLOCKED":
        return "Backlog";
      default:
        return "Backlog";
    }
  };

  const mapFrontendStatusToBackend = (frontendStatus: string): string => {
    const statusUpper = frontendStatus.toUpperCase();
    switch (statusUpper) {
      case "BACKLOG":
      case "TO DO":
        return "NEW";
      case "IN PROGRESS":
        return "IN_PROGRESS";
      case "DONE":
        return "DONE";
      default:
        return "NEW";
    }
  };

  useEffect(() => {
    fetchStories();
    fetchCurrentUser();
    if (projectId) {
      fetchProjectDetails(projectId);
    } else {
      setCurrentProject(null);
    }
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, [projectId]);

  const fetchProjectDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProject(data);
      }
    } catch (e) {
      console.error("Failed to fetch project", e);
    }
  };

  const totalStories = stories.length;
  const totalPoints = stories.reduce((sum, story) => sum + story.points, 0);

  const getStoriesByStatus = (status: string) => {
    const normalizedPriority = priorityFilter.toLowerCase();
    const filtered = stories.filter((story) => {
      const matchesStatus = story.status === status;
      const matchesPriority =
        normalizedPriority === "all priorities" ||
        story.priority === normalizedPriority;
      const matchesSearch =
        !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });

    return filtered;
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleEditStory = (story: any) => {
    setEditingStory({
      id: story.id,
      title: story.title,
      description: story.description,
      acceptanceCriteria: (story as any).acceptanceCriteria || "",
      businessValue: (story as any).businessValue || undefined,
      priority: story.priority,
    });
    setIsEditModalOpen(true);
  };

  const handleStoryDragStart = (storyId: number, isAllowed: boolean) => {
    if (isAllowed) return;
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;
    const name = story.title || "Untitled";
    const message = `#${story.id} ${name} has not been marked as Sprint Ready.`;
    setToastMessage(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStoryDrop = async (storyId: number, newStatus: string) => {
    const story = stories.find((s) => s.id === storyId);
    const previousStatus = story?.status;
    if (!story) return;

    if (!story.isSprintReady && story.status !== newStatus) {
      const name = story.title || "Untitled";
      const message = `#${story.id} ${name} has not been marked as Sprint Ready.`;
      setToastMessage(message);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const backendStatus = mapFrontendStatusToBackend(newStatus);

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await fetch(`/api/stories/${storyId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: backendStatus }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update story status: ${res.status}`);
      }
    } catch (error) {
      console.error("Failed to update story status", error);
      if (previousStatus) {
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId ? { ...s, status: previousStatus } : s
          )
        );
      }
      alert("Could not update story status. Please try again.");
    }
  };

  const mapBackendStoryToFrontend = (s: any): FrontendStory => {
    const priorityLower = (s.priority || "MEDIUM").toString().toLowerCase() as
      | "low"
      | "medium"
      | "high"
      | "critical";

    return {
      id: s.id,
      title: s.title,
      description: s.description,
      priority: priorityLower,
      points: s.storyPoints ?? s.businessValue ?? 0,
      status: mapBackendStatusToFrontend(s.status),
      labels: [],
      assignee: s.assigneeInitials || "U",
      assigneeName: s.assigneeName,
      tags: [],
      isStarred: Boolean((s as any).isStarred),
      isSprintReady: Boolean((s as any).sprintReady),
      acceptanceCriteria: (s as any).acceptanceCriteria,
      businessValue: (s as any).businessValue,
      releasePlanId: s.releasePlanId,
      releasePlanKey: s.releasePlanKey,
      releasePlanName: s.releasePlanName,
    };
  };

  const fetchStories = async () => {
    if (!projectId) {
      setStories([]);
      setIsLoading(false);
      return;
    }
    try {
      const url = projectId
        ? `/api/stories?projectId=${projectId}`
        : "/api/stories";
      const response = await fetch(url, {
        credentials: "include",
      });
      if (response.ok) {
        const backendStories: BackendStory[] = await response.json();
        const mappedStories: FrontendStory[] = backendStories.map(
          mapBackendStoryToFrontend
        );
        setStories(mappedStories);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/me", {
        credentials: "include",
      });
      if (response.ok) {
        const user: CurrentUser = await response.json();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setCurrentUser(null);
    }
  };

  const canManageSprintReady = Boolean(
    currentUser?.roles?.some(
      (role) => role === "PRODUCT_OWNER" || role === "SCRUM_MASTER"
    )
  );

  return (
    <div className="app-layout">
      <ProjectSidebar
        currentUser={currentUser}
        currentProjectId={projectId}
        onProjectSelect={(id) => navigate(`/project/${id}`)}
      />
      <div className="main-content">
        <div className="scrum-container">
          {/* Header */}
          <div className="scrum-header">
            <div className="header-left">
              <div className="logo">🚀</div>
              <div>
                <h1 className="scrum-title">
                  {currentProject
                    ? currentProject.name
                    : "Scrum Management System"}
                </h1>
                <p className="scrum-subtitle">
                  {currentProject
                    ? currentProject.description
                    : "Select a project to start"}
                </p>
              </div>
            </div>
            <div className="header-actions">
              {activeTab !== "Product Backlog" && currentProject && (
                <button
                  className="create-story-btn"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <span className="plus-icon">+</span>
                  Create User Story
                </button>
              )}
              {onLogout && (
                <button className="logout-btn" onClick={onLogout}>
                  Log Out
                </button>
              )}
            </div>
          </div>

          {currentProject ? (
            <>
              {/* Navigation Tabs */}
              <div className="nav-tabs">
                <button
                  className={`nav-tab ${
                    activeTab === "Scrum Board" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("Scrum Board")}
                >
                  Scrum Board
                </button>
                <button
                  className={`nav-tab ${
                    activeTab === "Product Backlog" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("Product Backlog")}
                >
                  Product Backlog
                </button>
                <button
                  className={`nav-tab ${
                    activeTab === "Release Plans" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("Release Plans")}
                >
                  Release Plans
                </button>
                <button
                  className={`nav-tab ${
                    activeTab === "Account" ? "active" : ""
                  }`}
                  onClick={() => handleTabClick("Account")}
                >
                  Account
                </button>
              </div>

              {activeTab === "Scrum Board" && (
                <>
                  {toastMessage && (
                    <div className="toast-message">{toastMessage}</div>
                  )}
                  {/* Search and Filters */}
                  <div className="search-filters">
                    <div className="search-bar">
                      <span className="search-icon">⌕</span>
                      <input
                        type="text"
                        placeholder="Search stories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select
                      className="priority-filter"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <option>All Priorities</option>
                      <option>Critical</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>

                  {/* Summary Statistics */}
                  <div className="summary-stats">
                    <span>Total Stories: {totalStories}</span>
                    <span>Total Points: {totalPoints}</span>
                  </div>

                  {/* Kanban Board */}
                  {isLoading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      Loading stories...
                    </div>
                  ) : (
                    <div className="kanban-board">
                      <KanbanColumn
                        title="Backlog"
                        stories={getStoriesByStatus("Backlog")}
                        onEditStory={handleEditStory}
                        onStoryDrop={handleStoryDrop}
                        onStoryDragStart={handleStoryDragStart}
                        onStoryLinked={fetchStories}
                      />
                      <KanbanColumn
                        title="To Do"
                        stories={getStoriesByStatus("To Do")}
                        onEditStory={handleEditStory}
                        onStoryDrop={handleStoryDrop}
                        onStoryDragStart={handleStoryDragStart}
                        onStoryLinked={fetchStories}
                      />
                      <KanbanColumn
                        title="In Progress"
                        stories={getStoriesByStatus("In Progress")}
                        onEditStory={handleEditStory}
                        onStoryDrop={handleStoryDrop}
                        onStoryDragStart={handleStoryDragStart}
                        onStoryLinked={fetchStories}
                      />
                      <KanbanColumn
                        title="Done"
                        stories={getStoriesByStatus("Done")}
                        onEditStory={handleEditStory}
                        onStoryDrop={handleStoryDrop}
                        onStoryDragStart={handleStoryDragStart}
                        onStoryLinked={fetchStories}
                      />
                    </div>
                  )}
                </>
              )}

              {activeTab === "Product Backlog" && (
                <ProductBacklog
                  stories={stories}
                  onRefresh={fetchStories}
                  canEditSprintReady={canManageSprintReady}
                />
              )}
              {isCreateOpen && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                  }}
                >
                  <CreateUserStoryModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onCreated={() => {
                      fetchStories();
                      setIsCreateOpen(false);
                    }}
                    projectId={projectId}
                  />
                </div>
              )}
              {isEditModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                  }}
                >
                  <CreateUserStoryModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                      setIsEditModalOpen(false);
                      setEditingStory(null);
                    }}
                    onCreated={() => {
                      fetchStories();
                      setIsEditModalOpen(false);
                      setEditingStory(null);
                    }}
                    story={editingStory}
                    projectId={projectId}
                  />
                </div>
              )}

              {activeTab === "Release Plans" && <ReleasePlans />}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                color: "#718096",
              }}
            >
              <h2 style={{ color: "#2d3748" }}>No Project Selected</h2>
              <p>
                Select a project from the sidebar or create a new one to get
                started.
              </p>
            </div>
          )}

          {activeTab === "Account" && <AccountManagement />}
        </div>
      </div>
    </div>
  );
}
