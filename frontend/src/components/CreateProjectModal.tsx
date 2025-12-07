import React, { useState, FormEvent } from "react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: any) => void;
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

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Failed to create project");
      }

      const project = await response.json();
      
      // Success
      alert(`Project Created!\nCode: ${project.projectCode}\nSave this code to invite others.`);
      
      onCreated?.(project);
      setName("");
      setDescription("");
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
          <h2>Create New Project</h2>
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
            <div className="form-group">
              <label htmlFor="project-name">
                Project Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="project-name"
                required
                placeholder="e.g. Mobile App Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-desc">Description</label>
              <textarea
                id="project-desc"
                placeholder="Project goals and details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

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
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
