import React, { useState } from "react";
import ProductBacklogStoryCard from "./ProductBacklogStoryCard";
import CreateUserStoryModal from "./CreateUserStoryModal";

interface Story {
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
  isMvp?: boolean;
  isStarred?: boolean;
  isSprintReady?: boolean;
  storyPoints?: number;
  acceptanceCriteria?: string;
  businessValue?: number;
}

interface JiraFormState {
  baseUrl: string;
  userEmail: string;
  apiToken: string;
  projectKey: string;
}

interface ProductBacklogProps {
  stories: Story[];
  onRefresh?: () => void;
  activeProjectId?: number | null;
  canEditSprintReady?: boolean;
  canToggleMvp?: boolean;
}

export default function ProductBacklog({
  stories = [],
  onRefresh,
  activeProjectId,
  canEditSprintReady = false,
  canToggleMvp = false,
}: ProductBacklogProps): JSX.Element {
  const jiraRedirectUrl = import.meta.env.VITE_JIRA_REDIRECT_URL?.trim();
  const createEmptyJiraForm = (): JiraFormState => ({
    baseUrl: "",
    userEmail: "",
    apiToken: "",
    projectKey: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("All Releases");
  const [storyFilter, setStoryFilter] = useState("All Stories");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [localStories, setLocalStories] = useState(stories);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [jiraForm, setJiraForm] = useState<JiraFormState>(() => createEmptyJiraForm());
  const [jiraFormError, setJiraFormError] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalStories(stories);
  }, [stories]);

  // Clear filters when project changes
  React.useEffect(() => {
    if (activeProjectId) {
      setSearchQuery("");
      setReleaseFilter("All Releases");
      setStoryFilter("All Stories");
    }
  }, [activeProjectId]);
  const sprintReadyCount = stories.filter(
    (story) => story.isSprintReady
  ).length;

  const isStorySelected = (id: number) => selectedStoryIds.includes(id);

  const toggleStorySelection = (id: number, checked: boolean) => {
    setSelectedStoryIds((prev) =>
      checked ? [...prev, id] : prev.filter((storyId) => storyId !== id)
    );
  };

  const selectedStories = localStories.filter((s) =>
    selectedStoryIds.includes(s.id)
  );
  const sprintReadySelections = selectedStories.filter((s) => s.isSprintReady);
  const notReadySelections = selectedStories.filter((s) => !s.isSprintReady);

  const requiredJiraFields: Array<keyof JiraFormState> = [
    "baseUrl",
    "userEmail",
    "apiToken",
    "projectKey",
  ];

  const isJiraFormComplete = requiredJiraFields.every(
    (field) => jiraForm[field].trim().length > 0
  );

  const resetJiraForm = () => {
    setJiraForm(createEmptyJiraForm());
    setJiraFormError(null);
  };

  const handleJiraFieldChange = (
    field: keyof JiraFormState,
    value: string
  ) => {
    setJiraForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmExport = async () => {
    if (sprintReadySelections.length === 0 || isExporting) {
      return;
    }

    if (!isJiraFormComplete) {
      setJiraFormError("Please fill in all required Jira connection details.");
      return;
    }

    setExportError(null);
    setJiraFormError(null);
    setIsExporting(true);

    try {
      const jiraResponses: Array<{ browseUrl?: string; selfUrl?: string }> = [];

      for (const story of sprintReadySelections) {
        const response = await fetch(`/api/stories/${story.id}/export/jira`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jiraForm),
        });

        if (!response.ok) {
          const txt = await response.text();
          throw new Error(
            txt || `Failed to export story #${story.id} to Jira`
          );
        }

        const data = await response.json();
        jiraResponses.push(data);
      }

      const redirectUrl =
        jiraResponses.find((res) => res?.browseUrl)?.browseUrl ||
        jiraResponses.find((res) => res?.selfUrl)?.selfUrl ||
        null;

      const targetUrl = jiraRedirectUrl || redirectUrl;
      setShowConfirm(false);
      setShowJiraModal(false);
      resetJiraForm();
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        alert("Stories exported to Jira successfully.");
      }
      onRefresh?.();
    } catch (err: any) {
      setExportError(err.message || "Failed to export stories to Jira.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
  <div className="product-backlog">
      <div className="backlog-header">
        <h2 className="backlog-title">Product Backlog</h2>
        <p className="backlog-description">
          Manage and prioritize user stories
        </p>
      </div>

      <div className="backlog-controls">
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
          className="filter-dropdown"
          value={releaseFilter}
          onChange={(e) => setReleaseFilter(e.target.value)}
        >
          <option>All Releases</option>
        </select>
        <select
          className="filter-dropdown"
          value={storyFilter}
          onChange={(e) => setStoryFilter(e.target.value)}
        >
          <option>All Stories</option>
        </select>
        <button
          className={`export-btn ${
            selectedStoryIds.length > 0 && notReadySelections.length === 0
              ? ""
              : "disabled"
          }`}
          disabled={
            !(selectedStoryIds.length > 0 && notReadySelections.length === 0)
          }
          onClick={() => {
            setExportError(null);
            resetJiraForm();
            setJiraFormError(null);
            setShowJiraModal(false);
            setShowConfirm(true);
          }}
        >
          <span className="export-icon">↓</span>
          Export Sprint-Ready Stories ({sprintReadyCount})
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="backlog-empty-state">No user stories added</div>
      ) : (
        <div className="backlog-stories">
          {localStories.map((story) => (
            <ProductBacklogStoryCard
              key={story.id}
              story={story}
              canEditSprintReady={canEditSprintReady}
              canToggleMvp={canToggleMvp}
              checked={isStorySelected(story.id)}
              onToggleCheck={(nextChecked) =>
                toggleStorySelection(story.id, nextChecked)
              }
              onEdit={(story) => {
                setEditingStory(story);
                setIsEditModalOpen(true);
              }}
              onUpdate={(updatedStory) => {
                setLocalStories((prev) =>
                  prev.map((s) =>
                    s.id === updatedStory.id
                      ? {
                          ...s,
                          ...updatedStory,
                          points:
                            (updatedStory as any).storyPoints ??
                            updatedStory.points ??
                            s.points,
                          tags: updatedStory.tags ?? s.tags,
                          isMvp:
                            (updatedStory as any).mvp ??
                            updatedStory.isMvp ??
                            s.isMvp,
                          isSprintReady:
                            (updatedStory as any).sprintReady ??
                            updatedStory.isSprintReady ??
                            s.isSprintReady,
                          isStarred:
                            (updatedStory as any).isStarred ??
                            updatedStory.isStarred ??
                            s.isStarred,
                        }
                      : s
                  )
                );
                onRefresh?.();
              }}
            />
          ))}
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
              onRefresh?.();
              setIsEditModalOpen(false);
              setEditingStory(null);
            }}
            story={editingStory}
          />
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-header">
              <h3>Export to Jira</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowConfirm(false);
                  setExportError(null);
                  setJiraFormError(null);
                }}
                aria-label="Close export confirmation"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-intro">
                You are about to export {sprintReadySelections.length} sprint-ready
                stor{selectedStoryIds.length === 1 ? "y" : "ies"}.
              </p>
              {notReadySelections.length > 0 && (
                <div className="warning">
                  {notReadySelections.length} selected stor
                  {notReadySelections.length === 1 ? "y is" : "ies are"} not
                  sprint-ready and will be skipped.
                </div>
              )}
              {exportError && (
                <div className="warning" role="alert">
                  {exportError}
                </div>
              )}
              <div className="story-summary-list">
                {sprintReadySelections.map((story) => {
                  const storyPoints =
                    story.points ?? story.storyPoints ?? "Not estimated";
                  return (
                    <div key={story.id} className="story-summary-card">
                      <div className="story-summary-row">
                        <span className="summary-label">Title</span>
                        <p className="summary-value">{`#${story.id} ${story.title}`}</p>
                      </div>
                      <div className="story-summary-row">
                        <span className="summary-label">Description</span>
                        <p className="summary-value">
                          {story.description || "No description provided"}
                        </p>
                      </div>
                      <div className="story-summary-grid">
                        <div>
                          <span className="summary-label">Acceptance Criteria</span>
                          <p className="summary-value">
                            {story.acceptanceCriteria || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <span className="summary-label">Business Value</span>
                          <p className="summary-value">
                            {story.businessValue ?? "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className="story-summary-grid">
                        <div>
                          <span className="summary-label">Priority</span>
                          <p className="summary-value">{story.priority}</p>
                        </div>
                        <div>
                          <span className="summary-label">Story Points</span>
                          <p className="summary-value">{storyPoints}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => {
                  setShowConfirm(false);
                  setExportError(null);
                  setJiraFormError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="modal-btn primary"
                disabled={sprintReadySelections.length === 0}
                onClick={() => {
                  setShowConfirm(false);
                  setExportError(null);
                  setJiraFormError(null);
                  setShowJiraModal(true);
                }}
              >
                Confirm Export
              </button>
            </div>
          </div>
        </div>
      )}

      {showJiraModal && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-header">
              <h3>Jira Connection</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowJiraModal(false);
                  setExportError(null);
                  resetJiraForm();
                }}
                aria-label="Close Jira configuration"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Provide your Jira connection details to finish exporting.</p>
              <div className="jira-config">
                <label className="confirm-field full-width">
                  <span>Base URL *</span>
                  <input
                    type="url"
                    placeholder="https://your-domain.atlassian.net"
                    value={jiraForm.baseUrl}
                    onChange={(e) =>
                      handleJiraFieldChange("baseUrl", e.target.value)
                    }
                  />
                </label>
                <label className="confirm-field full-width">
                  <span>User Email *</span>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={jiraForm.userEmail}
                    onChange={(e) =>
                      handleJiraFieldChange("userEmail", e.target.value)
                    }
                  />
                </label>
                <label className="confirm-field full-width">
                  <span>API Token *</span>
                  <input
                    type="password"
                    placeholder="Jira API token"
                    value={jiraForm.apiToken}
                    onChange={(e) =>
                      handleJiraFieldChange("apiToken", e.target.value)
                    }
                  />
                </label>
                <label className="confirm-field full-width">
                  <span>Project Key *</span>
                  <input
                    type="text"
                    placeholder="e.g. ABC"
                    value={jiraForm.projectKey}
                    onChange={(e) =>
                      handleJiraFieldChange("projectKey", e.target.value)
                    }
                  />
                </label>
                <p className="jira-hint">
                  * Required fields. Your API token is only used to contact Jira
                  for this export.
                </p>
              </div>
              {jiraFormError && (
                <div className="warning" role="alert">
                  {jiraFormError}
                </div>
              )}
              {exportError && (
                <div className="warning" role="alert">
                  {exportError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn secondary"
                onClick={() => {
                  setShowJiraModal(false);
                  setExportError(null);
                  resetJiraForm();
                }}
              >
                Cancel
              </button>
              <button
                className="modal-btn primary"
                disabled={
                  sprintReadySelections.length === 0 ||
                  isExporting ||
                  !isJiraFormComplete
                }
                onClick={handleConfirmExport}
              >
                {isExporting ? "Exporting..." : "Submit & Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
