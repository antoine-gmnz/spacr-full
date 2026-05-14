 # Spacr — Product Analysis & Opportunity Report

 _Date: 2026-05-14_
 _Scope: full-codebase product review of `antoine-gmnz/spacr-full`_

 ## 1. Project Summary

 **Spacr** is a space-exploration web app that brings live and reference space data into a single
browsable experience. It is a Turbo monorepo:

 - `apps/backend` — AdonisJS 6 API (TypeScript, ESM), PostgreSQL via Lucid ORM, Redis cache
 - `apps/front` — React 19 + React Router 7 SPA/SSR, TanStack Query, React Three Fiber for 3D
 - `packages/shared-types` — DTOs shared across the boundary

 **Core value proposition**: a single, visually rich destination for space enthusiasts to see
*what's happening in space right now* (ISS, aurora, launches) and *explore the cosmos 
interactively* (3D solar system, Mars rover images, telescope photos).

 **Target user**: space hobbyists, students, and casual enthusiasts — not professional astronomers.
 People who would otherwise bounce between NASA APOD, Heavens-Above, spotthestation.nasa.gov, and
r/space.

 ## 2. Current State Assessment

 ### Existing features (observed in code)

 | Feature | Maturity | Source |
 |---|---|---|
 | 3D Solar System (`SpaceScene`) | **Strong** — Keplerian orbits, ephemeris from
`astronomy-engine`, polished R3F scene | `app/components/spaceExplorer/`, `EphemerisService` |
 | NASA APOD (Astronomy Picture of the Day) | Working | `app/components/apod/`, `useApod` |
 | ISS live position + crew | Working | `iss.service.ts`, `useISSPosition`, `useISSCrew` |
 | Aurora forecast (Kp) | Working | `useAuroraData` |
 | Upcoming launches | Working | `UpcomingLaunch` component |
 | Mars rover images | Working | `marsImages/` |
 | Earth View (3D globe + satellites) | **Broken** — frontend wired, backend `/tle/*` endpoint
missing (404) | `earthView/`, `use-tle.ts` |
 | "Today in Space" home dashboard | New (just built this session) | `routes/home.tsx` |
 | Schedule / calendar | Partial — UI present, backend integration unclear | `routes/schedule`,
`calendar/` |
 | Auth / user accounts | **Absent** | no auth controller, no users model exposed |

 ### Strengths

 - The **3D solar system is genuinely impressive** for a hobbyist project — real ephemeris,
Keplerian orbit lines, proper AU-scaled scene. This is the differentiator.
 - Backend architecture is clean: thin controllers, `@inject()` services, lazy route imports, Redis
 caching for external APIs. Easy to extend.
 - Shared-types package keeps the API contract honest.
 - TanStack Query setup (`staleTime: 5min`, `retry: 1`) is sensible for an external-data-heavy app.

 ### Gaps & risks

 1. **Broken feature in production-shaped code**: Earth View calls `/tle/gettledata` but no backend
 route exists. Either dead code or unfinished port from a legacy `apps/back/` (NestJS) backend.
*Business risk*: a visible navigation entry that 404s erodes trust.
 2. **No persistence layer for users**: PostgreSQL is provisioned but there's no auth, no
favorites, no saved views. Every visit is anonymous and stateless — kills retention.
 3. **No notifications / pull-back mechanism**: an aurora storm, an ISS overhead pass, or a SpaceX
launch are time-critical events. The app currently requires the user to *come check*. That's the
inverse of what this content type warrants.
 4. **Discoverability of the 3D explorer is weak**: it's the best feature, but until the home page
rewrite this session it wasn't surfaced as the hero. Now it is — good — but there's no "tour" or
"highlights" mode for a new visitor.
 5. **TypeScript baseline has 37 pre-existing errors** in `earthView`, `marsImages`, `schedule`,
`calendar`, and `shared-types` (`verbatimModuleSyntax`). Not user-visible, but a real velocity tax.
 6. **Caching is inconsistent**: `iss.service.ts` uses an in-memory `Map`, others use Redis.
Single-instance only — won't survive horizontal scaling.

 ## 3. Top Opportunities

 ### Opportunity 1: ISS Pass & Aurora Notifications

 **Problem it solves**: Users miss the events they actually care about because they're not in the
app at the right moment.
 **Target user**: returning enthusiasts who already use the home dashboard.
 **Business value**: pure retention play. Notifications are the single biggest lever for any
time-sensitive content app — they convert "I checked once" into "I open this twice a week."
 **How it fits**: ISS pass calculation can extend the existing `iss.service.ts` (already has TLE +
position math via `astronomy-engine`). Aurora data is already fetched by `useAuroraData`. Need:
user accounts, location storage, a notification channel (email first, web push later).
 **Complexity estimate**: **High** — requires the auth + persistence work below as a prerequisite,
plus a scheduled job runner.
 **Priority signal**: **High** — but blocked by Opportunity 2.
 **Risks**: notification fatigue if thresholds aren't tunable; geolocation accuracy for pass
predictions.

 ### Opportunity 2: User Accounts + Saved Locations & Favorites

 **Problem it solves**: Anonymous-only experience means every visit starts from zero. No
personalization, no continuity.
 **Target user**: any returning visitor.
 **Business value**: foundational. Unlocks notifications (Opp 1), personalized dashboards, and any
future social features. Without this, the product is a brochure.
 **How it fits**: Postgres + Lucid are already set up. AdonisJS has first-party auth modules.
Schema starts minimal: `users`, `user_locations`, `user_favorites` (e.g. saved planets, bookmarked
APOD images, tracked launches).
 **Complexity estimate**: **Medium** — well-trodden path in AdonisJS; the hard part is frontend UX
(auth pages, profile, settings).
 **Priority signal**: **Must-have** if the product is meant to grow beyond a portfolio piece.
 **Risks**: scope creep into social features; auth always brings security/compliance overhead —
escalate to **sec-pentest** when implementing.

 ### Opportunity 3: Fix & Expand Earth View into a "Live Sky Above You"

 **Problem it solves**: The Earth View page is currently broken (TLE 404 — there's already a
project-manager issue drafted for it). Beyond fixing it, the concept itself is undersold: showing
satellites on a globe is interesting, but showing **what's visible from the user's location, right 
now**, is a killer feature competitors charge for.
 **Target user**: amateur stargazers — the highest-intent segment of the audience.
 **Business value**: differentiation. Heavens-Above does this but its UX is from 2003. Spacr
already has the 3D chops to win on presentation.
 **How it fits**: builds on the not-yet-built TLE backend endpoint (already specced this session),
the existing R3F renderer, and `astronomy-engine` for visibility calculations. Requires user
location (ties to Opp 2).
 **Complexity estimate**: **Medium** post-TLE-fix, **High** including the location/visibility
logic.
 **Priority signal**: **High** — but sequence after the TLE endpoint ships.
 **Risks**: visibility math is tricky (sun angle, observer altitude, satellite magnitude); easy to
ship something that looks authoritative but is wrong.

 ### Opportunity 4: APOD Archive & Bookmarking

 **Problem it solves**: APOD has a 30-year backlog of stunning content. Currently the app only
shows today's. The deepest content well in the entire space ecosystem is being used as a single
tile.
 **Target user**: casual visitors (great browsing experience) and returning users (collect
favorites).
 **Business value**: massive session-time and SEO upside. Each archived APOD is an indexable page
with rich content NASA already wrote.
 **How it fits**: NASA APOD API supports historical date queries — the existing `apodService` only
needs a date parameter. Frontend gets a new `/apod/archive` route with infinite scroll. Bookmarking
 depends on Opp 2.
 **Complexity estimate**: **Low** for the archive browser, **Medium** with bookmarking + SEO meta
tags.
 **Priority signal**: **High** — best effort-to-value ratio in this list.
 **Risks**: NASA API rate limits (cache aggressively in Redis); image bandwidth.

 ### Opportunity 5: Unified Launch Tracker with Calendar Subscription

 **Problem it solves**: `UpcomingLaunch` shows the next launch, and there's a `schedule`/`calendar`
 route partially built. These should be the same feature, finished properly.
 **Target user**: launch enthusiasts (high-engagement segment).
 **Business value**: low-effort completion of a half-built feature; iCal subscription = the user
*carries Spacr into their calendar app*, which is permanent passive retention.
 **How it fits**: consolidate `UpcomingLaunch` and the calendar page; expose an `.ics` endpoint
from the backend; add filters (provider, vehicle, mission type).
 **Complexity estimate**: **Low–Medium**. The data source already exists; this is mostly product/UX
 consolidation plus a new ICS endpoint.
 **Priority signal**: **Medium** — high-leverage for a small audience; do after Opps 2–4.
 **Risks**: the existing schedule code's TS errors suggest it was abandoned mid-build — budget time
 to understand why before extending it.

 ## 4. Recommended Next Move

 **Build user accounts + saved locations (Opportunity 2).**

 Reasoning:
 - Three of the five top opportunities (notifications, "live sky above you", APOD bookmarking) are
**gated by having users**. Without persistence, the product cannot grow past brochureware.
 - The infrastructure is already there: Postgres + Lucid + AdonisJS auth. The marginal cost of
doing this *now* is far lower than retrofitting it after three more features have been shipped
statelessly.
 - It de-risks every subsequent opportunity by establishing the auth + session patterns once.

 **Sequence to propose to the team:**

 1. **Now**: Ship the TLE endpoint (issue already drafted — hand to dev-planner) so Earth View
stops 404-ing. Quick win, removes a visible bug.
 2. **Next milestone**: Auth + user model + saved locations (Opp 2). Escalate auth implementation
to **sec-pentest** for review.
 3. **Following milestone**: APOD archive (Opp 4) — easiest win that benefits from accounts, also
drives SEO independently.
 4. **Then**: Notifications (Opp 1) and "Live Sky Above You" (Opp 3), in either order depending on
which excites the audience more.
 5. **Cleanup pass**: Consolidate launch tracker + calendar (Opp 5) and clear the 37-error
TypeScript baseline.

 ---

 _Hand-offs:_
 - **project-manager** → turn Opportunities 2, 3, 4 into milestone + epic + issue breakdowns
 - **dev-planner** → architecture for auth (AdonisJS auth module choice: session vs. opaque token
vs. JWT) and Redis-vs-in-memory cache unification
 - **sec-pentest** → review auth implementation before merge

--------------------------------------------------------------------------------------------------

If you want, I can also produce the per-opportunity issue breakdowns next so you can hand them
straight to dev-planner.