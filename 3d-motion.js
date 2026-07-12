/* ============================================================
   3D-MOTION.JS — Full 3D Motion System for Hemnath Portfolio
   Three.js scene + Card Tilt + Magnetic + Scroll 3D Parallax
   ============================================================ */

(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────────
       1. THREE.JS 3D BACKGROUND SCENE
       Floating wireframe geometric objects in deep space
    ───────────────────────────────────────────────────────────── */
    function init3DScene() {
        // Dynamically load Three.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = buildScene;
        document.head.appendChild(script);
    }

    function buildScene() {
        const THREE = window.THREE;
        if (!THREE) return;

        // Create canvas for 3D scene (behind the holo-particles canvas)
        const canvas = document.createElement('canvas');
        canvas.id = 'three-bg';
        canvas.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        // Scene setup
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        // Colors matching portfolio palette
        const colors = [
            new THREE.Color(0x00f2fe),   // holo cyan
            new THREE.Color(0x4facfe),   // holo blue
            new THREE.Color(0xb06bff),   // holo purple
            new THREE.Color(0x0affef),   // holo teal
        ];

        // Create wireframe geometries
        const objects = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1.5, 0),
            new THREE.OctahedronGeometry(1.8, 0),
            new THREE.TetrahedronGeometry(2.0, 0),
            new THREE.IcosahedronGeometry(1.2, 1),
            new THREE.OctahedronGeometry(1.4, 0),
            new THREE.TetrahedronGeometry(1.6, 0),
            new THREE.IcosahedronGeometry(2.2, 0),
            new THREE.OctahedronGeometry(1.0, 0),
            new THREE.IcosahedronGeometry(0.9, 0),
            new THREE.TetrahedronGeometry(1.2, 0),
            new THREE.OctahedronGeometry(2.5, 0),
            new THREE.IcosahedronGeometry(1.7, 1),
        ];

        geometries.forEach((geo, i) => {
            const color = colors[i % colors.length];
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true,
                transparent: true,
                opacity: 0.08 + Math.random() * 0.12,
            });
            const mesh = new THREE.Mesh(geo, mat);

            // Random positions spread across a large field
            mesh.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30 - 10
            );

            // Random rotation seeds
            mesh.userData = {
                rotX: (Math.random() - 0.5) * 0.006,
                rotY: (Math.random() - 0.5) * 0.008,
                rotZ: (Math.random() - 0.5) * 0.004,
                floatSpeed: 0.0003 + Math.random() * 0.0005,
                floatAmplitude: 0.5 + Math.random() * 1.5,
                floatOffset: Math.random() * Math.PI * 2,
                baseY: mesh.position.y,
                // Pulse opacity
                pulseSpeed: 0.0008 + Math.random() * 0.001,
                pulseOffset: Math.random() * Math.PI * 2,
                baseOpacity: mat.opacity,
            };

            scene.add(mesh);
            objects.push(mesh);
        });

        // Mouse parallax for 3D scene
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Scroll-based camera depth
        let scrollY = 0;
        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
        });

        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Smooth camera parallax from mouse
            camera.position.x += (mouseX * 4 - camera.position.x) * 0.03;
            camera.position.y += (-mouseY * 3 - camera.position.y) * 0.03;

            // Scroll-based camera z depth (pull back as you scroll)
            const targetZ = 30 + scrollY * 0.008;
            camera.position.z += (targetZ - camera.position.z) * 0.05;

            // Update each object
            objects.forEach((obj) => {
                const d = obj.userData;

                // Continuous rotation
                obj.rotation.x += d.rotX;
                obj.rotation.y += d.rotY;
                obj.rotation.z += d.rotZ;

                // Floating vertical drift
                obj.position.y = d.baseY + Math.sin(t * d.floatSpeed * 1000 + d.floatOffset) * d.floatAmplitude;

                // Opacity pulse
                const pulse = 0.5 + 0.5 * Math.sin(t * d.pulseSpeed * 1000 + d.pulseOffset);
                obj.material.opacity = d.baseOpacity * (0.6 + 0.4 * pulse);
            });

            renderer.render(scene, camera);
        }

        animate();
    }

    /* ─────────────────────────────────────────────────────────────
       2. 3D CARD TILT EFFECT
       Mouse-based 3D perspective tilt on cards
    ───────────────────────────────────────────────────────────── */
    function initCardTilt() {
        const cards = document.querySelectorAll('.skill-card, .cert-card, .activity-box, .stat-item, .skill-expanded-card, .cert-detail-card, .activity-bar');

        cards.forEach((card) => {
            // Enable 3D transform context
            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';
            card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease';

            // Create an inner shine layer
            const shine = document.createElement('div');
            shine.className = 'card-3d-shine';
            shine.style.cssText = `
                position: absolute;
                inset: 0;
                border-radius: inherit;
                pointer-events: none;
                z-index: 5;
                opacity: 0;
                transition: opacity 0.3s;
                background: radial-gradient(
                    circle at 50% 50%,
                    rgba(0, 242, 254, 0.15) 0%,
                    transparent 70%
                );
            `;
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(shine);

            function onMove(e) {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;

                let clientX, clientY;
                if (e.type === 'touchmove') {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                const dx = clientX - cx;
                const dy = clientY - cy;

                const maxTilt = 14;
                const rotateY = (dx / (rect.width / 2)) * maxTilt;
                const rotateX = -(dy / (rect.height / 2)) * maxTilt;

                // Scale slightly for depth effect
                card.style.transform = `
                    perspective(800px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.04, 1.04, 1.04)
                    translateZ(10px)
                `;

                // Move shine radial gradient to follow cursor
                const shineX = ((clientX - rect.left) / rect.width) * 100;
                const shineY = ((clientY - rect.top) / rect.height) * 100;
                shine.style.background = `radial-gradient(
                    circle at ${shineX}% ${shineY}%,
                    rgba(0, 242, 254, 0.2) 0%,
                    transparent 65%
                )`;
                shine.style.opacity = '1';

                // Dynamic shadow based on tilt
                const shadowX = -rotateY * 0.6;
                const shadowY = rotateX * 0.6;
                card.style.boxShadow = `
                    ${shadowX}px ${shadowY}px 20px rgba(0, 242, 254, 0.15),
                    0 0 30px rgba(0, 242, 254, 0.1),
                    0 20px 40px rgba(0, 0, 0, 0.4)
                `;
            }

            function onLeave() {
                card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease, border-color 0.3s ease';
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0)';
                card.style.boxShadow = '';
                shine.style.opacity = '0';

                setTimeout(() => {
                    card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease';
                }, 500);
            }

            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
            card.addEventListener('touchmove', (e) => { e.preventDefault(); onMove(e); }, { passive: false });
            card.addEventListener('touchend', onLeave);
        });
    }

    /* ─────────────────────────────────────────────────────────────
       3. MAGNETIC BUTTON EFFECT
       Social & modal buttons attract to cursor
    ───────────────────────────────────────────────────────────── */
    function initMagneticButtons() {
        const magnets = document.querySelectorAll('.social-btn, .holo-modal-btn, .holo-modal-close, .back-btn, .view-more-btn');

        magnets.forEach((btn) => {
            btn.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease';
            btn.style.willChange = 'transform';
            btn.style.display = btn.style.display || 'inline-flex';

            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) * 0.35;
                const dy = (e.clientY - cy) * 0.35;
                btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0) scale(1)';
            });
        });
    }

    /* ─────────────────────────────────────────────────────────────
       4. HERO SECTION — MULTI-LAYER 3D PARALLAX
       Different depth layers move at different speeds on scroll
    ───────────────────────────────────────────────────────────── */
    function init3DScrollParallax() {
        const heroSection = document.querySelector('.hero-section');
        const heroText = document.querySelector('.hero-text');
        const heroImage = document.querySelector('.hero-image');
        const badge = document.querySelector('.badge');
        const h1 = document.querySelector('.hero-text h1');
        const h3 = document.querySelector('.hero-text h3');
        const statsBox = document.querySelector('.stats-box');
        const socialLinks = document.querySelector('.social-links');

        if (!heroSection) return;

        // Assign depth layers via CSS variable
        const layers = [
            { el: badge,       depth: 0.12, rotFactor: 0.015 },
            { el: h1,          depth: 0.08, rotFactor: 0.010 },
            { el: h3,          depth: 0.06, rotFactor: 0.008 },
            { el: statsBox,    depth: 0.05, rotFactor: 0.006 },
            { el: socialLinks, depth: 0.04, rotFactor: 0.005 },
            { el: heroImage,   depth: 0.14, rotFactor: 0.018 },
        ];

        layers.forEach(({ el }) => {
            if (el) {
                el.style.willChange = 'transform';
                el.style.transition = 'transform 0.05s linear';
            }
        });

        let mouseX = 0, mouseY = 0;
        let scrollProgress = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('scroll', () => {
            scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        });

        function applyParallax() {
            layers.forEach(({ el, depth, rotFactor }) => {
                if (!el) return;
                const x = mouseX * depth * 40;
                const y = mouseY * depth * 30;
                const rotX = mouseY * rotFactor * -20;
                const rotY = mouseX * rotFactor * 20;
                el.style.transform = `
                    perspective(1200px)
                    translateX(${x}px)
                    translateY(${y}px)
                    rotateX(${rotX}deg)
                    rotateY(${rotY}deg)
                `;
            });
            requestAnimationFrame(applyParallax);
        }

        applyParallax();
    }

    /* ─────────────────────────────────────────────────────────────
       5. 3D PROFILE FRAME — GYROSCOPE EFFECT
       Holo frame responds to mouse position with 3D gyro tilt
    ───────────────────────────────────────────────────────────── */
    function initProfileGyro() {
        const holoFrame = document.querySelector('.holo-frame');
        if (!holoFrame) return;

        holoFrame.style.transformStyle = 'preserve-3d';
        holoFrame.style.transition = 'transform 0.08s linear';
        holoFrame.style.willChange = 'transform';

        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            holoFrame.style.transform = `
                perspective(600px)
                rotateX(${y * -8}deg)
                rotateY(${x * 12}deg)
                translateZ(20px)
            `;
        });
    }

    /* ─────────────────────────────────────────────────────────────
       6. SECTION TITLE — 3D ENTRANCE ANIMATIONS
       Titles fly in with 3D rotation on scroll
    ───────────────────────────────────────────────────────────── */
    function init3DScrollEntrance() {
        const titles = document.querySelectorAll('.section-title');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('title-3d-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        titles.forEach((t) => {
            t.classList.add('title-3d-out');
            observer.observe(t);
        });
    }

    /* ─────────────────────────────────────────────────────────────
       7. 3D CARD ENTRANCE FROM SCROLL
       Cards fly in from different 3D directions
    ───────────────────────────────────────────────────────────── */
    function init3DCardEntrance() {
        const allCards = document.querySelectorAll('.skill-card, .cert-card, .activity-box');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
                    setTimeout(() => {
                        entry.target.classList.add('card-3d-entered');
                        entry.target.classList.remove('card-3d-init');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        allCards.forEach((card, i) => {
            card.classList.add('card-3d-init');
            observer.observe(card);
        });
    }

    /* ─────────────────────────────────────────────────────────────
       8. FLOATING 3D ORBS IN BACKGROUND
       CSS-only pseudo-3D floating light orbs 
    ───────────────────────────────────────────────────────────── */
    function initFloatingOrbs() {
        const orbData = [
            { color: 'rgba(0, 242, 254, 0.06)',  size: 300, top: '10%',  left: '5%',   duration: 18 },
            { color: 'rgba(176, 107, 255, 0.05)', size: 500, top: '60%', left: '80%',  duration: 24 },
            { color: 'rgba(79, 172, 254, 0.04)', size: 400, top: '40%',  left: '45%',  duration: 20 },
            { color: 'rgba(0, 242, 254, 0.035)', size: 250, top: '80%', left: '20%',  duration: 22 },
            { color: 'rgba(176, 107, 255, 0.04)', size: 350, top: '20%', left: '70%',  duration: 26 },
        ];

        const container = document.createElement('div');
        container.id = 'orb-field';
        container.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;

        orbData.forEach((o, i) => {
            const orb = document.createElement('div');
            orb.style.cssText = `
                position: absolute;
                top: ${o.top};
                left: ${o.left};
                width: ${o.size}px;
                height: ${o.size}px;
                border-radius: 50%;
                background: radial-gradient(circle, ${o.color} 0%, transparent 70%);
                animation: orb-3d-drift-${i} ${o.duration}s ease-in-out infinite;
                will-change: transform;
            `;
            container.appendChild(orb);

            // Inject unique keyframe for each orb
            const style = document.createElement('style');
            const dx1 = (Math.random() - 0.5) * 60;
            const dy1 = (Math.random() - 0.5) * 40;
            const dx2 = (Math.random() - 0.5) * 80;
            const dy2 = (Math.random() - 0.5) * 50;
            style.textContent = `
                @keyframes orb-3d-drift-${i} {
                    0%   { transform: translate(0, 0) scale(1); }
                    33%  { transform: translate(${dx1}px, ${dy1}px) scale(1.08); }
                    66%  { transform: translate(${dx2}px, ${dy2}px) scale(0.95); }
                    100% { transform: translate(0, 0) scale(1); }
                }
            `;
            document.head.appendChild(style);
        });

        document.body.insertBefore(container, document.body.firstChild);
    }

    /* ─────────────────────────────────────────────────────────────
       9. SKILL CARD ICON — 3D SPIN ON HOVER
       Icons do a full 3D Y-axis flip on hover 
    ───────────────────────────────────────────────────────────── */
    function initIconSpin() {
        const icons = document.querySelectorAll('.skill-card i, .activity-box h3 i, .skill-expanded-card i, .activity-bar i');

        icons.forEach((icon) => {
            icon.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), filter 0.3s ease';
            icon.style.display = 'inline-block';

            const card = icon.closest('.skill-card, .activity-box');
            if (!card) return;

            card.addEventListener('mouseenter', () => {
                icon.style.transform = 'rotateY(360deg) scale(1.2)';
            });
            card.addEventListener('mouseleave', () => {
                icon.style.transform = 'rotateY(0deg) scale(1)';
            });
        });
    }

    /* ─────────────────────────────────────────────────────────────
       10. CURSOR TRAIL — 3D DEPTH DOTS
    ───────────────────────────────────────────────────────────── */
    function initCursorTrail() {
        const trailCount = 8;
        const trail = [];

        for (let i = 0; i < trailCount; i++) {
            const dot = document.createElement('div');
            const scale = 1 - i / trailCount;
            dot.style.cssText = `
                position: fixed;
                width: ${6 - i * 0.5}px;
                height: ${6 - i * 0.5}px;
                border-radius: 50%;
                background: rgba(0, 242, 254, ${0.6 - i * 0.07});
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: opacity 0.3s;
                box-shadow: 0 0 ${4 + i}px rgba(0, 242, 254, 0.5);
                will-change: left, top;
            `;
            document.body.appendChild(dot);
            trail.push({ el: dot, x: 0, y: 0 });
        }

        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateTrail() {
            let x = mouseX, y = mouseY;

            trail.forEach((dot, i) => {
                const prev = i === 0 ? { x: mouseX, y: mouseY } : trail[i - 1];
                dot.x += (prev.x - dot.x) * (0.45 - i * 0.035);
                dot.y += (prev.y - dot.y) * (0.45 - i * 0.035);
                dot.el.style.left = dot.x + 'px';
                dot.el.style.top = dot.y + 'px';
            });

            requestAnimationFrame(updateTrail);
        }

        updateTrail();
    }

    /* ─────────────────────────────────────────────────────────────
       11. CERT CARD — 3D FLIP REVEAL
       Certificate cards flip in 3D when they enter viewport
    ───────────────────────────────────────────────────────────── */
    function initCertFlip() {
        const certCards = document.querySelectorAll('.cert-card');

        certCards.forEach((card, i) => {
            card.style.transformStyle = 'preserve-3d';
            card.style.perspective = '1000px';

            // Add a subtle depth push on hover (beyond the tilt)
            card.addEventListener('mouseenter', () => {
                // The tilt system handles most of it, just add a glow push
                card.style.borderLeftColor = 'var(--holo-cyan)';
                card.style.borderLeftWidth = '4px';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderLeftWidth = '3px';
            });
        });
    }

    /* ─────────────────────────────────────────────────────────────
       12. HERO BADGE — 3D BOUNCE ON LOAD
    ───────────────────────────────────────────────────────────── */
    function initHeroBounce() {
        const badge = document.querySelector('.badge');
        const h1 = document.querySelector('.hero-text h1');
        const h3 = document.querySelector('.hero-text h3');

        if (badge) {
            badge.style.opacity = '0';
            badge.style.transform = 'perspective(600px) rotateX(-90deg) translateY(-30px)';
            badge.style.transition = 'none';
            setTimeout(() => {
                badge.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease';
                badge.style.opacity = '1';
                badge.style.transform = 'perspective(600px) rotateX(0deg) translateY(0)';
            }, 200);
        }

        if (h1) {
            h1.style.opacity = '0';
            h1.style.transform = 'perspective(600px) rotateY(-15deg) translateX(-40px)';
            setTimeout(() => {
                h1.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease';
                h1.style.opacity = '1';
                h1.style.transform = 'perspective(600px) rotateY(0deg) translateX(0)';
            }, 400);
        }

        if (h3) {
            h3.style.opacity = '0';
            h3.style.transform = 'perspective(600px) rotateY(-10deg) translateX(-30px)';
            setTimeout(() => {
                h3.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease';
                h3.style.opacity = '1';
                h3.style.transform = 'perspective(600px) rotateY(0deg) translateX(0)';
            }, 600);
        }
    }

    /* ─────────────────────────────────────────────────────────────
       CSS INJECTION — 3D Classes & Keyframes
    ───────────────────────────────────────────────────────────── */
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* ── 3D Section Title Entrance ── */
            .title-3d-out {
                opacity: 0;
                transform: perspective(800px) rotateX(45deg) translateY(30px);
                transition: transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease;
            }
            .title-3d-in {
                opacity: 1;
                transform: perspective(800px) rotateX(0deg) translateY(0);
            }

            /* ── 3D Card Entrance ── */
            .card-3d-init {
                opacity: 0;
                transform: perspective(900px) rotateX(25deg) translateY(50px) scale(0.92);
                transition: transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.6s ease;
            }
            .card-3d-entered {
                opacity: 1;
                transform: perspective(900px) rotateX(0deg) translateY(0) scale(1);
            }

            /* Prevent double animation conflict with holo-hidden */
            .card-3d-init.holo-hidden,
            .card-3d-entered.holo-visible {
                animation: none !important;
            }

            /* ── 3D shine layer ── */
            .card-3d-shine {
                mix-blend-mode: screen;
            }

            /* ── Skill grid gets perspective context ── */
            .skills-grid {
                perspective: 1200px;
                perspective-origin: center center;
            }

            /* ── Cert & Activity grids ── */
            .cert-grid,
            .activities-container {
                perspective: 1200px;
                perspective-origin: center center;
            }

            /* ── Profile frame 3D ── */
            .hero-image {
                perspective: 1000px;
                perspective-origin: center center;
            }

            /* ── Activity box hover lift with 3D ── */
            .activity-box:hover {
                transform: translateY(-8px) perspective(800px) rotateX(2deg) !important;
            }

            /* ── Nav links — subtle 3D underline ── */
            nav a::before {
                content: '';
                position: absolute;
                bottom: -6px;
                left: 0;
                width: 0;
                height: 2px;
                background: var(--gradient-holo);
                transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                box-shadow: 0 0 8px var(--holo-cyan);
                transform-origin: left center;
            }
            nav a:hover::before {
                width: 100%;
            }

            /* ── Logo 3D hover ── */
            .logo {
                display: inline-block;
                transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), text-shadow 0.3s;
            }
            .logo:hover {
                transform: perspective(400px) rotateY(-8deg) scale(1.05);
            }

            /* ── Section title underline 3D grow ── */
            .section-title::after {
                transform-origin: center;
                transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .title-3d-in::after {
                animation: underline-grow 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
            }
            @keyframes underline-grow {
                0%  { width: 0; opacity: 0; }
                100% { width: 80px; opacity: 1; }
            }

            /* ── Social buttons — 3D depth shadow ── */
            .social-btn {
                transform-style: preserve-3d;
            }
            .social-btn::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: inherit;
                transform: translateZ(-6px);
                filter: blur(4px);
                opacity: 0;
                transition: opacity 0.3s;
            }
            .social-btn:hover::after {
                opacity: 0.4;
            }

            /* ── Holo frame pulse scale ── */
            .image-wrapper {
                transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
            }
            .hero-image:hover .image-wrapper {
                transform: scale(1.03);
            }

            /* ── Footer 3D text ── */
            footer p {
                transition: transform 0.4s ease, text-shadow 0.4s ease;
            }
            footer:hover p {
                transform: perspective(400px) rotateX(-5deg) translateY(-2px);
                text-shadow: 0 0 10px rgba(0, 242, 254, 0.4);
            }

            /* ── Cert card image 3D tilt on hover ── */
            .cert-image-wrapper {
                transform-style: preserve-3d;
                transition: transform 0.4s ease;
            }

            /* ── Game HUD 3D tilt ── */
            .game-hud {
                transform-style: preserve-3d;
                transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
            }
            .game-hud:hover {
                transform: perspective(600px) rotateX(-5deg) rotateY(3deg) translateZ(5px);
            }

            /* ── Modal 3D entrance ── */
            .holo-modal.active .holo-modal-container {
                transform: scale(1) translateY(0) perspective(800px) rotateX(0deg) !important;
            }
            .holo-modal-container {
                transform-origin: center center;
                transform: scale(0.85) translateY(30px) perspective(800px) rotateX(8deg) !important;
                transition: transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) !important;
            }
            .holo-modal.active .holo-modal-container {
                transform: scale(1) translateY(0) perspective(800px) rotateX(0deg) !important;
            }

            /* ── Scroll progress 3D indicator ── */
            .scroll-3d-bar {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #00f2fe, #4facfe, #b06bff);
                z-index: 9998;
                box-shadow: 0 0 10px rgba(0, 242, 254, 0.8), 0 0 20px rgba(0, 242, 254, 0.4);
                transform-origin: left center;
                transform: scaleX(0);
                transition: transform 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    /* ─────────────────────────────────────────────────────────────
       13. SCROLL PROGRESS BAR
    ───────────────────────────────────────────────────────────── */
    function initScrollProgressBar() {
        const bar = document.createElement('div');
        bar.className = 'scroll-3d-bar';
        document.body.appendChild(bar);

        window.addEventListener('scroll', () => {
            const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            bar.style.width = (p * 100) + '%';
            bar.style.transform = 'scaleX(1)';
        });
    }

    /* ─────────────────────────────────────────────────────────────
       INIT — Run all 3D systems
    ───────────────────────────────────────────────────────────── */
    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        injectCSS();
        initFloatingOrbs();
        init3DScene();
        initCardTilt();
        initMagneticButtons();
        init3DScrollParallax();
        initProfileGyro();
        init3DScrollEntrance();
        init3DCardEntrance();
        initIconSpin();
        initCursorTrail();
        initCertFlip();
        initHeroBounce();
        initScrollProgressBar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
