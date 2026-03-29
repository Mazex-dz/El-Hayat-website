
class DotGrid {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`DotGrid: Container with id '${containerId}' not found.`);
            return;
        }

        const defaults = {
            dotSize: 16,
            gap: 32,
            baseColor: '#5227FF',
            activeColor: '#5227FF',
            proximity: 100,
            speedTrigger: 50, // Lowered threshold for easier triggering
            shockRadius: 250,
            shockStrength: 5,
            maxSpeed: 2000, // Adjusted for pixel/ms scaling differences
            resistance: 750,
            returnDuration: 1.5,
        };

        this.settings = Object.assign({}, defaults, options);

        // Colors
        this.baseRgb = this.hexToRgb(this.settings.baseColor);
        this.activeRgb = this.hexToRgb(this.settings.activeColor);

        // DOM Setup
        this.wrap = document.createElement('div');
        this.wrap.className = 'dot-grid__wrap';
        this.container.innerHTML = ''; // Clear previous
        this.container.appendChild(this.wrap);

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'dot-grid__canvas';
        this.wrap.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // State
        this.dots = [];
        this.pointer = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            speed: 0,
            lastTime: 0,
            lastX: 0,
            lastY: 0
        };

        // Precompute Circle Path
        this.circlePath = new Path2D();
        this.circlePath.arc(0, 0, this.settings.dotSize / 2, 0, Math.PI * 2);

        // Bindings
        this.animate = this.animate.bind(this);
        this.resize = this.resize.bind(this);
        this.onMouseMove = this.throttle(this.onMouseMove.bind(this), 20); // Less throttle for smoother feel
        this.onClick = this.onClick.bind(this);

        this.init();
    }

    init() {
        window.addEventListener('resize', this.resize);
        window.addEventListener('mousemove', this.onMouseMove); // Global mouse move to catch speed better
        window.addEventListener('click', this.onClick);

        this.resize();
        this.animate();
    }

    hexToRgb(hex) {
        const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (!m) return { r: 0, g: 0, b: 0 };
        return {
            r: parseInt(m[1], 16),
            g: parseInt(m[2], 16),
            b: parseInt(m[3], 16)
        };
    }

    throttle(func, limit) {
        let lastCall = 0;
        return function (...args) {
            const now = performance.now();
            if (now - lastCall >= limit) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    resize() {
        if (!this.wrap) return;
        const rect = this.wrap.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(dpr, dpr);

        this.buildGrid();
    }

    buildGrid() {
        const { dotSize, gap } = this.settings;
        const cols = Math.floor((this.width + gap) / (dotSize + gap));
        const rows = Math.floor((this.height + gap) / (dotSize + gap));
        const cell = dotSize + gap;

        const gridW = cell * cols - gap;
        const gridH = cell * rows - gap;

        // Center alignment
        const startX = (this.width - gridW) / 2 + dotSize / 2;
        const startY = (this.height - gridH) / 2 + dotSize / 2;

        this.dots = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cx = startX + x * cell;
                const cy = startY + y * cell;
                // _inertiaApplied flag prevents double-triggering animations
                this.dots.push({
                    cx,
                    cy,
                    xOffset: 0,
                    yOffset: 0,
                    _inertiaApplied: false
                });
            }
        }
    }

    onMouseMove(e) {
        const now = performance.now();
        const dt = this.pointer.lastTime ? now - this.pointer.lastTime : 16;

        const dx = e.clientX - this.pointer.lastX;
        const dy = e.clientY - this.pointer.lastY;

        // Velocity (pixels per second seems too high, using simplified factor)
        // Original code: (dx / dt) * 1000
        let vx = (dx / dt) * 1000;
        let vy = (dy / dt) * 1000;
        let speed = Math.sqrt(vx * vx + vy * vy);

        if (speed > this.settings.maxSpeed) {
            const scale = this.settings.maxSpeed / speed;
            vx *= scale;
            vy *= scale;
            speed = this.settings.maxSpeed;
        }

        this.pointer.lastTime = now;
        this.pointer.lastX = e.clientX;
        this.pointer.lastY = e.clientY;
        this.pointer.vx = vx;
        this.pointer.vy = vy;
        this.pointer.speed = speed;

        // Canvas Relative Position for visual proximity check
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = e.clientX - rect.left;
        this.pointer.y = e.clientY - rect.top;

        this.checkInteractions();
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const { shockRadius, shockStrength, returnDuration } = this.settings;

        this.dots.forEach(dot => {
            const dx = dot.cx - cx;
            const dy = dot.cy - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < shockRadius && !dot._inertiaApplied) {
                dot._inertiaApplied = true;
                gsap.killTweensOf(dot);

                const falloff = Math.max(0, 1 - dist / shockRadius);
                const pushX = dx * shockStrength * falloff;
                const pushY = dy * shockStrength * falloff;

                // Simulate Inertia Throw -> Elastic Return
                gsap.to(dot, {
                    xOffset: pushX,
                    yOffset: pushY,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.to(dot, {
                            xOffset: 0,
                            yOffset: 0,
                            duration: returnDuration,
                            ease: "elastic.out(1, 0.75)",
                            onComplete: () => { dot._inertiaApplied = false; }
                        });
                    }
                });
            }
        });
    }

    checkInteractions() {
        const { speedTrigger, proximity, resistance, returnDuration } = this.settings;

        // Interaction logic based on mouse move
        if (this.pointer.speed > speedTrigger) {
            this.dots.forEach(dot => {
                const dx = dot.cx - this.pointer.x;
                const dy = dot.cy - this.pointer.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < proximity && !dot._inertiaApplied) {
                    dot._inertiaApplied = true;
                    gsap.killTweensOf(dot);

                    // Original logic: pushX = dot.cx - pr.x + vx * 0.005;
                    // This calculates a point "ahead" of the mouse move to push the dot towards/away
                    // Actually, looking at source: pushX = dot.cx - pr.x ... wait this looks like absolute position?
                    // React source: const pushX = dot.cx - pr.x + vx * 0.005; 
                    // No, dot.cx - pr.x is the distance vector.
                    // This logic seems to push the dot AWAY from the mouse velocity?
                    // Let's replicate the math exactly.

                    // Note: xOffset is relative displacement. 
                    // The source sets inertia: { xOffset: pushX... }
                    // If pushX is large, it throws it far.

                    const pushX = (this.pointer.vx * 0.02); // Simplified push factor
                    const pushY = (this.pointer.vy * 0.02);

                    gsap.to(dot, {
                        xOffset: pushX,
                        yOffset: pushY,
                        duration: 0.6,
                        ease: "power3.out",
                        onComplete: () => {
                            gsap.to(dot, {
                                xOffset: 0,
                                yOffset: 0,
                                duration: returnDuration,
                                ease: "elastic.out(1, 0.75)",
                                onComplete: () => { dot._inertiaApplied = false; }
                            });
                        }
                    });
                }
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        const { proximity, baseColor, activeColor } = this.settings;
        const proxSq = proximity * proximity;

        // Using raw RGB for performance
        const { r: bR, g: bG, b: bB } = this.baseRgb;
        const { r: aR, g: aG, b: aB } = this.activeRgb;

        this.dots.forEach(dot => {
            const ox = dot.cx + dot.xOffset;
            const oy = dot.cy + dot.yOffset;

            // Check distance to pointer for Color
            const dx = dot.cx - this.pointer.x;
            const dy = dot.cy - this.pointer.y;
            const dsq = dx * dx + dy * dy;

            let fillStyle = baseColor;

            if (dsq <= proxSq) {
                const dist = Math.sqrt(dsq);
                const t = 1 - dist / proximity;
                const r = Math.round(bR + (aR - bR) * t);
                const g = Math.round(bG + (aG - bG) * t);
                const b = Math.round(bB + (aB - bB) * t);
                fillStyle = `rgb(${r},${g},${b})`;
            }

            this.ctx.save();
            this.ctx.translate(ox, oy);
            this.ctx.fillStyle = fillStyle;
            this.ctx.fill(this.circlePath);
            this.ctx.restore();
        });

        requestAnimationFrame(this.animate);
    }
}

window.DotGrid = DotGrid;
