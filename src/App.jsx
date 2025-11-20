import React, { useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import SignInPage from './components/SignInPage.jsx'
import SignUpPage from './components/SignUpPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  const [page, setPage] = useState('landing')
  const [user, setUser] = useState({ id: null, firstName: '', lastName: '', email: '', generationsLeft: 5 })
  const [transitioning, setTransitioning] = useState(false)

  const navigate = (targetPage) => {
    setTransitioning(true)
    setTimeout(() => {
      setPage(targetPage)
      window.scrollTo(0, 0)
      setTimeout(() => setTransitioning(false), 50)
    }, 300)
  }

  let content
  switch (page) {
    case 'signIn':
      content = (
        <SignInPage
          onNavigate={navigate}
          defaultEmail={user.email}
          onSignIn={async ({ email, password }) => {
            try {
              const res = await fetch('/api/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
              })
              if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Sign in failed')
              }
              const data = await res.json()
              setUser({ 
                id: data.id, 
                firstName: data.firstName, 
                lastName: data.lastName, 
                email: data.email,
                generationsLeft: data.generationsLeft || 5
              })
              navigate('dashboard')
            } catch (err) {
              alert(err.message)
            }
          }}
        />
      )
      break
    case 'signUp':
      content = (
        <SignUpPage
          onNavigate={navigate}
          onSignUp={async ({ firstName, lastName, email, password }) => {
            try {
              const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password })
              })
              if (res.status === 409) {
                const data = await res.json().catch(() => ({}))
                alert(data.error || 'Account already exists')
                return
              }
              if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Sign up failed')
              }
              const data = await res.json()
              setUser({ firstName: data.firstName, lastName: data.lastName, email: data.email })
              alert('Account created successfully! Please sign in.')
              navigate('signIn')
            } catch (err) {
              alert(err.message)
            }
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
      <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {content}
      </div>
    </div>
  )
}


