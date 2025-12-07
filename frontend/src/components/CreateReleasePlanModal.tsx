import React, { useState, FormEvent, useEffect } from "react";

interface ReleasePlan {
  id?: number;
  releaseKey?: string;
  name?: string;
  description?: string;
  goals?: string;
  startDate?: string;
  targetDate?: string;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  projectId?: number;
}

interface CreateReleasePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  plan?: ReleasePlan | null;
  projectId?: number;
}

type StatusOption = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export default function CreateReleasePlanModal({
  isOpen,
  onClose,
  onCreated,
  plan = null,
  projectId: propProjectId,
}: CreateReleasePlanModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<StatusOption>("PLANNED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [originalPlan, setOriginalPlan] = useState<ReleasePlan | null>(null);

  const isEditMode = plan !== null && plan.id !== undefined;

  useEffect(() => {
    if (plan && isOpen) {
      setName(plan.name || "");
      setDescription(plan.description || "");
      setGoals(plan.goals || "");
      setStartDate(plan.startDate || "");
      setTargetDate(plan.targetDate || "");
      setStatus(plan.status || "PLANNED");
      // Store original values for change detection
      setOriginalPlan(plan);
    } else if (!plan && isOpen) {
      setName("");
      setDescription("");
      setGoals("");
      setStartDate("");
      setTargetDate("");
      setStatus("PLANNED");
      setOriginalPlan(null);
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isEditMode && !propProjectId) {
      setError("Internal Error: Project ID is missing.");
      setIsSubmitting(false);
      return;
    }

    if (targetDate && startDate && new Date(targetDate) < new Date(startDate)) {
      setError("Target date must be after start date");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEditMode
        ? `/api/release-plans/${plan.id}`
        : "/api/release-plans";
      const method = isEditMode ? "PATCH" : "POST";

      let payload: any = {};

      if (isEditMode && originalPlan) {
        if (name !== (originalPlan.name || "")) {
          payload.name = name;
        }
        if (description !== (originalPlan.description || "")) {
          payload.description = description;
        }
        if (goals !== (originalPlan.goals || "")) {
          payload.goals = goals;
        }
        if (startDate !== (originalPlan.startDate || "")) {
          payload.startDate = startDate;
        }
        if (targetDate !== (originalPlan.targetDate || "")) {
          payload.targetDate = targetDate;
        }
        if (status !== (originalPlan.status || "PLANNED")) {
          payload.status = status;
        }
      } else {
        payload = {
          name,
          description,
          goals,
          startDate,
          targetDate,
          status,
          projectId: propProjectId,
        };
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(
          txt || `Failed to ${isEditMode ? "update" : "create"} release plan`
        );
      }

      onCreated?.();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2>{isEditMode ? "Edit Release Plan" : "Create Release Plan"}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="auth-alert error" style={{ margin: "0 0 16px 0" }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-story-form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="release-name">
                Release Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="release-name"
                required
                placeholder="e.g., Version 1.0, Q1 Release"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="release-desc">Description</label>
              <textarea
                id="release-desc"
                placeholder="Release Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Goals */}
            <div className="form-group">
              <label htmlFor="release-goals">Goals</label>
              <textarea
                id="release-goals"
                placeholder="Goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>

            {/* Start Date and Target Date */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start-date">Start Date *</label>
                <input
                  type="date"
                  id="start-date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="target-date">Target Date *</label>
                <input
                  type="date"
                  id="target-date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusOption)}
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Release"
                  : "Create Release"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
