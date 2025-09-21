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
        
        // Load latest blogs for homepage
        loadLatestBlogs();
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
                        <a href="${pathPrefix}weboldal.html" class="nav-link">Főoldal</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="${pathPrefix}szolgaltatasok.html" class="nav-link" onclick="window.location.href='${pathPrefix}szolgaltatasok.html'; return false;">Szolgáltatásaink</a>
                        <div class="dropdown-menu">
                            <a href="${pathPrefix}szolgaltatasok.html#kozbeszerzes" class="dropdown-link">Közbeszerzés</a>
                            <a href="${pathPrefix}szolgaltatasok.html#projektmenedzsment" class="dropdown-link">Projektmenedzsment</a>
                            <a href="${pathPrefix}szolgaltatasok.html#muszaki" class="dropdown-link">Műszaki tervezés</a>
                            <a href="${pathPrefix}szolgaltatasok.html#kornyezet" class="dropdown-link">Környezetgazdálkodás</a>
                        </div>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="${pathPrefix}arak.html" class="nav-link" onclick="window.location.href='${pathPrefix}arak.html'; return false;">Áraink</a>
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
                        <a href="${pathPrefix}kapcsolat.html" class="nav-link" onclick="window.location.href='${pathPrefix}kapcsolat.html'; return false;">Kapcsolat</a>
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