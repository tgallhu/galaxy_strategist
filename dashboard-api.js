// Dashboard API - Telemetry Data Query Functions
// Provides aggregated data for analytics dashboards

const DashboardAPI = {
    // Initialize Firestore connection
    async init() {
        if (!window.db) {
            if (typeof initFirestore === 'function') {
                initFirestore();
            }
            if (!window.db) {
                console.error('❌ Firestore not initialized');
                return false;
            }
        }
        return true;
    },

    // ==========================================
    // DIFFICULTY BALANCING DASHBOARD
    // ==========================================

    /**
     * Get death locations heat map data for a specific level
     */
    async getDeathHeatMap(levelNumber) {
        await this.init();
        
        try {
            // Get all telemetry, then filter client-side
            const snapshot = await window.db.collection('telemetry').get();

            const deaths = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const levelReached = data.levelReached || data.sessionData?.levelReached || 1;
                const gameEndReason = data.gameEndReason || data.sessionData?.gameEndReason;
                const finalScore = data.finalScore || data.sessionData?.finalScore || 0;
                
                // Filter by level and death (consider it a death if gameEndReason is 'death' or no score)
                const isDeath = gameEndReason === 'death' || finalScore === 0;
                
                if (levelReached === levelNumber && isDeath) {
                    // Find death events in combatEvents (check root level first, then nested)
                    const combatEvents = data.combatEvents || data.sessionData?.combatEvents || [];
                    combatEvents.forEach(event => {
                        if (event.type === 'player_death' && event.position) {
                            deaths.push({
                                x: event.position.x || 0,
                                y: event.position.y || 0,
                                time: event.t || 0
                            });
                        }
                    });
                    
                    // Fallback: use last position if death event not found
                    const positionSamples = data.positionSamples || data.sessionData?.positionSamples || [];
                    if (deaths.length === 0 && positionSamples.length > 0) {
                        const lastPos = positionSamples[positionSamples.length - 1];
                        deaths.push({
                            x: lastPos.x || 0,
                            y: lastPos.y || 0,
                            time: lastPos.t || 0
                        });
                    }
                }
            });

            return { success: true, data: deaths };
        } catch (error) {
            console.error('Error getting death heat map:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get level completion rates
     */
    async getLevelCompletionRates() {
        await this.init();
        
        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            const stats = {
                total: 0,
                level1: 0,
                level2: 0,
                level3: 0
            };

            snapshot.forEach(doc => {
                const data = doc.data();
                stats.total++;
                const levelReached = data.levelReached || data.sessionData?.levelReached || 1;
                
                if (levelReached >= 1) stats.level1++;
                if (levelReached >= 2) stats.level2++;
                if (levelReached >= 3) stats.level3++;
            });

            return {
                success: true,
                data: {
                    total: stats.total,
                    level1: stats.total > 0 ? ((stats.level1 / stats.total) * 100).toFixed(1) : 0,
                    level2: stats.total > 0 ? ((stats.level2 / stats.total) * 100).toFixed(1) : 0,
                    level3: stats.total > 0 ? ((stats.level3 / stats.total) * 100).toFixed(1) : 0
                }
            };
        } catch (error) {
            console.error('Error getting level completion rates:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get average survival time by level
     */
    async getSurvivalTimeByLevel() {
        await this.init();
        
        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            const timesByLevel = {
                level1: [],
                level2: [],
                level3: []
            };

            snapshot.forEach(doc => {
                const data = doc.data();
                const playTime = data.playTime || data.sessionData?.playTime || 0;
                const levelReached = data.levelReached || data.sessionData?.levelReached || 1;
                
                if (levelReached >= 1) timesByLevel.level1.push(playTime);
                if (levelReached >= 2) timesByLevel.level2.push(playTime);
                if (levelReached >= 3) timesByLevel.level3.push(playTime);
            });

            const calculateStats = (times) => {
                if (times.length === 0) return { avg: 0, median: 0, p25: 0, p75: 0 };
                const sorted = [...times].sort((a, b) => a - b);
                return {
                    avg: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1),
                    median: sorted[Math.floor(sorted.length / 2)].toFixed(1),
                    p25: sorted[Math.floor(sorted.length * 0.25)].toFixed(1),
                    p75: sorted[Math.floor(sorted.length * 0.75)].toFixed(1)
                };
            };

            return {
                success: true,
                data: {
                    level1: calculateStats(timesByLevel.level1),
                    level2: calculateStats(timesByLevel.level2),
                    level3: calculateStats(timesByLevel.level3)
                }
            };
        } catch (error) {
            console.error('Error getting survival time:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get deadliest enemies (which enemy types kill players most)
     */
    async getDeadliestEnemies() {
        await this.init();
        
        try {
            // Get all telemetry, then filter client-side
            const snapshot = await window.db.collection('telemetry').get();

            const enemyKills = {};
            let totalDeaths = 0;
            const enemyKillCounts = {}; // Track which enemies killed players

            snapshot.forEach(doc => {
                const data = doc.data();
                const gameEndReason = data.gameEndReason || data.sessionData?.gameEndReason;
                const finalScore = data.finalScore || data.sessionData?.finalScore || 0;
                
                // Consider it a death if gameEndReason is 'death' or if no score was saved (likely died)
                const isDeath = gameEndReason === 'death' || finalScore === 0;
                
                if (isDeath) {
                    totalDeaths++;
                    
                    // Find death events with enemy type (check root level first)
                    const combatEvents = data.combatEvents || data.sessionData?.combatEvents || [];
                    combatEvents.forEach(event => {
                        if (event.type === 'player_death') {
                            const enemyType = event.enemyType || event.metadata?.enemyType || event.cause || 'unknown';
                            if (!enemyKills[enemyType]) {
                                enemyKills[enemyType] = { count: 0, totalTime: 0 };
                            }
                            enemyKills[enemyType].count++;
                            enemyKills[enemyType].totalTime += event.t || 0;
                        }
                    });
                    
                    // Also count enemy kills from combat events to see which enemies were present
                    combatEvents.forEach(event => {
                        if (event.type === 'enemy_killed') {
                            const enemyType = event.enemyType || event.metadata?.enemyType || 'unknown';
                            if (!enemyKillCounts[enemyType]) {
                                enemyKillCounts[enemyType] = 0;
                            }
                            enemyKillCounts[enemyType]++;
                        }
                    });
                }
            });

            // Convert to array and calculate percentages
            const result = Object.entries(enemyKills).map(([type, stats]) => ({
                enemyType: type,
                deaths: stats.count,
                percentage: totalDeaths > 0 ? ((stats.count / totalDeaths) * 100).toFixed(1) : 0,
                avgTimeOfDeath: stats.count > 0 ? (stats.totalTime / stats.count / 1000).toFixed(1) : 0
            })).sort((a, b) => b.deaths - a.deaths);
            
            // If no specific enemy death data, use enemy kill counts as proxy
            if (result.length === 0 && Object.keys(enemyKillCounts).length > 0) {
                const totalKills = Object.values(enemyKillCounts).reduce((a, b) => a + b, 0);
                return {
                    success: true,
                    data: Object.entries(enemyKillCounts).map(([type, count]) => ({
                        enemyType: type,
                        deaths: 0,
                        percentage: totalKills > 0 ? ((count / totalKills) * 100).toFixed(1) : 0,
                        avgTimeOfDeath: 0,
                        note: 'Estimated from enemy presence data'
                    })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
                };
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('Error getting deadliest enemies:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get common failure points (when in game do players die)
     */
    async getFailurePoints() {
        await this.init();
        
        try {
            // Get all telemetry, then filter client-side
            const snapshot = await window.db.collection('telemetry').get();

            const timeBins = {}; // 30-second intervals
            const BIN_SIZE = 30; // seconds

            snapshot.forEach(doc => {
                const data = doc.data();
                const gameEndReason = data.gameEndReason || data.sessionData?.gameEndReason;
                const finalScore = data.finalScore || data.sessionData?.finalScore || 0;
                const playTime = data.playTime || data.sessionData?.playTime || 0;
                
                // Consider it a death if gameEndReason is 'death' or if no score was saved (likely died)
                const isDeath = gameEndReason === 'death' || finalScore === 0;
                
                if (isDeath && playTime > 0) {
                    const binTime = Math.floor(playTime / BIN_SIZE) * BIN_SIZE;
                    
                    if (!timeBins[binTime]) {
                        timeBins[binTime] = 0;
                    }
                    timeBins[binTime]++;
                }
            });

            // Convert to array and sort
            const result = Object.entries(timeBins)
                .map(([time, count]) => ({
                    timeRange: `${time}-${parseInt(time) + BIN_SIZE}s`,
                    deaths: count
                }))
                .sort((a, b) => parseInt(a.timeRange) - parseInt(b.timeRange));

            const total = result.reduce((sum, item) => sum + item.deaths, 0);
            result.forEach(item => {
                item.percentage = total > 0 ? ((item.deaths / total) * 100).toFixed(1) : 0;
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error getting failure points:', error);
            return { success: false, error: error.message };
        }
    },

    // ==========================================
    // TUTORIAL IMPROVEMENTS REPORT
    // ==========================================

    /**
     * Get new player behaviors (first 5 games)
     */
    async getNewPlayerBehaviors() {
        await this.init();
        
        try {
            // First get all users with < 5 games
            const usersSnapshot = await window.db.collection('users')
                .where('gamesPlayed', '<', 5)
                .get();

            const newPlayerEmails = [];
            usersSnapshot.forEach(doc => {
                newPlayerEmails.push(doc.id.toLowerCase());
            });

            if (newPlayerEmails.length === 0) {
                return { success: true, data: { players: 0, stats: {} } };
            }

            // Get telemetry for new players
            const telemetryPromises = newPlayerEmails.map(email =>
                window.db.collection('telemetry')
                    .where('playerEmail', '==', email)
                    .orderBy('timestamp', 'desc')
                    .limit(5)
                    .get()
            );

            const snapshots = await Promise.all(telemetryPromises);
            
            const stats = {
                players: newPlayerEmails.length,
                totalGames: 0,
                averageAccuracy: [],
                grenadeUsers: 0,
                shieldUsers: 0
            };

            snapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    stats.totalGames++;
                    
                    const accuracy = data.shootingStats?.accuracy || 0;
                    if (accuracy > 0) stats.averageAccuracy.push(accuracy);
                    
                    if ((data.grenadeStats?.totalLaunched || 0) > 0) stats.grenadeUsers++;
                    // Check for shield usage in combat events
                    if (data.combatEvents) {
                        const hasShield = data.combatEvents.some(e => 
                            e.type === 'shield_activation' || e.type === 'shield_recharge'
                        );
                        if (hasShield) stats.shieldUsers++;
                    }
                });
            });

            const avgAccuracy = stats.averageAccuracy.length > 0
                ? (stats.averageAccuracy.reduce((a, b) => a + b, 0) / stats.averageAccuracy.length).toFixed(1)
                : 0;

            return {
                success: true,
                data: {
                    players: stats.players,
                    totalGames: stats.totalGames,
                    averageAccuracy: avgAccuracy,
                    grenadeUsage: stats.totalGames > 0 ? ((stats.grenadeUsers / stats.totalGames) * 100).toFixed(1) : 0,
                    shieldUsage: stats.totalGames > 0 ? ((stats.shieldUsers / stats.totalGames) * 100).toFixed(1) : 0
                }
            };
        } catch (error) {
            console.error('Error getting new player behaviors:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get low accuracy players (< 20% accuracy)
     */
    async getLowAccuracyPlayers() {
        await this.init();
        
        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            const lowAccuracyPlayers = [];
            const accuracyDistribution = {
                '0-10': 0,
                '10-20': 0,
                '20-30': 0,
                '30-40': 0,
                '40+': 0
            };

            snapshot.forEach(doc => {
                const data = doc.data();
                const accuracy = data.shootingStats?.accuracy || 0;
                const totalShots = data.shootingStats?.totalShots || 0;
                
                if (totalShots >= 50) { // Only count if they shot enough
                    if (accuracy < 10) accuracyDistribution['0-10']++;
                    else if (accuracy < 20) accuracyDistribution['10-20']++;
                    else if (accuracy < 30) accuracyDistribution['20-30']++;
                    else if (accuracy < 40) accuracyDistribution['30-40']++;
                    else accuracyDistribution['40+']++;
                    
                    if (accuracy < 20 && totalShots >= 50) {
                        lowAccuracyPlayers.push({
                            email: data.playerEmail,
                            accuracy: accuracy.toFixed(1),
                            totalShots: totalShots
                        });
                    }
                }
            });

            return {
                success: true,
                data: {
                    lowAccuracyCount: lowAccuracyPlayers.length,
                    distribution: accuracyDistribution,
                    players: lowAccuracyPlayers.slice(0, 50) // Limit to 50
                }
            };
        } catch (error) {
            console.error('Error getting low accuracy players:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get movement inefficiency metrics
     */
    async getMovementInefficiency() {
        await this.init();
        
        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            const inefficientPlayers = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                const positions = data.positionSamples || [];
                
                if (positions.length < 10) return; // Need enough samples
                
                // Calculate total distance traveled
                let totalDistance = 0;
                for (let i = 1; i < positions.length; i++) {
                    const dx = positions[i].x - positions[i-1].x;
                    const dy = positions[i].y - positions[i-1].y;
                    totalDistance += Math.sqrt(dx*dx + dy*dy);
                }
                
                // Optimal distance (straight line from start to end)
                const start = positions[0];
                const end = positions[positions.length - 1];
                const optimalDistance = Math.sqrt(
                    Math.pow(end.x - start.x, 2) + 
                    Math.pow(end.y - start.y, 2)
                );
                
                if (optimalDistance > 0) {
                    const efficiency = totalDistance / optimalDistance;
                    
                    if (efficiency > 1.5) { // 50% more movement than needed
                        const movementData = data.movementPatterns || {};
                        inefficientPlayers.push({
                            email: data.playerEmail,
                            efficiency: efficiency.toFixed(2),
                            totalDistance: totalDistance.toFixed(0),
                            optimalDistance: optimalDistance.toFixed(0),
                            leftRightRatio: movementData.leftMovements && movementData.rightMovements
                                ? (Math.abs(movementData.leftMovements - movementData.rightMovements) / 
                                   (movementData.leftMovements + movementData.rightMovements)).toFixed(2)
                                : 0
                        });
                    }
                }
            });

            return {
                success: true,
                data: inefficientPlayers.slice(0, 50) // Limit to 50
            };
        } catch (error) {
            console.error('Error getting movement inefficiency:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get unused mechanics (players who never use grenades, etc.)
     */
    async getUnusedMechanics() {
        await this.init();
        
        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            let totalPlayers = 0;
            let grenadeNonUsers = 0;
            let shieldNonUsers = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                totalPlayers++;
                const levelReached = data.sessionData?.levelReached || 1;
                
                // Only count Level 2+ for grenades (they're available)
                if (levelReached >= 2) {
                    if ((data.grenadeStats?.totalLaunched || 0) === 0) {
                        grenadeNonUsers++;
                    }
                    
                    // Check shield usage
                    const hasShield = data.combatEvents?.some(e => 
                        e.type === 'shield_activation' || e.type === 'shield_recharge'
                    );
                    if (!hasShield) {
                        shieldNonUsers++;
                    }
                }
            });

            return {
                success: true,
                data: {
                    total: totalPlayers,
                    grenadeNonUsers: grenadeNonUsers,
                    grenadeNonUsagePercentage: totalPlayers > 0 ? ((grenadeNonUsers / totalPlayers) * 100).toFixed(1) : 0,
                    shieldNonUsers: shieldNonUsers,
                    shieldNonUsagePercentage: totalPlayers > 0 ? ((shieldNonUsers / totalPlayers) * 100).toFixed(1) : 0
                }
            };
        } catch (error) {
            console.error('Error getting unused mechanics:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get heat overload statistics
     */
    async getHeatOverloadStats() {
        await this.init();
        
        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            const overloadDistribution = {
                0: 0,
                '1-2': 0,
                '3-5': 0,
                '6-10': 0,
                '10+': 0
            };
            
            let totalGames = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                totalGames++;
                
                // Count heat overload events
                const overloads = data.combatEvents?.filter(e => e.type === 'heat_overload').length || 0;
                
                if (overloads === 0) overloadDistribution[0]++;
                else if (overloads <= 2) overloadDistribution['1-2']++;
                else if (overloads <= 5) overloadDistribution['3-5']++;
                else if (overloads <= 10) overloadDistribution['6-10']++;
                else overloadDistribution['10+']++;
            });

            return {
                success: true,
                data: {
                    totalGames: totalGames,
                    distribution: overloadDistribution
                }
            };
        } catch (error) {
            console.error('Error getting heat overload stats:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get learning curve (performance improvement over first games)
     */
    async getLearningCurve() {
        await this.init();
        
        try {
            // Get all players with their game numbers
            const usersSnapshot = await window.db.collection('users')
                .where('gamesPlayed', '<=', 10)
                .get();

            const playerData = {};
            usersSnapshot.forEach(doc => {
                playerData[doc.id.toLowerCase()] = {
                    gamesPlayed: doc.data().gamesPlayed || 0
                };
            });

            // Get telemetry for each player, ordered by timestamp
            const gameStats = {
                game1: { accuracy: [], score: [], survivalTime: [] },
                game2: { accuracy: [], score: [], survivalTime: [] },
                game3: { accuracy: [], score: [], survivalTime: [] },
                game4: { accuracy: [], score: [], survivalTime: [] },
                game5: { accuracy: [], score: [], survivalTime: [] }
            };

            for (const email of Object.keys(playerData)) {
                const snapshot = await window.db.collection('telemetry')
                    .where('playerEmail', '==', email)
                    .orderBy('timestamp', 'asc')
                    .limit(5)
                    .get();

                let gameNum = 1;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (gameNum <= 5) {
                        const gameKey = `game${gameNum}`;
                        const accuracy = data.shootingStats?.accuracy || 0;
                        const score = data.sessionData?.finalScore || 0;
                        const time = data.sessionData?.playTime || 0;
                        
                        if (accuracy > 0) gameStats[gameKey].accuracy.push(accuracy);
                        if (score > 0) gameStats[gameKey].score.push(score);
                        if (time > 0) gameStats[gameKey].survivalTime.push(time);
                        
                        gameNum++;
                    }
                });
            }

            // Calculate averages
            const result = {};
            for (let i = 1; i <= 5; i++) {
                const gameKey = `game${i}`;
                const stats = gameStats[gameKey];
                
                result[gameKey] = {
                    accuracy: stats.accuracy.length > 0 
                        ? (stats.accuracy.reduce((a, b) => a + b, 0) / stats.accuracy.length).toFixed(1)
                        : 0,
                    score: stats.score.length > 0
                        ? (stats.score.reduce((a, b) => a + b, 0) / stats.score.length).toFixed(0)
                        : 0,
                    survivalTime: stats.survivalTime.length > 0
                        ? (stats.survivalTime.reduce((a, b) => a + b, 0) / stats.survivalTime.length).toFixed(1)
                        : 0
                };
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('Error getting learning curve:', error);
            return { success: false, error: error.message };
        }
    },

    // ==========================================
    // LEADERBOARD INSIGHTS
    // ==========================================

    /**
     * Get top 10% vs average player comparison
     */
    async getTop10PercentComparison() {
        await this.init();
        
        try {
            // First get score distribution
            const scoresSnapshot = await window.db.collection('scores')
                .orderBy('score', 'desc')
                .get();

            if (scoresSnapshot.empty) {
                return { success: false, error: 'No scores found' };
            }

            const scores = [];
            scoresSnapshot.forEach(doc => {
                scores.push({ email: doc.data().email.toLowerCase(), score: doc.data().score });
            });

            const top10PercentileIndex = Math.floor(scores.length * 0.1);
            const top10PercentileScore = scores[top10PercentileIndex]?.score || 0;
            const topPlayerEmails = scores.slice(0, top10PercentileIndex + 1).map(s => s.email);

            // Get telemetry for top 10%
            const topTelemetryPromises = topPlayerEmails.map(email =>
                window.db.collection('telemetry')
                    .where('playerEmail', '==', email)
                    .orderBy('timestamp', 'desc')
                    .limit(1)
                    .get()
            );

            // Get telemetry for all players (for average)
            const allTelemetrySnapshot = await window.db.collection('telemetry').get();

            // Aggregate stats
            const top10Stats = { accuracy: [], speed: [], shotInterval: [], killsPerGrenade: [], shieldUptime: [], survivalTime: [] };
            const avgStats = { accuracy: [], speed: [], shotInterval: [], killsPerGrenade: [], shieldUptime: [], survivalTime: [] };

            // Process top 10% telemetry
            const topSnapshots = await Promise.all(topTelemetryPromises);
            topSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    this.aggregateStats(data, top10Stats);
                });
            });

            // Process all telemetry for average
            allTelemetrySnapshot.forEach(doc => {
                const data = doc.data();
                this.aggregateStats(data, avgStats);
            });

            // Calculate averages
            const calculateAvg = (arr) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

            return {
                success: true,
                data: {
                    top10: {
                        accuracy: calculateAvg(top10Stats.accuracy),
                        speed: calculateAvg(top10Stats.speed),
                        shotInterval: calculateAvg(top10Stats.shotInterval),
                        killsPerGrenade: calculateAvg(top10Stats.killsPerGrenade),
                        shieldUptime: calculateAvg(top10Stats.shieldUptime),
                        survivalTime: calculateAvg(top10Stats.survivalTime)
                    },
                    average: {
                        accuracy: calculateAvg(avgStats.accuracy),
                        speed: calculateAvg(avgStats.speed),
                        shotInterval: calculateAvg(avgStats.shotInterval),
                        killsPerGrenade: calculateAvg(avgStats.killsPerGrenade),
                        shieldUptime: calculateAvg(avgStats.shieldUptime),
                        survivalTime: calculateAvg(avgStats.survivalTime)
                    }
                }
            };
        } catch (error) {
            console.error('Error getting top 10% comparison:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Helper: Aggregate stats from telemetry data
     */
    aggregateStats(data, statsObj) {
        const accuracy = data.shootingStats?.accuracy || 0;
        if (accuracy > 0) statsObj.accuracy.push(accuracy);

        const speed = data.movementPatterns?.averageSpeed || 0;
        if (speed > 0) statsObj.speed.push(speed);

        const interval = data.shootingStats?.averageInterval || 0;
        if (interval > 0) statsObj.shotInterval.push(interval / 1000); // Convert to seconds

        const grenadeKills = data.grenadeStats?.averageKillsPerGrenade || 0;
        if (grenadeKills > 0) statsObj.killsPerGrenade.push(parseFloat(grenadeKills));

        // Shield uptime calculation (simplified - would need more detailed tracking)
        const playTime = data.sessionData?.playTime || 0;
        const levelReached = data.sessionData?.levelReached || 1;
        if (playTime > 0 && levelReached >= 2) {
            // Estimate based on combat events or use a default
            statsObj.shieldUptime.push(75); // Placeholder - would need actual shield time tracking
        }

        const survival = data.sessionData?.playTime || 0;
        if (survival > 0) statsObj.survivalTime.push(survival);
    },

    /**
     * Get accuracy vs score correlation
     */
    async getAccuracyScoreCorrelation() {
        await this.init();

        try {
            const snapshot = await window.db.collection('telemetry').get();
            
            console.log('📊 Correlation: Found', snapshot.size, 'telemetry documents');

            const dataPoints = [];
            let skippedCount = 0;
            let reasonSkipped = { noAccuracy: 0, noScore: 0, zeroAccuracy: 0, zeroScore: 0, other: 0 };

            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Check flattened structure (telemetry data is spread at root level)
                const shootingStats = data.shootingStats || {};
                let accuracy = shootingStats.accuracy;
                const score = data.finalScore || data.sessionData?.finalScore || 0;
                const totalShots = shootingStats.totalShots || 0;
                
                // Handle accuracy if it's stored as percentage string (e.g., "45.2%")
                if (typeof accuracy === 'string') {
                    accuracy = parseFloat(accuracy.replace('%', '')) || 0;
                }
                
                // Convert to numbers - handle undefined/null
                const accuracyNum = (accuracy !== undefined && accuracy !== null) ? parseFloat(accuracy) : 0;
                const scoreNum = parseFloat(score) || 0;
                
                // Track why records are skipped for debugging
                if (!shootingStats || (accuracy === undefined || accuracy === null)) {
                    reasonSkipped.noAccuracy++;
                } else if (isNaN(accuracyNum) || accuracyNum < 0) {
                    reasonSkipped.other++;
                } else if (scoreNum <= 0) {
                    reasonSkipped.zeroScore++;
                } else {
                    // Include all records with valid accuracy (even 0%) and score > 0
                    // This allows us to see the full range of data
                    dataPoints.push({ accuracy: accuracyNum, score: scoreNum });
                }
            });
            
            skippedCount = snapshot.size - dataPoints.length;
            
            console.log('📊 Correlation: Valid data points:', dataPoints.length, 'out of', snapshot.size);
            if (skippedCount > 0) {
                console.log('📊 Correlation: Skipped:', skippedCount, 'records. Reasons:', reasonSkipped);
            }
            
            if (dataPoints.length === 0) {
                console.warn('⚠️ No correlation data: All telemetry records missing accuracy or score');
                let errorMsg = 'No correlation data available. ';
                if (snapshot.size === 0) {
                    errorMsg += 'No telemetry records found. Play some games first to generate data.';
                } else if (reasonSkipped.zeroScore === snapshot.size) {
                    errorMsg += `All ${snapshot.size} records have score = 0 (games ended immediately or no score saved).`;
                } else if (reasonSkipped.noAccuracy === snapshot.size) {
                    errorMsg += `All ${snapshot.size} records are missing accuracy data.`;
                } else {
                    errorMsg += `Found ${snapshot.size} telemetry records but none have both valid accuracy and score > 0. Breakdown: ${JSON.stringify(reasonSkipped)}`;
                }
                return { 
                    success: false, 
                    error: errorMsg 
                };
            }

            return { success: true, data: dataPoints };
        } catch (error) {
            console.error('❌ Error getting accuracy-score correlation:', error);
            return { success: false, error: error.message };
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.DashboardAPI = DashboardAPI;
}

