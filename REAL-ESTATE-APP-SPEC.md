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

These are **explicitly excluded** from Phase 1 — fully specified in **Section 10: Competitive Edge Features (Phase 2)**:

- AI-powered property valuation & price estimates
- Virtual 3D tours & video walkthroughs
- Mortgage calculator & bank affordability integration
- Neighborhood intelligence (walk scores, amenity heatmaps, safety data)
- Seller/agent verification & trust scores
- Natural language AI search
- Price history & market analytics
- WhatsApp / Viber direct messaging integration
- AR property preview (point camera at buildings)
- Automated listing quality scoring
- Dynamic pricing recommendations for sellers
- Property & neighborhood comparison tools
- Boost/promote listings (paid ad placement)
- Audit logging
- Third-party portal syndication

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

---

## 10. Competitive Edge Features (Phase 2) — Leapfrog Immobiliare.it

> **Goal:** These 12 features don't exist on Immobiliare.it or any Albanian competitor. Shipping them post-MVP turns the platform from "another listings site" into the **definitive Albanian proptech product**. Each feature is designed to increase user retention, trust, and conversion.

---

### 10.1 AI-Powered Property Valuation & Price Estimates

**What it does:** Instant automated property valuation using comparable sales data — gives buyers confidence and helps sellers price correctly.

**Functionality:**
- "What's my property worth?" tool accessible from homepage and listing creation flow
- User enters address, property type, size, bedrooms, condition → gets instant estimate
- Valuation range shown (low / estimated / high) with confidence score
- Comparable properties ("comps") displayed on a map with sale prices
- Valuation PDF report downloadable (branded, shareable with banks)
- Historical price appreciation for the neighborhood
- Sellers see "Your listing is priced X% above/below market" nudge during creation

**Technical requirements:**
- ML model trained on Albanian property transaction data (cadastral records + platform data)
- Fallback: hedonic pricing model using regression on available listing data
- Supabase Edge Function calls valuation API
- Caching: valuations cached per address for 7 days
- Data pipeline: ingest public transaction records, normalize, geocode

**Why it leapfrogs Immobiliare.it:**
- Immobiliare.it has no automated valuation tool for Albania
- Builds trust — users return to check values even when not buying/selling
- Positions the platform as a **data authority**, not just a classifieds board

**Acceptance criteria:**
- Valuation generates in under 3 seconds
- Accuracy within ±15% of actual sale price (measured against historical data)
- At least 3 comparable properties shown per valuation
- Works for apartments, houses, and villas in Tirana, Durrës, Vlorë, Sarandë

---

### 10.2 Virtual 3D Tours & Video Walkthroughs

**What it does:** Immersive property viewing from anywhere — especially valuable for diaspora buyers who can't visit in person.

**Functionality:**
- Sellers upload 360° photos or video walkthroughs during listing creation
- Interactive 3D tour viewer embedded in listing detail page (Matterport-style)
- "Dollhouse" view: top-down 3D floor plan navigation
- Video walkthrough player with chapter markers (kitchen, living room, etc.)
- "Request a Live Tour" button — seller does a real-time video call walkthrough via the app
- Tour view count tracked in seller analytics
- Listings with 3D tours get a prominent "3D Tour" badge

**Technical requirements:**
- Integration with Matterport SDK or open-source alternative (e.g., A-Frame / Three.js)
- Video hosting: Cloudflare Stream or Mux for adaptive bitrate
- 360° photo stitching: client-side with Pannellum.js viewer
- Live video call: WebRTC via Daily.co or Agora SDK
- Mobile: React Native WebView for 3D tours, native video player for walkthroughs

**Why it leapfrogs Immobiliare.it:**
- No Albanian platform offers 3D tours
- Critical for Albanian diaspora buyers in EU/US who purchase remotely
- Massively reduces unnecessary in-person viewings (saves time for both parties)
- Premium feature — can charge sellers extra for 3D tour hosting

**Acceptance criteria:**
- 3D tour loads in under 4 seconds on 4G connection
- Video walkthroughs stream without buffering at 720p on mobile
- Live video call connects within 5 seconds
- Tour viewer works on all modern browsers + mobile app

---

### 10.3 Mortgage Calculator & Bank Affordability Integration

**What it does:** Helps buyers understand exactly what they can afford and connects them with Albanian banks for pre-approval.

**Functionality:**
- Mortgage calculator on every listing page (monthly payment estimate)
- Inputs: property price, down payment %, interest rate, loan term
- Pre-filled with current Albanian bank rates (BKT, Raiffeisen, OTP, Credins)
- "Affordability check" tool: enter income → see max property price you qualify for
- Side-by-side bank comparison: see offers from multiple banks for the same property
- "Get Pre-Approved" button → lead sent to partner banks (revenue stream)
- Stamp duty and notary fee calculator included (Albanian-specific costs)
- Monthly payment breakdown: principal, interest, insurance, taxes

**Technical requirements:**
- Albanian mortgage rate API (scraped or partner API from BKT, Raiffeisen, etc.)
- Amortization calculation engine (server-side for accuracy)
- Lead generation webhook to partner banks
- Albanian tax calculation: TVSH, property transfer tax (currently 15% of cadastral value)
- Supabase Edge Function for bank rate updates (daily cron)

**Why it leapfrogs Immobiliare.it:**
- No Albanian platform integrates with local banks
- Albanian mortgage market is growing but opaque — this adds transparency
- Revenue stream: banks pay per qualified lead (€5-20 per lead)
- Keeps users on platform longer (research phase → purchase phase)

**Acceptance criteria:**
- Calculator updates instantly as user adjusts sliders
- Bank rates refresh daily and show "last updated" timestamp
- At least 4 Albanian banks included at launch
- Affordability check accounts for Albanian tax rules
- Lead submission to bank partner confirmed within 30 seconds

---

### 10.4 Neighborhood Intelligence & Area Guides

**What it does:** Rich, data-driven neighborhood profiles that help buyers evaluate locations — not just properties.

**Functionality:**
- Dedicated neighborhood page for every major area (e.g., `/neighborhoods/tirana/blloku`)
- Walk Score equivalent: walkability, transit access, bike-friendliness (custom-calculated)
- Amenity heatmap overlay on map: schools, hospitals, pharmacies, supermarkets, gyms, parks
- Safety data: crime statistics per zone (from Albanian police open data, if available)
- Noise level estimates (proximity to roads, nightlife, construction)
- Average property prices per sqm (chart with 12-month trend)
- Demographic snapshot: population density, age distribution
- "Best neighborhoods for..." curated guides (families, students, expats, retirees)
- Photo gallery of the neighborhood (user-contributed + editorial)
- Nearby public transport stops with routes

**Technical requirements:**
- OpenStreetMap + Overpass API for amenity data (schools, hospitals, etc.)
- Custom walk score algorithm based on amenity proximity + road network
- PostGIS spatial queries for all proximity calculations
- Google Places API (fallback) for POI data
- Static data pipeline: Albanian census data, cadastral zones, police statistics
- Neighborhood boundaries stored as PostGIS polygons
- Pre-computed scores regenerated weekly via cron

**Why it leapfrogs Immobiliare.it:**
- Immobiliare.it has basic neighborhood info — nothing data-driven for Albania
- Buyers (especially diaspora) don't know Albanian neighborhoods well
- Increases time-on-site by 3-5x (users explore areas before searching listings)
- SEO goldmine: neighborhood pages rank for "best areas to live in Tirana" etc.

**Acceptance criteria:**
- Neighborhood page loads in under 2 seconds
- Amenity heatmap renders with 500+ POIs without lag
- Walk score calculated for all neighborhoods in Tirana, Durrës, Vlorë, Sarandë
- At least 5 amenity categories shown per neighborhood
- Area guide content available in both Albanian and English

---

### 10.5 Seller/Agent Verification & Trust Scores

**What it does:** A transparent trust system that verifies seller identity and tracks reputation — reduces fraud and builds buyer confidence.

**Functionality:**
- **Identity verification:** Upload ID document (Albanian ID card or passport) → AI-verified
- **Phone verification:** SMS OTP to Albanian phone number
- **Address verification:** Utility bill or bank statement upload
- Verification badges displayed on profile and listings: ✓ ID Verified, ✓ Phone Verified, ✓ Address Verified
- **Trust score** (0-100) calculated from:
  - Verification level (ID, phone, address)
  - Account age
  - Number of successful transactions
  - Response time to messages
  - Review ratings from buyers
  - Listing accuracy (no reported fake listings)
- **Agent certification:** Verified agents show license number, agency affiliation, years active
- **Review system:** Buyers can leave reviews after completing a transaction
- "Verified Only" filter in search results

**Technical requirements:**
- ID verification: integrate with Onfido, Jumio, or Veriff API
- SMS OTP: Twilio or MessageBird (supports Albanian carriers)
- Trust score algorithm: weighted composite in Supabase Edge Function
- `verifications` table: user_id, type, status, verified_at, document_url
- `reviews` table: reviewer_id, reviewed_id, listing_id, rating, comment, created_at
- Admin moderation queue for flagged verifications
- Trust score recalculated on each contributing event

**Why it leapfrogs Immobiliare.it:**
- Albanian real estate market has significant trust issues (fake listings, scams)
- No competitor offers identity-verified sellers
- Trust badges increase contact rates by 40-60% (industry data)
- Creates a moat: verified sellers won't switch to unverified platforms

**Acceptance criteria:**
- ID verification completes in under 60 seconds
- SMS OTP delivered within 10 seconds
- Trust score updates within 5 minutes of a contributing event
- Verified badge visible on all listing cards and detail pages
- Admin can manually override verification status

---

### 10.6 Natural Language AI Search

**What it does:** Users describe what they want in plain language instead of filling out filter forms — AI translates to structured search.

**Functionality:**
- Prominent search bar on homepage: "Describe your dream property..."
- Example queries:
  - "2 bedroom apartment near Blloku under €80,000"
  - "House with garden in Durrës, close to the beach"
  - "Office space in Tirana center, at least 100 sqm, with parking"
  - "Cheap studio for students near university"
- AI extracts: property type, location, price range, bedrooms, features, intent
- Results shown on map + list view with extracted filters highlighted
- "Did you mean?" clarification if query is ambiguous
- Search history saved for registered users
- Voice search on mobile (speech-to-text → AI → results)

**Technical requirements:**
- Anthropic Claude API (or OpenAI) for natural language understanding
- Structured extraction prompt: query → JSON filter object
- Filter JSON mapped to existing Supabase query parameters
- Fallback: if AI can't extract, show standard filter form pre-filled with best guesses
- Voice input: Web Speech API (web) + expo-speech (mobile)
- Rate limit: 20 AI searches per user per day

**Why it leapfrogs Immobiliare.it:**
- No real estate platform in the Balkans has AI-powered search
- Dramatically lowers barrier to entry (no form-filling, especially on mobile)
- Captures long-tail intent that filters can't express ("quiet neighborhood", "good for families")
- Voice search critical for mobile-first Albanian market

**Acceptance criteria:**
- AI search returns results in under 2 seconds
- Correctly extracts location, price, bedrooms, and property type in 90%+ of queries
- Works in both Albanian and English
- Voice search works on iOS and Android
- Graceful fallback when AI can't parse query

---

### 10.7 Price History & Market Analytics

**What it does:** Transparent price data and market trends that turn the platform into Albania's real estate data source of truth.

**Functionality:**
- **Listing price history:** Every listing shows price changes over time (price drops, increases)
- **Neighborhood price trends:** Average price per sqm chart (monthly, 12-month rolling)
- **Market dashboard** (public page):
  - Average prices by city and neighborhood
  - Price per sqm trends (sale + rent)
  - Supply/demand ratio (new listings vs. searches per area)
  - Days on market average per area
  - Hottest neighborhoods (most views, most searches)
- **Price alerts:** Users set a target price for an area → notified when listings match
- **Monthly market report** (auto-generated): PDF summary emailed to registered users
- **API access** (Phase 3): Paid API for developers, banks, and real estate agencies

**Technical requirements:**
- `listing_price_history` table: listing_id, price, changed_at (trigger on price update)
- Materialized views in PostgreSQL for aggregated stats (refreshed hourly)
- Chart library: Recharts (web) / react-native-chart-kit (mobile)
- PDF report generation: Puppeteer on Vercel serverless (or React-PDF)
- Cron job: weekly aggregation of market metrics
- Data retention: price history kept indefinitely

**Why it leapfrogs Immobiliare.it:**
- Albanian real estate has zero price transparency — this changes the game
- Users (buyers, sellers, agents, banks, investors) all need this data
- SEO powerhouse: "Tirana real estate prices 2026" etc.
- Positions platform as a data authority (media citations, bank partnerships)
- Future revenue: paid API access for institutional users

**Acceptance criteria:**
- Price history chart renders in under 1 second
- Neighborhood trends cover at least 6 months of data
- Market dashboard loads in under 3 seconds with all charts
- Price alerts fire within 1 hour of a matching listing
- Monthly report auto-generates and sends to all opted-in users

---

### 10.8 WhatsApp & Viber Direct Messaging Integration

**What it does:** Let buyers contact sellers through Albania's most-used messaging apps — WhatsApp and Viber — directly from listings.

**Functionality:**
- "Message on WhatsApp" button on every listing (pre-filled message with listing link)
- "Message on Viber" button on every listing
- Seller chooses preferred contact method during listing creation: in-app, WhatsApp, Viber, or all
- Pre-formatted message: "Hi, I'm interested in your [property type] at [address] listed for [price] on [platform name]. Is it still available?"
- Click-to-call via WhatsApp/Viber (voice call option)
- Contact method icons displayed prominently on listing cards (not just detail page)
- Analytics: track which contact method gets the most clicks per listing

**Technical requirements:**
- WhatsApp: `https://wa.me/{phone}?text={encoded_message}` deep link
- Viber: `viber://chat?number={phone}&text={encoded_message}` deep link
- Phone number formatting: Albanian format (+355) auto-prepended
- Mobile: native deep links open WhatsApp/Viber apps directly
- Web: fallback to WhatsApp Web / Viber Web if app not installed
- Contact analytics: `contact_events` table tracking method, listing_id, timestamp

**Why it leapfrogs Immobiliare.it:**
- WhatsApp and Viber are the dominant communication channels in Albania (90%+ penetration)
- Immobiliare.it forces users into email or in-app messaging — nobody uses those in Albania
- Reduces friction massively: buyers already have WhatsApp open, one tap to inquire
- Higher contact rates = more transactions = more platform value

**Acceptance criteria:**
- WhatsApp button opens WhatsApp with pre-filled message in under 2 seconds
- Viber button opens Viber with pre-filled message in under 2 seconds
- Pre-filled message includes listing link that resolves to the correct property
- Works on both mobile (native app deep links) and web (web versions)
- Contact method preference respected in search result listing cards

---

### 10.9 Augmented Reality (AR) Property Preview

**What it does:** Point your phone camera at any building to see available listings inside it — a "Shazam for real estate" experience.

**Functionality:**
- "AR View" button on map screen → opens camera
- Point camera at a building → overlay shows: number of available listings, price range
- Tap overlay → see listing cards for that building
- "AR Walk" mode: walk down a street, see floating listing pins above buildings with available properties
- Works with GPS + compass for outdoor use (no marker needed)
- Indoor AR: point camera at a room → see dimensions overlay (using LiDAR on iPhone Pro)
- AR furniture placement: visualize furniture in empty rooms (stretch goal)

**Technical requirements:**
- iOS: ARKit + RealityKit via expo-ar or react-native-arkit
- Android: ARCore via react-native-arcore
- Location-based AR: GPS + compass heading → match to geocoded listings
- Building footprint data: OpenStreetMap building polygons
- 3D pin rendering: Three.js (web fallback) or SceneKit/ARCore anchors (native)
- LiDAR room scanning: available on iPhone 12 Pro+ only
- Fallback for non-AR devices: camera view with GPS-based overlays (simpler)

**Why it leapfrogs Immobiliare.it:**
- No real estate platform worldwide has deployed this for a specific market
- Creates massive viral/social media potential ("look what this app does!")
- Particularly useful for walk-in property discovery in dense Albanian urban areas
- Positions the brand as a tech leader, attracting press coverage and investor interest

**Acceptance criteria:**
- AR view loads in under 3 seconds after camera permission granted
- Listing overlays appear within 50 meters of the actual property
- Works accurately in Tirana city center (dense building environment)
- Graceful degradation on non-AR devices (GPS-only overlay)
- Battery consumption: less than 10% per 15 minutes of AR use

---

### 10.10 Automated Listing Quality Scoring

**What it does:** AI analyzes every listing and gives it a quality score — incentivizing sellers to create better listings and improving buyer experience.

**Functionality:**
- Every listing gets a **Quality Score** (0-100) shown to the seller
- Score breakdown with actionable tips:
  - **Photos (40%):** Number of photos, resolution, lighting, variety (exterior, interior, bathroom, kitchen)
  - **Description (25%):** Word count, keyword richness, grammar, readability
  - **Completeness (20%):** How many optional fields are filled (floor, year built, parking, etc.)
  - **Accuracy (15%):** Price within market range, location pin matches address
- "Improve your listing" checklist: specific suggestions to increase score
- Score badge on listing cards: Gold (90+), Silver (70-89), Bronze (50-69), Unrated (<50)
- Higher-scored listings get better placement in search results (transparent to users)
- Admin alert for listings scoring below 30 (likely spam or fake)

**Technical requirements:**
- Photo analysis: Anthropic Claude Vision API or Google Cloud Vision for quality assessment
- Description analysis: Claude API for readability, completeness, tone scoring
- Completeness: simple field-presence calculation
- Market price comparison: compare listing price to neighborhood average (from 10.7 data)
- Quality score stored in `listings` table, recalculated on each edit
- Supabase Edge Function triggered on listing create/update

**Why it leapfrogs Immobiliare.it:**
- Immobiliare.it is flooded with low-quality listings (bad photos, sparse descriptions)
- Gamification: sellers compete to improve scores → platform quality rises automatically
- Higher quality = more buyer trust = more transactions
- Natural spam/fake detection mechanism (low scores flagged for review)

**Acceptance criteria:**
- Quality score calculates in under 10 seconds after listing save
- Photo analysis correctly identifies dark, blurry, or irrelevant images
- Improvement suggestions are specific and actionable ("Add a photo of the kitchen")
- Score breakdown shown in seller dashboard per listing
- Search results factor quality score into ranking (configurable weight)

---

### 10.11 Dynamic Pricing Recommendations for Sellers

**What it does:** AI suggests the optimal listing price based on market data — helps sellers price competitively and sell faster.

**Functionality:**
- "Suggested price" shown during listing creation (after entering property details)
- Price range: low (quick sale), market (fair value), high (premium positioning)
- Comparison chart: "Your price vs. similar properties" with specific comps
- "Price too high" warning: if listed price is >20% above suggested, show alert with data
- "Price drop suggestion" notification: if listing has been active 30+ days with low views
- Weekly email to sellers: "Market update for your listing — consider adjusting price"
- Time-to-sell estimate: "Properties priced at €X in this area sell in ~Y days"

**Technical requirements:**
- Pricing model: hedonic regression using property attributes + location
- Training data: historical listings (price, attributes, days on market, sold price if available)
- Comparable selection: PostGIS proximity query + attribute matching (±20% area, same bedrooms, same type)
- Price suggestion API: Supabase Edge Function, response cached per listing for 24h
- Notification triggers: Supabase cron checks active listings daily for price adjustment opportunities
- A/B testing framework to measure impact on conversion rate

**Why it leapfrogs Immobiliare.it:**
- Sellers on Albanian platforms consistently overprice (no data available to them)
- Overpriced listings sit for months → stale inventory → buyers lose trust in platform
- Dynamic pricing keeps inventory fresh and competitively priced
- Positions platform as a trusted advisor, not just a listing board

**Acceptance criteria:**
- Price suggestion generates in under 3 seconds
- At least 5 comparable properties used for each suggestion
- Suggestion accuracy: within ±10% of eventual sale price (measured over time)
- Price drop suggestions sent only for listings active 30+ days with below-average views
- Sellers can dismiss suggestions (not nagging)

---

### 10.12 Property & Neighborhood Comparison Tools

**What it does:** Side-by-side comparison of properties and neighborhoods — helps buyers make informed decisions without opening 10 tabs.

**Functionality:**
- **Property comparison:**
  - "Add to compare" button on listing cards (max 4 properties)
  - Comparison view: side-by-side table with all attributes aligned
  - Differences highlighted (e.g., green for better value, red for worse)
  - Price per sqm calculated and compared
  - Photo gallery for each property in the comparison
  - "Share comparison" link (shareable URL)
  - Proximity comparison: show all compared properties on one map

- **Neighborhood comparison:**
  - Select 2-4 neighborhoods → side-by-side comparison
  - Metrics compared: avg price/sqm, safety score, walk score, amenities count, transit access
  - Radar chart visualization of key metrics
  - "Better for families" / "Better for students" / "Better for investors" tags
  - Compare commute times from each neighborhood to a chosen destination (work, school)

**Technical requirements:**
- Comparison state: stored in localStorage (visitors) or user profile (registered)
- Comparison URL: filter params encoded in URL for shareability
- Radar chart: Recharts RadarChart component
- Commute time: Mapbox Directions API or OSRM for routing
- Neighborhood data: from 10.4 neighborhood intelligence system
- Mobile: swipeable cards for property comparison (fits small screens)

**Why it leapfrogs Immobiliare.it:**
- Immobiliare.it has no comparison tools — users open multiple tabs
- Reduces decision paralysis: clear visual comparison helps buyers decide faster
- Shared comparison links increase viral distribution (sent to family, partners)
- Neighborhood comparison is unique — no Albanian platform offers this

**Acceptance criteria:**
- Comparison table loads in under 1 second
- Radar chart renders correctly with all metrics
- Shared comparison URL opens the same comparison for any user
- Mobile comparison view is usable without horizontal scrolling
- Commute time calculates in under 3 seconds per route

---

## 11. Phase 2 Database Schema Additions

```sql
-- Property Valuation (10.1)
valuations (id, user_id, address, lat, lng, property_type, area_sqm,
            bedrooms, estimated_low, estimated_mid, estimated_high,
            confidence_score, comparables_json, created_at)

-- Virtual Tours (10.2)
virtual_tours (id, listing_id, tour_type enum(matterport, video, photos_360),
               tour_url, thumbnail_url, view_count, created_at)

-- Neighborhood Intelligence (10.4)
neighborhoods (id, name, city, boundary_geom, walk_score, transit_score,
               safety_score, avg_price_sqm, population_density,
               description_sq, description_en, photos_json, updated_at)
amenities (id, name, type enum(school, hospital, pharmacy, supermarket,
           gym, park, restaurant, transit_stop), lat, lng, geom,
           neighborhood_id, source, created_at)

-- Verification & Trust (10.5)
verifications (id, user_id, type enum(id_document, phone, address, agent_license),
               status enum(pending, verified, rejected), document_url,
               verified_at, reviewer_id, created_at)
reviews (id, reviewer_id, reviewed_user_id, listing_id, rating integer,
         comment text, created_at)
trust_scores (user_id, score integer, breakdown_json, recalculated_at)

-- Price History & Analytics (10.7)
listing_price_history (id, listing_id, old_price, new_price, currency,
                       changed_at)
market_metrics (id, city, neighborhood, period date, avg_price_sqm_sale,
                avg_price_sqm_rent, listings_count, avg_days_on_market,
                searches_count, created_at)

-- Contact Analytics (10.8)
contact_events (id, listing_id, user_id, method enum(in_app, whatsapp,
                viber, phone, email), created_at)

-- Listing Quality (10.10)
listing_quality_scores (listing_id, total_score integer, photos_score integer,
                        description_score integer, completeness_score integer,
                        accuracy_score integer, suggestions_json,
                        recalculated_at)

-- Price Recommendations (10.11)
price_suggestions (id, listing_id, suggested_low, suggested_mid,
                   suggested_high, comparables_json, model_version,
                   created_at)

-- Comparisons (10.12)
saved_comparisons (id, user_id, type enum(property, neighborhood),
                   item_ids_json, share_token, created_at)

-- Spatial indexes
CREATE INDEX idx_amenities_geom ON amenities USING GIST(geom);
CREATE INDEX idx_neighborhoods_boundary ON neighborhoods USING GIST(boundary_geom);
CREATE INDEX idx_valuations_location ON valuations USING GIST(ST_MakePoint(lng, lat)::geography);
```

---

## 12. Phase 2 Milestones & Budget Estimate

| Milestone | What's delivered | Payment |
|---|---|---|
| **P2-M1: Data Foundation** | Neighborhood intelligence, price history tracking, market analytics dashboard | 15% |
| **P2-M2: Trust & Quality** | Seller verification system, trust scores, listing quality scoring, review system | 15% |
| **P2-M3: AI Features** | AI property valuation, natural language search, dynamic pricing recommendations | 20% |
| **P2-M4: Communication** | WhatsApp/Viber integration, contact analytics | 10% |
| **P2-M5: Immersive Experience** | Virtual 3D tours, AR property preview, comparison tools | 20% |
| **P2-M6: Financial Tools** | Mortgage calculator, bank integration, affordability checker | 10% |
| **P2-M7: Polish & Launch** | Integration testing, performance optimization, A/B testing setup, launch | 10% |

> **Suggested Phase 2 budget range: €20,000 — €45,000** depending on AI/ML complexity, AR implementation depth, and third-party API costs. Phase 2 can be started 1-2 months after Phase 1 launch, once real user data informs prioritization.

> **Recommended Phase 2 priority order:** 10.8 (WhatsApp/Viber) → 10.5 (Trust) → 10.10 (Quality Scoring) → 10.4 (Neighborhoods) → 10.7 (Price History) → 10.1 (Valuation) → 10.6 (AI Search) → 10.11 (Dynamic Pricing) → 10.3 (Mortgage) → 10.12 (Comparison) → 10.2 (3D Tours) → 10.9 (AR). This order prioritizes high-impact, lower-complexity features first.

---

## 13. Competitive Positioning Summary

| Feature | Our Platform | Immobiliare.it | Merrjep.al | Njoftime.com |
|---|---|---|---|---|
| AI Property Valuation | ✅ Phase 2 | ❌ | ❌ | ❌ |
| Virtual 3D Tours | ✅ Phase 2 | ❌ (Albania) | ❌ | ❌ |
| Mortgage Calculator | ✅ Phase 2 | ❌ (Albania) | ❌ | ❌ |
| Neighborhood Intelligence | ✅ Phase 2 | Basic | ❌ | ❌ |
| Seller Verification | ✅ Phase 2 | ❌ | ❌ | ❌ |
| AI Natural Language Search | ✅ Phase 2 | ❌ | ❌ | ❌ |
| Price History & Analytics | ✅ Phase 2 | ❌ (Albania) | ❌ | ❌ |
| WhatsApp/Viber Integration | ✅ Phase 2 | ❌ | ❌ | ❌ |
| AR Property Preview | ✅ Phase 2 | ❌ | ❌ | ❌ |
| Listing Quality Scoring | ✅ Phase 2 | ❌ | ❌ | ❌ |
| Dynamic Pricing | ✅ Phase 2 | ❌ | ❌ | ❌ |
| Comparison Tools | ✅ Phase 2 | Basic | ❌ | ❌ |
| Map Geo-Search | ✅ Phase 1 | ✅ | ❌ | ❌ |
| Native Mobile App | ✅ Phase 1 | ✅ | ❌ | ❌ |
| In-App Messaging | ✅ Phase 1 | ✅ | Basic | ❌ |
| Albanian Language | ✅ Phase 1 | ❌ | ✅ | ✅ |
