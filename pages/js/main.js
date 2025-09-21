// ===== MAIN JAVASCRIPT FILE =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== HEADER LOADER =====
    // Load header content and set active states
    loadHeader().then(() => {
        // Initialize mobile menu and dropdowns after header is loaded
        initMobileMenu();
        initDropdowns();
        
        // Handle anchor scrolling after page load
        handleAnchorScrolling();
    });
});

// ===== HEADER LOADER FUNCTIONS =====
function loadHeader() {
    console.log('loadHeader function called');
    // Get the current page name to determine active states
    const currentPage = getCurrentPageName();
    console.log('Current page:', currentPage);

    // Determine if we're in the English folder
    const isEnglish = window.location.pathname.includes('/en/');
    const imagePath = isEnglish ? '../images/logo.png' : 'images/logo.png';
    const langPath = isEnglish ? '../en/index.html' : 'en/index.html';
    const huPath = isEnglish ? '../weboldal.html' : 'weboldal.html';

    // Create header HTML directly (no fetch needed)
    const headerHTML = `
        <nav class="navbar">
            <div class="nav-container">
                       <div class="nav-logo">
                           <a href="${huPath}" class="nav-logo-link">
                               <img src="${imagePath}" alt="Sugallat Kft. Logo" class="logo">
                               <h2>Sugallat Kft.</h2>
                           </a>
                       </div>
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="weboldal.html" class="nav-link">Főoldal</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="szolgaltatasok.html" class="nav-link" onclick="window.location.href='szolgaltatasok.html'; return false;">Szolgáltatásaink</a>
                        <div class="dropdown-menu">
                            <a href="szolgaltatasok.html#kozbeszerzes" class="dropdown-link">Közbeszerzés</a>
                            <a href="szolgaltatasok.html#projektmenedzsment" class="dropdown-link">Projektmenedzsment</a>
                            <a href="szolgaltatasok.html#muszaki" class="dropdown-link">Műszaki tervezés</a>
                            <a href="szolgaltatasok.html#kornyezet" class="dropdown-link">Környezetgazdálkodás</a>
                        </div>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="arak.html" class="nav-link" onclick="window.location.href='arak.html'; return false;">Áraink</a>
                        <div class="dropdown-menu">
                            <a href="arak.html#kozbeszerzesi-dokumentumok" class="dropdown-link">Közbeszerzési dokumentumok</a>
                            <a href="arak.html#kozbeszerzesi-eljaras" class="dropdown-link">Közbeszerzési eljárás</a>
                            <a href="arak.html#egyeb-tevekenysegek" class="dropdown-link">Egyéb tevékenységek</a>
                            <a href="arak.html#mernoki-munkak" class="dropdown-link">Mérnöki munkák</a>
                            <a href="arak.html#hirdetmenyfigyeles" class="dropdown-link">Hirdetményfigyelés</a>
                            <a href="arak.html#arkepzes" class="dropdown-link">Árképzés</a>
                        </div>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="kapcsolat.html" class="nav-link" onclick="window.location.href='kapcsolat.html'; return false;">Kapcsolat</a>
                        <div class="dropdown-menu">
                            <a href="kapcsolat.html" class="dropdown-link">Elérhetőségeink</a>
                            <a href="kapcsolat.html#irjon-nekunk" class="dropdown-link">Kapcsolatfelvétel</a>
                            <a href="rolunk.html" class="dropdown-link">Rólunk</a>
                            <a href="rolunk.html#cegadatok" class="dropdown-link">Cégadatok</a>
                            <a href="referenciak.html" class="dropdown-link">Referenciák</a>
                        </div>
                    </li>
                </ul>
                       <div class="language-switcher">
                           <a href="${huPath}" class="lang-link ${isEnglish ? '' : 'active'}">HU</a>
                           <span class="lang-separator">|</span>
                           <a href="${langPath}" class="lang-link ${isEnglish ? 'active' : ''}">EN</a>
                       </div>
                <div class="hamburger">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
        </nav>
    `;
    
    console.log('Header HTML created');
    // Insert header into the placeholder div
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;
        console.log('Header inserted into placeholder');
    } else {
        // Fallback: insert before first section
        const firstSection = document.querySelector('section');
        if (firstSection) {
            firstSection.insertAdjacentHTML('beforebegin', headerHTML);
            console.log('Header inserted before first section');
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
            console.log('Header inserted at body start');
        }
    }
    
    // Set active states after header is loaded
    setActiveNavigation();
    setActiveDropdownLinks(currentPage);
    
    // Return resolved promise for compatibility
    return Promise.resolve();
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
        'szolgaltatasok.html': 'services',
        'referenciak.html': 'references'
    };
    
    return pageMap[filename] || 'home';
}

function setActiveNavigation() {
    const currentPage = getCurrentPageName();
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Set active class based on current page
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
        case 'references':
            const referencesLink = document.querySelector('a[href*="referenciak.html"]');
            if (referencesLink) referencesLink.classList.add('active');
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
        } else if (currentPage === 'references' && link.href.includes('referenciak.html')) {
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

function initDropdowns() {
    // Initialize dropdown functionality
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    
    dropdownItems.forEach(item => {
        const dropdownMenu = item.querySelector('.dropdown-menu');
        const navLink = item.querySelector('.nav-link');
        
        if (dropdownMenu && navLink) {
            // Toggle dropdown on click
            navLink.addEventListener('click', function(e) {
            e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdownItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                item.classList.toggle('active');
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-item.dropdown')) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// ===== ANCHOR SCROLLING FUNCTION =====
function handleAnchorScrolling() {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
        // Wait a bit for the page to fully render
        setTimeout(() => {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                // Scroll to the element with smooth behavior
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }
    
    // Also handle clicks on anchor links
    const anchorLinks = document.querySelectorAll('a[href*="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.includes('#')) {
                const [page, anchor] = href.split('#');
                const currentPage = window.location.pathname.split('/').pop();
                const targetPage = page.split('/').pop();
                
                // If it's the same page, scroll to anchor
                if (currentPage === targetPage || (!targetPage && currentPage === 'kapcsolat.html')) {
                    e.preventDefault();
                    const targetElement = document.querySelector('#' + anchor);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        });
    });
}