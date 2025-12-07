import React, { useState, FormEvent } from "react";

interface JoinProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined?: () => void;
}

export default function JoinProjectModal({
  isOpen,
  onClose,
  onJoined,
}: JoinProjectModalProps) {
  const [projectCode, setProjectCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectCode.trim()) {
      setError("Project Code is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectCode }),
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Failed to join project");
      }

      alert("Successfully joined project!");
      
      onJoined?.();
      setProjectCode("");
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2>Join Project</h2>
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
              <label htmlFor="project-code">
                Project Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="project-code"
                required
                placeholder="Enter 8-character code"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
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
                {isSubmitting ? "Joining..." : "Join Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
