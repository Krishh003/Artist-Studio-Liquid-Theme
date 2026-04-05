/**
 * Artist detail page controller.
 * Handles: sticky scroll card peel, ambient audio, artwork modal + ColorThief.
 */
document.addEventListener('DOMContentLoaded', () => {
    initSignatureReveal();
    initStickyScroll();
    initAudioPlayer();
    initArtworkModal();
    initMeetParallax();
    initArtworksGrid();
});

// ---------------------------------------------------------------------------
// Signature reveal on page load
// ---------------------------------------------------------------------------
function initSignatureReveal() {
    const sig = document.getElementById('artist-signature');
    if (!sig) return;

    sig.classList.add('signature-reveal');

    const reveal = () => {
        sig.classList.add('signature-visible');
    };

    // If it's an image, wait for it to load to avoid flickering during the clip-path animation
    if (sig.tagName === 'IMG') {
        if (sig.complete) {
            setTimeout(reveal, 200);
        } else {
            sig.addEventListener('load', () => setTimeout(reveal, 200));
        }
    } else {
        setTimeout(reveal, 200);
    }
}

// ---------------------------------------------------------------------------
// Sticky scroll — card peel driven by scroll progress
// ---------------------------------------------------------------------------
function initStickyScroll() {
    const container = document.querySelector('.sticky-scroll-container');
    const cards = [...document.querySelectorAll('.sticky-card:not(.sticky-card--static)')];
    if (!container || cards.length === 0) return;

    const totalCards = cards.length + 1; // +1 for the static bottom card
    const step = totalCards > 1 ? (1 / (totalCards - 1)) * 0.75 : 0;

    // Title opacity (signature background fades as you scroll)
    const sig = document.getElementById('artist-signature');

    window.addEventListener('scroll', () => {
        const { top, height } = container.getBoundingClientRect();
        const containerTop = window.scrollY + top;
        const progress = Math.max(0, Math.min(1,
            (window.scrollY - containerTop) / (height - window.innerHeight)
        ));

        // Fade the signature out over the first 60% of scroll
        if (sig) {
            const sigOpacity = Math.max(0, 0.35 * (1 - Math.min(1, progress / 0.6)));
            sig.style.opacity = sigOpacity;
        }

        cards.forEach((card, index) => {
            const start = index * step;
            const end = (index + 1) * step;
            const cardProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));

            const xDir = index % 2 === 0 ? -120 : 120;
            const yDir = index % 3 === 2 ? -120 : (index % 3 === 1 ? 120 : 0);
            const rotDir = index % 2 === 0 ? -20 : 20;
            const baseRot = index % 2 === 0 ? -2 : 2;

            card.style.transform = `
                translateX(${cardProgress * xDir}%)
                translateY(${cardProgress * yDir}%)
                rotate(${baseRot + cardProgress * rotDir}deg)
            `;
            card.style.opacity = cardProgress > 0.6 ? 1 - ((cardProgress - 0.6) / 0.4) : 1;
            card.style.zIndex = 40 - index;
        });
    }, { passive: true });
}

// ---------------------------------------------------------------------------
// Ambient Audio — mute/unmute toggle
// ---------------------------------------------------------------------------
function initAudioPlayer() {
    const btn = document.getElementById('audio-play-toggle');
    const audio = document.getElementById('artist-audio');
    if (!btn || !audio) return;

    audio.volume = 0.4;

    // Attempt autoplay on first user interaction with the page
    const startAudio = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click', startAudio);
        document.removeEventListener('scroll', startAudio);
    };
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('scroll', startAudio, { once: true, passive: true });

    const icon = btn.querySelector('[data-audio-icon]');
    let muted = false;

    btn.addEventListener('click', () => {
        muted = !muted;
        audio.muted = muted;
        if (icon) icon.textContent = muted ? 'volume_off' : 'volume_up';
    });
}

// ---------------------------------------------------------------------------
// Artwork Modal — triggered by .artwork-card clicks (hero + grid)
// ---------------------------------------------------------------------------
function initArtworkModal() {
    const modal = document.getElementById('artwork-modal');
    const closeBtn = document.getElementById('modal-close');
    const imgEl = document.getElementById('modal-image');
    if (!modal) return;

    let colorThief = null;
    if (typeof ColorThief !== 'undefined') {
        colorThief = new ColorThief();
    }

    function openModal(data) {
        document.getElementById('modal-title').textContent = data.title || '';
        const artistEl = document.getElementById('modal-artist-name');
        if (artistEl) artistEl.textContent = data.artist || '';
        document.getElementById('modal-desc').textContent =
            data.description || 'No description provided for this specific piece.';

        if (imgEl) {
            imgEl.src = data.image || '';
            imgEl.alt = data.title || '';
        }

        modal.classList.remove('hidden');
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        // Trigger right-panel slide-in animation
        const detail = modal.querySelector('.reveal-modal');
        if (detail) {
            detail.classList.remove('reveal-modal--active');
            void detail.offsetWidth; // force reflow to restart transition
            detail.classList.add('reveal-modal--active');
        }

        // Pause ambient audio while modal is open
        const ambientAudio = document.getElementById('artist-audio');
        if (ambientAudio) ambientAudio.pause();

        // ColorThief accent color
        if (colorThief && imgEl) {
            if (imgEl.complete && imgEl.naturalWidth > 0) {
                applyDynamicColor(imgEl, colorThief);
            } else {
                imgEl.onload = () => applyDynamicColor(imgEl, colorThief);
            }
        }

        // Inquire button mailto
        const inquireBtn = modal.querySelector('[data-inquiry-button]');
        if (inquireBtn && data.url) {
            inquireBtn.onclick = () => {
                window.location.href = `mailto:pankaj.saroj@hotmail.com?subject=${encodeURIComponent('Inquiry: ' + (data.title || '') + ' — Pristine Forests')}`;
            };
        }
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        modal.querySelector('.reveal-modal')?.classList.remove('reveal-modal--active');
        // Resume ambient audio
        const ambientAudio = document.getElementById('artist-audio');
        if (ambientAudio) ambientAudio.play().catch(() => {});
    }

    // Delegate clicks on all .artwork-card elements (hero sticky + artworks grid)
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.artwork-card');
        if (!card) return;
        const d = card.dataset;
        if (!d.image && !d.title) return; // not a populated card
        e.preventDefault();
        openModal({
            title: d.title,
            artist: d.artist,
            description: d.description,
            image: d.image,
            url: d.url
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ---------------------------------------------------------------------------
// ColorThief — extract dominant color and apply to modal accents
// ---------------------------------------------------------------------------
function applyDynamicColor(img, colorThief) {
    try {
        const rgb = colorThief.getColor(img);
        // ensureVibrant: avoid colors too dark or too light
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        const adjusted = brightness < 60
            ? rgb.map(c => Math.min(255, c + 80))
            : brightness > 220
                ? rgb.map(c => Math.max(0, c - 40))
                : rgb;
        const hex = '#' + adjusted.map(c => c.toString(16).padStart(2, '0')).join('');

        const modal = document.getElementById('artwork-modal');
        modal.querySelectorAll('.dynamic-accent').forEach(el => { el.style.color = hex; });
        modal.querySelectorAll('.dynamic-accent-bg').forEach(el => { el.style.backgroundColor = hex; });
    } catch (e) {
        // Silent fallback — gold stays
    }
}

// ---------------------------------------------------------------------------
// Meet section parallax — translate on scroll
// ---------------------------------------------------------------------------
function initMeetParallax() {
    const meetSection = document.querySelector('.meet-section');
    const meetText = meetSection?.querySelector('.meet-section__text');
    if (!meetSection || !meetText) return;

    window.addEventListener('scroll', () => {
        const { top, height } = meetSection.getBoundingClientRect();
        const progress = (window.innerHeight - top) / (window.innerHeight + height);
        const y = (progress - 0.5) * 200; // range: -100px to +100px
        meetText.style.transform = `translateY(${y}px)`;
    }, { passive: true });
}

// ---------------------------------------------------------------------------
// Artworks grid — Intersection Observer staggered entrance
// ---------------------------------------------------------------------------
function initArtworksGrid() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index || '0', 10);
                entry.target.style.transitionDelay = `${(index % 6) * 0.1}s`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.artwork-thumb').forEach((el, i) => {
        el.dataset.index = i;
        observer.observe(el);
    });
}
