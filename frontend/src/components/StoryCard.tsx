import React from 'react'

interface StoryCardProps {
	id: number
	title: string
	description: string
	priority: 'low' | 'medium' | 'high' | 'critical'
	points: number
	labels: string[]
	assignee: string
	tags?: string[]
	onEdit?: (story: any) => void
	onDragStart?: (storyId: number) => void
	isSprintReady?: boolean
}

export default function StoryCard({
	id,
	title,
	description,
	priority,
	points,
	labels,
	assignee,
	tags = [],
	onEdit,
	onDragStart,
	isSprintReady = true
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

	const isDraggable = Boolean(isSprintReady)

	return (
		<div
			className="story-card"
			draggable={isDraggable}
			onDragStart={(e) => {
				if (!isDraggable) {
					e.preventDefault()
					return
				}
				e.dataTransfer.effectAllowed = 'move'
				e.dataTransfer.setData('text/plain', id.toString())
				onDragStart?.(id)
			}}
			title={isDraggable ? undefined : 'Mark Sprint Ready to move this story'}
		>
			<div className="story-card-header">
				<div className="story-tags-left">
					<span className="story-id-tag">#{id}</span>
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
				<button 
					className="story-menu" 
					title="More options"
					onClick={() => {
						if (onEdit && id) {
							onEdit({
								id,
								title,
								description,
								priority,
								points,
								labels,
								assignee,
								tags,
								acceptanceCriteria: '',
								businessValue: undefined
							})
						}
					}}
				>
					☰
				</button>
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
