# Admin Dashboards - Telemetry Analytics

This directory contains three analytics dashboards for analyzing player telemetry data from Galactic Strategist.

## Dashboards

### 1. Difficulty Balancing Dashboard (`dashboard-difficulty.html`)
Analyzes where players struggle and identifies difficulty spikes:

- **Level Progression Drop-off Rates**: Percentage of players reaching each level
- **Average Survival Time**: How long players survive in each level
- **Deadliest Enemies**: Which enemy types kill players most frequently
- **Common Failure Points**: Time intervals where most deaths occur
- **Death Heat Maps**: Visual overlay of where players die on each level

### 2. Tutorial Improvements Report (`dashboard-tutorial.html`)
Identifies what new players struggle with:

- **New Player Behaviors**: Statistics for players in their first 5 games
- **Low Accuracy Patterns**: Players with < 20% accuracy
- **Movement Inefficiency**: Excessive back-and-forth movement
- **Unused Mechanics**: Players who never use grenades/shields
- **Heat Management Failures**: Frequency of heat overload events
- **Learning Curve**: Performance improvement over first games

### 3. Leaderboard Insights (`dashboard-leaderboard.html`)
What top players do differently:

- **Top 10% vs Average Comparison**: Statistical differences between elite and average players
- **Multi-Dimensional Comparison**: Radar chart comparing 6 key metrics
- **Accuracy vs Score Correlation**: Scatter plot showing relationship between accuracy and score

## Access

### Prerequisites
1. You must be logged in with an admin email
2. Admin emails are configured in `../admin-whitelist.js`

### How to Access
1. Log in to the game with an admin email
2. Navigate to one of the dashboard pages:
   - `admin/dashboard-difficulty.html`
   - `admin/dashboard-tutorial.html`
   - `admin/dashboard-leaderboard.html`

### Setting Up Admins
Edit `../admin-whitelist.js` and add admin emails to the `ADMIN_EMAILS` array:

```javascript
const ADMIN_EMAILS = [
    'admin1@example.com',
    'admin2@example.com'
];
```

## Data Sources

All dashboards query data from the `telemetry` collection in Firestore, which is automatically populated by the game's telemetry recording system.

## Technical Details

### Dependencies
- **Chart.js**: For all visualizations (bar charts, line charts, pie charts, scatter plots)
- **Chart.js Radar Plugin**: For multi-dimensional comparison radar chart
- **Firebase Firestore**: For data queries
- **Dashboard API**: `../dashboard-api.js` provides all data query functions

### File Structure
```
admin/
├── dashboard-difficulty.html    # Difficulty balancing dashboard
├── dashboard-tutorial.html      # Tutorial improvements report
├── dashboard-leaderboard.html   # Leaderboard insights
└── README.md                    # This file

../
├── dashboard-api.js             # Data query API functions
├── admin-whitelist.js           # Admin email whitelist
├── telemetry.js                 # Telemetry recording system
└── firestore.rules              # Security rules
```

## Features

### Real-time Data
- All dashboards load fresh data from Firestore on page load
- Data is aggregated in real-time from telemetry records

### Visualizations
- **Bar Charts**: For comparing metrics across categories
- **Line Charts**: For showing trends over time
- **Pie Charts**: For showing proportions
- **Scatter Plots**: For correlation analysis
- **Radar Charts**: For multi-dimensional comparison
- **Heat Maps**: Canvas-based visualization of death locations

### Error Handling
- All dashboards gracefully handle missing data
- Loading states shown while data is being fetched
- Error messages displayed if queries fail

## Future Enhancements

Potential improvements:
- Date range filters for historical analysis
- Export to CSV/PDF functionality
- Real-time updates via WebSocket
- Custom date range selection
- Player cohort analysis
- A/B testing comparison

## Notes

- Dashboards require telemetry data to be collected by players
- Some metrics may show "No data" if telemetry collection is new
- All queries are optimized to handle large datasets efficiently
- Heat maps are generated client-side from death position data

---

For more information, see `../TELEMETRY_DASHBOARDS.md` for the complete design document.

