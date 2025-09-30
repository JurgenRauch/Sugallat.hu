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
        
        // Initialize client marquee if on homepage
        initClientMarquee();
        
        // Initialize text galleries
        initTextGalleries();
        
        // Defer square patterns until after essential content loads
        deferSquarePatterns();
    }).catch(function(error) {
        // Fallback: at least try to load header if Promise fails
        loadHeader();
        loadFooter();
    });
});

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
                                <a href="${referenciakUrl}" class="dropdown-link">Referenciák</a>
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
        <footer class="footer">
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
        
        // Add main link as first item (highlighted)
        const mainItem = document.createElement('li');
        mainItem.innerHTML = `<a href="${menuData.mainUrl}" class="nav-link">${menuData.mainTitle}</a>`;
        secondaryMenu.appendChild(mainItem);
        
        // Add sub-items
        menuData.subItems.forEach(subItem => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${subItem.url}" class="nav-link">${subItem.title}</a>`;
            secondaryMenu.appendChild(li);
        });
        
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
                const isMobile = window.innerWidth <= 768 || document.querySelector('.hamburger').offsetParent !== null;if (isMobile) {
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
                    // Desktop behavior: allow normal navigation to main page
                    // Don't prevent default - let the link work normally// Just close any open dropdowns when clicking main nav
                    dropdownItems.forEach(otherItem => {
                        otherItem.classList.remove('active');
                    });
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
    }// Show ALL partners exactly once in a complete loop
    // Create 2 identical complete sets for seamless CSS infinite loop// First complete set - all partners once
    clientData.forEach(client => {
        const card = createClientCard(client);
        marqueeTrack.appendChild(card);
    });
    
    // Second identical complete set for seamless loop
    clientData.forEach(client => {
        const card = createClientCard(client);
        marqueeTrack.appendChild(card);
    });// Add drag functionality
    initMarqueeDrag(marqueeTrack);
    
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
    let initialTransform = 0;// Helper function to get current translateX value
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
    
    function handleStart(clientX, event) {isDragging = true;
        startX = clientX;
        
        // Get current transform value BEFORE adding dragging class
        const style = window.getComputedStyle(marqueeTrack);
        const matrix = style.transform;// Now add dragging class to stop animation
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
        if (!isDragging) {
            return;
        }
        
        currentX = clientX;
        const deltaX = currentX - startX;
        const sensitivity = 2; // Multiply drag distance for more responsive movement
        const newTransform = initialTransform + (deltaX * sensitivity);
        
        // More frequent logging to see drag movement// Force the transform with higher specificity
        marqueeTrack.style.setProperty('transform', `translateX(${newTransform}px)`, 'important');
        
        // Add visual feedback - change opacity slightly while dragging
        marqueeTrack.style.opacity = '0.8';
        
        // Debug: log the actual computed style after setting
        const computedStyle = window.getComputedStyle(marqueeTrack);}
    
    function handleEnd() {
        if (!isDragging) return;isDragging = false;
        
        // Reset visual feedback
        marqueeTrack.style.opacity = '1';
        
        // Simply remove dragging class to resume original animation
        // Keep the current transform - don't reset anything
        marqueeTrack.classList.remove('dragging');}
    
    // Mouse events
    marqueeTrack.addEventListener('mousedown', (e) => {
        handleStart(e.clientX, e);
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX);
        if (isDragging) e.preventDefault();
    });
    
    document.addEventListener('mouseup', handleEnd);
    
    // Touch events for mobile
    marqueeTrack.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX, e);
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX);
        if (isDragging) e.preventDefault();
    });
    
    document.addEventListener('touchend', handleEnd);
    
    // Prevent text selection
    marqueeTrack.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });}

// ===== SQUARE CLUSTER PATTERN GENERATOR =====
// Guard flag to prevent double rendering
let squarePatternsGenerated = false;

/**
 * Defers square pattern generation until after essential content loads
 * This improves initial page load performance by prioritizing critical content
 */
function deferSquarePatterns() {// Wait for images, fonts, and other critical resources
    if (document.readyState === 'complete') {
        // Page already fully loaded
        setTimeout(() => {
            if (!squarePatternsGenerated) {
                generateSquareClusters();
            }
        }, 50);
    } else {
        // Wait for page to fully load
        window.addEventListener('load', () => {setTimeout(() => {
                if (!squarePatternsGenerated) {
                    generateSquareClusters();
                }
            }, 100);
        });
        
        // Fallback: Generate after a reasonable delay even if load event hasn't fired
        setTimeout(() => {if (!squarePatternsGenerated) {
                generateSquareClusters();
            }
        }, 2000);
    }
}

/**
 * Generates random square cluster patterns for elements with 'has-square-patterns' class
 * Requires: css/square-patterns.css to be loaded
 * Performance: Defers generation to avoid blocking critical content
 */
function generateSquareClusters() {
    // Set flag to prevent double execution
    squarePatternsGenerated = true;
    
    // Simple lazy loading: defer by 100ms to let critical content load first
    setTimeout(() => {
    
    // Find all elements that should have square patterns
    const patternElements = document.querySelectorAll('.has-square-patterns');if (patternElements.length === 0) {
        // Fallback: auto-apply to common background elements (blue sections and footer)
        const blueBackgrounds = document.querySelectorAll('.hero, .cta, .page-hero, .footer');blueBackgrounds.forEach((el, index) => {el.classList.add('has-square-patterns');
        });return generateSquareClusters(); // Recursive call with updated elements
    }
    
    patternElements.forEach((section, sectionIndex) => {
        // Generate comprehensive pattern library systematically
        const generatePatterns = () => {
            const patterns = [];
            
            // 2x2 patterns (all 16 possible combinations)
            for (let i = 0; i < 16; i++) {
                const pattern = [
                    [(i & 8) ? 1 : 0, (i & 4) ? 1 : 0],
                    [(i & 2) ? 1 : 0, (i & 1) ? 1 : 0]
                ];
                // Skip empty and full patterns
                if (i > 0 && i < 15) patterns.push(pattern);
            }
            
            // 3x2 patterns (common rectangular shapes)
            const patterns3x2 = [
                [[1,1,1],[0,0,0]], [[0,0,0],[1,1,1]], [[1,0,1],[0,1,0]], [[0,1,0],[1,0,1]],
                [[1,1,0],[0,0,1]], [[0,1,1],[1,0,0]], [[1,0,0],[0,1,1]], [[0,0,1],[1,1,0]],
                [[1,1,0],[1,0,0]], [[0,1,1],[0,0,1]], [[1,0,1],[1,0,0]], [[1,0,1],[0,0,1]],
                [[1,1,1],[1,0,0]], [[1,1,1],[0,0,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]
            ];
            patterns.push(...patterns3x2);
            
            // 2x3 patterns (vertical rectangles)
            const patterns2x3 = [
                [[1,1],[0,0],[0,0]], [[0,0],[1,1],[0,0]], [[0,0],[0,0],[1,1]],
                [[1,0],[1,0],[1,0]], [[0,1],[0,1],[0,1]], [[1,0],[0,1],[1,0]],
                [[0,1],[1,0],[0,1]], [[1,1],[1,0],[0,0]], [[1,1],[0,1],[0,0]],
                [[0,0],[1,0],[1,1]], [[0,0],[0,1],[1,1]], [[1,0],[1,1],[0,0]],
                [[0,1],[1,1],[0,0]], [[1,1],[0,0],[1,0]], [[1,1],[0,0],[0,1]]
            ];
            patterns.push(...patterns2x3);
            
            // 3x3 patterns (selected interesting ones)
            const patterns3x3 = [
                // Corners and edges
                [[1,1,1],[1,0,0],[1,0,0]], [[1,1,1],[0,0,1],[0,0,1]], 
                [[1,0,0],[1,0,0],[1,1,1]], [[0,0,1],[0,0,1],[1,1,1]],
                
                // Centers and crosses
                [[0,1,0],[1,1,1],[0,1,0]], [[1,0,1],[0,1,0],[1,0,1]],
                [[0,0,0],[1,1,1],[0,0,0]], [[1,0,1],[0,0,0],[1,0,1]],
                
                // Diagonals
                [[1,0,0],[0,1,0],[0,0,1]], [[0,0,1],[0,1,0],[1,0,0]],
                [[1,1,0],[1,0,0],[0,0,0]], [[0,1,1],[0,0,1],[0,0,0]],
                [[0,0,0],[1,0,0],[1,1,0]], [[0,0,0],[0,0,1],[0,1,1]],
                
                // L-shapes and steps
                [[1,1,0],[0,1,0],[0,1,1]], [[0,1,1],[0,1,0],[1,1,0]],
                [[1,0,0],[1,1,0],[0,1,1]], [[0,0,1],[0,1,1],[1,1,0]],
                
                // Frames and borders
                [[1,1,1],[1,0,1],[1,1,1]], [[1,1,1],[1,0,1],[0,0,0]],
                [[0,0,0],[1,0,1],[1,1,1]], [[1,0,1],[1,0,1],[1,0,1]],
                
                // Zigzags and waves
                [[1,0,1],[0,1,0],[1,0,1]], [[0,1,0],[1,0,1],[0,1,0]],
                [[1,1,0],[0,1,1],[1,0,0]], [[0,1,1],[1,1,0],[0,0,1]],
                
                // Asymmetric interesting shapes
                [[1,1,1],[0,1,0],[0,0,1]], [[1,1,1],[0,1,0],[1,0,0]],
                [[1,0,0],[0,1,0],[1,1,1]], [[0,0,1],[0,1,0],[1,1,1]],
                [[1,1,0],[1,0,1],[0,1,0]], [[0,1,1],[1,0,1],[0,1,0]]
            ];
            patterns.push(...patterns3x3);
            
            // 4x2 patterns (wider rectangles)
            const patterns4x2 = [
                [[1,1,1,1],[0,0,0,0]], [[0,0,0,0],[1,1,1,1]], 
                [[1,0,1,0],[0,1,0,1]], [[0,1,0,1],[1,0,1,0]],
                [[1,1,0,0],[0,0,1,1]], [[0,0,1,1],[1,1,0,0]],
                [[1,0,0,1],[0,1,1,0]], [[0,1,1,0],[1,0,0,1]],
                [[1,1,1,0],[0,0,0,1]], [[0,1,1,1],[1,0,0,0]]
            ];
            patterns.push(...patterns4x2);
            
            // 2x4 patterns (taller rectangles)
            const patterns2x4 = [
                [[1,1],[0,0],[0,0],[0,0]], [[0,0],[1,1],[0,0],[0,0]], 
                [[0,0],[0,0],[1,1],[0,0]], [[0,0],[0,0],[0,0],[1,1]],
                [[1,0],[1,0],[0,1],[0,1]], [[0,1],[0,1],[1,0],[1,0]],
                [[1,0],[0,1],[1,0],[0,1]], [[0,1],[1,0],[0,1],[1,0]],
                [[1,1],[1,0],[0,1],[0,0]], [[1,1],[0,1],[1,0],[0,0]],
                [[0,0],[1,0],[0,1],[1,1]], [[0,0],[0,1],[1,0],[1,1]]
            ];
            patterns.push(...patterns2x4);
            
            return patterns;
        };
        
        const SHAPES = generatePatterns();
        
        // Convert shape arrays to CSS grid format
        const convertShapeToGrid = (shape) => {
            const rows = shape.length;
            const cols = Math.max(...shape.map(row => row.length));
            const gridItems = [];
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const value = shape[row] && shape[row][col] !== undefined ? shape[row][col] : 0;
                    gridItems.push(value === 1 ? 'square-shape' : 'square-empty');
                }
            }
            
            return {
                gridTemplateColumns: `repeat(${cols}, var(--shape-size))`,
                gridTemplateRows: `repeat(${rows}, var(--shape-size))`,
                items: gridItems
            };
        };
        
        // Create fixed grid positions extending beyond visible area
        // Performance optimization: adjust density based on screen size and device capabilities
        const isMobile = window.innerWidth < 768;
        const isVeryLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2;
        const baseSpacing = 280;
        
        // Mobile needs MORE density to compensate for smaller squares and screen
        let gridSpacing;
        if (window.innerWidth < 480) {
            // Very small screens: squares are 50px, need much more density
            gridSpacing = baseSpacing * 0.7; // 30% MORE density
        } else if (isMobile) {
            // Mobile screens: squares are 60px, need more density  
            gridSpacing = baseSpacing * 0.75; // 25% MORE density
        } else if (isVeryLowEnd) {
            gridSpacing = baseSpacing * 1.3; // Only reduce for very low-end devices (< 2 cores)
        } else {
            gridSpacing = baseSpacing; // Full density for desktop (80px squares)
        }
        const shapeSize = 80; // base shape size (25% larger: 64px * 1.25 = 80px)
        
        // Calculate grid positions (including outside visible area)
        const startX = -gridSpacing; // Start before visible area
        const startY = -gridSpacing * 1.3; // Start 30% further above visible area
        const endX = section.offsetWidth + gridSpacing; // End after visible area
        const endY = section.offsetHeight + (gridSpacing * 1.3); // End 30% further below visible area
        
        let shapeIndex = 0;
        
        // Create grid of shapes
        for (let x = startX; x < endX; x += gridSpacing) {
            for (let y = startY; y < endY; y += gridSpacing) {
                // Select shape in sequence (cycling through all shapes)
                const shape = SHAPES[shapeIndex % SHAPES.length];
                const gridConfig = convertShapeToGrid(shape);
                
                // Convert pixel position to percentage
                const xPercent = (x / section.offsetWidth) * 100;
                const yPercent = (y / section.offsetHeight) * 100;
                
                // Create cluster container
                const cluster = document.createElement('div');
                cluster.className = 'square-cluster';
                cluster.style.position = 'absolute';
                cluster.style.left = `${xPercent}%`;
                cluster.style.top = `${yPercent}%`;
                cluster.style.display = 'grid';
                cluster.style.gridTemplateColumns = gridConfig.gridTemplateColumns;
                cluster.style.gridTemplateRows = gridConfig.gridTemplateRows;
                cluster.style.gap = 'var(--shape-gap)';
                cluster.style.opacity = 'var(--cluster-opacity)';
                cluster.style.pointerEvents = 'none';
                cluster.style.transform = 'translate(-50%, -50%)';
                cluster.style.zIndex = '0';
                
                // Add shapes to cluster with random opacity animation
                gridConfig.items.forEach((shapeClass, index) => {
                    const shapeElement = document.createElement('div');
                    shapeElement.className = shapeClass;
                    
                    // Add random opacity animation only to visible squares
                    if (shapeClass === 'square-shape') {
                        // Random initial opacity (0.1 to 1.0)
                        const initialOpacity = 0.1 + Math.random() * 0.9;
                        shapeElement.style.opacity = initialOpacity;
                        
                        // Random animation duration between 2-5.3 seconds (1/3rd faster: 3-8 becomes 2-5.3)
                        const duration = 2 + Math.random() * 3.3;
                        // Random delay to stagger animations
                        const delay = Math.random() * 2;
                        
                        shapeElement.style.animation = `fadeSquarePattern ${duration}s ease-in-out ${delay}s infinite alternate`;
                    }
                    
                    cluster.appendChild(shapeElement);
                });
                
                // Add cluster to section
                section.appendChild(cluster);
                
                shapeIndex++;
            }
        }});
    }, 100); // End of setTimeout - patterns load after 100ms delay
}

// ===== TEXT GALLERY FUNCTIONALITY =====
function initTextGalleries() {
    const galleries = document.querySelectorAll('.text-gallery');
    
    galleries.forEach(gallery => {
        const slides = gallery.querySelectorAll('.text-slide');
        const dots = gallery.querySelectorAll('.dot');
        const headerButtons = gallery.querySelectorAll('.header-nav-button');
        let autoAdvanceInterval;
        
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
                // Large screen: show all slides, clear any intervals
                slides.forEach(slide => slide.classList.add('active'));
                if (autoAdvanceInterval) {
                    clearInterval(autoAdvanceInterval);
                    autoAdvanceInterval = null;
                }
                return;
            }
            
            // Small screen: gallery mode
            // Ensure only first slide is active initially
            showSlide(0);
            
            // Auto-advance every 8 seconds (only in gallery mode)
            if (!autoAdvanceInterval) {
                let currentSlide = 0;
                autoAdvanceInterval = setInterval(() => {
                    if (!gallery.hasAttribute('data-user-interacted') && isGalleryMode()) {
                        currentSlide = (currentSlide + 1) % slides.length;
                        showSlide(currentSlide);
                    }
                }, 8000);
            }
        };
        
        // Add click handlers to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!isGalleryMode()) return; // Only work in gallery mode
                
                showSlide(index);
                
                // Mark as user-interacted
                gallery.setAttribute('data-user-interacted', 'true');
                setTimeout(() => {
                    gallery.removeAttribute('data-user-interacted');
                }, 30000);
            });
        });
        
        // Add click handlers to header buttons
        headerButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (!isGalleryMode()) return; // Only work in gallery mode
                
                showSlide(index);
                
                // Stop auto-advance permanently when user selects a header button
                if (autoAdvanceInterval) {
                    clearInterval(autoAdvanceInterval);
                    autoAdvanceInterval = null;
                }
                gallery.setAttribute('data-user-interacted', 'true');
            });
        });
        
        // Setup initially
        setupGallery();
        
        // Re-setup on window resize
        window.addEventListener('resize', setupGallery);
    });
}