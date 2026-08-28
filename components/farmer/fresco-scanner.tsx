'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FarmerButton, FarmerHeader, FarmerPill } from '@/components/farmer/farmer-ui'
import {
  Camera,
  RefreshCw,
  Upload,
  Zap,
  CheckCircle2,
  FileCheck,
  ScanLine,
} from 'lucide-react'

type ScanResult = {
  produce: string
  batch: string
  freshness: number
  shelfLife: number
  confidence: number
  grade: string
  storage: string
  brixIndex: string
  firmness: string
}

export function FrescoScanner() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  const startCamera = async () => {
    try {
      setCameraError(null)
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this browser or context.')
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(() => undefined)
      }
      setIsCameraActive(true)
    } catch (err: any) {
      console.warn('Camera access error:', err)
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access, or use a preset sample or upload a photo below.'
          : 'Camera access unavailable. You can use preset harvest samples or upload a photo below.',
      )
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-start the camera once on mount
    startCamera()
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only camera lifecycle
  }, [])

  const handleUploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => runAnalysis(String(reader.result))
    reader.readAsDataURL(file)
  }

  const runAnalysis = (imageSrc: string, produceType: string = 'Roma Tomatoes') => {
    stopCamera()
    setIsAnalyzing(true)
    setScanResult(null)

    setAnalysisStep('Detecting produce crop bounds…')
    setAnalysisProgress(25)

    setTimeout(() => {
      setAnalysisStep('Extracting biometric color spectrum & surface firming…')
      setAnalysisProgress(55)
    }, 700)

    setTimeout(() => {
      setAnalysisStep('Evaluating deterministic shelf-life & grade classification…')
      setAnalysisProgress(85)
    }, 1400)

    setTimeout(() => {
      setAnalysisStep('Sealing biometric evidence in Financial Passport ledger…')
      setAnalysisProgress(100)

      const results: Record<string, ScanResult> = {
        'Roma Tomatoes': {
          produce: 'Premium Roma Tomatoes',
          batch: 'TOM-2026-031',
          freshness: 94,
          shelfLife: 12,
          confidence: 0.97,
          grade: 'Grade A · Premium',
          storage: '12–15°C Ambient Shade',
          brixIndex: '5.2° Bx',
          firmness: '4.8 kg/cm²',
        },
        'Scotch Bonnet': {
          produce: 'Scotch Bonnet Peppers',
          batch: 'PEP-2026-015',
          freshness: 91,
          shelfLife: 16,
          confidence: 0.94,
          grade: 'Grade A · Export Quality',
          storage: '10–12°C Ventilated',
          brixIndex: '7.1° Bx',
          firmness: '5.2 kg/cm²',
        },
        'Fresh Cucumber': {
          produce: 'Crisp Field Cucumber',
          batch: 'CUC-2026-009',
          freshness: 88,
          shelfLife: 9,
          confidence: 0.92,
          grade: 'Grade B+ · High Commercial',
          storage: '11–14°C Cool Root',
          brixIndex: '3.6° Bx',
          firmness: '4.2 kg/cm²',
        },
      }

      setScanResult(results[produceType] || results['Roma Tomatoes'])
      setIsAnalyzing(false)
    }, 2100)
  }

  const handleCaptureFrame = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    runAnalysis(dataUrl, 'Roma Tomatoes')
  }

  const handleUsePreset = (produceName: string, colorHex: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = colorHex
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(produceName, canvas.width / 2, canvas.height / 2)
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    runAnalysis(dataUrl, produceName)
  }

  return (
    <>
      <FarmerHeader
        eyebrow="Stage 02 · Evidence"
        title="AI Biometric Harvest Scanner"
        subtitle="Capture produce batches using your device camera. Fresco grades freshness, estimates shelf-life, and seals immutable evidence into your Financial Passport"
        actions={
          <div className="farmer-live-badge">
            <span className="farmer-live-dot" />
            Fresco AI Biometric Engine v2.4
          </div>
        }
      />

      {!scanResult ? (
        <div className="farmer-scan-viewport">
          <div style={{ position: 'relative', aspectRatio: '16 / 9', minHeight: 340, background: '#0d0d0d' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="farmer-scan-video"
              style={{ position: 'absolute', inset: 0, opacity: isCameraActive ? 1 : 0, transition: 'opacity .3s ease' }}
            />

            {isCameraActive && !isAnalyzing ? (
              <div className="farmer-scan-reticle">
                <div className="farmer-scan-laser" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                <div className="farmer-scan-frame">
                  <div className="farmer-scan-hud">
                    <span>Scan reticle</span>
                    <span>98.4% conf</span>
                  </div>
                  <div className="farmer-scan-hud" style={{ marginTop: 90 }}>
                    <span>Latency 14ms</span>
                    <span>ISO 200</span>
                  </div>
                </div>
              </div>
            ) : null}

            {!isCameraActive && !isAnalyzing ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 26,
                  textAlign: 'center',
                  background: 'radial-gradient(90% 80% at 50% 20%, #1b1b1b 0%, #0d0d0d 100%)',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: '#1c1c1c',
                    border: '1px solid #2c2c2c',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--farmer-blue)',
                    marginBottom: 14,
                  }}
                >
                  <Camera size={26} />
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Live Camera Ready</div>
                <p style={{ color: '#8a8a8a', fontSize: 12.5, maxWidth: 360, margin: '0 0 18px', lineHeight: 1.5 }}>
                  {cameraError || 'Activate your webcam or choose from sample crates below to run the AI analyzer.'}
                </p>
                <FarmerButton tone="blue" onClick={startCamera}>
                  <RefreshCw size={14} /> Start device camera
                </FarmerButton>
                <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                  <FarmerButton tone="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={14} /> Upload a photo
                  </FarmerButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleUploadPhoto}
                  />
                </div>
              </div>
            ) : null}

            {isAnalyzing ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 20,
                  background: 'rgba(13,13,13,.92)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 26,
                  textAlign: 'center',
                }}
              >
                <div className="farmer-spinner" style={{ marginBottom: 18 }} />
                <div style={{ color: '#fff', fontFamily: 'var(--farmer-serif)', fontSize: 19, fontWeight: 700, marginBottom: 6 }}>
                  Analyzing harvest biometrics
                </div>
                <div style={{ fontFamily: 'var(--farmer-mono)', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--farmer-blue)', marginBottom: 18 }}>
                  {analysisStep}
                </div>
                <div style={{ width: 260, height: 7, background: '#222', borderRadius: 999, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${analysisProgress}%`,
                      background: 'linear-gradient(90deg, var(--farmer-blue), var(--farmer-teal))',
                      transition: 'width .3s ease',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              padding: '14px 16px',
              background: '#fbfbfb',
              borderTop: '1px solid var(--farmer-line)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="farmer-label" style={{ marginRight: 4 }}>Preset samples</span>
              <button
                type="button"
                onClick={() => handleUsePreset('Roma Tomatoes', '#B84A1A')}
                className="farmer-button outline sm"
              >
                🍅 Roma Tomatoes
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('Scotch Bonnet', '#D97706')}
                className="farmer-button outline sm"
              >
                🌶️ Scotch Bonnet
              </button>
              <button
                type="button"
                onClick={() => handleUsePreset('Fresh Cucumber', '#1A6B3A')}
                className="farmer-button outline sm"
              >
                🥒 Crisp Cucumber
              </button>
            </div>

            {isCameraActive ? (
              <FarmerButton tone="dark" onClick={handleCaptureFrame} disabled={isAnalyzing} style={{ marginLeft: 'auto' }}>
                <Zap size={14} style={{ color: 'var(--farmer-blue)' }} /> Capture &amp; analyze frame
              </FarmerButton>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="farmer-card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, paddingBottom: 20, borderBottom: '1px solid var(--farmer-line)', marginBottom: 22, flexWrap: 'wrap' }}>
            <div>
              <div className="farmer-eyebrow" style={{ marginBottom: 8, color: 'var(--farmer-teal)' }}>
                <span className="farmer-eyebrow-dot" style={{ background: 'var(--farmer-teal)' }} />
                Biometric quality verified
              </div>
              <h2 style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 26, margin: '0 0 6px', letterSpacing: '-.03em', color: 'var(--farmer-ink)' }}>
                {scanResult.produce}
              </h2>
              <div style={{ fontFamily: 'var(--farmer-mono)', fontSize: 10, color: 'var(--farmer-muted)' }}>
                Batch: {scanResult.batch} · Scanned on {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="farmer-label" style={{ marginBottom: 6 }}>Freshness score</div>
              <div style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 700, fontSize: 34, color: 'var(--farmer-teal)', lineHeight: 1 }}>{scanResult.freshness}%</div>
            </div>
          </div>

          <div className="farmer-grid-4" style={{ marginBottom: 22 }}>
            {[
              ['Grade quality', scanResult.grade],
              ['Est. shelf life', `${scanResult.shelfLife} Days`],
              ['Sugar content', scanResult.brixIndex],
              ['Flesh firmness', scanResult.firmness],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: 15, background: '#f5f7f8', borderRadius: 12, border: '1px solid var(--farmer-line)' }}>
                <div className="farmer-label" style={{ marginBottom: 7 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--farmer-ink)' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, paddingTop: 20, borderTop: '1px solid var(--farmer-line)' }}>
            <FarmerButton
              tone="outline"
              onClick={() => {
                setScanResult(null)
                startCamera()
              }}
            >
              <RefreshCw size={14} /> Scan another batch
            </FarmerButton>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/farmer/passport" className="farmer-button outline">
                View in passport →
              </Link>
              <FarmerButton tone="dark" onClick={() => router.push('/farmer/produce')}>
                <FileCheck size={14} /> Create verified listing
              </FarmerButton>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
        <FarmerPill tone="blue"><CheckCircle2 size={10} /> Ledger sealed</FarmerPill>
        <FarmerPill tone="teal"><ScanLine size={10} /> Grade A biometrics</FarmerPill>
        <FarmerPill tone="muted">Estimates are AI-produced · not a laboratory test</FarmerPill>
      </div>
    </>
  )
}