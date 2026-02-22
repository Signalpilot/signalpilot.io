# Real Estate App — Technical Specification (Albania MVP)

> **Purpose:** Hand this document to developers for accurate, comparable quotes.
> **Scope:** Web-only MVP. Mobile app deferred to Phase 2.
> **Target market:** Albanian real estate (property sales & rentals)

---

## 1. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14+ (App Router) | SSR for SEO, React ecosystem, fast iteration |
| Styling | Tailwind CSS | Rapid UI development, responsive by default |
| Backend & Auth | Supabase | Auth, Postgres, Realtime, Storage — all-in-one |
| Database | PostgreSQL + PostGIS | Geo-spatial queries for map search |
| Maps | Mapbox GL JS | Free tier is generous, better customization than Google |
| Payments | Stripe | Standard for SaaS billing |
| Hosting | Vercel | Native Next.js hosting, easy deploys |
| File Storage | Supabase Storage | Property photos, documents |
| Language | TypeScript | Type safety across the stack |

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

These are **explicitly excluded** from Phase 1 to keep scope and cost manageable:

- Native mobile app (iOS/Android)
- AI-generated descriptions
- Stripe payments / subscription plans
- Boost/promote listings (paid features)
- Trust scores / verification system
- In-app messaging / chat
- Video tours / virtual tours
- Mortgage calculator
- Multi-language support
- Push notifications
- Advanced analytics dashboard
- Audit logging

---

## 6. Database Schema Overview

```sql
-- Core tables
users (id, email, name, phone, photo_url, role, created_at)
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

-- PostGIS
-- listings.geom is type geography(Point, 4326)
-- Spatial index on listings.geom
```

---

## 7. Deliverables Expected from Developer

1. **Source code** in a private GitHub/GitLab repo with full access
2. **Deployed staging environment** on Vercel (dev branch)
3. **Deployed production environment** on Vercel (main branch)
4. **Supabase project** with all migrations in code (reproducible)
5. **Documentation:** README with setup instructions, environment variables, deployment steps
6. **Handoff session:** 1-hour walkthrough of codebase and architecture

---

## 8. Milestones & Payment Structure (Suggested)

| Milestone | What's delivered | Payment |
|---|---|---|
| **M1: Foundation** | Auth, user profiles, basic project setup, DB schema | 20% |
| **M2: Listings** | Full listing CRUD, photo upload, listing detail page | 25% |
| **M3: Search & Map** | Map view, geo-search, filters, list view | 25% |
| **M4: Dashboards** | User dashboard, admin dashboard, favorites, alerts | 20% |
| **M5: Launch** | SEO, performance, bug fixes, deployment, handoff | 10% |

> **Suggested total budget range: €5,000 — €10,000** depending on developer location and experience.

---

## 9. How to Use This Document

1. Send this spec to 2-3 developers
2. Ask each for: total price, timeline, and portfolio of similar work
3. Compare quotes against the same scope
4. Negotiate milestone-based payments (never pay 100% upfront)
5. Ensure the contract includes source code ownership transfer to you

---

*Document prepared February 2026. Scope may be adjusted based on budget and priorities.*
