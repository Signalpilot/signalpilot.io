# Real Estate App — Technical Specification (Albania MVP)

> **Purpose:** Hand this document to developers for accurate, comparable quotes.
> **Scope:** Web + Native Mobile App (iOS & Android). Full-stack MVP.
> **Target market:** Albanian real estate (property sales & rentals)

---

## 1. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Web Frontend | Next.js 14+ (App Router) | SSR for SEO, React ecosystem, fast iteration |
| Mobile App | React Native (Expo) | Cross-platform iOS & Android from one codebase, shares logic with web |
| Styling (Web) | Tailwind CSS | Rapid UI development, responsive by default |
| Styling (Mobile) | NativeWind / StyleSheet | Tailwind-like styling for React Native |
| Backend & Auth | Supabase | Auth, Postgres, Realtime, Storage — all-in-one |
| Database | PostgreSQL + PostGIS | Geo-spatial queries for map search |
| Maps (Web) | Mapbox GL JS | Free tier is generous, better customization than Google |
| Maps (Mobile) | react-native-mapbox-gl | Native map performance on iOS/Android |
| Payments | Stripe | Standard for SaaS billing |
| Hosting (Web) | Vercel | Native Next.js hosting, easy deploys |
| App Distribution | Apple App Store + Google Play | Native app distribution |
| Push Notifications | Expo Notifications | Cross-platform push notifications |
| File Storage | Supabase Storage | Property photos, documents |
| Language | TypeScript | Type safety across the stack |
| i18n | next-intl (web) / i18next (mobile) | Albanian & English support |

---

## 2. User Roles

| Role | Description |
|---|---|
| **Visitor** | Can browse listings, view map, search/filter. No account needed. |
| **Registered User** | Can save favorites, contact sellers, set alerts. |
| **Seller / Owner** | Can create & manage their own listings. |
| **Agent** | Can manage multiple listings, has a public agent profile. |
| **Admin** | Full platform control — approve listings, manage users, view reports. |

---

## 3. MVP Features (Phase 1)

### 3.1 Authentication & User Profiles

**What it does:** Users can sign up, log in, and manage their profile.

- Email/password sign up & login
- Google OAuth (optional but recommended)
- Profile page: name, phone, photo, bio
- Role selection: "I want to buy/rent" vs "I want to sell/list"
- Agent profiles with contact info, listing count, verified badge
- Password reset via email

**Acceptance criteria:**
- User can register, log in, log out
- Profile photo uploads to Supabase Storage
- Sessions persist across page refreshes
- Supabase RLS policies enforce data access per role

---

### 3.2 Property Listings — CRUD

**What it does:** Sellers/agents can create, edit, and manage property listings.

**Listing data model:**

```
listing {
  id: uuid
  user_id: uuid (owner)
  status: enum (draft, pending_review, active, sold, expired, rejected)
  type: enum (sale, rent)
  property_type: enum (apartment, house, villa, land, commercial, office)
  title: string (max 120 chars)
  description: text (max 2000 chars)
  price: integer (EUR or ALL)
  currency: enum (EUR, ALL)
  bedrooms: integer
  bathrooms: integer
  area_sqm: integer
  floor: integer (nullable)
  total_floors: integer (nullable)
  year_built: integer (nullable)
  furnished: boolean
  parking: boolean
  balcony: boolean
  elevator: boolean
  address: string
  city: string
  neighborhood: string (nullable)
  latitude: decimal
  longitude: decimal
  geometry: PostGIS point
  photos: array of urls (max 15)
  contact_phone: string
  contact_email: string
  created_at: timestamp
  updated_at: timestamp
}
```

**Functionality:**
- Multi-step listing form (details → photos → location → preview → submit)
- Drag-and-drop photo upload (max 15 photos, auto-resize to 1200px wide)
- Pin location on map OR enter address manually
- Preview listing before publishing
- Edit/delete own listings
- Listing status management (draft → pending → active → sold)

**Acceptance criteria:**
- Seller can create a listing in under 5 minutes
- Photos auto-compress on upload (max 500KB each)
- Listing goes to "pending_review" status on first submit
- Seller can see all their listings with status in a dashboard

---

### 3.3 Map Search & Geo-Search

**What it does:** Users can find properties on an interactive map with area-based search.

**Functionality:**
- Full-screen map view with property pins/clusters
- Click pin → listing preview card (photo, price, beds, area)
- Draw polygon (lasso) on map to search within area
- Radius search: "within X km of this point"
- Map auto-updates results as user pans/zooms
- Toggle between map view and list view
- City/neighborhood quick-select buttons

**Technical requirements:**
- PostGIS `ST_Within` and `ST_DWithin` queries for geo-filtering
- Mapbox GL JS with clustering for performance (100+ pins)
- Debounced map-move queries (300ms)
- GeoJSON format for polygon search

**Acceptance criteria:**
- Map loads in under 2 seconds
- Polygon draw tool works on mobile (touch)
- Searching 1000+ listings within an area returns in under 500ms
- Pin clusters break apart on zoom

---

### 3.4 Search & Filters

**What it does:** Users can filter listings by key criteria.

**Filters:**
- Type: Sale / Rent
- Property type: Apartment, House, Villa, Land, Commercial
- Price range: min–max slider
- Bedrooms: 1, 2, 3, 4, 5+
- Area (sqm): min–max
- City / Neighborhood dropdown
- Furnished: yes/no
- Posted within: 24h, 7 days, 30 days

**Functionality:**
- Filters work on both list view and map view
- URL query params reflect active filters (shareable/bookmarkable)
- Result count updates live as filters change
- Sort by: newest, price low→high, price high→low, area
- Pagination or infinite scroll (20 results per page)

**Acceptance criteria:**
- Filters apply in under 300ms
- Filtered URL can be shared and reproduces the same results
- Works correctly on mobile (collapsible filter panel)

---

### 3.5 Listing Detail Page

**What it does:** Full property information page.

**Content:**
- Photo gallery with lightbox (swipe on mobile)
- Price, type, property details in clear layout
- Description text
- Location map (small embedded map showing pin)
- Contact seller section: phone (click-to-call), email, in-app message button
- "Save to favorites" button
- Share button (copy link, WhatsApp, social)
- Similar listings carousel at the bottom
- Breadcrumb navigation (Home > Tirana > Apartments > This listing)

**Technical requirements:**
- Server-side rendered for SEO (Next.js SSR)
- Open Graph meta tags for social sharing with listing photo
- Schema.org `RealEstateListing` structured data
- Responsive image loading (srcset for different screen sizes)

**Acceptance criteria:**
- Page loads in under 1.5 seconds
- Social share preview shows listing photo and price
- Photo gallery works on mobile with swipe gestures
- Contact phone number only visible to logged-in users

---

### 3.6 User Dashboard

**What it does:** Logged-in users can manage their activity.

**For buyers/renters:**
- Saved favorites list
- Recent searches
- Email alerts: "Notify me when new listings match my search" (daily digest)

**For sellers/agents:**
- My listings (with status badges)
- Views/impressions count per listing
- Inquiries received (who contacted about which listing)
- Quick actions: edit, mark as sold, renew, delete

**Acceptance criteria:**
- Dashboard loads in under 2 seconds
- Seller can see total views across all listings
- Email alerts fire once daily (Supabase Edge Function + cron)

---

### 3.7 Admin Dashboard

**What it does:** Platform admins manage content and users.

**Functionality:**
- Listing moderation queue (approve/reject with reason)
- User management (view, suspend, delete accounts)
- Reported listings/users review
- Basic stats: total users, total listings, active listings, new this week
- Content moderation: flag/remove inappropriate photos or text

**Acceptance criteria:**
- Admin can approve/reject a listing in 2 clicks
- Rejected listings send email to seller with reason
- Admin dashboard is a separate `/admin` route, protected by role check

---

### 3.8 Payments & Subscriptions (Stripe)

**What it does:** Monetize the platform through paid listing plans and premium features.

**Plans:**
- **Free:** 1 active listing, basic placement
- **Standard:** €9/month — up to 10 listings, priority placement
- **Premium:** €29/month — unlimited listings, featured badge, analytics
- **Pay-per-listing:** €3 one-time fee to post a single listing (no subscription)

**Functionality:**
- Stripe Checkout for payment processing
- Subscription management (upgrade, downgrade, cancel)
- Billing history and invoice downloads
- Webhook handling for payment events (success, failure, cancellation)
- Grace period: 3 days after failed payment before listings deactivate
- Promo codes / discount support

**Technical requirements:**
- Stripe Customer Portal for self-service billing management
- Stripe webhooks → Supabase Edge Function to sync subscription status
- `subscriptions` table tracks plan, status, Stripe IDs
- RLS enforces listing limits based on active plan

**Acceptance criteria:**
- User can subscribe to a plan and immediately post listings up to their limit
- Failed payment triggers email warning, deactivates listings after grace period
- Subscription status syncs within 30 seconds of Stripe event
- User can cancel and retain access until end of billing period

---

### 3.9 In-App Messaging

**What it does:** Buyers and sellers can communicate within the platform without sharing personal contact info.

**Functionality:**
- Click "Send Message" on any listing → opens conversation thread
- Conversation list in user dashboard (inbox)
- Real-time message delivery (Supabase Realtime)
- Unread message count badge in navigation
- Email notification when a new message is received (with opt-out)
- Block/report user from conversation
- Messages linked to specific listing for context

**Technical requirements:**
- Supabase Realtime subscriptions for live message updates
- `conversations` and `messages` tables with proper indexing
- RLS: users can only see their own conversations
- Email notification via Supabase Edge Function (debounced, max 1 per hour per conversation)

**Acceptance criteria:**
- Messages appear in real-time without page refresh
- User receives email notification for new messages (if enabled)
- Conversation shows which listing it's about
- Users can block another user (hides conversation, prevents new messages)

---

### 3.10 AI-Generated Listing Descriptions

**What it does:** Auto-generate property descriptions from listing details to help sellers write compelling listings faster.

**Functionality:**
- "Generate description" button on listing creation form
- Takes property details (type, beds, area, location, features) as input
- Generates a professional, SEO-friendly description in Albanian or English
- User can edit the generated text before publishing
- Option to regenerate with a different tone (formal, casual, luxury)

**Technical requirements:**
- Anthropic Claude API (or OpenAI) called via Supabase Edge Function
- Rate limit: 5 generations per user per day (prevent abuse)
- Prompt includes property data + market context
- Response cached for same input to reduce API costs

**Acceptance criteria:**
- Description generates in under 5 seconds
- Output is 100-200 words, grammatically correct
- User can edit freely after generation
- Works in both Albanian and English

---

### 3.11 Multi-Language Support (Albanian & English)

**What it does:** Full platform available in Albanian (primary) and English.

**Functionality:**
- Language toggle in header (AL / EN)
- All UI text, labels, buttons, and system messages translated
- Listing content stays in the language the seller wrote it in (not auto-translated)
- URL structure: `/sq/listings/...` (Albanian) and `/en/listings/...` (English)
- Language preference saved in user profile
- Default language detected from browser settings

**Technical requirements:**
- next-intl or next-i18next for internationalization
- Translation files: `messages/sq.json` and `messages/en.json`
- SSR respects language for SEO (hreflang tags, localized meta tags)
- Static text only — no machine translation of user-generated content

**Acceptance criteria:**
- All UI elements display correctly in both languages
- Language switch is instant (no page reload)
- SEO: Google indexes Albanian and English versions separately
- New UI text additions require both translations before deploy

---

### 3.12 Native Mobile App (iOS & Android)

**What it does:** Full-featured mobile app mirroring the web experience with native performance.

**Functionality:**
- All core features from web (browse, search, map, list, message, pay)
- Native map experience with smooth gestures and GPS "near me" search
- Camera integration: take photos directly into listing creation
- Push notifications for new messages, listing updates, price alerts
- Offline browsing of saved/favorited listings
- Biometric login (Face ID / fingerprint)
- Share listings via native share sheet (WhatsApp, SMS, etc.)
- Deep linking: web URLs open in the app if installed

**Technical requirements:**
- React Native with Expo (managed workflow)
- Shared TypeScript types and API logic with web app
- Expo Notifications for push notifications
- Expo Camera for photo capture
- expo-location for GPS-based search
- App Store & Google Play submission + approval process
- CodePush or EAS Update for over-the-air updates

**Acceptance criteria:**
- App runs at 60fps on mid-range devices (iPhone 12, Samsung A52)
- Push notifications delivered within 10 seconds
- App size under 50MB
- App passes Apple App Store and Google Play review
- Deep links from web open correct screens in app

---

### 3.13 Push Notifications

**What it does:** Keep users engaged with timely notifications on mobile and web.

**Notifications sent for:**
- New message received
- Listing approved / rejected by admin
- New listing matches a saved search alert
- Payment confirmation / payment failed
- Someone saved your listing as a favorite
- Price drop on a saved listing

**Functionality:**
- Mobile: native push via Expo Notifications
- Notification preferences: users choose which types they want
- Notification history screen in app
- Tap notification → navigates to relevant screen

**Technical requirements:**
- Supabase Edge Function triggers notifications on database events
- Expo Push Notification service for delivery
- `notification_preferences` table for user opt-in/out
- Device token storage in `user_devices` table

**Acceptance criteria:**
- Notifications arrive within 10 seconds of triggering event
- Users can disable specific notification types
- Tapping a notification opens the correct screen/page

---

## 4. Non-Functional Requirements

### Performance
- Lighthouse score > 80 on mobile
- First Contentful Paint < 1.5s
- Map interaction at 60fps with up to 500 visible pins

### Security
- Supabase RLS on all tables (users can only edit their own data)
- Input sanitization on all form fields
- Rate limiting on auth endpoints (Supabase built-in)
- HTTPS everywhere
- Image upload validation (file type, max size)

### SEO
- SSR listing pages with unique meta tags
- Sitemap.xml auto-generated for all active listings
- Schema.org structured data on listing pages
- Clean URL structure: `/listings/tirana/apartment-2br-blloku-{id}`

### Responsive Design
- Mobile-first design
- Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Map view usable on mobile with touch gestures
- All forms usable on mobile

---

## 5. What is NOT in the MVP

These are **explicitly excluded** from Phase 1 — can be added in Phase 2:

- Boost/promote listings (paid ad placement within the platform)
- Trust scores / seller verification system
- Video tours / virtual 3D tours
- Mortgage calculator
- Advanced analytics dashboard (beyond basic stats)
- Audit logging
- Third-party portal syndication (e.g., auto-post to other real estate sites)

---

## 6. Database Schema Overview

```sql
-- Core tables
users (id, email, name, phone, photo_url, role, language_pref,
       created_at)
listings (id, user_id, status, type, property_type, title, description,
          price, currency, bedrooms, bathrooms, area_sqm, floor,
          total_floors, year_built, furnished, parking, balcony, elevator,
          address, city, neighborhood, lat, lng, geom,
          contact_phone, contact_email, views_count,
          created_at, updated_at)
listing_photos (id, listing_id, url, position, created_at)
favorites (id, user_id, listing_id, created_at)
search_alerts (id, user_id, filters_json, frequency, active, created_at)
inquiries (id, listing_id, from_user_id, message, created_at)
reports (id, listing_id, reporter_id, reason, status, created_at)

-- Payments & Subscriptions
subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id,
               plan, status, current_period_start, current_period_end,
               created_at, updated_at)
payments (id, user_id, stripe_payment_id, amount, currency, status,
          description, created_at)

-- Messaging
conversations (id, listing_id, participant_1, participant_2,
               last_message_at, created_at)
messages (id, conversation_id, sender_id, body, read_at, created_at)
blocked_users (id, blocker_id, blocked_id, created_at)

-- Push Notifications
user_devices (id, user_id, expo_push_token, platform, created_at)
notification_preferences (id, user_id, new_message, listing_approved,
                          search_alert, payment, favorite, price_drop)

-- PostGIS
-- listings.geom is type geography(Point, 4326)
-- Spatial index on listings.geom
```

---

## 7. Deliverables Expected from Developer

1. **Source code** in a private GitHub/GitLab repo with full access (monorepo: web + mobile)
2. **Deployed staging environment** on Vercel (dev branch) for web
3. **Deployed production environment** on Vercel (main branch) for web
4. **Mobile app builds** submitted to Apple App Store and Google Play Store
5. **Supabase project** with all migrations in code (reproducible)
6. **Stripe account** configured with products, webhooks, and test mode
7. **Documentation:** README with setup instructions, environment variables, deployment steps
8. **Handoff session:** 1-hour walkthrough of codebase and architecture

---

## 8. Milestones & Payment Structure (Suggested)

| Milestone | What's delivered | Payment |
|---|---|---|
| **M1: Foundation** | Auth, user profiles, DB schema, project setup (web + mobile) | 10% |
| **M2: Listings** | Full listing CRUD, photo upload, listing detail page, AI descriptions | 15% |
| **M3: Search & Map** | Map view, geo-search, filters, list view (web + mobile) | 15% |
| **M4: Messaging & Payments** | In-app chat, Stripe subscriptions, billing management | 15% |
| **M5: Mobile App** | React Native app, push notifications, camera integration, app store submission | 20% |
| **M6: Dashboards & i18n** | User dashboard, admin dashboard, favorites, alerts, Albanian + English | 15% |
| **M7: Launch** | SEO, performance, bug fixes, deployment, app store approval, handoff | 10% |

> **Suggested total budget range: €15,000 — €30,000** depending on developer location and experience. The scope now includes a native mobile app, real-time messaging, payments, and multi-language support — significantly more than a web-only MVP.

---

## 9. How to Use This Document

1. Send this spec to 2-3 developers
2. Ask each for: total price, timeline, and portfolio of similar work
3. Compare quotes against the same scope
4. Negotiate milestone-based payments (never pay 100% upfront)
5. Ensure the contract includes source code ownership transfer to you

---

*Document prepared February 2026. Scope may be adjusted based on budget and priorities.*
