// Admin Email Whitelist
// Add admin emails here (lowercase)

const ADMIN_EMAILS = [
    // Add admin emails here
    'tgallhu@gmail.com'
    // Add more admin emails as needed
];

function isAdminEmail(email) {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ADMIN_EMAILS = ADMIN_EMAILS;
    window.isAdminEmail = isAdminEmail;
}

