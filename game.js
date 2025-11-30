const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- AUDIO SYSTEM ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = true;

const sounds = {
    // Player shoot sound - short laser burst
    playerShoot: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    },

    // Enemy hit - shield damage
    enemyHit: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.15);
    },

    // Enemy destroyed - explosion
    enemyDestroy: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    },

    // Shield hit
    shieldHit: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
    },

    // Hull damage
    hullHit: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);

        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
    },

    // Powerup collected
    powerup: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
    },

    // Weapon jammed
    weaponJam: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    },

    // Level complete
    levelComplete: (audioCtx) => {
        [400, 500, 600, 800].forEach((freq, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);

            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(audioCtx.currentTime + i * 0.1);
            oscillator.stop(audioCtx.currentTime + i * 0.1 + 0.3);
        });
    },

    // Game over (failure)
    gameOver: (audioCtx) => {
        // Descending sad trombone effect
        [500, 400, 300, 150].forEach((freq, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
            oscillator.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + i * 0.15 + 0.4);

            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.4);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(audioCtx.currentTime + i * 0.15);
            oscillator.stop(audioCtx.currentTime + i * 0.15 + 0.4);
        });
    },

    // Victory (all levels complete)
    victory: (audioCtx) => {
        // Triumphant fanfare
        const melody = [
            { freq: 523, time: 0 },      // C5
            { freq: 659, time: 0.15 },   // E5
            { freq: 784, time: 0.3 },    // G5
            { freq: 1047, time: 0.45 },  // C6
            { freq: 784, time: 0.7 },    // G5
            { freq: 1047, time: 0.85 },  // C6
            { freq: 1047, time: 1.0 },   // C6 (sustained)
        ];

        melody.forEach((note, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(note.freq, audioCtx.currentTime + note.time);

            const duration = i === melody.length - 1 ? 0.6 : 0.15;
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + note.time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + note.time + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(audioCtx.currentTime + note.time);
            oscillator.stop(audioCtx.currentTime + note.time + duration);
        });
    },

    // Grenade launch - whoosh sound
    grenadeLaunch: (audioCtx) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.25);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.25);
    },

    // Grenade explosion - DRAMATIC big boom with fragments
    grenadeExplode: (audioCtx) => {
        const baseTime = audioCtx.currentTime;
        const duration = 0.8; // Longer explosion

        // Layer 1: Deep sub-bass BOOM (very low frequency punch)
        const subBoom = audioCtx.createOscillator();
        const subBoomGain = audioCtx.createGain();
        subBoom.type = 'sawtooth';
        subBoom.frequency.setValueAtTime(80, baseTime);
        subBoom.frequency.exponentialRampToValueAtTime(20, baseTime + 0.3);
        subBoomGain.gain.setValueAtTime(0.5, baseTime);
        subBoomGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 0.5);
        subBoom.connect(subBoomGain);
        subBoomGain.connect(audioCtx.destination);
        subBoom.start(baseTime);
        subBoom.stop(baseTime + 0.5);

        // Layer 2: Main explosion body (mid-low range)
        const explosion = audioCtx.createOscillator();
        const explosionGain = audioCtx.createGain();
        explosion.type = 'sawtooth';
        explosion.frequency.setValueAtTime(600, baseTime);
        explosion.frequency.exponentialRampToValueAtTime(25, baseTime + duration);
        explosionGain.gain.setValueAtTime(0.6, baseTime);
        explosionGain.gain.exponentialRampToValueAtTime(0.01, baseTime + duration);
        explosion.connect(explosionGain);
        explosionGain.connect(audioCtx.destination);
        explosion.start(baseTime);
        explosion.stop(baseTime + duration);

        // Layer 3: Mid-range PUNCH (adds impact)
        const punch = audioCtx.createOscillator();
        const punchGain = audioCtx.createGain();
        punch.type = 'square';
        punch.frequency.setValueAtTime(400, baseTime);
        punch.frequency.exponentialRampToValueAtTime(50, baseTime + 0.25);
        punchGain.gain.setValueAtTime(0.4, baseTime);
        punchGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 0.25);
        punch.connect(punchGain);
        punchGain.connect(audioCtx.destination);
        punch.start(baseTime);
        punch.stop(baseTime + 0.25);

        // Layer 4: High-frequency CRACK (shockwave)
        const crack = audioCtx.createOscillator();
        const crackGain = audioCtx.createGain();
        crack.type = 'square';
        crack.frequency.setValueAtTime(2500, baseTime);
        crack.frequency.exponentialRampToValueAtTime(200, baseTime + 0.15);
        crackGain.gain.setValueAtTime(0.35, baseTime);
        crackGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 0.15);
        crack.connect(crackGain);
        crackGain.connect(audioCtx.destination);
        crack.start(baseTime);
        crack.stop(baseTime + 0.15);

        // Layer 5: Echo/reverb tail (delayed secondary boom)
        const echo = audioCtx.createOscillator();
        const echoGain = audioCtx.createGain();
        echo.type = 'sawtooth';
        echo.frequency.setValueAtTime(200, baseTime + 0.2);
        echo.frequency.exponentialRampToValueAtTime(30, baseTime + 0.6);
        echoGain.gain.setValueAtTime(0.25, baseTime + 0.2);
        echoGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 0.6);
        echo.connect(echoGain);
        echoGain.connect(audioCtx.destination);
        echo.start(baseTime + 0.2);
        echo.stop(baseTime + 0.6);

        // Enhanced fragment scatter sounds (more dramatic)
        [0.08, 0.12, 0.18, 0.24, 0.30, 0.36].forEach((delay, index) => {
            const fragment = audioCtx.createOscillator();
            const fragmentGain = audioCtx.createGain();
            
            // Vary fragment pitches for more complexity
            const startFreq = 1500 + (index * 200);
            const endFreq = 400 + (index * 100);

            fragment.type = 'square';
            fragment.frequency.setValueAtTime(startFreq, baseTime + delay);
            fragment.frequency.exponentialRampToValueAtTime(endFreq, baseTime + delay + 0.15);

            fragmentGain.gain.setValueAtTime(0.2, baseTime + delay);
            fragmentGain.gain.exponentialRampToValueAtTime(0.01, baseTime + delay + 0.15);

            fragment.connect(fragmentGain);
            fragmentGain.connect(audioCtx.destination);

            fragment.start(baseTime + delay);
            fragment.stop(baseTime + delay + 0.15);
        });
    },

    // Intensity Spike - Exciting alarm/warning sound
    intensitySpike: (audioCtx) => {
        // Create a dramatic rising siren with multiple layers
        const baseTime = audioCtx.currentTime;

        // Layer 1: Rising siren
        const siren = audioCtx.createOscillator();
        const sirenGain = audioCtx.createGain();
        siren.type = 'triangle';
        siren.frequency.setValueAtTime(200, baseTime);
        siren.frequency.exponentialRampToValueAtTime(800, baseTime + 0.5);
        siren.frequency.exponentialRampToValueAtTime(1200, baseTime + 1.0);
        sirenGain.gain.setValueAtTime(0.15, baseTime);
        sirenGain.gain.exponentialRampToValueAtTime(0.25, baseTime + 0.5);
        sirenGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 1.2);
        siren.connect(sirenGain).connect(audioCtx.destination);
        siren.start(baseTime);
        siren.stop(baseTime + 1.2);

        // Layer 2: Pulsing bass
        for (let i = 0; i < 4; i++) {
            const pulse = audioCtx.createOscillator();
            const pulseGain = audioCtx.createGain();
            pulse.type = 'square';
            pulse.frequency.setValueAtTime(80, baseTime + i * 0.2);
            pulseGain.gain.setValueAtTime(0, baseTime + i * 0.2);
            pulseGain.gain.exponentialRampToValueAtTime(0.2, baseTime + i * 0.2 + 0.05);
            pulseGain.gain.exponentialRampToValueAtTime(0.01, baseTime + i * 0.2 + 0.15);
            pulse.connect(pulseGain).connect(audioCtx.destination);
            pulse.start(baseTime + i * 0.2);
            pulse.stop(baseTime + i * 0.2 + 0.15);
        }

        // Layer 3: High energy stabs
        const stabFrequencies = [1200, 1400, 1600, 1800];
        stabFrequencies.forEach((freq, i) => {
            const stab = audioCtx.createOscillator();
            const stabGain = audioCtx.createGain();
            stab.type = 'sawtooth';
            stab.frequency.setValueAtTime(freq, baseTime + 0.3 + i * 0.15);
            stabGain.gain.setValueAtTime(0.18, baseTime + 0.3 + i * 0.15);
            stabGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 0.3 + i * 0.15 + 0.1);
            stab.connect(stabGain).connect(audioCtx.destination);
            stab.start(baseTime + 0.3 + i * 0.15);
            stab.stop(baseTime + 0.3 + i * 0.15 + 0.1);
        });

        // Layer 4: Electric zap effect
        const noise = audioCtx.createOscillator();
        const noiseGain = audioCtx.createGain();
        noise.type = 'square';
        noise.frequency.setValueAtTime(2000, baseTime + 0.8);
        noise.frequency.exponentialRampToValueAtTime(3000, baseTime + 1.0);
        noiseGain.gain.setValueAtTime(0.12, baseTime + 0.8);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, baseTime + 1.1);
        noise.connect(noiseGain).connect(audioCtx.destination);
        noise.start(baseTime + 0.8);
        noise.stop(baseTime + 1.1);
    }
};

function playSound(soundName) {
    if (!audioEnabled) return; // Skip if audio is disabled
    try {
        if (sounds[soundName]) {
            sounds[soundName](audioContext);
        }
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
}

// --- ASSET MANAGEMENT ---
const assets = {
    starLayers: []
};

// Create 3-layer parallax starfield
for (let layer = 0; layer < 3; layer++) {
    const stars = [];
    const numStars = layer === 0 ? 30 : layer === 1 ? 50 : 80;
    const speed = layer === 0 ? 0.1 : layer === 1 ? 0.3 : 0.5;
    const maxRadius = layer === 0 ? 1 : layer === 1 ? 1.5 : 2;

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * maxRadius + 0.5,
            alpha: Math.random() * 0.5 + 0.3,
            baseAlpha: Math.random() * 0.5 + 0.3
        });
    }

    assets.starLayers.push({ stars, speed });
}


// --- GAME CONSTANTS ---
const UI_HEIGHT = 120; // Height of UI area at top (includes hull label and extra info)
const PLAYER_WIDTH = 48; // Matched to sprite
const PLAYER_HEIGHT = 48; // Matched to sprite
const PLAYER_SPEED = 6.5; // Increased for smoother, more responsive control
const BULLET_SPEED = 7;
const BULLET_RADIUS = 3;
const GRENADE_SPEED = 5;
const GRENADE_RADIUS = 5;
const GRENADE_FRAGMENT_COUNT = 4;
const GRENADE_FRAGMENT_SPEED = 6;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 10;
const ENEMY_WIDTH = 48; // Matched to sprite
const ENEMY_HEIGHT = 32; // Matched to sprite
const ENEMY_GAP = 15;
let enemySpeedDirection = 1;
const ENEMY_BULLET_SPEED = 3; // Reduced from 4 to make bullets slower and easier to dodge
const ENEMY_BULLET_RADIUS = 3;
const ENEMY_SHOOT_CHANCE = 0.001; // Reduced from 0.002 to make base difficulty easier


// --- GAME OBJECTS ---
let player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    dx: 0,
    heat: 0,
    maxHeat: 100,
    heatPerShot: 8,                    // Overheat in 10 shots
    heatDissipationRate: 0.5,           // Moderate cooling rate
    heatDissipationDelay: 500,          // Brief 500ms delay before cooling starts
    weaponJammed: false,
    weaponLockoutActive: false,
    weaponLockoutEndTime: 0,
    lockoutDuration: 3000,              // 3 second lockout penalty
    shield: 100,
    maxShield: 100,
    shieldRechargeRate: 0.05, // Slower recharge - takes ~33 seconds to fully recharge
    shootCooldown: 200, // Reduced for more responsive shooting
    lastShotTime: 0,
    lives: 3,
    maxLives: 3,
    ammoBoostActive: false,
    ammoBoostShots: 0,
    ammoBoostCollectedTime: 0, // Track when ammo boost was collected for flash message
    grenades: 1,
    maxGrenades: 3,
    shieldHitTime: 0  // Track when shield was last hit for flash effect
};
let bullets = [];
let enemyBullets = [];
let enemies = [];
let powerups = [];
let grenades = []; // Main grenades and fragments

// Powerup constants
const POWERUP_SIZE = 20;
const POWERUP_FALL_SPEED = 2; // Base fall speed (will be adjusted by difficulty)
const ENEMY_BULLET_DAMAGE = 30;

// Level-specific powerup drop rates and shooting intensity
const LEVEL_BALANCE = {
    1: {
        dropChance: 0.15,        // 15% - Lower since shields are offline
        livesDropWeight: 0.65,   // 65% lives, 20% shield, 10% ammo, 5% grenade
        shieldDropWeight: 0.20,
        ammoDropWeight: 0.10,
        shootingIntensity: 0.8   // 80% base shooting rate
    },
    2: {
        dropChance: 0.25,        // 25% - Higher to sustain shield
        livesDropWeight: 0.20,   // 20% lives, 50% shield, 20% ammo, 10% grenade
        shieldDropWeight: 0.50,
        ammoDropWeight: 0.20,
        shootingIntensity: 1.2   // 120% base shooting rate
    },
    3: {
        dropChance: 0.30,        // 30% - Highest due to Sentinels - more grenades!
        livesDropWeight: 0.25,   // 25% lives, 40% shield, 15% ammo, 20% grenade
        shieldDropWeight: 0.40,
        ammoDropWeight: 0.15,
        shootingIntensity: 1.5   // 150% base shooting rate (intense!)
    }
};


// --- GAME STATE ---
let gameStartTime = 0;
let levelStartTime = 0; // Start time for current level
let totalAmmoUsed = 0; // Total shots fired
let levelAmmoUsed = 0; // Ammo used in current level
let totalScore = 0; // Total score across all levels
let totalEnemiesKilled = 0; // Track total enemies killed
let initialEnemyCount = 0; // Track starting enemy count

// Idle Demo Mode
let idleDemoMode = true; // Start in demo mode
let demoStartTime = 0;
let demoPlayerX = 0; // Demo player position (will be initialized in updateIdleDemo)
let demoPlayerDirection = 1; // 1 = right, -1 = left
let demoShotTimer = 0;
let demoPhase = 0; // Current demo phase (0 = idle, 1 = moving, 2 = shooting)

// Adaptive Difficulty System
let difficultyMultiplier = 1.0; // Base difficulty
let playerDifficultyProfile = null;
let adjustedGameParams = {}; // Stores difficulty-adjusted parameters

// Key state tracking for smoother controls
const keys = {
    left: false,
    right: false,
    space: false,
    grenade: false
};
let showHelp = false; // Toggle help panel
let showExtraInfo = false; // Toggle extra UI info (hidden key)
let strikeVolumeMultiplier = 1;
let intensitySpikeActive = false;
let nextIntensitySpikeTime = 0;
let intensitySpikeEndTime = 0;
let currentLevel = 1;

// Safety function to ensure we always start at Level 1
function enforceLevel1() {
    if (currentLevel !== 1) {
        console.error(`❌ CRITICAL: currentLevel is ${currentLevel}, forcing to 1!`);
        currentLevel = 1;
    }
    // Verify Level 1 exists
    if (!LEVELS[1]) {
        console.error('❌ CRITICAL: Level 1 definition missing!');
        return false;
    }
    return true;
}

// --- LEVEL DEFINITIONS ---
const LEVELS = {
    1: {
        name: "The Training Grid",
        formationName: "The Wall",
        themeColor: "#00FFFF", // Cyan
        enemyCount: 50,
        rows: 5,
        cols: 10,
        enemyType: "normal",
        formation: "wall"
    },
    2: {
        name: "Asteroid Field",
        formationName: "The Funnel",
        themeColor: "#FFA500", // Orange
        enemyCount: 40,
        rows: 4,
        cols: 10,
        enemyType: "normal",
        formation: "funnel"
    },
    3: {
        name: "Sentinel Fortress",
        formationName: "The Citadel",
        themeColor: "#4169E1", // Royal Blue
        enemyCount: 30,
        rows: 3,
        cols: 10,
        enemyType: "sentinel",
        formation: "citadel"
    }
};


// --- INITIALIZATION ---
function createEnemies() {
    // SAFETY CHECK: Force Level 1 if somehow currentLevel is wrong before game starts
    if (currentLevel !== 1 && gameStartTime === 0) {
        console.error(`❌ ERROR: createEnemies() called with currentLevel=${currentLevel} before game start! Forcing to 1.`);
        currentLevel = 1;
    }
    
    enemies = [];
    const level = LEVELS[currentLevel];
    
    console.log(`🔍 createEnemies() called for Level ${currentLevel}`);
    console.log(`🔍 Level definition exists:`, level ? 'YES' : 'NO');
    if (level) {
        console.log(`🔍 Level name: "${level.name}", formation: "${level.formation}"`);
    }

    if (!level) {
        console.error(`❌ ERROR: Level ${currentLevel} definition not found in LEVELS object!`);
        console.error(`Available levels:`, Object.keys(LEVELS));
        console.error(`Forcing to Level 1...`);
        currentLevel = 1;
        const level1 = LEVELS[1];
        if (level1) {
            createWallFormation(level1);
        } else {
            console.error(`❌ CRITICAL: Level 1 doesn't exist!`);
            return;
        }
    } else {
        switch (level.formation) {
            case 'wall':
                createWallFormation(level);
                break;
            case 'funnel':
                createFunnelFormation(level);
                break;
            case 'citadel':
                createCitadelFormation(level);
                break;
            default:
                console.warn(`⚠️ Unknown formation "${level.formation}", using wall formation`);
                createWallFormation(level);
        }
    }
    
    // Set initial enemy count after enemies are created
    initialEnemyCount = enemies.length;
    const actualLevel = LEVELS[currentLevel];
    console.log(`📍 Level ${currentLevel}: Created ${initialEnemyCount} enemies (${actualLevel ? actualLevel.name : 'UNKNOWN'})`);
    
    // Debug: Verify level configuration
    if (!actualLevel) {
        console.error(`❌ ERROR: Level ${currentLevel} definition not found after creation!`);
        console.error(`Available levels:`, Object.keys(LEVELS));
    } else {
        console.log(`📍 Level ${currentLevel} config:`, {
            name: actualLevel.name,
            formation: actualLevel.formation,
            expectedEnemies: actualLevel.enemyCount,
            actualEnemies: initialEnemyCount
        });
    }
}

// Level 1: The Wall - Dense 5x10 rectangle
function createWallFormation(level) {
    const startX = 60;
    const startY = UI_HEIGHT + 50; // Start below UI area

    for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < level.cols; col++) {
            const enemy = {
                x: col * (ENEMY_WIDTH + ENEMY_GAP) + startX,
                y: row * (ENEMY_HEIGHT + ENEMY_GAP) + startY,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                type: 'normal'
            };
            enemies.push(enemy);
        }
    }
}

// Level 2: The Funnel - V-shape formation
function createFunnelFormation(level) {
    const startX = 60;
    const startY = UI_HEIGHT + 50; // Start below UI area
    const cols = level.cols;
    const centerCol = Math.floor(cols / 2);

    for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Calculate Y offset based on distance from center
            const distanceFromCenter = Math.abs(col - centerCol);
            const yOffset = distanceFromCenter * (ENEMY_HEIGHT + ENEMY_GAP) * 0.5;

            const enemy = {
                x: col * (ENEMY_WIDTH + ENEMY_GAP) + startX,
                y: row * (ENEMY_HEIGHT + ENEMY_GAP) + startY + yOffset,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                type: 'normal'
            };
            enemies.push(enemy);
        }
    }
}

// Level 3: The Citadel - 4x4 Sentinel core with Normal shell
function createCitadelFormation(level) {
    const startX = 100;
    const startY = UI_HEIGHT + 20; // Start below UI area
    const gridSize = 10; // 10x10 total grid
    const sentinelStartRow = 3;
    const sentinelStartCol = 3;
    const sentinelSize = 4;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Skip empty corners to create shell effect
            if ((row === 0 || row === 1) && (col === 0 || col === 1)) continue; // Top-left corner
            if ((row === 0 || row === 1) && (col === 8 || col === 9)) continue; // Top-right corner
            if ((row === 8 || row === 9) && (col === 0 || col === 1)) continue; // Bottom-left corner
            if ((row === 8 || row === 9) && (col === 8 || col === 9)) continue; // Bottom-right corner

            // Determine if this position is in the Sentinel core (4x4 center)
            const isSentinel = (row >= sentinelStartRow && row < sentinelStartRow + sentinelSize) &&
                               (col >= sentinelStartCol && col < sentinelStartCol + sentinelSize);

            const enemy = {
                x: col * (ENEMY_WIDTH + ENEMY_GAP) + startX,
                y: row * (ENEMY_HEIGHT + ENEMY_GAP) + startY,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                type: isSentinel ? 'sentinel' : 'normal'
            };

            // Sentinel enemies have shields (difficulty-adjusted hits to destroy)
            if (enemy.type === 'sentinel') {
                enemy.shieldHits = adjustedGameParams.sentinelShieldHits || 3;
            }

            enemies.push(enemy);
        }
    }
}


// --- DRAW FUNCTIONS ---
function drawBackground() {
    // Base background color
    ctx.fillStyle = '#000015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply level theme tint
    const level = LEVELS[currentLevel];
    if (level) {
        ctx.fillStyle = level.themeColor;
        // Level 3: Stronger tint for oppressive Sentinel Fortress atmosphere
        ctx.globalAlpha = currentLevel === 3 ? 0.12 : 0.05;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // Intensity spike screen flash (purple/deep lilac)
    if (intensitySpikeActive) {
        const flashAlpha = Math.abs(Math.sin(Date.now() / 100)) * 0.15 + 0.1;
        ctx.fillStyle = '#BF00FF'; // Purple/deep lilac
        ctx.globalAlpha = flashAlpha;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // Draw 3-layer parallax starfield
    assets.starLayers.forEach((layer, layerIndex) => {
        layer.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();

            // Move stars down for parallax effect
            star.y += layer.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });
    });
}

function drawPlayer() {
    // Draw custom spaceship
    ctx.fillStyle = '#00BFFF'; // Cyan/blue color

    // Main ship body (triangle shape using rectangles)
    ctx.fillRect(player.x + player.width/2 - 4, player.y, 8, 15); // Nose
    ctx.fillRect(player.x + player.width/2 - 8, player.y + 15, 16, 10); // Mid section
    ctx.fillRect(player.x + player.width/2 - 12, player.y + 25, 24, 15); // Wide base

    // Cockpit
    ctx.fillStyle = '#FFFF00'; // Yellow
    ctx.fillRect(player.x + player.width/2 - 3, player.y + 18, 6, 6);

    // Wings
    ctx.fillStyle = '#4169E1'; // Royal blue
    ctx.fillRect(player.x, player.y + 30, 12, 10); // Left wing
    ctx.fillRect(player.x + player.width - 12, player.y + 30, 12, 10); // Right wing

    // Engine glow
    ctx.fillStyle = '#FF4500'; // Orange-red
    ctx.fillRect(player.x + 8, player.y + player.height - 3, 10, 3); // Left engine
    ctx.fillRect(player.x + player.width - 18, player.y + player.height - 3, 10, 3); // Right engine

    // Shield visualization (Level 2+ only)
    if (currentLevel >= 2 && player.shield > 0) {
        const shieldPercent = player.shield / player.maxShield;
        const now = Date.now();
        const timeSinceHit = now - player.shieldHitTime;

        // Shield color based on strength
        let shieldColor, shieldAlpha;
        if (shieldPercent > 0.6) {
            shieldColor = '0, 191, 255'; // Cyan - strong
            shieldAlpha = 0.4;
        } else if (shieldPercent > 0.3) {
            shieldColor = '0, 255, 255'; // Bright cyan - medium
            shieldAlpha = 0.5;
        } else {
            shieldColor = '255, 165, 0'; // Orange - critical
            shieldAlpha = 0.6;
        }

        // Hit flash effect (bright white flash for 300ms after hit)
        if (timeSinceHit < 300) {
            const flashIntensity = 1 - (timeSinceHit / 300);
            shieldColor = '255, 255, 255'; // White flash
            shieldAlpha = 0.8 * flashIntensity;
        }

        // Pulsing effect when shield is low
        let pulseAlpha = shieldAlpha;
        if (shieldPercent <= 0.3 && timeSinceHit >= 300) {
            pulseAlpha = shieldAlpha + Math.sin(Date.now() / 100) * 0.2;
        }

        // Draw shield as an oval/ellipse around the ship
        const shieldPadding = 8;
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        const radiusX = player.width / 2 + shieldPadding;
        const radiusY = player.height / 2 + shieldPadding;

        // Shield fill
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${shieldColor}, ${pulseAlpha * 0.3})`;
        ctx.fill();

        // Shield border (glowing edge)
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${shieldColor}, ${pulseAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner glow ring
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX - 2, radiusY - 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Hexagonal energy pattern overlay
        const hexagonRadius = Math.max(radiusX, radiusY);
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
            const x1 = centerX + Math.cos(angle) * hexagonRadius;
            const y1 = centerY + Math.sin(angle) * hexagonRadius * 0.8;
            const x2 = centerX + Math.cos(angle + Math.PI / 3) * hexagonRadius;
            const y2 = centerY + Math.sin(angle + Math.PI / 3) * hexagonRadius * 0.8;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(${shieldColor}, ${pulseAlpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    // Display flash message when non-heating ammo is collected (show for 3 seconds) - HIGH PRIORITY
    const now = Date.now();
    let showAmmoMessage = false;
    
    // Check if non-heating ammo was recently collected
    if (player.ammoBoostCollectedTime > 0) {
        const timeSinceCollected = now - player.ammoBoostCollectedTime;
        const flashDuration = 3000; // 3 seconds
        
        if (timeSinceCollected >= 0 && timeSinceCollected < flashDuration) {
            showAmmoMessage = true;
            const textX = player.x + player.width / 2;
            const textY = Math.max(UI_HEIGHT + 10, player.y - 35); // Ensure it's visible, above player or at least below UI
            
            // Determine which message to show (cycle through encouraging messages)
            let message = '';
            const messageIndex = Math.floor(timeSinceCollected / 600); // Change message every 600ms
            const messages = ['NON-HEATING AMMO!', "LET'S GO!", 'PUSH!'];
            message = messages[messageIndex % messages.length];
            
            // Calculate alpha for fade in/out
            let alpha = 1.0;
            if (timeSinceCollected < 300) {
                // Fade in
                alpha = Math.max(0.3, timeSinceCollected / 300); // Start at 30% minimum
            } else if (timeSinceCollected > flashDuration - 500) {
                // Fade out in last 500ms
                alpha = Math.max(0.1, (flashDuration - timeSinceCollected) / 500);
            }
            
            // Strong pulsing intensity for visibility
            const pulseIntensity = Math.abs(Math.sin(now / 60)) * 0.4 + 0.6; // Stronger, faster pulse
            
            // Draw background for better visibility (larger)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fillRect(textX - 140, textY - 20, 280, 32);
            
            // Draw border (ice blue)
            ctx.strokeStyle = 'rgba(0, 206, 209, 1.0)';
            ctx.lineWidth = 3;
            ctx.strokeRect(textX - 140, textY - 20, 280, 32);
            
            // Draw ice blue text with pulsing/flashing effect
            const iceBlueR = 0;
            const iceBlueG = 206;
            const iceBlueB = 209;
            
            // Text with strong glow shadow
            ctx.shadowBlur = 30;
            ctx.shadowColor = `rgba(0, 206, 209, ${alpha * 1.0})`;
            ctx.fillStyle = `rgba(${iceBlueR}, ${iceBlueG}, ${iceBlueB}, ${pulseIntensity * alpha})`;
            ctx.font = 'bold 22px "Courier New"';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(message, textX, textY);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        } else if (timeSinceCollected >= flashDuration) {
            // Reset timer after flash duration
            player.ammoBoostCollectedTime = 0;
        }
    }
    
    // Display "WEAPON OVERHEATING" warning above player ship (lower priority, only if ammo message not showing)
    if (player.weaponLockoutActive && !showAmmoMessage) {
        const textX = player.x + player.width / 2;
        const textY = player.y - 20;
        
        // Draw background for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(textX - 90, textY - 12, 180, 16);
        
        // Draw red text with pulsing effect
        const pulseIntensity = Math.abs(Math.sin(now / 100)) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 0, ${pulseIntensity})`;
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = "center";
        ctx.fillText('WEAPON OVERHEATING', textX, textY);
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const sizeBonus = intensitySpikeActive ? (adjustedGameParams.intensitySpikeEnemySizeBonus || 8) : 0;
        const height = enemy.height + sizeBonus;

        // SENTINEL ENEMIES - Paper Ship Design (Origami Style)
        if (enemy.type === 'sentinel' && !intensitySpikeActive) {
            const centerX = enemy.x + enemy.width / 2;

            // Base paper color with subtle shading
            const paperLight = '#E8E8E8';
            const paperMid = '#CCCCCC';
            const paperDark = '#999999';
            const paperEdge = '#666666';

            // Main hull - triangular paper fold
            ctx.fillStyle = paperMid;
            ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.width - 16, height - 16);

            // Bow (front point) - lightest fold
            ctx.fillStyle = paperLight;
            ctx.fillRect(centerX - 6, enemy.y, 12, 12);
            ctx.fillRect(centerX - 4, enemy.y - 4, 8, 4);
            ctx.fillRect(centerX - 2, enemy.y - 6, 4, 2);

            // Side folds (left) - darker
            ctx.fillStyle = paperDark;
            ctx.fillRect(enemy.x + 4, enemy.y + 10, 8, height - 20);
            ctx.fillRect(enemy.x, enemy.y + 14, 4, height - 28);

            // Side folds (right) - darker
            ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + 10, 8, height - 20);
            ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + 14, 4, height - 28);

            // Center mast/fold line
            ctx.fillStyle = paperEdge;
            ctx.fillRect(centerX - 1, enemy.y + 4, 2, height - 12);

            // Deck details (horizontal folds)
            ctx.fillStyle = paperLight;
            ctx.fillRect(enemy.x + 10, enemy.y + 14, enemy.width - 20, 3);
            ctx.fillRect(enemy.x + 12, enemy.y + 20, enemy.width - 24, 2);

            // Sail/flag markers (small triangles)
            ctx.fillStyle = '#FF6666'; // Red flag accent
            ctx.fillRect(centerX + 6, enemy.y + 8, 4, 2);
            ctx.fillRect(centerX + 7, enemy.y + 10, 3, 2);
            ctx.fillRect(centerX + 8, enemy.y + 12, 2, 2);

            ctx.fillStyle = '#6666FF'; // Blue flag accent
            ctx.fillRect(centerX - 10, enemy.y + 8, 4, 2);
            ctx.fillRect(centerX - 10, enemy.y + 10, 3, 2);
            ctx.fillRect(centerX - 10, enemy.y + 12, 2, 2);

            // Paper crease lines (thin dark lines)
            ctx.fillStyle = paperEdge;
            ctx.fillRect(enemy.x + 12, enemy.y + 12, enemy.width - 24, 1);
            ctx.fillRect(enemy.x + 14, enemy.y + 18, enemy.width - 28, 1);

            // Stern (back) - shadow
            ctx.fillStyle = paperDark;
            ctx.fillRect(enemy.x + 10, enemy.y + height - 10, enemy.width - 20, 6);
            ctx.fillRect(enemy.x + 12, enemy.y + height - 4, enemy.width - 24, 3);

        } else if (currentLevel === 1) {
            // LEVEL 1 ENEMIES - Simple alien creatures
            const bodyColor = intensitySpikeActive ? '#BF00FF' : '#00CC00'; // Purple during intensity spike

            // Main body (rounded rectangle)
            ctx.fillStyle = bodyColor;
            ctx.fillRect(enemy.x + 6, enemy.y + 8, enemy.width - 12, height - 12);

            // Head/top part
            ctx.fillRect(enemy.x + 8, enemy.y + 4, enemy.width - 16, 8);

            // Eye (large, centered)
            ctx.fillStyle = '#FFFFFF';
            const eyeSize = 10;
            ctx.fillRect(enemy.x + enemy.width/2 - eyeSize/2, enemy.y + 10, eyeSize, eyeSize);

            // Pupil
            ctx.fillStyle = '#000000';
            const pupilSize = 4;
            ctx.fillRect(enemy.x + enemy.width/2 - pupilSize/2, enemy.y + 13, pupilSize, pupilSize);

            // Legs (bottom appendages)
            ctx.fillStyle = '#006600';
            // Left leg
            ctx.fillRect(enemy.x + 8, enemy.y + height - 4, 4, 6);
            ctx.fillRect(enemy.x + 6, enemy.y + height + 2, 6, 2);

            // Right leg
            ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + height - 4, 4, 6);
            ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + height + 2, 6, 2);

            // Body details (belly/stripes)
            ctx.fillStyle = '#009900';
            ctx.fillRect(enemy.x + 10, enemy.y + 14, enemy.width - 20, 3);
            ctx.fillRect(enemy.x + 10, enemy.y + 19, enemy.width - 20, 3);

        } else {
            // LEVEL 2+ ENEMIES - 3 different variants (detailed, animated)
            let color = intensitySpikeActive ? '#BF00FF' : '#00FF00'; // Purple during intensity spike

            // Determine enemy variant based on position
            const variant = Math.floor((enemy.x + enemy.y) / 100) % 3;

            if (variant === 0) {
                // VARIANT 1: Fighter - Diamond/Angular shape
                ctx.fillStyle = color;

                // Main diamond body
                ctx.fillRect(enemy.x + enemy.width/2 - 6, enemy.y + 4, 12, 12);
                ctx.fillRect(enemy.x + enemy.width/2 - 10, enemy.y + 8, 20, 6);

                // Cockpit/eye
                ctx.fillStyle = '#000000';
                ctx.fillRect(enemy.x + enemy.width/2 - 2, enemy.y + 10, 4, 3);

                // Wings
                ctx.fillStyle = color;
                ctx.fillRect(enemy.x + 2, enemy.y + 12, 8, 4);
                ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 12, 8, 4);

                // Engine thrusters
                ctx.fillStyle = intensitySpikeActive ? '#FFFF00' : '#00FFFF';
                ctx.fillRect(enemy.x + enemy.width/2 - 8, enemy.y + height - 4, 4, 3);
                ctx.fillRect(enemy.x + enemy.width/2 + 4, enemy.y + height - 4, 4, 3);

            } else if (variant === 1) {
                // VARIANT 2: Interceptor - Sleek/Streamlined
                ctx.fillStyle = color;

                // Nose cone
                ctx.fillRect(enemy.x + enemy.width/2 - 4, enemy.y, 8, 6);
                ctx.fillRect(enemy.x + enemy.width/2 - 2, enemy.y - 2, 4, 2);

                // Main fuselage
                ctx.fillRect(enemy.x + enemy.width/2 - 8, enemy.y + 6, 16, 12);

                // Side panels
                ctx.fillRect(enemy.x + 4, enemy.y + 10, 6, 6);
                ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 10, 6, 6);

                // Cockpit windows
                ctx.fillStyle = '#000000';
                ctx.fillRect(enemy.x + enemy.width/2 - 4, enemy.y + 8, 3, 6);
                ctx.fillRect(enemy.x + enemy.width/2 + 1, enemy.y + 8, 3, 6);

                // Rear stabilizers
                ctx.fillStyle = color;
                ctx.fillRect(enemy.x + enemy.width/2 - 10, enemy.y + height - 4, 6, 3);
                ctx.fillRect(enemy.x + enemy.width/2 + 4, enemy.y + height - 4, 6, 3);

            } else {
                // VARIANT 3: Bomber - Bulky/Heavy
                ctx.fillStyle = color;

                // Wide main body
                ctx.fillRect(enemy.x + 6, enemy.y + 4, enemy.width - 12, 14);

                // Top armor
                ctx.fillRect(enemy.x + 10, enemy.y, enemy.width - 20, 4);

                // Weapon pods
                ctx.fillStyle = '#006600';
                ctx.fillRect(enemy.x + 4, enemy.y + 8, 6, 8);
                ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 8, 6, 8);

                // Cockpit viewport
                ctx.fillStyle = '#000000';
                ctx.fillRect(enemy.x + enemy.width/2 - 6, enemy.y + 6, 12, 4);

                // Dual engines
                ctx.fillStyle = intensitySpikeActive ? '#FF6600' : '#00FF88';
                ctx.fillRect(enemy.x + 8, enemy.y + height - 4, 5, 4);
                ctx.fillRect(enemy.x + enemy.width - 13, enemy.y + height - 4, 5, 4);

                // Engine glow
                ctx.fillRect(enemy.x + 10, enemy.y + height - 2, 3, 2);
                ctx.fillRect(enemy.x + enemy.width - 13, enemy.y + height - 2, 3, 2);
            }

            // Intensity spike antennae (all variants)
            if (intensitySpikeActive) {
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(enemy.x + 8, enemy.y - 4, 3, 4);
                ctx.fillRect(enemy.x + enemy.width - 11, enemy.y - 4, 3, 4);
            }
        }

        // Draw enhanced shield overlay for sentinels
        if (enemy.type === 'sentinel' && enemy.shieldHits > 0) {
            // Shield color based on integrity
            let shieldColor, shieldBorder, shieldAlpha;
            if (enemy.shieldHits >= 2) {
                shieldColor = 'rgba(0, 191, 255, 0.3)'; // Cyan - strong
                shieldBorder = '#00BFFF';
                shieldAlpha = 0.3;
            } else {
                // Critical - 1 hit left
                shieldColor = 'rgba(255, 165, 0, 0.4)'; // Orange - critical
                shieldBorder = '#FFA500';
                shieldAlpha = 0.4;
            }

            // Shield fill
            ctx.fillStyle = shieldColor;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, height);

            // Shield quadrant corners for energy barrier effect
            const cornerSize = 8;
            ctx.strokeStyle = shieldBorder;
            ctx.lineWidth = 3;

            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y + cornerSize);
            ctx.lineTo(enemy.x, enemy.y);
            ctx.lineTo(enemy.x + cornerSize, enemy.y);
            ctx.stroke();

            // Top-right corner
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width - cornerSize, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + cornerSize);
            ctx.stroke();

            // Bottom-left corner
            ctx.beginPath();
            ctx.moveTo(enemy.x, enemy.y + height - cornerSize);
            ctx.lineTo(enemy.x, enemy.y + height);
            ctx.lineTo(enemy.x + cornerSize, enemy.y + height);
            ctx.stroke();

            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width - cornerSize, enemy.y + height);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + height);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + height - cornerSize);
            ctx.stroke();

            // Shield flash when critical (1 hit left)
            if (enemy.shieldHits === 1) {
                const flash = Math.sin(Date.now() / 80) > 0;
                if (flash) {
                    ctx.strokeStyle = '#FFFF00'; // Yellow flash
                    ctx.lineWidth = 2;
                    ctx.strokeRect(enemy.x, enemy.y, enemy.width, height);
                }
            }

            // Shield hit count - larger and more prominent
            const countColor = enemy.shieldHits === 1 ? '#FF0000' : '#FFFFFF';
            ctx.fillStyle = countColor;
            ctx.font = 'bold 16px "Courier New"';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(enemy.shieldHits, enemy.x + enemy.width / 2, enemy.y + height / 2 + 5);
            ctx.fillText(enemy.shieldHits, enemy.x + enemy.width / 2, enemy.y + height / 2 + 5);
        }
    });
}

function drawBullets() {
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = '#FF66B2';
    enemyBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, ENEMY_BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPowerups() {
    powerups.forEach(powerup => {
        if (powerup.type === 'lives') {
            // Draw health powerup (red cross/plus)
            ctx.fillStyle = '#FF0066';
            // Vertical bar
            ctx.fillRect(powerup.x + POWERUP_SIZE/2 - 3, powerup.y + 2, 6, POWERUP_SIZE - 4);
            // Horizontal bar
            ctx.fillRect(powerup.x + 2, powerup.y + POWERUP_SIZE/2 - 3, POWERUP_SIZE - 4, 6);

            // White border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE);
        } else if (powerup.type === 'shield') {
            // Draw shield powerup (cyan battery)
            ctx.fillStyle = '#00FFFF'; // Cyan color
            ctx.fillRect(powerup.x + 2, powerup.y + 4, POWERUP_SIZE - 4, POWERUP_SIZE - 8);

            // Battery terminal
            ctx.fillRect(powerup.x + 6, powerup.y + 2, POWERUP_SIZE - 12, 2);

            // Energy bars inside
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(powerup.x + 5, powerup.y + 7, POWERUP_SIZE - 10, 2);
            ctx.fillRect(powerup.x + 5, powerup.y + 11, POWERUP_SIZE - 10, 2);
            ctx.fillRect(powerup.x + 5, powerup.y + 15, POWERUP_SIZE - 10, 2);

            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE);
        } else if (powerup.type === 'ammo') {
            // Draw ammo powerup (ice blue bullet/magazine - non-heating ammo)
            ctx.fillStyle = '#00CED1'; // Ice blue color
            // Magazine body
            ctx.fillRect(powerup.x + 4, powerup.y + 6, POWERUP_SIZE - 8, POWERUP_SIZE - 10);

            // Bullets sticking out
            ctx.fillStyle = '#00E5FF'; // Light ice blue bullet tips
            ctx.fillRect(powerup.x + 6, powerup.y + 3, 3, 4);
            ctx.fillRect(powerup.x + 11, powerup.y + 3, 3, 4);

            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE);
        } else if (powerup.type === 'grenade') {
            // Draw grenade powerup (dark gray with orange core)
            ctx.fillStyle = '#808080'; // Gray
            ctx.beginPath();
            ctx.arc(powerup.x + POWERUP_SIZE/2, powerup.y + POWERUP_SIZE/2, 8, 0, Math.PI * 2);
            ctx.fill();

            // Orange core
            ctx.fillStyle = '#FF6600';
            ctx.beginPath();
            ctx.arc(powerup.x + POWERUP_SIZE/2, powerup.y + POWERUP_SIZE/2, 5, 0, Math.PI * 2);
            ctx.fill();

            // Yellow center flash
            if (Math.sin(Date.now() / 150) > 0) {
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(powerup.x + POWERUP_SIZE/2, powerup.y + POWERUP_SIZE/2, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE);
        }
    });
}

function drawGrenades() {
    grenades.forEach(grenade => {
        if (grenade.type === 'main') {
            // Draw main grenade - larger dark projectile
            ctx.fillStyle = '#808080'; // Gray
            ctx.beginPath();
            ctx.arc(grenade.x, grenade.y, GRENADE_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            // Add detail - center core
            ctx.fillStyle = '#FF4500'; // Orange-red core
            ctx.beginPath();
            ctx.arc(grenade.x, grenade.y, GRENADE_RADIUS - 2, 0, Math.PI * 2);
            ctx.fill();

            // Blinking indicator
            if (Math.sin(Date.now() / 100) > 0) {
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(grenade.x, grenade.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (grenade.type === 'fragment') {
            // Draw fragment - small bright projectile
            ctx.fillStyle = '#FF6600'; // Bright orange
            ctx.beginPath();
            ctx.arc(grenade.x, grenade.y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            ctx.fillStyle = 'rgba(255, 102, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(grenade.x, grenade.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawHealthBar() {
    const heartSize = 20;
    const heartSpacing = 25;
    const startX = canvas.width - 10 - (player.lives * heartSpacing);
    const startY = 50; // Moved down to avoid overlap with time counter

    for (let i = 0; i < player.lives; i++) {
        const x = startX + (i * heartSpacing);

        // Draw heart shape using rectangles (pixelated style)
        ctx.fillStyle = '#FF0066';

        // Top two bumps
        ctx.fillRect(x, startY + 5, 7, 7);
        ctx.fillRect(x + 10, startY + 5, 7, 7);

        // Middle section
        ctx.fillRect(x, startY + 10, 17, 7);

        // Bottom point
        ctx.fillRect(x + 3, startY + 15, 11, 3);
        ctx.fillRect(x + 5, startY + 18, 7, 3);
        ctx.fillRect(x + 7, startY + 21, 3, 2);
    }

    // Label
    ctx.fillStyle = 'white';
    ctx.font = '14px "Courier New"';
    ctx.textAlign = "right";
    ctx.fillText('HULL', canvas.width - 10, startY + 40);
}

function drawShieldBar() {
    const barWidth = 150;
    const barHeight = 20;
    const startX = 10;
    const startY = 10;

    // Level 1: Shield system inactive
    if (currentLevel === 1) {
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(startX, startY, barWidth, barHeight);

        // Border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, barWidth, barHeight);

        // Label
        ctx.fillStyle = '#666666';
        ctx.font = '12px "Courier New"';
        ctx.textAlign = "center";
        ctx.fillText('SHIELD: OFFLINE', startX + barWidth / 2, startY + 14);
        return;
    }

    // Level 2+: Normal shield display
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(startX, startY, barWidth, barHeight);

    // Shield fill
    const shieldPercent = player.shield / player.maxShield;
    let shieldColor = '#00FFFF'; // Cyan
    if (shieldPercent < 0.3) shieldColor = '#FF0000'; // Red
    else if (shieldPercent < 0.6) shieldColor = '#FFA500'; // Orange

    ctx.fillStyle = shieldColor;
    ctx.fillRect(startX, startY, barWidth * shieldPercent, barHeight);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, barWidth, barHeight);

    // Label
    ctx.fillStyle = 'white';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText(`SHIELD: ${Math.floor(player.shield)}/${player.maxShield}`, startX + barWidth / 2, startY + 14);
}

function drawHeatBar() {
    const barWidth = 150;
    const barHeight = 20;
    const startX = 10;
    const startY = 40;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(startX, startY, barWidth, barHeight);

    // Heat fill
    const heatPercent = player.heat / player.maxHeat;
    let heatColor = '#FFFF00'; // Yellow
    if (heatPercent > 0.7) heatColor = '#FF0000'; // Red
    else if (heatPercent > 0.5) heatColor = '#FFA500'; // Orange

    ctx.fillStyle = heatColor;
    ctx.fillRect(startX, startY, barWidth * heatPercent, barHeight);

    // Lockout overlay - show countdown progress
    if (player.weaponLockoutActive) {
        const now = Date.now();
        const lockoutRemaining = player.weaponLockoutEndTime - now;
        const lockoutPercent = lockoutRemaining / player.lockoutDuration;

        // Red flashing overlay during lockout
        const flashIntensity = Math.abs(Math.sin(now / 150)) * 0.5 + 0.3;
        ctx.fillStyle = `rgba(255, 0, 0, ${flashIntensity})`;
        ctx.fillRect(startX, startY, barWidth, barHeight);

        // Lockout countdown bar (red, decreasing)
        ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
        ctx.fillRect(startX, startY, barWidth * lockoutPercent, barHeight);
    } else if (heatPercent > 0.7 && !player.weaponJammed) {
        // Warning flash at high heat (70%+)
        const flash = Math.sin(Date.now() / 100) > 0;
        if (flash) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(startX, startY, barWidth, barHeight);
        }
    }

    // Border (thick red during lockout)
    ctx.strokeStyle = player.weaponLockoutActive ? '#FF0000' : '#FFFFFF';
    ctx.lineWidth = player.weaponLockoutActive ? 4 : 2;
    ctx.strokeRect(startX, startY, barWidth, barHeight);

    // Label
    ctx.fillStyle = 'white';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "center";

    if (player.weaponLockoutActive) {
        const now = Date.now();
        const lockoutRemaining = Math.ceil((player.weaponLockoutEndTime - now) / 1000);
        ctx.fillStyle = '#FF0000';
        ctx.fillText(`🔒 LOCKOUT: ${lockoutRemaining}s 🔒`, startX + barWidth / 2, startY + 14);
    } else if (player.weaponJammed) {
        ctx.fillStyle = '#FF0000';
        ctx.fillText('WEAPON JAMMED!', startX + barWidth / 2, startY + 14);
    } else if (player.ammoBoostActive) {
        ctx.fillStyle = '#00CED1'; // Ice blue to match non-heating ammo icon
        ctx.fillText(`❄ NON-HEATING AMMO: ${player.ammoBoostShots} shots ❄`, startX + barWidth / 2, startY + 14);
    } else if (heatPercent > 0.7) {
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('⚠ DANGER ZONE ⚠', startX + barWidth / 2, startY + 14);
    } else {
        ctx.fillText(`HEAT: ${Math.floor(player.heat)}/${player.maxHeat}`, startX + barWidth / 2, startY + 14);
    }
}

function drawGrenadeCount() {
    const startX = 10;
    const startY = 70; // Below heat bar
    const grenadeSize = 12;
    const grenadeSpacing = 18;

    // Label
    ctx.fillStyle = 'white';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "left";
    ctx.fillText('GRENADES (G):', startX, startY);

    // Draw grenade icons
    for (let i = 0; i < player.maxGrenades; i++) {
        const x = startX + (i * grenadeSpacing);
        const y = startY + 10;
        const isFilled = i < player.grenades;

        // Grenade icon
        ctx.fillStyle = isFilled ? '#FF6600' : '#333333'; // Orange if available, dark if empty
        ctx.beginPath();
        ctx.arc(x + grenadeSize/2, y + grenadeSize/2, grenadeSize/2, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = isFilled ? '#FFAA00' : '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + grenadeSize/2, y + grenadeSize/2, grenadeSize/2, 0, Math.PI * 2);
        ctx.stroke();

        // Core indicator
        if (isFilled) {
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(x + grenadeSize/2, y + grenadeSize/2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawLevelDisplay() {
    const level = LEVELS[currentLevel];
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px "Courier New"';
    ctx.textAlign = "center";
    
    // Draw with shadow for visibility
    ctx.fillStyle = '#000000';
    ctx.fillText(`LEVEL ${currentLevel}: ${level.name}`, canvas.width / 2 + 2, 22);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`LEVEL ${currentLevel}: ${level.name}`, canvas.width / 2, 20);
}

function drawDifficultyTier() {
    if (!playerDifficultyProfile) return;
    
    const tier = playerDifficultyProfile.difficultyTier || getDifficultyTierName(difficultyMultiplier);
    const multiplier = difficultyMultiplier || 1.0;
    
    // Color based on tier
    let color = '#FFFFFF';
    if (multiplier >= 2.0) color = '#FF0000'; // Master - Red
    else if (multiplier >= 1.6) color = '#FF6600'; // Expert - Orange
    else if (multiplier >= 1.3) color = '#FFAA00'; // Advanced - Yellow-Orange
    else if (multiplier >= 1.0) color = '#00FF00'; // Normal - Green
    else color = '#00FFFF'; // Beginner - Cyan
    
    ctx.fillStyle = color;
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "left";
    ctx.fillText(`DIFFICULTY: ${tier.toUpperCase()} (${multiplier.toFixed(2)}x)`, 10, 95);
}

function drawTimeCounter() {
    const now = Date.now();
    const elapsedSeconds = (now - levelStartTime) / 1000;
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = Math.floor(elapsedSeconds % 60);
    const milliseconds = Math.floor((elapsedSeconds % 1) * 100);

    // Format time as MM:SS:MS
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;

    ctx.font = 'bold 18px "Courier New"';
    ctx.textAlign = "right";

    // Draw with shadow for visibility (top-right corner)
    ctx.fillStyle = '#000000';
    ctx.fillText(`TIME: ${timeString}`, canvas.width - 8, 22);
    ctx.fillStyle = '#00FFFF'; // Cyan color
    ctx.fillText(`TIME: ${timeString}`, canvas.width - 10, 20);
}

function calculateLevelScore(timeSeconds, ammoUsed, enemiesKilled, totalEnemies) {
    // Score formula: Rewards actual gameplay
    // Ensure we have valid inputs with reasonable limits
    
    // Cap time to prevent absurdly large scores (max 1 hour = 3600 seconds)
    const validTime = Math.max(0, Math.min(timeSeconds || 0, 3600));
    const validAmmo = Math.max(0, ammoUsed || 0);
    const validKills = Math.max(0, Math.min(enemiesKilled || 0, totalEnemies || 50));
    const validTotalEnemies = Math.max(1, totalEnemies || 50);
    
    // No score for instant deaths (< 3 seconds with no kills and no ammo)
    if (validKills === 0 && validTime < 3 && validAmmo === 0) {
        return 0;
    }
    
    // Base points for survival (more time = better, but with diminishing returns)
    // Cap survival score at reasonable maximum (600 seconds = 20 minutes max)
    const survivalTime = Math.min(validTime, 600);
    const survivalScore = survivalTime * 30; // 30 points per second, max 18,000
    
    // Points for enemies killed (most important - up to 8000 points)
    const killRatio = Math.min(1, validKills / validTotalEnemies); // 0 to 1
    const killScore = killRatio * 8000; // Up to 8000 for all enemies killed
    
    // Efficiency bonus: more kills per ammo = better (but only if they actually killed enemies)
    let efficiencyScore = 0;
    if (validKills > 0 && validAmmo > 0) {
        const killsPerAmmo = validKills / validAmmo;
        efficiencyScore = Math.min(2000, killsPerAmmo * 100); // Bonus for efficiency, max 2000
    } else if (validKills > 0 && validAmmo === 0) {
        // Bonus for killing enemies without using ammo (grenades, etc.)
        efficiencyScore = 1000;
    }
    
    // Small bonus for longer games (encourages survival)
    const timeBonus = validTime > 60 ? 500 : 0;
    
    // Calculate final score (max reasonable score per level: ~26,800)
    const finalScore = survivalScore + killScore + efficiencyScore + timeBonus;
    
    // Additional safety cap per level (30,000 points max per level)
    return Math.max(0, Math.min(Math.floor(finalScore), 30000));
}

function drawScore() {
    const now = Date.now();
    
    // Validate levelStartTime - if not initialized, use gameStartTime as fallback
    const validLevelStartTime = levelStartTime > 0 ? levelStartTime : gameStartTime;
    const levelTime = validLevelStartTime > 0 ? (now - validLevelStartTime) / 1000 : 0;
    
    // Cap levelTime to prevent absurdly large scores (max 1 hour per level)
    const cappedLevelTime = Math.min(levelTime, 3600);
    
    const levelEnemiesKilled = initialEnemyCount - enemies.length;
    const levelScore = calculateLevelScore(cappedLevelTime, levelAmmoUsed, levelEnemiesKilled, initialEnemyCount);
    
    // Additional safety check - cap displayed score to prevent overflow
    const displayScore = Math.min(totalScore + levelScore, Number.MAX_SAFE_INTEGER);
    
    // Simplified display - just score, larger and centered
    ctx.font = 'bold 24px "Courier New"';
    ctx.textAlign = "center";
    
    // Current total score with shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(`SCORE: ${displayScore.toLocaleString()}`, canvas.width / 2 + 2, 52);
    ctx.fillStyle = '#FFD700'; // Gold color
    ctx.fillText(`SCORE: ${displayScore.toLocaleString()}`, canvas.width / 2, 50);
    
    // Only show detailed stats if extra info is enabled
    if (showExtraInfo) {
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = '#00FFFF'; // Cyan color for visibility
        ctx.textAlign = "left";
        ctx.fillText(`Level Score: ${levelScore.toLocaleString()} | Kills: ${levelEnemiesKilled}/${initialEnemyCount} | Ammo: ${levelAmmoUsed}`, 10, 110);
        ctx.textAlign = "center"; // Reset to center for other text
    }
}

function drawAudioToggle() {
    const buttonX = canvas.width - 80;
    const buttonY = canvas.height - 30;
    const buttonWidth = 70;
    const buttonHeight = 20;

    // Button background
    ctx.fillStyle = audioEnabled ? '#00FF00' : '#FF0000';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button text
    ctx.fillStyle = '#000000';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText(audioEnabled ? 'AUDIO ON' : 'AUDIO OFF', buttonX + buttonWidth / 2, buttonY + 14);

    // Instructions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px "Courier New"';
    ctx.textAlign = "right";
    ctx.fillText('Press M to toggle', canvas.width - 10, canvas.height - 10);
}

function drawHelpButton() {
    const buttonX = canvas.width - 160;
    const buttonY = canvas.height - 30;
    const buttonWidth = 60;
    const buttonHeight = 20;

    // Button background
    ctx.fillStyle = showHelp ? '#00FFFF' : '#444444';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button text
    ctx.fillStyle = showHelp ? '#000000' : '#FFFFFF';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText(showHelp ? 'HELP ON' : 'HELP', buttonX + buttonWidth / 2, buttonY + 14);

    // Instructions
    if (!showHelp) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = "left";
        ctx.fillText('Press H for help', buttonX, canvas.height - 10);
    }
}

function drawHelpPanel() {
    if (!showHelp) return;
    
    const panelWidth = 280;
    const panelX = canvas.width - panelWidth - 10;
    const panelY = UI_HEIGHT + 10;
    const panelHeight = canvas.height - UI_HEIGHT - 20;
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Border
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Title
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 16px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText('HELP - UI GUIDE', panelX + panelWidth / 2, panelY + 25);
    
    // Help content
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = "left";
    
    let yPos = panelY + 50;
    const lineHeight = 22;
    const labelWidth = 120;
    
    // Helper function to draw a help item
    function drawHelpItem(label, description, icon = '') {
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 12px "Courier New"';
        ctx.fillText(icon + label + ':', panelX + 10, yPos);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '11px "Courier New"';
        const words = description.split(' ');
        let line = '';
        let currentY = yPos + 15;
        
        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > panelWidth - 30 && line !== '') {
                ctx.fillText(line, panelX + 15, currentY);
                line = word + ' ';
                currentY += 14;
            } else {
                line = testLine;
            }
        }
        if (line !== '') {
            ctx.fillText(line, panelX + 15, currentY);
        }
        
        yPos = currentY + 10;
    }
    
    // Health/Lives
    ctx.fillStyle = '#FF0066';
    ctx.fillRect(panelX + 10, yPos - 18, 15, 15);
    drawHelpItem('HULL (Lives)', 'Your health. Each heart = 1 life. Lost when hit without shield.', '❤');
    
    // Shield
    drawHelpItem('SHIELD', 'Protection bar (Level 2+). Absorbs damage before hull. Recharges slowly. OFFLINE in Level 1.', '🛡');
    
    // Heat
    drawHelpItem('HEAT', 'Weapon temperature. Too high = weapon lockout. Yellow=OK, Orange=Warning, Red=Danger!', '🌡');
    
    // Grenades
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.arc(panelX + 10, yPos - 12, 6, 0, Math.PI * 2);
    ctx.fill();
    drawHelpItem('GRENADES', 'Explosive weapons. Press G to throw. Replenished by powerups.', '💣');
    
    // Ammo/Heat relationship
    yPos += 5;
    drawHelpItem('AMMO/HEAT', 'Firing increases heat. Wait for cooldown or face lockout!', '⚡');
    
    // Powerups - Visual icons section
    yPos += 15;
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px "Courier New"';
    ctx.fillText('AVAILABLE ICONS:', panelX + 10, yPos);
    yPos += 25;
    
    // Health icon
    const iconSize = 20;
    const iconX = panelX + 10;
    let iconY = yPos;
    
    // Health powerup icon (red cross)
    ctx.fillStyle = '#FF0066';
    ctx.fillRect(iconX + iconSize/2 - 4, iconY, 8, iconSize);
    ctx.fillRect(iconX, iconY + iconSize/2 - 4, iconSize, 8);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(iconX - 2, iconY - 2, iconSize + 4, iconSize + 4);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px "Courier New"';
    ctx.fillText('Health Powerup - Restores 1 life', iconX + iconSize + 10, iconY + 14);
    
    iconY += 35;
    
    // Regular ammo icon (yellow bullet)
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(iconX + iconSize/2, iconY + iconSize/2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(iconX - 2, iconY - 2, iconSize + 4, iconSize + 4);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px "Courier New"';
    ctx.fillText('Regular Ammo - Heats up when firing', iconX + iconSize + 10, iconY + 14);
    
    iconY += 35;
    
    // Non-heating ammo icon (ice blue magazine)
    ctx.fillStyle = '#00CED1'; // Ice blue
    ctx.fillRect(iconX + 4, iconY + 6, iconSize - 8, iconSize - 10);
    ctx.fillStyle = '#00E5FF'; // Light ice blue bullet tips
    ctx.fillRect(iconX + 6, iconY + 3, 3, 4);
    ctx.fillRect(iconX + 11, iconY + 3, 3, 4);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(iconX - 2, iconY - 2, iconSize + 4, iconSize + 4);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px "Courier New"';
    ctx.fillText('Non-Heating Ammo - Does not increase heat', iconX + iconSize + 10, iconY + 14);
    
    yPos = iconY + 40;
    
    // Score
    yPos += 5;
    drawHelpItem('SCORE', 'Based on time survived, enemies killed, and ammo efficiency. Higher is better!', '⭐');
    
    // Time
    yPos += 5;
    drawHelpItem('TIME', 'Survival time. Longer = more score points.', '⏱');
    
    // Controls
    yPos += 15;
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px "Courier New"';
    ctx.fillText('CONTROLS:', panelX + 10, yPos);
    yPos += 20;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px "Courier New"';
    ctx.fillText('← → Arrow Keys: Move', panelX + 15, yPos);
    yPos += 16;
    ctx.fillText('SPACE: Fire weapon', panelX + 15, yPos);
    yPos += 16;
    ctx.fillText('G: Throw grenade', panelX + 15, yPos);
    yPos += 16;
    ctx.fillText('H: Toggle this help', panelX + 15, yPos);
    yPos += 16;
    ctx.fillText('I: Toggle extra info (hidden)', panelX + 15, yPos);
    yPos += 16;
    ctx.fillText('M: Toggle audio', panelX + 15, yPos);
    
    // Close hint at bottom
    ctx.fillStyle = '#888888';
    ctx.font = '10px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText('Press H to close', panelX + panelWidth / 2, panelY + panelHeight - 15);
}

function drawUI() {
    // Simplified UI - only level name and score by default
    // Draw semi-transparent background for UI area at the top
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, UI_HEIGHT);
    
    // Draw border between UI and game area
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, UI_HEIGHT);
    ctx.lineTo(canvas.width, UI_HEIGHT);
    ctx.stroke();
    
    // Always show: Level name and Score
    drawLevelDisplay();
    drawScore();
    drawHealthBar(); // Always show hull/lives

    // Only show extra info if toggle is enabled (hidden key)
    if (showExtraInfo) {
        drawShieldBar();
        drawHeatBar();
        drawGrenadeCount();
        drawTimeCounter();
        drawDifficultyTier();
        drawAudioToggle();
    }

    // Help button always visible (small, bottom corner)
    drawHelpButton();
    drawHelpPanel(); // Draw help panel if visible
}

// Draw tutorial explanation overlay
function drawTutorialOverlay() {
    if (!window.tutorialSystem || !window.tutorialSystem.showExplanation) return;
    
    const tutorial = window.tutorialSystem;
    const padding = 20;
    const boxWidth = canvas.width - padding * 2;
    const boxHeight = 140;
    const boxX = padding;
    const boxY = canvas.height - boxHeight - padding - 50;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Border
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Title
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 18px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText(tutorial.explanationTitle || 'Tutorial', canvas.width / 2, boxY + 25);
    
    // Text with word wrap
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px "Courier New"';
    ctx.textAlign = "center";
    
    const words = (tutorial.explanationText || '').split(' ');
    let line = '';
    let yPos = boxY + 55;
    const maxWidth = boxWidth - 40;
    
    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, canvas.width / 2, yPos);
            line = word + ' ';
            yPos += 20;
        } else {
            line = testLine;
        }
    });
    if (line) ctx.fillText(line, canvas.width / 2, yPos);
    
    // Skip hint
    ctx.fillStyle = '#888888';
    ctx.font = '12px "Courier New"';
    ctx.fillText('Press SPACE to skip', canvas.width / 2, boxY + boxHeight - 15);
    
    // Highlight ammo powerups if needed
    const step = tutorial.tutorialSteps[tutorial.currentStep];
    if (step && step.highlight === 'ammo') {
        powerups.forEach(powerup => {
            if (powerup.type === 'ammo') {
                const glowRadius = 35;
                const glowAlpha = Math.abs(Math.sin(Date.now() / 200)) * 0.5 + 0.3;
                ctx.beginPath();
                ctx.arc(powerup.x + POWERUP_SIZE/2, powerup.y + POWERUP_SIZE/2, glowRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 206, 209, ${glowAlpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }
}


// --- MOVE FUNCTIONS ---
function movePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    // Prevent player from going into UI area
    if (player.y < UI_HEIGHT) player.y = UI_HEIGHT;

    // Record position telemetry (sampled at intervals)
    if (window.telemetryRecorder) {
        window.telemetryRecorder.recordPosition(player.x, player.y);
    }
}

function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;
        if (bullets[i].y < UI_HEIGHT) {
            bullets.splice(i, 1);
        }
    }
}

function moveEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].x += enemyBullets[i].dx;
        enemyBullets[i].y += enemyBullets[i].dy;
        if (enemyBullets[i].y > canvas.height || enemyBullets[i].y < UI_HEIGHT || enemyBullets[i].x < 0 || enemyBullets[i].x > canvas.width) {
            enemyBullets.splice(i, 1);
        }
    }
}

function moveEnemies() {
    const baseSpeedMultiplier = 1 + (ENEMY_ROWS * ENEMY_COLS - enemies.length) * 0.05;
    const adjustedSpeedMultiplier = baseSpeedMultiplier * (adjustedGameParams.enemyBaseSpeedMultiplier || 1.0);
    const verticalDescent = adjustedGameParams.enemyVerticalDescent || 0.05;
    const advanceSpeed = adjustedGameParams.enemyAdvanceSpeed || (ENEMY_HEIGHT / 4);
    
    let hitEdge = false;
    enemies.forEach(enemy => {
        enemy.x += enemySpeedDirection * adjustedSpeedMultiplier;
        enemy.y += verticalDescent;
        // Prevent enemies from moving into UI area
        if (enemy.y < UI_HEIGHT) enemy.y = UI_HEIGHT;
        if (enemy.x + enemy.width > canvas.width || enemy.x < 0) hitEdge = true;
    });

    if (hitEdge) {
        enemySpeedDirection *= -1;
        enemies.forEach(enemy => {
            enemy.y += advanceSpeed;
            // Ensure enemies don't end up in UI area after moving down
            if (enemy.y < UI_HEIGHT) enemy.y = UI_HEIGHT;
        });
    }
}

function movePowerups() {
    // Use difficulty-adjusted fall speed (slower at easier difficulties - easier to catch)
    const fallSpeed = adjustedGameParams.powerupFallSpeed || POWERUP_FALL_SPEED * 0.8;
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].y += fallSpeed;
        // Remove if off screen
        if (powerups[i].y > canvas.height) {
            powerups.splice(i, 1);
        }
    }
}


// --- CORE LOGIC ---
function detectCollisions() {
    // Iterate backwards to avoid splice issues
    for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = bullets[bulletIndex];
        for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
            const enemy = enemies[enemyIndex];
            const sizeBonus = intensitySpikeActive ? (adjustedGameParams.intensitySpikeEnemySizeBonus || 8) : 0;
            const height = enemy.height + sizeBonus;

            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y && bullet.y < enemy.y + height) {
                // Mark shot as a hit in telemetry
                if (bullet.shotIndex !== null && bullet.shotIndex !== undefined && window.telemetryRecorder) {
                    window.telemetryRecorder.markShotAsHit(bullet.shotIndex, enemy.type || null);
                }
                
                bullets.splice(bulletIndex, 1);

                // Handle sentinel shields
                if (enemy.type === 'sentinel' && enemy.shieldHits > 0) {
                    enemy.shieldHits--;
                    playSound('enemyHit');
                    if (enemy.shieldHits === 0) {
                        // Shield destroyed, next hit will kill
                    }
                } else {
                    // Enemy destroyed
                    playSound('enemyDestroy');
                    totalEnemiesKilled++; // Track kills
                    
                    // Record enemy kill in telemetry
                    if (window.telemetryRecorder) {
                        window.telemetryRecorder.recordEvent('enemy_killed', {
                            enemyType: enemy.type || 'unknown',
                            position: { x: enemy.x, y: enemy.y },
                            level: currentLevel
                        });
                    }

                    // Spawn powerup chance when enemy dies (level-balanced with difficulty adjustment)
                    const balance = LEVEL_BALANCE[currentLevel];
                    const dropMultiplier = adjustedGameParams.powerupDropMultiplier || 1.0;
                    const adjustedDropChance = balance.dropChance * dropMultiplier;
                    if (Math.random() < adjustedDropChance) {
                        // Determine powerup type based on level weights
                        const rand = Math.random();
                        let powerupType;
                        if (rand < balance.livesDropWeight) {
                            powerupType = 'lives';
                        } else if (rand < balance.livesDropWeight + balance.shieldDropWeight) {
                            powerupType = 'shield';
                        } else if (rand < balance.livesDropWeight + balance.shieldDropWeight + balance.ammoDropWeight) {
                            powerupType = 'ammo';
                        } else {
                            powerupType = 'grenade';
                        }
                        powerups.push({
                            x: enemy.x + enemy.width / 2 - POWERUP_SIZE / 2,
                            y: enemy.y,
                            type: powerupType
                        });
                    }

                    enemies.splice(enemyIndex, 1);
                }
                break; // Bullet hit something, move to next bullet
            }
        }
    }

    // Grenade collisions (iterate backwards)
    for (let grenadeIndex = grenades.length - 1; grenadeIndex >= 0; grenadeIndex--) {
        const grenade = grenades[grenadeIndex];

        if (grenade.type === 'main') {
            // Main grenade hits enemy and explodes
            for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                const enemy = enemies[enemyIndex];
                const sizeBonus = intensitySpikeActive ? (adjustedGameParams.intensitySpikeEnemySizeBonus || 8) : 0;
            const height = enemy.height + sizeBonus;

                if (grenade.x > enemy.x && grenade.x < enemy.x + enemy.width &&
                    grenade.y > enemy.y && grenade.y < enemy.y + height) {
                    // Explode grenade on impact
                    explodeGrenade(grenade, grenadeIndex);
                    break; // Move to next grenade
                }
            }
        } else if (grenade.type === 'fragment') {
            // Fragment hits and damages enemy
            for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                const enemy = enemies[enemyIndex];
                const sizeBonus = intensitySpikeActive ? (adjustedGameParams.intensitySpikeEnemySizeBonus || 8) : 0;
            const height = enemy.height + sizeBonus;

                if (grenade.x > enemy.x && grenade.x < enemy.x + enemy.width &&
                    grenade.y > enemy.y && grenade.y < enemy.y + height) {
                    grenades.splice(grenadeIndex, 1);

                    // Handle sentinel shields
                    if (enemy.type === 'sentinel' && enemy.shieldHits > 0) {
                        enemy.shieldHits--;
                        playSound('enemyHit');
                    } else {
                        // Enemy destroyed
                        playSound('enemyDestroy');
                        totalEnemiesKilled++; // Track kills

                        // Spawn powerup chance when enemy dies
                        const balance = LEVEL_BALANCE[currentLevel];
                        if (Math.random() < balance.dropChance) {
                            const rand = Math.random();
                            let powerupType;
                            if (rand < balance.livesDropWeight) {
                                powerupType = 'lives';
                            } else if (rand < balance.livesDropWeight + balance.shieldDropWeight) {
                                powerupType = 'shield';
                            } else if (rand < balance.livesDropWeight + balance.shieldDropWeight + balance.ammoDropWeight) {
                                powerupType = 'ammo';
                            } else {
                                powerupType = 'grenade';
                            }
                            powerups.push({
                                x: enemy.x + enemy.width / 2 - POWERUP_SIZE / 2,
                                y: enemy.y,
                                type: powerupType
                            });
                        }

                        enemies.splice(enemyIndex, 1);
                    }
                    break; // Fragment hit something, move to next fragment
                }
            }
        }
    }

    // Check player collision with enemies
    enemies.forEach(enemy => {
        const height = intensitySpikeActive ? 40 : enemy.height;
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + height && player.y + player.height > enemy.y) {
            player.lives = 0; // Instant game over
            
            // Record player death from enemy collision in telemetry
            if (window.telemetryRecorder) {
                window.telemetryRecorder.recordEvent('player_death', {
                    position: { x: player.x, y: player.y },
                    level: currentLevel,
                    cause: 'enemy_collision',
                    enemyType: enemy.type || 'unknown',
                    livesRemaining: 0
                });
            }
        }
    });

    // Enemy bullets hitting player (iterate backwards)
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (bullet.x > player.x && bullet.x < player.x + player.width &&
            bullet.y > player.y && bullet.y < player.y + player.height) {

            enemyBullets.splice(i, 1);

            // Level 1 (Training): Direct hull damage (1 hit = 1 life)
            if (currentLevel === 1) {
                player.lives--;
                playSound('hullHit');
                console.log('Training Level - Direct hull hit! Lives now:', player.lives); // Debug
                
                // Record player hit/death in telemetry
                if (window.telemetryRecorder && player.lives <= 0) {
                    window.telemetryRecorder.recordEvent('player_death', {
                        position: { x: player.x, y: player.y },
                        level: currentLevel,
                        cause: 'enemy_bullet',
                        livesRemaining: player.lives
                    });
                }
                
                player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
            } else {
                // Level 2+: Damage shield first, then hull
                if (player.shield > 0) {
                    const shieldBefore = player.shield;
                    const damage = adjustedGameParams.enemyBulletDamage || ENEMY_BULLET_DAMAGE;
                    player.shield = Math.max(0, player.shield - damage);
                    player.shieldHitTime = Date.now(); // Record hit time for visual flash
                    playSound('shieldHit');
                    console.log('Shield hit! Shield now:', player.shield); // Debug

                    // If shield was depleted by this hit, also damage hull
                    if (player.shield === 0 && shieldBefore < damage) {
                        player.lives--;
                        playSound('hullHit');
                        console.log('Shield depleted + Hull hit! Lives now:', player.lives); // Debug
                        
                        // Record player hit/death in telemetry
                        if (window.telemetryRecorder && player.lives <= 0) {
                            window.telemetryRecorder.recordEvent('player_death', {
                                position: { x: player.x, y: player.y },
                                level: currentLevel,
                                cause: 'enemy_bullet',
                                livesRemaining: player.lives
                            });
                        }
                        
                        player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
                    }
                } else {
                    // No shield - direct hull damage
                    player.lives--;
                    playSound('hullHit');
                    console.log('Hull hit! Lives now:', player.lives); // Debug
                    
                    // Record player hit/death in telemetry
                    if (window.telemetryRecorder && player.lives <= 0) {
                        window.telemetryRecorder.recordEvent('player_death', {
                            position: { x: player.x, y: player.y },
                            level: currentLevel,
                            cause: 'enemy_bullet',
                            livesRemaining: player.lives
                        });
                    }
                    
                    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
                }
            }
        }
    }

    // Powerup collection (iterate backwards)
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (player.x < powerup.x + POWERUP_SIZE &&
            player.x + player.width > powerup.x &&
            player.y < powerup.y + POWERUP_SIZE &&
            player.y + player.height > powerup.y) {

            if (powerup.type === 'lives') {
                if (player.lives < player.maxLives) {
                    player.lives++;
                    playSound('powerup');
                }
            } else if (powerup.type === 'shield') {
                player.shield = Math.min(player.shield + 50, player.maxShield);
                playSound('powerup');
            } else if (powerup.type === 'ammo') {
                player.ammoBoostActive = true;
                player.ammoBoostShots = 100;
                player.ammoBoostCollectedTime = Date.now(); // Track when collected for flash message
                console.log('✅ Non-heating ammo collected! Flash message activated at:', player.ammoBoostCollectedTime);
                playSound('powerup');
            } else if (powerup.type === 'grenade') {
                if (player.grenades < player.maxGrenades) {
                    player.grenades++;
                    playSound('powerup');
                }
            }

            powerups.splice(i, 1);
        }
    }
}

function enemyShoot() {
    // Apply level-specific shooting intensity and difficulty adjustments
    const balance = LEVEL_BALANCE[currentLevel];
    const baseShootChance = adjustedGameParams.enemyShootChance || ENEMY_SHOOT_CHANCE;
    const intensityMultiplier = adjustedGameParams.levelShootingIntensityMultiplier || 1.0;
    const levelAdjustedChance = baseShootChance * strikeVolumeMultiplier * balance.shootingIntensity * intensityMultiplier;

    if (Math.random() < levelAdjustedChance && enemies.length > 0) {
        const frontlineEnemies = {};
        enemies.forEach(enemy => {
            if (!frontlineEnemies[enemy.x] || enemy.y > frontlineEnemies[enemy.x].y) {
                frontlineEnemies[enemy.x] = enemy;
            }
        });

        const shooters = Object.values(frontlineEnemies);
        if (shooters.length > 0) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            const shooterHeight = intensitySpikeActive ? 40 : shooter.height;
            const dx = (player.x + player.width / 2) - (shooter.x + shooter.width / 2);
            const dy = player.y - (shooter.y + shooterHeight);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const bulletSpeed = adjustedGameParams.enemyBulletSpeed || ENEMY_BULLET_SPEED;
            enemyBullets.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooterHeight, dx: (dx / dist) * bulletSpeed, dy: (dy / dist) * bulletSpeed });
        }
    }
}

function updateGameState(now) {
    const elapsedTime = (now - gameStartTime) / 1000;

    // Intensity spike system (with difficulty adjustments)
    if (intensitySpikeActive) {
        if (now > intensitySpikeEndTime) {
            intensitySpikeActive = false;
            const intervalMin = adjustedGameParams.intensitySpikeIntervalMin || 5000;
            const intervalMax = adjustedGameParams.intensitySpikeIntervalMax || 10000;
            nextIntensitySpikeTime = now + intervalMin + Math.random() * (intervalMax - intervalMin);
        }
    } else if (now > nextIntensitySpikeTime) {
        intensitySpikeActive = true;
        playSound('intensitySpike'); // Play exciting sound when spike starts!
        const durationMultiplier = adjustedGameParams.intensitySpikeDurationMultiplier || 1.0;
        const baseDuration = 2000 + Math.random() * 3000;
        intensitySpikeEndTime = now + (baseDuration * durationMultiplier);
    }
    strikeVolumeMultiplier = intensitySpikeActive ? 5 : 1 + (elapsedTime * 0.01);

    // Check weapon lockout timer
    if (player.weaponLockoutActive) {
        if (now > player.weaponLockoutEndTime) {
            // Lockout ended - weapon ready again
            player.weaponLockoutActive = false;
            player.weaponJammed = false;
            player.heat = 0; // Reset heat completely
            console.log('Weapon lockout ended - systems restored');
        } else {
            // During lockout: force heat to decrease rapidly
            player.heat = Math.max(0, player.heat - 2.5); // Rapid cooldown during lockout
        }
    } else {
        // Heat dissipation with DELAY - only cools if you stopped shooting
        if (player.heat > 0) {
            const timeSinceLastShot = now - player.lastShotTime;

            // KEY CHANGE: Heat only dissipates after delay period
            if (timeSinceLastShot > player.heatDissipationDelay) {
                player.heat = Math.max(0, player.heat - player.heatDissipationRate);
            }
            // If shooting rapidly, heat DOES NOT DISSIPATE AT ALL!
        }

        // Check for overheat condition
        if (player.heat >= player.maxHeat && !player.weaponJammed) {
            // OVERHEAT! Trigger mandatory lockout
            player.weaponJammed = true;
            player.weaponLockoutActive = true;
            player.weaponLockoutEndTime = now + player.lockoutDuration;
            playSound('weaponJam');
            console.log('OVERHEAT! Weapon locked for 5 seconds');
        }
    }

    // Shield recharge (only Level 2+, and only if not firing rapidly and not locked out)
    // ABSOLUTE SAFEGUARD: Level 1 shields must remain 0
    if (currentLevel === 1) {
        player.shield = 0; // Force shields to 0 in Level 1
    } else if (currentLevel > 1 && !player.weaponLockoutActive) {
        const timeSinceLastShot = now - player.lastShotTime;
        const canRecharge = timeSinceLastShot > (player.shootCooldown * 1.5) && player.heat < 40;

        if (canRecharge && player.shield < player.maxShield) {
            player.shield = Math.min(player.maxShield, player.shield + player.shieldRechargeRate);
        }
    }
}


// --- IDLE DEMO MODE ---
function updateIdleDemo(now) {
    if (demoStartTime === 0) {
        demoStartTime = now;
        // Initialize demo with enemies
        createEnemies();
        demoPlayerX = canvas.width / 2 - PLAYER_WIDTH / 2;
        demoPlayerDirection = 1;
        demoShotTimer = 0;
        demoPhase = 0;
    }

    const demoElapsed = (now - demoStartTime) / 1000;
    
    // Move demo player back and forth
    if (demoPhase === 0 || demoPhase === 1) {
        const moveSpeed = 2;
        demoPlayerX += demoPlayerDirection * moveSpeed;
        
        // Bounce at edges
        if (demoPlayerX <= 0 || demoPlayerX >= canvas.width - PLAYER_WIDTH) {
            demoPlayerDirection *= -1;
            demoPlayerX = Math.max(0, Math.min(canvas.width - PLAYER_WIDTH, demoPlayerX));
        }
        
        // Switch to shooting phase after moving for 2 seconds
        if (demoElapsed % 8 < 3) {
            demoPhase = 1; // Moving
        } else if (demoElapsed % 8 < 6) {
            demoPhase = 2; // Shooting
        } else {
            demoPhase = 0; // Idle
        }
    }
    
    // Auto-shoot during shooting phase
    if (demoPhase === 2 && now - demoShotTimer > 300) {
        demoShotTimer = now;
        // Create demo bullets (will be drawn in drawIdleDemo)
        if (bullets.length < 5) {
            bullets.push({
                x: demoPlayerX + PLAYER_WIDTH / 2,
                y: canvas.height - PLAYER_HEIGHT - 20,
                shotIndex: null
            });
        }
    }
    
    // Move demo bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 8;
        if (bullets[i].y < UI_HEIGHT) {
            bullets.splice(i, 1);
        }
    }
    
    // Move demo enemies (simplified movement)
    const baseSpeed = 1;
    let hitEdge = false;
    enemies.forEach(enemy => {
        enemy.x += enemySpeedDirection * baseSpeed;
        enemy.y += 0.05;
        
        // Check if any enemy hits the edge
        if ((enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) && !hitEdge) {
            hitEdge = true;
        }
    });
    
    // Reverse direction if enemies hit edge
    if (hitEdge) {
        enemySpeedDirection *= -1;
    }
    
    // Reset demo every 30 seconds
    if (demoElapsed > 30) {
        demoStartTime = now;
        bullets = [];
        enemyBullets = [];
        createEnemies();
        demoPlayerX = canvas.width / 2 - PLAYER_WIDTH / 2;
        demoPlayerDirection = 1;
        enemySpeedDirection = 1;
    }
}

function drawIdleDemo(now) {
    // Draw background
    drawBackground();
    
    // Draw demo enemies
    drawEnemies();
    
    // Draw demo bullets
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw demo player at demo position
    const demoPlayerY = canvas.height - PLAYER_HEIGHT - 20;
    
    // Main ship body
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(demoPlayerX + PLAYER_WIDTH/2 - 4, demoPlayerY, 8, 15);
    ctx.fillRect(demoPlayerX + PLAYER_WIDTH/2 - 8, demoPlayerY + 15, 16, 10);
    ctx.fillRect(demoPlayerX + PLAYER_WIDTH/2 - 12, demoPlayerY + 25, 24, 15);
    
    // Cockpit
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(demoPlayerX + PLAYER_WIDTH/2 - 3, demoPlayerY + 18, 6, 6);
    
    // Wings
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(demoPlayerX, demoPlayerY + 30, 12, 10);
    ctx.fillRect(demoPlayerX + PLAYER_WIDTH - 12, demoPlayerY + 30, 12, 10);
    
    // Engine glow
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(demoPlayerX + 8, demoPlayerY + PLAYER_HEIGHT - 3, 10, 3);
    ctx.fillRect(demoPlayerX + PLAYER_WIDTH - 18, demoPlayerY + PLAYER_HEIGHT - 3, 10, 3);
    
    // Draw title and press to start message
    const flash = Math.sin(now / 500) > 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
    
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 48px "Courier New"';
    ctx.textAlign = "center";
    ctx.fillText('GALACTIC STRATEGIST', canvas.width / 2, canvas.height / 2 - 10);
    
    if (flash) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 24px "Courier New"';
        ctx.fillText('PRESS ANY KEY TO START', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    // Demo stats
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Courier New"';
    ctx.textAlign = "left";
    ctx.fillText('DEMO MODE', 10, canvas.height - 10);
}

// --- MAIN GAME LOOP ---
let levelTransitioning = false;
let gameOverSoundPlayed = false;
let victorySoundPlayed = false;
let scoreSaved = false; // Track if score has been saved

function update() {
    const now = Date.now();

    // Idle Demo Mode - show auto-playing demo before game starts
    if (idleDemoMode) {
        updateIdleDemo(now);
        drawIdleDemo(now);
        requestAnimationFrame(update);
        return;
    }

    // Game Over check
    if (player.lives <= 0) {
        if (!gameOverSoundPlayed) {
            // Calculate final level score before showing game over
            // Validate levelStartTime to prevent invalid calculations
            const validLevelStartTime = levelStartTime > 0 ? levelStartTime : gameStartTime;
            const levelTime = validLevelStartTime > 0 ? Math.min((now - validLevelStartTime) / 1000, 3600) : 0;
            const levelEnemiesKilled = initialEnemyCount - enemies.length;
            const levelScore = calculateLevelScore(levelTime, levelAmmoUsed, levelEnemiesKilled, initialEnemyCount);
            
            // Safety check: ensure score is reasonable before adding
            if (levelScore > 0 && levelScore < 50000) {
                totalScore += levelScore;
            } else {
                console.warn('⚠️ Invalid level score detected:', levelScore, '- not adding to total');
            }
            
            playSound('gameOver');
            gameOverSoundPlayed = true;
            
            // Save score to Firebase - only if minimum gameplay requirements met
            const totalTime = (now - gameStartTime) / 1000;
            const minGameplayMet = (totalEnemiesKilled > 0 || totalTime >= 30) && totalScore > 0; // Must kill at least 1 enemy OR survive 30+ seconds AND have a positive score
            
            if (!scoreSaved && typeof window !== 'undefined' && window.currentUser && typeof saveScore !== 'undefined' && minGameplayMet) {
                scoreSaved = true; // Set flag to prevent multiple saves
                console.log('Attempting to save score:', {
                    name: window.currentUser.name,
                    email: window.currentUser.email,
                    score: totalScore,
                    level: currentLevel,
                    time: totalTime,
                    ammo: totalAmmoUsed,
                    enemiesKilled: totalEnemiesKilled
                });
                
                saveScore(
                    window.currentUser.name,
                    window.currentUser.email,
                    totalScore,
                    currentLevel,
                    totalTime,
                    totalAmmoUsed
                ).then(result => {
                    if (result.success) {
                        console.log('✅ Score saved successfully to Firebase');
                        window.lastScoreSaveSuccess = true;

                        // Save telemetry data
                        if (window.telemetryRecorder) {
                            // Ensure recording was started (in case it was missed)
                            if (!window.telemetryRecorder.sessionData.playerEmail) {
                                let userEmail = null;
                                let userName = null;
                                
                                if (window.currentUser && window.currentUser.email) {
                                    userEmail = window.currentUser.email;
                                    userName = window.currentUser.name;
                                } else if (typeof getCurrentUser === 'function') {
                                    try {
                                        const currentUser = getCurrentUser();
                                        if (currentUser && currentUser.email) {
                                            userEmail = currentUser.email;
                                            userName = currentUser.name;
                                        }
                                    } catch (e) {
                                        console.warn('⚠️ Could not get user for telemetry:', e);
                                    }
                                }
                                
                                if (userEmail) {
                                    window.telemetryRecorder.startRecording(userEmail, userName);
                                }
                            }
                            
                                window.telemetryRecorder.sessionData.levelReached = currentLevel;
                                window.telemetryRecorder.sessionData.finalScore = totalScore;
                                window.telemetryRecorder.sessionData.gameEndReason = 'death';
                                window.telemetryRecorder.sessionData.totalEnemiesKilled = totalEnemiesKilled;
                                window.telemetryRecorder.stopRecording();
                            window.telemetryRecorder.saveTelemetry().then(telemetryResult => {
                                if (telemetryResult.success) {
                                    console.log('✅ Telemetry saved:', window.telemetryRecorder.getSummary());
                                } else {
                                    console.warn('⚠️ Telemetry save failed:', telemetryResult.message);
                                }
                            });
                        }
                        
                        // Update difficulty profile after game
                        updateDifficultyAfterGame({
                            score: totalScore,
                            level: currentLevel,
                            timeSeconds: totalTime,
                            enemiesKilled: totalEnemiesKilled,
                            won: false,
                            ammoUsed: totalAmmoUsed
                        });
                    } else {
                        console.error('❌ Failed to save score:', result.message);
                        window.lastScoreSaveSuccess = false;
                        window.lastScoreSaveError = result.message;
                    }
                }).catch(error => {
                    console.error('❌ Error saving score:', error);
                    window.lastScoreSaveSuccess = false;
                    window.lastScoreSaveError = error.message;
                });
            } else if (!minGameplayMet) {
                // Show message that score wasn't saved due to insufficient gameplay
                console.log('Score not saved: Insufficient gameplay (must kill at least 1 enemy or survive 30+ seconds)');
                window.lastScoreSaveSuccess = false;
                window.scoreNotSavedReason = 'Insufficient gameplay';
            }
        }
        drawBackground();
        
        // Simplified game over screen - only level name and score
        const level = LEVELS[currentLevel];
        ctx.fillStyle = 'red';
        ctx.font = 'bold 60px "Courier New"';
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = 'bold 28px "Courier New"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`LEVEL ${currentLevel}: ${level.name}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.font = 'bold 36px "Courier New"';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`SCORE: ${totalScore.toLocaleString()}`, canvas.width / 2, canvas.height / 2 + 70);
        
        // Only show extra info if toggle is enabled
        if (showExtraInfo) {
            ctx.font = '16px "Courier New"';
            ctx.fillStyle = '#888888';
            const totalTime = Math.floor((now - gameStartTime) / 1000);
            ctx.fillText(`Time: ${totalTime}s | Kills: ${totalEnemiesKilled} | Ammo: ${totalAmmoUsed}`, canvas.width / 2, canvas.height / 2 + 110);
            
            ctx.font = '14px "Courier New"';
            if (window.scoreNotSavedReason === 'Insufficient gameplay') {
                ctx.fillStyle = '#FFA500';
                ctx.fillText('Score not saved - play longer or kill enemies!', canvas.width / 2, canvas.height / 2 + 140);
            } else if (scoreSaved && window.lastScoreSaveSuccess === true) {
                ctx.fillStyle = '#00FF00';
                ctx.fillText('Score saved!', canvas.width / 2, canvas.height / 2 + 140);
            } else if (scoreSaved && window.lastScoreSaveSuccess === false) {
                ctx.fillStyle = '#FF0000';
                ctx.fillText('Save failed - check console', canvas.width / 2, canvas.height / 2 + 140);
            } else if (scoreSaved) {
                ctx.fillStyle = '#888';
                ctx.fillText('Saving score...', canvas.width / 2, canvas.height / 2 + 140);
            }
        }
        return;
    }

    // Level cleared check
    if (enemies.length === 0 && !levelTransitioning) {
        // Calculate and add level score before transitioning
        const now = Date.now();
        // Validate levelStartTime to prevent invalid calculations
        const validLevelStartTime = levelStartTime > 0 ? levelStartTime : gameStartTime;
        const levelTime = validLevelStartTime > 0 ? Math.min((now - validLevelStartTime) / 1000, 3600) : 0;
        const levelEnemiesKilled = initialEnemyCount - enemies.length;
        const levelScore = calculateLevelScore(levelTime, levelAmmoUsed, levelEnemiesKilled, initialEnemyCount);
        
        // Safety check: ensure score is reasonable before adding
        if (levelScore > 0 && levelScore < 50000) {
            totalScore += levelScore;
        } else {
            console.warn('⚠️ Invalid level score detected:', levelScore, '- not adding to total');
        }
        
        if (currentLevel < 3) {
            // Next level
            levelTransitioning = true;
            playSound('levelComplete');
            drawBackground();
            ctx.fillStyle = '#00FF00';
            ctx.font = '40px "Courier New"';
            ctx.textAlign = "center";
            ctx.fillText(`LEVEL ${currentLevel} CLEARED!`, canvas.width / 2, canvas.height / 2 - 60);
            ctx.font = '20px "Courier New"';
            ctx.fillText(`Time: ${Math.floor(levelTime)}s | Ammo: ${levelAmmoUsed} | Score: ${levelScore}`, canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillText("Loading next level...", canvas.width / 2, canvas.height / 2 + 20);

            // Progress to next level after delay
            setTimeout(() => {
                currentLevel++;
                bullets = [];
                enemyBullets = [];
                powerups = [];
                
                // Reset level counters
                levelStartTime = Date.now();
                levelAmmoUsed = 0;
                // Note: totalEnemiesKilled persists across levels

                // Activate shields for Level 2+
                if (currentLevel >= 2) {
                    player.shield = player.maxShield;
                }

                createEnemies();
                gameStartTime = Date.now();
                nextIntensitySpikeTime = gameStartTime + 5000 + Math.random() * 5000;
                levelTransitioning = false;
            }, 2000);

            requestAnimationFrame(update); // Keep loop running during transition
            return;
        } else {
            // Victory - all levels complete!
            if (!victorySoundPlayed) {
                playSound('victory');
                victorySoundPlayed = true;
                
                // Save score to Firebase
                if (!scoreSaved && typeof window !== 'undefined' && window.currentUser && typeof saveScore !== 'undefined') {
                    scoreSaved = true; // Set flag to prevent multiple saves
                    const totalTime = (now - gameStartTime) / 1000;
                    console.log('Attempting to save score:', {
                        name: window.currentUser.name,
                        email: window.currentUser.email,
                        score: totalScore,
                        level: 3,
                        time: totalTime,
                        ammo: totalAmmoUsed
                    });
                    
                    saveScore(
                        window.currentUser.name,
                        window.currentUser.email,
                        totalScore,
                        3, // All levels completed
                        totalTime,
                        totalAmmoUsed
                    ).then(result => {
                        if (result.success) {
                            console.log('✅ Score saved successfully to Firebase');
                            window.lastScoreSaveSuccess = true;
                            
                            // Save telemetry data
                            if (window.telemetryRecorder) {
                                // Ensure recording was started (in case it was missed)
                                if (!window.telemetryRecorder.sessionData.playerEmail) {
                                    let userEmail = null;
                                    let userName = null;
                                    
                                    if (window.currentUser && window.currentUser.email) {
                                        userEmail = window.currentUser.email;
                                        userName = window.currentUser.name;
                                    } else if (typeof getCurrentUser === 'function') {
                                        try {
                                            const currentUser = getCurrentUser();
                                            if (currentUser && currentUser.email) {
                                                userEmail = currentUser.email;
                                                userName = currentUser.name;
                                            }
                                        } catch (e) {
                                            console.warn('⚠️ Could not get user for telemetry:', e);
                                        }
                                    }
                                    
                                    if (userEmail) {
                                        window.telemetryRecorder.startRecording(userEmail, userName);
                                    }
                                }
                                
                                window.telemetryRecorder.sessionData.levelReached = 3;
                                window.telemetryRecorder.sessionData.finalScore = totalScore;
                                window.telemetryRecorder.stopRecording();
                                window.telemetryRecorder.saveTelemetry().then(telemetryResult => {
                                    if (telemetryResult.success) {
                                        console.log('✅ Telemetry saved:', window.telemetryRecorder.getSummary());
                                    } else {
                                        console.warn('⚠️ Telemetry save failed:', telemetryResult.message);
                                    }
                                });
                            }
                            
                            // Update difficulty profile after victory
                            updateDifficultyAfterGame({
                                score: totalScore,
                                level: 3,
                                timeSeconds: totalTime,
                                enemiesKilled: totalEnemiesKilled,
                                won: true,
                                ammoUsed: totalAmmoUsed
                            });
                        } else {
                            console.error('❌ Failed to save score:', result.message);
                            window.lastScoreSaveSuccess = false;
                            window.lastScoreSaveError = result.message;
                        }
                    }).catch(error => {
                        console.error('❌ Error saving score:', error);
                        window.lastScoreSaveSuccess = false;
                        window.lastScoreSaveError = error.message;
                    });
                }
            }
            drawBackground();
            
            // Simplified victory screen - only level name and score
            const level = LEVELS[3]; // All levels completed
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 60px "Courier New"';
            ctx.textAlign = "center";
            ctx.fillText("VICTORY!", canvas.width / 2, canvas.height / 2 - 40);
            
            ctx.font = 'bold 28px "Courier New"';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`LEVEL 3: ${level.name}`, canvas.width / 2, canvas.height / 2 + 20);
            
            ctx.font = 'bold 36px "Courier New"';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`SCORE: ${totalScore.toLocaleString()}`, canvas.width / 2, canvas.height / 2 + 70);
            
            // Only show extra info if toggle is enabled
            if (showExtraInfo) {
                ctx.font = '16px "Courier New"';
                ctx.fillStyle = '#888888';
                ctx.fillText(`Final Time: ${Math.floor(levelTime)}s | Total Ammo: ${totalAmmoUsed}`, canvas.width / 2, canvas.height / 2 + 110);
                ctx.fillText("All levels completed!", canvas.width / 2, canvas.height / 2 + 135);
                
                if (scoreSaved) {
                    ctx.font = '14px "Courier New"';
                    if (window.lastScoreSaveSuccess === true) {
                        ctx.fillStyle = '#00FF00';
                        ctx.fillText('Score saved!', canvas.width / 2, canvas.height / 2 + 160);
                    } else if (window.lastScoreSaveSuccess === false) {
                        ctx.fillStyle = '#FF0000';
                        ctx.fillText('Save failed - check console', canvas.width / 2, canvas.height / 2 + 160);
                    } else {
                        ctx.fillStyle = '#888';
                        ctx.fillText('Saving score...', canvas.width / 2, canvas.height / 2 + 160);
                    }
                }
            }
            return;
        }
    }

    // Don't update game during transition
    if (levelTransitioning) {
        drawBackground();
        ctx.fillStyle = '#00FF00';
        ctx.font = '40px "Courier New"';
        ctx.textAlign = "center";
        ctx.fillText(`LEVEL ${currentLevel} CLEARED!`, canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px "Courier New"';
        ctx.fillText("Loading next level...", canvas.width / 2, canvas.height / 2 + 20);
        requestAnimationFrame(update);
        return;
    }

    // Process input every frame for smooth controls
    handleInput();

    updateGameState(now);

    drawBackground();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    drawGrenades();
    drawPowerups();
    drawUI();
    
    // Draw tutorial overlay on top of everything
    if (window.tutorialSystem && window.tutorialSystem.isActive) {
        drawTutorialOverlay();
    }

    movePlayer();
    moveBullets();
    moveEnemyBullets();
    moveGrenades();
    moveEnemies();
    movePowerups();
    enemyShoot();
    detectCollisions();

    requestAnimationFrame(update);
}


// --- EVENT HANDLERS ---
function keyDown(e) {
    // Exit demo mode if active
    if (idleDemoMode) {
        idleDemoMode = false;
        demoStartTime = 0;
        bullets = [];
        // Start the actual game
        startActualGame();
        e.preventDefault();
        return;
    }
    
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        keys.right = true;
        if (window.telemetryRecorder) {
            window.telemetryRecorder.recordMovement('right');
        }
        e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        keys.left = true;
        if (window.telemetryRecorder) {
            window.telemetryRecorder.recordMovement('left');
        }
        e.preventDefault();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        // Skip tutorial if active
        if (window.tutorialSystem && window.tutorialSystem.isActive) {
            window.tutorialSystem.skipTutorial();
            e.preventDefault();
            return;
        }
        keys.space = true;
        e.preventDefault();
    } else if (e.key === 'g' || e.key === 'G') {
        keys.grenade = true;
        e.preventDefault();
    } else if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
        playSound('powerup'); // Test sound when toggling on
    } else if (e.key === 'h' || e.key === 'H') {
        showHelp = !showHelp;
        e.preventDefault();
    } else if (e.key === 'i' || e.key === 'I') {
        // Hidden key: Toggle extra UI info (I for Info)
        showExtraInfo = !showExtraInfo;
        console.log(`ℹ️ Extra info ${showExtraInfo ? 'ON' : 'OFF'}`);
        e.preventDefault();
    }
}

function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        keys.right = false;
        e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        keys.left = false;
        e.preventDefault();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        keys.space = false;
        e.preventDefault();
    } else if (e.key === 'g' || e.key === 'G') {
        keys.grenade = false;
        e.preventDefault();
    }
}

// Process input every frame for smooth controls
function handleInput() {
    // Movement - process every frame
    if (keys.right && !keys.left) {
        player.dx = player.speed;
    } else if (keys.left && !keys.right) {
        player.dx = -player.speed;
    } else {
        player.dx = 0;
    }

    // Continuous shooting when space is held
    if (keys.space) {
        shoot();
    }

    // Grenade launch (one-time press, handled in keyDown)
    if (keys.grenade) {
        launchGrenade();
        keys.grenade = false; // Prevent continuous launch
    }
}

function shoot() {
    const now = Date.now();

    // ABSOLUTE LOCKOUT - Cannot shoot during weapon lockout
    if (player.weaponLockoutActive) {
        // Play error sound occasionally
        if (Math.random() < 0.03) {
            playSound('weaponJam');
        }
        return;
    }

    // Normal shooting
    if (now - player.lastShotTime > player.shootCooldown && !player.weaponJammed) {
        // Check if ammo boost is active (non-heating ammo)
        if (player.ammoBoostActive && player.ammoBoostShots > 0) {
            // Non-heating ammo: do NOT increase heat at all
            player.ammoBoostShots--;
            if (player.ammoBoostShots === 0) {
                player.ammoBoostActive = false;
            }
        } else {
            // Regular ammo: increases heat
            player.heat = Math.min(player.maxHeat, player.heat + player.heatPerShot);
        }

        player.lastShotTime = now;
        
        // Record shot telemetry and get shot index
        let shotIndex = null;
        if (window.telemetryRecorder) {
            shotIndex = window.telemetryRecorder.recordShot(player.x + player.width / 2, player.y, false);
        }
        
        // Create bullet with shot index for hit tracking
        bullets.push({ 
            x: player.x + player.width / 2, 
            y: player.y,
            shotIndex: shotIndex  // Store shot index to mark as hit later
        });

        // Track ammo usage
        totalAmmoUsed++;
        levelAmmoUsed++;

        playSound('playerShoot');
    }
}

function launchGrenade() {
    // Check if player has grenades and is not locked out
    if (player.grenades > 0 && !player.weaponLockoutActive) {
        player.grenades--;
        const grenadeX = player.x + player.width / 2;
        const grenadeY = player.y;

        grenades.push({
            x: grenadeX,
            y: grenadeY,
            type: 'main',
            hasExploded: false
        });

        // Record grenade launch telemetry
        if (window.telemetryRecorder) {
            window.telemetryRecorder.recordGrenade(grenadeX, grenadeY, 0);
        }

        playSound('grenadeLaunch');
    }
}

function moveGrenades() {
    for (let i = grenades.length - 1; i >= 0; i--) {
        const grenade = grenades[i];

        if (grenade.type === 'main') {
            // Move main grenade upward
            grenade.y -= GRENADE_SPEED;

            // Check for explosion conditions
            // 1. Reached top of screen (UI area boundary)
            // 2. Reached explosion altitude (y < UI_HEIGHT + 100)
            // 3. Hit an enemy (checked in collision detection)
            if (grenade.y < UI_HEIGHT + 100 || grenade.y < UI_HEIGHT) {
                explodeGrenade(grenade, i);
            }
        } else if (grenade.type === 'fragment') {
            // Move fragments in their trajectory
            grenade.x += grenade.dx;
            grenade.y += grenade.dy;

            // Remove fragments that go off screen or into UI area
            if (grenade.x < 0 || grenade.x > canvas.width ||
                grenade.y < UI_HEIGHT || grenade.y > canvas.height) {
                grenades.splice(i, 1);
            }
        }
    }
}

function explodeGrenade(grenade, grenadeIndex) {
    if (grenade.hasExploded) return;

    grenade.hasExploded = true;
    playSound('grenadeExplode');

    // Create fragments spreading outward
    const fragmentAngles = [
        -Math.PI / 4,     // Up-left
        Math.PI / 4,      // Up-right
        -3 * Math.PI / 4, // Down-left
        3 * Math.PI / 4   // Down-right
    ];

    for (let i = 0; i < GRENADE_FRAGMENT_COUNT; i++) {
        const angle = fragmentAngles[i];
        grenades.push({
            x: grenade.x,
            y: grenade.y,
            type: 'fragment',
            dx: Math.cos(angle) * GRENADE_FRAGMENT_SPEED,
            dy: Math.sin(angle) * GRENADE_FRAGMENT_SPEED
        });
    }

    // Remove the main grenade
    grenades.splice(grenadeIndex, 1);
}


// --- ADAPTIVE DIFFICULTY SYSTEM ---

// Apply difficulty adjustments to game parameters
function applyDifficultyAdjustments(multiplier) {
    difficultyMultiplier = multiplier;
    adjustedGameParams = {};
    
    // Enemy shooting adjustments (easier at lower multipliers)
    // Formula: starts at 0.3x for 0.6 multiplier, scales to 1.0x at 1.0, then higher
    // At 0.6 multiplier: 0.0003 (30% of base), at 1.0: 0.001 (100% of base), at 1.3: 0.00156 (156% of base)
    // Made easier: at 1.0 it's now 0.001 instead of the old 0.002
    adjustedGameParams.enemyShootChance = ENEMY_SHOOT_CHANCE * (0.3 + multiplier * 0.7);
    
    // Enemy movement adjustments (slower at default)
    // At 0.8 multiplier: 1.04x (4% faster), at 1.0: 1.15x (15% faster)
    adjustedGameParams.enemyBaseSpeedMultiplier = 0.8 + multiplier * 0.35;
    // At 0.8 multiplier: 0.04 (20% slower), at 1.0: 0.06 (same as before)
    adjustedGameParams.enemyVerticalDescent = 0.04 * (1.0 + multiplier * 0.5);
    // At 0.8 multiplier: 7.2px (10% slower), at 1.0: 8px (base)
    adjustedGameParams.enemyAdvanceSpeed = (ENEMY_HEIGHT / 4) * (0.9 + multiplier * 0.25);
    
    // Enemy bullet adjustments (slower at default)
    // Formula: At 0.6 multiplier: 2.4 (slowest), at 1.0: 3.0 (base), scales up from there
    // At 0.6 multiplier: 2.4 (20% slower), at 1.0: 3.0 (base), at 1.3: 3.45 (15% faster)
    adjustedGameParams.enemyBulletSpeed = ENEMY_BULLET_SPEED * (0.75 + multiplier * 0.25);
    // At 0.8 multiplier: 24 (20% less damage), at 1.0: 27 (10% less)
    adjustedGameParams.enemyBulletDamage = ENEMY_BULLET_DAMAGE * (0.8 + multiplier * 0.3);
    
    // Sentinel shield adjustments (more hits = harder)
    adjustedGameParams.sentinelShieldHits = 2 + Math.floor(multiplier * 0.5);
    
    // Player weapon adjustments (harder = more heat, slower cooling)
    adjustedGameParams.heatPerShot = 8 * (1.0 + multiplier * 0.25);
    adjustedGameParams.heatDissipationRate = 0.5 * (1.0 - multiplier * 0.2);
    adjustedGameParams.heatDissipationDelay = 500 * (1.0 + multiplier * 0.5);
    adjustedGameParams.lockoutDuration = 3000 * (1.0 + multiplier * 0.3);
    adjustedGameParams.shootCooldown = 200 * (1.0 + multiplier * 0.2);
    
    // Player shield adjustments (harder = slower recharge)
    adjustedGameParams.shieldRechargeRate = 0.05 * (1.0 - multiplier * 0.3);
    adjustedGameParams.maxShield = Math.max(80, 100 - Math.floor(multiplier * 5));
    
    // Player movement (slight reduction) - reduced penalty from 15% to 8% per multiplier
    // At 2.5x: 20% slower instead of 27.5% - maintains player agency
    adjustedGameParams.playerSpeed = PLAYER_SPEED * (1.0 - multiplier * 0.08);
    
    // Starting resources (gradual reduction at higher difficulties)
    if (multiplier > 2.0) {
        // Master tier: 2 lives, 0 grenades
        adjustedGameParams.startingLives = 2;
        adjustedGameParams.startingGrenades = 0;
    } else if (multiplier > 1.8) {
        // Expert tier: 2 lives, 1 grenade (intermediate step)
        adjustedGameParams.startingLives = 2;
        adjustedGameParams.startingGrenades = 1;
    } else {
        // Normal/Advanced tier: 3 lives, 1 grenade
        adjustedGameParams.startingLives = 3;
        adjustedGameParams.startingGrenades = 1;
    }
    
    // Powerup adjustments (fewer drops at higher difficulty, but more at easier)
    // Reduced penalty: At 0.6: 1.05x, at 1.0: 0.95x, at 2.5: 0.575x (was 0.2x = too harsh)
    adjustedGameParams.powerupDropMultiplier = 1.2 - multiplier * 0.25;
    
    // Powerup fall speed (slower at easier difficulties - easier to catch)
    // At 0.8 multiplier: 1.4 (30% slower), at 1.0: 1.8 (10% slower), at 1.5+: 2.0+ (faster)
    adjustedGameParams.powerupFallSpeed = POWERUP_FALL_SPEED * (0.7 + multiplier * 0.3);
    
    // Intensity spike adjustments
    adjustedGameParams.intensitySpikeIntervalMin = 5000 * (1.0 - multiplier * 0.3);
    adjustedGameParams.intensitySpikeIntervalMax = 10000 * (1.0 - multiplier * 0.3);
    adjustedGameParams.intensitySpikeDurationMultiplier = 1.0 + multiplier * 0.3;
    adjustedGameParams.intensitySpikeEnemySizeBonus = 8 * (1.0 + multiplier * 0.5);
    
    // Enemy count adjustments (more enemies)
    adjustedGameParams.enemyCountMultiplier = 1.0 + multiplier * 0.3;
    adjustedGameParams.enemyGap = Math.max(10, ENEMY_GAP - multiplier * 1.0);
    
    // Level shooting intensity multiplier (reduced to make it easier at lower difficulties)
    adjustedGameParams.levelShootingIntensityMultiplier = 0.8 + multiplier * 0.3; // At 1.0: 1.1x (was 1.4x)
    
    console.log(`🎯 Applied difficulty multiplier: ${multiplier.toFixed(2)} (${getDifficultyTierName(multiplier)})`);
    
    // Log all adjusted parameters
    logDifficultyParameters(multiplier);
}

// Log all difficulty parameters for a user
function logDifficultyParameters(multiplier) {
    if (!window.currentUser) return;
    
    const user = window.currentUser.email || 'unknown';
    const tier = getDifficultyTierName(multiplier);
    
    console.group(`📊 DIFFICULTY PARAMETERS - ${user} (${tier} - ${multiplier.toFixed(2)}x)`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 ENEMY BEHAVIOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Shooting Chance:       ${adjustedGameParams.enemyShootChance.toFixed(6)} (base: ${ENEMY_SHOOT_CHANCE})`);
    console.log(`  Bullet Speed:          ${adjustedGameParams.enemyBulletSpeed.toFixed(2)} (base: ${ENEMY_BULLET_SPEED})`);
    console.log(`  Bullet Damage:         ${adjustedGameParams.enemyBulletDamage.toFixed(1)} (base: ${ENEMY_BULLET_DAMAGE})`);
    console.log(`  Movement Speed:        ${adjustedGameParams.enemyBaseSpeedMultiplier.toFixed(2)}x`);
    console.log(`  Vertical Descent:      ${adjustedGameParams.enemyVerticalDescent.toFixed(4)} (base: 0.05)`);
    console.log(`  Advance Speed:         ${adjustedGameParams.enemyAdvanceSpeed.toFixed(2)} (base: ${ENEMY_HEIGHT / 4})`);
    console.log(`  Sentinel Shield Hits:  ${adjustedGameParams.sentinelShieldHits} (base: 2-3)`);
    console.log(`  Enemy Count Multiplier: ${adjustedGameParams.enemyCountMultiplier.toFixed(2)}x`);
    console.log(`  Enemy Gap:             ${adjustedGameParams.enemyGap.toFixed(1)} (base: ${ENEMY_GAP})`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚔️  PLAYER WEAPON SYSTEM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Heat Per Shot:         ${adjustedGameParams.heatPerShot.toFixed(2)} (base: 8)`);
    console.log(`  Heat Dissipation Rate: ${adjustedGameParams.heatDissipationRate.toFixed(3)} (base: 0.5)`);
    console.log(`  Heat Dissipation Delay: ${adjustedGameParams.heatDissipationDelay.toFixed(0)}ms (base: 500ms)`);
    console.log(`  Lockout Duration:      ${adjustedGameParams.lockoutDuration.toFixed(0)}ms (base: 3000ms)`);
    console.log(`  Shoot Cooldown:        ${adjustedGameParams.shootCooldown.toFixed(0)}ms (base: 200ms)`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️  PLAYER SHIELD SYSTEM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Max Shield:            ${adjustedGameParams.maxShield} (base: 100)`);
    console.log(`  Shield Recharge Rate:  ${adjustedGameParams.shieldRechargeRate.toFixed(4)} (base: 0.05)`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏃 PLAYER MOVEMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Player Speed:          ${adjustedGameParams.playerSpeed.toFixed(2)} (base: ${PLAYER_SPEED})`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💎 RESOURCES & POWERUPS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Starting Lives:        ${adjustedGameParams.startingLives} (base: 3)`);
    console.log(`  Starting Grenades:     ${adjustedGameParams.startingGrenades} (base: 1)`);
    console.log(`  Powerup Drop Rate:     ${(adjustedGameParams.powerupDropMultiplier * 100).toFixed(1)}% (100% = base)`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ INTENSITY SPIKES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Spike Interval:        ${adjustedGameParams.intensitySpikeIntervalMin.toFixed(0)}-${adjustedGameParams.intensitySpikeIntervalMax.toFixed(0)}ms (base: 5000-10000ms)`);
    console.log(`  Spike Duration:        ${adjustedGameParams.intensitySpikeDurationMultiplier.toFixed(2)}x`);
    console.log(`  Enemy Size Bonus:      +${adjustedGameParams.intensitySpikeEnemySizeBonus.toFixed(1)}px (base: +8px)`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 LEVEL MODIFIERS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Shooting Intensity:    ${adjustedGameParams.levelShootingIntensityMultiplier.toFixed(2)}x multiplier`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.groupEnd();
}

// Get difficulty tier name
function getDifficultyTierName(multiplier) {
    if (multiplier < 0.9) return "Beginner";
    if (multiplier < 1.2) return "Normal";
    if (multiplier < 1.5) return "Advanced";
    if (multiplier < 2.0) return "Expert";
    return "Master";
}

// Apply adjusted parameters to player object
function applyPlayerDifficulty() {
    if (!adjustedGameParams.heatPerShot) return; // Not initialized yet
    
    player.heatPerShot = adjustedGameParams.heatPerShot;
    player.heatDissipationRate = adjustedGameParams.heatDissipationRate;
    player.heatDissipationDelay = adjustedGameParams.heatDissipationDelay;
    player.lockoutDuration = adjustedGameParams.lockoutDuration;
    player.shootCooldown = adjustedGameParams.shootCooldown;
    player.shieldRechargeRate = adjustedGameParams.shieldRechargeRate;
    player.maxShield = adjustedGameParams.maxShield;
    // Note: Shield current value will be set based on currentLevel after this function
    player.speed = adjustedGameParams.playerSpeed;
    player.lives = adjustedGameParams.startingLives;
    player.maxLives = adjustedGameParams.startingLives;
    player.grenades = adjustedGameParams.startingGrenades;
}

// Load player difficulty profile and apply adjustments
async function loadAndApplyDifficulty() {
    if (!window.currentUser || typeof window.difficultyManager === 'undefined') {
        console.log('⚠️ No user or difficulty manager available, using easier default difficulty');
        applyDifficultyAdjustments(0.6); // Beginner-friendly default
        applyPlayerDifficulty();
        return;
    }
    
    try {
        const profile = await window.difficultyManager.getPlayerDifficultyProfile(
            window.currentUser.email,
            window.currentUser.name
        );
        
        if (profile) {
            playerDifficultyProfile = profile;
            const multiplier = profile.difficultyMultiplier || 1.0;
            applyDifficultyAdjustments(multiplier);
            applyPlayerDifficulty();
            
            console.log(`📊 Player difficulty: ${multiplier.toFixed(2)} (${profile.difficultyTier || getDifficultyTierName(multiplier)})`);
            
            // Log detailed profile metrics
            if (typeof window.difficultyManager !== 'undefined' && window.difficultyManager.logPlayerProfileMetrics) {
                window.difficultyManager.logPlayerProfileMetrics(profile);
            }
        } else {
            // Default difficulty (easier for new players)
            applyDifficultyAdjustments(0.8);
            applyPlayerDifficulty();
        }
    } catch (error) {
        console.error('❌ Error loading difficulty profile:', error);
        // Fallback to easier default
        applyDifficultyAdjustments(0.8);
        applyPlayerDifficulty();
    }
}

// Update player profile after game ends
async function updateDifficultyAfterGame(gameResult) {
    if (!window.currentUser || typeof window.difficultyManager === 'undefined') {
        console.log('⚠️ Cannot update difficulty: no user or difficulty manager');
        return;
    }
    
    try {
        const updatedProfile = await window.difficultyManager.updatePlayerProfileAfterGame(
            window.currentUser.email,
            window.currentUser.name,
            gameResult
        );
        
        if (updatedProfile) {
            playerDifficultyProfile = updatedProfile;
            console.log(`📊 Updated difficulty profile. New multiplier: ${updatedProfile.difficultyMultiplier.toFixed(2)} (${updatedProfile.difficultyTier})`);
        }
    } catch (error) {
        console.error('❌ Error updating difficulty profile:', error);
    }
}

// --- START GAME ---
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎮 GAME INITIALIZATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🔍 Initial currentLevel value: ${currentLevel}`);

// FORCE reset to Level 1 - absolutely must start at level 1
currentLevel = 1;
console.log(`✅ Reset currentLevel to: ${currentLevel}`);

// Verify Level 1 exists and enforce it
if (!enforceLevel1()) {
    console.error('❌ CRITICAL: Cannot proceed without Level 1!');
    // Cannot use return at top level, so we'll just log and continue
    // The game will fail gracefully if Level 1 doesn't exist
} else {
    console.log(`✅ Level 1 verified: "${LEVELS[1].name}" (${LEVELS[1].formation} formation)`);
}

// Function to start the actual game (called when demo mode exits)
function startActualGame() {
    // Load difficulty first, but ensure it's not too hard for new starts
    loadAndApplyDifficulty().then(() => {
        // Ensure difficulty is reasonable for game start - always start easier after demo
        // Reset to beginner-friendly difficulty to avoid too competitive start
        const currentMultiplier = difficultyMultiplier;
        
        if (!playerDifficultyProfile || playerDifficultyProfile.gamesPlayed === 0) {
            // New player - use easier default (0.6 for very beginner-friendly)
            console.log('📊 New player detected - using beginner-friendly difficulty (0.6)');
            applyDifficultyAdjustments(0.6); // Very easy for first games
            applyPlayerDifficulty();
        } else {
            // Existing player - progressive cap based on experience
            const profileMultiplier = playerDifficultyProfile.difficultyMultiplier || 0.7;
            const gamesPlayed = playerDifficultyProfile.gamesPlayed || 0;

            // Progressive difficulty cap:
            // Games 1-5: cap at 0.8x (learning phase)
            // Games 6-10: cap at 1.2x (intermediate phase)
            // Games 11+: no cap (experienced phase)
            let diffCap = 2.5; // Default: no cap
            if (gamesPlayed <= 5) {
                diffCap = 0.8;
                console.log('📊 Learning phase (games 1-5): difficulty capped at 0.8x');
            } else if (gamesPlayed <= 10) {
                diffCap = 1.2;
                console.log('📊 Intermediate phase (games 6-10): difficulty capped at 1.2x');
            } else {
                console.log('📊 Experienced phase (games 11+): no difficulty cap');
            }

            const cappedMultiplier = Math.min(diffCap, Math.max(0.6, profileMultiplier));
            console.log(`📊 Starting difficulty: ${cappedMultiplier.toFixed(2)} (profile: ${profileMultiplier.toFixed(2)}, cap: ${diffCap}x)`);
            applyDifficultyAdjustments(cappedMultiplier);
            applyPlayerDifficulty();
        }
        // FORCE currentLevel to 1 again after async operations (safety check)
        if (currentLevel !== 1) {
            console.warn(`⚠️ WARNING: currentLevel was ${currentLevel}, forcing back to 1`);
            currentLevel = 1;
        }
        
        console.log(`🔍 currentLevel after difficulty load: ${currentLevel}`);
        console.log(`🔍 Level 1 exists:`, LEVELS[1] ? 'YES' : 'NO');
        console.log(`🔍 Level 1 name:`, LEVELS[1] ? LEVELS[1].name : 'NOT FOUND');
        
        // Verify currentLevel before starting
        console.log(`🚀 Starting game at Level ${currentLevel}`);
        console.log(`📍 Level definition:`, LEVELS[currentLevel] ? LEVELS[currentLevel].name : 'NOT FOUND!');
        
        // ABSOLUTELY ensure we're at Level 1
        if (currentLevel !== 1) {
            console.error(`❌ ERROR: currentLevel is ${currentLevel}, should be 1! Forcing reset...`);
            currentLevel = 1;
        }
        
        // ABSOLUTELY ensure we're at Level 1 before proceeding
        if (!enforceLevel1()) {
            console.error('❌ CRITICAL: Cannot enforce Level 1!');
            return;
        }
        
        // Initialize shields based on level (must be after applyPlayerDifficulty)
        // Level 1: Shields MUST be OFFLINE (0)
        player.shield = 0;
        player.maxShield = 100; // Keep max value for later levels, but current is 0
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ SHIELDS: OFFLINE for Level 1 (Training Mode)');
        console.log(`   player.shield = ${player.shield}`);
        console.log(`   player.maxShield = ${player.maxShield}`);
        console.log(`   currentLevel = ${currentLevel}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log(`🔍 About to create enemies for Level ${currentLevel}`);
        createEnemies();
        console.log(`✅ Created ${enemies.length} enemies for Level ${currentLevel}`);
        if (LEVELS[currentLevel]) {
            console.log(`   Level name: "${LEVELS[currentLevel].name}"`);
            console.log(`   Formation: "${LEVELS[currentLevel].formation}"`);
        }
        
        // Reset game state
        bullets = [];
        enemyBullets = [];
        powerups = [];
        grenades = [];
        totalAmmoUsed = 0;
        levelAmmoUsed = 0;
        totalScore = 0;
        totalEnemiesKilled = 0;
        gameOverSoundPlayed = false;
        victorySoundPlayed = false;
        scoreSaved = false;
        
        gameStartTime = Date.now();
        levelStartTime = Date.now(); // Initialize level start time

        // Start telemetry recording
        if (window.telemetryRecorder) {
            // Try to get user from multiple sources
            let userEmail = null;
            let userName = null;
            
            if (window.currentUser && window.currentUser.email) {
                userEmail = window.currentUser.email;
                userName = window.currentUser.name;
            } else if (typeof getCurrentUser === 'function') {
                try {
                    const currentUser = getCurrentUser();
                    if (currentUser && currentUser.email) {
                        userEmail = currentUser.email;
                        userName = currentUser.name;
                    }
                } catch (e) {
                    console.warn('⚠️ Could not get user for telemetry:', e);
                }
            }
            
            if (userEmail) {
                window.telemetryRecorder.startRecording(userEmail, userName);
                console.log('📊 Telemetry recording started for:', userEmail);
            } else {
                console.warn('⚠️ Telemetry recording not started: No user email available');
                console.log('   window.currentUser:', window.currentUser);
            }
        }

        // Set intensity spike timing with difficulty adjustments
        const intervalMin = adjustedGameParams.intensitySpikeIntervalMin || 5000;
        const intervalMax = adjustedGameParams.intensitySpikeIntervalMax || 10000;
        nextIntensitySpikeTime = gameStartTime + intervalMin + Math.random() * (intervalMax - intervalMin);
        
        // Start game loop
        update();
    });
}

// Load difficulty in background (for when game actually starts)
loadAndApplyDifficulty().then(() => {
    console.log('✅ Difficulty loaded. Ready to start game when demo mode exits.');
});

// Start demo mode immediately (don't wait for difficulty loading)
console.log('🎮 Starting idle demo mode...');
// Start the update loop - it will show demo mode since idleDemoMode = true
update();

// Fallback: Only applies if demo mode has been exited (game started)
// Demo mode prevents automatic game start
setTimeout(() => {
    if (gameStartTime === 0 && !idleDemoMode) {
        console.log('⚠️ Difficulty loading timeout, starting with default difficulty...');
        applyDifficultyAdjustments(0.7); // Easier default
        applyPlayerDifficulty();
        
        // FORCE currentLevel to 1 in fallback too
        if (currentLevel !== 1) {
            console.warn(`⚠️ WARNING: currentLevel was ${currentLevel} in fallback, forcing back to 1`);
            currentLevel = 1;
        }
        
        // Verify currentLevel before starting
        console.log(`🚀 Starting game at Level ${currentLevel} (fallback)`);
        console.log(`📍 Level definition:`, LEVELS[currentLevel] ? LEVELS[currentLevel].name : 'NOT FOUND!');
        
        // Initialize shields based on level
        if (currentLevel === 1) {
            // Level 1: Shields OFFLINE (explicitly set to 0)
            player.shield = 0;
            player.maxShield = 100; // Keep max value for later levels
            console.log('❌ Shields OFFLINE for Level 1 (Training Mode)');
            console.log(`🔍 Shield value after reset: player.shield = ${player.shield}, player.maxShield = ${player.maxShield}`);
        } else if (currentLevel >= 2) {
            // Level 2+: Shields active
            player.shield = player.maxShield;
            console.log(`✅ Shields activated for Level ${currentLevel}`);
        }
        
        console.log(`🔍 About to create enemies for Level ${currentLevel} (fallback)`);
        createEnemies();
        console.log(`🔍 Created ${enemies.length} enemies for Level ${currentLevel} (fallback)`);
        gameStartTime = Date.now();
        levelStartTime = Date.now();
        const intervalMin = adjustedGameParams.intensitySpikeIntervalMin || 5000;
        const intervalMax = adjustedGameParams.intensitySpikeIntervalMax || 10000;
        nextIntensitySpikeTime = gameStartTime + intervalMin + Math.random() * (intervalMax - intervalMin);
        update();
    }
}, 2000); // 2 second timeout

// Reset score tracking
totalScore = 0;
totalAmmoUsed = 0;
totalEnemiesKilled = 0;
levelAmmoUsed = 0;
scoreSaved = false;
gameOverSoundPlayed = false;
victorySoundPlayed = false;
window.lastScoreSaveSuccess = undefined;
window.scoreNotSavedReason = undefined;

console.log('Enemies created:', enemies.length);

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Reset all keys when window loses focus (prevents stuck keys)
window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
    keys.space = false;
    player.dx = 0;
});

// NOTE: update() is called inside loadAndApplyDifficulty().then() after enemies are created
// DO NOT call update() here or it will start with 0 enemies and skip to Level 2!