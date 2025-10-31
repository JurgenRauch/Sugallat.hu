// Central site configuration for tracking
// Ensure this file loads BEFORE universal-tracking.js on every page
(function(){
	window.siteData = window.siteData || {};
	window.siteData.config = {
		tracking: {
			facebook_pixel: 'YOUR_PIXEL_ID',
			gtag_config: 'GA_MEASUREMENT_ID',
			privacy_mode: 'consent_only' // or 'strict'
		}
	};
	// Notify any listeners waiting for config
	try { window.dispatchEvent(new Event('siteConfigReady')); } catch(e) {}
})();


