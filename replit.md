# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the SwiftCare mobile health app (Expo) and a shared API server (Express).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### SwiftCare (`artifacts/swiftcare`) — Mobile App
AI-assisted healthcare access app built with React Native + Expo.

**Screens:**
- Splash Screen — branded green SwiftCare screen with user's logo, "Get Started" CTA
- Chat (Home) — AI health assistant with keyword-based responses, safe guidance
- Doctors — 6 sample doctors with specialty filtering, search, detail view, booking
- Education — 6 health articles (malaria, mental health, nutrition, vaccines, first aid, diabetes)
- Profile — login/register with AsyncStorage persistence, or full profile view when logged in
- Doctor Detail — stats, bio, availability, consultation booking
- Article Detail — full article content with category badges
- Search — unified search across doctors and articles
- Login / Register — full auth forms with validation

**Colors:** Primary green (#22C55E), blue (#3B82F6), purple (#A855F7)
**Auth:** AsyncStorage-based user persistence (no backend required)
**Chatbot:** Keyword-based safe health guidance with urgent symptom detection

### API Server (`artifacts/api-server`) — Backend
Express 5 server with health check endpoint.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Safety Disclaimer
SwiftCare includes a mandatory disclaimer on all AI responses and screens:
"SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately."

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
