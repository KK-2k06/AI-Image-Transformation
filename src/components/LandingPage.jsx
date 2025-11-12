import React, { useEffect, useState, useRef } from 'react'
import { stylesData } from '../data/stylesData.js'
import landingBg from '../bgimages/landingpage.png'

export default function LandingPage({ onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleSections, setVisibleSections] = useState({})
  const sectionRefs = useRef({})

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stylesData.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.dataset.section]: true
            }))
          }
        })
      },
      { threshold: 0.1 }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const currentStyle = stylesData[currentIndex]
  const year = new Date().getFullYear()

  return (
    <div className="relative min-h-screen text-gray-900">
      {/* Fixed Background - stays static while content scrolls */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${landingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.5
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.75)_60%,rgba(255,255,255,1)_100%)]" />
      </div>

      {/* Full-width Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/30 backdrop-blur-sm shadow-md border-b border-gray-200/30">
        <div className="w-full px-6 sm:px-8 md:px-12 lg:px-24">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Contact
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('signIn')}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white/90 rounded-lg shadow-sm hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signUp')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Scrollable Content */}
      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 sm:px-12 md:px-24 py-8">
          <div className="w-full max-w-7xl grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm leading-tight">
                  AI-Based Image Transformation Tool for Cartoon Effect Generation
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => onNavigate('signUp')}
                  className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Start Creating
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white/90 rounded-xl shadow-md hover:shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative h-[500px] md:h-[550px] w-full max-w-lg mx-auto flex items-center justify-center perspective-1000">
              {/* 3D Carousel Container */}
              <div 
                className="relative w-64 h-[400px] md:w-72 md:h-[450px]"
                style={{
                  perspective: '1200px',
                  perspectiveOrigin: 'center center'
                }}
              >
                {stylesData.map((style, index) => {
                  const offset = (index - currentIndex + stylesData.length) % stylesData.length
                  const totalStyles = stylesData.length
                  
                  let scale, opacity, zIndex, brightness, translateX, translateZ, rotateY
                  
                  if (offset === 0) {
                    // Current card - front and center
                    scale = 1
                    opacity = 1
                    zIndex = totalStyles + 5
                    brightness = 1.2
                    translateX = 0
                    translateZ = 0
                    rotateY = 0
                  } else if (offset === 1) {
                    // Right side card
                    scale = 0.75
                    opacity = 0.85
                    zIndex = totalStyles - 1
                    brightness = 0.85
                    translateX = 100
                    translateZ = -70
                    rotateY = -25
                  } else if (offset === totalStyles - 1) {
                    // Left side card
                    scale = 0.75
                    opacity = 0.85
                    zIndex = totalStyles - 1
                    brightness = 0.85
                    translateX = -100
                    translateZ = -70
                    rotateY = 25
                  } else if (offset === 2) {
                    // Far right
                    scale = 0.6
                    opacity = 0.4
                    zIndex = totalStyles - 2
                    brightness = 0.6
                    translateX = 150
                    translateZ = -130
                    rotateY = -40
                  } else if (offset === totalStyles - 2) {
                    // Far left
                    scale = 0.6
                    opacity = 0.4
                    zIndex = totalStyles - 2
                    brightness = 0.6
                    translateX = -150
                    translateZ = -130
                    rotateY = 40
                  } else {
                    // Hidden cards
                    scale = 0.4
                    opacity = 0
                    zIndex = 0
                    brightness = 0.4
                    translateX = offset > totalStyles / 2 ? 250 : -250
                    translateZ = -200
                    rotateY = offset > totalStyles / 2 ? -60 : 60
                  }
                  
                  return (
                    <div
                      key={style.id}
                      className="absolute top-1/2 left-1/2 origin-center"
                      style={{
                        transform: `translate(-50%, -50%) translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                        opacity,
                        zIndex,
                        filter: `brightness(${brightness})`,
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                        transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'transform, opacity'
                      }}
                    >
                      <div 
                        className={`relative w-64 h-[400px] md:w-72 md:h-[450px] ${offset === 0 ? 'animate-float' : ''}`}
                        style={{
                          transform: 'translateZ(0)',
                        }}
                      >
                        {/* Main card */}
                        <div 
                          className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/20 transition-all duration-1000"
                          style={{
                            boxShadow: offset === 0 
                              ? '0 20px 40px -10px rgba(0, 0, 0, 0.3)' 
                              : '0 15px 35px -10px rgba(0, 0, 0, 0.4)',
                            transform: 'translateZ(0)'
                          }}
                        >
                          <img
                            src={style.imageUrl}
                            alt={style.title}
                            className="w-full h-full object-cover transition-transform duration-1000"
                            style={{
                              transform: offset === 0 ? 'scale(1.05)' : 'scale(1)',
                            }}
                            onError={(e) => (e.target.src = 'https://placehold.co/350x450/cccccc/333333?text=Image+Error')}
                          />
                          
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                          
                          {/* Title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
                            <div className="relative">
                              <h3 
                                className="font-black text-xl md:text-2xl text-white text-center transition-transform duration-1000"
                                style={{
                                  textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 4px 15px rgba(0, 0, 0, 0.9)',
                                  transform: offset === 0 ? 'scale(1.1) translateY(-3px)' : 'scale(1)',
                                  letterSpacing: '0.05em'
                                }}
                              >
                                {style.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Navigation dots */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2 mt-4">
                {stylesData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg'
                        : 'bg-gray-400/50 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 sm:px-12 md:px-24">
          <div className="w-full max-w-7xl mx-auto">
            <div 
              ref={(el) => (sectionRefs.current['features-title'] = el)}
              data-section="features-title"
              className={`text-center mb-16 transition-all duration-1000 ${
                visibleSections['features-title'] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Transform your photos with AI-powered artistry</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div 
                ref={(el) => (sectionRefs.current['feature-1'] = el)}
                data-section="feature-1"
                className={`bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-700 hover:-translate-y-2 border border-gray-200/50 ${
                  visibleSections['feature-1'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600">Get stunning results in seconds with our advanced AI processing technology.</p>
              </div>
              <div 
                ref={(el) => (sectionRefs.current['feature-2'] = el)}
                data-section="feature-2"
                className={`bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-700 hover:-translate-y-2 border border-gray-200/50 ${
                  visibleSections['feature-2'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-rose-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Multiple Styles</h3>
                <p className="text-gray-600">Choose from a wide variety of artistic styles to match your vision.</p>
              </div>
              <div 
                ref={(el) => (sectionRefs.current['feature-3'] = el)}
                data-section="feature-3"
                className={`bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-700 hover:-translate-y-2 border border-gray-200/50 ${
                  visibleSections['feature-3'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600">Your images are processed securely and never stored without your permission.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Styles Showcase Section */}
        <section className="py-24 px-6 sm:px-12 md:px-24 bg-white/40 backdrop-blur-sm overflow-hidden">
          <div className="w-full mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Artistic Styles</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover the perfect style for your image</p>
            </div>
            <div className="flex overflow-x-auto gap-6 px-6"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {stylesData.map((style) => {
                // Define icons for each style
                const getStyleIcon = (title) => {
                  switch(title) {
                    case 'Pencil Sketch':
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )
                    case 'Oil Painting':
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      )
                    case 'Pixar':
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    case 'Studio Ghibli':
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )
                    case 'Comics':
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )
                    case 'Cartoon':
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )
                    default:
                      return (
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )
                  }
                }
                
                return (
                  <div key={style.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-6 text-center flex-shrink-0 w-64">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                      {getStyleIcon(style.title)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{style.title}</h3>
                    <p className="text-gray-600 text-sm">{style.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* About Company Section */}
        <section id="about" className="py-24 px-6 sm:px-12 md:px-24">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">About Us</h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                    AI-Based Image Transformation Tool for Cartoon Effect Generation is a project developed as part of the Infosys Springboard Virtual Internship 6.0. 
                    This application explores the capabilities of generative AI by transforming standard photographs into stylized cartoon and anime artwork.
                  </p>
                  <p>
                    The system utilizes advanced pre-trained models—specifically Stable Diffusion and AnimeGAN—to regenerate images with high-quality artistic effects, 
                    demonstrating the practical application of deep learning in digital media.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-rose-500/20 rounded-3xl p-12 backdrop-blur-md border border-white/50 shadow-2xl">
                <div className="space-y-6 text-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">AI-Powered Technology</h3>
                      <p className="text-gray-700">State-of-the-art neural networks trained on millions of artistic images</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Fast Processing</h3>
                      <p className="text-gray-700">Get results in seconds with our optimized cloud infrastructure</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">User-Focused</h3>
                      <p className="text-gray-700">Built with love for creators, by creators</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 sm:px-12 md:px-24">
          <div className="w-full max-w-5xl mx-auto text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 rounded-3xl p-12 md:p-16 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Images?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Experience the power of AI-driven image transformation and bring your creative visions to life.
            </p>
            <button
              onClick={() => onNavigate('signUp')}
              className="px-10 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all duration-200"
            >
              Get Started for Free
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer id="contact" className="relative z-10 w-full bg-gray-900 text-gray-300 mt-auto">
        <div className="w-full px-6 sm:px-12 md:px-24 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent mb-4">
              AI Image Transformation
            </h3>
            <p className="text-gray-400 mb-4">
              For inquiries, please contact us at: <a href="mailto:contact@aitransform.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">contact@aitransform.com</a>
            </p>
            <p className="text-gray-500 text-sm">
              © {year} Infosys Springboard Internship Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}