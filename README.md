# 🔥 RoastThisPage

AI-powered landing page critic. Paste a URL, get a brutal honest breakdown of your headline, copy, CTA, and conversion potential — scored out of 100.

<<<<<<< HEAD
**Live:** [roastthispage.vercel.app](roastthispage.vercel.app)  
**API Docs:** [roastthispage.vercel.app/docs](https://roastthispage.vercel.app.app/docs)
=======
**Live:** [RoastThisPage.vercel.app](https://RoastThisPage.vercel.app)  
**API Docs:** [RoastThisPage.vercel.app/docs](https://RoastThisPage.vercel.app/docs)
>>>>>>> 0d81382 (Rebrand to RoastThisPage)

---

## What it does

1. User pastes a landing page URL
2. The server fetches the page via [Jina Reader](https://jina.ai) (handles JS-rendered SPAs)
3. The content is sent to **Llama 3.3 70B** via **Groq** for analysis
4. Returns a score (0–100), grade, roast quote, per-category breakdown, and 3 actionable fixes
5. User can share their result directly to X (Twitter)

There is also a free, open REST API at `/api/v1/roast` that anyone can call without a key.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI model | Llama 3.3 70B via Groq |
| Page fetching | Jina Reader (`r.jina.ai`) |
| Hosting | Vercel |

---

## Project structure

```
app/
  page.tsx                 # Main web UI (client component)
  layout.tsx               # Root layout + metadata
  globals.css              # Global styles
  docs/
    page.tsx               # API documentation page
  api/
    roast/
      route.ts             # Internal route used by the web UI (no auth)
    v1/
      roast/
        route.ts           # Public API endpoint (open, no key required)
lib/
  roast.ts                 # Shared logic — page fetching + Groq call
example.py                 # Python script demonstrating API usage
```

---

## Local setup

### Requirements

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Steps

```bash
git clone https://github.com/BasYoungfox/RoastThisPage.git
cd RoastThisPage
npm install
```

Create `.env.local` in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API

Free, open, no key required.

### Request

```http
POST https://RoastThisPage.vercel.app/api/v1/roast
Content-Type: application/json

{ "url": "https://yoursite.com" }
```

### Response

```json
{
  "url": "https://yoursite.com",
  "overallScore": 62,
  "grade": "C",
  "roast": "This page has the energy of a LinkedIn post written at 2am...",
  "categories": [
    { "name": "Headline",          "score": 5, "feedback": "..." },
    { "name": "Value Proposition", "score": 7, "feedback": "..." },
    { "name": "Call-to-Action",    "score": 6, "feedback": "..." },
    { "name": "Social Proof",      "score": 4, "feedback": "..." },
    { "name": "Copy Quality",      "score": 6, "feedback": "..." }
  ],
  "fixes": [
    "Rewrite your headline to focus on the outcome, not the feature.",
    "Add at least one testimonial above the fold.",
    "Change your CTA from 'Submit' to something action-oriented."
  ]
}
```

---

## Deployment

Deployed on Vercel. To deploy your own instance:

1. Fork the repo
2. Import into [Vercel](https://vercel.com)
3. Add environment variable: `GROQ_API_KEY`
4. Deploy

---

## Codebase notes for contributors

- **All AI logic lives in `lib/roast.ts`** — `fetchPageContent()` and `generateRoast()` are the two core functions. Both routes import from here, so changes apply everywhere.
- **Jina Reader** is used instead of raw `fetch()` because most modern landing pages are SPAs that return empty HTML without JavaScript execution. Jina renders the page server-side and returns clean text.
- **`response_format: { type: 'json_object' }`** is passed to Groq to guarantee valid JSON output and avoid markdown fences in the response.
- **The scoring prompt** includes explicit calibration guidelines (most pages should score 45–75) to stop the model from being too harsh or too lenient.
- **There is no database.** The app is fully stateless. If you need user accounts, API key management, or usage tracking, that infrastructure does not exist yet and would need to be added.
- The public API at `/api/v1/roast` is currently open with no rate limiting beyond what Groq enforces on the account level.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLM inference |
