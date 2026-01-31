// ===== MAIN JAVASCRIPT FILE =====

// Mark JS availability for CSS fallbacks (keeps content visible if JS is blocked)
try { document.documentElement.classList.add('js-enabled'); } catch (e) {}

// Scheduling helpers: reduce main-thread contention during first paint
function runAfterFirstPaint(fn) {
    try {
        requestAnimationFrame(() => requestAnimationFrame(() => fn()));
    } catch (e) {
        setTimeout(fn, 0);
    }
}

function runWhenIdle(fn, timeout = 3000) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => { try { fn(); } catch (e) {} }, { timeout });
    } else {
        setTimeout(() => { try { fn(); } catch (e) {} }, 900);
    }
}

function runAfterPaintWhenIdle(fn, timeout = 3000) {
    runAfterFirstPaint(() => runWhenIdle(fn, timeout));
}

// Page-scoped boot: avoid initializing unrelated modules on pages that don't need them.
function getDeclaredBootConfig() {
    const body = document.body;
    const declaredPage = (body && body.dataset && body.dataset.page) || '';
    const declaredFeaturesRaw = (body && body.dataset && body.dataset.features) || '';

    const page = (declaredPage || getCurrentPageName() || 'other').toLowerCase();

    const features = new Set(
        declaredFeaturesRaw
            .split(/\s+/)
            .map(s => s.trim().toLowerCase())
            .filter(Boolean)
    );

    // Safety fallback for pages that haven't been stamped yet.
    if (features.size === 0) {
        const inferred = inferFeaturesForPage(page);
        inferred.forEach(f => features.add(f));
    }

    // Lightweight DOM-based safety: don't run modules if their root element is missing.
    if (!document.getElementById('client-marquee-track')) {
        features.delete('client-marquee');
        features.delete('client-marquee-bg');
    }
    if (!document.querySelector('.text-gallery')) {
        features.delete('text-galleries');
    }
    if (!document.querySelector('.faq-section')) {
        features.delete('faq');
    }

    return {
        page,
        features,
        has: (name) => features.has(String(name).toLowerCase()),
    };
}

function inferFeaturesForPage(page) {
    switch (page) {
        case 'home':
            return new Set([
                'latest-blogs',
                'client-marquee',
                'client-marquee-bg',
                'text-galleries',
                'faq',
                'services-row',
                'drag-scroll',
                'square-patterns',
            ]);
        case 'pricing':
            return new Set(['text-galleries', 'faq', 'square-patterns']);
        case 'services':
            return new Set(['text-galleries', 'faq', 'square-patterns', 'drag-scroll']);
        case 'references':
            return new Set(['reference-search', 'reference-table-scrollbar', 'square-patterns']);
        case 'blog':
            return new Set(['latest-blogs', 'square-patterns']);
        case 'contact':
        case 'about':
        case 'sitemap':
        case 'legal':
        default:
            return new Set(['square-patterns']);
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const boot = getDeclaredBootConfig();

    // Ensure latest blogs logic can run even if header/footer injection fails (and avoid double-render).
    const runLatestBlogsOnce = () => {
        if (!boot.has('latest-blogs')) return;
        if (window.__sugallatLatestBlogsLoaded) return;
        window.__sugallatLatestBlogsLoaded = true;
        try { loadLatestBlogs(); } catch (e) {}
    };

    // Run early so the homepage can hide the whole section deterministically.
    runLatestBlogsOnce();
    
    // ===== HEADER AND FOOTER LOADER =====
    // Load header and footer content
    Promise.all([loadHeader(), loadFooter()]).then(() => {
        // Initialize mobile menu and dropdowns after header is loaded
        initMobileMenu();
        initDropdowns();
        
        // Handle anchor scrolling after page load
        handleAnchorScrolling();
        
        // latest blogs already handled via runLatestBlogsOnce()
        
        if (boot.has('reference-search')) {
            initReferenceSearch();
        }
        if (boot.has('reference-table-scrollbar')) {
            initReferenceTableScrollbar();
        }
        
        if (boot.has('client-marquee')) {
            scheduleClientMarqueeInit();
        }
        if (boot.has('client-marquee-bg')) {
            runAfterPaintWhenIdle(() => deferClientMarqueeBackground(), 4000);
        }
        
        if (boot.has('text-galleries')) {
            initTextGalleries();
        }
        
        // Initialize lightweight canvas background squares AFTER initial paint/idle
        // (keeps first render focused on text/content)
        if (boot.has('square-patterns')) {
            // Keep canvas work out of the initial render window
            runAfterPaintWhenIdle(() => deferSquarePatternsInit(), 4000);
        }
        
        if (boot.has('faq')) {
            initFaqAccordion();
        }

        if (boot.has('services-row')) {
            initServicesRowAlignment();
        }
        if (boot.has('drag-scroll')) {
            initHorizontalDragScroll();
        }
        
        // sticky-cta removed
    }).catch(function(error) {
        // Fallback: at least try to load header if Promise fails
        loadHeader();
        loadFooter();
        runLatestBlogsOnce();
        if (boot.has('services-row')) {
            initServicesRowAlignment();
        }
        if (boot.has('drag-scroll')) {
            initHorizontalDragScroll();
        }
    });
});

function scheduleClientMarqueeInit() {
    const track = document.getElementById('client-marquee-track');
    if (!track) return;
    const section = track.closest('.client-marquee') || track.closest('section') || track.parentElement;
    const start = () => runAfterPaintWhenIdle(() => initClientMarquee(), 5000);

    if ('IntersectionObserver' in window && section) {
        const io = new IntersectionObserver((entries) => {
            if (entries && entries[0] && entries[0].isIntersecting) {
                try { io.disconnect(); } catch (_) {}
                start();
            }
        }, { rootMargin: '250px 0px', threshold: 0 });
        io.observe(section);
    } else {
        start();
    }
}

// Enable click+drag scrolling for horizontally scrollable rows (mouse/pen only).
// Mobile touch scrolling already works via native overflow scrolling.
function initHorizontalDragScroll() {
    const containers = document.querySelectorAll(
        '.services-grid, .values-grid'
    );
    if (!containers.length) return;

    containers.forEach((container) => {
        // Avoid double-binding if init runs multiple times
        if (container.dataset.dragScrollInit === '1') return;
        container.dataset.dragScrollInit = '1';

        // Prevent the browser from starting native drag (common on <a> and <img>)
        // which otherwise blocks our "drag to scroll" behavior on desktop.
        container.querySelectorAll('a, img').forEach((el) => {
            try { el.setAttribute('draggable', 'false'); } catch (_) {}
        });

        let isPointerDown = false;
        let startX = 0;
        let startScrollLeft = 0;
        let didDrag = false;
        let lastDragAt = 0;

        const DRAG_THRESHOLD_PX = 6;

        const onPointerDown = (e) => {
            // Only left button for mouse; ignore touch (native) to avoid fighting the browser
            if (e.pointerType === 'touch') return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            // Only activate if horizontal overflow exists
            if (container.scrollWidth <= container.clientWidth + 2) return;

            isPointerDown = true;
            didDrag = false;
            startX = e.clientX;
            startScrollLeft = container.scrollLeft;

            try { container.setPointerCapture(e.pointerId); } catch (_) {}
            container.classList.add('is-dragging');
        };

        const onPointerMove = (e) => {
            if (!isPointerDown) return;

            const dx = e.clientX - startX;
            if (!didDrag && Math.abs(dx) >= DRAG_THRESHOLD_PX) didDrag = true;

            // Prevent text selection / page panning while dragging
            if (didDrag) e.preventDefault();

            container.scrollLeft = startScrollLeft - dx;
        };

        const endDrag = () => {
            if (!isPointerDown) return;
            isPointerDown = false;
            container.classList.remove('is-dragging');
            if (didDrag) lastDragAt = Date.now();
            // Reset so a browser-suppressed click doesn't block the next real click
            didDrag = false;
        };

        // Prevent accidental link navigation when user was dragging
        const onClickCapture = (e) => {
            if (!lastDragAt || (Date.now() - lastDragAt) > 350) return;
            e.preventDefault();
            e.stopPropagation();
            lastDragAt = 0;
        };

        container.addEventListener('pointerdown', onPointerDown, { passive: true });
        container.addEventListener('pointermove', onPointerMove, { passive: false });
        container.addEventListener('pointerup', endDrag);
        container.addEventListener('pointercancel', endDrag);
        container.addEventListener('pointerleave', endDrag);
        container.addEventListener('click', onClickCapture, true);
        container.addEventListener('dragstart', (e) => {
            // Always disable drag within these rows; it conflicts with horizontal scroll UX.
            e.preventDefault();
        });
    });
}

// Compute a safe relative prefix from the current page to the site root (folder that contains `index.html` and `pages/`).
// This works even if the site is hosted under a subdirectory (e.g. /mysite/...) because we anchor on known root children.
function getSiteRootPrefix() {
    try {
        const path = window.location.pathname || '';
        const segments = path.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || '';
        const dirSegments = last.includes('.') ? segments.slice(0, -1) : segments;

        // These are top-level folders under the site root in this repo.
        const known = ['pages', 'blog', 'tevekenysegeink', 'en'];
        let idx = -1;
        known.forEach(k => {
            const i = dirSegments.lastIndexOf(k);
            if (i > idx) idx = i;
        });

        if (idx === -1) return '';
        const depth = dirSegments.length - idx;
        return '../'.repeat(Math.max(0, depth));
    } catch (e) {
        return '';
    }
}

// BFCache back/forward navigation: re-initialize square pattern backgrounds if needed
window.addEventListener('pageshow', () => {
    try {
        if (window.drawBackground) {
            initCanvasBackgrounds();
        }
    } catch (e) {}
});

function deferSquarePatternsInit() {
    const start = () => {
        loadScriptOnce(getSiteRootPrefix() + 'pages/js/square-background.js')
            .then(() => { initCanvasBackgrounds(); })
            .catch(() => {});
    };

    // Best effort: wait until the browser is idle (or at least shortly after first paint)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(start, { timeout: 2000 });
    } else {
        setTimeout(start, 800);
    }
}

function deferClientMarqueeBackground() {
    const start = () => {
        const marquee = document.querySelector('.client-marquee');
        if (marquee) marquee.classList.add('is-bg-ready');
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(start, { timeout: 2000 });
    } else {
        setTimeout(start, 900);
    }
}

// Sticky CTA removed

// ===== HEADER LOADER FUNCTIONS =====
async function loadHeader() {
    // Get the current page name to determine active states
    const currentPage = getCurrentPageName();

    // If header markup is already present in the HTML (static header),
    // do NOT re-inject it (prevents CLS from "late" DOM insertion).
    const existingNavbar = document.querySelector('nav.navbar');
    const headerPlaceholderExisting = document.getElementById('header-placeholder');
    const placeholderHasNavbar = !!(headerPlaceholderExisting && headerPlaceholderExisting.querySelector && headerPlaceholderExisting.querySelector('nav.navbar'));
    if (existingNavbar && (!headerPlaceholderExisting || placeholderHasNavbar)) {
        // Ensure active states are applied even for static header
        setActiveNavigation();
        setActiveDropdownLinks(currentPage);
        return Promise.resolve();
    }

    const rootPrefix = getSiteRootPrefix();
    // Determine if we're on English pages (supports both /en/ and /pages/en/ deployments)
    const isEnglish = window.location.pathname.includes('/en/') || window.location.pathname.includes('/pages/en/');
    
    // Detect environment: localhost/GitHub Pages need .html, production doesn't
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    const needsHtmlExtension = isLocalhost || isGitHubPages;
    
    // Set paths based on current location
    const pathPrefix = rootPrefix;
    const imagePath = rootPrefix + 'pages/images/logo.svg';
    
    // Smart logo paths that work in both environments
    const logoPath = isEnglish
        ? (rootPrefix + 'pages/en/' + (needsHtmlExtension ? 'index.html' : ''))
        : (rootPrefix + (needsHtmlExtension ? 'index.html' : ''));
    
    // Helper function to add .html extension when needed (for flat pages like arak, kapcsolat, etc.)
    const smartUrl = (baseUrl) => needsHtmlExtension && !baseUrl.includes('.html') && !baseUrl.includes('#') ? baseUrl + '.html' : baseUrl;
    
    // Helper for folder-based routes (we do NOT want to append .html)
    // Example: tevekenysegeink/kozbeszerzes-ajanlatkeroknek/ should stay as a folder URL.
    const smartFolderUrl = (baseUrl) => {
        // Ensure trailing slash for consistent folder navigation
        return baseUrl.endsWith('/') ? baseUrl : (baseUrl + '/');
    };
    
    // Pre-calculate smart URLs for navigation
    const servicesUrl = smartUrl(pathPrefix + 'services');
    const pricesUrl = smartUrl(pathPrefix + 'prices'); 
    const contactUrl = smartUrl(pathPrefix + 'contact');
    const aboutUrl = smartUrl(pathPrefix + 'about');
    const referencesUrl = smartUrl(pathPrefix + 'references');
    // Prefer folder URL for services landing (canonical): /tevekenysegeink/
    const tevekenysegeinkUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink');
    const arakUrl = smartUrl(pathPrefix + 'arak');
    const kapcsolatUrl = smartUrl(pathPrefix + 'kapcsolat');
    const bemutatkozasUrl = smartUrl(pathPrefix + 'bemutatkozas');
    const referenciakUrl = smartUrl(pathPrefix + 'referenciak');
    const hasznoslinkekUrl = smartUrl(pathPrefix + 'hasznos-linkek');
    const blogUrl = smartUrl(pathPrefix + 'blog');
    const adatkezelesiUrl = smartUrl(pathPrefix + 'adatkezelesi-tajekoztato');
    const sitemapUrl = smartUrl(pathPrefix + 'sitemap');
    
    // Homepage URLs (use logoPath logic)
    const homeUrl = logoPath;

    // Service subpages (folder-based) - used by HU header + footer
    const sorgKozbeszAjanlatkeroknekUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/kozbeszerzes-ajanlatkeroknek');
    const sorgKozbeszAjanlattevoknekUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/kozbeszerzes-ajanlattevoknek');
    const sorgJogorvoslatUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/jogorvoslat');
    const sorgPalyazatirasUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/palyazatiras');
    const sorgMuszakiTervezesUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/muszaki-tervezes');

    // Lazily load heavy template strings only if injection is required.
    let headerHTML = '';
    try {
        const { buildHeaderHTML } = await import('./header-footer-templates.js');
        headerHTML = buildHeaderHTML({
            isEnglish,
            imagePath,
            logoPath,
            urls: {
                homeUrl,
                servicesUrl,
                pricesUrl,
                contactUrl,
                aboutUrl,
                referencesUrl,
                tevekenysegeinkUrl,
                arakUrl,
                kapcsolatUrl,
                bemutatkozasUrl,
                referenciakUrl,
                hasznoslinkekUrl,
                blogUrl,
                adatkezelesiUrl,
                sitemapUrl,
                sorgKozbeszAjanlatkeroknekUrl,
                sorgKozbeszAjanlattevoknekUrl,
                sorgJogorvoslatUrl,
                sorgPalyazatirasUrl,
                sorgMuszakiTervezesUrl,
            },
        });
    } catch (e) {
        // If dynamic import is unsupported/blocked, don't break the page.
        // Static pages should already have the header in HTML.
        return Promise.resolve();
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
        langLinks.forEach((link) => {
            // Prefer explicit data-lang (works even if labels change, e.g. "Magyar/English")
            const declared = (link.dataset && link.dataset.lang) ? String(link.dataset.lang).toLowerCase() : '';
            const href = (link.getAttribute && link.getAttribute('href')) ? String(link.getAttribute('href')) : '';
            const inferred =
                declared ||
                (href.includes('pages/en/') || href.includes('/en/') ? 'en' : 'hu');

            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchToLanguage(inferred === 'en' ? 'en' : 'hu');
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
async function loadFooter() {
    // Square patterns CSS is loaded statically in HTML
    
    const rootPrefix = getSiteRootPrefix();
    const isEnglish = window.location.pathname.includes('/en/') || window.location.pathname.includes('/pages/en/');

    // If footer markup is already present in the HTML (static footer),
    // do NOT re-inject it (prevents CLS from "late" DOM insertion).
    const footerPlaceholderExisting = document.getElementById('footer-placeholder');
    const existingFooterInPlaceholder = !!(footerPlaceholderExisting && footerPlaceholderExisting.querySelector && footerPlaceholderExisting.querySelector('footer.footer'));
    const existingFooterAnywhere = !!document.querySelector('footer.footer');
    if (existingFooterInPlaceholder || (!footerPlaceholderExisting && existingFooterAnywhere)) {
        return Promise.resolve();
    }

    // If the page already has a footer and does NOT provide a placeholder,
    // don't inject another one (prevents "double footer" on legacy/static pages).
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) {
        const existingFooter = document.querySelector('footer.footer');
        if (existingFooter) {
            return Promise.resolve();
        }
    }
    
    // Detect environment: localhost/GitHub Pages need .html, production doesn't
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    const needsHtmlExtension = isLocalhost || isGitHubPages;
    
    // Set paths based on current location
    const pathPrefix = rootPrefix;
    
    // Helper function to add .html extension when needed
    const smartUrl = (baseUrl) => needsHtmlExtension && !baseUrl.includes('.html') && !baseUrl.includes('#') ? baseUrl + '.html' : baseUrl;
    
    // Helper for folder-based routes (we do NOT want to append .html)
    const smartFolderUrl = (baseUrl) => (baseUrl.endsWith('/') ? baseUrl : (baseUrl + '/'));
    
    // Footer navigation (canonical URLs)
    const tevekenysegeinkUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink');
    const hasznoslinkekUrl = smartUrl(pathPrefix + 'hasznos-linkek');
    const referenciakUrl = smartUrl(pathPrefix + 'referenciak');
    const rolunkUrl = smartUrl(pathPrefix + 'bemutatkozas');
    const blogUrl = smartUrl(pathPrefix + 'blog');
    const adatkezelesiUrl = smartUrl(pathPrefix + 'adatkezelesi-tajekoztato');
    const sitemapUrl = smartUrl(pathPrefix + 'sitemap');
    
    // Service subpages (folder-based)
    const sorgKozbeszAjanlatkeroknekUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/kozbeszerzes-ajanlatkeroknek');
    const sorgKozbeszAjanlattevoknekUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/kozbeszerzes-ajanlattevoknek');
    const sorgJogorvoslatUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/jogorvoslat');
    const sorgPalyazatirasUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/palyazatiras');
    const sorgMuszakiTervezesUrl = smartFolderUrl(pathPrefix + 'tevekenysegeink/muszaki-tervezes');
    
    // Lazily load heavy template strings only if injection is required.
    let footerHTML = '';
    try {
        const { buildFooterHTML } = await import('./header-footer-templates.js');
        footerHTML = buildFooterHTML({
            urls: {
                tevekenysegeinkUrl,
                hasznoslinkekUrl,
                referenciakUrl,
                rolunkUrl,
                blogUrl,
                adatkezelesiUrl,
                sitemapUrl,
                sorgKozbeszAjanlatkeroknekUrl,
                sorgKozbeszAjanlattevoknekUrl,
                sorgJogorvoslatUrl,
                sorgPalyazatirasUrl,
                sorgMuszakiTervezesUrl,
            },
        });
    } catch (e) {
        // Static pages should already have the footer in HTML.
        return Promise.resolve();
    }

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
        'kapcsolat.html': 'contact',
        'contact.html': 'contact',
        'bemutatkozas.html': 'about',
        'arak.html': 'pricing',
        'sitemap.html': 'sitemap',
        'tevekenysegeink.html': 'services',
        'referenciak.html': 'references',
        'blog.html': 'blog'
    };
    // Folder-based routes: highlight the parent section
    if (path.includes('/tevekenysegeink/')) return 'services';
    if (path.includes('/blog/')) return 'blog';
    return pageMap[filename] || 'other';
}

function setActiveNavigation() {
    const currentPage = getCurrentPageName();
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Set active class based on current page (new central navbar)
    const linkByNav = (nav) => document.querySelector(`.nav-link[data-nav="${nav}"]`);
    if (currentPage === 'home') linkByNav('home')?.classList.add('active');
    if (currentPage === 'services') linkByNav('services')?.classList.add('active');
    if (currentPage === 'pricing') linkByNav('pricing')?.classList.add('active');
    if (currentPage === 'contact' || currentPage === 'about' || currentPage === 'references') {
        linkByNav('more')?.classList.add('active');
    }
    
    // Set active dropdown links
    setActiveDropdownLinks(currentPage);
}

function setActiveDropdownLinks(currentPage) {
    // Set active state for dropdown links
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(link => {
        link.classList.remove('active');
    });

    const currentPath = window.location.pathname || '';
    const currentHref = window.location.href || '';

    // Services subpages: highlight the matching service dropdown link
    if (currentPage === 'services') {
        dropdownLinks.forEach(link => {
            try {
                const href = link.getAttribute('href') || '';
                if (!href) return;
                // Match folder-based service URLs by pathname segment
                if (href.includes('tevekenysegeink/kozbeszerzes-ajanlatkeroknek') && currentPath.includes('/tevekenysegeink/kozbeszerzes-ajanlatkeroknek')) link.classList.add('active');
                if (href.includes('tevekenysegeink/kozbeszerzes-ajanlattevoknek') && currentPath.includes('/tevekenysegeink/kozbeszerzes-ajanlattevoknek')) link.classList.add('active');
                if (href.includes('tevekenysegeink/jogorvoslat') && currentPath.includes('/tevekenysegeink/jogorvoslat')) link.classList.add('active');
                if (href.includes('tevekenysegeink/palyazatiras') && currentPath.includes('/tevekenysegeink/palyazatiras')) link.classList.add('active');
                if (href.includes('tevekenysegeink/muszaki-tervezes') && currentPath.includes('/tevekenysegeink/muszaki-tervezes')) link.classList.add('active');
            } catch (e) {}
        });
        return;
    }

    // "Rólunk" dropdown pages
    if (currentPage === 'contact') {
        dropdownLinks.forEach(link => { if ((link.getAttribute('href') || '').includes('kapcsolat')) link.classList.add('active'); });
    } else if (currentPage === 'about') {
        dropdownLinks.forEach(link => { if ((link.getAttribute('href') || '').includes('bemutatkozas')) link.classList.add('active'); });
    } else if (currentPage === 'references') {
        dropdownLinks.forEach(link => { if ((link.getAttribute('href') || '').includes('referenciak')) link.classList.add('active'); });
    }
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const secondaryNav = document.getElementById('mobileSecondaryNav');
    
    if (hamburger && navMenu) {
        ensureMobileLanguageToggle(navMenu, hamburger, secondaryNav);

        hamburger.addEventListener('click', function() {
            const isActive = hamburger.classList.contains('active');
            
            if (isActive) {
                // Close all mobile navigation
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                if (secondaryNav) secondaryNav.classList.remove('active');
                // Close any inline-expanded dropdowns
                document.querySelectorAll('.nav-item.dropdown.mobile-open').forEach(el => el.classList.remove('mobile-open'));
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

function ensureMobileLanguageToggle(navMenu, hamburger, secondaryNav) {
    try {
        // Idempotent: rebuild each time init runs
        navMenu.querySelectorAll('.mobile-lang-item').forEach((el) => el.remove());

        const languageSwitcher = document.querySelector('.language-switcher');
        if (!languageSwitcher) return;

        const links = languageSwitcher.querySelectorAll('a');
        if (!links || links.length < 2) return;

        const li = document.createElement('li');
        li.className = 'nav-item mobile-lang-item';

        const wrap = document.createElement('div');
        wrap.className = 'mobile-lang-toggle';
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Language');

        const first = links[0].cloneNode(true);
        const second = links[1].cloneNode(true);
        first.classList.add('mobile-lang-btn');
        second.classList.add('mobile-lang-btn');

        const closeAll = () => {
            try { hamburger.classList.remove('active'); } catch (_) {}
            try { navMenu.classList.remove('active'); } catch (_) {}
            try { if (secondaryNav) secondaryNav.classList.remove('active'); } catch (_) {}
        };

        // Close menu immediately on click (navigation will happen or JS switcher will run)
        first.addEventListener('click', closeAll);
        second.addEventListener('click', closeAll);

        wrap.appendChild(first);
        wrap.appendChild(second);
        li.appendChild(wrap);

        navMenu.appendChild(li);
    } catch (e) {
        // no-op: language toggle is optional enhancement
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
        
        // For purely "dropdown-only" menus (href is '#'), we skip adding the main item.
        const isDropdownOnly = (menuData.mainUrl || '') === '#' || (menuData.mainUrl || '') === '';

        if (!isDropdownOnly) {
            const mainItem = document.createElement('li');
            mainItem.innerHTML = `<a href="${menuData.mainUrl}" class="nav-link">${menuData.mainTitle}</a>`;
            secondaryMenu.appendChild(mainItem);
        }

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
                const isMobile = window.innerWidth <= 768 || document.querySelector('.hamburger').offsetParent !== null;
                
                if (isMobile) {
                    // On mobile, expand inline (accordion) instead of opening a separate menu
                    const href = navLink.getAttribute('href') || '';
                    const isOpen = item.classList.contains('mobile-open');

                    // Close other dropdowns
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item) otherItem.classList.remove('mobile-open');
                    });

                    // Always expand/collapse inline on mobile (do not navigate on the group link)
                    e.preventDefault();
                    e.stopPropagation();
                    item.classList.toggle('mobile-open');
                } else {
                    // Dropdown-only menus: always toggle on click (no navigation)
                    const href = navLink.getAttribute('href') || '';
                    if (href === '#' || href === '') {
                        e.preventDefault();
                        e.stopPropagation();
                        const isDropdownOpen = item.classList.contains('active');
                        dropdownItems.forEach(otherItem => otherItem.classList.remove('active'));
                        if (!isDropdownOpen) item.classList.add('active');
                        return;
                    }
                    // Desktop behavior:
                    // Do NOT block navigation just because the link is "active" (we highlight parent sections
                    // like /tevekenysegeink/* or the whole "Rólunk" group on multiple pages).
                    // Only treat it as "current page" if the href resolves to the exact same pathname.
                    const normalizePath = (p) => {
                        try {
                            if (!p) return '/';
                            // Ensure leading slash
                            if (!p.startsWith('/')) p = '/' + p;
                            // Normalize trailing slash (keep root as '/')
                            if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
                            return p;
                        } catch (_) {
                            return p || '/';
                        }
                    };

                    let isExactCurrentPage = false;
                    try {
                        const targetUrl = new URL(navLink.getAttribute('href') || '', window.location.href);
                        const targetPath = normalizePath(targetUrl.pathname);
                        const currentPath = normalizePath(window.location.pathname || '/');
                        isExactCurrentPage = targetPath === currentPath;
                    } catch (_) {
                        isExactCurrentPage = false;
                    }

                    if (isExactCurrentPage) {
                        // If truly on the same page, toggle dropdown instead of reloading the page.
                        e.preventDefault();
                        e.stopPropagation();

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
                        // Different page - allow normal navigation.
                        // Just close any open dropdowns when clicking main nav.
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
                    item.classList.remove('mobile-open');
                    
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
            currentPage === 'procurement-changes-2024.html'
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
        
        // English to Hungarian (reverse mapping)
        'procurement-changes-2024.html': 'kozbeszerzes-valtozasok-2024.html',
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
    
    // Handle clicks on anchor links via delegation (avoids binding handlers to every <a>)
    document.addEventListener('click', function(e) {
        const a = e.target && e.target.closest ? e.target.closest('a[href*="#"]') : null;
        if (!a) return;

        const href = a.getAttribute('href') || '';
        if (!href.includes('#')) return;

        const parts = href.split('#');
        const page = parts[0] || '';
        const anchor = parts[1] || '';
        if (!anchor) return;

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
    }, { passive: false });
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
                url: 'pages/blog/kozbeszerzes-valtozasok-2024.html'
            }
        ];
    }

    // Sort blogs by date (newest first). If date is missing/invalid, push to the end.
    blogData.sort((a, b) => {
        const aTime = a?.date ? Date.parse(a.date) : NaN;
        const bTime = b?.date ? Date.parse(b.date) : NaN;
        const aValid = Number.isFinite(aTime);
        const bValid = Number.isFinite(bTime);

        if (!aValid && !bValid) return 0;
        if (!aValid) return 1;
        if (!bValid) return -1;
        return bTime - aTime;
    });
    
    // Check for both homepage and blog page grids
    const homepageGrid = document.querySelector('.blog-preview-grid');
    const blogGrid = document.querySelector('.blog-grid');
    
    if (!homepageGrid && !blogGrid) return;
    
    // Homepage: show ONLY if there are at least 3 posts from the last 1 year; otherwise hide the whole section.
    if (homepageGrid) {
        const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const recentBlogs = blogData.filter((blog) => {
            const dateStr = blog?.date;
            if (!dateStr) return false;
            // Parse as UTC midnight to avoid timezone surprises with YYYY-MM-DD parsing.
            const t = Date.parse(`${dateStr}T00:00:00Z`);
            if (!Number.isFinite(t)) return false;
            if (t > now) return false;
            return (now - t) <= ONE_YEAR_MS;
        });

        if (recentBlogs.length < 3) {
            const section = homepageGrid.closest('section.blog-preview');
            if (section) section.style.display = 'none';
        } else {
            recentBlogs.slice(0, 3).forEach(blog => {
                try {
                    const homepageCard = createBlogCard(blog, blog.url, 'homepage');
                    homepageGrid.appendChild(homepageCard);
                } catch (error) {}
            });
        }
    }

    if (blogGrid) {
        blogData.forEach(blog => {
            try {
                const blogCard = createBlogCard(blog, blog.url, 'blog');
                blogGrid.appendChild(blogCard);
            } catch (error) {}
        });
    }
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
async function initClientMarquee() {
    const marqueeTrack = document.getElementById('client-marquee-track');
    if (!marqueeTrack) return; // Only run where markup exists

    // Cache parsed clients to avoid fetch + DOMParser work on every refresh.
    const CACHE_KEY = 'sugallat_client_marquee_clients_v1';
    let clientData = [];

    try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length) clientData = parsed;
        }
    } catch (_) {}

    if (!clientData.length) {
        try {
            const currentPath = window.location.pathname || '';
            const referencesPath = currentPath.includes('/en/') ? '../referenciak.html' : './referenciak.html';
            const response = await fetch(referencesPath, { cache: 'force-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const html = await response.text();
            clientData = parseReferencesFromHTML(html);
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(clientData)); } catch (_) {}
        } catch (_) {
            // Minimal fallback list (keep light to avoid huge JS parse/GC cost)
            clientData = [
                { name: "Fővárosi Törvényszék", category: "Kormányzati/Állami szervezet", period: "2011-2014", service: "Közbeszerzés, jogi tanácsadás" },
                { name: "Magyar Telekom Nyrt.", category: "Vállalkozás", period: "2011-2014", service: "Műszaki tervezés, közbeszerzés" },
                { name: "Budapest Főváros", category: "Település, önkormányzat", period: "2008-2011", service: "Városfejlesztés, EU pályázatok" },
                { name: "Nyugat-Magyarországi Egyetem", category: "Oktatási intézmény", period: "2005-2008", service: "Közbeszerzés, projektmenedzsment" },
            ];
        }
    }

    // Clear any previous content (for rebuilds)
    marqueeTrack.innerHTML = '';
    const marqueeContainer = marqueeTrack.parentElement;
    if (marqueeContainer && !marqueeContainer.classList.contains('two-rows')) {
        marqueeContainer.classList.add('two-rows');
    }

    // Create a second track element below, moving in opposite direction
    let secondTrack = marqueeContainer ? marqueeContainer.querySelector('#client-marquee-track-2') : null;
    if (!secondTrack && marqueeContainer) {
        secondTrack = document.createElement('div');
        secondTrack.id = 'client-marquee-track-2';
        secondTrack.className = 'marquee-track reverse';
        marqueeContainer.appendChild(secondTrack);
    }
    if (!secondTrack) return;
    secondTrack.classList.add('reverse');
    secondTrack.innerHTML = '';

    // Split data into two roughly equal sets
    const midpoint = Math.ceil(clientData.length / 2);
    const topRowData = clientData.slice(0, midpoint);
    const bottomRowData = clientData.slice(midpoint);

    const escapeHtml = (s) =>
        String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const renderClientCardHtml = (client) => {
        const name = escapeHtml(client.name);
        const category = escapeHtml(client.category);
        const period = escapeHtml(client.period);
        const service = escapeHtml(client.service);
        return `<div class="client-card">
            <div class="client-name">${name}</div>
            <div class="client-category">${category}</div>
            <div class="client-labels">
                <span class="client-label">${period}</span>
                <span class="client-label">${service}</span>
            </div>
        </div>`;
    };

    const renderTrackHtml = (dataSet) => {
        const base = (dataSet || []).map(renderClientCardHtml).join('');
        return base + base; // duplicate for seamless loop
    };

    marqueeTrack.innerHTML = renderTrackHtml(topRowData.length ? topRowData : clientData);
    secondTrack.innerHTML = renderTrackHtml(bottomRowData.length ? bottomRowData : clientData);

    // Add drag functionality for both rows
    initMarqueeDrag(marqueeTrack);
    initMarqueeDrag(secondTrack);

    // Bind a single resize handler (rebuild only when width meaningfully changes)
    if (!window.__sugallatClientMarqueeResizeBound) {
        window.__sugallatClientMarqueeResizeBound = true;
        window.__sugallatClientMarqueeWidth = window.innerWidth || 0;
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const prev = window.__sugallatClientMarqueeWidth || 0;
                const next = window.innerWidth || 0;
                window.__sugallatClientMarqueeWidth = next;
                if (Math.abs(next - prev) > 240) {
                    try { initClientMarquee(); } catch (_) {}
                }
            }, 250);
        }, { passive: true });
    }
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

// ===== HOMEPAGE SERVICES: CENTER IF FITS, ELSE SHOW SCROLL CUE =====
function initServicesRowAlignment() {
    const grids = document.querySelectorAll('.services.light-bg .services-grid');
    if (!grids.length) return;

    let resizeTimeout;
    const update = () => {
        grids.forEach(grid => {
            // If content width exceeds container width, it's scrollable
            const isScrollable = grid.scrollWidth > grid.clientWidth + 2;
            grid.classList.toggle('is-scrollable', isScrollable);
            const wrap = grid.closest('.services-grid-wrap');
            if (wrap) wrap.classList.toggle('is-scrollable', isScrollable);

            // If it isn't scrollable, ensure it's reset/centered
            if (!isScrollable) {
                grid.scrollLeft = 0;
            }
        });
    };

    // Run after layout settles
    requestAnimationFrame(update);
    // One follow-up pass is enough; avoid multiple timers that trigger forced reflow
    setTimeout(update, 200);

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(update, 120);
    }, { passive: true });
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