# FRESCO-REBUILD

## Product and execution direction

Fresco should prioritize distribution and investor traction over premature stack rewrites.

### Keep
- **Backend:** Continue with the current `Next.js + Prisma + Postgres` architecture for core product workflows.
- **ML service:** Keep `FastAPI` for shelf-life inference and call it from the existing app/backend layer.
- **Mobile:** Use `Expo/React Native` as the pragmatic path for a TypeScript team.

### Avoid for now
- Rewriting the backend to Go solely for theoretical infra-cost savings.
- Migrating to Flutter unless offline, on-device inference becomes a proven make-or-break requirement and React Native tooling cannot meet it.

## Investor-facing positioning

Pitch Fresco as **post-harvest loss reduction infrastructure**, not just an AI estimator.

Immediate execution priorities:
- Ship a **Play Store beta** with the scan experience.
- Record a **90-second real-market demo** (live produce scan and result).
- Add social proof in the deck, including **"Audience favourite at Wema Hackathon 2026"** and fresh quotes.
- Prioritize outreach to relevant agri-tech capital and grant channels in West Africa.
