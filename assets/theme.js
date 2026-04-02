document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initHeaderScroll();
  initMobileMenu();
  initIntersectionObserver();
});

/**
 * Initializes Dark Mode using View Transitions API (if supported)
 * and persists to localStorage.
 */
function initDarkMode() {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;

  // Initialize from storage or system preference
  const isDark = localStorage.getItem('theme') === 'dark' || 
                 (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }

  toggleBtn.addEventListener('click', (event) => {
    const toggle = () => {
      const isNowDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
    };

    // Use View Transitions API for a sleek circular reveal if supported
    if (!document.startViewTransition) {
      toggle();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      toggle();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: document.documentElement.classList.contains('dark') ? clipPath.reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  });
}

/**
 * Handles header reveal on hover and scroll-based background blur.
 */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/**
 * Toggles the mobile navigation dropdown open/closed.
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const openIcon = document.querySelector('[data-menu-icon-open]');
  const closeIcon = document.querySelector('[data-menu-icon-close]');
  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    if (openIcon) openIcon.style.display = isOpen ? 'none' : '';
    if (closeIcon) closeIcon.style.display = isOpen ? '' : 'none';
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link inside it is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      if (openIcon) openIcon.style.display = '';
      if (closeIcon) closeIcon.style.display = 'none';
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Generic Intersection Observer for revealing elements as they enter viewport.
 */
function initIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, we can stop observing
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal:not(.artist-card-reveal)').forEach(el => {
    observer.observe(el);
  });
}
