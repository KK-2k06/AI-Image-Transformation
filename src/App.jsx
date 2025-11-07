import React, { useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import SignInPage from './components/SignInPage.jsx'
import SignUpPage from './components/SignUpPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  const [page, setPage] = useState('landing')
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '' })

  const navigate = (targetPage) => {
    setPage(targetPage)
    window.scrollTo(0, 0)
  }

  let content
  switch (page) {
    case 'signIn':
      content = (
        <SignInPage
          onNavigate={navigate}
          defaultEmail={user.email}
          onSignIn={({ email }) => {
            setUser((prev) => ({ ...prev, email }))
            navigate('dashboard')
          }}
        />
      )
      break
    case 'signUp':
      content = (
        <SignUpPage
          onNavigate={navigate}
          onSignUp={({ firstName, lastName, email }) => {
            setUser({ firstName, lastName, email })
            navigate('signIn')
          }}
        />
      )
      break
    case 'dashboard':
      content = <Dashboard user={user} onNavigate={navigate} />
      break
    default:
      content = <LandingPage onNavigate={navigate} />
  }

  return (
    <div className="antialiased">
      {content}
    </div>
  )
}


