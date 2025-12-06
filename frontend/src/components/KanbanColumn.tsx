import React from 'react'
import StoryCard from './StoryCard'

interface Story {
	id: number
	title: string
	description: string
	priority: 'low' | 'medium' | 'high' | 'critical'
	points: number
	status: string
	labels: string[]
	assignee: string
	tags?: string[]
	isMvp?: boolean
	isSprintReady?: boolean
	acceptanceCriteria?: string
	businessValue?: number
	releasePlanKey?: string
	releasePlanName?: string
}

interface KanbanColumnProps {
	title: string
	stories: Story[]
	onEditStory?: (story: Story) => void
	onStoryDrop?: (storyId: number, newStatus: string) => void
	onStoryDragStart?: (storyId: number, isAllowed: boolean) => void
	onStoryLinked?: () => void
}

export default function KanbanColumn({
	title,
	stories,
	onEditStory,
	onStoryDrop,
	onStoryDragStart,
	onStoryLinked
}: KanbanColumnProps): JSX.Element {
	const totalPoints = stories.reduce((sum, story) => sum + story.points, 0)
	const isDoneColumn = title === 'Done'

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const data = e.dataTransfer.getData('text/plain')
		const storyId = Number(data)
		if (!Number.isNaN(storyId)) {
			onStoryDrop?.(storyId, title)
		}
	}

	return (
		<div className="kanban-column" onDragOver={handleDragOver} onDrop={handleDrop}>
			<div className="column-header">
				<h3 className="column-title">{title}</h3>
				<span className={`column-count ${isDoneColumn ? 'done-count' : ''}`}>
					{stories.length}
				</span>
			</div>
			<div className="column-points">{totalPoints} story points</div>
			<div className="column-stories">
				{stories.length === 0 ? (
					<div className="empty-state">No user stories added</div>
				) : (
					stories.map((story) => (
						<StoryCard
							key={story.id}
							id={story.id}
							title={story.title}
							description={story.description}
							priority={story.priority}
							points={story.points}
							labels={story.labels}
							assignee={story.assignee}
							tags={story.tags || []}
							acceptanceCriteria={story.acceptanceCriteria}
							businessValue={story.businessValue}
							onEdit={onEditStory}
							onDragStart={onStoryDragStart}
							isSprintReady={story.isSprintReady}
							releasePlanKey={story.releasePlanKey}
							releasePlanName={story.releasePlanName}
							onLinked={onStoryLinked}
						/>
					))
				)}
			</div>
		</div>
	)
}
