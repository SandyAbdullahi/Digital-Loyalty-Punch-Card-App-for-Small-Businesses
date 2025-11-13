# Analytics Documentation

## Overview
The Analytics service provides merchants with insights into their loyalty program performance, including customer engagement, stamp issuance, reward redemptions, and estimated incremental revenue from increased visits.

## Formulas and Calculations

### Core Revenue Estimation
- **Baseline Visits**: `customers_enrolled * baseline_visits_per_customer_per_period`
- **Estimated Extra Visits**: `max(0, visits_by_enrolled_customers - baseline_visits)`
- **Estimated Extra Revenue**: `estimated_extra_visits * avg_spend_per_visit_kes`
- **Total Reward Cost**: `rewards_redeemed_count * avg_reward_cost_kes`
- **Net Incremental Revenue**: `estimated_extra_revenue - total_reward_cost`

### Value Metrics
- **Repeat Visit Rate**: `(customers with ≥2 visits) / (customers with ≥1 visit)`
- **Redemption Rate**: `rewards_redeemed / customers_enrolled`
- **ROI**: `net_incremental_revenue / monthly_subscription_kes` (if subscription set)

### Conservative Bands
- **Low**: -10% avg_spend, +10% baseline
- **High**: +10% avg_spend, -10% baseline
- **Mid**: Standard values

## Assumptions and Limitations
- Estimates are derived from stamp data and are indicative, not audited revenue.
- Requires merchant to configure avg spend, baseline visits, and reward cost.
- Assumes loyalty program drives extra visits beyond baseline.
- No integration with POS/payment systems; purely stamp-based estimation.
- Periods are server-side resolved to avoid client inconsistencies.

## API Endpoints

### GET /api/merchants/:merchantId/analytics
Returns analytics data for the merchant and period.

**Query Params**:
- `period`: `this_month` | `last_3_months` | `last_12_months`

**Response**:
```json
{
  "merchantId": "uuid",
  "period": { "start": "iso", "end": "iso", "label": "string" },
  "totals": { "totalCustomersEnrolled": 0, "stampsIssued": 0, "rewardsRedeemed": 0 },
  "revenueEstimation": { ... },
  "valueMetrics": { ... },
  "conservativeBands": { ... },
  "programs": [...]
}
```

### GET /api/merchants/:merchantId/analytics/customers
Returns top customers by extra visits.

**Query Params**:
- `period`: as above
- `limit`: 1-50 (default 10)

**Response**:
```json
{
  "customers": [
    {
      "customerId": "uuid",
      "name": "string",
      "visits": 0,
      "baselineVisitsEstimate": 0,
      "extraVisits": 0,
      "estimatedRevenueKES": 0
    }
  ]
}
```

## Settings
Merchants configure assumptions in the Settings page:
- Avg Spend per Visit (KES)
- Baseline Visits per Customer per Period
- Avg Reward Cost (KES)
- Monthly Subscription (KES) - for ROI calc

## Data Quality Guards
- Displays warning if settings are missing or zero.
- Clamps negative extra visits/revenue to zero.
- Consistent period usage across all aggregates.