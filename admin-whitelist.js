// Admin Email Whitelist
// Add admin emails here (lowercase)
// NOTE: This file defines admin emails separate from the player whitelist

// Check if already declared (avoid duplicate declaration)
let ADMIN_EMAILS;
if (typeof window !== 'undefined' && window.ADMIN_EMAILS) {
    ADMIN_EMAILS = window.ADMIN_EMAILS;
} else {
    ADMIN_EMAILS = [
        // Add admin emails here
        'tgallhu@gmail.com',
        't_gallhu@yahoo.com'
        // Add more admin emails as needed
    ];

    // Make available globally
    if (typeof window !== 'undefined') {
        window.ADMIN_EMAILS = ADMIN_EMAILS;
    }
}

function isAdminEmail(email) {
    if (!email) return false;
    const adminEmails = (typeof window !== 'undefined' && window.ADMIN_EMAILS) || ADMIN_EMAILS || [];
    return adminEmails.includes(email.toLowerCase().trim());
}

// Make available globally
if (typeof window !== 'undefined') {
    window.isAdminEmail = isAdminEmail;
}

