'use client'

import { useState } from 'react'
import Link from 'next/link'

interface RoastCategory {
  name: string
  score: number
  feedback: string
}

interface RoastResult {
  overallScore: number
  grade: string
  roast: string
  categories: RoastCategory[]
  fixes: string[]
  url: string
}


function letterGradeColor(grade: string) {
  if (grade === 'A') return 'text-emerald-600'
  if (grade === 'B') return 'text-blue-600'
  if (grade === 'C') return 'text-yellow-600'
  if (grade === 'D') return 'text-orange-600'
  return 'text-red-600'
}

function scoreToLetter(score: number) {
  if (score >= 9) return 'A+'
  if (score >= 8) return 'A'
  if (score >= 7) return 'B'
  if (score >= 6) return 'C'
  if (score >= 4) return 'D'
  return 'F'
}

function scoreToLetterColor(score: number) {
  if (score >= 7) return 'text-emerald-600'
  if (score >= 5) return 'text-yellow-600'
  if (score >= 3) return 'text-orange-600'
  return 'text-red-600'
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const handleRoast = async () => {
    if (!url.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      const data = await res.json()
      setResult({ ...data, url: url.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!email.trim() || subscribing) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setSubscribed(true)
    } finally {
      setSubscribing(false)
    }
  }

  const shareOnTwitter = () => {
    if (!result) return
    const shortRoast = result.roast.length > 120 ? result.roast.slice(0, 117) + '...' : result.roast
    const emoji = result.grade === 'F' ? '💀' : result.overallScore >= 70 ? '🔥' : '😬'
    const text = `My landing page just got its report card back — ${result.overallScore}/100 (${result.grade}) ${emoji}\n\n"${shortRoast}"\n\nGet yours roasted free →`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">

      {/* Header */}
      <header className="border-b-2 border-stone-300 bg-[#fffdf7]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight text-stone-800">RoastThisPage</span>
          <Link href="/docs" className="text-xs text-stone-500 hover:text-stone-800 transition-colors border-2 border-stone-300 hover:border-stone-500 px-3 py-1.5 font-medium uppercase tracking-wide">
            API Docs
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">

        {/* Report card shell */}
        <div className="bg-[#fffdf7] border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">

          {/* Report card header */}
          <div className="border-b-2 border-stone-300 px-8 py-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 mb-1">
                Academic Performance Review
              </p>
              <h1 className="text-2xl font-black tracking-tight text-stone-800">
                Landing Page Report Card
              </h1>
              <p className="text-stone-400 text-xs mt-1">Issued by the Department of Brutal Honesty</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-stone-400 tracking-widest uppercase">Date</p>
              <p className="text-sm font-mono text-stone-600">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Student row */}
          <div className="border-b border-stone-200 px-8 py-4 flex items-end gap-8">
            <div className="flex-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-stone-400 block mb-1">
                Student (URL)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRoast()}
                  placeholder="https://yoursite.com"
                  className="flex-1 border-0 border-b-2 border-stone-400 bg-transparent text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-700 py-1 text-sm font-mono transition-colors"
                  autoFocus
                />
              </div>
            </div>
            <button
              onClick={handleRoast}
              disabled={loading || !url.trim()}
              className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-amber-50 text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-colors shrink-0"
            >
              {loading ? 'Grading...' : 'Submit for Grading →'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-8 py-4 border-b border-stone-200">
              <p className="text-red-600 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="px-8 py-16 text-center">
              <p className="text-stone-400 text-sm italic">Professor AI is reviewing your work...</p>
              <p className="text-stone-300 text-xs mt-2">This usually takes 10–15 seconds</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !result && (
            <div className="px-8 py-16 text-center">
              <p className="text-stone-300 text-sm italic">Enter a URL above to receive your grade.</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <>
              {/* Overall grade */}
              <div className="border-b-2 border-stone-300 px-8 py-6 flex items-center gap-8">
                <div className="text-center">
                  <div className={`text-8xl font-black leading-none ${letterGradeColor(result.grade)}`}
                    style={{ fontFamily: 'Georgia, serif', textShadow: result.grade === 'F' ? '2px 2px 0 rgba(220,38,38,0.2)' : 'none' }}>
                    {result.grade}
                  </div>
                  <p className="text-stone-400 text-xs mt-1 tracking-widest uppercase">Final Grade</p>
                </div>

                <div className="w-px self-stretch bg-stone-200" />

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-black text-stone-800">{result.overallScore}</span>
                    <span className="text-stone-400 text-lg">/100</span>
                  </div>
                  <div className="h-2 bg-stone-100 border border-stone-200 w-full mb-4">
                    <div
                      className={`h-full transition-all ${result.overallScore >= 70 ? 'bg-emerald-500' : result.overallScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${result.overallScore}%` }}
                    />
                  </div>
                  {/* Teacher's comment */}
                  <div className="border-l-4 border-red-400 pl-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-red-400 mb-1">Teacher's Comments</p>
                    <p className="text-stone-600 text-sm italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                      "{result.roast}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Category grades */}
              <div className="border-b-2 border-stone-300">
                <div className="px-8 py-3 border-b border-stone-200 flex items-center">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 flex-1">Subject</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 w-16 text-center">Score</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 w-12 text-center">Grade</p>
                </div>
                {result.categories.map((cat, i) => (
                  <div key={cat.name} className={`px-8 py-4 ${i < result.categories.length - 1 ? 'border-b border-stone-100' : ''}`}>
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-semibold text-stone-700 flex-1">{cat.name}</span>
                      <span className="text-sm font-mono text-stone-600 w-16 text-center">{cat.score}/10</span>
                      <span className={`text-sm font-black w-12 text-center ${scoreToLetterColor(cat.score)}`}
                        style={{ fontFamily: 'Georgia, serif' }}>
                        {scoreToLetter(cat.score)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed italic">{cat.feedback}</p>
                  </div>
                ))}
              </div>

              {/* Remedial work */}
              <div className="border-b-2 border-stone-300 px-8 py-6">
                <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-4">Remedial Work Required</p>
                <div className="space-y-3">
                  {result.fixes.map((fix, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-red-500 shrink-0 mt-0.5 font-mono">{i + 1}.</span>
                      <p className="text-sm text-stone-600 leading-relaxed">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email capture */}
              <div className="border-b-2 border-stone-300 px-8 py-6 bg-stone-50">
                {subscribed ? (
                  <p className="text-sm text-stone-500 italic text-center">
                    ✓ You're on the list. We'll be in touch.
                  </p>
                ) : (
                  <>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">
                      Stay in the loop
                    </p>
                    <p className="text-sm text-stone-500 mb-4">
                      Drop your email and get notified when we post new teardowns and updates.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                        placeholder="your@email.com"
                        className="flex-1 border-0 border-b-2 border-stone-300 bg-transparent text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-600 py-1.5 text-sm transition-colors"
                      />
                      <button
                        onClick={handleSubscribe}
                        disabled={subscribing || !email.trim()}
                        className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-amber-50 text-xs font-bold tracking-widest uppercase px-4 py-2 transition-colors shrink-0"
                      >
                        {subscribing ? 'Joining...' : 'Join Free'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-8 py-5 flex items-center justify-between">
                <p className="text-stone-300 text-xs italic">
                  Signed, Professor AI · Department of Brutal Honesty
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={shareOnTwitter}
                    className="border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-amber-50 text-xs font-bold tracking-wide uppercase px-4 py-2 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={() => { setResult(null); setUrl('') }}
                    className="border-2 border-stone-300 text-stone-400 hover:border-stone-400 hover:text-stone-600 text-xs font-bold tracking-wide uppercase px-4 py-2 transition-colors"
                  >
                    New Student
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Subtle footer note */}
        <p className="text-center text-stone-400 text-xs mt-6">
          Free · Unlimited · Powered by Groq
        </p>
      </main>
    </div>
  )
}
