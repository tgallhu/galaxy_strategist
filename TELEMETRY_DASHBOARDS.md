# Telemetry Dashboards - Design Document

This document outlines three aggregate analysis dashboards for analyzing player telemetry data to improve game balance, tutorial effectiveness, and understand player behavior patterns.

---

## 1. Difficulty Balancing Dashboard - Where Players Struggle

### Purpose
Identify difficulty spikes, unfair mechanics, and areas where players consistently fail across all levels.

### Key Metrics & Visualizations

#### A. Heat Maps of Death Locations
**What it shows:** Visual overlay of where players die most frequently on each level.

**Data Requirements:**
```javascript
// Query structure
{
  collection: 'telemetry',
  filters: {
    'combatEvents.type': 'player_death',
    'levelReached': [1, 2, 3], // Per level
    'gameEndReason': 'death'
  },
  aggregate: {
    groupBy: ['deathPosition.x', 'deathPosition.y'],
    count: 'deaths',
    average: 'timeIntoLevel'
  }
}
```

**Visualization:**
- Canvas overlay showing game level layout
- Color intensity = death frequency (red = many deaths, green = few)
- Optional: Time-of-death overlay (when in the level they died)
- Toggle between levels

**Implementation:**
```javascript
// Pseudo-code for heat map generation
function generateDeathHeatMap(levelNumber) {
  const deaths = queryTelemetry({
    level: levelNumber,
    eventType: 'player_death'
  });
  
  // Bin deaths into grid cells (10x10 grid overlay)
  const grid = createGrid(10, 10);
  deaths.forEach(death => {
    const cell = getGridCell(death.position);
    cell.count++;
    cell.times.push(death.timeIntoLevel);
  });
  
  // Render with color intensity based on count
  renderHeatMap(grid, { 
    maxColor: '#FF0000', 
    minColor: '#00FF00',
    opacity: 0.6 
  });
}
```

#### B. Level Progression Drop-off Rates
**What it shows:** Percentage of players who reach each level, showing where progression drops significantly.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  aggregate: {
    groupBy: 'levelReached',
    count: 'players',
    percentage: 'completionRate'
  }
}
```

**Visualization:**
- Bar chart: "% of Players Reaching Each Level"
  - X-axis: Level 1, Level 2, Level 3
  - Y-axis: Percentage (0-100%)
  - Color gradient: Green (high) to Red (low)
- Line chart: "Cumulative Completion Rate"
- Statistics panel:
  - Total attempts: X
  - Level 1 completion: X%
  - Level 2 completion: X%
  - Level 3 completion: X%
  - Average levels completed: X.X

**Example Query:**
```javascript
async function getLevelCompletionRates() {
  const allGames = await db.collection('telemetry')
    .get();
  
  const stats = {
    total: allGames.size,
    level1: 0,
    level2: 0,
    level3: 0
  };
  
  allGames.forEach(doc => {
    const data = doc.data();
    if (data.levelReached >= 1) stats.level1++;
    if (data.levelReached >= 2) stats.level2++;
    if (data.levelReached >= 3) stats.level3++;
  });
  
  return {
    level1: (stats.level1 / stats.total * 100).toFixed(1),
    level2: (stats.level2 / stats.total * 100).toFixed(1),
    level3: (stats.level3 / stats.total * 100).toFixed(1)
  };
}
```

#### C. Average Survival Time by Level
**What it shows:** How long players survive in each level before dying or completing it.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  filters: { 'gameEndReason': 'death' },
  aggregate: {
    groupBy: 'levelReached',
    average: 'levelTime',
    median: 'levelTime',
    percentile: [25, 50, 75, 90]
  }
}
```

**Visualization:**
- Line chart: "Average Survival Time by Level"
  - X-axis: Level number
  - Y-axis: Time in seconds
  - Multiple lines: Average, Median, 25th percentile, 75th percentile
- Box plot: Distribution of survival times per level
- Comparison table: Level 1 vs Level 2 vs Level 3

#### D. Deadliest Enemies
**What it shows:** Which enemy types kill players most frequently.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  filters: {
    'combatEvents.type': 'player_death',
    'combatEvents.cause': 'enemy_bullet'
  },
  aggregate: {
    groupBy: 'combatEvents.enemyType',
    count: 'kills',
    average: 'timeIntoGame'
  }
}
```

**Visualization:**
- Bar chart: "Deaths by Enemy Type"
  - X-axis: Enemy type (Normal, Sentinel, etc.)
  - Y-axis: Number of deaths
- Table: Sorted by kill count
  - Enemy Type | Deaths | % of Total | Avg Time of Death

**Example Table:**
```
┌─────────────┬─────────┬──────────────┬──────────────────┐
│ Enemy Type  │ Deaths  │ % of Total   │ Avg Time (sec)   │
├─────────────┼─────────┼──────────────┼──────────────────┤
│ Sentinel    │   245   │    45.2%     │      312.5       │
│ Normal      │   198   │    36.5%     │      156.8       │
│ Unknown     │    99   │    18.3%     │       89.2       │
└─────────────┴─────────┴──────────────┴──────────────────┘
```

#### E. Common Failure Points
**What it shows:** Time intervals where most deaths occur (e.g., "70% of deaths happen in first 60 seconds").

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  filters: { 'gameEndReason': 'death' },
  aggregate: {
    binBy: 'totalPlayTime', // Bin into 30-second intervals
    count: 'deaths'
  }
}
```

**Visualization:**
- Histogram: "Deaths Over Time"
  - X-axis: Time intervals (0-30s, 30-60s, 60-90s, etc.)
  - Y-axis: Number of deaths
- Line chart: "Cumulative Death Percentage"
- Insights panel:
  - "X% of deaths occur in first Y seconds"
  - "Most dangerous time window: X-Y seconds"

---

## 2. Tutorial Improvements Report - Common Mistakes

### Purpose
Identify what new players struggle with, which mechanics are underutilized, and where the tutorial/onboarding needs improvement.

### Key Metrics & Visualizations

#### A. New Player Behavior Analysis (First 5 Games)
**What it shows:** Patterns specific to players with < 5 games played.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  join: {
    collection: 'users',
    on: 'playerEmail',
    filter: { 'gamesPlayed': { '<': 5 } }
  }
}
```

#### B. Low Accuracy Patterns
**What it shows:** Players who shoot frequently but hit rarely, indicating aiming issues.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  filters: {
    'shootingStats.accuracy': { '<': 20 }, // < 20% accuracy
    'shootingStats.totalShots': { '>': 50 } // But shot many times
  },
  aggregate: {
    groupBy: 'playerEmail',
    average: 'shootingStats.accuracy',
    count: 'players'
  }
}
```

**Visualization:**
- Bar chart: "Accuracy Distribution (New Players)"
  - X-axis: Accuracy ranges (0-10%, 10-20%, 20-30%, etc.)
  - Y-axis: Number of players
- Pie chart: "% of New Players with < 20% Accuracy"
- Insights:
  - "X% of new players have accuracy < 20%"
  - "This suggests aiming difficulty - consider aim assist or tutorial"

#### C. Movement Inefficiency
**What it shows:** Excessive back-and-forth movement indicating confusion or difficulty.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  calculate: {
    movementEfficiency: {
      formula: 'distanceTraveled / optimalDistance',
      threshold: { '>': 1.5 } // 50% more movement than needed
    },
    leftRightRatio: {
      formula: 'abs(leftMovements - rightMovements) / totalMovements',
      threshold: { '<': 0.2 } // Too balanced = back-and-forth
    }
  }
}
```

**Visualization:**
- Scatter plot: "Movement Efficiency vs Distance Traveled"
- Heat map: Movement patterns (showing zigzag patterns)
- Table: "Players with Inefficient Movement"
  - Player | Distance Traveled | Optimal Distance | Efficiency Ratio

**Metric Calculation:**
```javascript
function calculateMovementEfficiency(telemetry) {
  const positions = telemetry.positionSamples;
  let totalDistance = 0;
  
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i-1].x;
    const dy = positions[i].y - positions[i-1].y;
    totalDistance += Math.sqrt(dx*dx + dy*dy);
  }
  
  // Optimal distance = straight line from start to end
  const start = positions[0];
  const end = positions[positions.length - 1];
  const optimalDistance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + 
    Math.pow(end.y - start.y, 2)
  );
  
  return totalDistance / Math.max(optimalDistance, 1);
}
```

#### D. Unused Mechanics
**What it shows:** Players who never use certain game mechanics (grenades, shields, etc.).

**Data Requirements:**
```javascript
// Grenade usage
{
  collection: 'telemetry',
  filters: {
    'grenadeStats.totalLaunched': 0,
    'sessionData.levelReached': { '>=': 2 } // Had opportunity to use
  },
  count: 'players'
}

// Shield usage (Level 2+)
{
  collection: 'telemetry',
  filters: {
    'levelReached': { '>=': 2 },
    'combatEvents.type': 'shield_activation',
    'combatEvents.count': 0
  },
  count: 'players'
}
```

**Visualization:**
- Pie chart: "% of New Players Who Use Grenades"
- Bar chart: "Mechanic Usage by Player Experience"
  - X-axis: Mechanics (Grenades, Shields, Powerups)
  - Y-axis: Usage percentage
  - Grouped by: New players vs Veterans
- Table: "Unused Mechanics"
  - Mechanic | % Never Used | % Used 1-5 Times | % Frequent Users

#### E. Heat Management Failures
**What it shows:** How often players experience heat overload, indicating difficulty with weapon cooldown mechanics.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  filters: {
    'combatEvents.type': 'heat_overload'
  },
  aggregate: {
    groupBy: 'playerEmail',
    count: 'overloads',
    average: 'timeBetweenOverloads'
  }
}
```

**Visualization:**
- Bar chart: "Heat Overload Frequency"
  - X-axis: Overloads per game (0, 1-2, 3-5, 6-10, 10+)
  - Y-axis: Number of players
- Line chart: "Heat Overloads Over Time" (showing learning curve)
- Insights:
  - "X% of new players experience heat overload in first game"
  - "Average overloads per game decreases from X to Y after 5 games"

#### F. Learning Curve Analysis
**What it shows:** How player performance improves over their first few games.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  join: {
    collection: 'users',
    on: 'playerEmail',
    filter: { 'gamesPlayed': { '<=': 10 } }
  },
  groupBy: ['playerEmail', 'gameNumber'],
  metrics: [
    'shootingStats.accuracy',
    'finalScore',
    'levelReached',
    'survivalTime'
  ]
}
```

**Visualization:**
- Line chart: "Average Accuracy by Game Number"
  - X-axis: Game number (1, 2, 3, 4, 5)
  - Y-axis: Accuracy percentage
  - Multiple lines: Average, Median, Top 25%, Bottom 25%
- Multi-metric comparison:
  - Accuracy | Score | Survival Time | Level Reached
  - All plotted by game number

---

## 3. Leaderboard Insights - What Top Players Do Differently

### Purpose
Identify the behaviors and strategies that separate top-performing players from average players.

### Key Metrics & Visualizations

#### A. Top 10% vs Average Player Comparison
**What it shows:** Statistical differences between elite players and average players across all key metrics.

**Data Requirements:**
```javascript
// Step 1: Get score distribution
const scores = await db.collection('scores')
  .orderBy('score', 'desc')
  .get();
  
const top10Percentile = scores.docs[Math.floor(scores.size * 0.1)].data().score;

// Step 2: Get top 10% player emails
const topPlayers = scores.docs
  .filter(doc => doc.data().score >= top10Percentile)
  .map(doc => doc.data().email);

// Step 3: Compare telemetry
{
  collection: 'telemetry',
  filters: {
    'playerEmail': { 'in': topPlayers } // Top 10%
  },
  aggregate: {
    average: [
      'shootingStats.accuracy',
      'movementPatterns.averageSpeed',
      'shootingStats.averageInterval',
      'grenadeStats.averageKillsPerGrenade',
      'combatStats.shieldUptimePercentage'
    ]
  }
}

// Step 4: Compare with average (same query, no filter)
```

**Visualization:**
- Side-by-side comparison table:

```
┌─────────────────────────┬─────────────┬──────────────┬─────────────┐
│ Metric                  │ Top 10%     │ Average      │ Difference  │
├─────────────────────────┼─────────────┼──────────────┼─────────────┤
│ Accuracy                │     68.5%   │     42.3%    │   +26.2%    │
│ Avg Speed               │    245 px/s │    198 px/s  │   +23.7%    │
│ Shot Interval           │    0.18s    │    0.24s     │   -25.0%    │
│ Kills/Grenade           │     3.2     │     1.8      │   +77.8%    │
│ Shield Uptime           │     85.2%   │     62.1%    │   +23.1%    │
│ Survival Time (Level 1) │    312s     │    186s      │   +67.7%    │
└─────────────────────────┴─────────────┴──────────────┴─────────────┘
```

- Bar chart: "Key Differentiators" (biggest gaps between top/avg)

#### B. Radar Chart - Multi-Dimensional Comparison
**What it shows:** 6-metric comparison in a single visual.

**Metrics:**
1. **Accuracy** - Shooting precision
2. **Speed** - Movement efficiency
3. **Aggression** - Shot frequency
4. **Efficiency** - Kills per ammo/grenade
5. **Grenade Use** - Utilization rate
6. **Survival** - Time alive

**Visualization:**
- Radar/Spider chart with two overlays:
  - Blue: Top 10% players
  - Orange: Average players
- Interactive: Click metric for details

**Implementation:**
```javascript
function generateRadarChart(top10Data, averageData) {
  const metrics = [
    { name: 'Accuracy', top10: top10Data.accuracy, avg: averageData.accuracy },
    { name: 'Speed', top10: top10Data.speed, avg: averageData.speed },
    { name: 'Aggression', top10: top10Data.shotFrequency, avg: averageData.shotFrequency },
    { name: 'Efficiency', top10: top10Data.killsPerAmmo, avg: averageData.killsPerAmmo },
    { name: 'Grenade Use', top10: top10Data.grenadeUtilization, avg: averageData.grenadeUtilization },
    { name: 'Survival', top10: top10Data.survivalTime, avg: averageData.survivalTime }
  ];
  
  // Normalize values to 0-100 scale
  const normalized = metrics.map(m => ({
    ...m,
    top10Norm: (m.top10 / getMaxValue(metrics, 'top10')) * 100,
    avgNorm: (m.avg / getMaxValue(metrics, 'avg')) * 100
  }));
  
  renderRadarChart(normalized);
}
```

#### C. Accuracy vs Score Correlation
**What it shows:** Whether higher accuracy correlates with higher scores.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  join: {
    collection: 'scores',
    on: ['playerEmail', 'email', 'timestamp', 'timestamp']
  },
  select: [
    'finalScore',
    'shootingStats.accuracy',
    'playerEmail'
  ]
}
```

**Visualization:**
- Scatter plot:
  - X-axis: Accuracy (%)
  - Y-axis: Final Score
  - Color: Player tier (Beginner, Normal, Advanced, Expert, Master)
- Trend line showing correlation
- Correlation coefficient display: "r = X.XX"

**Example Insights:**
- "Strong positive correlation (r = 0.78) between accuracy and score"
- "Top players cluster around 65-75% accuracy range"

#### D. Shot Frequency Analysis
**What it shows:** How aggressively top players shoot compared to others.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  calculate: {
    shotsPerSecond: 'shootingStats.totalShots / totalPlayTime',
    shotsPerEnemy: 'shootingStats.totalShots / enemiesKilled'
  },
  aggregate: {
    groupBy: 'playerTier', // Beginner, Normal, etc.
    average: ['shotsPerSecond', 'shotsPerEnemy']
  }
}
```

**Visualization:**
- Bar chart: "Average Shots per Second by Player Tier"
- Box plot: Distribution of shot intervals
- Line chart: "Shot Frequency Over Game Duration" (showing if top players pace differently)

#### E. Grenade Efficiency
**What it shows:** How effectively top players use grenades.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  calculate: {
    killsPerGrenade: 'grenadeStats.enemiesKilled / grenadeStats.totalLaunched',
    grenadeAccuracy: 'grenadeStats.enemiesKilled / (grenadeStats.totalLaunched * 3)' // Assume 3 enemies per explosion average
  },
  aggregate: {
    groupBy: 'playerTier',
    average: ['killsPerGrenade', 'grenadeAccuracy']
  }
}
```

**Visualization:**
- Bar chart: "Kills per Grenade by Player Tier"
- Table: Grenade usage breakdown
  - Tier | Total Launched | Total Kills | Kills/Grenade | Accuracy

#### F. Heat Management Comparison
**What it shows:** How top players manage weapon heat vs average players.

**Data Requirements:**
```javascript
{
  collection: 'telemetry',
  calculate: {
    shieldUptime: 'timeWithShield / totalPlayTime',
    heatOverloadRate: 'combatEvents.heat_overload.count / totalPlayTime',
    averageHeatLevel: 'combatStats.averageHeat'
  },
  aggregate: {
    groupBy: 'playerTier',
    average: ['shieldUptime', 'heatOverloadRate', 'averageHeat']
  }
}
```

**Visualization:**
- Bar chart: "Shield Uptime Percentage by Tier"
- Line chart: "Heat Level Over Time" (comparing top vs average)
- Insights:
  - "Top players maintain 85% shield uptime vs 62% for average"
  - "Top players experience 60% fewer heat overloads"

---

## Implementation Structure

### Database Schema Additions

```javascript
// telemetry collection structure
{
  playerEmail: string,
  playerName: string,
  timestamp: timestamp,
  
  // Session data
  sessionData: {
    levelReached: number,
    finalScore: number,
    totalPlayTime: number,
    gameEndReason: string, // 'death', 'victory', 'quit'
    enemiesKilled: number,
    ammoUsed: number
  },
  
  // Shooting statistics
  shootingStats: {
    totalShots: number,
    hits: number,
    accuracy: number, // hits / totalShots
    averageInterval: number, // seconds between shots
    shotsPerSecond: number
  },
  
  // Movement patterns
  movementPatterns: {
    totalDistance: number,
    averageSpeed: number,
    leftMovements: number,
    rightMovements: number,
    positionSamples: [{ x, y, timestamp }] // Sampled every 2 seconds
  },
  
  // Grenade statistics
  grenadeStats: {
    totalLaunched: number,
    enemiesKilled: number,
    averageKillsPerGrenade: number
  },
  
  // Combat events
  combatEvents: [{
    type: string, // 'player_death', 'heat_overload', 'enemy_killed', etc.
    timestamp: number,
    level: number,
    position: { x, y },
    metadata: object // Type-specific data
  }],
  
  // Combat statistics
  combatStats: {
    shieldUptimePercentage: number,
    averageHeat: number,
    heatOverloadCount: number,
    deathsByEnemyType: { [enemyType]: number }
  }
}
```

### Dashboard Pages Structure

```
/admin/
  ├── dashboard-difficulty.html      # Difficulty Balancing Dashboard
  ├── dashboard-tutorial.html        # Tutorial Improvements Report
  ├── dashboard-leaderboard.html     # Leaderboard Insights
  └── dashboard-api.js               # Shared API functions
```

### API Endpoints Needed

```javascript
// dashboard-api.js structure
const DashboardAPI = {
  // Difficulty Balancing
  async getDeathHeatMap(level) { },
  async getLevelCompletionRates() { },
  async getSurvivalTimeByLevel() { },
  async getDeadliestEnemies() { },
  async getFailurePoints() { },
  
  // Tutorial Improvements
  async getNewPlayerBehaviors() { },
  async getLowAccuracyPlayers() { },
  async getMovementInefficiency() { },
  async getUnusedMechanics() { },
  async getHeatOverloadStats() { },
  async getLearningCurve() { },
  
  // Leaderboard Insights
  async getTop10PercentComparison() { },
  async getRadarChartData() { },
  async getAccuracyScoreCorrelation() { },
  async getShotFrequencyAnalysis() { },
  async getGrenadeEfficiency() { },
  async getHeatManagementComparison() { }
};
```

### Recommended Visualization Libraries

- **Chart.js** or **D3.js** for charts
- **Leaflet** or **Canvas API** for heat maps
- **DataTables** for sortable tables
- **Chart.js Radar Chart** for radar/spider charts

### Security Considerations

- Admin authentication required for all dashboard pages
- Firestore security rules:
  ```javascript
  match /telemetry/{document} {
    allow read: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    allow write: if request.auth != null; // Players can write their own telemetry
  }
  ```

---

## Future Enhancements

1. **Real-time Dashboard Updates** - WebSocket connection for live data
2. **Custom Date Ranges** - Filter analysis by time period
3. **Player Cohort Analysis** - Compare different groups of players
4. **A/B Testing Integration** - Compare game versions
5. **Predictive Analytics** - Machine learning to predict player churn
6. **Export Functionality** - Download reports as CSV/PDF
7. **Automated Alerts** - Email when unusual patterns detected

---

## Next Steps

1. ✅ Telemetry recording system (already implemented in game.js)
2. ⏳ Create Firestore collection structure for telemetry
3. ⏳ Implement data aggregation functions
4. ⏳ Build dashboard HTML pages with visualizations
5. ⏳ Create API endpoints for data queries
6. ⏳ Add admin authentication
7. ⏳ Deploy dashboard pages

---

*Last updated: [Current Date]*

