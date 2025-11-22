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
	onDragStart?: (storyId: number, isAllowed: boolean) => void
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
	const cardClass = `story-card ${isDraggable ? 'draggable-card' : 'locked-card'} ${
		isDraggable ? '' : 'tooltipped'
	}`.trim()
	const lockedTooltip = 'Mark Sprint Ready to move this story'

	return (
		<div
			className={cardClass}
			draggable
			data-tooltip={isDraggable ? undefined : lockedTooltip}
			onDragStart={(e) => {
				if (!isDraggable) {
					e.preventDefault()
					onDragStart?.(id, false)
					return
				}
				e.dataTransfer.effectAllowed = 'move'
				e.dataTransfer.setData('text/plain', id.toString())
				onDragStart?.(id, true)
			}}
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
				<div className="story-actions-inline">
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
					<button
						className="link-release-btn"
						title="Link to release plan"
						onClick={async () => {
							const input = prompt('Enter Release Plan ID to link this story')
							if (!input) return
							const releasePlanId = Number(input)
							if (Number.isNaN(releasePlanId)) {
								alert('Release Plan ID must be a number')
								return
							}
							try {
								const response = await fetch(`/api/stories/${id}/release-plan`, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									credentials: 'include',
									body: JSON.stringify({ releasePlanId })
								})

								if (!response.ok) {
									const msg = await response.text()
									throw new Error(msg || 'Failed to link story to release plan')
								}
								alert('Story linked to release plan successfully')
							} catch (err: any) {
								console.error(err)
								alert(err?.message || 'Could not link story to release plan')
							}
						}}
					>
						Link Release
					</button>
				</div>
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
