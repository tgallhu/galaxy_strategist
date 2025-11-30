// Score management with Firebase Firestore

// Initialize Firestore
// Use window.db to share with other scripts
let db = null;
if (typeof window !== 'undefined') {
    window.db = null; // Will be set when initialized
}

function initFirestore() {
    console.log('🔧 initFirestore() called');
    console.log('🔍 Checking firebase availability...');
    console.log('   typeof firebase:', typeof firebase);

    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not loaded. Make sure firebase-config.js and Firebase SDK are included.');
        return false;
    }

    console.log('✅ firebase object exists');
    console.log('🔍 Checking firebase.firestore...');
    console.log('   typeof firebase.firestore:', typeof firebase.firestore);

    if (typeof firebase.firestore !== 'function') {
        console.error('❌ firebase.firestore is not available. Make sure Firestore SDK is loaded.');
        return false;
    }

    try {
        console.log('🔧 Calling firebase.firestore()...');
        const firestoreInstance = firebase.firestore();
        console.log('✅ firebase.firestore() returned:', firestoreInstance);
        console.log('   Type:', typeof firestoreInstance);
        console.log('   Has collection method:', typeof firestoreInstance?.collection);

        db = firestoreInstance;
        console.log('✅ db variable set to:', db);
        console.log('   db is null?', db === null);
        console.log('   db has collection?', typeof db?.collection);

        // Store in window for sharing with other scripts
        if (typeof window !== 'undefined') {
            window.db = db;
            console.log('✅ window.db set');
        }

        console.log('✅ Firestore initialized successfully');
        return true;
    } catch (e) {
        console.error('❌ Error initializing Firestore:', e);
        console.error('   Error name:', e.name);
        console.error('   Error message:', e.message);
        console.error('   Error stack:', e.stack);
        return false;
    }
}

// Save score to Firestore
async function saveScore(name, email, score, level, timeSeconds, ammoUsed) {
    console.log('🎯 saveScore() called');
    console.log('   Current db value:', db);
    console.log('   db is null?', db === null);
    console.log('   db type:', typeof db);
    console.log('   db has collection?', typeof db?.collection);

    if (!db) {
        console.log('⚠️ db is null, attempting to initialize Firestore...');
        const initResult = initFirestore();
        console.log('   initFirestore() returned:', initResult);
        console.log('   db after init:', db);

        if (!initResult) {
            console.error('❌ Cannot save score: Firestore not initialized');
            return { success: false, message: 'Database not available' };
        }
    }

    try {
        const scoreData = {
            name: name,
            email: email.toLowerCase(),
            score: score,
            level: level,
            timeSeconds: timeSeconds,
            ammoUsed: ammoUsed,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString()
        };

        console.log('💾 Saving score to Firestore:', scoreData);
        const docRef = await db.collection('scores').add(scoreData);
        console.log('✅ Score saved with document ID:', docRef.id);

        // Broadcast score notification to all users
        if (typeof broadcastScoreNotification !== 'undefined') {
            try {
                await broadcastScoreNotification(name, score, level);
            } catch (notifError) {
                console.warn('⚠️ Could not send score notification:', notifError);
            }
        }

        return { success: true, docId: docRef.id };
    } catch (error) {
        console.error('❌ Error saving score:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Check for common Firestore errors
        if (error.code === 'permission-denied') {
            return { success: false, message: 'Permission denied. Check Firestore security rules allow writing scores.' };
        } else {
            return { success: false, message: 'Failed to save score: ' + (error.message || error) };
        }
    }
}

// Get leaderboard (top scores)
async function getLeaderboard(limit = 10) {
    if (!db) {
        if (!initFirestore()) {
            console.error('Cannot fetch leaderboard: Firestore not initialized');
            throw new Error('Database not initialized');
        }
    }

    try {
        console.log('📋 Querying Firestore for scores...');
        const snapshot = await db.collection('scores')
            .orderBy('score', 'desc')
            .limit(limit)
            .get();

        console.log(`📄 Query returned ${snapshot.size} documents`);
        
        if (snapshot.empty) {
            console.log('⚠️ No scores found in database');
            return [];
        }

        const scores = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('📝 Score document:', {
                id: doc.id,
                name: data.name,
                score: data.score,
                email: data.email,
                timestamp: data.timestamp
            });
            scores.push({
                id: doc.id,
                ...data
            });
        });

        console.log(`✅ Parsed ${scores.length} scores`);
        return scores;
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Check for common Firestore errors
        if (error.code === 'permission-denied') {
            throw new Error('Permission denied. Check Firestore security rules allow reading scores.');
        } else if (error.code === 'failed-precondition') {
            throw new Error('Firestore index required. The error message will include a link to create it.');
        } else if (error.message) {
            throw error;
        } else {
            throw new Error('Failed to fetch scores: ' + error);
        }
    }
}

// Get user's best score
async function getUserBestScore(email) {
    if (!db) {
        if (!initFirestore()) {
            return null;
        }
    }

    try {
        const snapshot = await db.collection('scores')
            .where('email', '==', email.toLowerCase())
            .orderBy('score', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error fetching user best score:', error);
        return null;
    }
}

// Get user's all scores
async function getUserScores(email, limit = 10) {
    if (!db) {
        if (!initFirestore()) {
            return [];
        }
    }

    try {
        const snapshot = await db.collection('scores')
            .where('email', '==', email.toLowerCase())
            .orderBy('score', 'desc')
            .limit(limit)
            .get();

        const scores = [];
        snapshot.forEach(doc => {
            scores.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return scores;
    } catch (error) {
        console.error('Error fetching user scores:', error);
        return [];
    }
}

