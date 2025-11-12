import React, { useState } from 'react'
import StoryCard from './StoryCard'
import KanbanColumn from './KanbanColumn'

interface MainScreenProps {
	onLogout?: () => void
}

export default function MainScreen({ onLogout }: MainScreenProps): JSX.Element {
	const [activeTab, setActiveTab] = useState('Scrum Board')
	const [searchQuery, setSearchQuery] = useState('')
	const [priorityFilter, setPriorityFilter] = useState('All Priorities')

	const stories: Array<{
		id: number
		title: string
		description: string
		priority: 'low' | 'medium' | 'high' | 'critical'
		points: number
		status: string
		labels: string[]
		assignee: string
		tags?: string[]
	}> = []

	const totalStories = stories.length
	const totalPoints = stories.reduce((sum, story) => sum + story.points, 0)

	const getStoriesByStatus = (status: string) => {
		return stories.filter(story => story.status === status)
	}

	const handleTabClick = (tabName: string) => {
		if (tabName === 'Product Backlog' || tabName === 'Release Plans') {
			alert('This section is not implemented yet')
		} else {
			setActiveTab(tabName)
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
					<button className="create-story-btn">
						<span className="plus-icon">+</span>
						Create User Story
					</button>
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
					className={`nav-tab disabled ${activeTab === 'Product Backlog' ? 'active' : ''}`}
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
		</div>
	)
}
