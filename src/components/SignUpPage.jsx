import React, { useEffect, useRef, useState } from 'react'
import signupBg from '../bgimages/signup.png'

export default function SignUpPage({ onNavigate, onSignUp }) {
  const [visible, setVisible] = useState(false)
  const firstRef = useRef(null)
  const lastRef = useRef(null)
  const emailRef = useRef(null)
  useEffect(() => setVisible(true), [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const firstName = (firstRef.current?.value || '').trim()
    const lastName = (lastRef.current?.value || '').trim()
    const email = (emailRef.current?.value || '').trim()
    onSignUp?.({ firstName, lastName, email })
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12">
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-4 left-4 z-20 px-3 py-2 text-sm font-medium text-gray-800 bg-white/80 rounded-lg shadow-sm hover:bg-white backdrop-blur-md border border-white/40"
      >
        ← Back to Landing
      </button>
      <div className="pointer-events-none absolute inset-0 z-0">
        <img src={signupBg} alt="" className="h-full w-full object-cover opacity-25 z-50" />
        <div className="absolute inset-0 bg-white/40" />
      </div>
      <div className={`w-full max-w-md p-8 space-y-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <h2
            onClick={() => onNavigate('landing')}
            className="text-4xl font-black text-center text-indigo-600 cursor-pointer"
          >
            TOONIFY
          </h2>
          <h3 className="mt-2 text-2xl font-bold text-center text-gray-900">
            Create your account
          </h3>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First Name</label>
              <input id="firstname" name="firstname" type="text" required ref={firstRef}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input id="lastname" name="lastname" type="text" required ref={lastRef}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email address</label>
            <input id="email-signup" name="email" type="email" autoComplete="email" required ref={emailRef}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password-signup" name="password" type="password" required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('signIn')}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}


