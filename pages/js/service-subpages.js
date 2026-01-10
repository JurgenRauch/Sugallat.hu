// Lightweight background initializer for static service subpages.
// Purpose: enable the square-pattern canvas backgrounds without running main.js (which injects header/footer).

(function () {
    function getBaseScriptUrl() {
        // Find our own script tag so we can resolve square-background.js regardless of current page depth.
        const scripts = Array.from(document.getElementsByTagName('script'));
        const self = scripts.find(s => (s.src || '').includes('service-subpages.js'));
        if (!self || !self.src) return null;
        return self.src.replace(/service-subpages\.js(\?.*)?$/i, '');
    }

    function loadScriptOnceAbsolute(src) {
        return new Promise((resolve, reject) => {
            if (window.drawBackground) { resolve(); return; }
            const existing = Array.from(document.scripts).find(s => s.src && s.src === src);
            if (existing) { existing.addEventListener('load', () => resolve()); resolve(); return; }
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
            canvases.push({ canvas, options });
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

    function boot() {
        const base = getBaseScriptUrl();
        if (!base) return;
        const squareSrc = base + 'square-background.js';
        loadScriptOnceAbsolute(squareSrc)
            .then(() => initCanvasBackgrounds())
            .catch(() => {});
    }

    // Normal load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // BFCache back/forward: re-draw patterns
    window.addEventListener('pageshow', () => {
        try { boot(); } catch (e) {}
    });
})();


