// Simple email whitelist for trusted friends
// Add your friends' emails here (lowercase)
const AUTHORIZED_EMAILS = [
    // Add emails here, example:
    // 'friend1@example.com',
    // 'friend2@example.com',
    // 'friend3@example.com',
    't_gallhu@yahoo.com',
    'tgallhu@gmail.com'
    // Add up to 20 emails
];

// Simple validation - just checks if email is in whitelist
function isAuthorized(email) {
    if (!email) return false;
    return AUTHORIZED_EMAILS.includes(email.toLowerCase().trim());
}

