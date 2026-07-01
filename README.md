# 🍊 SoloDesk — The Freelancer OS

> A high-performance, beautiful, and AI-powered command center designed for the modern freelancer. Manage clients, track milestones, generate proposals, issue invoices, and communicate professionally—all in one place.

*Built for AI Seekho 2026 — App Banao Category*

<p align="center">
  <img src="https://img.shields.io/badge/AI%20Seekho%202026-Silver%20Tier%20Winner-C0C0C0?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Silver Tier Winner" />
</p>

---

## 🏆 Recognition

**🥈 Silver Tier Winner — AI Seekho 2026 (App Banao Category)**

SoloDesk was built end-to-end during the AI Seekho 2026 hackathon and placed in the **Silver Tier among 10,000+ entries**, hosted in collaboration with Google for Developers, Google Cloud, and Tech Nation Pakistan.

📎 [View the announcement on LinkedIn](https://www.linkedin.com/posts/muhammad-abdullah-09390938a_vibekaregapakistan-aiseekho2026-vibekaregapakistan-share-7475597933388804096-_FrK/)

<p align="center">
  <img src="./assets/ai-seekho-swag.jfif" alt="AI Seekho 2026 Swag Kit" width="500" />
</p>

---

## ✨ Features

- 💼 **Client CRM:** Organize and manage client relationships, contact info, and active metrics.
- 🏁 **Project Pipeline:** Track project progress and status alongside interactive milestone systems.
- 🌐 **Client Portals:** Share secure, password-less, real-time client links to let them view milestones, download proposals, and check invoices.
- 🧠 **AI Communicator:** Generate polished client messages across 10 scenarios (payment follow-ups, scope creep, project handoffs) in Urdu or English, powered by **Groq**.
- 🧾 **Invoice Builder:** Generate, track, and manage invoices with client-facing states.
- 📄 **Proposal Builder:** Build and send professional proposals with detailed estimates.
- 📊 **Unified Dashboard:** High-level metrics for active projects, clients, invoices, and message histories.
- 🌓 **Premium Dark Mode:** Harmonic HSL color architecture that transitions smoothly across all screens.
- 📱 **Mobile First:** Responsive navigation drawer and bottom nav overlays optimized for speed on phones.

---

## 🛠️ Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Database + Auth:** Supabase
- **Artificial Intelligence:** Groq SDK (Llama 3.3 70B)
- **Deployment:** Vercel

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/m-abdullah-06/SoloDesk.git
cd solodesk
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory and configure the following credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Schema setup

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of the schema script located in: [supabase/schema.sql](file:///f:/AISeekho/solodesk/supabase/schema.sql)

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your local instance.

---

## ☁️ Deployment (Vercel)

SoloDesk is pre-configured for a zero-setup deployment on Vercel:

1. Push your code changes to a GitHub repository.
2. Import the project on [Vercel](https://vercel.com).
3. Add the env variables specified in `.env.local` to the Vercel **Environment Variables** settings.
4. Click **Deploy**. Vercel will build and serve your Next.js application globally.
