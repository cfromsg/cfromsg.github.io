// Menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuBackdrop = document.querySelector('.menu-backdrop');
    let isMenuOpen = false;

    // Toggle menu function
    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        hamburger.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        menuBackdrop.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Accessibility
        hamburger.setAttribute('aria-expanded', isMenuOpen);
        menuOverlay.setAttribute('aria-hidden', !isMenuOpen);
    };

    // Event listeners
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
    });

    // Close menu when clicking outside
    menuBackdrop.addEventListener('click', (e) => {
        if (isMenuOpen) {
            toggleMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Handle mobile touch events
    let touchStartX = 0;
    let touchEndX = 0;

    menuOverlay.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    menuOverlay.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    const handleSwipe = () => {
        // Detect left swipe (close menu)
        if (touchEndX < touchStartX - 50 && isMenuOpen) {
            toggleMenu();
        }
    };

    // Initialize ARIA attributes
    hamburger.setAttribute('aria-label', 'Menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'menu-overlay');
    menuOverlay.setAttribute('aria-hidden', 'true');
    menuOverlay.setAttribute('role', 'navigation');

    // Set active menu item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = menuOverlay.querySelectorAll('a');
    menuItems.forEach(item => {
        // Remove any existing active class
        item.classList.remove('active');
        // Only add active class if the href exactly matches the current page
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        }
    });
});