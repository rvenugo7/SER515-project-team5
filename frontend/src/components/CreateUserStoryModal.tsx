import React, { useState, FormEvent, useEffect } from "react";

interface Story {
  id?: number;
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  businessValue?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "low" | "medium" | "high" | "critical";
}

interface CreateUserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  story?: Story | null;
}

type PriorityOption = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export default function CreateUserStoryModal({
  isOpen,
  onClose,
  onCreated,
  story = null,
}: CreateUserStoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [businessValue, setBusinessValue] = useState<number | "">("");
  const [priority, setPriority] = useState<PriorityOption>("MEDIUM");
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
      }
    } else if (!story && isOpen) {
      // Reset form for create mode
      setTitle("");
      setDescription("");
      setAcceptanceCriteria("");
      setBusinessValue("");
      setPriority("MEDIUM");
    }
  }, [story, isOpen]);

  if (!isOpen) return null;

  const getErrorMessage = async (response: Response, defaultMessage: string): Promise<string> => {
    try {
      // Read response body as text first (can be parsed as JSON later if needed)
      const errorText = await response.text();
      
      if (!errorText || !errorText.trim()) {
        return defaultMessage;
      }
      
      // Try to parse as JSON if it looks like JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const json = JSON.parse(errorText);
          if (json.message) return json.message;
          if (json.error) return json.error;
          if (Array.isArray(json.errors)) {
            return json.errors.map((e: any) => e.message || e).join(", ");
          }
        } catch (jsonError) {
          // If JSON parsing fails, continue with text processing
        }
      }
      
      // Check for common error patterns and provide user-friendly messages
      if (errorText.includes("Title is required")) {
        return "Please provide a title for the user story.";
      }
      if (errorText.includes("Description is required")) {
        return "Please provide a description for the user story.";
      }
      if (errorText.includes("User Story not found")) {
        return isEditMode 
          ? "The user story you're trying to update no longer exists. Please refresh the page."
          : "The requested resource was not found.";
      }
      if (errorText.includes("not found with id")) {
        return isEditMode
          ? "The user story you're trying to update no longer exists. Please refresh the page."
          : "The requested resource was not found.";
      }
      if (errorText.includes("GLOBAL project missing")) {
        return "System configuration error.";
      }
      
      // Return the original text if no pattern matches
      return errorText;
    } catch (parseError) {
      // If parsing fails, return default message
      return defaultMessage;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditMode ? `/api/stories/${story.id}` : "/api/stories";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          acceptanceCriteria,
          businessValue: businessValue === "" ? null : Number(businessValue),
          priority,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${isEditMode ? "update" : "create"} the user story.`;
        
        // Handle specific HTTP status codes
        if (response.status === 400) {
          errorMessage = await getErrorMessage(
            response, 
            `Invalid data provided. Please check all required fields.`
          );
        } else if (response.status === 401) {
          errorMessage = "You are not authenticated. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (response.status === 404) {
          errorMessage = isEditMode
            ? "The user story you're trying to update no longer exists. Please refresh the page."
            : "The requested resource was not found.";
        } else if (response.status === 500) {
          errorMessage = "A server error occurred. Please try again later.";
        } else {
          errorMessage = await getErrorMessage(response, errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      onCreated?.();
      onClose();
    } catch (e: any) {
      // Handle network errors
      if (e.name === "TypeError" && e.message.includes("fetch")) {
        setError("Network error: Unable to connect to the server. Please check your internet connection and try again.");
      } else if (e.message) {
        setError(e.message);
      } else {
        setError(`An unexpected error occurred while ${isEditMode ? "updating" : "creating"} the user story. Please try again.`);
      }
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
          {/* Title */}
          <div style={{ marginBottom: 10 }}>
            <label
              style={{ display: "block", fontSize: 13, fontWeight: 500 }}
            >
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
            <label
              style={{ display: "block", fontSize: 13, fontWeight: 500 }}
            >
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
            <label
              style={{ display: "block", fontSize: 13, fontWeight: 500 }}
            >
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
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as PriorityOption)
                }
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
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Story" : "Create Story")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
