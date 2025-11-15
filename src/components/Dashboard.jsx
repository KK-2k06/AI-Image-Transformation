import React, { useState, useRef } from 'react'
import { stylesData } from '../data/stylesData.js'
import dashboardBg from '../bgimages/dashboard.png'

export default function Dashboard({ user, onNavigate }) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Guest'
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [outputImage, setOutputImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const fileInputRef = useRef(null)

  // 🔗 Replace this with your backend's ngrok URL
  const BACKEND_URL = "http://127.0.0.1:3001"

  // Helper: ensure base64 has data URI prefix (works with raw base64 or full data URI)
  const cleanBase64 = (b64) => {
    if (!b64) return ''
    if (typeof b64 !== 'string') return ''
    if (b64.trim().startsWith('data:')) return b64
    return `data:image/png;base64,${b64}`
  }

  const handleStyleSelect = (style) => {
    setSelectedStyle(style)
    setUploadedImage(null)
    setOutputImage(null)
    setErrorMessage('')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
        setOutputImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // 🧠 Map style titles to backend endpoints
  const mapStyleToEndpoint = (title) => {
    switch (title.toLowerCase()) {
      case 'pixar': return 'pixar'
      case 'comics': return 'comic'
      case 'studio ghibli': return 'ghibli'
      case 'oil painting': return 'oil'
      case 'pencil sketch': return 'sketch'
      case 'cartoon': return 'cartoon'
      default: return 'pixar'
    }
  }

  const handleProcessImage = async () => {
    if (!uploadedImage || !selectedStyle) return
    setIsProcessing(true)
    setErrorMessage('')
    setOutputImage(null)

    try {
      const endpoint = mapStyleToEndpoint(selectedStyle.title)
      const formData = new FormData()
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      formData.append('image', blob, 'upload.png')
      formData.append('user_id', user.id) // Add user_id for history

      const res = await fetch(`${BACKEND_URL}/api/style/${endpoint}`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok && data.image) {
        // support both raw base64 and data URI from backend
        const imageUrl = data.image.startsWith('data:image')
          ? data.image
          : `data:image/png;base64,${data.image}`
        setOutputImage(imageUrl)
      } else {
        setErrorMessage(data.error || 'Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Error connecting to backend. Try again.')
    } finally {
      setIsProcessing(false)
    }
  }


const fetchHistory = async () => {
  setLoadingHistory(true)
  try {
    console.log('🔍 Fetching from:', `${BACKEND_URL}/api/history/${user.id}`)
    const res = await fetch(`${BACKEND_URL}/api/history/${user.id}`, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'  // ✅ Bypass ngrok warning page
      }
    })
    
    console.log('📡 Response status:', res.status)
    console.log('📡 Response headers:', res.headers.get('content-type'))
    
    // Check if response is actually JSON
    const text = await res.text()
    console.log('📄 Raw response (first 200 chars):', text.substring(0, 200))
    
    const data = JSON.parse(text)
    console.log('📦 Parsed data:', data)
    console.log('📦 History array:', data.history)
    
    if (res.ok) {
      // normalize base64 to always be a valid data URI
      const hist = (data.history || []).map(item => ({
        ...item,
        transformed_image: cleanBase64(item.transformed_image),
        original_image: cleanBase64(item.original_image)
      }))
      console.log('✅ Processed history:', hist)
      setHistory(hist)
    } else {
      console.error('❌ Failed to fetch history', data)
    }
  } catch (err) {
    console.error('💥 Error fetching history:', err)
  } finally {
    setLoadingHistory(false)
  }
}

  const handleShowHistory = () => {
    setSelectedStyle(null)
    setUploadedImage(null)
    setOutputImage(null)
    setShowHistory(true)
    fetchHistory()
  }

  const handleBackFromHistory = () => {
    setShowHistory(false)
  }

  const handleDeleteHistory = async (historyId) => {
    try {
      await fetch(`${BACKEND_URL}/api/history/${historyId}`, {
        method: 'DELETE'
      })
      fetchHistory() // Refresh history
    } catch (err) {
      console.error('Error deleting history:', err)
    }
  }

  const handleLogout = () => {
    setSelectedStyle(null)
    setUploadedImage(null)
    setOutputImage(null)
    onNavigate('landing')
  }

  const handleReset = () => {
    setSelectedStyle(null)
    setUploadedImage(null)
    setOutputImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="relative min-h-screen">
      {/* Fixed Background - stays static while content scrolls */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.5
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.75)_60%,rgba(255,255,255,1)_100%)]" />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/30 backdrop-blur-sm shadow-md border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-24 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                AI Image Transformation
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {displayName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShowHistory}
                className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-white/90 rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
              >
                History
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-24 py-8 pt-28">
        {/* History Page */}
        {showHistory ? (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your History</h2>
                <p className="text-gray-600">View and download your previously generated images</p>
              </div>
              <button
                onClick={handleBackFromHistory}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white/70 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg hover:bg-white/90 transition-all duration-200"
              >
                ← Back to Dashboard
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg">
                <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-xl mb-2">No history yet</p>
                <p className="text-gray-500">Start creating amazing images to see them here!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.transformed_image}
                        alt={item.style}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        {item.style.toUpperCase()}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(item.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={item.transformed_image}
                          download={`ai-transform-${item.style}-${item.id}.png`}
                          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 text-center transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !selectedStyle && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Art Style</h2>
            <p className="text-gray-600 mb-6">Select a style to transform your image</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {stylesData.map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleStyleSelect(style)}
                  className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 cursor-pointer group"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img src={style.imageUrl} alt={style.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{style.title}</h3>
                      <p className="text-sm text-white/95">{style.description}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <button className="w-full px-4 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                      Select Style
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedStyle && (
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <img src={selectedStyle.imageUrl} alt={selectedStyle.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStyle.title}</h2>
                    <p className="text-gray-600 text-sm">{selectedStyle.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Choose Different Style
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/40">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Your Image</h3>
                
                {/* Hidden file input - always present */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
                  >
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 00-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-gray-600 mb-2">
                      <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-auto max-h-96 object-contain bg-gray-50" />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Change Image
                      </button>
                      <button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isProcessing ? 'Processing...' : 'Transform Image'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/40">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transformed Image</h3>

                {isProcessing ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Processing your image...</p>
                  </div>
                ) : errorMessage ? (
                  <div className="text-red-600 text-center font-medium">{errorMessage}</div>
                ) : outputImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200 bg-gray-50">
                      <img src={outputImage} alt="Transformed" className="w-full h-auto max-h-96 object-contain" />
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        {selectedStyle.title}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a href={outputImage} download={`dreamink-${selectedStyle.title.toLowerCase().replace(/\s+/g, '-')}.png`}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 text-center transition-all duration-200">
                        Download
                      </a>
                      <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        Try Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                    <p className="text-gray-600">Your transformed image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
