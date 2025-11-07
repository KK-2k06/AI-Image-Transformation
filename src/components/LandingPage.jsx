import React, { useEffect, useState } from 'react'
import { stylesData } from '../data/stylesData.js'
import landingBg from '../bgimages/landingpage.png'

export default function LandingPage({ onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stylesData.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const currentStyle = stylesData[currentIndex]
  const year = new Date().getFullYear()

  return (
    <div className="relative flex flex-col min-h-screen text-gray-900 overflow-hidden">
      {/* Background image with reduced opacity */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img src={landingBg} alt="" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.75)_60%,rgba(255,255,255,1)_100%)]" />
      </div>
      <nav className="sticky top-0 inset-x-0 z-30 px-6 py-4">
        <div className="mx-auto max-w-7xl rounded-2xl border border-white/30 bg-white/40 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => onNavigate('landing')} className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
              TOONIFY
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('signIn')}
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-white/80 rounded-lg shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signUp')}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-grow grid md:grid-cols-2 gap-16 items-center px-8 sm:px-16 md:px-24 py-32">
        <div className="space-y-6 z-10">
          <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">DreamInk</h1>
          <p className="text-2xl text-gray-700/90">
            <span className="relative inline-block">
              Turn your image into art
              <span className="absolute -bottom-1 left-0 right-0 h-[6px] bg-gradient-to-r from-indigo-300/60 via-fuchsia-300/60 to-rose-300/60 rounded-full" />
            </span>
          </p>
          <div className="relative h-24">
            <div key={currentStyle.id} className="text-xl text-gray-700 animate-fadeIn">
              <p>{currentStyle.description}</p>
            </div>
          </div>
        </div>

        <div className="relative h-96 md:h-[500px] w-full max-w-md mx-auto flex items-center justify-center">
          <div className="absolute w-72 h-96 md:w-80 md:h-[450px] bg-indigo-500/90 rounded-3xl shadow-2xl ring-1 ring-indigo-700/30 transform -rotate-6" />

          <div className="relative w-72 h-96 md:w-80 md:h-[450px]">
            {stylesData.map((style, index) => {
              const offset = (index - currentIndex + stylesData.length) % stylesData.length
              let transform, opacity, zIndex, filter

              if (offset === 0) {
                transform = 'translateX(0) scale(1)'
                opacity = 1
                zIndex = 10
                filter = 'blur(0px)'
              } else if (offset === 1) {
                transform = 'translateX(40px) scale(0.9)'
                opacity = 0.7
                zIndex = 9
                filter = 'blur(2px)'
              } else if (offset === 2) {
                transform = 'translateX(80px) scale(0.8)'
                opacity = 0.3
                zIndex = 8
                filter = 'blur(4px)'
              } else if (offset === stylesData.length - 1) {
                transform = 'translateX(-100%) scale(0.8)'
                opacity = 0
                zIndex = 7
                filter = 'blur(5px)'
              } else {
                transform = 'translateX(0) scale(0.5)'
                opacity = 0
                zIndex = 1
                filter = 'blur(5px)'
              }

              return (
                <div
                  key={style.id}
                  className="absolute w-full h-full transition-all duration-700 ease-in-out will-change-transform"
                  style={{ transform, opacity, zIndex, filter }}
                >
                  <img
                    src={style.imageUrl}
                    alt={style.title}
                    className="w-full h-full object-cover rounded-2xl shadow-2xl ring-1 ring-black/10"
                    onError={(e) => (e.target.src = 'https://placehold.co/350x450/cccccc/333333?text=Image+Error')}
                  />
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center p-3 rounded-b-2xl">
                    <h3 className="font-semibold text-lg">{style.title}</h3>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <footer className="relative z-10 mt-auto px-8 sm:px-16 md:px-24 pb-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-white/30 bg-white/50 backdrop-blur-md px-5 py-3 text-sm text-gray-700">
          © {year} Toonify. All rights reserved.
        </div>
      </footer>
    </div>
  )
}


