/* ============================================================
   HOLO-EFFECTS.JS — Particle System, Data Stream, Parallax
   ============================================================ */

(function () {
    'use strict';

    // ── CONFIGURATION ──
    const CONFIG = {
        particles: {
            count: 55,
            maxSpeed: 0.4,
            maxSize: 2.2,
            minSize: 0.5,
            connectionDistance: 140,
            connectionOpacity: 0.15,
            colors: ['rgba(0, 242, 254,', 'rgba(79, 172, 254,', 'rgba(176, 107, 255,'],
        },
        dataStream: {
            columnCount: 12,
            chars: '01アイウエオカキクケコ>>=:;{}[]</>0xFF∆∑∏λΩ',
            minDuration: 10,
            maxDuration: 25,
            minChars: 15,
            maxChars: 40,
        },
        parallax: {
            intensity: 0.02,
        },
    };

    // ── PARTICLE CANVAS ──
    function initParticles() {
        const canvas = document.getElementById('holo-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        const particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < CONFIG.particles.count; i++) {
            const colorBase = CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)];
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * CONFIG.particles.maxSpeed,
                vy: (Math.random() - 0.5) * CONFIG.particles.maxSpeed,
                size: CONFIG.particles.minSize + Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize),
                color: colorBase,
                alpha: 0.3 + Math.random() * 0.5,
                pulseSpeed: 0.005 + Math.random() * 0.015,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            const time = Date.now() * 0.001;

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONFIG.particles.connectionDistance) {
                        const opacity = (1 - dist / CONFIG.particles.connectionDistance) * CONFIG.particles.connectionOpacity;
                        ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Pulsing alpha
                const pulseAlpha = p.alpha + Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase) * 0.15;

                // Draw glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color} ${pulseAlpha * 0.15})`;
                ctx.fill();

                // Draw core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color} ${pulseAlpha})`;
                ctx.fill();
            }

            requestAnimationFrame(draw);
        }

        draw();
    }

    // ── DATA STREAM BACKGROUND ──
    function initDataStream() {
        const container = document.querySelector('.data-stream-bg');
        if (!container) return;

        const chars = CONFIG.dataStream.chars;

        for (let i = 0; i < CONFIG.dataStream.columnCount; i++) {
            const column = document.createElement('div');
            column.className = 'stream-column';

            // Random horizontal position
            column.style.left = (5 + Math.random() * 90) + '%';

            // Random animation duration
            const duration = CONFIG.dataStream.minDuration + Math.random() * (CONFIG.dataStream.maxDuration - CONFIG.dataStream.minDuration);
            column.style.animationDuration = duration + 's';
            column.style.animationDelay = -(Math.random() * duration) + 's';

            // Random opacity variation
            column.style.opacity = (0.3 + Math.random() * 0.7).toString();

            // Generate character string
            const charCount = CONFIG.dataStream.minChars + Math.floor(Math.random() * (CONFIG.dataStream.maxChars - CONFIG.dataStream.minChars));
            let text = '';
            for (let j = 0; j < charCount; j++) {
                text += chars[Math.floor(Math.random() * chars.length)];
                if (j % 3 === 2) text += '\n';
            }
            column.textContent = text;

            container.appendChild(column);
        }
    }

    // ── MOUSE PARALLAX ──
    function initParallax() {
        const heroText = document.querySelector('.hero-text');
        const heroImage = document.querySelector('.hero-image');

        if (!heroText && !heroImage) return;

        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            const intensity = CONFIG.parallax.intensity;

            if (heroText) {
                heroText.style.transform = `translate(${x * -10 * intensity}px, ${y * -10 * intensity}px)`;
            }
            if (heroImage) {
                heroImage.style.transform = `translate(${x * 15 * intensity}px, ${y * 15 * intensity}px)`;
            }
        });
    }

    // ── INTERSECTION OBSERVER — FADE IN ──
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.skill-card, .cert-card, .activity-box, .stat-item, .section-title');

        if (!elements.length) return;

        // Add hidden class
        elements.forEach((el) => {
            el.classList.add('holo-hidden');
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('holo-hidden');
                        entry.target.classList.add('holo-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px',
            }
        );

        elements.forEach((el) => observer.observe(el));
    }

    // ── INIT ──
    function init() {
        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        initParticles();
        initDataStream();
        initParallax();
        initScrollAnimations();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
