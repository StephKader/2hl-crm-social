# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build (use to verify no errors)
npm run lint     # ESLint check
```

No test framework is configured.

## Architecture

This is a **Next.js 16 App Router** CRM application ("2HL CRM Social") for a Burkina Faso consulting firm. All UI is in **French**. It uses **mock data only** — no backend/API integration.

### Routing

- `src/app/page.tsx` — Root redirect to `/login`
- `src/app/login/page.tsx` — Public login page
- `src/app/(app)/` — Protected route group with shared layout (Sidebar + Header + MobileBottomNav)
  - `dashboard/`, `conversations/`, `contacts/`, `categories/`, `reports/`, `settings/`
  - `conversations/[id]/` — Conversation detail with chat panel

### Role-Based Access Control

Three roles: `admin`, `patron`, `commercial`. Managed via `AuthContext` (`src/contexts/AuthContext.tsx`) with `useAuth()` hook providing `user`, `setRole()`, and `isAuthorized(roles)`.

Navigation items in `src/lib/constants.ts` (`NAV_ITEMS`) define which roles can access each route. Both `Sidebar` and `MobileBottomNav` filter items via `isAuthorized()`. There is no middleware-level protection — access control is component-level only.

- **Commercial**: Conversations + Contacts only
- **Patron**: Dashboard, Conversations, Contacts, Categories, Reports
- **Admin**: All pages including Settings

### Layout System

The `(app)/layout.tsx` renders:
- **Desktop (≥1280px)**: Sidebar (left) + Header (top) + content area. Sidebar collapses to icons on conversation **detail** pages only (`/conversations/[id]`).
- **Mobile (<1280px)**: Header (top) + content + MobileBottomNav (fixed bottom). Breakpoint detection via `useMediaQuery("(min-width: 1280px)")` custom hook.
- **Header visibility**: Hidden only on conversation detail pages (which have their own chat header). The conversation list page (`/conversations`) keeps the main Header from the layout. **Important**: Individual pages must NOT render their own `<Header />` — it is always provided by the layout.

The `MobileBottomNav` shows the first 3 nav items as direct tabs. If the role has more items, a "Plus" button opens a popover menu listing all remaining pages (e.g., Catégories + Rapports for Patron, + Paramètres for Admin).

Conversation detail page (`conversations/[id]/page.tsx`) manages its own layout with `CustomerProfile` as an inline panel (desktop) or Sheet (mobile).

### Key Patterns

- **All pages are client components** (`"use client"`) — no RSC data fetching
- **State**: React Context (auth) + local `useState` per component. No external state library.
- **Icons**: Google Material Symbols Outlined (loaded via `<link>` in root layout), not Lucide for app icons
- **Toast notifications**: `sonner` for user feedback on placeholder/demo buttons — import `toast` from `"sonner"`
- **Styling**: Tailwind CSS v4 + CSS variables for theming (`globals.css`). shadcn/ui components in `src/components/ui/`. Avoid dynamic Tailwind classes like `bg-${color}-100` — use static mappings or inline styles instead.
- **Viewport height**: Use `h-[100dvh]` not `h-screen` for mobile-safe full-height layouts
- **Interactive features**: Chat supports message sending with simulated auto-replies. Global search (`Ctrl+K`) filters conversations/contacts. Report charts respond to period selection. Contact editing via Sheet panel.
- **Error handling**: Custom 404 page (`src/app/not-found.tsx`), error boundary (`src/app/(app)/error.tsx`), loading skeleton (`src/app/(app)/loading.tsx`)
- **Accessibility**: All icon-only buttons have `aria-label` and `title` attributes

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | All TypeScript interfaces and union types (Role, Channel, ConversationStatus, etc.) |
| `src/lib/constants.ts` | NAV_ITEMS, CHANNEL_CONFIG, STATUS_CONFIG, DEFAULT_INTENTIONS, DEFAULT_LABELS |
| `src/lib/mock-data.ts` | All mock data (users, contacts, conversations, messages, metrics) |
| `src/contexts/AuthContext.tsx` | Auth context with role switching (demo mode) |
| `src/app/globals.css` | CSS variables for light/dark themes, custom utilities (scrollbar, safe-area) |
| `src/hooks/useMediaQuery.ts` | Responsive breakpoint hooks (useMediaQuery, useIsMobile, useIsDesktop) |

## Chatwoot Integration

This frontend is designed to connect to **Chatwoot** as its backend. See `docs/CHATWOOT_INTEGRATION.md` for the full integration guide covering: architecture, authentication, data model mapping, API service layer, page-by-page integration plan, WebSocket real-time, and 6-phase migration strategy.

## Stack

- Next.js 16, React 19, TypeScript 5 (strict mode)
- Tailwind CSS 4 with `@import "tailwindcss"` syntax
- shadcn/ui (new-york style) with Radix UI primitives
- recharts for dashboard charts
- next-themes for dark mode
- sonner for toasts
- Path alias: `@/*` → `./src/*`
- React Compiler enabled (`next.config.ts`)
