/**
 * AutoAsset AI — Automated Checkout & Fulfillment Server
 * 
 * This is a working prototype demonstrating the full zero-touch purchase flow:
 *   1. Storefront page → Stripe Checkout
 *   2. Stripe webhook → digital delivery + email trigger
 *   3. Download endpoint with secure signed tokens
 *   4. Admin monitoring dashboard
 *   5. Affiliate tracking via referral codes
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// In production, these would use Stripe SDK with live keys
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 4010;

// --- Configuration ---
const CONFIG = {
  siteUrl: process.env.SITE_URL || `http://localhost:${PORT}`,
  jwtSecret: process.env.JWT_SECRET || 'autoasset-dev-secret-change-in-prod',
  downloadLinkExpiry: 24 * 60 * 60 * 1000, // 24 hours in ms
  affiliateCommissionRate: 0.20, // 20%
  affiliateCookieDays: 30,
};

// --- In-Memory Store (MVP — replaces with SQLite/DB in production) ---
const db = {
  purchases: [],
  affiliates: [],
  commissions: [],
  downloadTokens: [],
  emailLogs: [],
};

// Seed an affiliate for testing
db.affiliates.push({
  id: 'aff_001',
  code: 'LANDLORD20',
  name: 'Property Manager Pro',
  email: 'affiliate@example.com',
  commissionRate: 0.20,
  createdAt: new Date().toISOString(),
});

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route for admin dashboard (serves dashboard.html when /admin/dashboard is requested)
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Webhook endpoint needs raw body for signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// --- Helper Functions ---

function generateId(prefix = 'txn') {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function generateDownloadToken(purchaseId, email, productId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + CONFIG.downloadLinkExpiry).toISOString();
  
  db.downloadTokens.push({
    token,
    purchaseId,
    email,
    productId,
    used: false,
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  
  return { token, expiresAt };
}

function validateDownloadToken(token) {
  const record = db.downloadTokens.find(t => t.token === token);
  if (!record) return { valid: false, reason: 'Token not found' };
  if (record.used) return { valid: false, reason: 'Token already used' };
  if (new Date(record.expiresAt) < new Date()) return { valid: false, reason: 'Token expired' };
  return { valid: true, record };
}

function getAffiliateByCode(code) {
  return db.affiliates.find(a => a.code === code);
}

function calculateCommission(amount, rate) {
  return Math.round(amount * rate * 100) / 100;
}

function logEmail(to, subject, type) {
  db.emailLogs.push({
    id: generateId('email'),
    to,
    subject,
    type,
    sentAt: new Date().toISOString(),
  });
  console.log(`[EMAIL] To: ${to} | Subject: "${subject}" | Type: ${type}`);
}

function getProductById(productId) {
  const products = {
    'prod_lease_pack': { name: 'Landlord Lease Agreement Pack', price: 14.99, category: 'template' },
    'prod_master_toolkit': { name: 'Property Management Master Toolkit', price: 49.00, category: 'bundle' },
    'prod_landlord_kit': { name: 'Landlord Starter Kit (Bundle)', price: 79.00, category: 'bundle' },
    'prod_library_monthly': { name: 'Template Library Membership (Monthly)', price: 19.00, category: 'subscription' },
    'prod_library_annual': { name: 'Template Library Membership (Annual)', price: 149.00, category: 'subscription' },
  };
  return products[productId] || null;
}

// --- ROUTES ---

/**
 * GET /api/products — List all available products
 */
app.get('/api/products', (req, res) => {
  res.json({
    products: [
      {
        id: 'prod_lease_pack',
        name: 'Landlord Lease Agreement Pack',
        description: 'Professional lease agreements — ready to customize for any state. Includes move-in/move-out checklists.',
        price: 14.99,
        currency: 'USD',
        category: 'template',
        image: '/img/product-lease.jpg',
      },
      {
        id: 'prod_master_toolkit',
        name: 'Property Management Master Toolkit',
        description: 'Everything a landlord needs: inspection forms, maintenance logs, tenant communications, rent rolls, and more.',
        price: 49.00,
        currency: 'USD',
        category: 'bundle',
        image: '/img/product-toolkit.jpg',
        popular: true,
      },
      {
        id: 'prod_landlord_kit',
        name: 'Landlord Starter Kit (Bundle)',
        description: 'All 5 essential packs bundled at a massive discount. Perfect for new landlords.',
        price: 79.00,
        currency: 'USD',
        originalPrice: 124.95,
        category: 'bundle',
        image: '/img/product-starter.jpg',
      },
      {
        id: 'prod_library_monthly',
        name: 'Template Library Membership',
        description: 'Unlimited access to our entire growing library. New templates added monthly. Cancel anytime.',
        price: 19.00,
        currency: 'USD',
        interval: 'month',
        category: 'subscription',
        image: '/img/product-membership.jpg',
      },
      {
        id: 'prod_library_annual',
        name: 'Template Library Membership (Annual)',
        description: 'Best value — 2 months free! Unlimited access to the full template library for one year.',
        price: 149.00,
        currency: 'USD',
        interval: 'year',
        category: 'subscription',
        image: '/img/product-membership.jpg',
        savings: '$79',
      },
    ],
  });
});

/**
 * POST /api/create-checkout-session — Create a Stripe Checkout session
 * 
 * In production, this calls stripe.checkout.sessions.create()
 * For the prototype, we simulate the flow and return a mock session.
 */
app.post('/api/create-checkout-session', (req, res) => {
  const { productId, quantity = 1, affiliateCode } = req.body;
  
  const product = getProductById(productId);
  if (!product) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const total = product.price * quantity;
  
  // Generate a mock checkout session
  const sessionId = generateId('cs');
  const session = {
    id: sessionId,
    url: `${CONFIG.siteUrl}/checkout/simulate?session_id=${sessionId}&product_id=${productId}&ref=${affiliateCode || ''}`,
    mode: product.category === 'subscription' ? 'subscription' : 'payment',
    amount_total: Math.round(total * 100), // cents
    currency: 'usd',
    metadata: {
      product_id: productId,
      product_name: product.name,
      affiliate_code: affiliateCode || null,
      quantity: String(quantity),
    },
  };

  console.log(`[CHECKOUT] Session created: ${sessionId} for ${product.name} ($${total})`);
  
  res.json({ session });
});

/**
 * GET /checkout/simulate — Simulated success page after payment
 * This represents what Stripe would redirect to after successful payment.
 */
app.get('/checkout/simulate', (req, res) => {
  const { session_id, product_id, ref } = req.query;
  
  // Simulate a successful purchase
  const product = getProductById(product_id);
  if (!product) {
    return res.status(400).send('Invalid product');
  }

  const orderId = generateId('ord');
  const email = 'customer@example.com'; // In production, this comes from Stripe session

  // Generate download token
  const { token, expiresAt } = generateDownloadToken(orderId, email, product_id);

  // Record purchase
  const purchase = {
    id: orderId,
    sessionId: session_id,
    productId: product_id,
    productName: product.name,
    amount: product.price,
    currency: 'USD',
    email,
    affiliateCode: ref || null,
    downloadToken: token,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  db.purchases.push(purchase);

  // Handle affiliate commission
  if (ref) {
    const affiliate = getAffiliateByCode(ref);
    if (affiliate) {
      const commission = calculateCommission(product.price, affiliate.commissionRate);
      db.commissions.push({
        id: generateId('comm'),
        affiliateId: affiliate.id,
        affiliateCode: ref,
        purchaseId: orderId,
        amount: product.price,
        commission,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      console.log(`[AFFILIATE] Commission $${commission} credited to ${ref}`);
    }
  }

  // Log emails that would be sent
  logEmail(email, `📥 Your downloads are ready — ${product.name}`, 'purchase_confirmation');
  logEmail(email, `Getting the most out of ${product.name}`, 'welcome_24h');
  
  // Schedule upsell (in production, this would use a job queue)
  setTimeout(() => {
    logEmail(email, `Complete your toolkit — special offer inside 🎯`, 'upsell_72h');
  }, 5000); // Simulated 72h delay as 5s for demo

  if (product.category === 'subscription') {
    logEmail(email, `✅ Your AutoAsset AI membership is active`, 'subscription_welcome');
  }

  // Render the success page
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

/**
 * POST /api/webhook — Stripe webhook endpoint
 * 
 * In production, this verifies Stripe signatures and handles events.
 * For the prototype, this accepts direct JSON for testing.
 */
app.post('/api/webhook', (req, res) => {
  const event = req.body;

  console.log(`[WEBHOOK] Received event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { product_id, product_name, affiliate_code } = session.metadata || {};
      
      // Process digital delivery
      const orderId = session.id;
      const email = session.customer_details?.email || 'unknown@example.com';
      
      // Generate download
      const { token } = generateDownloadToken(orderId, email, product_id);
      
      // Send confirmation email
      logEmail(email, `📥 Your downloads are ready — ${product_name}`, 'purchase_confirmation');
      
      console.log(`[FULFILLMENT] Digital delivery triggered for ${email}: ${product_name}`);
      break;
    }
    
    case 'checkout.session.expired': {
      const session = event.data.object;
      const email = session.customer_details?.email;
      if (email) {
        logEmail(email, `Still thinking about your purchase? 🧐`, 'abandoned_cart');
        console.log(`[ABANDONED] Cart recovery email queued for ${email}`);
      }
      break;
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (invoice.billing_reason === 'subscription_cycle') {
        logEmail(
          invoice.customer_email,
          `✅ Your AutoAsset AI membership has been renewed`,
          'renewal_success'
        );
      }
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      logEmail(
        invoice.customer_email,
        `⚠️ Payment issue — your membership needs attention`,
        'payment_failed'
      );
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      logEmail(
        subscription.customer?.email || 'customer@example.com',
        `We're sorry to see you go — here's what you'll miss`,
        'cancellation'
      );
      break;
    }
    
    default:
      console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/download/:token — Secure digital download endpoint
 * 
 * Validates the token and serves the product file.
 * In production, this would serve from S3/Cloudflare R2 with signed URLs.
 */
app.get('/api/download/:token', (req, res) => {
  const { token } = req.params;
  const validation = validateDownloadToken(token);
  
  if (!validation.valid) {
    return res.status(401).json({
      error: 'Invalid or expired download link',
      reason: validation.reason,
      help: 'If your link has expired, please check your email for a new one or contact support.',
    });
  }

  // Mark token as used (one-time download)
  validation.record.used = true;
  
  const { purchaseId, email, productId } = validation.record;
  const product = getProductById(productId);

  console.log(`[DOWNLOAD] ${email} downloaded ${product?.name || productId} (Order: ${purchaseId})`);

  // In production, serve actual file from CDN
  // For prototype, return metadata about what would be served
  res.json({
    success: true,
    message: 'Download successful',
    orderId: purchaseId,
    product: product?.name || productId,
    files: product ? getProductFiles(productId) : [],
    note: 'In production, this endpoint serves the actual PDF/DOCX/XLSX files directly.',
  });
});

function getProductFiles(productId) {
  const files = {
    'prod_lease_pack': [
      { name: 'Standard_Lease_Agreement.docx', size: '245 KB' },
      { name: 'Month_to_Month_Lease.docx', size: '212 KB' },
      { name: 'Move_In_Checklist.pdf', size: '89 KB' },
      { name: 'Move_Out_Checklist.pdf', size: '92 KB' },
      { name: 'Rent_Increase_Notice.docx', size: '45 KB' },
    ],
    'prod_master_toolkit': [
      { name: 'Master_Lease_Agreement.docx', size: '312 KB' },
      { name: 'Property_Inspection_Form.pdf', size: '156 KB' },
      { name: 'Maintenance_Log.xlsx', size: '89 KB' },
      { name: 'Tenant_Screening_Checklist.pdf', size: '67 KB' },
      { name: 'Rent_Roll_Tracker.xlsx', size: '45 KB' },
      { name: 'Tenant_Communication_Templates.docx', size: '123 KB' },
    ],
    'prod_landlord_kit': [
      { name: 'Lease_Agreement_Pack.docx', size: '450 KB' },
      { name: 'Property_Management_Forms.pdf', size: '320 KB' },
      { name: 'Financial_Tracker.xlsx', size: '180 KB' },
      { name: 'Tenant_Forms_Pack.docx', size: '280 KB' },
      { name: 'Maintenance_Checklists.pdf', size: '150 KB' },
    ],
  };
  return files[productId] || [{ name: 'Product_Package.zip', size: '1.2 MB' }];
}

/**
 * GET /api/affiliates/register — Register a new affiliate
 */
app.post('/api/affiliates/register', (req, res) => {
  const { name, email, website } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Generate unique code
  const code = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const affiliate = {
    id: generateId('aff'),
    name,
    email,
    website: website || null,
    code,
    commissionRate: CONFIG.affiliateCommissionRate,
    earnings: 0,
    createdAt: new Date().toISOString(),
  };
  
  db.affiliates.push(affiliate);
  
  console.log(`[AFFILIATE] New affiliate: ${name} (${email}) — Code: ${code}`);
  
  res.json({
    success: true,
    affiliate: {
      code,
      referralLink: `${CONFIG.siteUrl}/?ref=${code}`,
      commissionRate: '20%',
      ...affiliate,
    },
  });
});

/**
 * GET /api/analytics/dashboard — Admin monitoring data
 */
app.get('/api/analytics/dashboard', (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayPurchases = db.purchases.filter(p => new Date(p.createdAt) >= todayStart);
  const totalRevenue = db.purchases.reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = todayPurchases.reduce((sum, p) => sum + p.amount, 0);
  const avgOrderValue = db.purchases.length > 0 
    ? totalRevenue / db.purchases.length 
    : 0;
  
  // Product sales breakdown
  const productSales = {};
  db.purchases.forEach(p => {
    productSales[p.productName] = (productSales[p.productName] || 0) + 1;
  });
  
  const sortedProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sales]) => ({ name, sales }));

  res.json({
    summary: {
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todaySales: todayPurchases.length,
      totalSales: db.purchases.length,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      activeSubscriptions: db.purchases.filter(p => p.productId.includes('library')).length,
      totalAffiliates: db.affiliates.length,
      pendingCommissions: db.commissions.filter(c => c.status === 'pending').length,
    },
    topProducts: sortedProducts,
    recentPurchases: db.purchases.slice(-10).reverse().map(p => ({
      orderId: p.id,
      product: p.productName,
      amount: p.amount,
      email: p.email,
      affiliateRef: p.affiliateCode,
      time: p.createdAt,
    })),
    emailStats: {
      totalSent: db.emailLogs.length,
      byType: db.emailLogs.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {}),
    },
    affiliateStats: {
      totalCommissions: db.commissions.length,
      pendingAmount: db.commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.commission, 0),
      paidAmount: db.commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.commission, 0),
    },
  });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║    AutoAsset AI — Checkout & Fulfillment System     ║
║══════════════════════════════════════════════════════║
║  Server:      http://0.0.0.0:${PORT}                   ║
║  Storefront:  http://0.0.0.0:${PORT}/                   ║
║  Dashboard:   http://0.0.0.0:${PORT}/admin/dashboard    ║
║  Products:    http://0.0.0.0:${PORT}/api/products       ║
║  Webhook:     http://0.0.0.0:${PORT}/api/webhook        ║
╚══════════════════════════════════════════════════════╝
  `);
});