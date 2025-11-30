// Admin Authentication System
// Simple admin check based on email whitelist

const ADMIN_EMAILS = [
    // Add admin emails here
    // Example: 'admin@example.com'
];

// Check if current user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return false;
    }
    
    // Check if email is in admin list
    return ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
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

