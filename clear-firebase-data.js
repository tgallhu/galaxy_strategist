#!/usr/bin/env node
/**
 * Firebase Data Cleanup Utility
 *
 * Usage:
 *   node clear-firebase-data.js --collection telemetry
 *   node clear-firebase-data.js --email user@example.com
 *   node clear-firebase-data.js --all
 *   node clear-firebase-data.js --help
 */

const readline = require('readline');

// Check if firebase-admin is installed
let admin;
try {
    admin = require('firebase-admin');
} catch (e) {
    console.error('❌ firebase-admin not installed.');
    console.log('Install it with: npm install firebase-admin');
    console.log('\nAlternatively, use the web-based tool at: admin/clear-data.html');
    process.exit(1);
}

// Check if service account key exists
let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
    console.error('❌ serviceAccountKey.json not found.');
    console.log('Download it from Firebase Console → Project Settings → Service Accounts');
    console.log('\nAlternatively, use the web-based tool at: admin/clear-data.html');
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    collection: null,
    email: null,
    all: false,
    help: false
};

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--collection':
        case '-c':
            options.collection = args[++i];
            break;
        case '--email':
        case '-e':
            options.email = args[++i];
            break;
        case '--all':
            options.all = true;
            break;
        case '--help':
        case '-h':
            options.help = true;
            break;
    }
}

// Show help
if (options.help || args.length === 0) {
    console.log(`
Firebase Data Cleanup Utility

Usage:
  node clear-firebase-data.js [options]

Options:
  -c, --collection <name>    Delete all documents from a collection
                            (telemetry, scores, notifications, fcm_tokens)

  -e, --email <email>        Delete all data for a specific user email

  --all                      Delete all data from all collections (DANGER!)

  -h, --help                Show this help message

Examples:
  node clear-firebase-data.js --collection telemetry
  node clear-firebase-data.js --email test@example.com
  node clear-firebase-data.js --all

Web Interface:
  You can also use the web-based admin tool at:
  http://localhost:5000/admin/clear-data.html
    `);
    process.exit(0);
}

// Prompt for confirmation
function confirm(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question + ' (yes/no): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

// Delete collection
async function deleteCollection(collectionName, batchSize = 500) {
    console.log(`🗑️  Deleting collection: ${collectionName}`);

    const collectionRef = db.collection(collectionName);
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, batchSize, resolve, reject);
    });
}

async function deleteQueryBatch(query, batchSize, resolve, reject) {
    try {
        const snapshot = await query.get();

        if (snapshot.size === 0) {
            resolve();
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`   Deleted ${snapshot.size} documents`);

        // Recurse on the next process tick
        process.nextTick(() => {
            deleteQueryBatch(query, batchSize, resolve, reject);
        });
    } catch (error) {
        reject(error);
    }
}

// Delete by email
async function deleteByEmail(email) {
    console.log(`🗑️  Deleting data for: ${email}`);

    // Delete telemetry
    const telemetryQuery = db.collection('telemetry').where('playerEmail', '==', email);
    const telemetrySnapshot = await telemetryQuery.get();
    const batch1 = db.batch();
    telemetrySnapshot.forEach(doc => batch1.delete(doc.ref));
    await batch1.commit();
    console.log(`   Deleted ${telemetrySnapshot.size} telemetry documents`);

    // Delete scores
    const scoresQuery = db.collection('scores').where('email', '==', email);
    const scoresSnapshot = await scoresQuery.get();
    const batch2 = db.batch();
    scoresSnapshot.forEach(doc => batch2.delete(doc.ref));
    await batch2.commit();
    console.log(`   Deleted ${scoresSnapshot.size} score documents`);

    console.log(`✅ Deleted all data for ${email}`);
}

// Delete all data
async function deleteAllData() {
    console.log('⚠️  DELETING ALL DATA FROM ALL COLLECTIONS');

    const collections = ['telemetry', 'scores', 'notifications', 'fcm_tokens'];

    for (const collection of collections) {
        await deleteCollection(collection);
    }

    console.log('✅ All data deleted');
}

// Main execution
async function main() {
    try {
        if (options.collection) {
            const confirmed = await confirm(`Delete all documents from "${options.collection}"?`);
            if (!confirmed) {
                console.log('Cancelled');
                process.exit(0);
            }
            await deleteCollection(options.collection);
            console.log('✅ Done');
        } else if (options.email) {
            const confirmed = await confirm(`Delete all data for "${options.email}"?`);
            if (!confirmed) {
                console.log('Cancelled');
                process.exit(0);
            }
            await deleteByEmail(options.email);
        } else if (options.all) {
            console.log('\n⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️');
            console.log('This will DELETE ALL DATA from:');
            console.log('  - telemetry');
            console.log('  - scores');
            console.log('  - notifications');
            console.log('  - fcm_tokens');
            console.log('\nTHIS CANNOT BE UNDONE!\n');

            const confirmed = await confirm('Are you ABSOLUTELY SURE?');
            if (!confirmed) {
                console.log('Cancelled');
                process.exit(0);
            }

            const doubleConfirm = await confirm('Type "yes" again to confirm');
            if (!doubleConfirm) {
                console.log('Cancelled');
                process.exit(0);
            }

            await deleteAllData();
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
