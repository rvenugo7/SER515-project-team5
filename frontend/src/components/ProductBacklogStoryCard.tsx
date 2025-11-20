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
	onEdit?: (story: Story) => void
	onUpdate?: (updatedStory: Story) => void
}

export default function ProductBacklogStoryCard({ story, onEdit, onUpdate }: ProductBacklogStoryCardProps): JSX.Element {
	const [isChecked, setIsChecked] = useState(false)
	const [isStarred, setIsStarred] = useState(story.isStarred || false)
	const [isSprintReady, setIsSprintReady] = useState(story.isSprintReady || false)
	const [storyPoints, setStoryPoints] = useState(story.points || 0)
	const [isSaving, setIsSaving] = useState(false)
	const [showEstimateModal, setShowEstimateModal] = useState(false);


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
		setIsSaving(true)
		try{
			const response = await fetch(`/api/stories/${story.id}/estimate`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
		
				},credentials: "include",
				body: JSON.stringify({ storyPoints }),
			})

			if (!response.ok){
				throw new Error("Failed to update estimation")
			}

			const updatedStory = await response.json()

			setStoryPoints(updatedStory.storyPoints ?? storyPoints)
			if (onUpdate) {
    			onUpdate(updatedStory);   
			}

			alert("Estimation updated!")
		} catch (err){
			console.error(err)
			alert("Could not update estimation")
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
					className="story-checkbox"
					title="Select"
				/>
				<button
					className={`star-btn ${isStarred ? 'starred' : ''}`}
					onClick={() => setIsStarred(!isStarred)}
					title={isStarred ? 'Unstar story' : 'Star story'}
				>
					★
				</button>
				<button
					className={`sprint-ready-btn ${isSprintReady ? 'ready' : ''}`}
					onClick={() => setIsSprintReady(!isSprintReady)}
					title={isSprintReady ? 'Mark as not sprint-ready' : 'Mark as sprint-ready'}
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
				<button className="action-btn view-btn">
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

						<div className="form-actions">
							<button
								className="btn-submit"
								onClick={() => {
									updateEstimation();
									setShowEstimateModal(false);
								}}
							>
								Save
							</button>

							<button
								className="btn-cancel"
								onClick={() => setShowEstimateModal(false)}
							>
								Cancel
							</button>
						</div>

					</div>

				</div>
			</div>
		)}

	</>

	)
	
}
