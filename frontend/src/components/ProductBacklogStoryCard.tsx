import React, { useState } from 'react'

interface Story {
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

interface ProductBacklogStoryCardProps {
	story: Story
}

export default function ProductBacklogStoryCard({ story }: ProductBacklogStoryCardProps): JSX.Element {
	const [isChecked, setIsChecked] = useState(false)
	const [isStarred, setIsStarred] = useState(story.isStarred || false)
	const [isSprintReady, setIsSprintReady] = useState(story.isSprintReady || false)

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'low':
				return 'priority-low'
			case 'medium':
				return 'priority-medium'
			case 'high':
				return 'priority-high'
			case 'critical':
				return 'priority-critical'
			default:
				return 'priority-medium'
		}
	}

	const getStatusColor = (status: string) => {
		const statusLower = status.toLowerCase()
		if (statusLower.includes('progress')) return 'status-in-progress'
		if (statusLower.includes('todo')) return 'status-todo'
		if (statusLower.includes('backlog')) return 'status-backlog'
		if (statusLower.includes('done')) return 'status-done'
		return 'status-todo'
	}

	return (
		<div className="backlog-story-card">
			<div className="story-controls-left">
				<input
					type="checkbox"
					checked={isChecked}
					onChange={(e) => setIsChecked(e.target.checked)}
					className="story-checkbox"
				/>
				<button
					className={`star-btn ${isStarred ? 'starred' : ''}`}
					onClick={() => setIsStarred(!isStarred)}
				>
					★
				</button>
				<button
					className={`sprint-ready-btn ${isSprintReady ? 'ready' : ''}`}
					onClick={() => setIsSprintReady(!isSprintReady)}
				>
					{isSprintReady ? '✓' : '○'}
				</button>
			</div>

			<div className="story-content">
				<h3 className="story-title">{story.title}</h3>
				<div className="story-tags">
					<span className={`priority-tag ${getPriorityColor(story.priority)}`}>
						{story.priority === 'critical' && <span className="critical-icon">!</span>}
						{story.priority}
					</span>
					<span className={`status-tag ${getStatusColor(story.status)}`}>
						{story.status.toLowerCase()}
					</span>
					<span className="points-tag">{story.points} pts</span>
					{story.tags?.includes('MVP') && <span className="status-tag mvp-tag">MVP</span>}
					{story.tags?.includes('Sprint Ready') && (
						<span className="status-tag sprint-ready-tag">Sprint Ready</span>
					)}
				</div>
				<p className="story-description">{story.description}</p>
				<div className="story-footer">
					<div className="assignee-info">
						<div className="assignee-avatar">{story.assignee}</div>
						{story.assigneeName && <span className="assignee-name">{story.assigneeName}</span>}
						{story.labels.map((label, index) => (
							<span key={index} className="label-tag">
								{label}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="story-actions">
				<button className="action-btn view-btn">
					<span className="action-icon">👁</span>
					View Details
				</button>
				<button className="action-btn edit-btn">
					<span className="action-icon">✎</span>
					Edit
				</button>
			</div>
		</div>
	)
}

