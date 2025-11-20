import React, { useState, useEffect, useRef } from 'react'
import StoryCard from './StoryCard'
import KanbanColumn from './KanbanColumn'
import ProductBacklog from './ProductBacklog'
import ReleasePlans from './ReleasePlans'
import CreateUserStoryModal from './CreateUserStoryModal'

interface MainScreenProps {
  onLogout?: () => void
}

interface BackendStory {
  id: number
  title: string
  description: string
  priority: string
  storyPoints?: number
  status: string
  acceptanceCriteria?: string
  businessValue?: number
}

interface FrontendStory {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  points: number
  status: string
  labels: string[]
  assignee: string
  assigneeName?: string
  tags?: string[]
  isStarred?: boolean
  isSprintReady?: boolean
  acceptanceCriteria?: string
  businessValue?: number
}

export default function MainScreen({ onLogout }: MainScreenProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('Scrum Board')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<any>(null)
  const [stories, setStories] = useState<FrontendStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  // Map backend status to frontend status
  const mapBackendStatusToFrontend = (backendStatus: string): string => {
    const statusUpper = backendStatus?.toUpperCase() || 'NEW'
    switch (statusUpper) {
      case 'NEW':
        return 'Backlog'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'DONE':
        return 'Done'
      case 'IN_REVIEW':
        return 'In Progress'
      case 'BLOCKED':
        return 'Backlog'
      default:
        return 'Backlog'
    }
  }

  const mapFrontendStatusToBackend = (frontendStatus: string): string => {
    const statusUpper = frontendStatus.toUpperCase()
    switch (statusUpper) {
      case 'BACKLOG':
      case 'TO DO':
        return 'NEW'
      case 'IN PROGRESS':
        return 'IN_PROGRESS'
      case 'DONE':
        return 'DONE'
      default:
        return 'NEW'
    }
  }

	useEffect(() => {
		fetchStories()
		return () => {
			if (toastTimer.current) {
				window.clearTimeout(toastTimer.current)
			}
		}
	}, [])

  const totalStories = stories.length
  const totalPoints = stories.reduce((sum, story) => sum + story.points, 0)

  const getStoriesByStatus = (status: string) => {
    const normalizedPriority = priorityFilter.toLowerCase()
    const filtered = stories.filter((story) => {
      const matchesStatus = story.status === status
      const matchesPriority =
        normalizedPriority === 'all priorities' || story.priority === normalizedPriority
      const matchesSearch =
        !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesPriority && matchesSearch
    })

    return filtered
  }

	const handleTabClick = (tabName: string) => {
		setActiveTab(tabName)
	}

	const handleEditStory = (story: any) => {
		setEditingStory({
			id: story.id,
			title: story.title,
			description: story.description,
			acceptanceCriteria: (story as any).acceptanceCriteria || '',
			businessValue: (story as any).businessValue || undefined,
			priority: story.priority
		})
		setIsEditModalOpen(true)
	}

  const handleStoryDragStart = (storyId: number, isAllowed: boolean) => {
    if (isAllowed) return
    const story = stories.find((s) => s.id === storyId)
    if (!story) return
    const name = story.title || 'Untitled'
    const message = `#${story.id} ${name} has not been marked as Sprint Ready.`
    setToastMessage(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2500)
  }

  const handleStoryDrop = async (storyId: number, newStatus: string) => {
    const story = stories.find((s) => s.id === storyId)
    const previousStatus = story?.status
    if (!story) return

    if (!story.isSprintReady && story.status !== newStatus) {
      const name = story.title || 'Untitled'
      const message = `#${story.id} ${name} has not been marked as Sprint Ready.`
      setToastMessage(message)
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToastMessage(null), 2500)
      return
    }

    const backendStatus = mapFrontendStatusToBackend(newStatus)

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, status: newStatus } : s))
    )

    try {
      const res = await fetch(`/api/stories/${storyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: backendStatus })
      })
      if (!res.ok) {
        throw new Error(`Failed to update story status: ${res.status}`)
      }
    } catch (error) {
      console.error('Failed to update story status', error)
      if (previousStatus) {
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? { ...s, status: previousStatus } : s))
        )
      }
      alert('Could not update story status. Please try again.')
    }
  }


  // Map backend UserStory -> frontend Story for your UI
  const mapBackendStoryToFrontend = (s: any): FrontendStory => {
    // Backend priority: StoryPriority enum like "LOW" | "MEDIUM" | ...
    const priorityLower = (s.priority || 'MEDIUM')
      .toString()
      .toLowerCase() as 'low' | 'medium' | 'high' | 'critical'

    return {
      id: s.id,
      title: s.title,
      description: s.description,
      priority: priorityLower,
      // prefer storyPoints from backend; fallback to businessValue or 0
      points: s.storyPoints ?? s.businessValue ?? 0,
      status: mapBackendStatusToFrontend(s.status),
      labels: [], // you can wire these later
      assignee: s.assigneeInitials || 'U',
      assigneeName: s.assigneeName,
      tags: [],
      isStarred: false,
      isSprintReady: false,
    }
  }

  // Fetch stories from backend
  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories', {
        credentials: 'include'
      })
      if (response.ok) {
        const backendStories: BackendStory[] = await response.json()
        const mappedStories: FrontendStory[] = backendStories.map(mapBackendStoryToFrontend)
        setStories(mappedStories)
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="scrum-container">
      {/* Header */}
      <div className="scrum-header">
        <div className="header-left">
          <div className="logo">✓</div>
          <div>
            <h1 className="scrum-title">Scrum Management System</h1>
            <p className="scrum-subtitle">Manage releases, user stories, and sprints</p>
          </div>
        </div>
        <div className="header-actions">
          {activeTab !== 'Product Backlog' && (
            <button
              className="create-story-btn"
              onClick={() => setIsCreateOpen(true)}
            >
              <span className="plus-icon">+</span>
              Create User Story
            </button>
          )}
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
      </div>

			{/* Navigation Tabs */}
			<div className="nav-tabs">
				<button
					className={`nav-tab ${activeTab === 'Scrum Board' ? 'active' : ''}`}
					onClick={() => handleTabClick('Scrum Board')}
				>
					Scrum Board
				</button>
				<button
					className={`nav-tab ${activeTab === 'Product Backlog' ? 'active' : ''}`}
					onClick={() => handleTabClick('Product Backlog')}
				>
					Product Backlog
				</button>
				<button
					className={`nav-tab ${activeTab === 'Release Plans' ? 'active' : ''}`}
					onClick={() => handleTabClick('Release Plans')}
				>
					Release Plans
				</button>
			</div>

      {activeTab === 'Scrum Board' && (
        <>
          {toastMessage && (
            <div className="toast-message">
              {toastMessage}
            </div>
          )}
          {/* Search and Filters */}
          <div className="search-filters">
            <div className="search-bar">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Summary Statistics */}
          <div className="summary-stats">
            <span>Total Stories: {totalStories}</span>
            <span>Total Points: {totalPoints}</span>
          </div>

					{/* Kanban Board */}
					{isLoading ? (
						<div style={{ textAlign: 'center', padding: '40px' }}>Loading stories...</div>
					) : (
						<div className="kanban-board">
							<KanbanColumn
								title="Backlog"
								stories={getStoriesByStatus('Backlog')}
								onEditStory={handleEditStory}
                onStoryDrop={handleStoryDrop}
                onStoryDragStart={handleStoryDragStart}
							/>
							<KanbanColumn
								title="To Do"
								stories={getStoriesByStatus('To Do')}
								onEditStory={handleEditStory}
                onStoryDrop={handleStoryDrop}
                onStoryDragStart={handleStoryDragStart}
							/>
							<KanbanColumn
								title="In Progress"
								stories={getStoriesByStatus('In Progress')}
								onEditStory={handleEditStory}
                onStoryDrop={handleStoryDrop}
                onStoryDragStart={handleStoryDragStart}
							/>
							<KanbanColumn
								title="Done"
								stories={getStoriesByStatus('Done')}
								onEditStory={handleEditStory}
                onStoryDrop={handleStoryDrop}
                onStoryDragStart={handleStoryDragStart}
							/>
						</div>
					)}
				</>
			)}

			{activeTab === 'Product Backlog' && (
				<ProductBacklog stories={stories} onRefresh={fetchStories} />
			)}
			{isCreateOpen && (
  			<div
    			style={{
      				position: "fixed",
      				inset: 0,
      				background: "rgba(0,0,0,0.6)",
     				display: "flex",
      				alignItems: "center",
      				justifyContent: "center",
      				zIndex: 9999
    			}}
  			>
    		<CreateUserStoryModal
  				isOpen={isCreateOpen}
    			onClose={() => setIsCreateOpen(false)}
  				onCreated={() => {
					fetchStories()
					setIsCreateOpen(false)
  				}}
			/>
  			</div>
			)}
			{isEditModalOpen && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.6)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 9999
					}}
				>
					<CreateUserStoryModal
						isOpen={isEditModalOpen}
						onClose={() => {
							setIsEditModalOpen(false)
							setEditingStory(null)
						}}
						onCreated={() => {
							fetchStories()
							setIsEditModalOpen(false)
							setEditingStory(null)
						}}
						story={editingStory}
					/>
				</div>
			)}

			{activeTab === 'Release Plans' && (
				<ReleasePlans />
			)}
		</div>
	)
}
