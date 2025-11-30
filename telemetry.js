// Gameplay Telemetry System
// Records player behavior for analysis

class TelemetryRecorder {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.sessionData = {
            sessionId: this.sessionId,
            playerEmail: null,
            playerName: null,
            startTime: Date.now(),
            endTime: null,

            // Movement tracking
            positionSamples: [], // Sampled every 500ms
            movementPatterns: {
                totalDistance: 0,
                leftMovements: 0,
                rightMovements: 0,
                averageSpeed: 0
            },

            // Shooting behavior
            shots: [], // Each shot with timestamp, position, outcome
            shootingStats: {
                totalShots: 0,
                hits: 0,
                misses: 0,
                accuracy: 0,
                shotInterval: [] // Time between shots
            },

            // Grenade usage
            grenades: [],
            grenadeStats: {
                totalLaunched: 0,
                hits: 0,
                enemiesKilledPerGrenade: []
            },

            // Combat events
            combatEvents: [], // Deaths, powerups, enemy kills

            // Performance
            levelReached: 1,
            finalScore: 0,
            playTime: 0,

            // Device info
            screenResolution: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };

        this.lastPosition = { x: 0, y: 0 };
        this.lastShotTime = 0;
        this.lastSampleTime = 0;
        this.sampleInterval = 500; // Sample position every 500ms

        this.isRecording = false;
    }

    generateSessionId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    resetSession(preserveEmail = false) {
        // Generate new session ID and reset all session data for a new game
        const oldEmail = preserveEmail ? this.sessionData.playerEmail : null;
        const oldName = preserveEmail ? this.sessionData.playerName : null;
        
        this.sessionId = this.generateSessionId();
        this.sessionData = {
            sessionId: this.sessionId,
            playerEmail: oldEmail,
            playerName: oldName,
            startTime: Date.now(),
            endTime: null,

            // Movement tracking
            positionSamples: [],
            movementPatterns: {
                totalDistance: 0,
                leftMovements: 0,
                rightMovements: 0,
                averageSpeed: 0
            },

            // Shooting behavior
            shots: [],
            shootingStats: {
                totalShots: 0,
                hits: 0,
                misses: 0,
                accuracy: 0,
                shotInterval: []
            },

            // Grenade usage
            grenades: [],
            grenadeStats: {
                totalLaunched: 0,
                hits: 0,
                enemiesKilledPerGrenade: []
            },

            // Combat events
            combatEvents: [],

            // Performance
            levelReached: 1,
            finalScore: 0,
            playTime: 0,

            // Device info
            screenResolution: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString()
        };

        this.lastPosition = { x: 0, y: 0 };
        this.lastShotTime = 0;
        this.lastSampleTime = 0;
        this.isRecording = false;
    }

    startRecording(playerEmail, playerName) {
        // If email not provided, try to get it from multiple sources
        if (!playerEmail) {
            if (this.sessionData.playerEmail) {
                // Use existing email from previous session
                playerEmail = this.sessionData.playerEmail;
                playerName = playerName || this.sessionData.playerName;
                console.log('📊 Telemetry: Using email from previous session:', playerEmail);
            } else if (typeof window !== 'undefined' && window.currentUser && window.currentUser.email) {
                // Try window.currentUser
                playerEmail = window.currentUser.email;
                playerName = playerName || window.currentUser.name;
                console.log('📊 Telemetry: Using email from window.currentUser:', playerEmail);
            } else if (typeof getCurrentUser === 'function') {
                // Try getCurrentUser function
                try {
                    const currentUser = getCurrentUser();
                    if (currentUser && currentUser.email) {
                        playerEmail = currentUser.email;
                        playerName = playerName || currentUser.name;
                        console.log('📊 Telemetry: Using email from getCurrentUser():', playerEmail);
                    }
                } catch (e) {
                    console.warn('⚠️ Could not get user for telemetry:', e);
                }
            }
        }
        
        // Reset session data for a new game
        this.resetSession();
        
        // Set player info if we have it
        if (playerEmail) {
            this.sessionData.playerEmail = playerEmail;
            this.sessionData.playerName = playerName || null;
            this.isRecording = true;
            console.log('📊 Telemetry recording started:', this.sessionId, 'for:', playerEmail);
        } else {
            console.warn('⚠️ Telemetry: Cannot start recording without player email');
            this.isRecording = false;
        }
    }

    stopRecording() {
        this.isRecording = false;
        this.sessionData.endTime = Date.now();
        this.sessionData.playTime = (this.sessionData.endTime - this.sessionData.startTime) / 1000;
        this.calculateStats();
        console.log('📊 Telemetry recording stopped');
    }

    // Track player position (sampled)
    recordPosition(x, y, timestamp) {
        if (!this.isRecording) return;

        const now = timestamp || Date.now();
        if (now - this.lastSampleTime < this.sampleInterval) return;

        this.sessionData.positionSamples.push({
            x: Math.round(x),
            y: Math.round(y),
            t: now - this.sessionData.startTime
        });

        // Calculate distance traveled
        if (this.lastPosition.x !== 0) {
            const distance = Math.sqrt(
                Math.pow(x - this.lastPosition.x, 2) +
                Math.pow(y - this.lastPosition.y, 2)
            );
            this.sessionData.movementPatterns.totalDistance += distance;
        }

        this.lastPosition = { x, y };
        this.lastSampleTime = now;
    }

    // Track movement direction
    recordMovement(direction) {
        if (!this.isRecording) return;

        if (direction === 'left') {
            this.sessionData.movementPatterns.leftMovements++;
        } else if (direction === 'right') {
            this.sessionData.movementPatterns.rightMovements++;
        }
    }

    // Track shot fired - returns shot index for later hit tracking
    recordShot(x, y, hit = false, targetType = null) {
        if (!this.isRecording) return null;

        const now = Date.now();
        const timeSinceStart = now - this.sessionData.startTime;

        // Record shot interval
        if (this.lastShotTime > 0) {
            const interval = now - this.lastShotTime;
            this.sessionData.shootingStats.shotInterval.push(interval);
        }

        const shotIndex = this.sessionData.shots.length;
        this.sessionData.shots.push({
            x: Math.round(x),
            y: Math.round(y),
            t: timeSinceStart,
            hit: hit,
            target: targetType
        });

        this.sessionData.shootingStats.totalShots++;
        if (hit) {
            this.sessionData.shootingStats.hits++;
        } else {
            this.sessionData.shootingStats.misses++;
        }

        this.lastShotTime = now;
        
        // Return shot index so we can mark it as a hit later
        return shotIndex;
    }
    
    // Mark a shot as a hit (called when bullet hits an enemy)
    markShotAsHit(shotIndex, targetType = null) {
        if (!this.isRecording || !shotIndex || shotIndex < 0 || shotIndex >= this.sessionData.shots.length) {
            return;
        }
        
        const shot = this.sessionData.shots[shotIndex];
        // Only update if it wasn't already marked as a hit
        if (!shot.hit) {
            shot.hit = true;
            if (targetType) {
                shot.target = targetType;
            }
            
            // Update stats
            this.sessionData.shootingStats.misses = Math.max(0, this.sessionData.shootingStats.misses - 1);
            this.sessionData.shootingStats.hits++;
        }
    }

    // Track grenade launch
    recordGrenade(x, y, enemiesKilled = 0) {
        if (!this.isRecording) return;

        const timeSinceStart = Date.now() - this.sessionData.startTime;

        this.sessionData.grenades.push({
            x: Math.round(x),
            y: Math.round(y),
            t: timeSinceStart,
            kills: enemiesKilled
        });

        this.sessionData.grenadeStats.totalLaunched++;
        if (enemiesKilled > 0) {
            this.sessionData.grenadeStats.hits++;
            this.sessionData.grenadeStats.enemiesKilledPerGrenade.push(enemiesKilled);
        }
    }

    // Track combat events
    recordEvent(eventType, data = {}) {
        if (!this.isRecording) return;

        const timeSinceStart = Date.now() - this.sessionData.startTime;

        this.sessionData.combatEvents.push({
            type: eventType,
            t: timeSinceStart,
            ...data
        });
    }

    // Calculate final statistics
    calculateStats() {
        // Calculate accuracy
        if (this.sessionData.shootingStats.totalShots > 0) {
            this.sessionData.shootingStats.accuracy =
                (this.sessionData.shootingStats.hits / this.sessionData.shootingStats.totalShots) * 100;
        }

        // Calculate average shot interval
        if (this.sessionData.shootingStats.shotInterval.length > 0) {
            const avgInterval = this.sessionData.shootingStats.shotInterval.reduce((a, b) => a + b, 0) /
                                this.sessionData.shootingStats.shotInterval.length;
            this.sessionData.shootingStats.averageInterval = Math.round(avgInterval);
        }

        // Calculate average speed (distance per second)
        if (this.sessionData.playTime > 0) {
            this.sessionData.movementPatterns.averageSpeed =
                this.sessionData.movementPatterns.totalDistance / this.sessionData.playTime;
        }

        // Calculate average grenade efficiency
        if (this.sessionData.grenadeStats.enemiesKilledPerGrenade.length > 0) {
            const avgKills = this.sessionData.grenadeStats.enemiesKilledPerGrenade.reduce((a, b) => a + b, 0) /
                            this.sessionData.grenadeStats.enemiesKilledPerGrenade.length;
            this.sessionData.grenadeStats.averageKillsPerGrenade = avgKills.toFixed(2);
        }
    }

    // Save telemetry to Firestore
    async saveTelemetry() {
        // ALWAYS try to get the email from multiple sources before saving
        if (!this.sessionData.playerEmail) {
            console.log('📊 Telemetry: Email missing, attempting to retrieve from all sources...');
            
            let emailFound = false;
            
            // Source 1: window.currentUser
            if (typeof window !== 'undefined' && window.currentUser && window.currentUser.email) {
                this.sessionData.playerEmail = window.currentUser.email;
                this.sessionData.playerName = window.currentUser.name || this.sessionData.playerName;
                console.log('✅ Telemetry: Using email from window.currentUser:', this.sessionData.playerEmail);
                emailFound = true;
            }
            
            // Source 2: getCurrentUser function
            if (!emailFound && typeof getCurrentUser === 'function') {
                try {
                    const currentUser = getCurrentUser();
                    if (currentUser && currentUser.email) {
                        this.sessionData.playerEmail = currentUser.email;
                        this.sessionData.playerName = currentUser.name || this.sessionData.playerName;
                        console.log('✅ Telemetry: Using email from getCurrentUser():', this.sessionData.playerEmail);
                        emailFound = true;
                    }
                } catch (e) {
                    console.warn('⚠️ Could not call getCurrentUser():', e);
                }
            }
            
            // Source 3: localStorage (direct access as last resort)
            if (!emailFound && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                try {
                    const authData = localStorage.getItem('galacticStrategistAuth');
                    if (authData) {
                        const userData = JSON.parse(authData);
                        if (userData && userData.email) {
                            this.sessionData.playerEmail = userData.email;
                            this.sessionData.playerName = userData.name || this.sessionData.playerName;
                            console.log('✅ Telemetry: Using email from localStorage:', this.sessionData.playerEmail);
                            emailFound = true;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Could not read from localStorage:', e);
                }
            }
            
            if (!emailFound) {
                console.error('❌ Cannot save telemetry: No player email found in any source');
                console.error('   Debug info:', {
                    hasSessionEmail: !!this.sessionData.playerEmail,
                    hasWindow: typeof window !== 'undefined',
                    hasCurrentUser: typeof window !== 'undefined' && !!window.currentUser,
                    currentUserEmail: typeof window !== 'undefined' && window.currentUser ? window.currentUser.email : 'N/A',
                    hasGetCurrentUser: typeof getCurrentUser === 'function',
                    localStorageAvailable: typeof window !== 'undefined' && typeof localStorage !== 'undefined'
                });
                return { success: false, message: 'No player email' };
            }
        }
        
        console.log('✅ Telemetry save proceeding with email:', this.sessionData.playerEmail);

        if (!window.db) {
            if (typeof initFirestore === 'function') {
                initFirestore();
            }
            if (!window.db) {
                console.error('❌ Cannot save telemetry: Firestore not initialized');
                return { success: false, message: 'Database not available' };
            }
        }

        try {
            // Prepare data for storage (limit array sizes to avoid exceeding Firestore limits)
            // Create clean shootingStats without shotInterval array
            const cleanShootingStats = { ...this.sessionData.shootingStats };
            delete cleanShootingStats.shotInterval; // Remove raw intervals array
            
            // Create clean grenadeStats without enemiesKilledPerGrenade array
            const cleanGrenadeStats = { ...this.sessionData.grenadeStats };
            delete cleanGrenadeStats.enemiesKilledPerGrenade; // Remove raw data array
            
            const telemetryData = {
                ...this.sessionData,
                // Limit position samples to last 1000
                positionSamples: this.sessionData.positionSamples.slice(-1000),
                // Limit shots to last 2000
                shots: this.sessionData.shots.slice(-2000),
                // Limit combat events to last 500
                combatEvents: this.sessionData.combatEvents.slice(-500),
                // Use cleaned stats objects (without large arrays)
                shootingStats: cleanShootingStats,
                grenadeStats: cleanGrenadeStats,
                savedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            console.log('💾 Saving telemetry to Firestore...');
            const docRef = await window.db.collection('telemetry').add(telemetryData);
            console.log('✅ Telemetry saved with ID:', docRef.id);

            return { success: true, docId: docRef.id };
        } catch (error) {
            console.error('❌ Error saving telemetry:', error);
            return { success: false, message: error.message };
        }
    }

    // Get summary for console logging
    getSummary() {
        return {
            sessionId: this.sessionId,
            playTime: `${this.sessionData.playTime.toFixed(1)}s`,
            shots: this.sessionData.shootingStats.totalShots,
            accuracy: `${this.sessionData.shootingStats.accuracy.toFixed(1)}%`,
            grenades: this.sessionData.grenadeStats.totalLaunched,
            distance: `${this.sessionData.movementPatterns.totalDistance.toFixed(0)}px`,
            level: this.sessionData.levelReached,
            score: this.sessionData.finalScore
        };
    }
}

// Global telemetry instance
if (typeof window !== 'undefined') {
    window.telemetryRecorder = new TelemetryRecorder();
}
