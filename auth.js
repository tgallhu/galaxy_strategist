// Simple authentication system
// Uses localStorage to remember logged-in users
// WHITELIST DISABLED - All users allowed, anonymous play supported

const AUTH_STORAGE_KEY = 'galacticStrategistAuth';
const FIRST_LOGIN_KEY = 'galacticStrategistFirstLogin';
const PLAYER_COUNTER_KEY = 'galacticStrategistPlayerCounter';

// Generate next sequential player name
function generatePlayerName() {
    let counter = parseInt(localStorage.getItem(PLAYER_COUNTER_KEY) || '0');
    counter++;
    localStorage.setItem(PLAYER_COUNTER_KEY, counter.toString());
    return `Player${counter}`;
}

// Check if user is logged in
function isLoggedIn() {
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!auth) return null;

    try {
        const userData = JSON.parse(auth);
        return userData;
    } catch (e) {
        console.error('Error parsing auth data:', e);
        logout();
        return null;
    }
}

// Auto-login with generated player name (for anonymous users)
function autoLogin() {
    const playerName = generatePlayerName();
    const userData = {
        name: playerName,
        email: `${playerName.toLowerCase()}@auto.generated`,
        loginTime: Date.now(),
        isFirstTime: true,
        isAnonymous: true,
        needsWelcomeNotification: true,
        createdAt: Date.now()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    console.log(`🎮 Auto-logged in as: ${playerName}`);
    return userData;
}

// Login user (no whitelist check - all users allowed)
function login(name, email) {
    // If no name provided, generate one
    if (!name || !name.trim()) {
        return autoLogin();
    }

    const trimmedName = name.trim();

    // Auto-generate email if not provided (name@user.com)
    if (!email || !email.trim()) {
        email = `${trimmedName.toLowerCase().replace(/\s+/g, '')}@user.com`;
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if this is first-time login
    const firstLoginData = localStorage.getItem(FIRST_LOGIN_KEY);
    let firstTimeUsers = firstLoginData ? JSON.parse(firstLoginData) : [];
    const isFirstTime = !firstTimeUsers.includes(trimmedEmail);

    // Save to localStorage
    const userData = {
        name: trimmedName,
        email: trimmedEmail,
        loginTime: Date.now(),
        isFirstTime: isFirstTime,
        isAnonymous: false,
        createdAt: Date.now()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));

    // Mark user as having logged in before
    if (isFirstTime) {
        firstTimeUsers.push(trimmedEmail);
        localStorage.setItem(FIRST_LOGIN_KEY, JSON.stringify(firstTimeUsers));

        // Trigger welcome notification (will be called after page loads)
        userData.needsWelcomeNotification = true;
    }

    return { success: true, user: userData, isFirstTime: isFirstTime };
}

// Update username (for users who want to change from default/anonymous)
function updateUsername(newName) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, message: 'Not logged in' };
    }

    if (!newName || !newName.trim()) {
        return { success: false, message: 'Please provide a name' };
    }

    const trimmedName = newName.trim();
    const oldEmail = currentUser.email;
    const oldName = currentUser.name;

    // Generate new email based on new name
    const newEmail = `${trimmedName.toLowerCase().replace(/\s+/g, '')}@user.com`;

    // Update user data
    currentUser.name = trimmedName;
    currentUser.email = newEmail;
    currentUser.isAnonymous = false;
    currentUser.nameUpdatedAt = Date.now();
    currentUser.previousEmail = oldEmail; // Keep track for profile migration

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));

    console.log(`✅ Username updated: ${oldName} → ${trimmedName}`);

    return {
        success: true,
        user: currentUser,
        oldEmail: oldEmail,
        newEmail: newEmail,
        needsProfileMigration: true
    };
}

// Logout user
function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Get current user
function getCurrentUser() {
    return isLoggedIn();
}

