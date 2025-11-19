import React, { useState, useEffect } from 'react'
import StoryCard from './StoryCard'
import KanbanColumn from './KanbanColumn'
import ProductBacklog from './ProductBacklog'
import CreateUserStoryModal from './CreateUserStoryModal'

interface MainScreenProps {
  onLogout?: () => void
}

// Shared Story type for your UI components
export interface Story {
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
}

export default function MainScreen({ onLogout }: MainScreenProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('Scrum Board')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All Priorities')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [stories, setStories] = useState<Story[]>([])

  const totalStories = stories.length
  const totalPoints = stories.reduce((sum, story) => sum + story.points, 0)

  const getStoriesByStatus = (status: string) => {
    return stories.filter(story => story.status === status)
  }

  const handleTabClick = (tabName: string) => {
    if (tabName === 'Release Plans') {
      alert('This section is not implemented yet')
    } else {
      setActiveTab(tabName)
    }
  }


  // Map backend UserStory -> frontend Story for your UI
  const mapBackendStoryToFrontend = (s: any): Story => {
    // Backend priority: StoryPriority enum like "LOW" | "MEDIUM" | ...
    const priorityLower = (s.priority || 'MEDIUM')
      .toString()
      .toLowerCase() as 'low' | 'medium' | 'high' | 'critical'

    return {
      id: s.id,
      title: s.title,
      description: s.description,
      priority: priorityLower,
      // no points field on backend, so use businessValue or 0
      points: s.businessValue ?? 0,
      // if backend has status, use it; else default to Backlog
      status: s.status || 'Backlog',
      labels: [], // you can wire these later
      // simple placeholder initial – you can change this when you add assignees
      assignee: s.assigneeInitials || 'U',
      assigneeName: s.assigneeName,
      tags: [],
      isStarred: false,
      isSprintReady: false,
    }
  }

  const loadStories = async () => {
    try {
      const res = await fetch('/api/stories', {
        credentials: 'include',
      })

      if (!res.ok) {
        console.error('Failed to load stories', res.status)
        return
      }

      const data = await res.json() // List<UserStory> from backend
      const mapped: Story[] = data.map((s: any) => mapBackendStoryToFrontend(s))
      setStories(mapped)
    } catch (e) {
      console.error('Error loading stories', e)
    }
  }

  useEffect(() => {
    loadStories()
  }, [])

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
          className={`nav-tab disabled ${activeTab === 'Release Plans' ? 'active' : ''}`}
          onClick={() => handleTabClick('Release Plans')}
        >
          Release Plans
        </button>
      </div>

      {activeTab === 'Scrum Board' && (
        <>
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
          <div className="kanban-board">
            <KanbanColumn
              title="Backlog"
              stories={getStoriesByStatus('Backlog')}
            />
            <KanbanColumn
              title="To Do"
              stories={getStoriesByStatus('To Do')}
            />
            <KanbanColumn
              title="In Progress"
              stories={getStoriesByStatus('In Progress')}
            />
            <KanbanColumn
              title="Done"
              stories={getStoriesByStatus('Done')}
            />
          </div>
        </>
      )}

      {activeTab === 'Product Backlog' && (
        <ProductBacklog stories={stories} />
      )}

      {/* Create User Story Modal */}
      <CreateUserStoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          // 1) reload stories from backend
          loadStories()
          // 2) jump to Product Backlog so you immediately see the new story
          setActiveTab('Product Backlog')
        }}
      />
    </div>
  )
}
