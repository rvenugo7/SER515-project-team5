import React from 'react'
import MainScreen from './components/MainScreen.tsx'

export default function App(): JSX.Element {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false)

  return (
    <div className="app">
      <main>
        <MainScreen />
      </main>
    </div>
  )
}
