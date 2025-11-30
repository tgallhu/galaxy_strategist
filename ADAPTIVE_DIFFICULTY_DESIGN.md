# Adaptive Difficulty System - Design Document

## Overview
This document outlines the adaptive difficulty system that adjusts game parameters based on player performance. The system starts with default difficulty for all players and gradually increases difficulty as players play more games and achieve better scores.

---

## 1. Player Performance Metrics (What to Track)

### 1.1 Core Metrics (Already Tracked)
- **Total games played**: Count of all completed games (minimum gameplay met)
- **Best score**: Highest score achieved
- **Average score**: Mean score across all games
- **Highest level reached**: Maximum level completed (1-3)
- **Total play time**: Cumulative time spent in game

### 1.2 Additional Metrics to Track
- **Games won**: Number of times player completed all 3 levels
- **Win rate**: Percentage of games won vs. total games
- **Average survival time**: Mean time survived per game
- **Average enemies killed**: Mean enemies eliminated per game
- **Average accuracy**: (Enemies killed / Ammo used) ratio
- **Consecutive wins**: Streak of victories (resets on loss)
- **Recent performance**: Last 5-10 games' average score (for faster adjustment)

### 1.3 Difficulty Multiplier Calculation
Based on the above metrics, calculate a **Difficulty Multiplier** (0.0 to 2.0+):
- **Base multiplier**: 1.0 (default difficulty)
- **Games played bonus**: +0.05 per 5 games (caps at +0.5)
- **Score performance**: +0.1 per 10,000 score points above baseline (caps at +0.5)
- **Win rate bonus**: +0.1 if win rate > 50%, +0.2 if > 75%
- **Consecutive wins**: +0.05 per consecutive win (caps at +0.3)

---

## 2. Adjustable Difficulty Parameters

### 2.1 Enemy Behavior Parameters

#### 2.1.1 Enemy Shooting
- **Base shooting chance**: `ENEMY_SHOOT_CHANCE = 0.002`
  - **Adjustable range**: 0.001 (easy) to 0.005 (hard)
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.5)`
  - **Max increase**: 2.5x base rate

- **Shooting intensity multiplier**: `LEVEL_BALANCE[currentLevel].shootingIntensity`
  - **Current values**: 0.8, 1.2, 1.5 (levels 1-3)
  - **Adjustable range**: 0.6x to 2.0x
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.4)`

- **Multiple shooter chance**: Probability of multiple enemies shooting simultaneously
  - **Base**: 0 (one at a time)
  - **Adaptive range**: 0 to 0.3 (30% chance of 2+ shooters)

#### 2.1.2 Enemy Movement
- **Enemy horizontal speed multiplier**: Currently `speedMultiplier = 1 + (total - remaining) * 0.05`
  - **Base speed**: 1.0
  - **Adjustable range**: 1.0x to 2.0x
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.3)`

- **Enemy vertical descent speed**: Currently `0.05` pixels/frame
  - **Base**: 0.05
  - **Adjustable range**: 0.05 to 0.15
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.5)`

- **Enemy advance speed**: Vertical drop when hitting edge
  - **Current**: `ENEMY_HEIGHT / 4`
  - **Adjustable range**: ENEMY_HEIGHT/6 to ENEMY_HEIGHT/2
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.3)`

#### 2.1.3 Enemy Bullet Properties
- **Enemy bullet speed**: `ENEMY_BULLET_SPEED = 4`
  - **Base**: 4
  - **Adjustable range**: 3 to 7
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.4)`

- **Enemy bullet damage**: `ENEMY_BULLET_DAMAGE = 30`
  - **Base**: 30
  - **Adjustable range**: 25 to 50
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.5)`

- **Enemy bullet accuracy**: Currently homing/aimed at player
  - **Base**: 100% accuracy
  - **Adaptive range**: 100% to 120% (prediction-based)
  - **Optional**: Add slight spread at lower difficulties, tighten at higher

#### 2.1.4 Enemy Durability
- **Sentinel shield hits**: Currently 2 hits per sentinel
  - **Base**: 2
  - **Adjustable range**: 1 to 4
  - **Adaptive formula**: `2 + Math.floor(difficultyMultiplier * 0.5)` (higher difficulty = more shield hits)

- **Enemy health variants**: Introduce tougher enemy types at higher difficulties
  - **Base**: Normal enemies take 1 hit
  - **Adaptive**: 5% chance per difficulty tier for "armored" enemies (2 hits)

---

### 2.2 Enemy Spawn Parameters

#### 2.2.1 Enemy Count
- **Enemy count per level**: Currently 50, 40, 30 (levels 1-3)
  - **Base**: As defined in `LEVELS`
  - **Adjustable range**: +0% to +50% more enemies
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.3)`

#### 2.2.2 Enemy Formation Density
- **Enemy gap**: `ENEMY_GAP = 15`
  - **Base**: 15
  - **Adjustable range**: 10 to 15 (tighter formations)
  - **Adaptive formula**: `base - (difficultyMultiplier * 1.0)`

- **Enemy spawn position**: Add more enemies near edges or in challenging patterns
  - **Base**: Standard formations
  - **Adaptive**: Adjust formation complexity at higher difficulties

---

### 2.3 Player Constraints (Make Player Weaker)

#### 2.3.1 Weapon System
- **Heat per shot**: `heatPerShot = 8`
  - **Base**: 8
  - **Adjustable range**: 8 to 12
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.25)`

- **Heat dissipation rate**: `heatDissipationRate = 0.5`
  - **Base**: 0.5
  - **Adjustable range**: 0.3 to 0.5 (slower cooling)
  - **Adaptive formula**: `base * (1.0 - difficultyMultiplier * 0.2)`

- **Heat dissipation delay**: `heatDissipationDelay = 500ms`
  - **Base**: 500ms
  - **Adjustable range**: 500ms to 1000ms (longer delay)
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.5)`

- **Weapon lockout duration**: `lockoutDuration = 3000ms`
  - **Base**: 3000ms
  - **Adjustable range**: 3000ms to 5000ms (longer lockout)
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.3)`

- **Shoot cooldown**: `shootCooldown = 200ms`
  - **Base**: 200ms
  - **Adjustable range**: 200ms to 300ms (slower firing)
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.2)`

#### 2.3.2 Shield System
- **Shield recharge rate**: `shieldRechargeRate = 0.05`
  - **Base**: 0.05
  - **Adjustable range**: 0.03 to 0.05 (slower recharge)
  - **Adaptive formula**: `base * (1.0 - difficultyMultiplier * 0.3)`

- **Max shield capacity**: `maxShield = 100`
  - **Base**: 100
  - **Adjustable range**: 100 to 80 (lower max)
  - **Adaptive formula**: `100 - (difficultyMultiplier * 5)` (round to 5s)

#### 2.3.3 Player Movement
- **Player speed**: `PLAYER_SPEED = 6.5`
  - **Base**: 6.5
  - **Adjustable range**: 6.5 to 5.0 (slower movement)
  - **Adaptive formula**: `base * (1.0 - difficultyMultiplier * 0.15)`
  - **Note**: Only reduce slightly, as this affects game feel significantly

#### 2.3.4 Starting Resources
- **Starting lives**: `maxLives = 3`
  - **Base**: 3
  - **Adjustable range**: 3 to 2
  - **Adaptive**: Only reduce at very high difficulties (multiplier > 1.5)

- **Starting grenades**: `grenades = 1`
  - **Base**: 1
  - **Adjustable range**: 1 to 0
  - **Adaptive**: Only reduce at very high difficulties (multiplier > 1.5)

---

### 2.4 Powerup Parameters (Make Resources Scarcer)

#### 2.4.1 Powerup Drop Rates
- **Drop chance**: Currently 0.15, 0.25, 0.30 (levels 1-3)
  - **Base**: As defined in `LEVEL_BALANCE`
  - **Adjustable range**: -50% to 0% (reduce drops)
  - **Adaptive formula**: `base * (1.0 - difficultyMultiplier * 0.3)`

#### 2.4.2 Powerup Type Distribution
- **Lives drop weight**: Currently 0.65, 0.20, 0.25 (levels 1-3)
  - **Base**: As defined
  - **Adaptive**: Reduce lives drop chance by 10-30% at higher difficulties

- **Shield drop weight**: Currently 0.20, 0.50, 0.40
  - **Base**: As defined
  - **Adaptive**: Reduce shield drops by 10-20% at higher difficulties

---

### 2.5 Special Events (Intensity Spikes)

#### 2.5.1 Intensity Spike Frequency
- **Intensity spike interval**: Currently 5-10 seconds random
  - **Base**: 5000-10000ms
  - **Adjustable range**: 5000-10000ms to 3000-7000ms (more frequent)
  - **Adaptive formula**: `maxTime * (1.0 - difficultyMultiplier * 0.3)`

#### 2.5.2 Intensity Spike Duration
- **Spike duration**: Currently varies
  - **Base**: Current duration
  - **Adjustable range**: +20% to +50% longer
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.3)`

#### 2.5.3 Intensity Spike Effects
- **Enemy size increase**: Currently +8 pixels height
  - **Base**: +8
  - **Adjustable range**: +8 to +16 (larger enemies)
  - **Adaptive formula**: `base * (1.0 + difficultyMultiplier * 0.5)`

---

## 3. Difficulty Progression Strategy

### 3.1 Difficulty Tiers

**Tier 1: Beginner (Multiplier 0.8 - 1.0)**
- Slightly easier than default
- Lower enemy shooting, slower bullets
- More powerups
- Faster shield recharge

**Tier 2: Normal (Multiplier 1.0 - 1.3)**
- Default difficulty (baseline)
- Standard parameters as currently implemented

**Tier 3: Advanced (Multiplier 1.3 - 1.6)**
- Increased enemy aggression
- Faster bullets, more damage
- Reduced powerup drops
- Slower shield recharge

**Tier 4: Expert (Multiplier 1.6 - 2.0)**
- High enemy shooting rates
- Very fast bullets, high damage
- Scarce powerups
- Penalized heat management

**Tier 5: Master (Multiplier 2.0+)**
- Maximum difficulty
- All parameters at hardest settings
- Minimal resources
- Maximum enemy aggression

### 3.2 Progression Rate

**Gradual Increase**: Difficulty should increase slowly to maintain engagement
- **Small increments**: +0.05 to +0.15 per milestone
- **Milestone triggers**: 
  - Every 5 games played
  - Every 10,000 score improvement
  - Consecutive wins
  - Average score improvement

**Decay Mechanism**: If player struggles, slightly reduce difficulty
- **Struggle detection**: 3+ losses in a row, score dropping
- **Reduction**: -0.05 to -0.10 multiplier
- **Min cap**: Never go below 0.8 (beginner tier)

---

## 4. Data Storage & Retrieval

### 4.1 Player Difficulty Profile (Firestore Document)

Store in `users/{email}` collection:
```javascript
{
  email: "player@example.com",
  name: "Player Name",
  
  // Performance metrics
  gamesPlayed: 15,
  bestScore: 125000,
  averageScore: 85000,
  highestLevel: 3,
  totalPlayTime: 3600, // seconds
  gamesWon: 8,
  winRate: 0.53, // 53%
  consecutiveWins: 2,
  
  // Recent performance (last 10 games)
  recentScores: [120000, 110000, 95000, ...],
  recentAverage: 108333,
  
  // Calculated difficulty
  difficultyMultiplier: 1.35,
  difficultyTier: "Advanced",
  
  // Last updated
  lastUpdated: timestamp,
  createdAt: timestamp
}
```

### 4.2 Update Triggers

Update player profile when:
- Game ends (win or loss)
- Minimum gameplay requirements met
- Score saved successfully

### 4.3 Retrieval Flow

1. **Game start**: Load player profile from Firestore
2. **Calculate current multiplier**: Based on latest metrics
3. **Apply difficulty**: Modify all game parameters
4. **Game end**: Update metrics, recalculate multiplier, save

---

## 5. Implementation Phases

### Phase 1: Core Tracking (Foundation)
- Add player profile document structure
- Track games played, best score, average score
- Calculate basic difficulty multiplier
- Store/retrieve from Firestore

### Phase 2: Enemy Adjustments (Quick Impact)
- Adjust enemy shooting frequency
- Adjust enemy bullet speed/damage
- Adjust enemy movement speed
- Test and tune multipliers

### Phase 3: Player Constraints (Balance)
- Adjust heat system
- Adjust shield recharge
- Adjust powerup drop rates
- Fine-tune balance

### Phase 4: Advanced Features (Polish)
- Intensity spike adjustments
- Enemy count/spawn adjustments
- Advanced metrics (win rate, consecutive wins)
- Difficulty decay mechanism

### Phase 5: UI/UX (Feedback)
- Display current difficulty tier to player
- Show difficulty progression over time
- Optional: Allow player to manually adjust (with limits)

---

## 6. Key Considerations

### 6.1 Balance Principles
- **Never make game impossible**: Cap maximum difficulty
- **Maintain game feel**: Don't change core mechanics too drastically
- **Smooth transitions**: Gradual changes, not sudden spikes
- **Fair challenge**: Difficulty should match skill, not frustrate

### 6.2 Player Experience
- **Transparency**: Let players know difficulty adapts (optional display)
- **No punishment**: Difficulty increase is a sign of skill, not punishment
- **Replayability**: Adaptive difficulty extends game longevity
- **Fair matchmaking**: Each player gets their own challenge level

### 6.3 Technical Considerations
- **Performance**: Minimal overhead in calculations
- **Data sync**: Handle offline play gracefully (save on reconnect)
- **Migration**: Handle existing players (start at default)
- **Testing**: Test across all difficulty tiers thoroughly

---

## 7. Formula Examples

### Difficulty Multiplier Calculation
```javascript
function calculateDifficultyMultiplier(playerProfile) {
  let multiplier = 1.0; // Base
  
  // Games played bonus
  multiplier += Math.min(0.5, Math.floor(playerProfile.gamesPlayed / 5) * 0.05);
  
  // Score performance (baseline = 50,000)
  if (playerProfile.bestScore > 50000) {
    const scoreBonus = Math.min(0.5, Math.floor((playerProfile.bestScore - 50000) / 10000) * 0.1);
    multiplier += scoreBonus;
  }
  
  // Win rate bonus
  if (playerProfile.winRate > 0.75) multiplier += 0.2;
  else if (playerProfile.winRate > 0.50) multiplier += 0.1;
  
  // Consecutive wins
  multiplier += Math.min(0.3, playerProfile.consecutiveWins * 0.05);
  
  // Cap between 0.8 and 2.5
  return Math.max(0.8, Math.min(2.5, multiplier));
}
```

### Parameter Adjustment Example
```javascript
// Enemy shooting chance
const adjustedShootChance = ENEMY_SHOOT_CHANCE * (1.0 + difficultyMultiplier * 0.5);

// Shield recharge (inverse - harder = slower)
const adjustedRechargeRate = player.shieldRechargeRate * (1.0 - difficultyMultiplier * 0.3);

// Enemy bullet speed
const adjustedBulletSpeed = ENEMY_BULLET_SPEED * (1.0 + difficultyMultiplier * 0.4);
```

---

## 8. Summary

This adaptive difficulty system will:
- ✅ Start all players at default difficulty
- ✅ Gradually increase difficulty based on performance
- ✅ Track comprehensive player metrics
- ✅ Adjust multiple game parameters smoothly
- ✅ Maintain game balance and feel
- ✅ Extend game replayability
- ✅ Provide personalized challenge

**Next Step**: Review and approve this design, then proceed with Phase 1 implementation.
