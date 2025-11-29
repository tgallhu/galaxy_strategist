// Simple authentication system
// Uses localStorage to remember logged-in users

const AUTH_STORAGE_KEY = 'galacticStrategistAuth';

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
    
    // Save to localStorage
    const userData = {
        name: name.trim(),
        email: trimmedEmail,
        loginTime: Date.now()
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    
    return { success: true, user: userData };
}

// Logout user
function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Get current user
function getCurrentUser() {
    return isLoggedIn();
}

