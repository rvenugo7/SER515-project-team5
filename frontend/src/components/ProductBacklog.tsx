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
  const [searchQuery, setSearchQuery] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("All Releases");
  const [storyFilter, setStoryFilter] = useState("All Stories");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [localStories, setLocalStories] = useState(stories);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  
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

  const [showConfirm, setShowConfirm] = useState(false);

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
          onClick={() => setShowConfirm(true)}
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
                onClick={() => setShowConfirm(false)}
                aria-label="Close export confirmation"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
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
              {sprintReadySelections.map((story) => (
                <div key={story.id} className="confirm-story-card">
                  <div className="confirm-field">
                    <label>Title</label>
                    <div>{`#${story.id} ${story.title}`}</div>
                  </div>
                  <div className="confirm-field">
                    <label>Description</label>
                    <p>{story.description || "No description provided"}</p>
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-field">
                      <label>Acceptance Criteria</label>
                      <p>{story.acceptanceCriteria || "Not provided"}</p>
                    </div>
                    <div className="confirm-field">
                      <label>Business Value</label>
                      <p>{story.businessValue ?? "Not set"}</p>
                    </div>
                  </div>
                  <div className="confirm-row">
                    <div className="confirm-field">
                      <label>Priority</label>
                      <p>{story.priority}</p>
                    </div>
                    <div className="confirm-field">
                      <label>Story Points</label>
                      <p>{story.points ?? story.storyPoints ?? "Not estimated"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="modal-btn primary"
                disabled={sprintReadySelections.length === 0}
                onClick={() => {
                  setShowConfirm(false);
                }}
              >
                Confirm Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
