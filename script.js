document.addEventListener("DOMContentLoaded", () => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGSAP = window.gsap && window.ScrollTrigger;

    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);


    /* ============================
       SMOOTH SCROLL (Lenis)
    ============================ */
    let lenis;

    if (window.Lenis && !prefersReducedMotion) {
        lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            if (hasGSAP) ScrollTrigger.update();
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (hasGSAP) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            closeMobileMenu();

            if (lenis) {
                lenis.scrollTo(target, { offset: -20 });
            } else {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    /* ============================
       HERO INTRO SEQUENCE
    ============================ */
    if (hasGSAP && !prefersReducedMotion) {
        const introTl = gsap.timeline({ delay: 0.2 });

        introTl
            .to('.hero h1 .line-inner', {
                y: '0%',
                duration: 1.1,
                stagger: 0.12,
                ease: 'power4.out',
            });
    } else {
        document.querySelectorAll('.hero h1 .line-inner').forEach((el) => {
            el.style.transform = 'translateY(0)';
        });
    }


    /* ============================
       SCROLL-TRIGGERED MASK REVEALS
       (section heading lines)
    ============================ */
    if (hasGSAP && !prefersReducedMotion) {
        document.querySelectorAll('.mask-heading').forEach((heading) => {
            const lines = heading.querySelectorAll('.line-inner');

            gsap.to(lines, {
                y: '0%',
                duration: 1,
                stagger: 0.08,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 85%',
                    once: true,
                },
            });
        });
    } else {
        document.querySelectorAll('.mask-heading .line-inner').forEach((el) => {
            el.style.transform = 'translateY(0)';
        });
    }


    /* ============================
       IMAGE SCROLL PARALLAX
    ============================ */
    if (hasGSAP && !prefersReducedMotion) {
        document.querySelectorAll('.card-image img').forEach((img) => {
            gsap.to(img, {
                scale: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.card-image'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.6,
                },
            });
        });
    }


    /* ============================
       SCROLL REVEALS (staggered fade-up)
    ============================ */
    const revealGroups = document.querySelectorAll(
        '.section-label, .activity-grid, .project-list, .faq-list, .contact-grid, .doc-list, .member-grid'
    );

    revealGroups.forEach((group) => {
        const items = group.matches('.activity-grid, .project-list, .faq-list, .doc-list, .member-grid')
            ? group.children
            : [group];

        Array.from(items).forEach((el, i) => {
            el.classList.add('reveal');
            el.style.transitionDelay = `${i * 0.08}s`;
        });
    });

    document.querySelectorAll('.contact h2').forEach((el) => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


    /* ============================
       NAVBAR SCROLLED STATE (smooth fade)
    ============================ */
    const navbar = document.querySelector('.navbar');
    const NAV_FADE_DISTANCE = 260; // px of scroll over which the navbar fully fades in

    function updateNavbarState() {
        if (!navbar) return;
        const progress = Math.min(Math.max(window.scrollY / NAV_FADE_DISTANCE, 0), 1);
        navbar.style.setProperty('--nav-progress', progress.toFixed(3));
    }

    updateNavbarState();

    if (lenis) {
        lenis.on('scroll', updateNavbarState);
    } else {
        window.addEventListener('scroll', updateNavbarState);
    }


    /* ============================
       MOBILE MENU
    ============================ */
    const menuButton = document.querySelector('.menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    function closeMobileMenu() {
        mobileMenu?.classList.remove('is-open');
        menuButton?.classList.remove('is-open');
    }

    menuButton?.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-open');
        menuButton.classList.toggle('is-open');
    });


    /* ============================
       FAQ ACCORDION
    ============================ */
    document.querySelectorAll('.faq-question').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const wasOpen = item.classList.contains('is-open');

            document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
                openItem.classList.remove('is-open');
            });

            if (!wasOpen) item.classList.add('is-open');
        });
    });


    /* ============================
       MAGNETIC BUTTONS
    ============================ */
    if (hasGSAP && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('.magnetic').forEach((el) => {
            const inner = el.querySelector('.magnetic-inner') || el;
            const strength = 0.4;

            const xTo = gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' });
            const yTo = gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' });

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const relX = e.clientX - (rect.left + rect.width / 2);
                const relY = e.clientY - (rect.top + rect.height / 2);
                xTo(relX * strength);
                yTo(relY * strength);
            });

            el.addEventListener('mouseleave', () => {
                xTo(0);
                yTo(0);
            });
        });
    }


    /* ============================
       CUSTOM CURSOR WITH LABEL
    ============================ */
    const cursor = document.querySelector('.cursor-dot');

    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let cursorX = gsap.quickTo(cursor, 'left', { duration: 0.5, ease: 'power3.out' });
        let cursorY = gsap.quickTo(cursor, 'top', { duration: 0.5, ease: 'power3.out' });

        window.addEventListener('mousemove', (e) => {
            cursor.classList.add('is-active');
            if (hasGSAP) {
                cursorX(e.clientX);
                cursorY(e.clientY);
            } else {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
            }
        });

        document.querySelectorAll('[data-cursor], a, button').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('is-hovering');
                const label = el.getAttribute('data-cursor');
                cursor.textContent = label || '';
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('is-hovering');
                cursor.textContent = '';
            });
        });
    }

});
