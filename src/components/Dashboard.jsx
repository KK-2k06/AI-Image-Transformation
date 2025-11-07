import React from 'react'

export default function Dashboard({ user, onNavigate }) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Guest'
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <button
            onClick={() => onNavigate('landing')}
            className="px-3 py-2 text-sm font-medium text-gray-800 bg-white/80 rounded-lg shadow-sm hover:bg-white backdrop-blur-md border border-white/40"
          >
            ← Back to Landing
          </button>
        </div>
        <div className="space-y-3 text-gray-800">
          <div>
            <span className="font-semibold">Name:</span> {displayName}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email || '—'}
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => onNavigate('signIn')}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}


