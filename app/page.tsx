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

function scoreColor(score: number) {
  if (score >= 7) return 'text-emerald-400'
  if (score >= 5) return 'text-yellow-400'
  if (score >= 3) return 'text-orange-400'
  return 'text-red-400'
}

function barColor(score: number) {
  if (score >= 7) return 'bg-emerald-400'
  if (score >= 5) return 'bg-yellow-400'
  if (score >= 3) return 'bg-orange-400'
  return 'bg-red-500'
}

function overallGradient(score: number) {
  if (score >= 70) return 'from-emerald-400 to-green-500'
  if (score >= 50) return 'from-yellow-400 to-orange-400'
  return 'from-orange-400 to-red-500'
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')

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

  const shareOnTwitter = () => {
    if (!result) return
    const shortRoast = result.roast.length > 120 ? result.roast.slice(0, 117) + '...' : result.roast
    const emoji = result.grade === 'F' ? '💀' : result.overallScore >= 70 ? '🔥' : '😬'
    const text = `I got my landing page roasted by AI — scored ${result.overallScore}/100 ${emoji}\n\n"${shortRoast}"\n\nRoast yours free → roastmypage.com`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, rgba(249,115,22,0.12) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <header className="relative z-10 max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🔥</span>
          <span className="font-semibold text-sm tracking-tight">RoastMyPage</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="text-xs text-zinc-500 hover:text-white transition-colors">
            API
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Free &amp; unlimited
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-32">

        {!result && !loading && (
          <>
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 border border-zinc-800 rounded-full px-3.5 py-1 text-zinc-400 text-xs font-medium mb-8 bg-zinc-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                AI-powered landing page critic
              </div>

              <h1 className="text-[3.5rem] font-black tracking-tight leading-[1.05] mb-5">
                Your landing page<br />
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 bg-clip-text text-transparent">
                  deserves a roast.
                </span>
              </h1>

              <p className="text-zinc-500 text-base max-w-sm mx-auto leading-relaxed">
                Paste your URL. Get a brutal, honest breakdown of your headline, copy, CTA, and conversion potential.
              </p>
            </div>

            {/* Input */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-1.5 flex gap-2 focus-within:border-zinc-600 transition-colors mb-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRoast()}
                placeholder="https://yoursite.com"
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={handleRoast}
                disabled={!url.trim()}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-all text-sm whitespace-nowrap"
              >
                Roast it 🔥
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mt-2">{error}</p>
            )}

            {/* Example scores */}
            <div className="mt-20">
              <p className="text-center text-zinc-700 text-xs uppercase tracking-widest mb-5 font-medium">Sample results</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { score: 22, label: '"Revolutionary AI platform"', grade: 'F' },
                  { score: 58, label: 'Indie side project', grade: 'C' },
                  { score: 81, label: 'YC-backed startup', grade: 'B' },
                ].map((ex) => (
                  <div key={ex.label} className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors">
                    <div className={`text-2xl font-black bg-gradient-to-r ${overallGradient(ex.score)} bg-clip-text text-transparent`}>
                      {ex.score}
                    </div>
                    <div className="text-zinc-700 text-xs mt-0.5">/100 · {ex.grade}</div>
                    <div className="text-zinc-500 text-xs mt-2 leading-tight">{ex.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-32">
            <div className="text-5xl mb-5 animate-bounce inline-block">🔥</div>
            <p className="text-white font-semibold text-lg mb-1">Roasting your page...</p>
            <p className="text-zinc-600 text-sm">Usually takes 10–15 seconds</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4">

            {/* Score hero card */}
            <div className="border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-8 text-center border-b border-zinc-800">
                <p className="text-zinc-600 text-xs mb-6 truncate">{result.url}</p>
                <div className={`text-[6rem] font-black leading-none bg-gradient-to-b ${overallGradient(result.overallScore)} bg-clip-text text-transparent mb-2`}>
                  {result.overallScore}
                </div>
                <div className="text-zinc-600 text-sm mb-1">out of 100</div>
                <div className="inline-flex items-center gap-2 border border-zinc-800 rounded-full px-3 py-1 text-zinc-400 text-xs mt-3">
                  Grade: <span className="font-bold text-white">{result.grade}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 text-sm leading-relaxed italic">
                  "{result.roast}"
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="border border-zinc-800 rounded-2xl p-6">
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-5">Breakdown</p>
              <div className="space-y-5">
                {result.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-zinc-300">{cat.name}</span>
                      <span className={`text-xs font-bold tabular-nums ${scoreColor(cat.score)}`}>
                        {cat.score}/10
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full mb-2.5">
                      <div
                        className={`h-1 rounded-full ${barColor(cat.score)} transition-all`}
                        style={{ width: `${cat.score * 10}%` }}
                      />
                    </div>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cat.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixes */}
            <div className="border border-zinc-800 rounded-2xl p-6">
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-5">Top fixes</p>
              <div className="space-y-4">
                {result.fixes.map((fix, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-zinc-400 text-sm leading-relaxed">{fix}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={shareOnTwitter}
                className="flex-1 border border-zinc-800 hover:border-zinc-600 rounded-xl py-3 px-4 text-zinc-300 hover:text-white font-medium transition-all flex items-center justify-center gap-2 text-sm bg-zinc-900/50 hover:bg-zinc-900"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>
              <button
                onClick={() => { setResult(null); setUrl('') }}
                className="border border-zinc-800 hover:border-zinc-600 rounded-xl py-3 px-5 text-zinc-500 hover:text-white font-medium transition-all text-sm bg-zinc-900/50 hover:bg-zinc-900"
              >
                Roast another
              </button>
            </div>

          </div>
        )}

        {/* Error on result page */}
        {error && result === null && !loading && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}

      </main>

      <footer className="relative z-10 border-t border-zinc-900 max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-zinc-700 text-xs">RoastMyPage</span>
        <span className="text-zinc-700 text-xs">Powered by Groq</span>
      </footer>

    </div>
  )
}
