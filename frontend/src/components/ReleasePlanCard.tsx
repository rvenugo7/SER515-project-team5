import React from "react";

interface ReleasePlan {
  id: number;
  releaseKey: string;
  name: string;
  description: string;
  goals: string;
  startDate: string;
  targetDate: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  projectId: number;
  projectName: string;
  createdByUsername: string;
  userStoryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReleasePlanCardProps {
  plan: ReleasePlan;
  onEdit?: (plan: ReleasePlan) => void;
  onDelete?: (id: number) => void;
}

export default function ReleasePlanCard({
  plan,
  onEdit,
  onDelete,
}: ReleasePlanCardProps): React.JSX.Element {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "release-status-planned";
      case "IN_PROGRESS":
        return "release-status-in-progress";
      case "COMPLETED":
        return "release-status-completed";
      case "CANCELLED":
        return "release-status-cancelled";
      default:
        return "release-status-planned";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div className="release-card">
      <div className="release-card-header">
        <div className="release-header-left">
          <span className="release-key-badge">{plan.releaseKey}</span>
          <h3 className="release-title">{plan.name}</h3>
        </div>
        <span className={`release-status-badge ${getStatusColor(plan.status)}`}>
          {getStatusLabel(plan.status)}
        </span>
      </div>

      {plan.description && (
        <p className="release-description">{plan.description}</p>
      )}

      {plan.goals && (
        <div className="release-goals">
          <strong>Goals:</strong> {plan.goals}
        </div>
      )}

      <div className="release-details">
        <div className="release-detail-item">
          <span className="detail-label">Start Date:</span>
          <span className="detail-value">{formatDate(plan.startDate)}</span>
        </div>
        <div className="release-detail-item">
          <span className="detail-label">Target Date:</span>
          <span className="detail-value">{formatDate(plan.targetDate)}</span>
        </div>
        <div className="release-detail-item">
          <span className="detail-label">User Stories:</span>
          <span className="detail-value">{plan.userStoryCount}</span>
        </div>
      </div>

      <div className="release-footer">
        <div className="release-meta">
          <span className="meta-text">
            Created by <strong>{plan.createdByUsername || "Unknown"}</strong>
          </span>
          <span className="meta-text">
            Project: <strong>{plan.projectName}</strong>
          </span>
        </div>
        <div className="release-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit?.(plan)}
            title="Edit release plan"
          >
            Edit
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => onDelete?.(plan.id)}
            title="Delete release plan"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
