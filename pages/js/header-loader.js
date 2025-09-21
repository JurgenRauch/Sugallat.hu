// Header Loader and Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    // Load header content
    loadHeader();
    
    // Set active navigation states
    setActiveNavigation();
    
    // Handle mobile menu toggle
    initMobileMenu();
});

function loadHeader() {
    // Get the current page name to determine active states
    const currentPage = getCurrentPageName();
    
    // Load header HTML
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            // Insert header before the first section or body content
            const firstSection = document.querySelector('section');
            if (firstSection) {
                firstSection.insertAdjacentHTML('beforebegin', html);
            } else {
                document.body.insertAdjacentHTML('afterbegin', html);
            }
            
            // Set active states after header is loaded
            setActiveNavigation();
            initMobileMenu();
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });
}

function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Map filenames to page identifiers
    const pageMap = {
        'weboldal.html': 'home',
        'index.html': 'home',
        'kapcsolat.html': 'contact',
        'rolunk.html': 'about',
        'arak.html': 'pricing',
        'szolgaltatasok.html': 'services'
    };
    
    return pageMap[filename] || 'home';
}

function setActiveNavigation() {
    const currentPage = getCurrentPageName();
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to current page
    switch(currentPage) {
        case 'home':
            const homeLink = document.querySelector('a[href*="weboldal.html"], a[href*="index.html"]');
            if (homeLink) homeLink.classList.add('active');
            break;
        case 'contact':
            const contactLink = document.querySelector('a[href*="kapcsolat.html"]');
            if (contactLink) contactLink.classList.add('active');
            break;
        case 'about':
            const aboutLink = document.querySelector('a[href*="rolunk.html"]');
            if (aboutLink) aboutLink.classList.add('active');
            break;
        case 'pricing':
            const pricingLink = document.querySelector('a[href*="arak.html"]');
            if (pricingLink) pricingLink.classList.add('active');
            break;
        case 'services':
            const servicesLink = document.querySelector('a[href*="szolgaltatasok.html"]');
            if (servicesLink) servicesLink.classList.add('active');
            break;
    }
    
    // Set active dropdown links
    setActiveDropdownLinks(currentPage);
}

function setActiveDropdownLinks(currentPage) {
    // Set active state for dropdown links
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(link => {
        link.classList.remove('active');
        
        if (currentPage === 'contact' && link.href.includes('kapcsolat.html')) {
            link.classList.add('active');
        } else if (currentPage === 'about' && link.href.includes('rolunk.html') && !link.href.includes('#')) {
            link.classList.add('active');
        }
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}
