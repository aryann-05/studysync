# StudySync Implementation Checklist

## Phase 1 — Dependencies & Config
- [x] Install npm dependencies (lucide-react, recharts, react-hook-form, zod, axios, radix, next-themes, date-fns, etc.)
- [x] Update `app/globals.css` with StudySync design system (brand colors, dark mode tokens, animations)
- [x] Update `app/layout.tsx` root layout (fonts, metadata, providers)

## Phase 2 — Foundation
- [x] `types/index.ts` — TypeScript interfaces
- [x] `lib/utils.ts` — cn(), formatters
- [x] `lib/constants.ts` — nav links, exam date
- [x] `lib/dummy-data.ts` — dummy data for all pages
- [x] `utils/validators.ts` — Zod schemas
- [x] `utils/helpers.ts` — score/streak calculations

## Phase 3 — Services, Contexts, Hooks
- [x] `services/api.ts`, `auth.ts`, `upload.ts`, `scheduler.ts`, `analytics.ts`, `notifications.ts`
- [x] `context/ThemeContext.tsx`, `AuthContext.tsx`, `StudyContext.tsx`, `Providers.tsx`
- [x] `hooks/useTheme.ts`, `useAuth.ts`, `useStudyPlan.ts`, `useAnalytics.ts`, `useUpload.ts`

## Phase 4 — shadcn/ui base components
- [x] Button, Card, Input, Label, Dialog, Modal, Progress, Switch, Avatar, Badge, Tabs, Skeleton, Tooltip, Textarea, DropdownMenu, Separator, Select, Checkbox

## Phase 5 — Layout & shared components
- [x] `components/layout/` — main, dashboard, auth, protected-route
- [x] `components/navbar/` — navbar + mobile menu
- [x] `components/sidebar/` — sidebar
- [x] `components/shared/` — footer, theme-toggle, logo, loading-spinner, page-header

## Phase 6 — Feature components
- [x] `components/dashboard/` — cards, countdown, tasks, streak, weak-topics, progress, revisions, activity, quick-actions
- [x] `components/charts/` — weekly-hours, confidence-trend, progress, mastery-pie, topics-bar, hours-area
- [x] `components/calendar/` — calendar component
- [x] `components/upload/` — file-upload, topics-preview, file-preview
- [x] `components/notifications/` — notification-card
- [x] `components/profile/` — profile-card
- [x] `components/landing/` — hero, features, how-it-works, benefits, testimonials, cta

## Phase 7 — Pages
- [x] `app/page.tsx` — Landing page
- [x] `app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`
- [x] `app/dashboard/layout.tsx` + `page.tsx`
- [x] Upload, Calendar, Study Session, Analytics, Progress, Profile, Settings, Notifications pages
- [x] `app/not-found.tsx` (404)

## Phase 8 — Build & verify
- [ ] Run `npm run build` and fix errors
- [ ] Run `npm run dev` to verify

