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
    });
});

// ===== HEADER LOADER FUNCTIONS =====
function loadHeader() {
    console.log('loadHeader function called');
    // Get the current page name to determine active states
    const currentPage = getCurrentPageName();
    console.log('Current page:', currentPage);

    // Determine if we're in the English folder or a subdirectory
    const isEnglish = window.location.pathname.includes('/en/');
    const inSubdirectory = window.location.pathname.includes('/blog/') || window.location.pathname.includes('/en/');
    
    // Set paths based on current location
    const pathPrefix = inSubdirectory ? '../' : '';
    const imagePath = inSubdirectory ? '../images/logo.png' : 'images/logo.png';
    const langPath = isEnglish ? '../en/index.html' : (inSubdirectory ? '../en/index.html' : 'en/index.html');
    const huPath = isEnglish ? '../weboldal.html' : (inSubdirectory ? '../weboldal.html' : 'weboldal.html');

    // Create header HTML based on language
    let headerHTML;
    
    if (isEnglish) {
        // English navigation
        headerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <a href="${pathPrefix}index.html" class="nav-logo-link">
                            <img src="${imagePath}" alt="Sugallat Ltd. Logo" class="logo">
                            <h2>Sugallat Ltd.</h2>
                        </a>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a href="${pathPrefix}index.html" class="nav-link">Home</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pathPrefix}services.html" class="nav-link">Our Services</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}services.html#public-procurement" class="dropdown-link">Public Procurement</a>
                                <a href="${pathPrefix}services.html#project-management" class="dropdown-link">Project Management</a>
                                <a href="${pathPrefix}services.html#technical-design" class="dropdown-link">Technical Design</a>
                                <a href="${pathPrefix}services.html#environmental" class="dropdown-link">Environmental Management</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pathPrefix}prices.html" class="nav-link">Pricing</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}prices.html#procurement-documents" class="dropdown-link">Procurement Documents</a>
                                <a href="${pathPrefix}prices.html#procurement-procedures" class="dropdown-link">Procurement Procedures</a>
                                <a href="${pathPrefix}prices.html#other-activities" class="dropdown-link">Other Activities</a>
                                <a href="${pathPrefix}prices.html#engineering-work" class="dropdown-link">Engineering Work</a>
                                <a href="${pathPrefix}prices.html#tender-monitoring" class="dropdown-link">Tender Monitoring</a>
                                <a href="${pathPrefix}prices.html#pricing" class="dropdown-link">Pricing</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pathPrefix}contact.html" class="nav-link">Contact</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}contact.html" class="dropdown-link">Contact Information</a>
                                <a href="${pathPrefix}contact.html#write-to-us" class="dropdown-link">Write to Us</a>
                                <a href="${pathPrefix}about.html" class="dropdown-link">About Us</a>
                                <a href="${pathPrefix}about.html#company-data" class="dropdown-link">Company Data</a>
                                <a href="${pathPrefix}references.html" class="dropdown-link">References</a>
                            </div>
                        </li>
                    </ul>
                    <div class="language-switcher">
                        <a href="${huPath}" class="lang-link">HU</a>
                        <span class="lang-separator">|</span>
                        <a href="${langPath}" class="lang-link active">EN</a>
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
                        <a href="${huPath}" class="nav-logo-link">
                            <img src="${imagePath}" alt="Sugallat Kft. Logo" class="logo">
                            <h2>Sugallat Kft.</h2>
                        </a>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a href="${pathPrefix}weboldal.html" class="nav-link">Főoldal</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pathPrefix}szolgaltatasok.html" class="nav-link">Szolgáltatásaink</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}szolgaltatasok.html#kozbeszerzes" class="dropdown-link">Közbeszerzés</a>
                                <a href="${pathPrefix}szolgaltatasok.html#projektmenedzsment" class="dropdown-link">Projektmenedzsment</a>
                                <a href="${pathPrefix}szolgaltatasok.html#muszaki" class="dropdown-link">Műszaki tervezés</a>
                                <a href="${pathPrefix}szolgaltatasok.html#kornyezet" class="dropdown-link">Környezetgazdálkodás</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pathPrefix}arak.html" class="nav-link">Áraink</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}arak.html#kozbeszerzesi-dokumentumok" class="dropdown-link">Közbeszerzési dokumentumok</a>
                                <a href="${pathPrefix}arak.html#kozbeszerzesi-eljaras" class="dropdown-link">Közbeszerzési eljárás</a>
                                <a href="${pathPrefix}arak.html#egyeb-tevekenysegek" class="dropdown-link">Egyéb tevékenységek</a>
                                <a href="${pathPrefix}arak.html#mernoki-munkak" class="dropdown-link">Mérnöki munkák</a>
                                <a href="${pathPrefix}arak.html#hirdetmenyfigyeles" class="dropdown-link">Hirdetményfigyelés</a>
                                <a href="${pathPrefix}arak.html#arkepzes" class="dropdown-link">Árképzés</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${pathPrefix}kapcsolat.html" class="nav-link">Kapcsolat</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}kapcsolat.html" class="dropdown-link">Elérhetőségeink</a>
                                <a href="${pathPrefix}kapcsolat.html#irjon-nekunk" class="dropdown-link">Kapcsolatfelvétel</a>
                                <a href="${pathPrefix}rolunk.html" class="dropdown-link">Rólunk</a>
                                <a href="${pathPrefix}rolunk.html#cegadatok" class="dropdown-link">Cégadatok</a>
                                <a href="${pathPrefix}referenciak.html" class="dropdown-link">Referenciák</a>
                            </div>
                        </li>
                    </ul>
                    <div class="language-switcher">
                        <a href="${huPath}" class="lang-link active">HU</a>
                        <span class="lang-separator">|</span>
                        <a href="${langPath}" class="lang-link">EN</a>
                    </div>
                    <div class="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        `;
    }
    
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

// ===== FOOTER LOADER FUNCTIONS =====
function loadFooter() {
    console.log('loadFooter function called');
    
    // Determine if we're in a subdirectory for proper path handling
    const inSubdirectory = window.location.pathname.includes('/blog/') || window.location.pathname.includes('/en/');
    const isEnglish = window.location.pathname.includes('/en/');
    
    // Set paths based on current location
    const pathPrefix = inSubdirectory ? '../' : '';
    
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
                            <li><a href="${pathPrefix}szolgaltatasok.html#kozbeszerzes">Közbeszerzés</a></li>
                            <li><a href="${pathPrefix}szolgaltatasok.html#projektmenedzsment">Projektmenedzsment</a></li>
                            <li><a href="${pathPrefix}szolgaltatasok.html#muszaki">Műszaki tervezés</a></li>
                            <li><a href="${pathPrefix}szolgaltatasok.html#kornyezet">Környezetgazdálkodás</a></li>
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
                            <li><a href="${pathPrefix}linkek.html">Hasznos linkek</a></li>
                            <li><a href="${pathPrefix}referenciak.html">Referenciák</a></li>
                            <li><a href="${pathPrefix}rolunk.html">Rólunk</a></li>
                            <li><a href="${pathPrefix}blog.html">Blog</a></li>
                            <li><a href="${pathPrefix}adatkezelesi-tajekoztato.html">Adatkezelési tájékoztató</a></li>
                            <li><a href="${pathPrefix}adatkezelesi-tajekoztato.html#cookie-policy">Cookie szabályzat</a></li>
                            <li><a href="${pathPrefix}sitemap.html">Oldaltérkép</a></li>
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
    `;
    
    console.log('Footer HTML created');
    
    // Insert footer into the placeholder div
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
        console.log('Footer inserted into placeholder');
    } else {
        // Fallback: append to body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
        console.log('Footer appended to body');
    }
    
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
            const homeLink = document.querySelector('.nav-link[href*="weboldal.html"], .nav-link[href*="index.html"]');
            if (homeLink) homeLink.classList.add('active');
            break;
        case 'contact':
            const contactLink = document.querySelector('.nav-link[href*="kapcsolat.html"]');
            if (contactLink) contactLink.classList.add('active');
            break;
        case 'about':
            const aboutLink = document.querySelector('.nav-link[href*="rolunk.html"]');
            if (aboutLink) aboutLink.classList.add('active');
            break;
        case 'pricing':
            const pricingLink = document.querySelector('.nav-link[href*="arak.html"]');
            if (pricingLink) pricingLink.classList.add('active');
            break;
        case 'services':
            const servicesLink = document.querySelector('.nav-link[href*="szolgaltatasok.html"]');
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

        // Close mobile menu when clicking on non-dropdown nav links
        const nonDropdownNavLinks = document.querySelectorAll('.nav-link:not(.nav-item.dropdown .nav-link)');
        nonDropdownNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Note: Dropdown links are handled in initDropdowns() function
        // to allow for the improved mobile dropdown behavior
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
                e.preventDefault();
                e.stopPropagation();
                
                // Check if we're on mobile (screen width or if hamburger menu is visible)
                const isMobile = window.innerWidth <= 768 || document.querySelector('.hamburger').offsetParent !== null;
                console.log('Dropdown clicked, isMobile:', isMobile, 'window width:', window.innerWidth);
                
                if (isMobile) {
                    // Mobile behavior: first click opens dropdown, second click navigates
                    if (!item.classList.contains('active')) {
                        // First click: open dropdown
                        console.log('First click: opening dropdown');
                        // Close other dropdowns
                        dropdownItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('active');
                            }
                        });
                        
                        // Open current dropdown
                        item.classList.add('active');
                        dropdownClickCount = 1;
                    } else {
                        // Second click: navigate to main page
                        console.log('Second click: navigating to main page');
                        const href = navLink.getAttribute('href');
                        if (href && href !== '#') {
                            window.location.href = href;
                        }
                    }
                } else {
                    // Desktop behavior: toggle dropdown on click
                    // Close other dropdowns
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current dropdown
                    item.classList.toggle('active');
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
function loadLatestBlogs() {
    console.log('Loading latest blogs...');
    
    // Define blog data directly (to avoid CORS issues with local files)
    const blogData = [
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
        } catch (error) {
            console.error(`Error creating blog card:`, error);
        }
    });
}

async function fetchBlogMetadata(blogPath) {
    try {
        console.log(`Fetching blog metadata for: ${blogPath}`);
        const response = await fetch(blogPath);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log(`Successfully fetched HTML for: ${blogPath}`);
        
        // Create a temporary DOM parser
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
    } catch (error) {
        console.error('Error fetching blog metadata:', error);
        return null;
    }
}

function createBlogCard(blogData, blogPath, pageType = 'homepage') {
    const article = document.createElement('article');
    
    // Format date
    const formattedDate = formatBlogDate(blogData.date);
    
    // Create read time text
    const readTimeText = blogData.readTime === 0 ? 'Hamarosan' : `${blogData.readTime} perc olvasás`;
    
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
                <a href="${blogData.url}" class="blog-read-more">Tovább olvasom →</a>
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
                <a href="${blogData.url}" class="blog-preview-read-more">Tovább olvasom →</a>
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
async function initClientMarquee() {
    console.log('initClientMarquee called');
    const marqueeTrack = document.getElementById('client-marquee-track');
    console.log('marqueeTrack found:', marqueeTrack);
    if (!marqueeTrack) {
        console.log('No marquee track found, skipping');
        return; // Only run on homepage
    }
    
    // Fetch reference data dynamically from the references page
    let clientData = [];
    
    try {
        // Get the correct path to referenciak.html relative to current page
        const currentPath = window.location.pathname;
        const currentPageName = currentPath.split('/').pop() || 'index.html';
        const referencesPath = currentPath.includes('/en/') ? '../referenciak.html' : './referenciak.html';
        
        console.log(`Current page: ${currentPageName}`);
        console.log(`Current path: ${currentPath}`);
        console.log(`Fetching references from: ${referencesPath}`);
        
        const response = await fetch(referencesPath);
        console.log(`Fetch response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log(`Received HTML length: ${html.length} characters`);
        
        clientData = parseReferencesFromHTML(html);
        console.log(`Loaded ${clientData.length} clients from references table`);
        console.log('First 5 clients:', clientData.slice(0, 5));
    } catch (error) {
        console.error('Failed to load references data:', error);
        console.error('Error details:', error.message);
        // Comprehensive fallback data from references table
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
    }
    
    console.log('Creating client cards');
    console.log(`Total clients available: ${clientData.length}`);
    
    // Show ALL partners exactly once in a complete loop
    // Create 2 identical complete sets for seamless CSS infinite loop
    
    console.log(`Creating complete loop with all ${clientData.length} partners`);
    
    // First complete set - all partners once
    clientData.forEach(client => {
        const card = createClientCard(client);
        marqueeTrack.appendChild(card);
    });
    
    // Second identical complete set for seamless loop
    clientData.forEach(client => {
        const card = createClientCard(client);
        marqueeTrack.appendChild(card);
    });
    
    console.log(`Created ${clientData.length * 2} cards (2 complete sets of all partners)`);
    
    // Add drag functionality
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
            if (widthDifference > 200) {
                console.log('Screen size changed significantly, rebuilding marquee');
                initClientMarquee();
            }
        }, 500);
    });
}


function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'client-card';
    
    card.innerHTML = `
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
function parseReferencesFromHTML(html) {
    console.log('Parsing references from HTML...');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('.reference-table tbody');
    
    console.log('Table found:', !!table);
    if (!table) {
        console.error('References table not found');
        console.log('Available tables:', doc.querySelectorAll('table').length);
        console.log('Available tbody:', doc.querySelectorAll('tbody').length);
        return [];
    }
    
    const clients = [];
    const rows = table.querySelectorAll('tr');
    console.log(`Found ${rows.length} rows in references table`);
    let currentCategory = '';
    
    // Category mapping to shorter forms
    const categoryMap = {
        'Kormányzati/Állami szervek': 'Kormányzati/Állami szervezet',
        'Települések, önkormányzatok': 'Település, önkormányzat',
        'Oktatási intézmények': 'Oktatási intézmény',
        'Civil és egyéb szervezetek': 'Civil szervezet',
        'Vállalkozások': 'Vállalkozás'
    };
    
    rows.forEach((row, index) => {
        console.log(`Processing row ${index + 1}/${rows.length}:`, row.classList.contains('category-header') ? 'CATEGORY HEADER' : 'REGULAR');
        
        if (row.classList.contains('category-header')) {
            // This is a category header row
            const categoryCell = row.querySelector('td:first-child');
            const orgCell = row.querySelector('td:nth-child(2)');
            const periodCell = row.querySelector('td:nth-child(3)');
            const serviceCell = row.querySelector('td:nth-child(4)');
            
            if (categoryCell && orgCell && periodCell && serviceCell) {
                currentCategory = categoryMap[categoryCell.textContent.trim()] || categoryCell.textContent.trim();
                console.log(`New category: ${currentCategory}`);
                
                clients.push({
                    name: orgCell.textContent.trim(),
                    category: currentCategory,
                    period: periodCell.textContent.trim(),
                    service: serviceCell.textContent.trim()
                });
                console.log(`Added category header client: ${orgCell.textContent.trim()}`);
            } else {
                console.log('Missing cells in category header row');
            }
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
                });
                console.log(`Added regular client: ${orgCell.textContent.trim()}`);
            } else {
                console.log('Missing cells or category in regular row');
            }
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
    
    console.log('Initializing drag for marquee track');
    
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
        console.log('Drag start at clientX:', clientX);
        console.log('Target element:', event.target.className);
        console.log('Current element:', event.currentTarget.className);
        isDragging = true;
        startX = clientX;
        
        // Get current transform value BEFORE adding dragging class
        const style = window.getComputedStyle(marqueeTrack);
        const matrix = style.transform;
        console.log('Current transform matrix:', matrix);
        
        // Now add dragging class to stop animation
        marqueeTrack.classList.add('dragging');
        
        initialTransform = 0;
        if (matrix !== 'none') {
            // Handle both matrix() and matrix3d()
            const matrixMatch = matrix.match(/matrix.*?\((.+?)\)/);
            if (matrixMatch) {
                const values = matrixMatch[1].split(',').map(v => v.trim());
                console.log('Matrix values:', values);
                // For matrix() the X translation is at index 4, for matrix3d() it's at index 12
                if (values.length === 6) {
                    // 2D matrix
                    initialTransform = parseFloat(values[4]) || 0;
                } else if (values.length === 16) {
                    // 3D matrix
                    initialTransform = parseFloat(values[12]) || 0;
                }
                console.log('Parsed initial transform:', initialTransform);
            }
        } else {
            console.log('No transform, starting at 0');
        }
    }
    
    function handleMove(clientX) {
        if (!isDragging) {
            return;
        }
        
        currentX = clientX;
        const deltaX = currentX - startX;
        const sensitivity = 2; // Multiply drag distance for more responsive movement
        const newTransform = initialTransform + (deltaX * sensitivity);
        
        // More frequent logging to see drag movement
        console.log(`Dragging: deltaX=${deltaX}, sensitivity=${sensitivity}, newTransform=${newTransform.toFixed(1)}`);
        
        // Force the transform with higher specificity
        marqueeTrack.style.setProperty('transform', `translateX(${newTransform}px)`, 'important');
        
        // Add visual feedback - change opacity slightly while dragging
        marqueeTrack.style.opacity = '0.8';
        
        // Debug: log the actual computed style after setting
        const computedStyle = window.getComputedStyle(marqueeTrack);
        console.log('Applied transform:', marqueeTrack.style.transform);
        console.log('Computed transform:', computedStyle.transform);
    }
    
    function handleEnd() {
        if (!isDragging) return;
        
        console.log('Drag end');
        isDragging = false;
        
        // Reset visual feedback
        marqueeTrack.style.opacity = '1';
        
        // Simply remove dragging class to resume original animation
        // Keep the current transform - don't reset anything
        marqueeTrack.classList.remove('dragging');
        
        console.log('Animation resumed');
    }
    
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
    });
    
    console.log('Drag functionality initialized');
}