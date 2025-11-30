// Admin Authentication System
// Simple admin check based on email whitelist
// NOTE: ADMIN_EMAILS and isAdminEmail are defined in admin-whitelist.js

// Check if current user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return false;
    }
    
    // Use isAdminEmail from admin-whitelist.js if available
    if (typeof isAdminEmail === 'function') {
        return isAdminEmail(currentUser.email);
    }
    
    // Fallback: check ADMIN_EMAILS if available
    if (typeof window !== 'undefined' && window.ADMIN_EMAILS) {
        return window.ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
    }
    
    return false;
}

// Require admin for accessing dashboard pages
function requireAdmin() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Not logged in, redirect to login
        window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
        return false;
    }
    
    if (!isAdmin()) {
        // Not admin, show error and redirect
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #ff0000; font-family: 'Courier New', monospace;">
                <h1>❌ Access Denied</h1>
                <p>You do not have permission to access this dashboard.</p>
                <p>Contact an administrator if you believe this is an error.</p>
                <a href="../index.html" style="color: #00FFFF; margin-top: 20px; display: inline-block;">← Back to Game</a>
            </div>
        `;
        return false;
    }
    
    return true;
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.isAdmin = isAdmin;
    window.requireAdmin = requireAdmin;
}

