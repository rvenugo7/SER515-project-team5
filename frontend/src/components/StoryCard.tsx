import React from 'react'

interface StoryCardProps {
	title: string
	description: string
	priority: 'low' | 'medium' | 'high' | 'critical'
	points: number
	labels: string[]
	assignee: string
	tags?: string[]
}

export default function StoryCard({
	title,
	description,
	priority,
	points,
	labels,
	assignee,
	tags = []
}: StoryCardProps): JSX.Element {
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

	return (
		<div className="story-card">
			<div className="story-card-header">
				<div className="story-tags-left">
					<span className={`priority-tag ${getPriorityColor(priority)}`}>
						{priority === 'critical' && <span className="critical-icon">!</span>}
						{priority}
					</span>
					<span className="points-tag">{points} pts</span>
					{tags.includes('MVP') && <span className="status-tag mvp-tag">MVP</span>}
					{tags.includes('Sprint Ready') && (
						<span className="status-tag sprint-ready-tag">Sprint Ready</span>
					)}
				</div>
				<button className="story-menu">⋮</button>
			</div>
			<p className="story-description">{description}</p>
			<div className="story-card-footer">
				<div className="story-labels">
					{labels.map((label, index) => (
						<span key={index} className="label-tag">
							{label}
						</span>
					))}
				</div>
				<div className="assignee-avatar">{assignee}</div>
			</div>
		</div>
	)
}

