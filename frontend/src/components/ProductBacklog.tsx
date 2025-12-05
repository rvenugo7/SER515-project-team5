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
  canEditSprintReady?: boolean;
  canToggleMvp?: boolean;
}

export default function ProductBacklog({
  stories = [],
  onRefresh,
  canEditSprintReady = false,
  canToggleMvp = false,
}: ProductBacklogProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("All Releases");
  const [storyFilter, setStoryFilter] = useState("All Stories");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [localStories, setLocalStories] = useState(stories);

  React.useEffect(() => {
    setLocalStories(stories);
  }, [stories]);
  const sprintReadyCount = stories.filter(
    (story) => story.isSprintReady
  ).length;

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
          className={`export-btn ${sprintReadyCount === 0 ? "disabled" : ""}`}
          disabled={sprintReadyCount === 0}
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
    </div>
  );
}
