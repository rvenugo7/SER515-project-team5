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
}

type StatusOption = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export default function CreateReleasePlanModal({
  isOpen,
  onClose,
  onCreated,
  plan = null,
}: CreateReleasePlanModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<StatusOption>("PLANNED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = plan !== null && plan.id !== undefined;

  useEffect(() => {
    if (plan && isOpen) {
      setName(plan.name || "");
      setDescription(plan.description || "");
      setGoals(plan.goals || "");
      setStartDate(plan.startDate || "");
      setTargetDate(plan.targetDate || "");
      setStatus(plan.status || "PLANNED");
    } else if (!plan && isOpen) {
      setName("");
      setDescription("");
      setGoals("");
      setStartDate("");
      setTargetDate("");
      setStatus("PLANNED");
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (targetDate && startDate && new Date(targetDate) < new Date(startDate)) {
      setError("Target date must be after start date");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = isEditMode
        ? `/api/release-plans/${plan.id}`
        : "/api/release-plans";
      const method = isEditMode ? "PUT" : "POST";

      const payload: any = {
        name,
        description,
        goals,
        startDate,
        targetDate,
        status,
      };

      // Only include projectId for create (defaults to 1 for GLOBAL project)
      if (!isEditMode) {
        payload.projectId = 1;
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 18px 40px rgba(15,23,42,0.35)",
          width: "100%",
          maxWidth: 520,
          padding: "20px 22px 18px",
          fontFamily:
            'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            {isEditMode ? "Edit Release Plan" : "Create Release Plan"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 10,
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 13,
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              Release Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Version 1.0, Q1 Release"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              Description
            </label>
            <textarea
              placeholder="Release Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
                resize: "vertical",
                minHeight: 60,
              }}
            />
          </div>

          {/* Goals */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              Goals
            </label>
            <textarea
              placeholder="Goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
                resize: "vertical",
                minHeight: 60,
              }}
            />
          </div>

          {/* Start Date and Target Date */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div>
              <label
                style={{ display: "block", fontSize: 13, fontWeight: 500 }}
              >
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontSize: 13, fontWeight: 500 }}
              >
                Target Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusOption)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
              }}
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 6,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "none",
                background: isSubmitting ? "#60a5fa" : "#2563eb",
                color: "white",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
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
  );
}
