import React, { useState, FormEvent, useEffect } from "react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project?: any) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    if (name.trim().length > 200) {
      setError("Project name must not exceed 200 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Project "${data.projectKey}" created successfully!`);
        setTimeout(() => {
          resetForm();
          if (onCreated) {
            // Pass project with projectId field for compatibility
            onCreated({ ...data, projectId: data.id });
          }
          onClose();
        }, 1500);
      } else {
        let errorMessage = "Failed to create project";
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details) {
            // Handle validation errors with details
            const details = Object.entries(errorData.details)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(", ");
            errorMessage = errorData.message || `Validation errors: ${details}`;
          }
        } catch (parseError) {
          // If response is not JSON, try to get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 500,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            Create New Project
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
              padding: 0,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              background: "#fee",
              color: "#c33",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              background: "#efe",
              color: "#3c3",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Description
            </label>
            <textarea
              placeholder="Enter project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
                resize: "vertical",
                minHeight: 100,
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                background: "white",
                color: "#4a5568",
                border: "2px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                background: isSubmitting ? "#9ca3af" : "#4a5568",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
