import React, { useState } from 'react'
import ProductBacklogStoryCard from './ProductBacklogStoryCard'

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

interface ProductBacklogProps {
	stories: Story[]
}

export default function ProductBacklog({ stories = [] }: ProductBacklogProps): JSX.Element {
	const [searchQuery, setSearchQuery] = useState('')
	const [releaseFilter, setReleaseFilter] = useState('All Releases')
	const [storyFilter, setStoryFilter] = useState('All Stories')

	const sprintReadyCount = stories.filter(story => story.isSprintReady).length

	return (
		<div className="product-backlog">
			<div className="backlog-header">
				<h2 className="backlog-title">Product Backlog</h2>
				<p className="backlog-description">Manage and prioritize user stories</p>
			</div>

			<div className="backlog-controls">
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
					className="filter-dropdown"
					value={releaseFilter}
					onChange={(e) => setReleaseFilter(e.target.value)}
				>
					<option>All Releases</option>
				</select>
				<select
					className="filter-dropdown"
					value={storyFilter}
					onChange={(e) => setStoryFilter(e.target.value)}
				>
					<option>All Stories</option>
				</select>
				<button
					className={`export-btn ${sprintReadyCount === 0 ? 'disabled' : ''}`}
					disabled={sprintReadyCount === 0}
				>
					<span className="export-icon">↓</span>
					Export Sprint-Ready Stories ({sprintReadyCount})
				</button>
			</div>

			{stories.length === 0 ? (
				<div className="backlog-empty-state">No user stories added</div>
			) : (
				<div className="backlog-stories">
					{stories.map((story) => (
						<ProductBacklogStoryCard
							key={story.id}
							story={story}
						/>
					))}
				</div>
			)}
		</div>
	)
}

