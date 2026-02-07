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
// MOBILE MENU FUNCTIONALITY
// ========================================
function toggleMobileMenu() {
    console.log('Toggle mobile menu clicked');
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('Hamburger:', hamburger);
    console.log('Nav menu:', navMenu);
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    console.log('Menu active state:', navMenu.classList.contains('active'));
    
    // Close menu when clicking outside
    if (navMenu.classList.contains('active')) {
        setTimeout(() => {
            document.addEventListener('click', closeMenuOutside);
        }, 100);
    } else {
        document.removeEventListener('click', closeMenuOutside);
    }
}

function closeMenuOutside(event) {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.removeEventListener('click', closeMenuOutside);
    }
}

// ========================================
// THEME SELECTION
// ========================================
function getThemeStorage() {
    try {
        const testKey = '__theme_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return localStorage;
    } catch (err) {
        console.warn('localStorage unavailable; theme will not persist.', err);
        return null;
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const selectors = document.querySelectorAll('[data-theme-select]');
    selectors.forEach(select => {
        if (select.value !== theme) {
            select.value = theme;
        }
    });
}

function initThemeSelector() {
    const selectors = document.querySelectorAll('[data-theme-select]');
    if (selectors.length === 0) return;

    const storage = getThemeStorage();
    const storedTheme = storage ? storage.getItem('anichessTheme') : null;
    const initialTheme = storedTheme || document.documentElement.getAttribute('data-theme') || 'theme-1';
    applyTheme(initialTheme);

    selectors.forEach(select => {
        select.addEventListener('change', (event) => {
            const theme = event.target.value;
            applyTheme(theme);
            if (storage) {
                storage.setItem('anichessTheme', theme);
            }
        });
    });
}

// ========================================
// HERO SCROLL HINT
// ========================================
function initScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    const hero = document.querySelector('.hero');
    if (!hint || !hero) return;

    hint.addEventListener('click', () => {
        const targetSelector = hint.getAttribute('data-scroll-target');
        const target = targetSelector ? document.querySelector(targetSelector) : null;
        if (target) {
            smoothScrollTo(target, 1200);
        }
    });

    const observer = new IntersectionObserver(
        ([entry]) => {
            hint.classList.toggle('hidden', !entry.isIntersecting);
        },
        { threshold: 0.4 }
    );

    observer.observe(hero);
}

function smoothScrollTo(target, durationMs) {
    const startY = window.pageYOffset;
    const targetRect = target.getBoundingClientRect();
    const targetY = startY + targetRect.top;
    const startTime = performance.now();

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = easeInOutCubic(progress);
        const nextY = startY + (targetY - startY) * eased;
        window.scrollTo(0, nextY);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// ========================================
// DEVICE CAROUSEL FUNCTIONALITY
// ========================================
let currentSlide = 0;
const totalSlides = 4;
let autoScrollInterval;

function initCarousel() {
    // Start auto-scroll
    startAutoScroll();
    
    // Pause auto-scroll on hover
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);
    }
}

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!track || slides.length === 0) return;
    
    // Update track position
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update active states
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

function changeSlide(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
    resetAutoScroll();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    resetAutoScroll();
}

function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        changeSlide(1);
    }, 3000);
}

function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}

function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
}

// Chess Background Animation
function initChessBackground() {
    const chessBackground = document.getElementById('chessBackground');
    const pieces = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];
    const pieceCount = 25; // Increased from 15 to 25 pieces
    
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
        const size = 12 + Math.random() * 20; // Slightly smaller pieces
        piece.classList.add(`size-${Math.floor(size / 5)}`);
        
        // Enhanced glow effect
        piece.classList.add(`glow-${Math.floor(Math.random() * 3)}`);
        
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
            smoothScrollTo(target, 1200);
        }
    });
});

// ========================================
// INITIALIZATION
// ========================================
// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeSelector();
    initScrollHint();
    initChessBackground();
    initCarousel();
    
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
