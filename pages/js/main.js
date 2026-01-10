// ===== MAIN JAVASCRIPT FILE =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== HEADER AND FOOTER LOADER =====
    // Load header and footer content
    Promise.all([loadHeader(), loadFooter()]).then(() => {
        // Initialize mobile menu and dropdowns after header is loaded
        initMobileMenu();
        initDropdowns();
        
        // Handle anchor scrolling after page load
        handleAnchorScrolling();
        
        // Load latest blogs for homepage
        loadLatestBlogs();
        
        // Initialize reference search if on references page
        initReferenceSearch();
        // Add horizontal scrollbar indicator for references table on mobile
        initReferenceTableScrollbar();
        
        // Initialize client marquee if on homepage
        initClientMarquee();
        
        // Initialize text galleries
        initTextGalleries();
        
        // Initialize lightweight canvas background squares
        loadScriptOnce('pages/js/square-background.js').then(() => {
            initCanvasBackgrounds();
        });
        
        // Initialize FAQ Accordion if present
        initFaqAccordion();
        
        // Init sticky CTA visibility after essentials
        initStickyCta();
    }).catch(function(error) {
        // Fallback: at least try to load header if Promise fails
        loadHeader();
        loadFooter();
    });
});

// Sticky CTA controller
function initStickyCta() {
    const hero = document.querySelector('.hero');
    let sticky = document.querySelector('.sticky-cta');
    let fab = document.querySelector('.sticky-cta-fab');
    const inlineCta = document.getElementById('inline-cta');
    let isHeroVisible = true;
    let isInlineCtaInView = false;
    let isMinimized = false;
    // Mobile-only guard: if not mobile, hide and exit; also react to resize
    const mq = window.matchMedia('(max-width: 768px)');
    const applyViewportRules = () => {
        if (!mq.matches) {
            if (sticky) { sticky.classList.remove('show'); sticky.style.display = 'none'; }
            if (fab) { fab.classList.remove('show'); fab.style.display = 'none'; }
            return false;
        } else {
            if (sticky) { sticky.style.display = ''; }
            if (fab) { fab.style.display = ''; }
            return true;
        }
    };
    if (!applyViewportRules()) return;

    // If on mobile and sticky CTA markup is not present, create it dynamically (keeps desktop clean)
    if (!sticky) {
        const isEnglish = window.location.pathname.includes('/pages/en/');
        const wrapper = document.createElement('div');
        wrapper.className = 'sticky-cta';
        wrapper.innerHTML = `
            <div class="sticky-cta-inner">
                <div class="cta-copy">
                    <div class="cta-title">${isEnglish ? 'Request a Quote' : 'Kérdése van?'}</div>
                    <div class="cta-note">${isEnglish ? 'Contact us to discuss how we can best support your project.' : 'Vegye fel velünk a kapcsolatot, és beszéljük meg, hogyan tudjuk legjobban támogatni projektjét.'}</div>
                </div>
                <div class="cta-actions">
                    <a href="${isEnglish ? 'pricing.html' : 'arak.html'}" class="btn btn-outline">${isEnglish ? 'Pricing' : 'Áraink'}</a>
                    <a href="${isEnglish ? 'contact.html' : 'kapcsolat.html'}" class="btn btn-primary">${isEnglish ? 'Contact' : 'Ajánlatkérés'}</a>
                </div>
                <button class="cta-minimize" aria-label="${isEnglish ? 'Minimize' : 'Minimalizálás'}">−</button>
            </div>`;
        document.body.appendChild(wrapper);
        const fabBtn = document.createElement('button');
        fabBtn.className = 'sticky-cta-fab';
        fabBtn.setAttribute('aria-label', isEnglish ? 'Reopen contact' : 'Kapcsolat újranyitása');
        fabBtn.title = isEnglish ? 'Contact' : 'Kapcsolat';
        fabBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>';
        document.body.appendChild(fabBtn);
        // Refresh refs
        sticky = document.querySelector('.sticky-cta');
        fab = document.querySelector('.sticky-cta-fab');
    }
    mq.addEventListener('change', applyViewportRules);
    if (!hero || !sticky) return;
    // Helper to control FAB visibility consistently
    const updateFabVisibility = () => {
        if (!fab) return;
        const shouldShowFab = isMinimized && mq.matches && !isHeroVisible && !isInlineCtaInView;
        if (shouldShowFab) {
            fab.classList.add('show');
        } else {
            fab.classList.remove('show');
        }
    };
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible) {
                sticky.classList.remove('show');
            } else if (!isMinimized && !isInlineCtaInView) {
                sticky.classList.add('show');
            }
            updateFabVisibility();
        });
    }, { threshold: 0.1 });
    observer.observe(hero);
    // Minimize button toggles to FAB
    const minimizeBtn = sticky.querySelector('.cta-minimize');
    if (minimizeBtn && fab) {
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMinimized = true;
            sticky.classList.remove('show');
            updateFabVisibility();
        });
        fab.addEventListener('click', () => {
            isMinimized = false;
            fab.classList.remove('show');
            if (!isHeroVisible && !isInlineCtaInView) {
                sticky.classList.add('show');
            }
        });
    }
    // Clicking bar restores full view if minimized
    sticky.addEventListener('click', (e) => {
        // Ignore if user clicked primary button (it navigates)
        if (e.target.closest('.btn')) return;
        sticky.classList.remove('minimized');
        sticky.classList.add('show');
    });

    // Hide sticky CTA when inline CTA enters viewport; show again when out
    if (inlineCta) {
        const inlineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isInlineCtaInView = entry.isIntersecting;
                if (isInlineCtaInView) {
                    sticky.classList.remove('show');
                } else if (!isHeroVisible && !isMinimized) {
                    sticky.classList.add('show');
                }
                updateFabVisibility();
            });
        }, { threshold: 0.3 });
        inlineObserver.observe(inlineCta);
    }
}

// ===== HEADER LOADER FUNCTIONS =====
function loadHeader() {
    // Get the current page name to determine active states
    const currentPage = getCurrentPageName();

    // Determine if we're in the English folder or a subdirectory
    const isEnglish = window.location.pathname.includes('/pages/en/');
    const inSubdirectory = window.location.pathname.includes('/pages/blog/') || window.location.pathname.includes('/pages/en/');
    
    // Detect environment: localhost/GitHub Pages need .html, production doesn't
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    const needsHtmlExtension = isLocalhost || isGitHubPages;
    
    // Set paths based on current location
    const pathPrefix = inSubdirectory ? '../../' : '';
    const imagePath = inSubdirectory ? '../../pages/images/logo.svg' : 'pages/images/logo.svg';
    const langPath = isEnglish ? '../pages/en/' : (inSubdirectory ? '../pages/en/' : 'pages/en/');
    const huPath = isEnglish ? '../../' : (inSubdirectory ? '../../' : '');
    
    // Smart logo paths that work in both environments
    const logoPath = isEnglish ? 
        (inSubdirectory ? '../pages/en/' + (needsHtmlExtension ? 'index.html' : '') : 'pages/en/' + (needsHtmlExtension ? 'index.html' : '')) : 
        (inSubdirectory ? '../../' + (needsHtmlExtension ? 'index.html' : '') : (needsHtmlExtension ? 'index.html' : ''));
    
    // Helper function to add .html extension when needed
    const smartUrl = (baseUrl) => needsHtmlExtension && !baseUrl.includes('.html') && !baseUrl.includes('#') ? baseUrl + '.html' : baseUrl;
    
    // Pre-calculate smart URLs for navigation
    const servicesUrl = smartUrl(pathPrefix + 'services');
    const pricesUrl = smartUrl(pathPrefix + 'prices'); 
    const contactUrl = smartUrl(pathPrefix + 'contact');
    const aboutUrl = smartUrl(pathPrefix + 'about');
    const referencesUrl = smartUrl(pathPrefix + 'references');
    const tevekenysegeinkUrl = smartUrl(pathPrefix + 'tevekenysegeink');
    const arakUrl = smartUrl(pathPrefix + 'arak');
    const kapcsolatUrl = smartUrl(pathPrefix + 'kapcsolat');
    const bemutatkozasUrl = smartUrl(pathPrefix + 'bemutatkozas');
    const referenciakUrl = smartUrl(pathPrefix + 'referenciak');
    const hasznoslinkekUrl = smartUrl(pathPrefix + 'hasznos-linkek');
    const blogUrl = smartUrl(pathPrefix + 'blog');
    const adatkezelesiUrl = smartUrl(pathPrefix + 'adatkezelesi-tajekoztato');
    const sitemapUrl = smartUrl(pathPrefix + 'sitemap');
    
    // Homepage URLs (use logoPath logic)
    const homeUrl = isEnglish ? 
        (inSubdirectory ? '../pages/en/' + (needsHtmlExtension ? 'index.html' : '') : 'pages/en/' + (needsHtmlExtension ? 'index.html' : '')) : 
        (inSubdirectory ? '../../' + (needsHtmlExtension ? 'index.html' : '') : (needsHtmlExtension ? 'index.html' : ''));

    // Create header HTML based on language
    let headerHTML;
    
    if (isEnglish) {
        // English navigation
        headerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <a href="${logoPath}" class="nav-logo-link">
                            <img src="${imagePath}" alt="Sugallat Ltd. Logo" class="logo">
                            <h2>Sugallat Ltd.</h2>
                        </a>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a href="${homeUrl}" class="nav-link">Home</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${servicesUrl}" class="nav-link">Our Services</a>
                            <div class="dropdown-menu">
                                <a href="${servicesUrl}#public-procurement" class="dropdown-link">Public Procurement</a>
                                <a href="${servicesUrl}#project-management" class="dropdown-link">Project Management</a>
                                <a href="${servicesUrl}#technical-design" class="dropdown-link">Technical Design</a>
                                <a href="${servicesUrl}#environmental" class="dropdown-link">Environmental Management</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pricesUrl}" class="nav-link">Pricing</a>
                            <div class="dropdown-menu">
                                <a href="${pricesUrl}#procurement-documents" class="dropdown-link">Procurement Documents</a>
                                <a href="${pricesUrl}#procurement-procedures" class="dropdown-link">Procurement Procedures</a>
                                <a href="${pricesUrl}#other-activities" class="dropdown-link">Other Activities</a>
                                <a href="${pricesUrl}#engineering-work" class="dropdown-link">Engineering Work</a>
                                <a href="${pricesUrl}#tender-monitoring" class="dropdown-link">Tender Monitoring</a>
                                <a href="${pricesUrl}#pricing" class="dropdown-link">Pricing</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${contactUrl}" class="nav-link">Contact</a>
                            <div class="dropdown-menu">
                                <a href="${contactUrl}" class="dropdown-link">Contact Information</a>
                                <a href="${contactUrl}#write-to-us" class="dropdown-link">Write to Us</a>
                                <a href="${aboutUrl}" class="dropdown-link">About Us</a>
                                <a href="${aboutUrl}#company-data" class="dropdown-link">Company Data</a>
                                <a href="${referencesUrl}" class="dropdown-link">References</a>
                            </div>
                        </li>
                    </ul>
                    <div class="language-switcher">
                        <a href="#" class="lang-link" onclick="switchToLanguage('hu'); return false;">HU</a>
                        <span class="lang-separator">|</span>
                        <a href="#" class="lang-link active" onclick="switchToLanguage('en'); return false;">EN</a>
                    </div>
                    <div class="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        `;
    } else {
        // Hungarian navigation (existing)
        headerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <a href="${logoPath}" class="nav-logo-link">
                            <img src="${imagePath}" alt="Sugallat Kft. Logo" class="logo">
                            <h2>Sugallat Kft.</h2>
                        </a>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a href="${homeUrl}" class="nav-link">Főoldal</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${tevekenysegeinkUrl}" class="nav-link">Szolgáltatásaink</a>
                            <div class="dropdown-menu">
                                <a href="${tevekenysegeinkUrl}#kozbeszerzes" class="dropdown-link">Közbeszerzés</a>
                                <a href="${tevekenysegeinkUrl}#projektmenedzsment" class="dropdown-link">Projektmenedzsment</a>
                                <a href="${tevekenysegeinkUrl}#muszaki" class="dropdown-link">Műszaki tervezés</a>
                                <a href="${tevekenysegeinkUrl}#kornyezet" class="dropdown-link">Környezetgazdálkodás</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${arakUrl}" class="nav-link">Áraink</a>
                            <div class="dropdown-menu">
                                <a href="${arakUrl}#kozbeszerzesi-dokumentumok" class="dropdown-link">Közbeszerzési dokumentumok</a>
                                <a href="${arakUrl}#kozbeszerzesi-eljaras" class="dropdown-link">Közbeszerzési eljárás</a>
                                <a href="${arakUrl}#egyeb-tevekenysegek" class="dropdown-link">Egyéb tevékenységek</a>
                                <a href="${arakUrl}#mernoki-munkak" class="dropdown-link">Mérnöki munkák</a>
                                <a href="${arakUrl}#hirdetmenyfigyeles" class="dropdown-link">Hirdetményfigyelés</a>
                                <a href="${arakUrl}#arkepzes" class="dropdown-link">Árképzés</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${kapcsolatUrl}" class="nav-link">Kapcsolat</a>
                            <div class="dropdown-menu">
                                <a href="${kapcsolatUrl}" class="dropdown-link">Elérhetőségeink</a>
                                <a href="${kapcsolatUrl}#irjon-nekunk" class="dropdown-link">Kapcsolatfelvétel</a>
                                <a href="${bemutatkozasUrl}" class="dropdown-link">Rólunk</a>
                                <a href="${bemutatkozasUrl}#cegadatok" class="dropdown-link">Cégadatok</a>
                            <a href="${referenciakUrl}" class="dropdown-link">Ügyfeleink</a>
                            </div>
                        </li>
                    </ul>
                    <div class="language-switcher">
                        <a href="#" class="lang-link active" onclick="switchToLanguage('hu'); return false;">HU</a>
                        <span class="lang-separator">|</span>
                        <a href="#" class="lang-link" onclick="switchToLanguage('en'); return false;">EN</a>
                    </div>
                    <div class="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
            
            <!-- Mobile Secondary Navigation -->
            <div class="mobile-secondary-nav" id="mobileSecondaryNav">
                <div class="mobile-nav-back" onclick="closeMobileSecondaryNav()">Vissza</div>
                <ul class="mobile-secondary-menu" id="mobileSecondaryMenu">
                    <!-- Dynamic content will be inserted here -->
                </ul>
            </div>
        `;
    }
    // Insert header into the placeholder div
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;
    } else {
        // Fallback: insert before first section
        const firstSection = document.querySelector('section');
        if (firstSection) {
            firstSection.insertAdjacentHTML('beforebegin', headerHTML);
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
    
    // Add event listeners to language switcher buttons
    setTimeout(() => {
        const langLinks = document.querySelectorAll('.lang-link');
        langLinks.forEach((link, index) => {
            const isHU = link.textContent.trim() === 'HU';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchToLanguage(isHU ? 'hu' : 'en');
            });
        });
    }, 100);
    
    // Set active states after header is loaded
    setActiveNavigation();
    setActiveDropdownLinks(currentPage);
    
    // Return resolved promise for compatibility
    return Promise.resolve();
}

// ===== FOOTER LOADER FUNCTIONS =====
function loadFooter() {
    // Square patterns CSS is loaded statically in HTML
    
    // Determine if we're in a subdirectory for proper path handling
    const inSubdirectory = window.location.pathname.includes('/blog/') || window.location.pathname.includes('/en/');
    const isEnglish = window.location.pathname.includes('/en/');
    
    // Detect environment: localhost/GitHub Pages need .html, production doesn't
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    const needsHtmlExtension = isLocalhost || isGitHubPages;
    
    // Set paths based on current location
    const pathPrefix = inSubdirectory ? '../' : '';
    
    // Helper function to add .html extension when needed
    const smartUrl = (baseUrl) => needsHtmlExtension && !baseUrl.includes('.html') && !baseUrl.includes('#') ? baseUrl + '.html' : baseUrl;
    
    // Pre-calculate smart URLs for footer navigation
    const szolgaltatasokUrl = smartUrl(pathPrefix + 'szolgaltatasok');
    const linkekUrl = smartUrl(pathPrefix + 'linkek');
    const referenciakUrl = smartUrl(pathPrefix + 'referenciak');
    const rolunkUrl = smartUrl(pathPrefix + 'rolunk');
    const blogUrl = smartUrl(pathPrefix + 'blog');
    const adatkezelesiUrl = smartUrl(pathPrefix + 'adatkezelesi-tajekoztato');
    const sitemapUrl = smartUrl(pathPrefix + 'sitemap');
    
    // Create footer HTML with proper paths
    const footerHTML = `
        <!-- Footer -->
        <footer class="footer has-square-patterns">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Sugallat Kft.</h3>
                        <p>Szakmai szolgáltatások a legmagasabb színvonalon</p>
                    </div>
                    <div class="footer-section">
                        <h4>Szolgáltatásaink</h4>
                        <ul>
                            <li><a href="${szolgaltatasokUrl}#kozbeszerzes">Közbeszerzés</a></li>
                            <li><a href="${szolgaltatasokUrl}#projektmenedzsment">Projektmenedzsment</a></li>
                            <li><a href="${szolgaltatasokUrl}#muszaki">Műszaki tervezés</a></li>
                            <li><a href="${szolgaltatasokUrl}#kornyezet">Környezetgazdálkodás</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Kapcsolat</h4>
                        <p>2461 Tárnok, Ősz u. 12.</p>
                        <p>Tel/fax: +36-23-333-853</p>
                        <p>Mobil: +36-20-424-5411</p>
                        <p>E-mail: <a href="mailto:benko@sugallat.hu">benko@sugallat.hu</a></p>
                    </div>
                    <div class="footer-section">
                        <h4>Hasznos linkek</h4>
                        <ul>
                            <li><a href="${linkekUrl}">Hasznos linkek</a></li>
                            <li><a href="${referenciakUrl}">Referenciák</a></li>
                            <li><a href="${rolunkUrl}">Rólunk</a></li>
                            <li><a href="${blogUrl}">Blog</a></li>
                            <li><a href="${adatkezelesiUrl}">Adatkezelési tájékoztató</a></li>
                            <li><a href="${adatkezelesiUrl}#cookie-policy">Cookie szabályzat</a></li>
                            <li><a href="${sitemapUrl}">Oldaltérkép</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Kövess minket</h4>
                        <div class="social-links">
                            <a href="https://www.facebook.com/sugallatkft/" target="_blank" class="social-link">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2025 Sugallat Kft. Minden jog fenntartva.</p>
                </div>
            </div>
        </footer>
    `;// Insert footer into the placeholder div
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    } else {
        // Fallback: append to body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
    
    // Return resolved promise for compatibility
    return Promise.resolve();
}

function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();// Map filenames to page identifiers
    const pageMap = {
        'index.html': 'home',
        'index.html': 'home',
        'kapcsolat.html': 'contact',
        'bemutatkozas.html': 'about',
        'arak.html': 'pricing',
        'tevekenysegeink.html': 'services',
        'referenciak.html': 'references',
        'blog.html': 'blog'
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
            const homeLink = document.querySelector('.nav-link[href*="index.html"], .nav-link[href*="index.html"]');
            if (homeLink) homeLink.classList.add('active');
            break;
        case 'contact':
            const contactLink = document.querySelector('.nav-link[href*="kapcsolat.html"]');
            if (contactLink) contactLink.classList.add('active');
            break;
        case 'about':
            const aboutLink = document.querySelector('.nav-link[href*="bemutatkozas.html"]');
            if (aboutLink) aboutLink.classList.add('active');
            break;
        case 'pricing':
            const pricingLink = document.querySelector('.nav-link[href*="arak.html"]');
            if (pricingLink) pricingLink.classList.add('active');
            break;
        case 'services':
            const servicesLink = document.querySelector('.nav-link[href*="tevekenysegeink.html"]');
            if (servicesLink) servicesLink.classList.add('active');
            break;
        case 'references':
            const referencesLink = document.querySelector('.nav-link[href*="referenciak.html"]');
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
        } else if (currentPage === 'about' && link.href.includes('bemutatkozas.html') && !link.href.includes('#')) {
            link.classList.add('active');
        } else if (currentPage === 'references' && link.href.includes('referenciak.html')) {
            link.classList.add('active');
        }
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const secondaryNav = document.getElementById('mobileSecondaryNav');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            const isActive = hamburger.classList.contains('active');
            
            if (isActive) {
                // Close all mobile navigation
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                if (secondaryNav) secondaryNav.classList.remove('active');
            } else {
                // Open main mobile navigation
                hamburger.classList.add('active');
                navMenu.classList.add('active');
                if (secondaryNav) secondaryNav.classList.remove('active');
            }
        });

        // Close mobile menu when clicking on non-dropdown nav links
        const nonDropdownNavLinks = document.querySelectorAll('.nav-link:not(.nav-item.dropdown .nav-link)');
        nonDropdownNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                if (secondaryNav) secondaryNav.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking on secondary nav links
        document.addEventListener('click', function(e) {
            if (e.target.closest('.mobile-secondary-menu .nav-link')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                if (secondaryNav) secondaryNav.classList.remove('active');
            }
        });
    }
}

// Mobile Secondary Navigation Functions
function openMobileSecondaryNav(menuData) {
    const secondaryNav = document.getElementById('mobileSecondaryNav');
    const secondaryMenu = document.getElementById('mobileSecondaryMenu');
    const mainNav = document.querySelector('.nav-menu');
    
    if (secondaryNav && secondaryMenu) {
        // Clear existing menu items
        secondaryMenu.innerHTML = '';
        
        // Special handling for "Kapcsolat" menu - put "Elérhetőségeink" first on mobile
        if (menuData.mainTitle === 'Kapcsolat') {
            // Add sub-items first (Elérhetőségeink will be first)
            menuData.subItems.forEach(subItem => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${subItem.url}" class="nav-link">${subItem.title}</a>`;
                secondaryMenu.appendChild(li);
            });
        } else {
            // Default behavior for other menus: main link first, then sub-items
            const mainItem = document.createElement('li');
            mainItem.innerHTML = `<a href="${menuData.mainUrl}" class="nav-link">${menuData.mainTitle}</a>`;
            secondaryMenu.appendChild(mainItem);
            
            // Add sub-items
            menuData.subItems.forEach(subItem => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${subItem.url}" class="nav-link">${subItem.title}</a>`;
                secondaryMenu.appendChild(li);
            });
        }
        
        // Hide main nav and show secondary nav
        mainNav.classList.remove('active');
        secondaryNav.classList.add('active');
    }
}

function closeMobileSecondaryNav() {
    const secondaryNav = document.getElementById('mobileSecondaryNav');
    const mainNav = document.querySelector('.nav-menu');
    
    if (secondaryNav && mainNav) {
        secondaryNav.classList.remove('active');
        mainNav.classList.add('active');
    }
}

function initDropdowns() {
    // Initialize dropdown functionality
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    
    dropdownItems.forEach(item => {
        const dropdownMenu = item.querySelector('.dropdown-menu');
        const navLink = item.querySelector('.nav-link');
        
        if (dropdownMenu && navLink) {
            // Track if dropdown was clicked before for mobile behavior
            let dropdownClickCount = 0;
            
            // Handle dropdown navigation clicks
            navLink.addEventListener('click', function(e) {
                // Check if we're on mobile (screen width or if hamburger menu is visible)
                const isMobile = window.innerWidth <= 768 || document.querySelector('.hamburger').offsetParent !== null;
                
                if (isMobile) {
                    // On mobile, prevent default navigation and open secondary nav
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get dropdown menu data
                    const dropdownLinks = item.querySelectorAll('.dropdown-link');
                    const menuData = {
                        mainTitle: navLink.textContent,
                        mainUrl: navLink.getAttribute('href'),
                        subItems: Array.from(dropdownLinks).map(link => ({
                            title: link.textContent,
                            url: link.getAttribute('href')
                        }))
                    };
                    
                    // Open secondary navigation
                    openMobileSecondaryNav(menuData);
                } else {
                    // Desktop behavior: check if nav link is active (current page)
                    const isActivePage = navLink.classList.contains('active');
                    
                    if (isActivePage) {
                        // If on current page, prevent navigation and toggle dropdown instead
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Toggle dropdown for current page
                        const isDropdownOpen = item.classList.contains('active');
                        
                        // Close all other dropdowns first
                        dropdownItems.forEach(otherItem => {
                            otherItem.classList.remove('active');
                        });
                        
                        // Toggle current dropdown
                        if (!isDropdownOpen) {
                            item.classList.add('active');
                        }
                    } else {
                        // Not on current page - allow normal navigation
                        // Just close any open dropdowns when clicking main nav
                        dropdownItems.forEach(otherItem => {
                            otherItem.classList.remove('active');
                        });
                    }
                }
            });
            
            // Handle dropdown menu item clicks
            const dropdownLinks = item.querySelectorAll('.dropdown-link');
            dropdownLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    // Allow normal navigation for dropdown items
                    // Close dropdown after click
                    item.classList.remove('active');
                    
                    // Close mobile menu if open
                    const hamburger = document.querySelector('.hamburger');
                    const navMenu = document.querySelector('.nav-menu');
                    if (hamburger && navMenu) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                });
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

// ===== SMART LANGUAGE SWITCHER =====
function switchToLanguage(targetLang) {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    // Detect if currently on English page
    const isCurrentlyEnglish = currentPath.includes('/en/') || 
        (currentPath.includes('/blog/') && (
            currentPage === 'procurement-changes-2024.html' ||
            currentPage === 'eu-grants-success-tips.html' ||
            currentPage === 'environmental-impact-assessment-guide.html'
        ));// Define page mappings between Hungarian and English
    const pageMapping = {
        // Hungarian to English
        'index.html': 'en/index.html',
        'kapcsolat.html': 'en/contact.html', 
        'blog.html': 'en/blog.html',
        
        // English to Hungarian (reverse mapping)
        'index.html': '../index.html',
        'contact.html': '../kapcsolat.html',
        'blog.html': '../blog.html'
    };
    
    // Blog post mappings
    const blogMapping = {
        // Hungarian to English
        'kozbeszerzes-valtozasok-2024.html': 'procurement-changes-2024.html',
        'eu-palyazatok-sikeres-beadasa.html': 'eu-grants-success-tips.html',
        'kornyezeti-hatastanulmany-keszitese.html': 'environmental-impact-assessment-guide.html',
        
        // English to Hungarian (reverse mapping)
        'procurement-changes-2024.html': 'kozbeszerzes-valtozasok-2024.html',
        'eu-grants-success-tips.html': 'eu-palyazatok-sikeres-beadasa.html',
        'environmental-impact-assessment-guide.html': 'kornyezeti-hatastanulmany-keszitese.html'
    };
    
    let targetUrl = null;
    
    // Early return if clicking same language
    if ((targetLang === 'hu' && !isCurrentlyEnglish) || (targetLang === 'en' && isCurrentlyEnglish)) {
        return;
    }
    
    // Check if we're on a blog post
    if (currentPath.includes('/blog/')) {
        if (targetLang === 'en' && !isCurrentlyEnglish) {
            // Hungarian blog post to English
            if (blogMapping[currentPage]) {
                targetUrl = 'blog/' + blogMapping[currentPage];
            }
        } else if (targetLang === 'hu' && isCurrentlyEnglish) {
            // English blog post to Hungarian
            if (blogMapping[currentPage]) {
                targetUrl = 'blog/' + blogMapping[currentPage];
            }
        }
    } else {
        // Regular pages
        if (targetLang === 'hu' && isCurrentlyEnglish) {
            // Switching from English to Hungarian
            if (pageMapping[currentPage]) {
                targetUrl = pageMapping[currentPage];
            }
        } else if (targetLang === 'en' && !isCurrentlyEnglish) {
            // Switching from Hungarian to English
            if (pageMapping[currentPage]) {
                targetUrl = pageMapping[currentPage];
            }
        }
    }
    
    // If we found a translation, navigate to it
    if (targetUrl) {
        try {
            window.location.href = targetUrl;
        } catch (error) {
            console.error('Navigation error:', error);
        }
    } else {
        // Fallback to default pages if no translation exists
        let fallbackUrl;
        if (targetLang === 'hu') {
            fallbackUrl = isCurrentlyEnglish ? '../index.html' : 'index.html';
        } else {
            fallbackUrl = isCurrentlyEnglish ? 'index.html' : 'en/index.html';
        }
        try {
            window.location.href = fallbackUrl;
        } catch (error) {
            console.error('Fallback navigation error:', error);
        }
    }
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

// ===== BLOG LOADING FUNCTIONS =====
function loadLatestBlogs() {// Determine if we're in the English version
    const isEnglish = window.location.pathname.includes('/en/');
    
    // Define blog data based on language
    let blogData;
    
    if (isEnglish) {
        // English blog data
        blogData = [
            {
                title: 'Public Procurement Changes in 2024: What to Expect?',
                description: 'The new year has brought significant changes to public procurement procedures. We summarize the most important modifications and their practical implications.',
                category: 'Public Procurement',
                date: '2024-03-15',
                author: 'Sugallat Kft.',
                readTime: 0,
                url: '../blog/procurement-changes-2024.html'
            },
            {
                title: '5 Tips for Successful EU Grant Applications',
                description: 'How to prepare a winning EU grant application? Practical advice and proven methods based on our experts\' 25 years of experience.',
                category: 'Project Management',
                date: '2024-03-08',
                author: 'Sugallat Kft.',
                readTime: 0,
                url: '../blog/eu-grants-success-tips.html'
            },
            {
                title: 'Environmental Impact Assessment: Step by Step',
                description: 'When is an environmental impact assessment required and how is it prepared? Detailed guide to the process, required documents and deadlines.',
                category: 'Environmental',
                date: '2024-02-28',
                author: 'Sugallat Kft.',
                readTime: 0,
                url: '../blog/environmental-impact-assessment-guide.html'
            }
        ];
    } else {
        // Hungarian blog data
        blogData = [
            {
                title: 'Közbeszerzési változások 2024-ben: Mire számíthatunk?',
                description: 'Az új év jelentős változásokat hozott a közbeszerzési eljárások területén. Összefoglaljuk a legfontosabb módosításokat és azok gyakorlati hatásait.',
                category: 'Közbeszerzés',
                date: '2024-03-15',
                author: 'Sugallat Kft.',
                readTime: 0,
                url: 'blog/kozbeszerzes-valtozasok-2024.html'
            },
            {
                title: '5 tipp az EU pályázatok sikeres benyújtásához',
                description: 'Hogyan készítsünk fel egy nyertes EU pályázatot? Szakértőink 25 éves tapasztalata alapján összeállított praktikus tanácsok és bevált módszerek.',
                category: 'Projektmenedzsment',
                date: '2024-03-08',
                author: 'Sugallat Kft.',
                readTime: 0,
                url: 'blog/eu-palyazatok-sikeres-beadasa.html'
            },
            {
                title: 'Környezeti hatástanulmány készítése: Lépésről lépésre',
                description: 'Mikor szükséges környezeti hatástanulmány és hogyan készül? Részletes útmutató a folyamatról, szükséges dokumentumokról és határidőkről.',
                category: 'Környezetvédelem',
                date: '2024-02-28',
                author: 'Sugallat Kft.',
                readTime: 0,
                url: 'blog/kornyezeti-hatastanulmany-keszitese.html'
            }
        ];
    }
    
    // Check for both homepage and blog page grids
    const homepageGrid = document.querySelector('.blog-preview-grid');
    const blogGrid = document.querySelector('.blog-grid');
    
    if (!homepageGrid && !blogGrid) return;
    
    // Create cards for each blog
    blogData.forEach(blog => {
        try {
            // Create cards for both pages
            if (homepageGrid) {
                const homepageCard = createBlogCard(blog, blog.url, 'homepage');
                homepageGrid.appendChild(homepageCard);
            }
            if (blogGrid) {
                const blogCard = createBlogCard(blog, blog.url, 'blog');
                blogGrid.appendChild(blogCard);
            }
        } catch (error) {}
    });
}

async function fetchBlogMetadata(blogPath) {
    try {const response = await fetch(blogPath);if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();// Create a temporary DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract metadata
        const title = doc.querySelector('title')?.textContent || '';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const category = doc.querySelector('meta[name="blog-category"]')?.getAttribute('content') || '';
        const date = doc.querySelector('meta[name="blog-date"]')?.getAttribute('content') || '';
        const author = doc.querySelector('meta[name="blog-author"]')?.getAttribute('content') || '';
        
        // Calculate read time from content
        const content = doc.querySelector('.blog-content')?.textContent || '';
        const cleanContent = content.replace(/\s+/g, ' ').trim();
        const wordCount = cleanContent.length > 0 ? cleanContent.split(' ').filter(word => word.length > 0).length : 0;
        
        // Calculate read time (200 words per minute average)
        let readTime = 0;
        if (wordCount > 10) { // Only show read time if there's substantial content
            readTime = Math.max(1, Math.ceil(wordCount / 200));
        }
        
        return {
            title,
            description,
            category,
            date,
            author,
            readTime,
            wordCount,
            url: blogPath
        };
    } catch (error) {return null;
    }
}

function createBlogCard(blogData, blogPath, pageType = 'homepage') {
    const article = document.createElement('article');
    
    // Format date
    const formattedDate = formatBlogDate(blogData.date);
    
    // Create read time text based on language
    const isEnglish = window.location.pathname.includes('/en/');
    const readTimeText = blogData.readTime === 0 
        ? (isEnglish ? 'Coming Soon' : 'Hamarosan') 
        : (isEnglish ? `${blogData.readTime} min read` : `${blogData.readTime} perc olvasás`);
    
    if (pageType === 'blog') {
        // Blog page style
        article.className = 'blog-card';
        article.innerHTML = `
            <div class="blog-card-content">
                <div class="blog-category">${blogData.category}</div>
                <div class="blog-meta">
                    <span class="blog-date">${formattedDate}</span>
                    <span class="blog-read-time">${readTimeText}</span>
                </div>
                <h2 class="blog-title">
                    <a href="${blogData.url}">${blogData.title}</a>
                </h2>
                <p class="blog-excerpt">${blogData.description}</p>
                <a href="${blogData.url}" class="blog-read-more">${isEnglish ? 'Read More →' : 'Tovább olvasom →'}</a>
            </div>
        `;
    } else {
        // Homepage style
        article.className = 'blog-preview-card';
        article.innerHTML = `
            <div class="blog-preview-content">
                <div class="blog-preview-category">${blogData.category}</div>
                <div class="blog-preview-meta">${formattedDate} • ${readTimeText}</div>
                <h3 class="blog-preview-title">
                    <a href="${blogData.url}">${blogData.title}</a>
                </h3>
                <p class="blog-preview-excerpt">${blogData.description}</p>
                <a href="${blogData.url}" class="blog-preview-read-more">${isEnglish ? 'Read More →' : 'Tovább olvasom →'}</a>
            </div>
        `;
    }
    
    return article;
}

function formatBlogDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const months = [
            'január', 'február', 'március', 'április', 'május', 'június',
            'július', 'augusztus', 'szeptember', 'október', 'november', 'december'
        ];
        
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        const day = date.getDate();
        
        return `${year}. ${month} ${day}.`;
    } catch (error) {
        return dateString;
    }
}

// ===== REFERENCE SEARCH FUNCTIONALITY =====
function initReferenceSearch() {
    const searchInput = document.getElementById('reference-search');
    if (!searchInput) return; // Only run on references page
    
    const referenceTable = document.querySelector('.reference-table tbody');
    if (!referenceTable) return;
    
    const allRows = Array.from(referenceTable.querySelectorAll('tr'));
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show all rows when search is empty
            allRows.forEach(row => {
                row.style.display = '';
                // Reset rowspan for category headers
                if (row.classList.contains('category-header')) {
                    const firstCell = row.querySelector('td:first-child');
                    if (firstCell && firstCell.hasAttribute('data-original-rowspan')) {
                        firstCell.rowSpan = parseInt(firstCell.getAttribute('data-original-rowspan'));
                    }
                }
            });
            return;
        }
        
        // Group rows by category for proper handling of rowspan
        let currentCategoryRows = [];
        let currentCategoryHeader = null;
        let matchingRowsInCategory = 0;
        
        allRows.forEach((row, index) => {
            if (row.classList.contains('category-header')) {
                // Process previous category if exists
                if (currentCategoryHeader) {
                    processCategoryVisibility(currentCategoryHeader, currentCategoryRows, matchingRowsInCategory);
                }
                
                // Start new category
                currentCategoryHeader = row;
                currentCategoryRows = [];
                matchingRowsInCategory = 0;
                
                // Check if category header matches search
                const categoryOrgCell = row.querySelector('td:nth-child(2)');
                if (categoryOrgCell && categoryOrgCell.textContent.toLowerCase().includes(searchTerm)) {
                    matchingRowsInCategory++;
                }
            } else {
                // Regular row
                currentCategoryRows.push(row);
                const orgCell = row.querySelector('td:nth-child(1)');
                if (orgCell && orgCell.textContent.toLowerCase().includes(searchTerm)) {
                    matchingRowsInCategory++;
                }
            }
            
            // Process last category
            if (index === allRows.length - 1 && currentCategoryHeader) {
                processCategoryVisibility(currentCategoryHeader, currentCategoryRows, matchingRowsInCategory);
            }
        });
    });
    
    // Helper function to handle category visibility
    function processCategoryVisibility(categoryHeader, categoryRows, matchingCount) {
        if (matchingCount > 0) {
            // Show category header and all its rows
            categoryHeader.style.display = '';
            categoryRows.forEach(row => row.style.display = '');
            
            // Adjust rowspan to match visible rows
            const firstCell = categoryHeader.querySelector('td:first-child');
            if (firstCell) {
                // Store original rowspan if not already stored
                if (!firstCell.hasAttribute('data-original-rowspan')) {
                    firstCell.setAttribute('data-original-rowspan', firstCell.rowSpan);
                }
                firstCell.rowSpan = categoryRows.length + 1; // +1 for the header row itself
            }
        } else {
            // Hide entire category
            categoryHeader.style.display = 'none';
            categoryRows.forEach(row => row.style.display = 'none');
        }
    }
    
    // Clear search functionality (ESC key)
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input')); // Trigger the search to show all rows
        }
    });
}

// ===== HORIZONTAL SCROLLBAR INDICATOR FOR REFERENCES TABLE =====
function initReferenceTableScrollbar() {
    const container = document.querySelector('.reference-table-container');
    if (!container) return; // Only on references page

    // Create indicator elements (fixed to viewport bottom)
    const bar = document.createElement('div');
    bar.className = 'reference-scrollbar fixed';
    const thumb = document.createElement('div');
    thumb.className = 'reference-scrollbar-thumb';
    bar.appendChild(thumb);
    
    // Insert into body so it can be fixed-positioned
    document.body.appendChild(bar);

    // Update thumb size and position based on container scroll/size
    let isInView = false;

    const update = () => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0 || !isInView) {
            bar.style.display = 'none';
            return;
        }
        bar.style.display = '';

        // Align bar width and horizontal position to the VISIBLE portion of the container
        const rect = container.getBoundingClientRect();
        const vw = document.documentElement.clientWidth || window.innerWidth;
        const leftVisible = Math.max(0, rect.left);
        const rightVisible = Math.min(vw, rect.right);
        const visibleWidth = Math.max(0, rightVisible - leftVisible);
        bar.style.width = Math.round(visibleWidth) + 'px';
        bar.style.left = Math.round(leftVisible) + 'px';

        // Stick to table bottom when it's visible; otherwise stay 12px from viewport bottom
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom <= vh) {
            const bottomSpace = Math.max(0, vh - rect.bottom);
            bar.style.bottom = Math.max(12, bottomSpace + 8) + 'px'; // 8px gap above table bottom
        } else {
            bar.style.bottom = '12px';
        }

        const trackWidth = bar.clientWidth;
        const visibleRatio = container.clientWidth / container.scrollWidth;
        const minThumbPx = 28; // keep thumb touchable
        const thumbPx = Math.max(minThumbPx, Math.round(visibleRatio * trackWidth));
        thumb.style.width = thumbPx + 'px';

        const maxThumbLeft = trackWidth - thumbPx;
        const scrollRatio = container.scrollLeft / maxScroll;
        const leftPx = Math.round(maxThumbLeft * scrollRatio);
        thumb.style.transform = `translateX(${leftPx}px)`;
    };

    // Sync on scroll/resize/scroll events (vertical scroll may change centering)
    container.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });

    // Click-to-seek on track
    bar.addEventListener('click', (e) => {
        if (e.target === thumb) return; // dragging handled separately
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const targetCenter = Math.max(thumb.offsetWidth / 2, Math.min(bar.clientWidth - thumb.offsetWidth / 2, clickX));
        const ratio = (targetCenter - thumb.offsetWidth / 2) / (bar.clientWidth - thumb.offsetWidth);
        const maxScroll = container.scrollWidth - container.clientWidth;
        container.scrollLeft = ratio * maxScroll;
    });

    // Dragging the thumb
    let dragging = false;
    let startX = 0;
    let startLeft = 0;

    thumb.addEventListener('pointerdown', (e) => {
        dragging = true;
        startX = e.clientX;
        // current translateX in px
        const match = (thumb.style.transform || '').match(/translateX\(([-0-9.]+)px\)/);
        startLeft = match ? parseFloat(match[1]) : 0;
        thumb.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    thumb.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const maxThumbLeft = bar.clientWidth - thumb.offsetWidth;
        const newLeft = Math.max(0, Math.min(maxThumbLeft, startLeft + dx));
        thumb.style.transform = `translateX(${newLeft}px)`;

        const ratio = maxThumbLeft > 0 ? newLeft / maxThumbLeft : 0;
        const maxScroll = container.scrollWidth - container.clientWidth;
        container.scrollLeft = ratio * maxScroll;
    });

    thumb.addEventListener('pointerup', (e) => {
        dragging = false;
        thumb.releasePointerCapture(e.pointerId);
    });

    // Show only when the table container is in view
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            isInView = entries[0].isIntersecting;
            update();
        }, { threshold: 0 });
        io.observe(container);
    } else {
        // Fallback: approximate with viewport checks on scroll
        isInView = true;
    }

    // Initial state (defer to ensure layout is ready)
    setTimeout(update, 0);
}

// ===== CLIENT MARQUEE FUNCTIONALITY =====
async function initClientMarquee() {const marqueeTrack = document.getElementById('client-marquee-track');if (!marqueeTrack) {return; // Only run on homepage
    }
    
    // Fetch reference data dynamically from the references page
    let clientData = [];
    
    try {
        // Get the correct path to referenciak.html relative to current page
        const currentPath = window.location.pathname;
        const currentPageName = currentPath.split('/').pop() || 'index.html';
        const referencesPath = currentPath.includes('/en/') ? '../referenciak.html' : './referenciak.html';const response = await fetch(referencesPath);if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();clientData = parseReferencesFromHTML(html);} catch (error) {// Comprehensive fallback data from references table
        clientData = [
            // Kormányzati/Állami szervezetek
            { name: "Fővárosi Törvényszék", category: "Kormányzati/Állami szervezet", period: "2011-2014", service: "Közbeszerzés, jogi tanácsadás" },
            { name: "Nemzeti Infrastruktúra Fejlesztő Zrt.", category: "Kormányzati/Állami szervezet", period: "2011-2014", service: "Műszaki tervezés, projektmenedzsment" },
            { name: "Duna-Ipoly Nemzeti Park Igazgatóság", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "Környezetvédelem, pályázatírás" },
            { name: "Fertő-Hanság Nemzeti Park Igazgatóság", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "Környezetvédelem, pályázatírás" },
            { name: "KDRFÜ", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Kiskunsági Nemzeti Park Igazgatóság", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "Környezetvédelem, pályázatírás" },
            { name: "NYDRFÜ", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Nemzeti Fejlesztési Ügynökség", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "EU pályázatok, projektmenedzsment" },
            { name: "Pro Regio Nonprofit Kft.", category: "Kormányzati/Állami szervezet", period: "2008-2011", service: "Közbeszerzés, projektmenedzsment" },
            { name: "CFCU, ESZA Kht.", category: "Kormányzati/Állami szervezet", period: "2005-2008", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Európai Unió Budapesti Delegációja", category: "Kormányzati/Állami szervezet", period: "2005-2008", service: "EU pályázatok, tanácsadás" },
            { name: "FMM Irányító Hatóság", category: "Kormányzati/Állami szervezet", period: "2005-2008", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Oktatási Minisztérium", category: "Kormányzati/Állami szervezet", period: "2005-2008", service: "Közbeszerzés, projektmenedzsment" },
            { name: "VÁTI Kht.", category: "Kormányzati/Állami szervezet", period: "2005-2008", service: "Közbeszerzés, projektmenedzsment" },
            
            // Települések, önkormányzatok
            { name: "Ács Város", category: "Település, önkormányzat", period: "2011-2014", service: "Infrastruktúra fejlesztés, közbeszerzés" },
            { name: "Érd és Társége Szennyvízkezelési Társulás", category: "Település, önkormányzat", period: "2011-2014", service: "Környezetvédelem, műszaki tervezés" },
            { name: "Makó és Társége Ivóvízminőség-javító Társulás", category: "Település, önkormányzat", period: "2011-2014", service: "Vízgazdálkodás, közbeszerzés" },
            { name: "Nagyigmánd Nagyközség", category: "Település, önkormányzat", period: "2011-2014", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Somlóvásárhely Község", category: "Település, önkormányzat", period: "2011-2014", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Vép Város", category: "Település, önkormányzat", period: "2011-2014", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Budapest Főváros", category: "Település, önkormányzat", period: "2008-2011", service: "Városfejlesztés, EU pályázatok" },
            { name: "Budapest II. Kerület", category: "Település, önkormányzat", period: "2008-2011", service: "Kerületi fejlesztés, közbeszerzés" },
            { name: "Csurgó", category: "Település, önkormányzat", period: "2008-2011", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Dorog", category: "Település, önkormányzat", period: "2008-2011", service: "Közbeszerzés, projektmenedzsment" },
            
            // Oktatási intézmények
            { name: "Nyugat-Magyarországi Egyetem", category: "Oktatási intézmény", period: "2005-2008", service: "Közbeszerzés, projektmenedzsment" },
            { name: "Budapesti Corvinus Egyetem", category: "Oktatási intézmény", period: "2008-2011", service: "Oktatásfejlesztés, projektmenedzsment" },
            { name: "Széchenyi István Egyetem", category: "Oktatási intézmény", period: "2008-2011", service: "Oktatásfejlesztés, projektmenedzsment" },
            
            // Civil és egyéb szervezetek
            { name: "Magyar Természetvédők Szövetsége", category: "Civil szervezet", period: "2008-2011", service: "Környezetvédelem, pályázatírás" },
            { name: "Regionális Fejlesztési Ügynökség", category: "Civil szervezet", period: "2008-2011", service: "Regionális fejlesztés, pályázatírás" },
            
            // Vállalkozások
            { name: "Magyar Telekom Nyrt.", category: "Vállalkozás", period: "2011-2014", service: "Műszaki tervezés, közbeszerzés" },
            { name: "E.ON Hungária Zrt.", category: "Vállalkozás", period: "2008-2011", service: "Energetikai projektek, közbeszerzés" },
            { name: "FŐGÁZ Zrt.", category: "Vállalkozás", period: "2008-2011", service: "Infrastruktúra fejlesztés, közbeszerzés" }
        ];
    }// Clear any previous content (for rebuilds)
    marqueeTrack.innerHTML = '';
    const marqueeContainer = marqueeTrack.parentElement;
    if (marqueeContainer && !marqueeContainer.classList.contains('two-rows')) {
        marqueeContainer.classList.add('two-rows');
    }

    // Create a second track element below, moving in opposite direction
    let secondTrack = marqueeContainer.querySelector('#client-marquee-track-2');
    if (!secondTrack) {
        secondTrack = document.createElement('div');
        secondTrack.id = 'client-marquee-track-2';
        secondTrack.className = 'marquee-track reverse';
        marqueeContainer.appendChild(secondTrack);
    } else {
        secondTrack.classList.add('reverse');
        secondTrack.innerHTML = '';
    }

    // Split data into two roughly equal sets
    const midpoint = Math.ceil(clientData.length / 2);
    const topRowData = clientData.slice(0, midpoint);
    const bottomRowData = clientData.slice(midpoint);

    const appendSetTwice = (trackEl, dataSet) => {
        // First pass
        dataSet.forEach(client => {
            const card = createClientCard(client);
            trackEl.appendChild(card);
        });
        // Second pass for seamless loop
        dataSet.forEach(client => {
            const card = createClientCard(client);
            trackEl.appendChild(card);
        });
    };

    appendSetTwice(marqueeTrack, topRowData.length ? topRowData : clientData);
    appendSetTwice(secondTrack, bottomRowData.length ? bottomRowData : clientData);

    // Add drag functionality for both rows
    initMarqueeDrag(marqueeTrack);
    initMarqueeDrag(secondTrack);
    
    // Add resize handler to rebuild marquee if screen size changes significantly
    let resizeTimeout;
    const initialScreenWidth = screenWidth;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newScreenWidth = window.innerWidth;
            const widthDifference = Math.abs(newScreenWidth - initialScreenWidth);
            
            // Rebuild if screen width changed by more than 200px
            if (widthDifference > 200) {initClientMarquee();
            }
        }, 500);
    });
}

function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'client-card';card.innerHTML = `
        <div class="client-name">${client.name}</div>
        <div class="client-category">${client.category}</div>
        <div class="client-labels">
            <span class="client-label">${client.period}</span>
            <span class="client-label">${client.service}</span>
        </div>
    `;
    
    return card;
}

// Parse references data from HTML
function parseReferencesFromHTML(html) {const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('.reference-table tbody');if (!table) {return [];
    }
    
    const clients = [];
    const rows = table.querySelectorAll('tr');let currentCategory = '';
    
    // Category mapping to shorter forms
    const categoryMap = {
        'Kormányzati/Állami szervek': 'Kormányzati/Állami szervezet',
        'Települések, önkormányzatok': 'Település, önkormányzat',
        'Oktatási intézmények': 'Oktatási intézmény',
        'Civil és egyéb szervezetek': 'Civil szervezet',
        'Vállalkozások': 'Vállalkozás'
    };
    
    rows.forEach((row, index) => {if (row.classList.contains('category-header')) {
            // This is a category header row
            const categoryCell = row.querySelector('td:first-child');
            const orgCell = row.querySelector('td:nth-child(2)');
            const periodCell = row.querySelector('td:nth-child(3)');
            const serviceCell = row.querySelector('td:nth-child(4)');
            
            if (categoryCell && orgCell && periodCell && serviceCell) {
                currentCategory = categoryMap[categoryCell.textContent.trim()] || categoryCell.textContent.trim();clients.push({
                    name: orgCell.textContent.trim(),
                    category: currentCategory,
                    period: periodCell.textContent.trim(),
                    service: serviceCell.textContent.trim()
                });} else {}
        } else {
            // This is a regular row
            const orgCell = row.querySelector('td:first-child');
            const periodCell = row.querySelector('td:nth-child(2)');
            const serviceCell = row.querySelector('td:nth-child(3)');
            
            if (orgCell && periodCell && serviceCell && currentCategory) {
                clients.push({
                    name: orgCell.textContent.trim(),
                    category: currentCategory,
                    period: periodCell.textContent.trim(),
                    service: serviceCell.textContent.trim()
                });} else {}
        }
    });
    
    // Shuffle the array to get variety in the marquee
    return clients.sort(() => Math.random() - 0.5);
}

// Initialize drag functionality for marquee
function initMarqueeDrag(marqueeTrack) {
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let initialTransform = 0;
    const isMobile = ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 768);
    // Helper function to get current translateX value
    function getCurrentTranslateX() {
        const style = window.getComputedStyle(marqueeTrack);
        const matrix = style.transform;
        
        if (matrix === 'none') return 0;
        
        const matrixMatch = matrix.match(/matrix.*?\((.+?)\)/);
        if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(v => v.trim());
            if (values.length === 6) {
                return parseFloat(values[4]) || 0;
            } else if (values.length === 16) {
                return parseFloat(values[12]) || 0;
            }
        }
        return 0;
    }
    
    function handleStart(clientX, event) {
        isDragging = true;
        startX = clientX;
        
        // Get current transform value BEFORE adding dragging class
        const style = window.getComputedStyle(marqueeTrack);
        const matrix = style.transform;
        // Now add dragging class to stop animation
        marqueeTrack.classList.add('dragging');
        
        initialTransform = 0;
        if (matrix !== 'none') {
            // Handle both matrix() and matrix3d()
            const matrixMatch = matrix.match(/matrix.*?\((.+?)\)/);
            if (matrixMatch) {
                const values = matrixMatch[1].split(',').map(v => v.trim());// For matrix() the X translation is at index 4, for matrix3d() it's at index 12
                if (values.length === 6) {
                    // 2D matrix
                    initialTransform = parseFloat(values[4]) || 0;
                } else if (values.length === 16) {
                    // 3D matrix
                    initialTransform = parseFloat(values[12]) || 0;
                }}
        } else {}
    }
    
    function handleMove(clientX) {
        if (!isDragging) { return; }
        
        currentX = clientX;
        const deltaX = currentX - startX;
        const sensitivity = ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 768) ? 1 : 2; // Mobile: no multiplier; Desktop: 2x
        const newTransform = initialTransform + (deltaX * sensitivity);
        
        // More frequent logging to see drag movement// Force the transform with higher specificity
        marqueeTrack.style.setProperty('transform', `translateX(${newTransform}px)`, 'important');
        
        // Debug: log the actual computed style after setting
        const computedStyle = window.getComputedStyle(marqueeTrack);
    }
    
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        // Simply remove dragging class to resume original animation
        // Keep the current transform - don't reset anything
        marqueeTrack.classList.remove('dragging');
    }

    // On mobile: disable dragging; only pause while finger is down
    if (isMobile) {
        marqueeTrack.addEventListener('touchstart', () => {
            // Pause animation while the user keeps it tapped
            marqueeTrack.classList.add('dragging');
        }, { passive: true });
        marqueeTrack.addEventListener('touchend', () => {
            marqueeTrack.classList.remove('dragging');
        }, { passive: true });
        marqueeTrack.addEventListener('touchcancel', () => {
            marqueeTrack.classList.remove('dragging');
        }, { passive: true });
        // Do not wire up drag handlers on mobile
        return;
    }
    
    // Desktop: mouse drag events
    marqueeTrack.addEventListener('mousedown', (e) => {
        handleStart(e.clientX, e);
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX);
        if (isDragging) e.preventDefault();
    });
    
    document.addEventListener('mouseup', handleEnd);
    
    // Prevent text selection
    marqueeTrack.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
}

// ===== LIGHTWEIGHT CANVAS BACKGROUND (SQUARES) =====
function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
        if (window.drawBackground) { resolve(); return; }
        const existing = Array.from(document.scripts).find(s => s.src && s.src.includes(src));
        if (existing) { existing.addEventListener('load', () => resolve()); return; }
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
    });
}

function initCanvasBackgrounds() {
    const targets = document.querySelectorAll('.hero, .page-hero, .cta, .footer');
    const canvases = [];

    targets.forEach(el => {
        if (!el) return;
        if (!el.classList.contains('has-square-patterns')) {
            el.classList.add('has-square-patterns');
        }
        const style = window.getComputedStyle(el);
        if (style.position === 'static') {
            el.style.position = 'relative';
        }
        // Create or reuse canvas
        let canvas = el.querySelector('canvas.bg-squares');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.className = 'bg-squares';
            canvas.style.position = 'absolute';
            canvas.style.inset = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            el.prepend(canvas);
        }
        // Place canvas above section background; content is layered above via CSS
        const isFooter = el.classList.contains('footer');
        canvas.style.zIndex = '0';
        const options = isFooter
            ? { baseGrid: 128, seed: 'sugallat-blue-squares', fullGrid: true, softRate: 0.45, accentRate: 0.08, opacityMin: 0.24, opacityMax: 0.34, largeRate: 0, strokeColor: 'rgba(51, 65, 85, 1)', accentStrokeColor: 'rgba(71, 85, 105, 1)', shadowAlpha: 0 }
            : { baseGrid: 128, seed: 'sugallat-blue-squares', fullGrid: true, softRate: 0.65, midRate: 0.2, opacityMedMin: 0.4, opacityMedMax: 0.5, accentRate: 0.05, dashRate: 0, weightVarRate: 0.2, heavyWeight: 2, opacityMin: 0.28, opacityMax: 0.42, largeRate: 0, shadowAlpha: 0.02 };
        canvases.push({ el, canvas, options });
        if (window.drawBackground) {
            window.drawBackground(canvas, options);
        }
    });

    // Redraw on resize
    let resizeTimeout;
    function redrawAll() {
        canvases.forEach(({ canvas, options }) => {
            if (window.drawBackground) {
                window.drawBackground(canvas, options);
            }
        });
    }
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(redrawAll, 120);
    });
}

// ===== FAQ ACCORDION FUNCTIONALITY =====
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        // Initialize: ensure hidden answers start with max-height: 0
        if (answer.hidden) {
            answer.style.maxHeight = '0px';
        }
        
        question.addEventListener('click', (e) => {
            e.preventDefault();
            
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded
            question.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                // Opening: first remove hidden, then animate open
                answer.hidden = false;
                
                // Force a reflow so the browser registers the display change
                answer.offsetHeight;
                
                // Animate to full height
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                // Closing: animate to 0, then hide
                answer.style.maxHeight = '0px';
                
                // After transition ends, add hidden attribute
                const handleTransitionEnd = () => {
                    if (question.getAttribute('aria-expanded') === 'false') {
                        answer.hidden = true;
                    }
                    answer.removeEventListener('transitionend', handleTransitionEnd);
                };
                answer.addEventListener('transitionend', handleTransitionEnd);
            }
        });
    });
}

// ===== TEXT GALLERY FUNCTIONALITY =====
function initTextGalleries() {
    const galleries = document.querySelectorAll('.text-gallery');
    
    galleries.forEach(gallery => {
        const slides = gallery.querySelectorAll('.text-slide');
        const dots = gallery.querySelectorAll('.dot');
        const headerButtons = gallery.querySelectorAll('.header-nav-button');
        
        // Function to check if we're in gallery mode (small screen)
        const isGalleryMode = () => window.innerWidth <= 1023;
        
        // Function to show specific slide
        const showSlide = (index) => {
            // Remove active class from all elements
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            headerButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to current elements
            if (slides[index]) slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            if (headerButtons[index]) headerButtons[index].classList.add('active');
        };
        
        // Function to setup gallery functionality
        const setupGallery = () => {
            if (!isGalleryMode()) {
                // Large screen: show all slides
                slides.forEach(slide => slide.classList.add('active'));
                return;
            }
            
            // Small screen: gallery mode
            // Find currently active slide to preserve selection
            let currentActiveIndex = 0;
            slides.forEach((slide, index) => {
                if (slide.classList.contains('active')) {
                    currentActiveIndex = index;
                }
            });
            
            // Show the currently active slide (or first slide if none active)
            showSlide(currentActiveIndex);
        };
        
        // Add click handlers to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!isGalleryMode()) return; // Only work in gallery mode
                showSlide(index);
            });
        });
        
        // Add click handlers to header buttons
        headerButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (!isGalleryMode()) return; // Only work in gallery mode
                showSlide(index);
            });
        });
        
        // Setup initially
        setupGallery();
        
        // Re-setup on window resize
        window.addEventListener('resize', setupGallery);
    });
}