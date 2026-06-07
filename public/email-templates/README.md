# AutoAsset AI — Email Sequence Templates

This directory contains all automated email templates for the purchase flow.
Ready to use with Resend, Loops.so, SendGrid, or any email API.

## Email Flows

| # | Flow Name | Trigger | Delay | Type |
|---|-----------|---------|-------|------|
| 1 | **Purchase Confirmation** | checkout.session.completed | 0s | Transactional |
| 2 | **Welcome + Quick Start** | After purchase | 24h | Marketing |
| 3 | **Upsell Offer** | After purchase | 72h | Marketing |
| 4 | **Subscription Welcome** | subscription.created | 0s | Transactional |
| 5 | **Renewal Success** | invoice.payment_succeeded | 0s | Transactional |
| 6 | **Payment Failure** | invoice.payment_failed | 0s → 3d → 7d | Transactional |
| 7 | **Abandoned Cart** | checkout.session.expired | 1h | Marketing |
| 8 | **Cancellation** | subscription.deleted | 0s | Transactional |

---

## File: 01-purchase-confirmation.html

**Subject:** 📥 Your downloads are ready — {{product_name}}

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#1a56db;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">✅ Payment Successful!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Hi {{first_name}},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.5;">
                Thanks for your purchase! Your digital products are ready for instant download.
              </p>

              <!-- Download Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#1a56db;border-radius:8px;text-align:center;">
                    <a href="{{download_url}}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">⬇️ Download Your Files</a>
                  </td>
                </tr>
              </table>

              <!-- Order Summary -->
              <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Product</td>
                  <td style="border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#1e293b;">{{product_name}}</td>
                </tr>
                <tr>
                  <td style="border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Amount</td>
                  <td style="border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#1e293b;">\${{amount}}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#64748b;">Order #</td>
                  <td style="font-size:14px;font-weight:600;color:#1e293b;">{{order_id}}</td>
                </tr>
              </table>

              <!-- Files List -->
              {{#if files}}
              <h3 style="font-size:14px;color:#1e293b;margin:0 0 12px;">📁 Your Files:</h3>
              <ul style="margin:0 0 24px;padding:0 0 0 20px;">
                {{#each files}}
                <li style="font-size:14px;color:#475569;margin-bottom:4px;">{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}

              <p style="margin:0;font-size:14px;color:#94a3b8;">
                This download link expires in 24 hours. If you need a new link, visit your <a href="{{order_page}}" style="color:#1a56db;">order page</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                AutoAsset AI · Templates for Real Estate Investors<br>
                <a href="mailto:support@autoasset.ai" style="color:#1a56db;">support@autoasset.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 02-welcome-24h.html

**Subject:** Getting the most out of {{product_name}}

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Hi {{first_name}},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.5;">
                It's been a day since you grabbed <strong>{{product_name}}</strong> — hope you're enjoying it!
              </p>

              <!-- Pro Tip -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background:#eff6ff;border-radius:8px;margin-bottom:24px;border-left:4px solid #1a56db;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a56db;">💡 Pro Tip</p>
                    <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.5;">{{pro_tip}}</p>
                  </td>
                </tr>
              </table>

              <!-- Download Link -->
              <p style="margin:0 0 24px;font-size:14px;color:#475569;">
                Need your download link again? <a href="{{download_url}}" style="color:#1a56db;">Click here</a>
              </p>

              <!-- Helpful Links -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
              <h3 style="font-size:14px;color:#1e293b;margin:0 0 12px;">📚 Helpful Resources</h3>
              <ul style="margin:0 0 24px;padding:0 0 0 20px;">
                <li style="font-size:14px;color:#475569;margin-bottom:6px;">
                  <a href="{{blog_url_1}}" style="color:#1a56db;">How to customize your templates</a>
                </li>
                <li style="font-size:14px;color:#475569;margin-bottom:6px;">
                  <a href="{{blog_url_2}}" style="color:#1a56db;">5 mistakes landlords make with leases</a>
                </li>
              </ul>

              <p style="margin:0;font-size:14px;color:#94a3b8;">
                Happy investing!<br>
                — The AutoAsset AI Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 03-upsell-72h.html

**Subject:** Complete your toolkit — special offer inside 🎯

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#fefce8,#fffbeb);padding:40px;text-align:center;">
              <h1 style="margin:0 0 8px;font-size:24px;color:#92400e;">🎯 Complete Your Toolkit</h1>
              <p style="margin:0;font-size:15px;color:#b45309;">You're just one step away from the ultimate landlord toolkit</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Hi {{first_name}},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.5;">
                You picked up <strong>{{product_purchased}}</strong> — great choice! Most customers who buy this also grab:
              </p>

              <!-- Offer Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #f59e0b;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <h2 style="margin:0 0 4px;font-size:20px;color:#1e293b;">{{upsell_product}}</h2>
                    <p style="margin:0 0 16px;font-size:14px;color:#64748b;">{{upsell_description}}</p>
                    <div style="margin-bottom:16px;">
                      <span style="font-size:28px;font-weight:700;color:#1a56db;">\${{upsell_price}}</span>
                      {{#if original_price}}
                      <span style="font-size:16px;color:#94a3b8;text-decoration:line-through;margin-left:8px;">\${{original_price}}</span>
                      {{/if}}
                    </div>
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="background:#f59e0b;border-radius:8px;text-align:center;">
                          <a href="{{upsell_url}}" style="display:inline-block;padding:14px 40px;color:#1e293b;text-decoration:none;font-size:16px;font-weight:600;">🔥 Upgrade Now</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Membership -->
              <table width="100%" cellpadding="20" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 8px;font-size:15px;color:#1e293b;">Or get <strong>unlimited access</strong> with our Template Library Membership</p>
                    <p style="margin:0 0 12px;font-size:13px;color:#64748b;">All current templates + new ones added monthly · Cancel anytime</p>
                    <a href="{{membership_url}}" style="color:#1a56db;font-weight:600;font-size:14px;">Join for \$19/mo →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#94a3b8;">
                Offer valid for 7 days.<br>
                — The AutoAsset AI Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 04-subscription-welcome.html

**Subject:** 🎉 Welcome to the AutoAsset AI Template Library!

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#1a56db;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">🎉 Welcome to the Library!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Hi {{first_name}},</p>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;line-height:1.5;">
                Welcome to the AutoAsset AI Template Library! You now have unlimited access to our full collection of professional templates.
              </p>

              <!-- Access Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#1a56db;border-radius:8px;text-align:center;">
                    <a href="{{member_area_url}}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">🔓 Access Member Area</a>
                  </td>
                </tr>
              </table>

              <h3 style="font-size:15px;color:#1e293b;margin:0 0 12px;">What's included:</h3>
              <ul style="margin:0 0 24px;padding:0 0 0 20px;">
                <li style="font-size:14px;color:#475569;margin-bottom:8px;">📄 <strong>{{template_count}} templates</strong> — leases, forms, checklists</li>
                <li style="font-size:14px;color:#475569;margin-bottom:8px;">📊 Spreadsheet tools — rent rolls, expense trackers</li>
                <li style="font-size:14px;color:#475569;margin-bottom:8px;">🆕 New templates added every month</li>
                <li style="font-size:14px;color:#475569;margin-bottom:8px;">📧 Email support — we respond within 24h</li>
              </ul>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

              <h3 style="font-size:14px;color:#1e293b;margin:0 0 8px;">Manage Your Membership</h3>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;">
                You can upgrade, cancel, or update payment anytime via the <a href="{{customer_portal_url}}" style="color:#1a56db;">Customer Portal</a>.
              </p>

              <p style="margin:0;font-size:14px;color:#94a3b8;">
                Next billing: {{next_billing_date}}<br>
                — The AutoAsset AI Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 05-renewal-success.html

**Subject:** ✅ Your AutoAsset AI membership has been renewed

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">✅</div>
              <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Membership Renewed!</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;">Your Template Library Membership has been renewed for another {{interval}}.</p>

              <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px;text-align:left;">
                <tr>
                  <td style="font-size:14px;color:#64748b;">Amount</td>
                  <td style="font-size:14px;font-weight:600;color:#1e293b;">\${{amount}}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#64748b;">Next billing</td>
                  <td style="font-size:14px;font-weight:600;color:#1e293b;">{{next_billing_date}}</td>
                </tr>
              </table>

              <a href="{{member_area_url}}" style="display:inline-block;padding:12px 32px;background:#1a56db;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Browse New Templates</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 06-payment-failed.html

**Subject:** ⚠️ Payment issue — your membership needs attention

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#ef4444;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;">⚠️ Payment Issue</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Hi {{first_name}},</p>
              <p style="margin:0 0 8px;font-size:16px;color:#475569;line-height:1.5;">
                We couldn't process your payment of <strong>\${{amount}}</strong> for your AutoAsset AI membership.
              </p>

              <!-- Fix Button -->
              <table cellpadding="0" cellspacing="0" style="margin:24px auto;">
                <tr>
                  <td style="background:#1a56db;border-radius:8px;text-align:center;">
                    <a href="{{customer_portal_url}}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">🔧 Update Payment Method</a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="16" cellspacing="0" style="background:#fef2f2;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.5;">
                      <strong>⚠️ Important:</strong> Your membership is still active, but if payment isn't resolved within 7 days, your access will be suspended.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#64748b;">
                Need help? Reply to this email or contact <a href="mailto:support@autoasset.ai" style="color:#1a56db;">support@autoasset.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 07-abandoned-cart.html

**Subject:** Still thinking about {{product_name}}? 🧐

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🛒</div>
              <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">You left something behind</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;">
                You started checking out <strong>{{product_name}}</strong> but didn't complete the purchase.
              </p>

              <table width="100%" cellpadding="16" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:24px;text-align:left;">
                <tr>
                  <td style="width:60%;font-size:14px;color:#1e293b;">{{product_name}}</td>
                  <td style="text-align:right;font-size:16px;font-weight:600;color:#1a56db;">\${{amount}}</td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.5;">
                Here's what you're missing:<br>
                ✅ Ready-to-use, customizable templates<br>
                ✅ Save hours of paperwork<br>
                ✅ Used by 5,000+ landlords & investors
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1a56db;border-radius:8px;text-align:center;">
                    <a href="{{checkout_url}}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">🔙 Complete Your Purchase</a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
                Questions? Just hit reply — we're happy to help!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## File: 08-cancellation.html

**Subject:** We're sorry to see you go

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">👋</div>
              <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Sorry to see you go</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;">
                Your Template Library Membership has been cancelled. Your access will remain active until the end of your billing period ({{end_date}}).
              </p>

              <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.5;">
                If there's anything we could have done better, we'd love to hear from you.<br>
                Reply to this email or <a href="mailto:support@autoasset.ai" style="color:#1a56db;">let us know</a>.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#f59e0b;border-radius:8px;text-align:center;">
                    <a href="{{reactivate_url}}" style="display:inline-block;padding:14px 32px;color:#1e293b;text-decoration:none;font-size:15px;font-weight:600;">🔄 Reactivate Your Membership</a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
                — The AutoAsset AI Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```