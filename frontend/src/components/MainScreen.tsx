import React from 'react'

// Component renamed to MainScreen and changed to return the preserved UI.
export default function MainScreen(): JSX.Element {
	// Original UI restored so it renders.
	return (
		<div className="login-container">
			<h2>Scrum Management System</h2>
			<h3 style={{ color: 'grey' }}>Manage releases, user stories, sprints</h3>
		</div>
	)
}
