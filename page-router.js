/* ============================================================
   PAGE-ROUTER.JS — SPA Navigation for Hemnath Portfolio
   Handles slide transitions between Home / Skills / Certs / Activities
   ============================================================ */

(function () {
    'use strict';

    const PAGE_ORDER = ['home', 'skills', 'certs', 'activities'];
    let currentPage = 'home';
    let isTransitioning = false;

    /* ─────────────────────────────────────────────────────
       NAVIGATE — Slide between pages
    ───────────────────────────────────────────────────── */
    function navigateTo(target) {
        if (!target || target === currentPage || isTransitioning) return;

        const currentEl = document.getElementById('page-' + currentPage);
        const targetEl  = document.getElementById('page-' + target);
        if (!currentEl || !targetEl) return;

        isTransitioning = true;

        const curIdx = PAGE_ORDER.indexOf(currentPage);
        const tgtIdx = PAGE_ORDER.indexOf(target);
        const dir    = tgtIdx > curIdx ? 1 : -1; // 1 = forward (slide left), -1 = back (slide right)

        const exitClass  = dir > 0 ? 'page-exit-left'  : 'page-exit-right';
        const enterClass = dir > 0 ? 'page-enter-right' : 'page-enter-left';

        // Show target page offscreen immediately
        targetEl.style.display = 'block';
        targetEl.classList.add(enterClass);

        // Force reflow so the browser registers the initial transform before transition
        void targetEl.getBoundingClientRect();

        // Exit current page
        currentEl.classList.add(exitClass);

        // Slide target into view
        requestAnimationFrame(() => {
            targetEl.classList.add('page-is-entering');
            targetEl.classList.remove(enterClass);
        });

        const DURATION = 480; // ms — must match CSS transition

        setTimeout(() => {
            // Clean up outgoing page
            currentEl.style.display = 'none';
            currentEl.classList.remove('active', exitClass);

            // Activate incoming page
            targetEl.classList.remove('page-is-entering');
            targetEl.classList.add('active');

            currentPage     = target;
            isTransitioning = false;

            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Trigger entrance animations for newly visible elements
            activatePageElements(targetEl);

        }, DURATION);

        // Update nav immediately for snappy feedback
        updateNavState(target);
    }

    /* ─────────────────────────────────────────────────────
       NAV STATE — Highlight correct nav link
    ───────────────────────────────────────────────────── */
    function updateNavState(activePage) {
        document.querySelectorAll('nav a[data-page], a.logo[data-page]').forEach(link => {
            const lp = link.getAttribute('data-page');
            link.classList.toggle('active', lp === activePage);
        });
    }

    /* ─────────────────────────────────────────────────────
       ACTIVATE PAGE ELEMENTS
       Staggered entrance animations + progress bar fill
    ───────────────────────────────────────────────────── */
    function activatePageElements(pageEl) {
        // Reset & animate cards / bars
        const items = pageEl.querySelectorAll(
            '.skill-card, .cert-card, .activity-box, ' +
            '.skill-expanded-card, .cert-detail-card, .activity-bar, ' +
            '.stat-item'
        );

        items.forEach((item, i) => {
            // Override any existing animation classes from holo-effects.js
            item.classList.remove('holo-hidden', 'card-3d-init');
            item.style.opacity   = '0';
            item.style.transform = 'translateY(28px) scale(0.97)';
            item.style.transition = 'none';

            setTimeout(() => {
                item.style.transition = `opacity 0.55s ease, transform 0.55s cubic-bezier(0.34, 1.2, 0.64, 1)`;
                item.style.opacity    = '1';
                item.style.transform  = 'translateY(0) scale(1)';
                item.classList.add('holo-visible', 'card-3d-entered');
            }, 80 + i * 65);
        });

        // Animate progress bars
        const fills = pageEl.querySelectorAll('.skill-progress-fill');
        fills.forEach(fill => {
            fill.style.transition = 'none';
            fill.style.width      = '0';
            const target = fill.getAttribute('data-target-width') || '0';
            setTimeout(() => {
                fill.style.transition = 'width 1.4s cubic-bezier(0.1, 0.8, 0.25, 1)';
                fill.style.width      = target;
            }, 300);
        });

        // Section title entrance
        const titles = pageEl.querySelectorAll('.section-title');
        titles.forEach(t => {
            t.classList.remove('title-3d-in');
            t.classList.add('title-3d-out');
            setTimeout(() => {
                t.classList.add('title-3d-in');
                t.classList.remove('title-3d-out');
            }, 100);
        });

        // Terminal cursor blink reset
        const cursor = pageEl.querySelector('.tp-cursor');
        if (cursor) {
            cursor.style.animation = 'none';
            void cursor.getBoundingClientRect();
            cursor.style.animation = '';
        }
    }

    /* ─────────────────────────────────────────────────────
       ACTIVITY BAR MODAL
       Piggybacks on the existing holo-modal system
    ───────────────────────────────────────────────────── */
    function openBarModal(bar) {
        const modal = document.getElementById('detail-modal');
        if (!modal) return;

        const title   = bar.getAttribute('data-title')   || '';
        const details = bar.getAttribute('data-details')  || '';
        const bullets = bar.getAttribute('data-bullets')  || '';
        const iconCls = bar.getAttribute('data-icon')     || 'fas fa-terminal';

        document.getElementById('modal-title').textContent       = title;
        document.getElementById('modal-subtitle').textContent    = 'Extracurricular / Activity';
        document.getElementById('modal-description').textContent = details;
        document.getElementById('modal-icon').className          = iconCls;

        // Hide inapplicable sections
        document.getElementById('modal-image-container').style.display    = 'none';
        document.getElementById('modal-progress-container').style.display = 'none';
        document.getElementById('modal-subskills-container').style.display = 'none';
        document.getElementById('modal-action-btn').style.display         = 'none';

        // Build bullet list
        const bulletEl = document.getElementById('modal-bullets');
        bulletEl.innerHTML = '';
        if (bullets) {
            bulletEl.style.display = 'block';
            bullets.split(';').forEach(b => {
                const trimmed = b.trim();
                if (trimmed) {
                    const li = document.createElement('li');
                    li.textContent = trimmed;
                    bulletEl.appendChild(li);
                }
            });
        } else {
            bulletEl.style.display = 'none';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /* ─────────────────────────────────────────────────────
       INIT — Wire up all interactions
    ───────────────────────────────────────────────────── */
    function init() {
        // Global click delegation for page navigation
        document.addEventListener('click', e => {
            // Check for data-page trigger
            const trigger = e.target.closest('[data-page]');
            if (trigger) {
                // Skip external links (social-btn etc.)
                const href = trigger.getAttribute('href');
                if (href && !href.startsWith('#') && href !== '') return;

                e.preventDefault();
                const target = trigger.getAttribute('data-page');
                if (target) navigateTo(target);
                return;
            }

            // Activity bar click → open modal
            const bar = e.target.closest('.activity-bar');
            if (bar) {
                openBarModal(bar);
            }
        });

        // Initialise the home page elements on load
        const homeEl = document.getElementById('page-home');
        if (homeEl) {
            // Small delay to let CSS transitions settle
            setTimeout(() => activatePageElements(homeEl), 100);
        }

        // Make sure all non-active pages are hidden
        document.querySelectorAll('.page:not(.active)').forEach(p => {
            p.style.display = 'none';
        });

        // Set correct nav state
        updateNavState('home');
    }

    /* ─────────────────────────────────────────────────────
       Expose navigateTo globally (for overview portal cards)
    ───────────────────────────────────────────────────── */
    window.navigateTo = navigateTo;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
