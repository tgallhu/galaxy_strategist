// Tutorial/Intro System
// Plays automatically after login and after 2 minutes of idle time

class TutorialSystem {
    constructor() {
        this.isActive = false;
        this.currentStep = 0;
        this.startTime = 0;
        this.lastUserActivity = Date.now();
        this.idleTimeout = 120000; // 2 minutes
        this.idleTimer = null;
        this.explanationTitle = '';
        this.explanationText = '';
        this.showExplanation = false;
        this.hasPlayedAfterLogin = false;
        
        this.tutorialSteps = [
            { title: 'Welcome!', text: 'Welcome to Galactic Strategist! Let\'s learn the basics.', duration: 3000 },
            { title: 'Movement', text: 'Use ← → Arrow Keys to move your ship left and right.', duration: 4000 },
            { title: 'Shooting', text: 'Press SPACEBAR to fire. Each shot generates heat - watch the heat bar!', duration: 4000 },
            { title: 'Ice Blue Ammo', text: 'Look for ICE BLUE ammo powerups! They let you shoot without generating heat.', duration: 5000, highlight: 'ammo' },
            { title: 'Intensity Spikes', text: 'Watch for PURPLE flashes! During intensity spikes, enemies become larger and more dangerous.', duration: 5000, highlight: 'spike' },
            { title: 'Grenades', text: 'Press G to launch grenades. Great for clearing groups of enemies!', duration: 4000 },
            { title: 'Ready!', text: 'You\'re ready to play! The game will start normally now.', duration: 3000 }
        ];
    }
    
    checkIfFirstTime() {
        if (!window.currentUser) return false;
        const key = 'galacticStrategist_hasPlayed_' + window.currentUser.email;
        const hasPlayed = localStorage.getItem(key);
        if (!hasPlayed) {
            localStorage.setItem(key, 'true');
            return true;
        }
        return false;
    }
    
    startTutorial(trigger = 'login') {
        if (this.isActive) return;
        console.log('🎓 Starting tutorial... Trigger:', trigger);
        
        this.isActive = true;
        this.currentStep = 0;
        this.startTime = Date.now();
        this.showCurrentStep();
    }
    
    showCurrentStep() {
        if (this.currentStep >= this.tutorialSteps.length) {
            this.endTutorial();
            return;
        }
        
        const step = this.tutorialSteps[this.currentStep];
        this.explanationTitle = step.title;
        this.explanationText = step.text;
        this.showExplanation = true;
        
        setTimeout(() => {
            this.currentStep++;
            this.showCurrentStep();
        }, step.duration);
    }
    
    endTutorial() {
        console.log('✅ Tutorial completed');
        this.isActive = false;
        this.showExplanation = false;
        this.currentStep = 0;
    }
    
    skipTutorial() {
        console.log('⏭️ Tutorial skipped');
        this.endTutorial();
    }
    
    startIdleTimer() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.lastUserActivity = Date.now();
        
        this.idleTimer = setTimeout(() => {
            if (!this.isActive && !this.hasPlayedAfterLogin) {
                console.log('⏰ Idle timeout - starting tutorial');
                this.startTutorial('idle');
            }
        }, this.idleTimeout);
    }
    
    resetIdleTimer() {
        this.lastUserActivity = Date.now();
        if (this.idleTimer) clearTimeout(this.idleTimer);
        if (!this.isActive) {
            this.startIdleTimer();
        }
    }
    
    trackUserActivity() {
        this.lastUserActivity = Date.now();
        if (!this.isActive) {
            this.resetIdleTimer();
        }
    }
}

    // Global instance
if (typeof window !== 'undefined') {
    window.tutorialSystem = new TutorialSystem();
    
    // Make tutorial accessible globally for manual triggering
    window.startTutorial = function() {
        if (window.tutorialSystem) {
            console.log('🎓 Manually starting tutorial...');
            window.tutorialSystem.startTutorial('manual');
        }
    };
    
    // Reset tutorial flag (to allow it to play again after login)
    window.resetTutorialFlag = function() {
        if (window.currentUser) {
            const key = 'galacticStrategist_hasPlayed_' + window.currentUser.email;
            localStorage.removeItem(key);
            console.log('✅ Tutorial flag reset - will play again on next login');
        } else {
            console.log('⚠️ No user logged in to reset tutorial flag');
        }
    };
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.tutorialSystem) {
                if (window.tutorialSystem.checkIfFirstTime()) {
                    setTimeout(() => {
                        if (window.tutorialSystem) {
                            window.tutorialSystem.startTutorial('login');
                            window.tutorialSystem.hasPlayedAfterLogin = true;
                        }
                    }, 5000);
                }
                window.tutorialSystem.startIdleTimer();
            }
        }, 2000);
    });
    
    // Track activity
    ['mousedown', 'mousemove', 'keydown', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, () => {
            if (window.tutorialSystem) {
                window.tutorialSystem.trackUserActivity();
            }
        }, { passive: true });
    });
    
    // Keyboard shortcut to trigger tutorial: Press 'T' key
    document.addEventListener('keydown', (e) => {
        // Only trigger if not in tutorial and 'T' is pressed (not typing)
        if ((e.key === 't' || e.key === 'T') && 
            window.tutorialSystem && 
            !window.tutorialSystem.isActive &&
            document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA') {
            window.startTutorial();
            e.preventDefault();
        }
    });
}

