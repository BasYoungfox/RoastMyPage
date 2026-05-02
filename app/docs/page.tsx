import Link from 'next/link'

const ENDPOINT = 'https://RoastThisPage.vercel.app/api/v1/roast'

const curlExample = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://yoursite.com"}'`

const jsExample = `const res = await fetch('${ENDPOINT}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://yoursite.com' }),
})

const roast = await res.json()
console.log(roast.overallScore) // e.g. 62
console.log(roast.roast)        // the brutal quote`

const pythonExample = `import requests

response = requests.post(
    '${ENDPOINT}',
    json={'url': 'https://yoursite.com'},
)

roast = response.json()
print(roast['overallScore'])  # e.g. 62
print(roast['roast'])         # the brutal quote`

const responseExample = `{
  "url": "https://yoursite.com",
  "overallScore": 62,
  "grade": "C",
  "roast": "This page has the energy of a LinkedIn post ...",
  "categories": [
    { "name": "Headline",         "score": 5, "feedback": "..." },
    { "name": "Value Proposition","score": 7, "feedback": "..." },
    { "name": "Call-to-Action",   "score": 6, "feedback": "..." },
    { "name": "Social Proof",     "score": 4, "feedback": "..." },
    { "name": "Copy Quality",     "score": 6, "feedback": "..." }
  ],
  "fixes": [
    "Rewrite your headline to focus on the outcome, not the feature.",
    "Add at least one testimonial above the fold.",
    "Change your CTA from 'Submit' to something action-oriented."
  ]
}`

function Code({ children, lang = '' }: { children: string; lang?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-stone-300">
      {lang && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 border-b border-stone-700">
          <span className="text-xs text-stone-400 font-mono">{lang}</span>
        </div>
      )}
      <pre className="bg-stone-900 p-5 overflow-x-auto text-sm leading-relaxed">
        <code className="text-amber-100 font-mono">{children}</code>
      </pre>
    </div>
  )
}

function Badge({ children, color = 'zinc' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    zinc: 'bg-stone-200 text-zinc-400 border-stone-400',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  return (
    <span className={`inline-flex items-center border rounded px-2 py-0.5 text-xs font-mono font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5 py-10 border-b border-stone-200 last:border-0">
      <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
      {children}
    </section>
  )
}

function Field({ name, type, required, description }: { name: string; type: string; required?: boolean; description: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b border-stone-200 last:border-0">
      <div className="flex items-center gap-2 sm:w-48 shrink-0">
        <code className="text-sm text-stone-800 font-mono">{name}</code>
        {required && <Badge color="orange">required</Badge>}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <Badge>{type}</Badge>
        <p className="text-stone-500 text-sm">{description}</p>
      </div>
    </div>
  )
}

export default function Docs() {
  const nav = [
    { href: '#overview', label: 'Overview' },
    { href: '#endpoint', label: 'Endpoint' },
    { href: '#request', label: 'Request' },
    { href: '#response', label: 'Response' },
    { href: '#examples', label: 'Examples' },
    { href: '#errors', label: 'Errors' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-stone-800">

      {/* Header */}
      <header className="border-b-2 border-stone-300 sticky top-0 bg-[#fffdf7] z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold tracking-tight text-stone-800">
              RoastThisPage
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-400 text-sm">API Reference</span>
          </div>
          <Link
            href="/"
            className="text-xs text-stone-500 hover:text-stone-800 transition-colors border-2 border-stone-300 hover:border-stone-500 px-3 py-1.5 font-medium uppercase tracking-wide"
          >
            Try the app
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-12">

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">On this page</p>
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-sm text-stone-400 hover:text-stone-800 transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* Page title */}
          <div className="mb-2">
            <p className="text-xs text-stone-500 uppercase tracking-widest font-medium mb-3">API Reference</p>
            <h1 className="text-3xl font-black tracking-tight mb-3">RoastThisPage API</h1>
            <p className="text-stone-500 text-base leading-relaxed max-w-lg">
              Programmatically roast any landing page and get structured scores, feedback, and fixes — straight from your codebase.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-5 mb-2">
            <Badge color="green">v1</Badge>
            <Badge color="blue">REST</Badge>
            <Badge>JSON</Badge>
          </div>

          <Section id="overview" title="Overview">
            <p className="text-stone-500 text-sm leading-relaxed">
              The API exposes a single endpoint. POST a URL, get back an AI-generated roast with an overall score, per-category scores, and actionable fixes. No API key required — free and open.
            </p>
            <div className="flex items-center gap-3 bg-stone-100/60 border border-stone-300 rounded-xl px-4 py-3">
              <Badge color="orange">POST</Badge>
              <code className="text-sm text-stone-700 font-mono">/api/v1/roast</code>
            </div>
          </Section>


          <Section id="endpoint" title="Endpoint">
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-300 bg-stone-100/40">
                <Badge color="orange">POST</Badge>
                <code className="text-sm text-stone-800 font-mono">{ENDPOINT}</code>
              </div>
              <div className="px-5 py-4 text-stone-500 text-sm">
                Fetches and analyzes a landing page. Returns a roast with scores, feedback, and top fixes.
              </div>
            </div>
          </Section>

          <Section id="request" title="Request body">
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <Field name="url" type="string" required description="The full URL of the landing page to roast. Must include the protocol (https://)." />
            </div>
            <Code lang="json">{`{ "url": "https://yoursite.com" }`}</Code>
          </Section>

          <Section id="response" title="Response">
            <p className="text-stone-500 text-sm leading-relaxed">
              A successful response returns <code className="text-stone-700 font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">200 OK</code> with the following fields:
            </p>
            <div className="border border-stone-300 rounded-xl overflow-hidden divide-y divide-zinc-900">
              <Field name="url" type="string" description="The URL that was roasted." />
              <Field name="overallScore" type="number" description="Overall score from 0–100." />
              <Field name="grade" type="string" description="Letter grade: A, B, C, D, or F." />
              <Field name="roast" type="string" description="A brutal 2–3 sentence overall impression." />
              <Field name="categories" type="array" description="Five scored categories: Headline, Value Proposition, Call-to-Action, Social Proof, Copy Quality. Each has name, score (0–10), and feedback." />
              <Field name="fixes" type="array" description="Three specific, actionable fixes." />
            </div>
            <Code lang="json">{responseExample}</Code>
          </Section>

          <Section id="examples" title="Examples">
            <div className="space-y-4">
              <Code lang="curl">{curlExample}</Code>
              <Code lang="javascript">{jsExample}</Code>
              <Code lang="python">{pythonExample}</Code>
            </div>
          </Section>

          <Section id="errors" title="Errors">
            <p className="text-stone-500 text-sm leading-relaxed mb-4">
              All errors return a JSON object with an <code className="text-stone-700 font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">error</code> field describing the problem.
            </p>
            <div className="border border-stone-300 rounded-xl overflow-hidden divide-y divide-zinc-900">
              {[
                { code: '400', label: 'Bad Request', desc: 'Missing or invalid url field, or the page could not be fetched.' },
                { code: '408', label: 'Request Timeout', desc: 'The target page took too long to load.' },
                { code: '422', label: 'Unprocessable', desc: "The page exists but doesn't have enough content to analyze." },
                { code: '500', label: 'Server Error', desc: 'Something went wrong on our end. Try again.' },
              ].map((e) => (
                <div key={e.code} className="flex items-start gap-4 px-5 py-3.5">
                  <code className="text-sm font-mono text-stone-700 w-10 shrink-0 pt-0.5">{e.code}</code>
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-0.5">{e.label}</p>
                    <p className="text-stone-500 text-sm">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Code lang="json">{`{ "error": "Couldn't fetch that URL. Make sure it's publicly accessible." }`}</Code>
          </Section>

        </main>
      </div>
    </div>
  )
}
