// Simple authentication system
// Uses localStorage to remember logged-in users

const AUTH_STORAGE_KEY = 'galacticStrategistAuth';
const FIRST_LOGIN_KEY = 'galacticStrategistFirstLogin';

// Check if user is logged in
function isLoggedIn() {
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!auth) return null;
    
    try {
        const userData = JSON.parse(auth);
        // Verify email is still authorized (in case whitelist changes)
        if (isAuthorized(userData.email)) {
            return userData;
        } else {
            // Email no longer authorized, clear auth
            logout();
            return null;
        }
    } catch (e) {
        console.error('Error parsing auth data:', e);
        logout();
        return null;
    }
}

// Login user
function login(name, email) {
    if (!name || !email) {
        return { success: false, message: 'Please provide both name and email' };
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if email is authorized
    if (!isAuthorized(trimmedEmail)) {
        return { success: false, message: 'Email not authorized. Contact admin for access.' };
    }

    // Check if this is first-time login
    const firstLoginData = localStorage.getItem(FIRST_LOGIN_KEY);
    let firstTimeUsers = firstLoginData ? JSON.parse(firstLoginData) : [];
    const isFirstTime = !firstTimeUsers.includes(trimmedEmail);

    // Save to localStorage
    const userData = {
        name: name.trim(),
        email: trimmedEmail,
        loginTime: Date.now(),
        isFirstTime: isFirstTime
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

// Logout user
function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Get current user
function getCurrentUser() {
    return isLoggedIn();
}

