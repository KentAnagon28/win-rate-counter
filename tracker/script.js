// Tracker functionality
let trackerData = {
    currentGamemode: 'quickmode',
    dailyGoals: {
        quickmode: null,
        ranked: null,
        checkmate: null
    },
    gamemodeData: {
        quickmode: {
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            currentStreak: 0,
            streakType: 'none',
            bestStreak: 0,
            sessionGames: 0,
            recentGames: [],
            history: [] // Store last actions for undo
        },
        ranked: {
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            currentStreak: 0,
            streakType: 'none',
            bestStreak: 0,
            sessionGames: 0,
            recentGames: [],
            history: []
        },
        checkmate: {
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            currentStreak: 0,
            streakType: 'none',
            bestStreak: 0,
            sessionGames: 0,
            recentGames: [],
            history: []
        }
    }
};

// Load data from localStorage
function loadTrackerData() {
    const saved = localStorage.getItem('anichessTracker');
    if (saved) {
        const parsed = JSON.parse(saved);
        trackerData = { ...trackerData, ...parsed };
    }
    
    // Reset quickmode daily goal every day
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('anichessTrackerReset');
    if (lastReset !== today) {
        trackerData.gamemodeData.quickmode.sessionGames = 0;
        localStorage.setItem('anichessTrackerReset', today);
    }
    
    updateDisplay();
    updateGamemodeUI();
}

// Save data to localStorage
function saveTrackerData() {
    localStorage.setItem('anichessTracker', JSON.stringify(trackerData));
}

// Select gamemode
function selectGamemode(mode) {
    trackerData.currentGamemode = mode;
    
    // Update button states
    document.querySelectorAll('.gamemode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Update dropdown if it exists
    const dropdown = document.getElementById('gamemodeSelect');
    if (dropdown) {
        dropdown.value = mode;
    }
    
    // Show/hide daily planning
    const dailyPlanning = document.getElementById('dailyPlanning');
    if (mode === 'quickmode') {
        dailyPlanning.style.display = 'block';
        updateQuickmodeProgress();
    } else if (mode === 'ranked' || mode === 'checkmate') {
        dailyPlanning.style.display = 'block';
        updateGoalDisplay();
    } else {
        dailyPlanning.style.display = 'none';
    }
    
    updateDisplay();
}

// Update goal display
function updateGoalDisplay() {
    const mode = trackerData.currentGamemode;
    const goal = trackerData.dailyGoals[mode];
    const goalValue = document.getElementById('currentGoalValue');
    const progressDiv = document.getElementById('goalProgress');
    const resetBtn = document.getElementById('resetGoalBtn');
    
    // Show reset button for Ranked and Checkmate modes
    resetBtn.style.display = 'flex';
    
    if (goal) {
        goalValue.textContent = goal + ' games';
        progressDiv.style.display = 'block';
        updateGoalProgress();
    } else {
        goalValue.textContent = 'Not Set';
        progressDiv.style.display = 'none';
    }
}

// Update Quickmode progress
function updateQuickmodeProgress() {
    const goalValue = document.getElementById('currentGoalValue');
    const progressDiv = document.getElementById('goalProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resetBtn = document.getElementById('resetGoalBtn');
    
    const goal = 70; // Fixed goal for Quickmode
    const current = trackerData.gamemodeData.quickmode.sessionGames;
    
    goalValue.textContent = goal + ' games';
    progressDiv.style.display = 'block';
    resetBtn.style.display = 'none'; // Hide reset button for Quickmode
    
    const percentage = Math.min((current / goal) * 100, 100);
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${current} / ${goal} games completed`;
    
    if (current >= goal) {
        progressFill.style.background = 'linear-gradient(90deg, var(--success), #059669)';
        if (!progressFill.classList.contains('completed')) {
            progressFill.classList.add('completed');
            showToast('Quickmode daily goal completed! 🎉');
        }
    } else {
        progressFill.style.background = 'linear-gradient(90deg, var(--accent), var(--accent-secondary))';
        progressFill.classList.remove('completed');
    }
}

// Open goal modal
function openGoalModal() {
    const mode = trackerData.currentGamemode;
    
    // Don't allow modal for Quickmode (fixed goal)
    if (mode === 'quickmode') {
        showToast('Quickmode has a fixed goal of 70 games! ⚡');
        return;
    }
    
    const modal = document.getElementById('goalModal');
    const gamemodeSpan = document.getElementById('modalGamemode');
    const input = document.getElementById('modalGoalInput');
    
    // Set current gamemode in modal
    gamemodeSpan.textContent = trackerData.currentGamemode.charAt(0).toUpperCase() + trackerData.currentGamemode.slice(1);
    
    // Set current goal as default value
    const currentGoal = trackerData.dailyGoals[trackerData.currentGamemode];
    input.value = currentGoal || 10;
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Focus input
    setTimeout(() => {
        input.focus();
        input.select();
    }, 300);
}

// Close goal modal
function closeGoalModal() {
    const modal = document.getElementById('goalModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Confirm goal reset
function confirmGoalReset() {
    const input = document.getElementById('modalGoalInput');
    const goal = parseInt(input.value);
    
    if (goal > 0 && goal <= 50) {
        const mode = trackerData.currentGamemode;
        trackerData.dailyGoals[mode] = goal;
        trackerData.gamemodeData[mode].sessionGames = 0; // Reset progress
        saveTrackerData();
        updateGoalDisplay();
        updateGoalProgress();
        closeGoalModal();
        showToast(`Daily goal reset to ${goal} games for ${mode}! 🎯`);
    } else {
        // Shake input for invalid value
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
        showToast('Please enter a valid goal between 1 and 50 games');
    }
}

// Streak notification
function showStreakNotification(type, streak) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 200px;
    `;
    
    if (type === 'win') {
        notification.style.background = 'linear-gradient(135deg, var(--success), #059669)';
        notification.style.color = 'white';
        notification.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
        notification.innerHTML = `
            <span style="font-size: 1.5rem;">🔥</span>
            <span>${streak} Win Streak!</span>
        `;
    } else {
        notification.style.background = 'linear-gradient(135deg, var(--danger), #dc2626)';
        notification.style.color = 'white';
        notification.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
        notification.innerHTML = `
            <span style="font-size: 1.5rem;">😴</span>
            <span>Rest up! ${streak} Loss Streak</span>
        `;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Confetti celebration
function createConfetti() {
    const colors = ['#19e6ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const startX = Math.random() * window.innerWidth;
        const startY = -20;
        
        confetti.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            opacity: ${Math.random() * 0.5 + 0.5};
            transform: rotate(${Math.random() * 360}deg);
            z-index: 10002;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        // Animate confetti
        const duration = Math.random() * 2 + 1;
        const distance = Math.random() * 300 + 200;
        const rotation = Math.random() * 720 - 360;
        
        confetti.animate([
            { 
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1 
            },
            { 
                transform: `translateY(${window.innerHeight}px) translateX(${(Math.random() - 0.5) * distance}px) rotate(${rotation}deg)`,
                opacity: 0 
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }, () => {
            document.body.removeChild(confetti);
        });
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'goalModal') {
        closeGoalModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('goalModal').classList.contains('active')) {
        closeGoalModal();
    }
});

// Handle Enter key in modal input
document.getElementById('modalGoalInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        confirmGoalReset();
    }
});

// Update goal progress
function updateGoalProgress() {
    const mode = trackerData.currentGamemode;
    const goal = trackerData.dailyGoals[mode];
    const current = trackerData.gamemodeData[mode].sessionGames;
    
    if (goal) {
        const progressDiv = document.getElementById('goalProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressDiv.style.display = 'block';
        const percentage = Math.min((current / goal) * 100, 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${current} / ${goal} games completed`;
        
        if (current >= goal) {
            progressFill.style.background = 'linear-gradient(90deg, var(--success), #059669)';
            showToast(`Daily goal completed! 🎉`);
        }
    }
}

// Record a win
function recordWin() {
    const mode = trackerData.currentGamemode;
    const data = trackerData.gamemodeData[mode];
    
    // Store current state for undo
    const previousState = {
        totalGames: data.totalGames,
        totalWins: data.totalWins,
        totalLosses: data.totalLosses,
        currentStreak: data.currentStreak,
        streakType: data.streakType,
        bestStreak: data.bestStreak,
        sessionGames: data.sessionGames,
        recentGames: [...data.recentGames]
    };
    
    data.totalGames++;
    data.totalWins++;
    data.sessionGames++;
    
    const previousStreakType = data.streakType;
    const previousStreak = data.currentStreak;
    
    if (data.streakType === 'win') {
        data.currentStreak++;
    } else {
        data.currentStreak = 1;
        data.streakType = 'win';
    }
    
    if (data.currentStreak > data.bestStreak) {
        data.bestStreak = data.currentStreak;
    }
    
    data.recentGames.unshift('W');
    if (data.recentGames.length > 10) {
        data.recentGames.pop();
    }
    
    // Add to history
    data.history.unshift({
        action: 'win',
        previousState: previousState,
        timestamp: Date.now()
    });
    
    // Limit history to 10 actions
    if (data.history.length > 10) {
        data.history.pop();
    }
    
    saveTrackerData();
    updateDisplay();
    updateUndoButton();
    
    // Update progress based on mode
    if (mode === 'quickmode') {
        updateQuickmodeProgress();
    } else {
        updateGoalProgress();
    }
    
    // Check for win streak notifications
    if (data.currentStreak === 3 && previousStreak < 3) {
        showStreakNotification('win', 3);
        createConfetti();
    } else if (data.currentStreak === 5) {
        showStreakNotification('win', 5);
        createConfetti();
    } else if (data.currentStreak === 10) {
        showStreakNotification('win', 10);
        createConfetti();
    } else if (data.currentStreak > 0 && data.currentStreak % 5 === 0) {
        showStreakNotification('win', data.currentStreak);
    }
    
    showToast('Win recorded! 🏆');
}

// Record a loss
function recordLoss() {
    const mode = trackerData.currentGamemode;
    const data = trackerData.gamemodeData[mode];
    
    // Store current state for undo
    const previousState = {
        totalGames: data.totalGames,
        totalWins: data.totalWins,
        totalLosses: data.totalLosses,
        currentStreak: data.currentStreak,
        streakType: data.streakType,
        bestStreak: data.bestStreak,
        sessionGames: data.sessionGames,
        recentGames: [...data.recentGames]
    };
    
    data.totalGames++;
    data.totalLosses++;
    data.sessionGames++;
    
    const previousStreakType = data.streakType;
    const previousStreak = data.currentStreak;
    
    if (data.streakType === 'loss') {
        data.currentStreak++;
    } else {
        data.currentStreak = 1;
        data.streakType = 'loss';
    }
    
    // Check for lose streak notification
    if (data.currentStreak === 3 && previousStreakType === 'win') {
        showStreakNotification('lose', 3);
    } else if (data.currentStreak === 5 && previousStreakType === 'win') {
        showStreakNotification('lose', 5);
    } else if (data.currentStreak >= 3 && data.currentStreak % 3 === 0) {
        showStreakNotification('lose', data.currentStreak);
    }
    
    data.recentGames.unshift('L');
    if (data.recentGames.length > 10) {
        data.recentGames.pop();
    }
    
    // Add to history
    data.history.unshift({
        action: 'loss',
        previousState: previousState,
        timestamp: Date.now()
    });
    
    // Limit history to 10 actions
    if (data.history.length > 10) {
        data.history.pop();
    }
    
    saveTrackerData();
    updateDisplay();
    updateUndoButton();
    
    // Update progress based on mode
    if (mode === 'quickmode') {
        updateQuickmodeProgress();
    } else {
        updateGoalProgress();
    }
    
    showToast('Loss recorded. Keep going! 💪');
}

// Undo last action
function undoLastAction() {
    const mode = trackerData.currentGamemode;
    const data = trackerData.gamemodeData[mode];
    
    if (data.history.length === 0) {
        showToast('No actions to undo! 🔄');
        return;
    }
    
    const lastAction = data.history[0];
    const previousState = lastAction.previousState;
    
    // Restore previous state
    data.totalGames = previousState.totalGames;
    data.totalWins = previousState.totalWins;
    data.totalLosses = previousState.totalLosses;
    data.currentStreak = previousState.currentStreak;
    data.streakType = previousState.streakType;
    data.bestStreak = previousState.bestStreak;
    data.sessionGames = previousState.sessionGames;
    data.recentGames = [...previousState.recentGames];
    
    // Remove from history
    data.history.shift();
    
    saveTrackerData();
    updateDisplay();
    updateUndoButton();
    
    // Update progress based on mode
    if (mode === 'quickmode') {
        updateQuickmodeProgress();
    } else {
        updateGoalProgress();
    }
    
    showToast(`Undid ${lastAction.action}! ↩️`);
}

// Update undo button state
function updateUndoButton() {
    const mode = trackerData.currentGamemode;
    const data = trackerData.gamemodeData[mode];
    const undoBtn = document.querySelector('.btn-undo');
    
    if (data.history.length > 0) {
        undoBtn.disabled = false;
    } else {
        undoBtn.disabled = true;
    }
}

// Update display
function updateDisplay() {
    const mode = trackerData.currentGamemode;
    const data = trackerData.gamemodeData[mode];
    
    document.getElementById('totalGames').textContent = data.totalGames;
    document.getElementById('totalWins').textContent = data.totalWins;
    document.getElementById('totalLosses').textContent = data.totalLosses;
    document.getElementById('currentStreak').textContent = data.currentStreak;
    document.getElementById('bestStreak').textContent = data.bestStreak;
    document.getElementById('sessionGames').textContent = data.sessionGames;
    
    const winPercentage = data.totalGames > 0 ? 
        ((data.totalWins / data.totalGames) * 100).toFixed(1) : 0;
    const lossPercentage = data.totalGames > 0 ? 
        ((data.totalLosses / data.totalGames) * 100).toFixed(1) : 0;
    
    document.getElementById('winPercentage').textContent = winPercentage + '%';
    document.getElementById('lossPercentage').textContent = lossPercentage + '%';
    
    const streakTypeText = data.streakType === 'win' ? 'Win Streak' : 
                          data.streakType === 'loss' ? 'Loss Streak' : 'None';
    document.getElementById('streakType').textContent = streakTypeText;
    
    const recentForm = data.recentGames.slice(0, 5).join(' ');
    document.getElementById('recentForm').textContent = recentForm || '-';
}

// Update gamemode UI
function updateGamemodeUI() {
    selectGamemode(trackerData.currentGamemode);
    updateUndoButton();
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
        color: var(--bg-main);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 25px rgba(25, 230, 255, 0.4);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTrackerData();
    if (typeof initChessBackground === 'function') {
        initChessBackground();
    }
});
