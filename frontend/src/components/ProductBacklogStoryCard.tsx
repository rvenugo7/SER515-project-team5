import React, { useEffect, useState } from 'react'

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
	acceptanceCriteria?: string
	businessValue?: number
}

interface ProductBacklogStoryCardProps {
	story: Story
	onEdit?: (story: Story) => void
	onUpdate?: (updatedStory: Story) => void
	canEditSprintReady?: boolean
}

export default function ProductBacklogStoryCard({
	story,
	onEdit,
	onUpdate,
	canEditSprintReady = false,
}: ProductBacklogStoryCardProps): JSX.Element {
	const [isChecked, setIsChecked] = useState(false)
	const [isStarred, setIsStarred] = useState(story.isStarred || false)
	const [isSprintReady, setIsSprintReady] = useState(story.isSprintReady || false)
	const [storyPoints, setStoryPoints] = useState(story.points || 0)
	const [isSaving, setIsSaving] = useState(false)
	const [showEstimateModal, setShowEstimateModal] = useState(false)
	const [showEstimateSuccess, setShowEstimateSuccess] = useState(false)
	const [estimateError, setEstimateError] = useState<string | null>(null)
	const [isTogglingStar, setIsTogglingStar] = useState(false)
	const [isTogglingSprint, setIsTogglingSprint] = useState(false)
	const [showDetails, setShowDetails] = useState(false)

	const sprintReadyTooltip = canEditSprintReady
		? isSprintReady
			? 'Mark as not sprint-ready'
			: 'Mark as sprint-ready'
		: 'Access Denied'

	useEffect(() => {
		setIsStarred(story.isStarred || false)
		setIsSprintReady(story.isSprintReady || false)
		setStoryPoints(story.points || 0)
	}, [story.isStarred, story.isSprintReady, story.points])


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

	const updateEstimation = async () => {
		if(storyPoints <= 0){
			setEstimateError('Story points must be greater than zero')
			return
		}
		setIsSaving(true)
		setEstimateError(null)
		try{
			const response = await fetch(`/api/stories/${story.id}/estimate`, {
				method: "PUT",
				headers: {"Content-Type": "application/json"},
					credentials: "include",
					body: JSON.stringify({ storyPoints }),
				
			})

			if (!response.ok){
				throw new Error("Failed to update estimation")
			}

			const updatedStory = await response.json()
			const nextPoints = updatedStory.storyPoints ?? storyPoints

			setStoryPoints(updatedStory.storyPoints ?? storyPoints)
			onUpdate?.({
      			...story,
      			...updatedStory,
      			points: nextPoints,
    })

			setShowEstimateSuccess(true) 
		} catch (err){
			console.error(err)
			setEstimateError("Could not update estimation")
		} finally {
			setIsSaving(false)
		}
	}
	return (
		<>
		<div className="backlog-story-card">
			<div className="story-controls-left">
				<input
					type="checkbox"
					checked={isChecked}
					onChange={(e) => setIsChecked(e.target.checked)}
					className="story-checkbox tooltipped"
					data-tooltip="Select story"
					aria-label="Select story"
				/>
				<button
					className={`star-btn ${isStarred ? 'starred' : ''} tooltipped`}
					onClick={async () => {
						if (isTogglingStar) return
						const next = !isStarred
						setIsStarred(next)
						setIsTogglingStar(true)
						try {
							const response = await fetch(`/api/stories/${story.id}/star`, {
								method: "PUT",
								headers: {
									"Content-Type": "application/json",
								},
								credentials: "include",
								body: JSON.stringify({ starred: next }),
							})
							if (!response.ok) throw new Error("Failed to update star")
							const updatedStory = await response.json()
							const starredVal = Boolean((updatedStory as any).isStarred)
							setIsStarred(starredVal)
							onUpdate?.({
								...story,
								...updatedStory,
								points: updatedStory.storyPoints ?? story.points,
								isStarred: starredVal,
							} as Story)
						} catch (err) {
							console.error(err)
							alert("Could not update star")
							setIsStarred(!next)
						} finally {
							setIsTogglingStar(false)
						}
					}}
					data-tooltip={isStarred ? 'Unstar story' : 'Star story'}
					aria-label={isStarred ? 'Unstar story' : 'Star story'}
				>
					★
				</button>
			<button
				className={`sprint-ready-btn ${isSprintReady ? 'ready' : ''} tooltipped`}
				disabled={!canEditSprintReady}
				onClick={async () => {
					if (!canEditSprintReady || isTogglingSprint) return
					const next = !isSprintReady
					setIsSprintReady(next)
					setIsTogglingSprint(true)
						try {
							const response = await fetch(`/api/stories/${story.id}/sprint-ready`, {
								method: "PUT",
								headers: { "Content-Type": "application/json" },
								credentials: "include",
								body: JSON.stringify({ sprintReady: next })
							})
							if (!response.ok) {
								throw new Error("Failed to update sprint-ready")
							}
							const updatedStory = await response.json()
							const sprintReadyVal = Boolean((updatedStory as any).sprintReady)
							setIsSprintReady(sprintReadyVal)
							onUpdate?.({
								...story,
								...updatedStory,
								points: updatedStory.storyPoints ?? story.points,
								isSprintReady: sprintReadyVal
							} as Story)
						} catch (err) {
							console.error(err)
							alert("Could not update sprint-ready")
							setIsSprintReady(!next)
						} finally {
							setIsTogglingSprint(false)
						}
				}}
				data-tooltip={sprintReadyTooltip}
				aria-label={sprintReadyTooltip}
			>
				{isSprintReady ? '✓' : '○'}
			</button>
			</div>

			<div className="story-content">
				<h3 className="story-title">
					<span className="story-id">#{story.id}</span> {story.title}
				</h3>
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
				<button
					className="action-btn view-btn"
					title="View story details"
					onClick={() => setShowDetails(true)}
				>
					<span className="action-icon">👁</span>
					View Details
				</button>
				<button 
					className="action-btn edit-btn" 
					title="Edit user story"
					onClick={() => onEdit?.(story)}
				>
					<span className="action-icon">✏️</span>
					Update
				</button>

				<button 
    				className="action-btn estimate-btn"
    				title="Edit story points"
    				onClick={() => setShowEstimateModal(true)}
				>
    				<span className="action-icon">📊</span>
    				Edit Points
				</button>
			</div>
		</div>

		{showDetails && (
			<div className="modal-overlay">
				<div className="modal-container" style={{ maxWidth: 480 }}>
					<div className="modal-header">
						<h2>Story Details</h2>
						<button className="modal-close-btn" onClick={() => setShowDetails(false)}>
							×
						</button>
					</div>
					<div className="modal-body">
						<p className="modal-field"><strong>Title:</strong> {story.title}</p>
						<p className="modal-field"><strong>Description:</strong> {story.description}</p>
						<p className="modal-field">
							<strong>Acceptance Criteria:</strong>{' '}
							{story.acceptanceCriteria ? story.acceptanceCriteria : '—'}
						</p>
						<p className="modal-field">
							<strong>Business Value:</strong>{' '}
							{story.businessValue !== undefined ? story.businessValue : '—'}
						</p>
						<p className="modal-field"><strong>Status:</strong> {story.status}</p>
						<p className="modal-field"><strong>Priority:</strong> {story.priority}</p>
						<p className="modal-field"><strong>Story Points:</strong> {story.points}</p>
					</div>
					<div className="form-actions">
						<button className="btn-cancel" onClick={() => setShowDetails(false)}>
							Close
						</button>
					</div>
				</div>
			</div>
		)}

		{showEstimateModal && (
			<div className="modal-overlay">
				<div className="modal-container">

					<div className="modal-header">
						<h2>Edit Story Points</h2>
						<button
							className="modal-close-btn"
							onClick={() => setShowEstimateModal(false)}
						>
							×
						</button>
					</div>

					<div className="modal-body">

						<input
							type="number"
							min="0"
							className="estimation-input"
							value={storyPoints}
							onChange={(e) => setStoryPoints(Number(e.target.value))}
						/>

						{estimateError && <p className="error-text">{estimateError}</p>}

						<div className="form-actions">
							<button
								className="btn-submit"
								disabled={isSaving}
								onClick={async() => {
									await updateEstimation()
									if(!estimateError){
										setShowEstimateModal(false)
									}
									
								}}
							>
								{isSaving ? 'Saving…' : 'Save'}
							</button>

							<button
								className="btn-cancel"
								onClick={() => setShowEstimateModal(false)}
								disabled={isSaving}
								
							>
								Cancel
							</button>
						</div>

					</div>

				</div>
			</div>
		)}

		{showEstimateSuccess && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Story Points Updated</h2>
            </div>
            <div className="modal-body">
              <p>The story points were saved successfully.</p>
              <div className="form-actions">
                <button className="btn-submit" onClick={() => setShowEstimateSuccess(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

	</>

	)
	
}
