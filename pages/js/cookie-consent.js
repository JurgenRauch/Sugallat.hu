// ===== GDPR COOKIE CONSENT BANNER =====

// Cookie consent configuration
const CONSENT_COOKIE_NAME = 'sugallat_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

// Create and show cookie consent banner
function createCookieConsentBanner() {
    // Check if consent has already been given or denied
    if (getCookieConsent() !== null) {
        return; // Don't show banner if already decided
    }

    // Create banner HTML
    const bannerHTML = `
        <div id="cookie-consent-banner" class="cookie-consent-banner">
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>Süti (Cookie) tájékoztató</h3>
                    <p>Ez a weboldal sütiket használ a jobb felhasználói élmény biztosítása és a marketing célú adatgyűjtés érdekében. A Facebook pixel segítségével követjük a látogatók viselkedését, hogy releváns hirdetéseket tudjunk megjeleníteni. A folytatással elfogadja a sütik használatát.</p>
                </div>
                <div class="cookie-consent-buttons">
                    <button id="cookie-accept" class="btn btn-primary">Elfogadom</button>
                    <button id="cookie-decline" class="btn btn-outline">Elutasítom</button>
                    <button id="cookie-settings" class="btn btn-secondary">Beállítások</button>
                </div>
            </div>
        </div>
    `;

    // Add banner to page
    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    // Add event listeners
    document.getElementById('cookie-accept').addEventListener('click', acceptAllCookies);
    document.getElementById('cookie-decline').addEventListener('click', declineAllCookies);
    document.getElementById('cookie-settings').addEventListener('click', showCookieSettings);

    // Show banner with animation
    setTimeout(() => {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('show');
        }
    }, 500);
}

// Show detailed cookie settings modal
function showCookieSettings() {
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
                        <h3>Marketing sütik</h3>
                        <p>Ezek a sütik lehetővé teszik számunkra, hogy nyomon kövessük a látogatók viselkedését és releváns hirdetéseket jelenítsünk meg a Facebook-on.</p>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="marketing-cookies" checked>
                            <span class="cookie-slider"></span>
                            Facebook Pixel és marketing sütik
                        </label>
                    </div>
                    <div class="cookie-category">
                        <h3>Analitikai sütik</h3>
                        <p>Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalt.</p>
                        <label class="cookie-toggle">
                            <input type="checkbox" id="analytics-cookies" checked>
                            <span class="cookie-slider"></span>
                            Google Analytics és hasonló szolgáltatások
                        </label>
                    </div>
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

// Accept all cookies
function acceptAllCookies() {
    setCookieConsent({
        necessary: true,
        marketing: true,
        analytics: true
    });
    
    // Initialize Facebook Pixel if available
    if (window.FacebookPixelTracker) {
        window.FacebookPixelTracker.setTrackingConsent(true);
    }
    
    hideCookieBanner();
}

// Decline all non-necessary cookies
function declineAllCookies() {
    setCookieConsent({
        necessary: true,
        marketing: false,
        analytics: false
    });
    
    // Disable Facebook Pixel if available
    if (window.FacebookPixelTracker) {
        window.FacebookPixelTracker.revokeTrackingConsent();
    }
    
    hideCookieBanner();
}

// Save custom cookie settings
function saveCookieSettings() {
    const marketingEnabled = document.getElementById('marketing-cookies').checked;
    const analyticsEnabled = document.getElementById('analytics-cookies').checked;
    
    setCookieConsent({
        necessary: true,
        marketing: marketingEnabled,
        analytics: analyticsEnabled
    });
    
    // Handle Facebook Pixel based on marketing consent
    if (window.FacebookPixelTracker) {
        if (marketingEnabled) {
            window.FacebookPixelTracker.setTrackingConsent(true);
        } else {
            window.FacebookPixelTracker.revokeTrackingConsent();
        }
    }
    
    closeCookieModal();
    hideCookieBanner();
}

// Accept all from modal
function acceptAllFromModal() {
    document.getElementById('marketing-cookies').checked = true;
    document.getElementById('analytics-cookies').checked = true;
    saveCookieSettings();
}

// Close cookie settings modal
function closeCookieModal() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
        modal.remove();
    }
}

// Hide cookie banner
function hideCookieBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.classList.add('hide');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

// Set cookie consent in localStorage and cookie
function setCookieConsent(consent) {
    const consentData = {
        timestamp: new Date().toISOString(),
        consent: consent
    };
    
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consentData));
    
    // Also set a cookie for server-side access if needed
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
    document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(consentData)}; expires=${expiryDate.toUTCString()}; path=/`;
}

// Get cookie consent from localStorage
function getCookieConsent() {
    try {
        const stored = localStorage.getItem(CONSENT_COOKIE_NAME);
        if (stored) {
            const data = JSON.parse(stored);
            return data.consent;
        }
    } catch (e) {
        console.error('Error reading cookie consent:', e);
    }
    return null;
}

// Check if specific cookie type is allowed
function isCookieAllowed(type) {
    const consent = getCookieConsent();
    return consent && consent[type] === true;
}

// Initialize cookie consent system
function initCookieConsent() {
    // Add CSS for cookie banner
    addCookieConsentStyles();
    
    // Show banner if needed
    createCookieConsentBanner();
}

// Add CSS styles for cookie consent
function addCookieConsentStyles() {
    const styles = `
        <style>
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
        
        .cookie-consent-buttons {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        
        .cookie-consent-buttons .btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            white-space: nowrap;
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
            
            .cookie-modal-footer {
                flex-direction: column;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCookieConsent);

// Export functions for external use
window.CookieConsent = {
    getCookieConsent,
    isCookieAllowed,
    setCookieConsent,
    showCookieSettings: showCookieSettings
};
