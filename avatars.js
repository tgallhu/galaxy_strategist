// Retro avatar generator - creates pixel art style avatars

// Simple hash function for consistent avatar generation
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Generate a retro pixel art avatar based on name/email
function generateRetroAvatar(name) {
    const seed = hashString(name || 'default');
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // Set seed for random but consistent generation
    const rng = seededRandom(seed);
    
    // Background color - retro space colors
    const bgColors = [
        '#000033', // Deep space blue
        '#001122', // Dark blue
        '#110033', // Purple space
        '#002244', // Navy
    ];
    const bgColor = bgColors[Math.floor(rng() * bgColors.length)];
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 50, 50);
    
    // Face color - various skin tones and space suit colors
    const faceColors = [
        '#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', // Skin tones
        '#00FFFF', '#FF6600', '#FFFF00', '#FF00FF', '#00FF00', // Space suits
    ];
    const faceColor = faceColors[Math.floor(rng() * faceColors.length)];
    
    // Draw face (head)
    ctx.fillStyle = faceColor;
    ctx.fillRect(15, 10, 20, 25);
    
    // Hair/helmet
    const hairColors = [
        '#8B4513', '#000000', '#FFD700', '#C0C0C0', '#FF0000',
        '#00FFFF', '#FF00FF', '#000080', // Space helmet colors
    ];
    const hairColor = hairColors[Math.floor(rng() * hairColors.length)];
    ctx.fillStyle = hairColor;
    
    // Hair/helmet style
    const hairStyle = Math.floor(rng() * 4);
    if (hairStyle === 0) {
        // Full helmet
        ctx.fillRect(12, 8, 26, 30);
    } else if (hairStyle === 1) {
        // Top hair
        ctx.fillRect(18, 5, 14, 12);
    } else if (hairStyle === 2) {
        // Side hair
        ctx.fillRect(12, 10, 26, 18);
    } else {
        // Visor
        ctx.fillRect(15, 15, 20, 8);
        ctx.fillStyle = '#000080';
        ctx.fillRect(15, 15, 20, 8);
    }
    
    // Eyes
    ctx.fillStyle = '#000000';
    const eyeY = 20;
    const eyeSize = 3;
    
    // Left eye
    ctx.fillRect(19 + Math.floor(rng() * 3), eyeY, eyeSize, eyeSize);
    // Right eye
    ctx.fillRect(28 + Math.floor(rng() * 3), eyeY, eyeSize, eyeSize);
    
    // Mouth
    const mouthStyle = Math.floor(rng() * 3);
    const mouthY = 28;
    if (mouthStyle === 0) {
        // Small smile
        ctx.fillRect(22, mouthY, 6, 2);
    } else if (mouthStyle === 1) {
        // Neutral
        ctx.fillRect(23, mouthY, 4, 2);
    } else {
        // Wide smile
        ctx.fillRect(20, mouthY, 10, 2);
    }
    
    // Accessories/decals
    const hasAccessory = rng() > 0.7;
    if (hasAccessory) {
        const accColors = ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF'];
        ctx.fillStyle = accColors[Math.floor(rng() * accColors.length)];
        
        const accType = Math.floor(rng() * 3);
        if (accType === 0) {
            // Star on cheek
            drawStar(ctx, 30, 25, 3, 5);
        } else if (accType === 1) {
            // Stripes
            ctx.fillRect(17, 18, 16, 2);
        } else {
            // Badge
            ctx.fillRect(24, 12, 4, 4);
        }
    }
    
    return canvas.toDataURL();
}

// Draw a simple star
function drawStar(ctx, cx, cy, spikes, outerRadius) {
    const innerRadius = outerRadius / 2;
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// Seeded random number generator for consistent results
function seededRandom(seed) {
    let state = seed;
    return function() {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
}

// Cache for generated avatars
const avatarCache = {};

// Get or generate avatar with caching
function getRetroAvatar(name) {
    if (!name) name = 'default';
    
    if (avatarCache[name]) {
        return avatarCache[name];
    }
    
    const avatar = generateRetroAvatar(name);
    avatarCache[name] = avatar;
    return avatar;
}

