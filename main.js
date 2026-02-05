/* ========================================
   ANICHESS COMPANION LANDING PAGE INTERACTIONS
   ========================================
   - Chess background animation
   - Scroll animations
   - Anti-copy deterrents
   - Disabled navbar interactions
   - Smooth scrolling
   ======================================== */

// ========================================
// ANTI-COPY DETERRENT SCRIPTS
// ========================================
// 
// IMPORTANT: These are only deterrence measures and cannot fully prevent copying.
// Determined users can still access source code through browser developer tools,
// network inspection, or by disabling JavaScript.
// 
// These measures add friction to discourage casual copying and unauthorized use.
// They can be easily removed if needed in the future.
// ========================================

// Chess Background Animation
function initChessBackground() {
    const chessBackground = document.getElementById('chessBackground');
    const pieces = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
    const pieceCount = 15;
    
    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'chess-piece';
        piece.textContent = pieces[Math.floor(Math.random() * pieces.length)];
        
        // Random positioning
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = Math.random() * 100 + '%';
        
        // Random animation delay and duration
        piece.style.animationDelay = Math.random() * 20 + 's';
        piece.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        // Random size
        const size = 15 + Math.random() * 25;
        piece.style.fontSize = size + 'px';
        
        chessBackground.appendChild(piece);
    }
}

// Toast notification function for blocked actions
function showCopyToast() {
    const toast = document.getElementById('copyToast');
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Block right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showCopyToast();
    return false;
});

// Block keyboard shortcuts for developer tools
document.addEventListener('keydown', function(e) {
    // Block Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        showCopyToast();
        return false;
    }
    
    // Block Ctrl+Shift+I / Cmd+Option+I (Developer Tools)
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.metaKey && e.altKey && e.key === 'I')) {
        e.preventDefault();
        showCopyToast();
        return false;
    }
    
    // Block F12 (Developer Tools)
    if (e.key === 'F12') {
        e.preventDefault();
        showCopyToast();
        return false;
    }
    
    // Block Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        showCopyToast();
        return false;
    }
});

// ========================================
// NAVBAR INTERACTIONS
// ========================================
// Handle disabled navbar items
document.addEventListener('DOMContentLoaded', function() {
    const disabledLinks = document.querySelectorAll('.nav-link.disabled');
    
    disabledLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // Prevent focus on disabled items
        link.addEventListener('focus', function(e) {
            e.preventDefault();
            link.blur();
        });
    });
});

// ========================================
// SCROLL ANIMATIONS
// ========================================
// Add scroll animations for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all sections for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.step, .feature-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// ========================================
// SMOOTH SCROLLING
// ========================================
// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========================================
// INITIALIZATION
// ========================================
// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initChessBackground();
    
    // Add fade-in-up class to hero content immediately
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in-up');
    }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================
// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
