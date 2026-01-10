// ===== UNIVERSAL TRACKING SCRIPT =====
// This script should be included on every page to ensure consistent tracking and GDPR compliance

(function() {
    'use strict';
    
	// Configuration (overridden by window.siteData.config if available)
	let FACEBOOK_PIXEL_ID = 'YOUR_PIXEL_ID_HERE'; // fallback; prefer site config
	let GOOGLE_ANALYTICS_ID = 'G-XXXXXXXXXX'; // fallback; prefer site config
	let PRIVACY_MODE = 'consent_only'; // 'consent_only' | 'strict'
	let facebookInitialized = false;
	let gaInitialized = false;
	const SCRIPT_BASE_PATH = getScriptBasePath();

	// Try to read tracking config from window.siteData.config or global siteData.config
	function readTrackingConfig() {
		try {
			// Support both window.siteData.config and global siteData.config
			const cfgRoot = (window.siteData && window.siteData.config) || (typeof siteData !== 'undefined' && siteData && siteData.config) || null;
			if (!cfgRoot) return null;
			// Allow either cfgRoot.tracking or direct keys on cfgRoot
			const cfg = cfgRoot.tracking || cfgRoot;
			return {
				facebook_pixel: cfg.facebook_pixel || cfg.facebookPixel || null,
				gtag_config: cfg.gtag_config || cfg.ga4 || cfg.ga_measurement_id || null,
				privacy_mode: cfg.privacy_mode || cfg.privacyMode || 'consent_only'
			};
		} catch (e) { return null; }
	}

	// Wait for site config to be ready (supports a custom 'siteConfigReady' event)
	function waitForSiteConfig(timeoutMs = 1500) {
		return new Promise((resolve) => {
			const existing = readTrackingConfig();
			if (existing) { resolve(existing); return; }
			let resolved = false;
			const onReady = () => {
				if (resolved) return;
				const cfg = readTrackingConfig();
				if (cfg) { resolved = true; resolve(cfg); }
			};
			window.addEventListener('siteConfigReady', onReady, { once: true });
			setTimeout(() => { if (!resolved) resolve(readTrackingConfig()); }, timeoutMs);
		});
	}

	// Privacy signals
	function isGPCEnabled() {
		return navigator && navigator.globalPrivacyControl === true;
	}
	function isDNTEnabled() {
		const dnt = (navigator && (navigator.doNotTrack || navigator.msDoNotTrack)) || (window && window.doNotTrack);
		return dnt === '1' || dnt === 1;
	}
	function allowMarketing(consent) {
		// Require marketing consent
		const consented = consent === true || (consent && typeof consent === 'object' && consent.marketing === true);
		if (!consented) return false;
		// Always honor GPC
		if (isGPCEnabled()) return false;
		// DNT honored only in strict mode; bypass in consent_only
		if (PRIVACY_MODE === 'strict' && isDNTEnabled()) return false;
		return true;
	}
    
    // Determine the base path for loading other scripts
    function getScriptBasePath() {
        const isInSubdirectory = window.location.pathname.includes('/blog/') || window.location.pathname.includes('/en/');
        return isInSubdirectory ? '../js/' : 'js/';
    }
    
    // Load external scripts dynamically
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        if (callback) {
            script.onload = callback;
        }
        document.head.appendChild(script);
        return script;
    }
    
    // Load CSS dynamically
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    
    // Initialize Google Analytics 4
	function initGoogleAnalytics() {
		if (gaInitialized) return;
		if (!GOOGLE_ANALYTICS_ID || GOOGLE_ANALYTICS_ID === 'G-XXXXXXXXXX') return; // no-op without a real ID
        
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GOOGLE_ANALYTICS_ID, {
            anonymize_ip: true, // GDPR compliance
            cookie_flags: 'SameSite=None;Secure'
        });
        
		// Make gtag globally available
		window.gtag = gtag;
		gaInitialized = true;
    }
    
    // Initialize Facebook Pixel
	function initFacebookPixel() {
		if (facebookInitialized) return;
		if (!FACEBOOK_PIXEL_ID || FACEBOOK_PIXEL_ID === 'YOUR_PIXEL_ID_HERE') return; // no-op without a real ID
        // Facebook Pixel Base Code
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        // Initialize with pixel ID
        fbq('init', FACEBOOK_PIXEL_ID);
		fbq('track', 'PageView');
        
        // Add noscript fallback
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1" />`;
        document.body.appendChild(noscript);
		facebookInitialized = true;
    }
    
    // Track page-specific events
    function trackPageEvents() {
        const currentPage = getCurrentPageName();
        const pagePath = window.location.pathname;
        
        switch(currentPage) {
            case 'home':
                fbq('track', 'ViewContent', {
                    content_type: 'homepage',
                    content_name: 'Főoldal - Sugallat Kft.'
                });
                break;
                
            case 'services':
                fbq('track', 'ViewContent', {
                    content_type: 'services',
                    content_name: 'Szolgáltatások'
                });
                break;
                
            case 'pricing':
                fbq('track', 'ViewContent', {
                    content_type: 'pricing',
                    content_name: 'Áraink'
                });
                break;
                
            case 'contact':
                fbq('track', 'ViewContent', {
                    content_type: 'contact',
                    content_name: 'Kapcsolat'
                });
                break;
                
            case 'about':
                fbq('track', 'ViewContent', {
                    content_type: 'about',
                    content_name: 'Rólunk'
                });
                break;
                
            case 'references':
                fbq('track', 'ViewContent', {
                    content_type: 'references',
                    content_name: 'Referenciák'
                });
                break;
                
            default:
                if (pagePath.includes('/blog/')) {
                    fbq('track', 'ViewContent', {
                        content_type: 'blog_post',
                        content_name: document.title
                    });
                } else if (pagePath.includes('blog.html')) {
                    fbq('track', 'ViewContent', {
                        content_type: 'blog_listing',
                        content_name: 'Blog'
                    });
                } else if (pagePath.includes('sitemap.html')) {
                    fbq('track', 'ViewContent', {
                        content_type: 'sitemap',
                        content_name: 'Oldaltérkép'
                    });
                }
        }
        
        // Google Analytics tracking
        if (window.gtag) {// Enhanced page view tracking
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname,
                content_group1: currentPage // Custom dimension for page type
            });
            
            // Track specific page types with custom events
            switch(currentPage) {
                case 'services':
                    gtag('event', 'view_services', {
                        event_category: 'engagement',
                        event_label: 'services_page'
                    });
                    break;
                    
                case 'pricing':
                    gtag('event', 'view_pricing', {
                        event_category: 'engagement',
                        event_label: 'pricing_page',
                        value: 1
                    });
                    break;
                    
                case 'contact':
                    gtag('event', 'view_contact', {
                        event_category: 'engagement',
                        event_label: 'contact_page',
                        value: 2
                    });
                    break;
                    
                case 'references':
                    gtag('event', 'view_references', {
                        event_category: 'engagement',
                        event_label: 'references_page'
                    });
                    break;
                    
                case 'about':
                    gtag('event', 'view_about', {
                        event_category: 'engagement',
                        event_label: 'about_page'
                    });
                    break;
            }
        }
    }
    
    // Get current page name
    function getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        const pageMap = {
            'index.html': 'home',
            'index.html': 'home',
            'kapcsolat.html': 'contact',
            'contact.html': 'contact',
            'bemutatkozas.html': 'about',
            'about.html': 'about',
            'arak.html': 'pricing',
            'prices.html': 'pricing',
            'tevekenysegeink.html': 'services',
            'services.html': 'services',
            'referenciak.html': 'references',
            'references.html': 'references'
        };

        // Folder-based routes
        if (path.includes('/tevekenysegeink/')) return 'services';
        if (path.includes('/blog/')) return 'blog';
        return pageMap[filename] || 'other';
    }

	// Build a relative URL to the site root (works for nested folders)
	function getRelativeRootPrefix() {
		try {
			const parts = (window.location.pathname || '/').split('/').filter(Boolean);
			if (parts.length === 0) return '';

			const last = parts[parts.length - 1];
			const isFile = last.includes('.');
			const dirDepth = isFile ? parts.length - 1 : parts.length;

			return '../'.repeat(Math.max(0, dirDepth));
		} catch (e) {
			return '';
		}
	}

	function getCookiePolicyHref() {
		return `${getRelativeRootPrefix()}adatkezelesi-tajekoztato.html#cookie-policy`;
	}
    
    // Initialize cookie consent banner
    function initCookieConsent() {
        // Add cookie consent styles
        const styles = `
            .cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                border-top: 1px solid #e5e7eb;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                padding: 1rem 0;
            }
            
            .cookie-consent-banner.show {
                transform: translateY(0);
            }
            
            .cookie-consent-banner.hide {
                transform: translateY(100%);
            }
            
            .cookie-consent-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 1rem;
                display: flex;
                align-items: center;
                gap: 2rem;
                flex-wrap: wrap;
            }
            
            .cookie-consent-text {
                flex: 1;
                min-width: 300px;
            }
            
            .cookie-consent-text h3 {
                color: #1e40af;
                font-size: 1.25rem;
                margin-bottom: 0.5rem;
            }
            
            .cookie-consent-text p {
                color: #374151;
                font-size: 0.9rem;
                line-height: 1.5;
                margin: 0;
            }

			.cookie-consent-text a,
			.cookie-modal a {
				color: #1e40af;
				text-decoration: underline;
				text-underline-offset: 2px;
			}

			.cookie-consent-text a:hover,
			.cookie-modal a:hover {
				color: #1d4ed8;
			}
            
            .cookie-consent-buttons {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .cookie-consent-buttons .btn {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                white-space: nowrap;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                cursor: pointer;
                text-align: center;
            }
            
            .cookie-consent-buttons .btn-primary {
                background: linear-gradient(135deg, #1e40af, #1d4ed8);
                color: white;
                box-shadow: 0 4px 15px rgba(30, 64, 175, 0.4);
            }
            
            .cookie-consent-buttons .btn-primary:hover {
                background: linear-gradient(135deg, #1d4ed8, #1e40af);
                transform: translateY(-2px);
            }
            
            .cookie-consent-buttons .btn-outline {
                background: transparent;
                color: #1e40af;
                border: 2px solid #1e40af;
            }
            
            .cookie-consent-buttons .btn-outline:hover {
                background: #1e40af;
                color: white;
                transform: translateY(-2px);
            }
            
            .cookie-consent-buttons .btn-secondary {
                background: #f8fafc;
                color: #374151;
                border: 2px solid #d1d5db;
            }
            
            .cookie-consent-buttons .btn-secondary:hover {
                background: #e5e7eb;
                border-color: #9ca3af;
                transform: translateY(-2px);
            }
            
            .cookie-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                padding: 1rem;
            }
            
            .cookie-modal.show {
                opacity: 1;
                visibility: visible;
            }
            
            .cookie-modal-content {
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            
            .cookie-modal.show .cookie-modal-content {
                transform: translateY(0);
            }
            
            .cookie-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .cookie-modal-header h2 {
                color: #1e40af;
                font-size: 1.5rem;
                margin: 0;
            }
            
            .cookie-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #6b7280;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .cookie-modal-close:hover {
                color: #374151;
            }
            
            .cookie-modal-body {
                padding: 1.5rem;
            }
            
            .cookie-category {
                margin-bottom: 2rem;
            }
            
            .cookie-category h3 {
                color: #374151;
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
            }
            
            .cookie-category p {
                color: #6b7280;
                font-size: 0.9rem;
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            
            .cookie-toggle {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                font-size: 0.9rem;
                color: #374151;
            }
            
            .cookie-toggle input[type="checkbox"] {
                display: none;
            }
            
            .cookie-slider {
                width: 50px;
                height: 26px;
                background: #d1d5db;
                border-radius: 13px;
                position: relative;
                transition: background 0.3s ease;
            }
            
            .cookie-slider::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 22px;
                height: 22px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s ease;
            }
            
            .cookie-toggle input[type="checkbox"]:checked + .cookie-slider {
                background: #2563eb;
            }
            
            .cookie-toggle input[type="checkbox"]:checked + .cookie-slider::before {
                transform: translateX(24px);
            }
            
            .cookie-toggle input[type="checkbox"]:disabled + .cookie-slider {
                background: #9ca3af;
                cursor: not-allowed;
            }
            
            .cookie-modal-footer {
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            
            @media (max-width: 768px) {
                .cookie-consent-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }
                
                .cookie-consent-buttons {
                    justify-content: center;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // Check if consent already given
        if (getCookieConsent() !== null) {
            return;
        }
        
        // Create banner
        const bannerHTML = `
            <div id="cookie-consent-banner" class="cookie-consent-banner">
                <div class="cookie-consent-content">
                    <div class="cookie-consent-text">
                        <h3>Süti (Cookie) tájékoztató</h3>
                        <p>Ez a weboldal sütiket használ a jobb felhasználói élmény biztosításához, valamint (opcionálisan) analitikai és marketing célokra.</p>
                    </div>
                    <div class="cookie-consent-buttons">
                        <button id="cookie-accept" class="btn btn-primary">Összes elfogadása</button>
                        <button id="cookie-settings" class="btn btn-secondary">Beállítások</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        
        // Add event listeners
        document.getElementById('cookie-accept').addEventListener('click', acceptCookies);
        document.getElementById('cookie-settings').addEventListener('click', showCookieSettings);
        
        // Show banner
        setTimeout(() => {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.add('show');
            }
        }, 500);
    }
    
    // Cookie consent functions
	function acceptCookies() {
		setCookieConsent({
            necessary: true,
            marketing: true
		});
		hideBanner();
		// Initialize tracking systems after consent (with privacy gating)
		const consent = getCookieConsent();
		if (allowMarketing(consent)) {
			initGoogleAnalytics();
			initFacebookPixel();
			setTimeout(() => { trackPageEvents(); }, 100);
		}
    }
    
    function showCookieSettings() {
		const consent = getCookieConsent();
		const marketingEnabled =
			consent === true ||
			(!!consent && typeof consent === 'object' && consent.marketing === true);
		const policyHref = getCookiePolicyHref();

        const modalHTML = `
            <div id="cookie-settings-modal" class="cookie-modal">
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h2>Süti beállítások</h2>
                        <button id="close-cookie-modal" class="cookie-modal-close">&times;</button>
                    </div>
                    <div class="cookie-modal-body">
                        <div class="cookie-category">
                            <h3>Szükséges sütik</h3>
                            <p>Ezek a sütik a weboldal alapvető működéséhez szükségesek és nem kapcsolhatók ki.</p>
                            <label class="cookie-toggle">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-slider"></span>
                                Szükséges sütik (mindig aktív)
                            </label>
                        </div>
                        <div class="cookie-category">
                            <h3>Analitikai és marketing sütik</h3>
                            <p>Ezek a sütik segítenek megérteni a weboldal használatát és lehetővé teszik releváns hirdetések megjelenítését.</p>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="marketing-cookies" ${marketingEnabled ? 'checked' : ''}>
                                <span class="cookie-slider"></span>
                                Google Analytics és Facebook Pixel
                            </label>
                        </div>
						<p style="margin: 0; color: #6b7280; font-size: 0.9rem; line-height: 1.5;">
							Részletek: <a href="${policyHref}" target="_blank" rel="noopener">Cookie szabályzat</a>.
						</p>
                    </div>
                    <div class="cookie-modal-footer">
                        <button id="save-cookie-settings" class="btn btn-primary">Beállítások mentése</button>
                        <button id="accept-all-modal" class="btn btn-outline">Összes elfogadása</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        document.getElementById('close-cookie-modal').addEventListener('click', closeCookieModal);
        document.getElementById('save-cookie-settings').addEventListener('click', saveCookieSettings);
        document.getElementById('accept-all-modal').addEventListener('click', acceptAllFromModal);

        // Show modal
        setTimeout(() => {
            const modal = document.getElementById('cookie-settings-modal');
            if (modal) {
                modal.classList.add('show');
            }
        }, 100);
    }
    
    function closeCookieModal() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.remove();
        }
    }
    
	function saveCookieSettings() {
		const marketingEnabled = document.getElementById('marketing-cookies').checked;
		setCookieConsent({
            necessary: true,
            marketing: marketingEnabled
		});
		if (allowMarketing(getCookieConsent())) {
			initGoogleAnalytics();
			initFacebookPixel();
			setTimeout(() => { trackPageEvents(); }, 100);
		}
        
        closeCookieModal();
        hideBanner();
    }
    
    function acceptAllFromModal() {
        document.getElementById('marketing-cookies').checked = true;
        saveCookieSettings();
    }
    
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('hide');
            setTimeout(() => banner.remove(), 300);
        }
    }
    
    function setCookieConsent(consent) {
        const consentData = {
            timestamp: new Date().toISOString(),
            consent: consent
        };
        localStorage.setItem('sugallat_cookie_consent', JSON.stringify(consentData));
    }
    
    function getCookieConsent() {
        try {
            const stored = localStorage.getItem('sugallat_cookie_consent');
            if (stored) {
                const data = JSON.parse(stored);
                return data.consent;
            }
        } catch (e) {}
        return null;
    }
    
    // Initialize everything when DOM is ready
	async function init() {
		// Merge in central config if present
		const cfg = await waitForSiteConfig();
		if (cfg) {
			if (cfg.facebook_pixel) FACEBOOK_PIXEL_ID = cfg.facebook_pixel;
			if (cfg.gtag_config) GOOGLE_ANALYTICS_ID = cfg.gtag_config;
			if (cfg.privacy_mode) PRIVACY_MODE = cfg.privacy_mode;
		}
		const consent = getCookieConsent();
		if (consent === null) {
			// No decision yet, show banner
			initCookieConsent();
			return;
		}
		if (allowMarketing(consent)) {
			initGoogleAnalytics();
			initFacebookPixel();
			setTimeout(() => { trackPageEvents(); }, 100);
		}
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for external use
	window.UniversalTracking = {
		initFacebookPixel,
		trackPageEvents,
		getCookieConsent,
		setCookieConsent,
		showCookieSettings
	};
})();
