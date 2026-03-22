/* ============================================================
   MAHAJAN INTERNATIONAL IMPORT EXPORT
   Main JavaScript v2.0 — Vanilla JS, No Frameworks
   Integrations: AOS.js, Swiper.js
   ============================================================ */

'use strict';

/* ─── UTILITY ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 1. AOS INITIALIZATION ───────────────────────────────── */
(function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60
  });
})();

/* ─── 2. SWIPER — TESTIMONIALS CAROUSEL ──────────────────── */
(function initTestimonialsSwiper() {
  if (typeof Swiper === 'undefined') return;
  if (!document.querySelector('.testimonials-swiper')) return;

  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 28,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      768:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
})();

/* ─── 3. HEADER — SCROLL BEHAVIOR ────────────────────────── */
(function initHeader() {
  const header = $('.header');
  if (!header) return;

  function onScroll() {
    const isScrolled = window.scrollY > 72;
    header.classList.toggle('scrolled', isScrolled);
    // Remove transparent class once scrolled (for hero pages)
    if (isScrolled && header.classList.contains('transparent')) {
      header.dataset.wasTransparent = 'true';
    } else if (!isScrolled && header.dataset.wasTransparent) {
      // Only re-apply transparent if originally set in HTML
      if (header.dataset.transparent === 'true') {
        // transparent class was set in HTML; keep it while not scrolled
      }
    }

    // Back to Top visibility
    const btt = $('.back-top');
    if (btt) btt.classList.toggle('show', window.scrollY > 500);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── 4. MOBILE MENU ──────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function toggle(force) {
    const isOpen = force !== undefined ? force : !hamburger.classList.contains('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggle());

  $$('a', mobileMenu).forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle(false);
  });
})();

/* ─── 5. ACTIVE NAV LINK ──────────────────────────────────── */
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    // Strip hash and query for comparison
    const hrefBase = href.split('#')[0].split('?')[0];
    const match =
      hrefBase === page ||
      (page === '' && hrefBase === 'index.html') ||
      hrefBase === page.replace('.html', '');
    link.classList.toggle('active', match);
  });
})();

/* ─── 6. BACK TO TOP ──────────────────────────────────────── */
(function initBackToTop() {
  const btn = $('.back-top');
  if (!btn) return;
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();

/* ─── 7. COUNTER ANIMATION (STATS) ───────────────────────── */
(function initCounters() {
  // Target both possible wrapper classes used across pages
  const sections = $$('.stats-section, .stats-bar, .intro-strip');
  if (!sections.length) return;

  function animateCount(el) {
    const target   = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix   = el.dataset.suffix || '';
    const duration = 2200;
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current  = Math.floor(eased * target);
      // Preserve inner HTML structure (e.g. <span class="stat-suf">)
      const inner = el.querySelector('.stat-suf, .stat-suffix');
      if (inner) {
        el.firstChild.textContent = current;
      } else {
        el.textContent = current + suffix;
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (inner) {
          el.firstChild.textContent = target;
        } else {
          el.textContent = target + suffix;
        }
      }
    }
    requestAnimationFrame(step);
  }

  const observed = new Set();

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting && !observed.has(entry.target)) {
        observed.add(entry.target);
        $$('[data-count]', entry.target).forEach(animateCount);
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.3 }
  );

  sections.forEach(sec => observer.observe(sec));
})();

/* ─── 8. PRODUCT TABS (handles up to 12 categories) ─────── */
(function initProductTabs() {
  const tabs = $$('.ptab');
  if (!tabs.length) return;

  function activate(tab) {
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    $$('.prod-section').forEach(s => s.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const target  = tab.dataset.target;
    const section = document.getElementById(target);
    if (section) {
      section.classList.add('active');
      // Re-trigger AOS for newly visible elements
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));

  // Auto-activate from URL hash
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const hashTab = tabs.find(t => t.dataset.target === hash);
    if (hashTab) {
      activate(hashTab);
      return;
    }
  }
  // Default: first tab
  if (tabs[0]) activate(tabs[0]);
})();

/* ─── 9. CONTACT FORM — VALIDATION + LOCALSTORAGE ────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successBox = $('.form-success');

  function validate(field) {
    const value = field.value.trim();
    let valid = true;

    if (field.required && !value) {
      valid = false;
    } else if (field.type === 'email' && value) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    } else if (field.type === 'tel' && value) {
      valid = /^[+\d\s\-()]{7,20}$/.test(value);
    }

    field.classList.toggle('error', !valid);
    return valid;
  }

  // Real-time validation
  $$('input, select, textarea', form).forEach(field => {
    field.addEventListener('blur',  () => validate(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validate(field);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fields    = $$('input[required], select[required], textarea[required]', form);
    const allValid  = fields.map(f => validate(f)).every(Boolean);

    if (!allValid) {
      const firstError = $('.error', form);
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect data
    const data = {
      name:      form.querySelector('#name')?.value.trim(),
      email:     form.querySelector('#email')?.value.trim(),
      phone:     form.querySelector('#phone')?.value.trim(),
      country:   form.querySelector('#country')?.value.trim(),
      product:   form.querySelector('#product')?.value,
      message:   form.querySelector('#message')?.value.trim(),
      timestamp: new Date().toISOString(),
      id:        'ENQ-' + Date.now()
    };

    // Save to localStorage
    try {
      const prev = JSON.parse(localStorage.getItem('mahajan_enquiries') || '[]');
      prev.push(data);
      localStorage.setItem('mahajan_enquiries', JSON.stringify(prev));
    } catch (err) {
      console.warn('localStorage not available:', err);
    }

    // Show success
    form.style.display = 'none';
    if (successBox) {
      successBox.style.display = 'block';
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Populate enquiry reference
      const refEl = successBox.querySelector('.enq-ref');
      if (refEl) refEl.textContent = data.id;
    }
  });
})();

/* ─── 10. BLOG CATEGORY FILTER ────────────────────────────── */
(function initBlogFilter() {
  const catTags = $$('.cat-tag');
  const blogCards = $$('.blog-card, .blog-card-featured');
  if (!catTags.length) return;

  catTags.forEach(tag => {
    tag.addEventListener('click', () => {
      catTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      const selected = tag.dataset.category || tag.textContent.trim().toLowerCase();

      if (selected === 'all' || !blogCards.length) return;

      // If cards have data-category attributes, filter them
      blogCards.forEach(card => {
        const cardCat = card.dataset.category || '';
        const show    = cardCat === '' || cardCat.toLowerCase() === selected;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* ─── 11. SMOOTH ANCHOR SCROLL ─────────────────────────────── */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = ($('.header')?.offsetHeight || 80) + 20;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - headerH,
          behavior: 'smooth'
        });
      }
    });
  });
})();

/* ─── 12. LAZY IMAGE LOADING ──────────────────────────────── */
(function initLazyLoad() {
  const images = $$('img[data-src]');
  if (!images.length) return;

  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => imgObserver.observe(img));
})();

/* ─── 13. HERO PARALLAX (subtle, reduced-motion safe) ───── */
(function initParallax() {
  const hero = $('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // CSS background-attachment:fixed handles parallax for the bg image.
  // This adds a subtle content drift only.
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scroll  = window.scrollY;
        const content = $('.hero-content');
        if (content && scroll < window.innerHeight) {
          content.style.transform = `translateY(${scroll * 0.12}px)`;
          content.style.opacity   = String(1 - scroll / (window.innerHeight * 0.85));
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ─── 14. PRINT: ENQUIRY REF (page load restore) ─────────── */
(function restoreEnquiryRef() {
  const successBox = $('.form-success');
  if (!successBox) return;
  const refEl = successBox.querySelector('.enq-ref');
  if (refEl && !refEl.textContent) {
    try {
      const lastEnq = JSON.parse(localStorage.getItem('mahajan_enquiries') || '[]').slice(-1)[0];
      if (lastEnq) refEl.textContent = lastEnq.id;
    } catch (_) { /* silent */ }
  }
})();
