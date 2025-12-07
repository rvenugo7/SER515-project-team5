import { useEffect, useState } from 'react'

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
	isMvp?: boolean
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
	canToggleMvp?: boolean
	checked?: boolean
	onToggleCheck?: (checked: boolean) => void
}

export default function ProductBacklogStoryCard({
	story,
	onEdit,
	onUpdate,
	canEditSprintReady = false,
	canToggleMvp = false,
	checked,
	onToggleCheck,
}: ProductBacklogStoryCardProps): JSX.Element {
	const [internalChecked, setInternalChecked] = useState(false)
	const isChecked = checked ?? internalChecked
	const [isStarred, setIsStarred] = useState(story.isStarred || false)
	const [isSprintReady, setIsSprintReady] = useState(story.isSprintReady || false)
	const [isMvp, setIsMvp] = useState(Boolean(story.isMvp || story.tags?.includes('MVP')))
	const [tags, setTags] = useState<string[]>(story.tags || [])
	const [storyPoints, setStoryPoints] = useState(story.points || 0)
	const [isSaving, setIsSaving] = useState(false)
	const [showEstimateModal, setShowEstimateModal] = useState(false)
	const [showEstimateSuccess, setShowEstimateSuccess] = useState(false)
	const [estimateError, setEstimateError] = useState<string | null>(null)
	const [isTogglingStar, setIsTogglingStar] = useState(false)
	const [isTogglingSprint, setIsTogglingSprint] = useState(false)
	const [isTogglingMvp, setIsTogglingMvp] = useState(false)
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
		setIsMvp(Boolean(story.isMvp || story.tags?.includes('MVP')))
		setTags(story.tags || [])
	}, [story.isStarred, story.isSprintReady, story.points, story.isMvp, story.tags])


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
      			isMvp,
				tags
    })

			setShowEstimateSuccess(true) 
		} catch (err){
			console.error(err)
			setEstimateError("Could not update estimation")
		} finally {
			setIsSaving(false)
		}
	}
	const mvpTooltip = canToggleMvp ? (isMvp ? 'Unset MVP' : 'Mark as MVP') : 'Access Denied'

	const handleToggleMvp = async () => {
		if (!canToggleMvp || isTogglingMvp) return
		const next = !isMvp
		setIsMvp(next)
		setIsTogglingMvp(true)
		try {
			const response = await fetch(`/api/stories/${story.id}/mvp`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ mvp: next })
			})
			if (!response.ok) {
				throw new Error("Failed to update MVP flag")
			}
			const updatedStory = await response.json()
			const mvpVal = Boolean((updatedStory as any).mvp ?? (updatedStory as any).isMvp ?? next)
			setIsMvp(mvpVal)
			const nextTags = new Set(tags)
			if (mvpVal) nextTags.add('MVP')
			else nextTags.delete('MVP')
			const merged = {
				...story,
				...updatedStory,
				points: updatedStory.storyPoints ?? story.points,
				isMvp: mvpVal,
				tags: Array.from(nextTags)
			} as Story
			setTags(Array.from(nextTags))
			onUpdate?.(merged)
		} catch (err) {
			console.error(err)
			alert("Could not update MVP flag")
			setIsMvp(!next)
		} finally {
			setIsTogglingMvp(false)
		}
	}

	const handleToggleStar = async () => {
		if (isTogglingStar) return
		const next = !isStarred
		setIsStarred(next)
		setIsTogglingStar(true)
		try {
			const response = await fetch(`/api/stories/${story.id}/star`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
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
				isMvp,
				tags
			} as Story)
		} catch (err) {
			console.error(err)
			alert("Could not update star")
			setIsStarred(!next)
		} finally {
			setIsTogglingStar(false)
		}
	}

	const handleToggleSprintReady = async () => {
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
			if (!response.ok) throw new Error("Failed to update sprint-ready")
			const updatedStory = await response.json()
			const sprintReadyVal = Boolean((updatedStory as any).sprintReady)
			const nextTags = new Set(tags)
			if (sprintReadyVal) nextTags.add('Sprint Ready')
			else nextTags.delete('Sprint Ready')
			const updatedTags = Array.from(nextTags)
			setTags(updatedTags)
			setIsSprintReady(sprintReadyVal)
			onUpdate?.({
				...story,
				...updatedStory,
				points: updatedStory.storyPoints ?? story.points,
				isSprintReady: sprintReadyVal,
				isMvp,
				tags: updatedTags
			} as Story)
		} catch (err) {
			console.error(err)
			alert("Could not update sprint-ready")
			setIsSprintReady(!next)
		} finally {
			setIsTogglingSprint(false)
		}
	}

	return (
		<>
		<div className="release-card">
			{/* Header - similar to ReleasePlanCard */}
			<div className="release-card-header">
				<div className="release-header-left">
					<span className="release-key-badge">US-{story.id}</span>
					<h3 className="release-title">{story.title}</h3>
					{isMvp && <span className="mvp-badge">MVP</span>}
				</div>
				<span className={`priority-tag ${getPriorityColor(story.priority)}`}>
					{story.priority === 'critical' && <span className="critical-icon">!</span>}
					{story.priority}
				</span>
			</div>

			{/* Description */}
			{story.description && (
				<p className="release-description">{story.description}</p>
			)}

			{/* Details Grid */}
			<div className="release-details">
				<div className="release-detail-item">
					<span className="detail-label">Status:</span>
					<span
						className={`status-tag ${getStatusColor(story.status)}`}
						style={{ marginLeft: 4, display: 'inline', padding: '2px 8px', width: 'auto' }}
					>
						{story.status.toLowerCase()}
					</span>
				</div>
				<div className="release-detail-item">
					<span className="detail-label">Points:</span>
					<span className="detail-value">{story.points}</span>
				</div>
				<div className="release-detail-item">
					<span className="detail-label">Business Value:</span>
					<span className="detail-value">{story.businessValue ?? '—'}</span>
				</div>
				<div className="release-detail-item">
					<span className="detail-label">Assignee:</span>
					<span className="detail-value">{story.assigneeName || 'Not Assigned'}</span>
				</div>
			</div>

			{/* Tags */}
			{(tags.includes('MVP') || tags.includes('Sprint Ready') || story.labels.length > 0) && (
				<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
					{tags.includes('Sprint Ready') && (
						<span className="status-tag sprint-ready-tag">Sprint Ready</span>
					)}
					{story.labels.map((label, index) => (
						<span key={index} className="label-tag">{label}</span>
					))}
				</div>
			)}

			{/* Footer */}
			<div className="release-footer">
				<div className="release-meta" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<input
						type="checkbox"
						checked={isChecked}
						onChange={(e) => {
							const next = e.target.checked
							if (onToggleCheck) onToggleCheck(next)
							else setInternalChecked(next)
						}}
						className="story-checkbox"
						title="Select story"
					/>
					<button
						className={`star-btn ${isStarred ? 'starred' : ''}`}
						onClick={handleToggleStar}
						title={isStarred ? 'Unstar story' : 'Star story'}
					>
						★
					</button>
					<button
						className={`sprint-ready-btn ${isSprintReady ? 'ready' : ''}`}
						disabled={!canEditSprintReady}
						onClick={handleToggleSprintReady}
						title={sprintReadyTooltip}
					>
						{isSprintReady ? '✓' : '○'}
					</button>
					<button
						className={`mvp-toggle-btn ${isMvp ? 'active' : ''}`}
						onClick={handleToggleMvp}
						title={mvpTooltip}
						disabled={isTogglingMvp || !canToggleMvp}
					>
						MVP
					</button>
				</div>
				<div className="release-actions">
					<button
						className="action-btn"
						onClick={() => setShowDetails(true)}
						style={{ background: '#1a202c', color: 'white', border: 'none' }}
					>
						View
					</button>
					<button
						className="action-btn"
						onClick={() => onEdit?.(story)}
						style={{ background: '#1a202c', color: 'white', border: 'none' }}
					>
						Edit
					</button>
					<button
						className="action-btn"
						onClick={() => setShowEstimateModal(true)}
						style={{ background: '#1a202c', color: 'white', border: 'none' }}
					>
						Edit Points
					</button>
				</div>
			</div>
		</div>

		{showDetails && (
			<div className="modal-overlay">
				<div className="modal-container" style={{ maxWidth: 520 }}>
					<div className="modal-header">
						<h2>
							<span className="story-id">US-{story.id}</span> {story.title}
							{isMvp && <span className="mvp-badge" style={{ marginLeft: 8 }}>MVP</span>}
						</h2>
						<button className="modal-close-btn" onClick={() => setShowDetails(false)}>
							×
						</button>
					</div>
					<div className="modal-body">
						<div className="detail-tags" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
							<span className={`priority-tag ${getPriorityColor(story.priority)}`}>
								{story.priority === 'critical' && <span className="critical-icon">!</span>}
								{story.priority}
							</span>
							<span className={`status-tag ${getStatusColor(story.status)}`}>
								{story.status.toLowerCase()}
							</span>
							<span className="points-tag">{story.points} pts</span>
							{tags.includes('Sprint Ready') && (
								<span className="status-tag sprint-ready-tag">Sprint Ready</span>
							)}
						</div>

						<div className="detail-section" style={{ marginBottom: 16 }}>
							<label style={{ fontWeight: 600, color: '#4a5568', fontSize: 13, display: 'block', marginBottom: 4 }}>Description</label>
							<p style={{ margin: 0, color: '#2d3748', lineHeight: 1.5 }}>{story.description || '—'}</p>
						</div>

						<div className="detail-section" style={{ marginBottom: 16 }}>
							<label style={{ fontWeight: 600, color: '#4a5568', fontSize: 13, display: 'block', marginBottom: 4 }}>Acceptance Criteria</label>
							<p style={{ margin: 0, color: '#2d3748', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{story.acceptanceCriteria || '—'}</p>
						</div>

						<div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
							<div className="detail-item">
								<label style={{ fontWeight: 600, color: '#4a5568', fontSize: 13, display: 'block', marginBottom: 2 }}>Business Value</label>
								<span style={{ color: '#2d3748' }}>{story.businessValue !== undefined ? story.businessValue : '—'}</span>
							</div>
							<div className="detail-item">
								<label style={{ fontWeight: 600, color: '#4a5568', fontSize: 13, display: 'block', marginBottom: 2 }}>Assignee</label>
								<span style={{ color: '#2d3748' }}>{story.assigneeName || 'Not Assigned'}</span>
							</div>
						</div>

						<div className="toggle-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginLeft: -24, marginRight: -24, borderTop: '1px solid #e2e8f0' }}>
							<span style={{ fontWeight: 500, color: '#4a5568' }}>MVP Status</span>
							<button
								className={`mvp-toggle-btn ${isMvp ? 'active' : ''}`}
								onClick={handleToggleMvp}
								disabled={isTogglingMvp || !canToggleMvp}
								aria-label={mvpTooltip}
							>
								{isMvp ? 'Unset MVP' : 'Mark as MVP'}
							</button>
						</div>
					</div>
				</div>
			</div>
		)}

		{showEstimateModal && (
			<div className="modal-overlay">
				<div className="modal-container" style={{ maxWidth: 400 }}>
					<div className="modal-header">
						<h2>
							<span className="story-id">US-{story.id}</span> Edit Story Points
						</h2>
						<button
							className="modal-close-btn"
							onClick={() => setShowEstimateModal(false)}
						>
							×
						</button>
					</div>

					<div className="modal-body">
						<div style={{ marginBottom: 16 }}>
							<label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>
								Story Points
							</label>
							<input
								type="number"
								min="0"
								value={storyPoints}
								onChange={(e) => setStoryPoints(Number(e.target.value))}
								style={{
									width: '100%',
									padding: '10px 12px',
									borderRadius: 8,
									border: '1px solid #e2e8f0',
									fontSize: 16,
									boxSizing: 'border-box',
									outline: 'none',
								}}
							/>
						</div>

						{estimateError && (
							<div style={{
								marginBottom: 16,
								padding: '10px 14px',
								borderRadius: 8,
								fontSize: 13,
								background: '#fef2f2',
								color: '#dc2626',
								border: '1px solid #fecaca',
							}}>
								{estimateError}
							</div>
						)}

						<div style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: 10,
							paddingTop: 16,
							borderTop: '1px solid #e2e8f0',
						}}>
							<button
								onClick={() => setShowEstimateModal(false)}
								disabled={isSaving}
								style={{
									padding: '10px 18px',
									borderRadius: 8,
									border: '1px solid #e2e8f0',
									background: '#f8fafc',
									fontSize: 14,
									fontWeight: 500,
									cursor: 'pointer',
									color: '#4a5568',
								}}
							>
								Cancel
							</button>
							<button
								disabled={isSaving}
								onClick={async() => {
									await updateEstimation()
									if(!estimateError){
										setShowEstimateModal(false)
									}
								}}
								style={{
									padding: '10px 20px',
									borderRadius: 8,
									border: 'none',
									background: isSaving ? '#93c5fd' : '#2563eb',
									color: 'white',
									fontSize: 14,
									fontWeight: 500,
									cursor: isSaving ? 'not-allowed' : 'pointer',
								}}
							>
								{isSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				</div>
			</div>
		)}

		{showEstimateSuccess && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h2>Story Points Updated</h2>
              <button className="modal-close-btn" onClick={() => setShowEstimateSuccess(false)}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
              <p style={{ margin: 0, color: '#2d3748', fontSize: 15 }}>
                The story points were saved successfully.
              </p>
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={() => setShowEstimateSuccess(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#2563eb',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
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
