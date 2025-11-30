// Adaptive Difficulty System
// Manages player profiles and difficulty multipliers

// Initialize Firestore (use the one from scores.js)
// This file uses window.db which is set by initFirestore() in scores.js

// Player profile structure
function createDefaultProfile(email, name) {
    return {
        email: email.toLowerCase(),
        name: name,
        
        // Performance metrics
        gamesPlayed: 0,
        bestScore: 0,
        averageScore: 0,
        highestLevel: 0,
        totalPlayTime: 0, // seconds
        totalEnemiesKilled: 0,
        gamesWon: 0,
        winRate: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        
        // Recent performance (last 10 games)
        recentScores: [],
        recentAverage: 0,
        recentGames: 0,
        
        // Calculated difficulty (easier default)
        difficultyMultiplier: 0.6, // Very beginner-friendly default for new players
        difficultyTier: "Beginner",
        
        // Timestamps
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
}

// Calculate difficulty multiplier based on player profile
function calculateDifficultyMultiplier(profile) {
    // Check if this is a brand new profile (all metrics at zero/default)
    const isNewProfile = (
        (!profile.gamesPlayed || profile.gamesPlayed === 0) &&
        (!profile.bestScore || profile.bestScore === 0) &&
        (!profile.averageScore || profile.averageScore === 0) &&
        (!profile.gamesWon || profile.gamesWon === 0) &&
        (!profile.winRate || profile.winRate === 0) &&
        (!profile.consecutiveWins || profile.consecutiveWins === 0) &&
        (!profile.recentAverage || profile.recentAverage === 0)
    );
    
    // For brand new profiles, return the default beginner-friendly difficulty
    if (isNewProfile) {
        return 0.6; // Very beginner-friendly default
    }
    
    // For existing profiles, calculate based on performance
    let multiplier = 1.0; // Base difficulty for players with some experience
    
    // Games played bonus (+0.05 per 5 games, max +0.5)
    const gamesPlayedBonus = Math.min(0.5, Math.floor((profile.gamesPlayed || 0) / 5) * 0.05);
    multiplier += gamesPlayedBonus;
    
    // Score performance (baseline = 50,000, +0.1 per 10k above, max +0.5)
    if (profile.bestScore > 50000) {
        const scoreBonus = Math.min(0.5, Math.floor((profile.bestScore - 50000) / 10000) * 0.1);
        multiplier += scoreBonus;
    }
    
    // Win rate bonus - smooth scaling instead of binary thresholds
    // At 50% win rate: 0 bonus, at 100% win rate: +0.2 bonus
    // Formula: (winRate - 0.5) * 0.4 gives smooth progression
    if (profile.winRate > 0.5) {
        const winRateBonus = Math.min(0.2, (profile.winRate - 0.5) * 0.4);
        multiplier += winRateBonus;
    }
    
    // Consecutive wins bonus (+0.05 per win, max +0.3)
    const consecutiveWinBonus = Math.min(0.3, (profile.consecutiveWins || 0) * 0.05);
    multiplier += consecutiveWinBonus;
    
    // Recent performance bonus (if recent average is significantly higher)
    if (profile.recentAverage > 0 && profile.averageScore > 0) {
        const recentPerformanceRatio = profile.recentAverage / Math.max(1, profile.averageScore);
        if (recentPerformanceRatio > 1.2) {
            multiplier += 0.1; // Improving player
        }
    }
    
    // Decay mechanism: Reduce difficulty if struggling (strengthened to help players faster)
    if (profile.consecutiveLosses >= 3) {
        multiplier -= 0.15; // Reduce difficulty after 3 consecutive losses (was 0.1)
    }
    if (profile.consecutiveLosses >= 5) {
        multiplier -= 0.2; // Further reduction after 5 losses (was 0.1) - total -0.35
    }
    
    // Cap between 0.6 (very easy - beginner default) and 2.5 (very hard)
    multiplier = Math.max(0.6, Math.min(2.5, multiplier));
    
    return multiplier;
}

// Get difficulty tier name
function getDifficultyTier(multiplier) {
    if (multiplier < 1.0) return "Beginner";
    if (multiplier < 1.3) return "Normal";
    if (multiplier < 1.6) return "Advanced";
    if (multiplier < 2.0) return "Expert";
    return "Master";
}

// Load player profile from Firestore
async function loadPlayerProfile(email) {
    if (!window.db) {
        if (!initFirestore()) {
            console.warn('Cannot load player profile: Firestore not initialized');
            return null;
        }
    }
    
    try {
        const docRef = window.db.collection('users').doc(email.toLowerCase());
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            console.log('📊 Loaded player profile:', data.email, 'Difficulty:', data.difficultyMultiplier, data.difficultyTier);
            
            // Log detailed player profile metrics
            logPlayerProfileMetrics(data);
            
            return data;
        } else {
            console.log('📊 No existing profile found for', email);
            return null;
        }
    } catch (error) {
        console.error('❌ Error loading player profile:', error);
        return null;
    }
}

// Save player profile to Firestore
async function savePlayerProfile(profile) {
    if (!window.db) {
        if (!initFirestore()) {
            console.error('Cannot save player profile: Firestore not initialized');
            return { success: false, message: 'Database not available' };
        }
    }
    
    try {
        // Recalculate difficulty multiplier before saving
        profile.difficultyMultiplier = calculateDifficultyMultiplier(profile);
        profile.difficultyTier = getDifficultyTier(profile.difficultyMultiplier);
        profile.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
        
        const docRef = window.db.collection('users').doc(profile.email.toLowerCase());
        await docRef.set(profile, { merge: true });
        
        console.log('💾 Saved player profile:', profile.email, 'Difficulty:', profile.difficultyMultiplier, profile.difficultyTier);
        
        // Log updated profile metrics
        logPlayerProfileMetrics(profile);
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error saving player profile:', error);
        return { success: false, message: error.message };
    }
}

// Update player profile after a game
async function updatePlayerProfileAfterGame(email, name, gameResult) {
    // gameResult should contain:
    // - score: number
    // - level: number (highest level reached)
    // - timeSeconds: number
    // - enemiesKilled: number
    // - won: boolean (true if all levels completed)
    // - ammoUsed: number
    
    if (!email || !gameResult) {
        console.warn('Cannot update profile: missing email or game result');
        return null;
    }
    
    // Load existing profile or create new one
    let profile = await loadPlayerProfile(email);
    
    if (!profile) {
        // Create new profile
        profile = createDefaultProfile(email, name);
    } else {
        // Update name in case it changed
        profile.name = name;
    }
    
    // Update metrics
    profile.gamesPlayed += 1;
    profile.totalPlayTime += gameResult.timeSeconds || 0;
    profile.totalEnemiesKilled += gameResult.enemiesKilled || 0;
    
    // Update best score
    if (gameResult.score > profile.bestScore) {
        profile.bestScore = gameResult.score;
    }
    
    // Update highest level
    if (gameResult.level > profile.highestLevel) {
        profile.highestLevel = gameResult.level;
    }
    
    // Update win/loss tracking
    if (gameResult.won) {
        profile.gamesWon += 1;
        profile.consecutiveWins += 1;
        profile.consecutiveLosses = 0; // Reset losses
    } else {
        profile.consecutiveWins = 0; // Reset wins
        profile.consecutiveLosses += 1;
    }
    
    // Calculate win rate
    profile.winRate = profile.gamesPlayed > 0 ? profile.gamesWon / profile.gamesPlayed : 0;
    
    // Update recent scores (keep last 10)
    profile.recentScores.push(gameResult.score);
    if (profile.recentScores.length > 10) {
        profile.recentScores.shift(); // Remove oldest
    }
    profile.recentGames = profile.recentScores.length;
    
    // Calculate recent average
    if (profile.recentScores.length > 0) {
        const sum = profile.recentScores.reduce((a, b) => a + b, 0);
        profile.recentAverage = sum / profile.recentScores.length;
    }
    
    // Calculate overall average score
    // We need to track total score to calculate average properly
    // For now, use recent average as approximation, or recalculate from all scores
    // For simplicity, we'll estimate based on recent performance
    if (profile.gamesPlayed > 0) {
        // Update running average: (oldAverage * (games-1) + newScore) / games
        profile.averageScore = ((profile.averageScore * (profile.gamesPlayed - 1)) + gameResult.score) / profile.gamesPlayed;
    } else {
        profile.averageScore = gameResult.score;
    }
    
    // Save updated profile
    await savePlayerProfile(profile);
    
    return profile;
}

// Get or create player profile (returns profile with current difficulty)
async function getPlayerDifficultyProfile(email, name) {
    if (!email) {
        console.warn('No email provided for difficulty profile');
        return null;
    }
    
    let profile = await loadPlayerProfile(email);
    
    if (!profile) {
        // Create new profile with default difficulty
        profile = createDefaultProfile(email, name);
        await savePlayerProfile(profile);
    }
    
    return profile;
}

// Log detailed player profile metrics
function logPlayerProfileMetrics(profile) {
    if (!profile) return;
    
    console.group(`👤 PLAYER PROFILE - ${profile.email || profile.name || 'Unknown'}`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 PERFORMANCE METRICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Games Played:          ${profile.gamesPlayed || 0}`);
    console.log(`  Games Won:             ${profile.gamesWon || 0}`);
    console.log(`  Win Rate:              ${((profile.winRate || 0) * 100).toFixed(1)}%`);
    console.log(`  Consecutive Wins:      ${profile.consecutiveWins || 0}`);
    console.log(`  Consecutive Losses:    ${profile.consecutiveLosses || 0}`);
    console.log(`  Best Score:            ${profile.bestScore || 0}`);
    console.log(`  Average Score:         ${Math.floor(profile.averageScore || 0)}`);
    console.log(`  Recent Average:        ${Math.floor(profile.recentAverage || 0)} (last ${profile.recentGames || 0} games)`);
    console.log(`  Highest Level:         ${profile.highestLevel || 0}/3`);
    console.log(`  Total Play Time:       ${Math.floor((profile.totalPlayTime || 0) / 60)}min ${Math.floor((profile.totalPlayTime || 0) % 60)}s`);
    console.log(`  Total Enemies Killed:  ${profile.totalEnemiesKilled || 0}`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 DIFFICULTY CALCULATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Difficulty Multiplier: ${(profile.difficultyMultiplier || 1.0).toFixed(2)}x`);
    console.log(`  Difficulty Tier:       ${profile.difficultyTier || 'Normal'}`);
    
    // Show breakdown of multiplier calculation
    const multiplier = profile.difficultyMultiplier || 1.0;
    let breakdown = 'Base: 1.00';
    
    if (profile.gamesPlayed > 0) {
        const gamesBonus = Math.min(0.5, Math.floor(profile.gamesPlayed / 5) * 0.05);
        if (gamesBonus > 0) breakdown += ` + Games: +${gamesBonus.toFixed(2)}`;
    }
    
    if (profile.bestScore > 50000) {
        const scoreBonus = Math.min(0.5, Math.floor((profile.bestScore - 50000) / 10000) * 0.1);
        if (scoreBonus > 0) breakdown += ` + Score: +${scoreBonus.toFixed(2)}`;
    }
    
    if (profile.winRate > 0.5) {
        const winRateBonus = Math.min(0.2, (profile.winRate - 0.5) * 0.4);
        if (winRateBonus > 0) breakdown += ` + WinRate: +${winRateBonus.toFixed(2)}`;
    }
    
    if (profile.consecutiveWins > 0) {
        const winBonus = Math.min(0.3, profile.consecutiveWins * 0.05);
        if (winBonus > 0) breakdown += ` + Streak: +${winBonus.toFixed(2)}`;
    }
    
    if (profile.consecutiveLosses >= 3) {
        breakdown += ' + Decay: -0.15';
        if (profile.consecutiveLosses >= 5) {
            breakdown += ' (additional -0.20)';
        }
    }
    
    console.log(`  Calculation:           ${breakdown} = ${multiplier.toFixed(2)}x`);
    
    if (profile.recentScores && profile.recentScores.length > 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📈 RECENT SCORES (Last 10 Games)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const recent = profile.recentScores.slice(-10);
        console.log(`  Scores: [${recent.map(s => Math.floor(s)).join(', ')}]`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.groupEnd();
}

// Export functions
if (typeof window !== 'undefined') {
    window.difficultyManager = {
        loadPlayerProfile,
        savePlayerProfile,
        updatePlayerProfileAfterGame,
        getPlayerDifficultyProfile,
        calculateDifficultyMultiplier,
        getDifficultyTier,
        createDefaultProfile,
        logPlayerProfileMetrics
    };
}

