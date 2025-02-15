'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Importar los componentes usando dynamic import para evitar problemas de SSR
const FileUploadComponent = dynamic(() => import('@/components/FileUploadComponent'), {
  ssr: false
})
const StatusDisplay = dynamic(() => import('@/components/StatusDisplay'), {
  ssr: false
})
const ResultsDisplay = dynamic(() => import('@/components/ResultsDisplay'), {
  ssr: false
})
const ErrorDisplay = dynamic(() => import('@/components/ErrorDisplay'), {
  ssr: false
})

export default function Home() {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [xmlUrl, setXmlUrl] = useState('')
  const [srtUrl, setSrtUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const handleSuccess = (xmlUrl: string, srtUrl: string, audioUrl: string) => {
    setXmlUrl(xmlUrl)
    setSrtUrl(srtUrl)
    setAudioUrl(audioUrl)
    setError('')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setXmlUrl('')
    setSrtUrl('')
    setAudioUrl('')
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-4">
          Sound to XML Pro
        </h1>
        <p className="text-lg text-gray-400 font-light">
          Transform your audio into professional markers with AI-powered precision
        </p>
      </div>
      <div className="space-y-6">
        <FileUploadComponent
          onStatusChange={handleStatusChange}
          onError={handleError}
          onSuccess={handleSuccess}
        />
        
        <StatusDisplay status={status} />
        <ErrorDisplay error={error} />
        <ResultsDisplay xmlUrl={xmlUrl} srtUrl={srtUrl} audioUrl={audioUrl} />
      </div>
    </div>
  )
}
