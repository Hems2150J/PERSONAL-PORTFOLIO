/* ============================================================
   HOLO-EFFECTS.JS — Particle System, Data Stream, Parallax
   ============================================================ */

(function () {
    'use strict';

    // ── CONFIGURATION ──
    const CONFIG = {
        particles: {
            count: 75, // Increased density of stars
            maxSpeed: 0.25, // Slower, calmer drift for a cosmic feel
            maxSize: 4.0, // Maximum outer size of stars
            minSize: 1.0, // Minimum outer size of stars
            connectionDistance: 110, // Max distance to connect stars in constellations
            connectionOpacity: 0.08, // Subtle connection line opacity
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

        // Helper to draw a 4-pointed star
        function drawStar4(x, y, size, angle) {
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const a1 = angle + (i * Math.PI / 2);
                const a2 = angle + (i * Math.PI / 2) + Math.PI / 4;
                
                const x1 = x + Math.cos(a1) * size;
                const y1 = y + Math.sin(a1) * size;
                const x2 = x + Math.cos(a2) * (size * 0.25);
                const y2 = y + Math.sin(a2) * (size * 0.25);
                
                if (i === 0) {
                    ctx.moveTo(x1, y1);
                } else {
                    ctx.lineTo(x1, y1);
                }
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
        }

        // Create star particles
        for (let i = 0; i < CONFIG.particles.count; i++) {
            const colorBase = CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)];
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * CONFIG.particles.maxSpeed,
                vy: (Math.random() - 0.5) * CONFIG.particles.maxSpeed,
                size: CONFIG.particles.minSize + Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize),
                color: colorBase,
                alpha: 0.2 + Math.random() * 0.6,
                pulseSpeed: 0.01 + Math.random() * 0.03, // Faster speeds for noticeable twinkling
                pulsePhase: Math.random() * Math.PI * 2,
                angle: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01 // Slow rotation of stars
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            const time = Date.now() * 0.001;

            // Draw connections (constellations)
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONFIG.particles.connectionDistance) {
                        const opacity = (1 - dist / CONFIG.particles.connectionDistance) * CONFIG.particles.connectionOpacity;
                        ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
                        ctx.lineWidth = 0.4;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw star particles
            for (const p of particles) {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Update rotation angle
                p.angle += p.rotationSpeed;

                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Twinkling alpha calculation
                const pulseAlpha = Math.max(0.05, p.alpha + Math.sin(time * p.pulseSpeed * 60 + p.pulsePhase) * 0.35);

                // Draw outer star glow
                ctx.beginPath();
                drawStar4(p.x, p.y, p.size * 2.5, p.angle);
                ctx.fillStyle = `${p.color} ${pulseAlpha * 0.15})`;
                ctx.fill();

                // Draw core star
                ctx.beginPath();
                drawStar4(p.x, p.y, p.size, p.angle);
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
    // ── INTERSECTION OBSERVER — FADE IN & PROGRESS BARS ──
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.skill-card, .cert-card, .activity-box, .stat-item, .section-title');
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('header nav a');

        // Observe section entry to highlight correct nav link
        if (sections.length && navLinks.length) {
            const sectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const id = entry.target.getAttribute('id');
                            navLinks.forEach((link) => {
                                if (link.getAttribute('href') === `#${id}`) {
                                    link.classList.add('active');
                                } else {
                                    link.classList.remove('active');
                                }
                            });
                        }
                    });
                },
                {
                    threshold: 0.25,
                    rootMargin: '-20% 0px -40% 0px',
                }
            );
            sections.forEach((sec) => sectionObserver.observe(sec));
        }

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
                        
                        // Animate skill progress bar on scroll entry
                        if (entry.target.classList.contains('skill-card')) {
                            const fill = entry.target.querySelector('.skill-progress-fill');
                            if (fill) {
                                fill.style.width = fill.getAttribute('data-target-width');
                            }
                        }
                        
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

    // ── DETAIL MODAL SYSTEM ──
    function initDetailModal() {
        const modal = document.getElementById('detail-modal');
        if (!modal) return;

        const closeBtn = document.getElementById('modal-close');
        const mIcon = document.getElementById('modal-icon');
        const mTitle = document.getElementById('modal-title');
        const mSubtitle = document.getElementById('modal-subtitle');
        const mDescription = document.getElementById('modal-description');
        const mImageContainer = document.getElementById('modal-image-container');
        const mImage = document.getElementById('modal-image');
        const mProgressContainer = document.getElementById('modal-progress-container');
        const mProgressPercent = document.getElementById('modal-progress-percent');
        const mProgressFill = document.getElementById('modal-progress-fill');
        const mSubskillsContainer = document.getElementById('modal-subskills-container');
        const mSubskills = document.getElementById('modal-subskills');
        const mBullets = document.getElementById('modal-bullets');
        const mActionBtn = document.getElementById('modal-action-btn');

        const triggerCards = document.querySelectorAll('.skill-card, .cert-card, .activity-box');

        function openModal(card) {
            const type = card.getAttribute('data-type');
            const title = card.getAttribute('data-title');
            const details = card.getAttribute('data-details') || '';
            const iconClass = card.getAttribute('data-icon');

            // Set general modal fields
            mTitle.textContent = title;
            mDescription.textContent = details;
            
            // Set icon class
            mIcon.className = iconClass || 'fas fa-info-circle';

            // Reset sub-containers
            mImageContainer.style.display = 'none';
            mProgressContainer.style.display = 'none';
            mSubskillsContainer.style.display = 'none';
            mBullets.style.display = 'none';
            mActionBtn.style.display = 'none';
            mSubtitle.textContent = '';
            mBullets.innerHTML = '';
            mSubskills.innerHTML = '';

            if (type === 'skill') {
                mSubtitle.textContent = 'Technical Skill';
                const percent = card.getAttribute('data-percent');
                const subskillsAttr = card.getAttribute('data-subskills');

                // Skill progress bars
                mProgressContainer.style.display = 'block';
                mProgressPercent.textContent = percent + '%';
                mProgressFill.style.width = '0';
                
                // Animate progress fill inside modal after slight delay
                setTimeout(() => {
                    mProgressFill.style.width = percent + '%';
                }, 100);

                // Subskills badges
                if (subskillsAttr) {
                    mSubskillsContainer.style.display = 'block';
                    const list = subskillsAttr.split(',');
                    list.forEach((item) => {
                        const badge = document.createElement('span');
                        badge.className = 'modal-subskill-badge';
                        badge.textContent = item.trim();
                        mSubskills.appendChild(badge);
                    });
                }
            } else if (type === 'cert') {
                const subtitle = card.getAttribute('data-subtitle');
                const imagePath = card.getAttribute('data-image');
                const pdfPath = card.getAttribute('data-pdf');
                const bulletsAttr = card.getAttribute('data-bullets');

                mSubtitle.textContent = subtitle || 'Certification';

                // Display certificate image
                if (imagePath) {
                    mImageContainer.style.display = 'block';
                    mImage.src = imagePath;
                    mImage.alt = title;
                }

                // Add bullets
                if (bulletsAttr) {
                    mBullets.style.display = 'block';
                    const list = bulletsAttr.split(';');
                    list.forEach((item) => {
                        if (item.trim()) {
                            const li = document.createElement('li');
                            li.textContent = item.trim();
                            mBullets.appendChild(li);
                        }
                    });
                }

                // Display action button for PDF
                if (pdfPath) {
                    mActionBtn.style.display = 'inline-flex';
                    mActionBtn.href = pdfPath;
                }
            } else if (type === 'activity') {
                const bulletsAttr = card.getAttribute('data-bullets');
                mSubtitle.textContent = 'Extracurricular / Activity';

                // Add bullets
                if (bulletsAttr) {
                    mBullets.style.display = 'block';
                    const list = bulletsAttr.split(';');
                    list.forEach((item) => {
                        if (item.trim()) {
                            const li = document.createElement('li');
                            li.textContent = item.trim();
                            mBullets.appendChild(li);
                        }
                    });
                }
            }

            // Open Modal with active transition
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Add event listeners to cards
        triggerCards.forEach((card) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                openModal(card);
            });
        });

        // Close events
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
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
        initDetailModal();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
