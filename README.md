# SoloDesk — The Freelancer OS

> Built for AI Seekho 2026 — App Banao Category

---

## Stack

- **Frontend:** Next.js 14, Tailwind CSS
- **AI:** Groq (llama-3.3-70b-versatile)
- **Auth + DB:** Supabase
- **Deployment:** Google Cloud Run

---

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd solodesk
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a Supabase project at supabase.com
2. Go to SQL Editor
3. Run the entire contents of `supabase/schema.sql`

### 4. Get Groq API Key

1. Go to console.groq.com
2. Create API key
3. Add to `.env.local`

### 5. Run Locally

```bash
npm run dev
```

---

## Deploy to Google Cloud Run

### Prerequisites

```bash
# Install Google Cloud CLI
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com
```

### Build & Deploy

```bash
# Build Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/solodesk

# Deploy to Cloud Run
gcloud run deploy solodesk \
  --image gcr.io/YOUR_PROJECT_ID/solodesk \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=xxx \
  --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  --set-env-vars GROQ_API_KEY=xxx \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://YOUR_CLOUD_RUN_URL
```

---

## Features

- ✅ Client CRM
- ✅ Project Pipeline with Milestones
- ✅ **Client Portal** (no-login shareable link)
- ✅ AI Client Communicator (10 scenarios, Groq)
- ✅ Invoice Builder + Tracking
- ✅ Proposal Builder (AI-powered)
- ✅ Dashboard with stats
- ✅ Mobile-first responsive design
- ✅ Settings + Profile with tagline
