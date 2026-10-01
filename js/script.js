/* ==========================================================================
   Portfolio — Main script
   Vanilla JS, no dependencies. Every feature is progressive: the site is
   fully readable with JavaScript disabled.
   --------------------------------------------------------------------------
   1. Preloader          6. Scroll reveal animations
   2. Theme toggle       7. Animated counters & skill bars
   3. Mobile navigation  8. Hero word rotator
   4. Header / back-top  9. Lazy-image fade-in
   5. Page transitions  10. Portfolio filter, footer year
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return reducedMotion.matches;
  }

  function storageGet(store, key) {
    try {
      return window[store].getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(store, key, value) {
    try {
      window[store].setItem(key, value);
    } catch (e) {
      /* storage unavailable (private mode etc.) — ignore */
    }
  }

  /* 1. Preloader
     ------------------------------------------------------------------------
     Shown once per browser session (the inline <head> script adds
     .no-preload on later page views so navigation stays snappy). */
  function hidePreloader() {
    root.classList.add('is-loaded');
    storageSet('sessionStorage', 'visited', '1');
  }

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader, { once: true });
    // Never let a slow third-party asset hold the page hostage.
    window.setTimeout(hidePreloader, 3500);
  }

  /* 2. Theme toggle
     ------------------------------------------------------------------------
     Initial theme is applied by the inline <head> script to avoid a flash.
     Here we wire up the button and keep following the OS setting until the
     visitor makes an explicit choice. */
  var themeToggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    var isDark = theme === 'dark';
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isDark));
    if (themeMeta) themeMeta.setAttribute('content', isDark ? '#0a0f1e' : '#f7f8fc');
    if (persist) storageSet('localStorage', 'theme', theme);
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  var colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchemeChange = function (event) {
    if (!storageGet('localStorage', 'theme')) applyTheme(event.matches ? 'dark' : 'light', false);
  };
  if (colorSchemeQuery.addEventListener) {
    colorSchemeQuery.addEventListener('change', onSchemeChange);
  }

  /* 3. Mobile navigation
     ------------------------------------------------------------------------ */
  var navToggle = document.querySelector('.nav__toggle');
  var navMenu = document.getElementById('nav-menu');
  var mobileNavQuery = window.matchMedia('(max-width: 960px)');

  function setMenu(open, returnFocus) {
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('nav-open', open);
    if (open) {
      var firstLink = navMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    } else if (returnFocus) {
      navToggle.focus();
    }
  }

  function isMenuOpen() {
    return navToggle && navToggle.getAttribute('aria-expanded') === 'true';
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(!isMenuOpen(), false);
    });

    // Close with Escape and return focus to the toggle.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMenuOpen()) setMenu(false, true);
    });

    // Keep keyboard focus inside the open menu (toggle + links).
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !isMenuOpen()) return;
      var focusables = [navToggle].concat(Array.prototype.slice.call(navMenu.querySelectorAll('a')));
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      var active = document.activeElement;
      if (focusables.indexOf(active) === -1) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Click outside the header closes the menu.
    document.addEventListener('click', function (event) {
      if (isMenuOpen() && !event.target.closest('.site-header')) setMenu(false, false);
    });

    // Leaving mobile layout resets the menu.
    var onNavQueryChange = function (event) {
      if (!event.matches && isMenuOpen()) setMenu(false, false);
    };
    if (mobileNavQuery.addEventListener) mobileNavQuery.addEventListener('change', onNavQueryChange);
  }

  /* 4. Header shadow + back-to-top button
     ------------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  var backToTop = document.querySelector('.back-to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      // Move focus to the top of the document for keyboard users.
      var skip = document.querySelector('.skip-link');
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  // In-page anchor links: CSS handles the smooth scroll; move focus to the
  // target so keyboard and screen-reader users land in the right place.
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.setTimeout(function () {
      target.focus({ preventScroll: true });
    }, prefersReducedMotion() ? 0 : 400);
  });

  /* 5. Page transitions
     ------------------------------------------------------------------------
     Fade the page out before following internal links. The fade-in is pure
     CSS (see .js main { animation: page-in }). */
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (e) {
      return;
    }

    var samePage = url.pathname === window.location.pathname && url.search === window.location.search;
    if (url.origin !== window.location.origin || samePage || !/(\.html|\/)$/.test(url.pathname)) return;
    if (prefersReducedMotion()) return;

    event.preventDefault();
    body.classList.add('is-leaving');
    window.setTimeout(function () {
      window.location.href = url.href;
    }, 220);
  });

  // Restore the page when it comes back from the back/forward cache.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      body.classList.remove('is-leaving');
      setMenu(false, false);
    }
  });

  /* 6–7. Scroll reveal, counters and skill bars
     ------------------------------------------------------------------------ */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (prefersReducedMotion()) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1600;
    var start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function reveal(el) {
    el.classList.add('is-visible');
    if (el.hasAttribute('data-count')) animateCounter(el);
    var counters = el.querySelectorAll('[data-count]');
    for (var i = 0; i < counters.length; i++) animateCounter(counters[i]);
  }

  var revealTargets = document.querySelectorAll('[data-reveal], .skill-group, .stats');

  // Stagger siblings that share a parent (e.g. a grid of cards).
  Array.prototype.forEach.call(document.querySelectorAll('[data-reveal-stagger]'), function (group) {
    Array.prototype.forEach.call(group.querySelectorAll('[data-reveal]'), function (child, index) {
      child.style.setProperty('--reveal-delay', index * 0.08 + 's');
    });
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    Array.prototype.forEach.call(revealTargets, function (el) {
      revealObserver.observe(el);
    });
  } else {
    Array.prototype.forEach.call(revealTargets, function (el) {
      el.classList.add('is-visible');
    });
  }

  /* 8. Hero word rotator
     ------------------------------------------------------------------------ */
  var rotator = document.querySelector('[data-rotate]');
  if (rotator && !prefersReducedMotion()) {
    var words;
    try {
      words = JSON.parse(rotator.getAttribute('data-rotate'));
    } catch (e) {
      words = [];
    }
    var wordIndex = 0;
    if (words.length > 1) {
      window.setInterval(function () {
        if (document.hidden) return;
        rotator.classList.add('is-swapping');
        window.setTimeout(function () {
          wordIndex = (wordIndex + 1) % words.length;
          rotator.textContent = words[wordIndex];
          rotator.classList.remove('is-swapping');
        }, 300);
      }, 2600);
    }
  }

  /* 9. Lazy-loaded images
     ------------------------------------------------------------------------
     Images use native loading="lazy". We fade them in once decoded, and fall
     back to IntersectionObserver for any <img data-src> (e.g. if you swap in
     images that should only start downloading near the viewport). */
  function markLoaded(img) {
    img.classList.add('is-loaded');
  }

  Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function (img) {
    if (img.complete && img.naturalWidth > 0) {
      markLoaded(img);
    } else {
      img.addEventListener('load', function () { markLoaded(img); }, { once: true });
      img.addEventListener('error', function () { markLoaded(img); }, { once: true });
    }
  });

  var deferredImages = document.querySelectorAll('img[data-src]');
  if (deferredImages.length) {
    var loadDeferred = function (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    };
    if ('IntersectionObserver' in window) {
      var imageObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadDeferred(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '200px 0px' }
      );
      Array.prototype.forEach.call(deferredImages, function (img) {
        imageObserver.observe(img);
      });
    } else {
      Array.prototype.forEach.call(deferredImages, loadDeferred);
    }
  }

  /* 10. Portfolio filter
     ------------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-grid [data-category]');
  var filterStatus = document.querySelector('.filter-count');

  function applyFilter(filter) {
    var shown = 0;
    Array.prototype.forEach.call(projectCards, function (card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.hidden = !match;
      card.classList.remove('is-filtering-in');
      if (match) {
        shown++;
        // Force reflow so the entrance animation restarts.
        void card.offsetWidth;
        card.classList.add('is-filtering-in');
        card.classList.add('is-visible');
      }
    });
    if (filterStatus) {
      filterStatus.textContent = 'Showing ' + shown + ' project' + (shown === 1 ? '' : 's');
    }
  }

  Array.prototype.forEach.call(filterButtons, function (button) {
    button.addEventListener('click', function () {
      Array.prototype.forEach.call(filterButtons, function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
      applyFilter(button.getAttribute('data-filter'));
    });
  });

  /* Footer year
     ------------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
