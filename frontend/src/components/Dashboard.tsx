import React from 'react'

type Props = {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: Props): JSX.Element {
  return (
    <div>
      <h2>Dashboard (placeholder)</h2>
      <p>
        This is a placeholder dashboard. Integrate components and call backend APIs under <code>/api</code>.
      </p>
      <div style={{ marginTop: 12 }}>
        <button onClick={onLogout}>Log out</button>
      </div>
    </div>
  )
}
