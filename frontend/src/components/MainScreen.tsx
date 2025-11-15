import React, { useState } from 'react'
import StoryCard from './StoryCard'
import KanbanColumn from './KanbanColumn'
import ProductBacklog from './ProductBacklog'
import CreateUserStoryModal from './CreateUserStoryModal'

interface MainScreenProps {
	onLogout?: () => void
}

export default function MainScreen({ onLogout }: MainScreenProps): JSX.Element {
	const [activeTab, setActiveTab] = useState('Scrum Board')
	const [searchQuery, setSearchQuery] = useState('')
	const [priorityFilter, setPriorityFilter] = useState('All Priorities')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [editingStory, setEditingStory] = useState<any>(null)

	const stories: Array<{
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
	}> = [
		{
			id: 1,
			title: 'User Login Functionality',
			description: 'As a user, I want to be able to log in to the system using my email and password so that I can access my personalized dashboard and features.',
			priority: 'high',
			points: 8,
			status: 'Backlog',
			labels: ['authentication', 'security'],
			assignee: 'JD',
			assigneeName: 'John Doe',
			tags: ['MVP'],
			isStarred: true,
			isSprintReady: true
		}
	]

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
					<button className="create-story-btn"
						onClick={() => setIsCreateOpen(true)}>
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
							onEditStory={handleEditStory}
						/>
						<KanbanColumn
							title="To Do"
							stories={getStoriesByStatus('To Do')}
							onEditStory={handleEditStory}
						/>
						<KanbanColumn
							title="In Progress"
							stories={getStoriesByStatus('In Progress')}
							onEditStory={handleEditStory}
						/>
						<KanbanColumn
							title="Done"
							stories={getStoriesByStatus('Done')}
							onEditStory={handleEditStory}
						/>
					</div>
				</>
			)}

			{activeTab === 'Product Backlog' && (
				<ProductBacklog stories={stories} />
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
					//TODO Refresh Story List from Backend
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
							//TODO Refresh Story List from Backend
							setIsEditModalOpen(false)
							setEditingStory(null)
						}}
						story={editingStory}
					/>
				</div>
			)}
		</div>
	)
}
