# AutoAsset AI — Integration Setup Guide

## Step-by-step instructions to go from zero to live automated checkout

---

## Prerequisites

- Domain name (e.g., autoasset.ai)
- Stripe account (stripe.com)
- Resend account (resend.com) for transactional emails
- Hosting (Vercel, Railway, or any Node.js host)

---

## Step 1: Stripe Setup (30 minutes)

### 1.1 Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Complete business details (US-based, digital products)
3. Enable test mode for development

### 1.2 Create Products & Prices
```bash
# Using Stripe CLI
stripe products create \
  --name="Landlord Lease Agreement Pack" \
  --type=service \
  --metadata="product_type:template" \
  --default-price-data="currency=usd&unit_amount=1499"

stripe products create \
  --name="Property Management Master Toolkit" \
  --type=service \
  --metadata="product_type:bundle" \
  --default-price-data="currency=usd&unit_amount=4900"

stripe products create \
  --name="Template Library Membership" \
  --type=service \
  --metadata="product_type:subscription" \
  --default-price-data="currency=usd&unit_amount=1900&recurring[interval]=month"
```

### 1.3 Configure Webhook Endpoint
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.com/api/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **webhook signing secret** (`whsec_...`)

### 1.4 Get API Keys
- **Publishable key** (`pk_live_...`) — used in frontend
- **Secret key** (`sk_live_...`) — used in backend (keep secret!)

---

## Step 2: Server Deployment

### 2.1 Environment Variables (.env)
```env
PORT=4010
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://autoasset.ai
RESEND_API_KEY=re_...  # For email sending
JWT_SECRET=your-random-secret-at-least-32-chars
```

### 2.2 Deploy Options

| Provider | Pros | Cost |
|----------|------|------|
| **Vercel** | Free tier, auto-deploy from GitHub, serverless | Free (1000 req/s) |
| **Railway** | Simple, includes Postgres option | $5/mo |
| **Fly.io** | Global edge, generous free tier | Free tier |
| **DigitalOcean App** | Simple, predictable pricing | $12/mo |

### 2.3 Database Setup
The server uses in-memory storage for MVP. For production, configure:

```sql
-- purchases table
CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  email TEXT NOT NULL,
  affiliate_code TEXT,
  status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT (datetime('now'))
);

-- affiliates table
CREATE TABLE affiliates (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  commission_rate REAL DEFAULT 0.20,
  earnings REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- affiliate_commissions table
CREATE TABLE affiliate_commissions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  affiliate_code TEXT NOT NULL,
  purchase_id TEXT NOT NULL,
  amount REAL NOT NULL,
  commission REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

-- download_tokens table
CREATE TABLE download_tokens (
  token TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- email_logs table
CREATE TABLE email_logs (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now'))
);
```

---

## Step 3: Email Service Setup

### 3.1 Configure Resend (Transactional)
1. Go to https://resend.com → Add Domain
2. Verify domain ownership (add TXT record to DNS)
3. Set up DKIM/SPF/DMARC records
4. Copy API key

### 3.2 DNS Records to Add
```
Type  | Name                    | Value
TXT   | _dmarc.autoasset.ai     | v=DMARC1; p=quarantine; rua=mailto:dmarc@autoasset.ai
TXT   | autoasset.ai            | v=spf1 include:resend.com ~all
CNAME | resend._domainkey       | dkim.resend.com
```

### 3.3 Email Sending Integration

```javascript
// server/services/email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html, type }) {
  const result = await resend.emails.send({
    from: 'AutoAsset AI <hello@autoasset.ai>',
    to,
    subject,
    html,
    tags: [{ name: 'type', value: type }],
  });
  
  // Log to database
  await logEmail(to, subject, type);
  
  return result;
}
```

---

## Step 4: Affiliate Program Setup

### 4.1 Option A: Custom (using Stripe Connect)
1. Create Express Connect accounts for affiliates
2. Use Connect to handle payouts automatically
3. Commission tracking built into the app

### 4.2 Option B: FirstPromoter (Turnkey)
1. Go to https://firstpromoter.com
2. Connect Stripe account
3. Customize signup form, commission rates, payouts
4. Add JS snippet to site for cookie tracking
5. Affiliates get dashboard automatically

### 4.3 Option C: Custom Dashboard (Recommended for MVP)
Use the built-in `/api/affiliates/register` endpoint and admin dashboard.
Process payouts manually via Stripe until volume justifies automation.

---

## Step 5: Launch Checklist

- [ ] All products created in Stripe with correct prices
- [ ] Webhook endpoint configured and tested
- [ ] Email templates uploaded to Resend/Loops.so
- [ ] DNS records configured (domain, email)
- [ ] SSL certificate active (auto with Vercel/Railway)
- [ ] Download files uploaded to server/CDN
- [ ] Affiliate signup flow tested
- [ ] Test purchase end-to-end:
    1. Visit storefront
    2. Click "Buy" → redirected to Stripe checkout
    3. Complete payment with test card (4242 4242 4242 4242)
    4. Redirected to success page
    5. Download link works
    6. Confirmation email received
    7. Abandoned cart triggers (if applicable)
- [ ] Analytics (Plausible or Google Analytics) installed
- [ ] Error monitoring (Sentry or similar) configured
- [ ] Admin dashboard accessible

---

## Step 6: Monitoring & Maintenance

### Daily Checks
- [ ] Admin dashboard shows accurate sales data
- [ ] No failed webhooks in Stripe dashboard
- [ ] No bounced emails in Resend dashboard
- [ ] Download links working

### Weekly
- [ ] Review affiliate commissions
- [ ] Check subscription churn rate
- [ ] Review abandoned cart recovery rate
- [ ] A/B test email subject lines

### Monthly
- [ ] Process affiliate payouts
- [ ] Review top/bottom performing products
- [ ] Add new templates to library
- [ ] Update email sequences based on performance

---

## Troubleshooting

### "Checkout session not created"
- Verify Stripe secret key is correct
- Check product ID matches what's in Stripe
- Ensure product is active in Stripe dashboard

### "Webhook not received"
- Verify endpoint URL is public (not localhost)
- Check Stripe dashboard → Webhooks → View events
- Confirm webhook signing secret matches

### "Download link expired"
- Tokens expire in 24 hours by default
- User can request new link via email
- Check `JWT_SECRET` environment variable

### "Emails not sending"
- Verify Resend API key
- Check DNS records are configured
- Check spam folder
- Verify sender email is verified in Resend

### "Dashboard not loading"
- Ensure server is running
- Check `/api/analytics/dashboard` directly
- Verify no CORS issues in browser console