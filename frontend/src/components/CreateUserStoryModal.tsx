import React, { useState, FormEvent, useEffect } from "react";

interface Story {
  id?: number;
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  businessValue?: number;
  priority?:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    | "low"
    | "medium"
    | "high"
    | "critical";
}

interface CreateUserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  story?: Story | null;
  projectId?: number;
}

type PriorityOption = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export default function CreateUserStoryModal({
  isOpen,
  onClose,
  onCreated,
  story = null,
  projectId,
}: CreateUserStoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [businessValue, setBusinessValue] = useState<number | "">("");
  const [priority, setPriority] = useState<PriorityOption | null>(null);
  const [originalPriority, setOriginalPriority] =
    useState<PriorityOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = story !== null && story.id !== undefined;

  // Populate form when story is provided (edit mode)
  useEffect(() => {
    if (story && isOpen) {
      setTitle(story.title || "");
      setDescription(story.description || "");
      setAcceptanceCriteria(story.acceptanceCriteria || "");
      setBusinessValue(story.businessValue ?? "");
      if (story.priority) {
        const priorityUpper = story.priority.toUpperCase() as PriorityOption;
        setPriority(priorityUpper);
        setOriginalPriority(priorityUpper);
      } else {
        // Story has no priority (null/undefined) - preserve this state
        setPriority(null);
        setOriginalPriority(null);
      }
    } else if (!story && isOpen) {
      // Reset form for create mode
      setTitle("");
      setDescription("");
      setAcceptanceCriteria("");
      setBusinessValue("");
      setPriority("MEDIUM");
      setOriginalPriority(null);
    }
  }, [story, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAcceptanceCriteria("");
    setBusinessValue("");
    setPriority("MEDIUM");
    setOriginalPriority(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/stories/${story.id}` : "/api/stories";
      const method = isEditMode ? "PUT" : "POST";

      // Build request body
      // For priority:
      // - In edit mode: send the current priority value (null if originally null and unchanged)
      // - In create mode: always send MEDIUM as default
      const requestBody: any = {
        title,
        description,
        acceptanceCriteria,
        businessValue: businessValue === "" ? null : Number(businessValue),
        priority: isEditMode ? priority : priority || "MEDIUM",
        projectId: projectId,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(
          txt || `Failed to ${isEditMode ? "update" : "create"} story`
        );
      }

      // tell parent to reload stories
      onCreated?.();
      resetForm();
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
            {isEditMode ? "Edit User Story" : "Create User Story"}
          </h2>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
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
          {/* Title */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="As a user, I want to..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              Description *
            </label>
            <textarea
              required
              placeholder="Describe the story, context, etc."
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
                minHeight: 70,
              }}
            />
          </div>

          {/* Acceptance Criteria */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              Acceptance Criteria
            </label>
            <textarea
              placeholder="Given..., when..., then..."
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
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

          {/* Business value + priority */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <label
                style={{ display: "block", fontSize: 13, fontWeight: 500 }}
              >
                Business Value
              </label>
              <input
                type="number"
                placeholder="0"
                value={businessValue}
                onChange={(e) =>
                  setBusinessValue(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
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
                Priority
              </label>
              <select
                value={priority || "MEDIUM"}
                onChange={(e) => setPriority(e.target.value as PriorityOption)}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
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
              onClick={() => {
                resetForm();
                onClose();
              }}
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
                ? "Update Story"
                : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
