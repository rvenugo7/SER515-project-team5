import React, { useState, useEffect } from "react";
import ReleasePlanCard from "./ReleasePlanCard";
import CreateReleasePlanModal from "./CreateReleasePlanModal";

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

export default function ReleasePlans(): React.JSX.Element {
  const [releasePlans, setReleasePlans] = useState<ReleasePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ReleasePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ReleasePlan | null>(null);
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReleasePlans = async () => {
    try {
      const response = await fetch("/api/release-plans", {
        credentials: "include",
      });
      if (response.ok) {
        const plans: ReleasePlan[] = await response.json();
        setReleasePlans(plans);
        setFilteredPlans(plans);
      } else {
        console.error("Failed to fetch release plans");
      }
    } catch (error) {
      console.error("Failed to fetch release plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleasePlans();
  }, []);

  useEffect(() => {
    let filtered = [...releasePlans];

    if (statusFilter !== "All Statuses") {
      const filterStatus = statusFilter.toUpperCase().replace(" ", "_");
      filtered = filtered.filter((plan) => plan.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query) ||
          plan.releaseKey.toLowerCase().includes(query)
      );
    }

    setFilteredPlans(filtered);
  }, [searchQuery, statusFilter, releasePlans]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this release plan?")) return;

    try {
      const response = await fetch(`/api/release-plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchReleasePlans();
      } else {
        const errorText = await response.text();
        alert(`Failed to delete release plan: ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to delete release plan:", error);
      alert("Failed to delete release plan");
    }
  };

  const handleEdit = (plan: ReleasePlan) => {
    setEditingPlan(plan);
    setIsCreateOpen(true);
  };

  return (
    <div className="release-plans-container">
      {/* Search and Filters */}
      <div className="release-controls">
        <div className="search-bar">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search release plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-dropdown"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Planned</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <button
          className="create-release-btn"
          onClick={() => setIsCreateOpen(true)}
        >
          <span className="plus-icon">+</span>
          Create Release Plan
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
          Loading release plans...
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="release-empty-state">
          {searchQuery || statusFilter !== "All Statuses"
            ? "No release plans match your filters"
            : "No release plans created yet. Click 'Create Release Plan' to get started."}
        </div>
      ) : (
        <div className="release-plans-list">
          {filteredPlans.map((plan) => (
            <ReleasePlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CreateReleasePlanModal
            isOpen={isCreateOpen}
            onClose={() => {
              setIsCreateOpen(false);
              setEditingPlan(null);
            }}
            onCreated={() => {
              fetchReleasePlans();
              setIsCreateOpen(false);
              setEditingPlan(null);
            }}
            plan={editingPlan}
          />
        </div>
      )}
    </div>
  );
}
