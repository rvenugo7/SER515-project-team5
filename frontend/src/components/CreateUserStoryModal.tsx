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
  projectId?: number | null;
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

      // Add projectId as query parameter for filtering
      let finalUrl = url;
      if (projectId && !isEditMode) {
        finalUrl = `${url}?projectId=${projectId}`;
      }

      const response = await fetch(finalUrl, {
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

  const inputStyle = {
    width: "100%",
    marginTop: 4,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#4a5568",
    marginBottom: 4,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
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
          boxShadow: "0 20px 50px rgba(15,23,42,0.25)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflow: "auto",
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
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#1a202c" }}>
            {isEditMode ? (
              <>
                <span style={{ color: "#718096", fontWeight: 500 }}>#{story?.id}</span>{" "}
                Edit User Story
              </>
            ) : (
              "Create User Story"
            )}
          </h2>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: 6,
              width: 28,
              height: 28,
              fontSize: 16,
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Title <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="As a user, I want to..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Description <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                required
                placeholder="Describe the story, context, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 80,
                }}
              />
            </div>

            {/* Acceptance Criteria */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Acceptance Criteria</label>
              <textarea
                placeholder="Given..., when..., then..."
                value={acceptanceCriteria}
                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 70,
                }}
              />
            </div>

            {/* Business value + priority */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>Business Value</label>
                <input
                  type="number"
                  placeholder="0"
                  value={businessValue}
                  onChange={(e) =>
                    setBusinessValue(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  value={priority || "MEDIUM"}
                  onChange={(e) => setPriority(e.target.value as PriorityOption)}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    background: "white",
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
                gap: 10,
                paddingTop: 16,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#4a5568",
                  transition: "background 0.2s",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: isSubmitting ? "#93c5fd" : "#2563eb",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
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
    </div>
  );
}
