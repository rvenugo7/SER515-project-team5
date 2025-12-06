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
	acceptanceCriteria?: string
	businessValue?: number
	onEdit?: (story: any) => void
	onDragStart?: (storyId: number, isAllowed: boolean) => void
	isSprintReady?: boolean
	releasePlanKey?: string
	releasePlanName?: string
	onLinked?: () => void
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
	isSprintReady = true,
	releasePlanKey,
	releasePlanName,
	onLinked,
	acceptanceCriteria,
	businessValue
}: StoryCardProps): JSX.Element {
	const isMvpStory = tags.includes('MVP')
	const [linkedPlanKey, setLinkedPlanKey] = React.useState<string | undefined>(
		releasePlanKey
	)
	const [linkedPlanName, setLinkedPlanName] = React.useState<string | undefined>(
		releasePlanName
	)

	React.useEffect(() => {
		setLinkedPlanKey(releasePlanKey)
		setLinkedPlanName(releasePlanName)
	}, [releasePlanKey, releasePlanName])

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
	const cardClass = `story-card ${isDraggable ? 'draggable-card' : 'locked-card'} ${isDraggable ? '' : 'tooltipped'} ${
		isMvpStory ? 'mvp-card' : ''
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
									acceptanceCriteria,
									businessValue
								})
							}
						}}
					>
						☰
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
			<div className="story-card-footer secondary-footer">
				<div className="release-link-section">
					<button
						className={`link-release-btn enhanced ${linkedPlanKey ? 'linked' : ''}`}
						title="Link to release plan"
						onClick={async () => {
							const input = prompt(
								'Enter Release Plan ID or key (e.g., 12 or REL-012) to link this story'
							)
							if (!input) return
							const releasePlanId = input.trim()
							if (!releasePlanId) {
								alert('Release Plan identifier is required')
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
								const resJson = await response.json()
								const newKey = resJson?.releasePlan?.releaseKey
								const newName = resJson?.releasePlan?.name
								setLinkedPlanKey(newKey)
								setLinkedPlanName(newName)
								onLinked?.()
								alert('Story linked to release plan successfully')
							} catch (err: any) {
								console.error(err)
								alert(err?.message || 'Could not link story to release plan')
							}
						}}
					>
						{linkedPlanKey ? 'Linked to Release' : 'Link Release'}
					</button>
					{linkedPlanKey && (
						<div className="release-tag">
							<span className="release-key">{linkedPlanKey}</span>
							{linkedPlanName && <span className="release-name">{linkedPlanName}</span>}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
