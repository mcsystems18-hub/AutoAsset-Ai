# KPI Dashboard Template - AutoAsset AI

This document defines the metrics tracked in the `kpis` table of the `team-db`.

| Metric | Definition | DB Column |
|--------|------------|-----------|
| **MRR** | Monthly Recurring Revenue from active subscriptions. | `mrr` |
| **Conversion Rate** | (Total Buyers / Total Website Visitors) * 100. | `conversion_rate` |
| **AOV** | Average Order Value (Total Sales Revenue / Total Orders). | `aov` |
| **Units Sold** | Total count of individual products and bundles sold. | `units_sold` |
| **Affiliate %** | % of total revenue generated via affiliate referrals. | `affiliate_percent` |
| **Active Subscribers** | Total number of users with an active 'Pro' membership. | (derived from `subscribers` table) |
| **Traffic** | Total unique visitors per month. | (to be tracked via external analytics or separate table) |

## Database Integration
The `kpis` table structure:
```sql
CREATE TABLE kpis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT, -- YYYY-MM
    mrr REAL,
    conversion_rate REAL,
    aov REAL,
    units_sold INTEGER,
    affiliate_percent REAL
)
```
