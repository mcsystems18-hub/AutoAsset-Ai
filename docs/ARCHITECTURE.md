# AutoAsset AI — Automated Checkout & Fulfillment System

## Overview
Zero-touch purchase flow for digital products (templates, checklists, resource kits) sold to real estate investors, landlords, and property managers. Every sale from click to delivery happens automatically — no human involvement.

---

## 1. Payment Processor Recommendation: Stripe

### Why Stripe Over Alternatives

| Feature | **Stripe** ✅ | Gumroad | Payhip | Shopify |
|---------|-------------|---------|--------|---------|
| Digital delivery API | ✅ Stripe Billing + Webhooks | ✅ Built-in | ✅ Built-in | ❌ Needs app |
| Subscription management | ✅ Native | ✅ Limited | ✅ Basic | ✅ Via apps |
| Affiliate/commission tracking | ✅ Stripe Connect | ❌ No | ❌ No | ✅ Via apps |
| Checkout customization | ✅ Full (Stripe Checkout/ Elements) | ❌ Limited | ❌ Limited | ✅ Via Liquid |
| Transaction fees | 2.9% + $0.30 | 8% + $0.30 (free plan) | 5% + $0.50 | 2.9% + $0.30 + $29/mo |
| API access & webhooks | ✅ Excellent | ✅ Limited | ✅ Basic | ✅ Good |
| International payments | ✅ 135+ currencies | ✅ Limited | ✅ Limited | ✅ Via Shopify Payments |

### Recommended Stack
- **Stripe** as primary payment processor
- **Stripe Checkout** (hosted) for one-time product sales — no PCI burden
- **Stripe Billing** for subscription/membership recurring payments
- **Stripe Webhooks** to trigger digital delivery, email sequences, and affiliate payouts
- **Stripe Customer Portal** for subscription self-management (upgrade, cancel, update payment)

### Stripe Product Catalog Setup

```json
// Products to create in Stripe Dashboard
[
  {
    "name": "Landlord Lease Agreement Pack",
    "type": "service", // Stripe uses "service" for digital goods
    "metadata": { "product_type": "template", "delivery_type": "instant_download" },
    "default_price_data": {
      "currency": "usd",
      "unit_amount": 1499, // $14.99
      "recurring": null // one-time
    }
  },
  {
    "name": "Property Management Master Toolkit",
    "type": "service",
    "metadata": { "product_type": "bundle", "delivery_type": "instant_download" },
    "default_price_data": {
      "currency": "usd",
      "unit_amount": 4900, // $49.00 — bundle
      "recurring": null
    }
  },
  {
    "name": "Landlord Starter Kit (Bundle)",
    "type": "service",
    "metadata": { "product_type": "bundle", "delivery_type": "instant_download" },
    "default_price_data": {
      "currency": "usd",
      "unit_amount": 7900, // $79.00
      "recurring": null
    }
  },
  {
    "name": "Template Library Membership",
    "type": "service",
    "metadata": { "product_type": "subscription", "delivery_type": "member_area" },
    "default_price_data": {
      "currency": "usd",
      "unit_amount": 1900, // $19/mo
      "recurring": { "interval": "month" }
    }
  },
  {
    "name": "Template Library Membership (Annual)",
    "type": "service",
    "metadata": { "product_type": "subscription", "delivery_type": "member_area" },
    "default_price_data": {
      "currency": "usd",
      "unit_amount": 14900, // $149/yr (saves $79)
      "recurring": { "interval": "year" }
    }
  }
]
```

---

## 2. Automated Purchase Flow (End-to-End)

```
CUSTOMER LANDING PAGE
         │
         ▼
  [Buy Button Click]
         │
         ▼
  STRIPE CHECKOUT SESSION
  (Hosted checkout page)
         │
         ├─── Payment Successful ──► STRIPE WEBHOOK
         │                              │
         │                              ├──► DIGITAL DELIVERY ENGINE
         │                              │       ├── Generate secure download link (signed URL, 24h expiry)
         │                              │       ├── Save purchase record to DB
         │                              │       └── Grant member area access (if subscription)
         │                              │
         │                              ├──► EMAIL TRIGGER
         │                              │       ├── Send: Purchase Confirmation + Download Link
         │                              │       └── Schedule: Thank-you (24h) and Upsell (72h)
         │                              │
         │                              ├──► AFFILIATE TRACKING
         │                              │       └── Credit affiliate commission
         │                              │
         │                              └──► KPI UPDATE
         │                                      └── Log sale to monitoring dashboard
         │
         └─── Payment Failed ──► Send abandoned checkout email (if email collected)
```

### Webhook Endpoints Required

| Webhook Event | Handler Action |
|--------------|----------------|
| `checkout.session.completed` | Trigger digital delivery, send confirmation email, log sale |
| `customer.subscription.created` | Grant member area access, send welcome email |
| `customer.subscription.updated` | Handle plan changes (upgrade/downgrade) |
| `customer.subscription.deleted` | Revoke member area access, send cancellation email |
| `invoice.payment_succeeded` | Handle recurring subscription renewals |
| `invoice.payment_failed` | Send payment failure notification + retry logic |
| `checkout.session.expired` | Trigger abandoned cart sequence |

---

## 3. Digital Delivery Engine

### Instant Download Architecture

```
STRIPE WEBHOOK ──► /api/deliver-product
                        │
                        ├── Validate webhook signature (Stripe SDK)
                        ├── Lookup product metadata
                        ├── Generate secure download token
                        │     └── JWT: { purchase_id, email, product_id, exp: 24h }
                        ├── Upload to CDN/CDN-signed URL if files are on S3/Cloudflare R2
                        │     └── For MVP: Serve directly from app server /downloads/
                        ├── Store purchase in SQLite `purchases` table
                        └── Queue email delivery
```

### File Storage Strategy

| Tier | Storage | Pros | Cost |
|------|---------|------|------|
| **MVP** | Server filesystem via Express/Node static | Zero extra cost, simple | Free (included) |
| **Scale** | Cloudflare R2 + signed URLs | $0.015/GB/mo, no egress fees | ~$0.15/mo for 10GB |
| **Enterprise** | AWS S3 + CloudFront signed URLs | Global CDN, DDoS protection | ~$1-5/mo |

### Download Page (Customer-Facing)

When a customer clicks their download link, they see:
- Product name and order summary
- Download button (one-click, no login required for one-time purchases)
- File format info (PDF, DOCX, XLSX, etc.)
- License terms
- Support contact (email-only, automated)

### Member Area (For Subscription Users)

For subscription members, a simple gated page:
- **Login via magic link** (email-based, no password needed for MVP)
- Library of all available templates
- Recent downloads history
- Manage subscription link (Stripe Customer Portal)
- New content notifications

---

## 4. Email Sequences (Automated)

### Email Service Recommendation: **Resend** (for MVP) → **Loops.so** (at scale)

| Feature | Resend | Loops.so | SendGrid | Mailgun |
|---------|--------|----------|----------|---------|
| Free tier | 100 emails/day | 10,000/mo (free) | 100/day | 5,000/mo (free) |
| Transactional | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Excellent |
| Marketing automation | ❌ No | ✅ Yes | ✅ Yes | ❌ Basic |
| Template builder | ✅ Yes | ✅ Yes | ✅ Yes | ❌ API-only |
| API quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

### Sender Email Setup
- **From:** AutoAsset AI <hello@autoasset.ai>
- **DMARC/SPF/DKIM:** Configure DNS records for deliverability
- **Reply-to:** support@autoasset.ai (auto-replies with knowledge base links)

### Flow 1: Purchase Confirmation (Immediate)

**Trigger:** `checkout.session.completed` webhook fires
**Delay:** 0 seconds
**Email Type:** Transactional

```
Subject: 📥 Your downloads are ready — [Product Name]

Hi [First Name],

Thanks for your purchase! Your digital products are ready for instant download.

🔗 DOWNLOAD YOUR FILES:
[Download Button / Link]

Your Order:
— [Product Name] ($[Price])
— Order #: [Order ID]

These files are yours to keep forever. If you have any questions, check our FAQ.

Happy investing,
The AutoAsset AI Team
```

### Flow 2: Welcome + Quick Start (24 Hours Later)

**Trigger:** Timer after purchase confirmation
**Delay:** 24 hours
**Email Type:** Marketing (but soft sell)

```
Subject: Getting the most out of [Product Name]

Hi [First Name],

You purchased [Product Name] yesterday — here's a quick tip to get started:

💡 PRO TIP: [One actionable tip related to the product]

For example, if you bought our Landlord Lease Agreement Pack:
"Customize the early-termination clause on page 3 to match your state's laws."

📚 RESOURCES:
• [Link to related product]
• [Link to blog post or guide]

If you missed your download link, here it is again: [Download Link]

— The AutoAsset AI Team
```

### Flow 3: Upsell Offer (3 Days Later)

**Trigger:** Timer after purchase
**Delay:** 72 hours
**Email Type:** Marketing

```
Subject: Complete your toolkit — special offer inside 🎯

Hi [First Name],

You picked up [Product Purchased] — nice choice! Most customers who buy this also grab:

🔥 RECOMMENDED BUNDLE:
[Suggested Bundle Name] — normally $[Price], today $[Discounted Price]

👉 [CTA: Upgrade Now]

Or consider our Template Library Membership for unlimited access:
→ All current templates included
→ New templates added monthly
→ Cancel anytime

👉 [CTA: Join the Library — $19/mo]

You're building an impressive toolkit. Keep going!

— The AutoAsset AI Team
```

### Flow 4: Subscription Renewal Success (On Renewal)

**Trigger:** `invoice.payment_succeeded` for subscription
**Delay:** 0 seconds
**Email Type:** Transactional

```
Subject: ✅ Your AutoAsset AI membership has been renewed

Hi [First Name],

Your Template Library Membership has been renewed for another [month/year].

💰 Amount: $[Amount]
📅 Next billing: [Date]

You now have access to [N] templates in your library. Check out what's new:
[Link to Member Area]

— The AutoAsset AI Team
```

### Flow 5: Payment Failure (On Failed Invoice)

**Trigger:** `invoice.payment_failed`
**Delay:** 0 seconds (immediate), then 3 days, then 7 days
**Email Type:** Transactional (urgent)

```
Subject: ⚠️ Payment issue — your membership needs attention

Hi [First Name],

We couldn't process your payment of $[Amount] for your AutoAsset AI membership.

🔧 UPDATE PAYMENT METHOD:
[Link to Stripe Customer Portal]

Your membership is still active for now, but if payment isn't resolved within 7 days, access will be suspended.

Need help? Reply to this email.

— The AutoAsset AI Team
```

### Flow 6: Abandoned Cart Recovery

**Trigger:** `checkout.session.expired` webhook (only if email was collected)
**Delay:** 1 hour after session expires
**Email Type:** Marketing

```
Subject: Still thinking about [Product Name]? 🧐

Hi there,

You started checking out [Product Name] but didn't complete the purchase.

No pressure — but here's what you're missing:
• ✅ Ready-to-use, customizable templates
• ✅ Save hours of paperwork
• ✅ Used by 100+ landlords & investors

👉 [CTA: Complete Your Purchase — [Link]]

Or if you have questions, just hit reply.

— The AutoAsset AI Team
```

---

## 5. Affiliate Tracking System

### Architecture

```
AFFILIATE SIGNS UP
        │
        ├──► Gets unique referral link: https://autoasset.ai/?ref=AFF123
        │
        ▼
CUSTOMER CLICKS LINK ──► Cookie stored (30-day expiry)
        │
        ▼
CUSTOMER PURCHASES ──► Stripe Checkout session has ?ref=AFF123 metadata
        │
        ▼
WEBHOOK PROCESSOR ──► Matches ref code to affiliate account
        │
        ├──► Commission calculated (e.g., 20% of sale)
        ├──► Commission logged in DB (`affiliate_commissions` table)
        └──► Affiliate dashboard updated
```

### Affiliate Commission Structure

| Product Type | Commission Rate | Payout Schedule |
|-------------|----------------|-----------------|
| One-time templates ($9–$49) | 20% | Monthly (net-30) |
| Bundles ($79–$149) | 15% | Monthly (net-30) |
| Subscriptions ($19/mo or $149/yr) | 20% of first payment | Monthly (net-30) |
| Recurring on subscriptions | 10% ongoing | Monthly |

### Implementation Options

| Option | Complexity | Cost | Best For |
|--------|-----------|------|----------|
| **Custom (Stripe Connect Express)** | Medium | Free (Stripe fees) | Full control, own data |
| **FirstPromoter** | Low | $79/mo + 1% | Quick launch, turnkey |
| **Refersion** | Low | $99/mo | Enterprise scaling |
| **Post Affiliate Pro** | Medium | $97/mo | Feature-rich |

### Custom Affiliate Dashboard (In-App)

```
Affiliate Dashboard (/dashboard/affiliate)
├── Your Referral Link: https://autoasset.ai/?ref=[CODE]
├── Shareable banner assets
├── Earnings Summary
│   ├── This month: $XXX
│   ├── All time: $XXX
│   └── Pending payout: $XXX
├── Recent Referrals (table)
│   ├── Date | Visitor | Sale Amount | Commission | Status
│   └── ...
└── Payout History
    ├── Date | Amount | Method | Status
    └── ...
```

---

## 6. Monitoring Dashboard

### Real-Time Sales Display

A simple admin dashboard showing:

```
┌─────────────────────────────────────────────────────┐
│  AUTOASSET AI — LIVE SALES DASHBOARD                │
├─────────────────────────────────────────────────────┤
│  TODAY                      THIS MONTH              │
│  ┌──────────┐              ┌──────────┐             │
│  │ $XXX.XX  │              │ $X,XXX   │             │
│  │ Revenue  │              │ Revenue  │             │
│  └──────────┘              └──────────┘             │
│  ┌──────────┐  ┌─────────┐ ┌──────────┐ ┌────────┐ │
│  │    X     │  │   X.X%  │ │  $XX.XX  │ │   X    │ │
│  │  Sales   │  │  Conv.  │ │   AOV    │ │ Active │ │
│  │          │  │  Rate   │ │          │ │ Subs  │ │
│  └──────────┘  └─────────┘ └──────────┘ └────────┘ │
│                                                      │
│  ┌─── LIVE ACTIVITY FEED ─────────────────────────┐ │
│  │ 🟢 John D. bought "Landlord Lease Pack" — $15  │ │
│  │ 🟢 Sarah M. subscribed (Monthly) — $19         │ │
│  │ 🟢 Mike R. bought "Master Toolkit" — $49       │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─── TOP PRODUCTS (30 days) ─────────────────────┐ │
│  │ 1. Landlord Lease Agreement Pack — 47 sales    │ │
│  │ 2. Property Management Toolkit — 32 sales      │ │
│  │ 3. Landlord Starter Kit — 18 sales             │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### KPI Tracking via team-db

Tables to create in the shared database:
- `purchases` — one-time and subscription purchases
- `affiliates` — affiliate accounts
- `affiliate_commissions` — commission records
- `email_logs` — sent emails tracking
- `download_tokens` — secure download link tracking

### Key Metrics to Track

| Metric | Source | Update Frequency |
|--------|--------|-----------------|
| Revenue (daily/weekly/monthly) | Stripe API + DB | Real-time via webhooks |
| Units sold | DB | Real-time |
| Conversion rate | Analytics (Plausible/GA4) | Daily |
| Average order value (AOV) | DB | Real-time |
| MRR (subscriptions) | Stripe Billing API | Daily |
| Churn rate | Stripe Billing API | Monthly |
| Affiliate commissions | DB | Real-time |
| Top products | DB | Daily |
| Email open/click rates | Resend/Loops.so | Daily |

---

## 7. Implementation Roadmap

### Phase 1 — MVP (Days 1-3)
- [ ] Create Stripe account and configure products/prices
- [ ] Set up Stripe webhook endpoint
- [ ] Build basic server: /api/create-checkout-session
- [ ] Build download handler (signed token, static files)
- [ ] Purchase confirmation email via Resend
- [ ] `purchases` table in shared DB

### Phase 2 — Growth (Days 4-7)
- [ ] Member area for subscription users
- [ ] Email sequences 2-6 (welcome, upsell, renewal, payment failure, abandoned cart)
- [ ] Affiliate tracking system (custom or FirstPromoter)
- [ ] Abandoned cart recovery
- [ ] Admin monitoring dashboard (static HTML)

### Phase 3 — Scale (Week 2+)
- [ ] Move files to CDN (Cloudflare R2)
- [ ] Affiliate dashboard
- [ ] Customer portal for self-management
- [ ] A/B testing for pricing/pages
- [ ] Advanced analytics integration

---

## 8. Security & Compliance

- **PCI Compliance:** Handled by Stripe (Stripe Checkout is PCI SAQ A compliant)
- **Download Tokens:** JWT with 24-hour expiry, one-time use
- **Rate Limiting:** 10 checkout attempts/hr per email
- **Webhook Verification:** Always verify Stripe webhook signatures
- **File Security:** Serve downloads through app, not direct file access
- **GDPR:** Cookie consent banner, data export/deletion on request
- **Email:** Unsubscribe link in every marketing email, CAN-SPAM compliant

---

## 9. Technology Stack Summary

| Component | Technology | Deployment |
|-----------|-----------|------------|
| Payment processing | Stripe (Checkout + Billing) | Stripe-hosted |
| Backend API | Node.js / Express | VPS or serverless (Vercel) |
| Frontend store | Static HTML/CSS/JS | Vercel / Netlify |
| Database | SQLite via team-db / Turso | Turso (shared) |
| Email | Resend (transactional) + Loops.so (marketing) | Cloud API |
| File storage | Local filesystem (MVP) → Cloudflare R2 (scale) | Server / CDN |
| Download auth | JWT tokens | Server-generated |
| Analytics | Plausible (privacy-first) | Cloud or self-hosted |
| Monitoring | Custom HTML dashboard + Stripe Dashboard | Self-hosted |
