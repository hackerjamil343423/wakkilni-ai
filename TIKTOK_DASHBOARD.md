# TikTok Intelligence Module v2.0

## Overview

A high-density, production-ready analytics dashboard for TikTok Ads built with the Linear-style aesthetic. This dashboard provides deep insights into creative performance, retention metrics, and demographic targeting.

## Access

Navigate to: **http://localhost:3001/dashboard/tiktok-ads**

## Key Features

### 1. Command Bar (Header Controls)

Located at the top of the dashboard, the command bar provides essential controls:

- **Date Range Presets**: Quick filters for Today, 7D, and 30D
- **Data Source Toggle**: Switch between Pixel and SKAdNetwork (SKAN) data
  - **Warning**: SKAN data shows a 72-hour delay badge due to iOS privacy laws
- **Currency Selector**: Toggle between USD and EUR
- **Date Display**: Shows current date range in compact format

### 2. Vital Signs (KPI Ticker)

Four critical metrics displayed as cards with 7-day trend sparklines:

1. **Total Spend** - Aggregate advertising spend
2. **ROAS** - Return on Ad Spend (Revenue/Spend ratio)
3. **Avg. CPA** - Average Cost Per Acquisition
4. **Avg. Thumbstop Rate** - The "North Star" metric for TikTok (Hook Rate)

Each card includes:
- Large primary value
- Small background sparkline chart
- Mini 7-day trend chart
- Trend indicator (↑ or ↓)

### 3. Creative Lab (Bento Grid)

#### Left Panel: Video Retention Waterfall (2/3 width)
A horizontal bar chart showing the engagement funnel:
- **Impressions** → **2s Views** → **6s Views** → **100% Views**
- Drop-off percentages highlighted in red between each stage
- Color-coded bars (green gradient) showing retention at each level

Key Metrics Displayed:
- Drop-off at 2s Views
- Drop-off at 6s Views
- Drop-off at 100% Views

#### Right Panel: Top Performing Hooks (1/3 width)
Ranked list of creatives by Thumbstop Rate:
- Top 5 creatives displayed
- Filename/ID shown
- Visual progress bar for Hook Rate
- Color coding:
  - **Green**: >30% (Excellent)
  - **Amber**: 20-30% (Good)
  - **Red**: <20% (Needs improvement)

### 4. Creative Gallery (Grid View)

Displays all active creatives in a responsive grid (2-6 columns based on screen size).

Each Creative Card Shows:

**Visual Elements:**
- 9:16 vertical video placeholder
- Play icon on hover
- "Spark Ad" badge (⚡) for organic-post-as-ad creatives

**Overlays:**
- Top Left: Spark Ad indicator
- Bottom Gradient: Spend and CPA

**Footer Metrics:**
- Filename (truncated)
- **Hook Rate** badge (color-coded: Green >30%, Red <20%)
- **Hold Rate** badge (color-coded: Green >20%, Red <10%)
- Finish Rate percentage
- ROAS multiplier
- **Spark Ads Only**: Profile Visits & Follows count

### 5. Demographics Heatmap

A matrix table showing CPA by Gender and Age Group:

**Rows**: Female, Male, Unknown
**Columns**: 18-24, 25-34, 35-44, 45+

**Color Intensity Mapping:**
- Darker Red = Higher CPA (More Expensive)
- Lighter Red = Lower CPA (More Efficient)

Each cell displays:
- CPA value (bold)
- Number of conversions
- Total spend

Hover effects: Scale and shadow for interactivity

**Legend**: Shows color scale from Low to High CPA

## Domain-Specific Metrics

### TikTok-Specific Calculations

Unlike Google Ads (keyword-based), TikTok is **creative-based**. The dashboard calculates:

1. **Thumbstop Rate (Hook Rate)**
   ```
   (video_watched_2s / impressions) × 100
   ```
   The primary indicator of creative effectiveness

2. **Retention Rate (Hold Rate)**
   ```
   (video_watched_6s / video_watched_2s) × 100
   ```
   Measures viewer engagement after the hook

3. **Finish Rate**
   ```
   (video_views_p100 / impressions) × 100
   ```
   Percentage who watched the entire video

4. **ROAS**
   ```
   (conversions × avgOrderValue) / spend
   ```

### Attribution Split

The dashboard handles two data sources:

- **Pixel Data**: Web-based conversion tracking
- **SKAdNetwork (SKAN)**: iOS privacy-compliant attribution
  - Shows 72-hour delay warning
  - Typically captures 30-70% of iOS conversions

### Spark Ads

Special organic post promotions tracked with additional metrics:
- Profile Visits
- Follows
- Identified by ⚡ badge

## Design Philosophy

### Linear-Style Aesthetic

- **Clean & Technical**: High-contrast, data-dense layout
- **No Decorative Fluff**: Every element serves a purpose
- **Typography**: Monospace for data, sans-serif for labels
- **Color Palette**:
  - Zinc grays for backgrounds
  - Emerald green for positive metrics
  - Red for drop-offs and alerts
  - Amber for warnings

### Responsive Design

- Mobile: 2-column creative grid
- Tablet: 3-column creative grid
- Desktop: 4-column creative grid
- Ultra-wide: 6-column creative grid

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: shadcn/ui (New York style)

## File Structure

```
nextjs-starter-kit/
├── app/
│   └── dashboard/
│       └── tiktok-ads/
│           └── page.tsx          # Main dashboard page
├── components/
│   └── tiktok/
│       ├── command-bar.tsx       # Header controls
│       ├── vital-signs.tsx       # KPI cards with sparklines
│       ├── creative-lab.tsx      # Retention funnel + top hooks
│       ├── ad-gallery.tsx        # Creative cards grid
│       └── demographics-heatmap.tsx  # CPA heatmap
└── lib/
    └── tiktok-data.ts            # Data schema, types, and mock generator
```

## Mock Data

The dashboard currently uses mock data generated from:
- `generateMockCreatives(count)` - Creates realistic ad performance data
- `generateMockDemographics()` - Generates CPA data across gender/age segments
- `generateMockTimeSeries(days)` - Creates time-series data for sparklines

### In Production

Replace mock data generators with API calls to TikTok Ads API:
- Endpoint: `/open_api/v1.3/reports/`
- Metrics: All fields match real API response structure
- Attribution: Handle SKAN vs Pixel data sources separately

## Color Coding Guide

### Performance Thresholds

**Thumbstop Rate (Hook):**
- 🟢 Green: >30% (Excellent - viral potential)
- 🟡 Amber: 20-30% (Good - performing well)
- 🔴 Red: <20% (Poor - creative refresh needed)

**Retention Rate (Hold):**
- 🟢 Green: >20% (Excellent retention)
- 🟡 Amber: 10-20% (Average retention)
- 🔴 Red: <10% (Low engagement)

**CPA Heatmap:**
- Light Red: Low CPA (efficient targeting)
- Dark Red: High CPA (expensive, consider pausing)

## Future Enhancements

1. **Real API Integration**: Connect to TikTok Ads API
2. **Date Range Picker**: Custom date selection beyond presets
3. **Filtering**: By campaign, ad group, creative type
4. **Sorting**: Sort creative gallery by different metrics
5. **Export**: Download reports as CSV/PDF
6. **Alerts**: Set threshold alerts for key metrics
7. **A/B Testing**: Compare creative variants
8. **Predictive Analytics**: ML-based performance predictions

## Support

For issues or questions about the TikTok Intelligence Module, refer to the main project documentation or contact the development team.

---

**Version**: 2.0
**Last Updated**: 2025-12-16
**Status**: Development (Mock Data)
