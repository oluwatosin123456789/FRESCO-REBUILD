# Fresco

## Team Members

- Jeremiah Shadamoro
- Ojo Covenant
- Rajii Amoto
- [Name 4]
- [Name 5]

---

## 🚀 Live Demo

- **Live Application:** [ https://fresco-cm3r.onrender.com ]
- **Backend API (Fresco CV Service):** [ https://fresco-cm3r.onrender.com/ ]
- **Recorded Demo:** [Add Loom link]

---

## 🎯 The Problem

> **How might we** give Nigeria's smallholder farmers — who are productive but financially invisible — a credible, evidence-based bridge to formal bank financing?

Millions of smallholder farmers sell real produce, fulfil real orders, and earn real income, yet none of that activity is visible to a bank. Without payslips, collateral, or formal records, they are locked out of credit — not because they aren't creditworthy, but because no one has assembled the evidence.

## ✨ Our Solution

**Fresco** is agricultural financial infrastructure that turns a farmer's everyday marketplace activity into bank-readable evidence.

Farmers list produce on the marketplace, and Fresco's computer-vision quality engine scores each listing. Every listing, quality scan, fulfilled order, and customer review is recorded in an activity ledger and aggregated into a **Farmer Economic Activity Profile (FEAP)** — a versioned, seven-component score of demonstrated economic activity.

With the farmer's explicit consent, the FEAP becomes a **Financial Passport**: a structured evidence view that Wema Bank analysts can open in a dedicated portal (Portfolio → Review Queue → Farmer Evidence View) to conduct their own independent underwriting review.

**An important design boundary:** Fresco records observed activity and assembles evidence — it does **not** underwrite, approve, price, or service credit. The strongest claim the product ever makes is that a farmer is *"potentially eligible for bank review."* All credit decisions remain entirely with the bank. This boundary is enforced in the data model itself (referrals, not finance requests) and in every status name and line of copy.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS with custom design tokens (Cormorant Garamond, Space Grotesk, JetBrains Mono), Framer Motion
- **Backend:** Next.js server routes with provider abstractions (Fresco CV, payments, AI)
- **Computer Vision:** Local fruit-recognition model served as a FastAPI microservice, consumed through the `RealFrescoProvider` abstraction
- **Database:** PostgreSQL with Prisma ORM (versioned FEAP score rows written to an activity ledger)
- **3D Landing Experience:** Pure Three.js scroll-driven narrative runway (no react-three-fiber)
- **Testing:** Vitest
- **Package Manager:** pnpm
- **Deployment:** Vercel (web app); [hosting for FastAPI CV service]
- **Banking Partner:** Wema Bank (analyst portal and consent-gated referral flow)

---

## ⚙️ How to Set Up and Run Locally

1. Clone the repository:
   ```bash
   git clone [your-repo-link]
   ```
2. Navigate to the project directory:
   ```bash
   cd fresco-proj
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a `.env.local` file and add the necessary environment variables:
   ```
   DATABASE_URL=postgresql://...
   FRESCO_CV_URL=http://localhost:8000   # FastAPI CV service
   ```
5. Run database migrations:
   ```bash
   pnpm prisma migrate dev
   ```
6. (Optional) Start the computer-vision service:
   ```bash
   cd cv-service && uvicorn main:app --reload
   ```
7. Run the development server:
   ```bash
   pnpm dev
   ```
