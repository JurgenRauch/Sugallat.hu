// Lightweight deterministic canvas background generator for outlined blue squares
// Exposes: window.drawBackground(canvas: HTMLCanvasElement, options?: DrawOptions)

(function() {
    'use strict';

    /**
     * Convert a string seed to a 32-bit integer
     */
    function stringToSeed(seed) {
        let h = 2166136261 >>> 0; // FNV-1a base
        for (let i = 0; i < seed.length; i++) {
            h ^= seed.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    /**
     * Mulberry32 PRNG
     */
    function mulberry32(a) {
        let t = a >>> 0;
        return function() {
            t += 0x6D2B79F5;
            let r = Math.imul(t ^ (t >>> 15), 1 | t);
            r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
            return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
    }

    /**
     * Hash 2D tile coordinates into a seed
     */
    function hashTile(baseSeedInt, x, y) {
        // Mix coordinates with base seed (use bitwise and integer math for determinism)
        let h = (baseSeedInt ^ (x * 374761393) ^ (y * 668265263)) >>> 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
        h ^= h >>> 16;
        return h >>> 0;
    }

    /**
     * Draw one tile of size tileSize
     */
    function drawTile(ctx, tileOriginX, tileOriginY, tileSize, opts, rng) {
        const { baseGrid, strokeColor, strokeWidth, opacityMin, opacityMax } = opts;
        const accentRate = opts.accentRate != null ? opts.accentRate : 0.10; // ~10% accents
        const gutter = (opts.gutter != null) ? opts.gutter : Math.round(baseGrid * 0.12); // 12% of grid
        const softRate = (opts.softRate != null) ? opts.softRate : 0.30; // ~30% soft cells

        // Helper for crisp 1px strokes
        const px = (v) => Math.round(v) + 0.5;

        // Helper to draw rounded rect stroke (axis-aligned)
        function strokeRoundedRect(x, y, w, h, r) {
            const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
            ctx.beginPath();
            ctx.moveTo(x + rr, y);
            ctx.lineTo(x + w - rr, y);
            ctx.arc(x + w - rr, y + rr, rr, -Math.PI / 2, 0);
            ctx.lineTo(x + w, y + h - rr);
            ctx.arc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2);
            ctx.lineTo(x + rr, y + h);
            ctx.arc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI);
            ctx.lineTo(x, y + rr);
            ctx.arc(x + rr, y + rr, rr, Math.PI, 1.5 * Math.PI);
            ctx.stroke();
        }

        if (opts.fullGrid) {
            // Full-grid: draw every baseGrid cell with a small inset gutter
            const sizePx = Math.max(1, baseGrid - 2 * gutter);
            const radius = Math.round(baseGrid * 0.125); // ~7px on 56px
            ctx.lineWidth = strokeWidth;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'butt';

            for (let y = tileOriginY; y < tileOriginY + tileSize; y += baseGrid) {
                for (let x = tileOriginX; x < tileOriginX + tileSize; x += baseGrid) {
                    const isAccent = rng() < accentRate;
                    const rBand = rng();
                    const hasMid = (opts.midRate != null) ? opts.midRate : 0;
                    let alpha;
                    if (rBand < softRate) {
                        alpha = 0.30 + rng() * (0.45 - 0.30);
                    } else if (rBand < softRate + hasMid) {
                        const medMin = (opts.opacityMedMin != null) ? opts.opacityMedMin : 0.5;
                        const medMax = (opts.opacityMedMax != null) ? opts.opacityMedMax : 0.65;
                        alpha = medMin + rng() * (medMax - medMin);
                    } else {
                        alpha = opacityMin + rng() * (opacityMax - opacityMin);
                    }

                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = isAccent ? (opts.accentStrokeColor || 'rgba(96, 165, 250, 1)') : strokeColor;

                    // Per-cell weight/dash variation
                    const heavyRate = (opts.weightVarRate != null) ? opts.weightVarRate : 0;
                    const heavyWeight = (opts.heavyWeight != null) ? opts.heavyWeight : 1.75;
                    ctx.lineWidth = (rng() < heavyRate) ? (strokeWidth * heavyWeight) : strokeWidth;
                    const dashRate = (opts.dashRate != null) ? opts.dashRate : 0;
                    if (rng() < dashRate) {
                        ctx.setLineDash([6, 4]);
                    } else {
                        ctx.setLineDash([]);
                    }

                    // Micro shadow (configurable)
                    const prevShadowColor = ctx.shadowColor;
                    const prevShadowBlur = ctx.shadowBlur;
                    const sa = (opts.shadowAlpha != null) ? opts.shadowAlpha : 0.08;
                    const sb = (opts.shadowBlur != null) ? opts.shadowBlur : 1;
                    ctx.shadowColor = `rgba(0, 0, 0, ${sa})`;
                    ctx.shadowBlur = sb;

                    strokeRoundedRect(px(x + gutter), px(y + gutter), sizePx, sizePx, radius);

                    // Reset shadow and dashes
                    ctx.shadowColor = prevShadowColor;
                    ctx.shadowBlur = prevShadowBlur;
                    ctx.setLineDash([]);
                }
            }
            return;
        }

        // Legacy clustered mode (kept for potential reuse)
        const coarse = baseGrid * 6;
        const localGrid = 3;
        const placeProbability = 0.55;

        for (let gx = tileOriginX; gx < tileOriginX + tileSize; gx += coarse) {
            for (let gy = tileOriginY; gy < tileOriginY + tileSize; gy += coarse) {
                if (rng() > placeProbability) continue;

                const jitterX = (Math.floor(rng() * 3) - 1) * baseGrid;
                const jitterY = (Math.floor(rng() * 3) - 1) * baseGrid;
                const ax = Math.round((gx + coarse / 2) / baseGrid) * baseGrid + jitterX;
                const ay = Math.round((gy + coarse / 2) / baseGrid) * baseGrid + jitterY;

                const desired = 5 + Math.floor(rng() * 5);
                const maxRadius = 3;
                const coords = [];
                const used = new Set();
                const key = (x, y) => `${x},${y}`;
                let cx = 0, cy = 0;
                coords.push([0, 0]);
                used.add(key(0, 0));
                while (coords.length < desired) {
                    if (rng() < 0.35) {
                        const pick = coords[Math.floor(rng() * coords.length)];
                        cx = pick[0];
                        cy = pick[1];
                    }
                    const dir = Math.floor(rng() * 4);
                    if (dir === 0) cx += 1; else if (dir === 1) cx -= 1; else if (dir === 2) cy += 1; else cy -= 1;
                    if (Math.abs(cx) > maxRadius || Math.abs(cy) > maxRadius) {
                        if (dir === 0) cx -= 1; else if (dir === 1) cx += 1; else if (dir === 2) cy -= 1; else cy += 1;
                        continue;
                    }
                    const k = key(cx, cy);
                    if (!used.has(k)) { used.add(k); coords.push([cx, cy]); }
                }

                ctx.lineWidth = strokeWidth;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'butt';

                for (let i = 0; i < coords.length; i++) {
                    const lx = coords[i][0];
                    const ly = coords[i][1];
                    const x = ax + lx * baseGrid;
                    const y = ay + ly * baseGrid;
                    const isAccent = rng() < accentRate;
                    const isSoft = rng() < softRate;
                    const alpha = isSoft
                        ? (0.30 + rng() * (0.45 - 0.30))
                        : (opacityMin + rng() * (opacityMax - opacityMin));
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = isAccent ? (opts.accentStrokeColor || 'rgba(96, 165, 250, 1)') : strokeColor;

                    const prevShadowColor = ctx.shadowColor;
                    const prevShadowBlur = ctx.shadowBlur;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
                    ctx.shadowBlur = 1;

                    const radius = Math.round(baseGrid * 0.125);
                    strokeRoundedRect(px(x), px(y), baseGrid, baseGrid, radius);

                    ctx.shadowColor = prevShadowColor;
                    ctx.shadowBlur = prevShadowBlur;
                }
            }
        }
    }

    /**
     * Public API: drawBackground(canvas, options?)
     * Draws a deterministic, tile-based square background into the given canvas.
     */
    function drawBackground(canvas, options) {
        if (!canvas) return;

        // Defaults tuned for a modern, airy look
        const defaults = {
            baseGrid: 56, // 32 * 1.75
            // tileSize will default to baseGrid * 16 if not provided
            seed: 'sugallat-blue-squares',
            strokeColor: 'rgba(59, 130, 246, 1)',
            strokeWidth: 1,
            opacityMin: 0.6,
            opacityMax: 0.85,
            clear: true,
            shadowAlpha: 0.08,
            shadowBlur: 1,
            midRate: 0,
            opacityMedMin: 0.5,
            opacityMedMax: 0.65,
            dashRate: 0,
            weightVarRate: 0,
            heavyWeight: 1.75
        };
        const opts = Object.assign({}, defaults, options || {});

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        const widthCss = Math.max(1, Math.floor(canvas.clientWidth || canvas.width || 1));
        const heightCss = Math.max(1, Math.floor(canvas.clientHeight || canvas.height || 1));
        const width = Math.floor(widthCss * dpr);
        const height = Math.floor(heightCss * dpr);

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (opts.clear) {
            ctx.clearRect(0, 0, widthCss, heightCss);
        }

        const tileSize = (opts.tileSize != null) ? opts.tileSize : opts.baseGrid * 16;
        const baseSeedInt = typeof opts.seed === 'number' ? (opts.seed >>> 0) : stringToSeed(String(opts.seed));

        // Determine visible tile indices starting from (0,0) top-left
        const cols = Math.ceil(widthCss / tileSize) + 1;
        const rows = Math.ceil(heightCss / tileSize) + 1;

        for (let ty = 0; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                const originX = tx * tileSize;
                const originY = ty * tileSize;
                const tileSeed = hashTile(baseSeedInt, tx, ty);
                const rng = mulberry32(tileSeed);
                drawTile(ctx, originX, originY, tileSize, opts, rng);
            }
        }
    }

    // Expose globally (non-module environment)
    if (typeof window !== 'undefined') {
        window.drawBackground = drawBackground;
    }
})();


