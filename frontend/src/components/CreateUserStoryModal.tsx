import React, { useState, FormEvent } from "react";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

interface CreateUserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void; // parent can refresh board after success
}

const CreateUserStoryModal: React.FC<CreateUserStoryModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyPoints, setStoryPoints] = useState<number | "">("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<Status>("BACKLOG");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStoryPoints("");
    setPriority("MEDIUM");
    setStatus("BACKLOG");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: adjust URL + payload shape to match your backend
      const response = await fetch("http://localhost:8080/api/user-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // keep cookies/session for logged-in user
        body: JSON.stringify({
          title,
          description,
          storyPoints: storyPoints === "" ? 0 : Number(storyPoints),
          priority,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create user story (${response.status})`);
      }

      resetForm();
      onClose();
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create user story");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create User Story</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="As a user, I want to..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              className="h-28 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="More details, acceptance criteria, etc."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Story Points
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={storyPoints}
                onChange={(e) =>
                  setStoryPoints(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Priority
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserStoryModal;
