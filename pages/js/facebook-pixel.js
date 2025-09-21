// ===== FACEBOOK PIXEL TRACKING =====
// Replace 'YOUR_PIXEL_ID_HERE' with your actual Facebook Pixel ID

// Facebook Pixel Base Code
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Configuration - Replace with your actual Pixel ID
const FACEBOOK_PIXEL_ID = 'YOUR_PIXEL_ID_HERE';

// Initialize Facebook Pixel
fbq('init', FACEBOOK_PIXEL_ID);

// Track PageView by default
fbq('track', 'PageView');

// ===== CUSTOM TRACKING FUNCTIONS =====

// Track different page types with custom events
function trackPageType() {
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
}

// Track contact form interactions
function trackContactFormInteraction(action) {
    fbq('track', 'Lead', {
        content_name: 'Kapcsolatfelvételi űrlap',
        status: action // 'started', 'completed'
    });
}

// Track service interest (when clicking on service links)
function trackServiceInterest(serviceName) {
    fbq('track', 'ViewContent', {
        content_type: 'service_detail',
        content_name: serviceName
    });
}

// Track pricing page interactions
function trackPricingInterest(section) {
    fbq('track', 'ViewContent', {
        content_type: 'pricing_section',
        content_name: section
    });
}

// Track download or external link clicks
function trackExternalClick(linkType, linkName) {
    fbq('track', 'ViewContent', {
        content_type: 'external_link',
        content_name: linkName,
        link_type: linkType
    });
}

// Helper function to get current page name (reused from main.js)
function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    const pageMap = {
        'weboldal.html': 'home',
        'index.html': 'home',
        'kapcsolat.html': 'contact',
        'rolunk.html': 'about',
        'arak.html': 'pricing',
        'szolgaltatasok.html': 'services',
        'referenciak.html': 'references'
    };
    
    return pageMap[filename] || 'other';
}

// ===== AUTO-INITIALIZE =====
// Wait for DOM to be ready, then track page type
document.addEventListener('DOMContentLoaded', function() {
    // Track the specific page type
    trackPageType();
    
    // Add event listeners for enhanced tracking
    addEventListeners();
});

// ===== EVENT LISTENERS FOR ENHANCED TRACKING =====
function addEventListeners() {
    // Track contact form interactions
    const contactForms = document.querySelectorAll('form');
    contactForms.forEach(form => {
        form.addEventListener('focus', function() {
            trackContactFormInteraction('started');
        }, { once: true }); // Only track once per page load
        
        form.addEventListener('submit', function() {
            trackContactFormInteraction('completed');
        });
    });
    
    // Track service link clicks
    const serviceLinks = document.querySelectorAll('a[href*="szolgaltatasok.html"]');
    serviceLinks.forEach(link => {
        link.addEventListener('click', function() {
            const serviceName = this.textContent.trim();
            trackServiceInterest(serviceName);
        });
    });
    
    // Track pricing section clicks
    const pricingLinks = document.querySelectorAll('a[href*="arak.html"]');
    pricingLinks.forEach(link => {
        link.addEventListener('click', function() {
            const href = this.getAttribute('href');
            const section = href.includes('#') ? href.split('#')[1] : 'main';
            trackPricingInterest(section);
        });
    });
    
    // Track external links (useful links page)
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="sugallat"])');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            const linkName = this.textContent.trim();
            const linkType = 'external';
            trackExternalClick(linkType, linkName);
        });
    });
    
    // Track email and phone clicks
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function() {
            fbq('track', 'Contact', {
                contact_method: 'email'
            });
        });
    });
    
    phoneLinks.forEach(link => {
        link.addEventListener('click', function() {
            fbq('track', 'Contact', {
                contact_method: 'phone'
            });
        });
    });
}

// ===== GDPR COMPLIANCE FUNCTIONS =====
// Check if user has consented to tracking
function hasTrackingConsent() {
    return localStorage.getItem('fb_pixel_consent') === 'true';
}

// Set tracking consent
function setTrackingConsent(consent) {
    localStorage.setItem('fb_pixel_consent', consent.toString());
    if (consent) {
        // Re-initialize tracking if consent is given
        fbq('init', FACEBOOK_PIXEL_ID);
        fbq('track', 'PageView');
        trackPageType();
    }
}

// Revoke tracking consent
function revokeTrackingConsent() {
    localStorage.setItem('fb_pixel_consent', 'false');
    // Note: This doesn't fully disable already loaded pixels, 
    // but prevents future tracking calls
}

// Export functions for use in other scripts
window.FacebookPixelTracker = {
    trackContactFormInteraction,
    trackServiceInterest,
    trackPricingInterest,
    trackExternalClick,
    hasTrackingConsent,
    setTrackingConsent,
    revokeTrackingConsent
};
