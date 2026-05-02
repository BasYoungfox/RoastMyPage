'use client'

import { useState } from 'react'
import Link from 'next/link'

interface RoastCategory {
  name: string
  score: number
  feedback: string
  suggestion: string
}

interface RoastFix {
  fix: string
  impact: 'High' | 'Medium' | 'Low'
  effort: 'Easy' | 'Medium' | 'Hard'
}

interface RoastResult {
  overallScore: number
  grade: string
  roast: string
  whatIsWorking: string
  quickWin: string
  missingElements: string[]
  categories: RoastCategory[]
  fixes: RoastFix[]
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

const STORAGE_ROASTED = 'rtp_roasted'
const STORAGE_UNLOCKED = 'rtp_unlocked'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [gated, setGated] = useState(false)

  const isUnlocked = () => {
    try { return localStorage.getItem(STORAGE_UNLOCKED) === '1' } catch { return false }
  }
  const hasRoasted = () => {
    try { return localStorage.getItem(STORAGE_ROASTED) === '1' } catch { return false }
  }
  const markRoasted = () => {
    try { localStorage.setItem(STORAGE_ROASTED, '1') } catch { /* noop */ }
  }
  const markUnlocked = () => {
    try { localStorage.setItem(STORAGE_UNLOCKED, '1') } catch { /* noop */ }
  }

  const handleRoast = async () => {
    if (!url.trim() || loading) return

    if (hasRoasted() && !isUnlocked()) {
      setGated(true)
      return
    }

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
      markRoasted()
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
      if (res.ok) {
        markUnlocked()
        setSubscribed(true)
        setGated(false)
      }
    } finally {
      setSubscribing(false)
    }
  }

  const shareOnTwitter = () => {
    if (!result) return

    let hostname = result.url
    try {
      hostname = new URL(result.url.startsWith('http') ? result.url : `https://${result.url}`).hostname.replace('www.', '')
    } catch { /* keep original */ }

    const roastSnippet = result.roast.length > 180 ? result.roast.slice(0, 177) + '...' : result.roast
    const gradeLine = result.grade === 'F'
      ? `got an F (${result.overallScore}/100). brutal.`
      : result.overallScore >= 75
      ? `scored ${result.overallScore}/100 (${result.grade}). not bad actually.`
      : `scored ${result.overallScore}/100 (${result.grade}).`

    const text = `asked AI to roast ${hostname}\n\n${gradeLine}\n\n"${roastSnippet}"`
    const siteUrl = window.location.origin

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(siteUrl)}`,
      '_blank'
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">

      {/* Header */}
      <header className="border-b-2 border-stone-300 bg-[#fffdf7]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight text-stone-800">RoastThisPage</span>
          <div className="flex items-center gap-3">
            <a href="https://github.com/BasYoungfox" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-800 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="https://x.com/frbasyoungfox" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-800 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <Link href="/docs" className="text-xs text-stone-500 hover:text-stone-800 transition-colors border-2 border-stone-300 hover:border-stone-500 px-3 py-1.5 font-medium uppercase tracking-wide">
              API Docs
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-10">

        {/* Input card — always centered, narrow */}
        <div className="max-w-3xl mx-auto">
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
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRoast()}
                  placeholder="https://yoursite.com"
                  className="w-full border-0 border-b-2 border-stone-400 bg-transparent text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-700 py-1 text-sm font-mono transition-colors"
                  autoFocus
                />
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

            {/* Gate */}
            {gated && !loading && (
              <div className="px-8 py-10 bg-stone-50 text-center">
                <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Free roast used</p>
                <p className="text-stone-700 font-semibold text-base mb-1">Want another roast?</p>
                <p className="text-stone-400 text-sm mb-6">Drop your email to unlock unlimited roasts.</p>
                <div className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    placeholder="your@email.com"
                    autoFocus
                    className="flex-1 border-0 border-b-2 border-stone-400 bg-transparent text-stone-700 placeholder-stone-300 focus:outline-none focus:border-stone-700 py-1.5 text-sm transition-colors"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing || !email.trim()}
                    className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-amber-50 text-xs font-bold tracking-widest uppercase px-4 py-2 transition-colors shrink-0"
                  >
                    {subscribing ? '...' : 'Unlock →'}
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !result && !gated && (
              <div className="px-8 py-16 text-center">
                <p className="text-stone-300 text-sm italic">Enter a URL above to receive your grade.</p>
              </div>
            )}

          </div>

          {!result && (
            <p className="text-center text-stone-400 text-xs mt-6">Free · Unlimited · Powered by Groq</p>
          )}
        </div>

        {/* Results — two-column wide layout */}
        {result && !loading && (
          <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

            {/* LEFT: Report card */}
            <div className="lg:col-span-3">
              <div className="bg-[#fffdf7] border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">

                {/* Overall grade */}
                <div className="border-b-2 border-stone-300 px-8 py-6 flex items-center gap-8">
                  <div className="text-center shrink-0">
                    <div
                      className={`text-8xl font-black leading-none ${letterGradeColor(result.grade)}`}
                      style={{ fontFamily: 'Georgia, serif', textShadow: result.grade === 'F' ? '2px 2px 0 rgba(220,38,38,0.2)' : 'none' }}
                    >
                      {result.grade}
                    </div>
                    <p className="text-stone-400 text-xs mt-1 tracking-widest uppercase">Final Grade</p>
                  </div>

                  <div className="w-px self-stretch bg-stone-200" />

                  <div className="flex-1 min-w-0">
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
                    <div className="border-l-4 border-red-400 pl-4 mb-3">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-red-400 mb-1">Teacher's Comments</p>
                      <p className="text-stone-600 text-sm italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                        "{result.roast}"
                      </p>
                    </div>
                    {result.whatIsWorking && (
                      <div className="border-l-4 border-emerald-400 pl-4">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-500 mb-1">What's Working</p>
                        <p className="text-stone-600 text-sm italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                          {result.whatIsWorking}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category breakdown */}
                <div>
                  <div className="px-8 py-3 border-b border-stone-200 flex items-center bg-stone-50">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 flex-1">Subject</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 w-16 text-center">Score</p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 w-12 text-center">Grade</p>
                  </div>
                  {result.categories.map((cat, i) => (
                    <div key={cat.name} className={`px-8 py-5 ${i < result.categories.length - 1 ? 'border-b border-stone-100' : ''}`}>
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-stone-700 flex-1">{cat.name}</span>
                        <span className="text-sm font-mono text-stone-500 w-16 text-center">{cat.score}/10</span>
                        <span
                          className={`text-sm font-black w-12 text-center ${scoreToLetterColor(cat.score)}`}
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {scoreToLetter(cat.score)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed italic mb-2">{cat.feedback}</p>
                      {cat.suggestion && (
                        <div className="flex gap-2 items-start">
                          <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-500 shrink-0 mt-0.5">→ Try this:</span>
                          <p className="text-xs text-emerald-700 leading-relaxed">{cat.suggestion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="border-t-2 border-stone-300 px-8 py-4 bg-stone-50 flex items-center justify-between">
                  <p className="text-stone-300 text-xs italic">Signed, Professor AI · Department of Brutal Honesty</p>
                  <p className="text-stone-400 text-xs">Free · Powered by Groq</p>
                </div>

              </div>
            </div>

            {/* RIGHT: Action sidebar */}
            <div className="lg:col-span-2 space-y-4">

              {/* Quick Win */}
              {result.quickWin && (
                <div className="bg-amber-50 border-2 border-amber-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-amber-800 bg-amber-200 border border-amber-300 px-2 py-0.5">Start Here</span>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600">Quick Win</p>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">{result.quickWin}</p>
                </div>
              )}

              {/* Missing Elements */}
              {result.missingElements?.length > 0 && (
                <div className="bg-[#fffdf7] border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] px-6 py-5">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-4">Missing Elements</p>
                  <div className="space-y-3">
                    {result.missingElements.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="shrink-0 mt-1 w-3.5 h-3.5 border-2 border-stone-300 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-red-400 block" />
                        </span>
                        <p className="text-sm text-stone-600 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fixes */}
              <div className="bg-[#fffdf7] border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] px-6 py-5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-4">Remedial Work Required</p>
                <div className="space-y-4">
                  {result.fixes.map((fix, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-red-500 shrink-0 mt-0.5 font-mono">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm text-stone-600 leading-relaxed mb-2">{fix.fix}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 border ${
                            fix.impact === 'High' ? 'border-red-300 text-red-600 bg-red-50' :
                            fix.impact === 'Medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                            'border-stone-300 text-stone-500 bg-stone-50'
                          }`}>{fix.impact} Impact</span>
                          <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 border ${
                            fix.effort === 'Easy' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                            fix.effort === 'Medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                            'border-red-300 text-red-600 bg-red-50'
                          }`}>{fix.effort}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email + Actions */}
              <div className="bg-stone-50 border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] px-6 py-5">
                {subscribed ? (
                  <p className="text-sm text-stone-500 italic text-center mb-4">✓ You're on the list.</p>
                ) : (
                  <>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">Stay in the loop</p>
                    <p className="text-sm text-stone-500 mb-4">Get notified when we post new teardowns and updates.</p>
                    <div className="flex gap-2 mb-4">
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
                        {subscribing ? '...' : 'Join'}
                      </button>
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={shareOnTwitter}
                    className="flex-1 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-amber-50 text-xs font-bold tracking-wide uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Post your grade
                  </button>
                  <button
                    onClick={() => { setResult(null); setUrl('') }}
                    className="flex-1 border-2 border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600 text-xs font-bold tracking-wide uppercase py-2.5 transition-colors"
                  >
                    New Student
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}
