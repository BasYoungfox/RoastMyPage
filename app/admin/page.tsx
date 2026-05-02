'use client'

import { useState } from 'react'

interface RoastResult {
  overallScore: number
  grade: string
  roast: string
  categories: { name: string; score: number; feedback: string }[]
  fixes: string[]
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [url, setUrl] = useState('')
  const [issueNumber, setIssueNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<RoastResult | null>(null)
  const [sent, setSent] = useState<number | null>(null)
  const [error, setError] = useState('')

  const call = async (preview: boolean) => {
    setLoading(true)
    setError('')
    setSent(null)
    try {
      const res = await fetch('/api/admin/send-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, password, issueNumber, preview }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (preview) setPreview(data.roast)
      else setSent(data.sent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="bg-[#fffdf7] border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] p-10 w-full max-w-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">RoastThisPage</p>
          <h1 className="text-xl font-black text-stone-800 mb-6">Admin Access</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setAuthed(true)}
            className="w-full border-0 border-b-2 border-stone-300 bg-transparent text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-600 py-2 text-sm mb-6"
            autoFocus
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full bg-stone-800 hover:bg-stone-700 text-amber-50 text-xs font-bold tracking-widest uppercase py-3 transition-colors"
          >
            Enter →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-[#fffdf7] border-2 border-stone-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">

          {/* Header */}
          <div className="border-b-2 border-stone-300 px-8 py-5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">Admin</p>
            <h1 className="text-xl font-black text-stone-800">Send Weekly Teardown</h1>
          </div>

          {/* Form */}
          <div className="px-8 py-6 border-b border-stone-200 space-y-5">
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-stone-400 block mb-2">
                Page to Roast (URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full border-0 border-b-2 border-stone-300 bg-transparent text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-600 py-1.5 text-sm font-mono transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-stone-400 block mb-2">
                Issue Number
              </label>
              <input
                type="number"
                value={issueNumber}
                onChange={(e) => setIssueNumber(Number(e.target.value))}
                min={1}
                className="w-32 border-0 border-b-2 border-stone-300 bg-transparent text-stone-800 focus:outline-none focus:border-stone-600 py-1.5 text-sm font-mono transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-8 py-4 border-b border-stone-200">
              <p className="text-red-600 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* Success */}
          {sent !== null && (
            <div className="px-8 py-4 border-b border-stone-200 bg-emerald-50">
              <p className="text-emerald-700 text-sm font-semibold">✓ Sent to {sent} subscriber{sent !== 1 ? 's' : ''}.</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="px-8 py-6 border-b border-stone-200 space-y-4">
              <p className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Preview</p>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black" style={{ fontFamily: 'Georgia, serif', color: preview.grade === 'F' ? '#dc2626' : preview.grade === 'A' ? '#059669' : '#ca8a04' }}>
                  {preview.grade}
                </span>
                <span className="text-3xl font-black text-stone-800">{preview.overallScore}<span className="text-base text-stone-400 font-normal">/100</span></span>
              </div>
              <p className="text-stone-500 text-sm italic border-l-4 border-red-300 pl-4">"{preview.roast}"</p>
              <div className="space-y-2">
                {preview.categories.map((c) => (
                  <div key={c.name} className="flex gap-3 text-sm">
                    <span className="text-stone-400 w-36 shrink-0">{c.name}</span>
                    <span className="text-stone-600 font-mono">{c.score}/10</span>
                    <span className="text-stone-400 italic text-xs">{c.feedback}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-8 py-5 flex gap-3">
            <button
              onClick={() => call(true)}
              disabled={loading || !url.trim()}
              className="border-2 border-stone-300 hover:border-stone-500 text-stone-600 hover:text-stone-800 text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Preview Roast'}
            </button>
            <button
              onClick={() => call(false)}
              disabled={loading || !url.trim()}
              className="bg-stone-800 hover:bg-stone-700 text-amber-50 text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send to All Subscribers →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
