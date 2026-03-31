/**
 * Artist detail page Controller.
 * Handles: Sticky Scroll card stack, Audio player, artwork Modal + ColorThief extraction.
 */
document.addEventListener('DOMContentLoaded', () => {
    initStickyScroll();
    initAudioPlayer();
    initArtworkModal();
});

function initStickyScroll() {
    const container = document.querySelector('.sticky-scroll-container');
    const cards = [...document.querySelectorAll('.sticky-card')];
    if (!container || cards.length === 0) return;

    const totalCards = cards.length;

    window.addEventListener('scroll', () => {
        const { top, height } = container.getBoundingClientRect();
        const containerTop = window.scrollY + top;
        // Progress of scroll through the sticky container
        const progress = Math.max(0, Math.min(1, 
            (window.scrollY - containerTop) / (height - window.innerHeight)
        ));

        // Letcards peel away over 75% of the total scroll distance
        const step = (1 / (totalCards - 1)) * 0.75;

        cards.forEach((card, index) => {
            // Last card stays in place
            if (index === totalCards - 1) return;

            const start = index * step;
            const end = (index + 1) * step;
            const cardProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));

            // Alternating directions for card peel-off
            const xDir = index % 2 === 0 ? -120 : 120;
            const yDir = index % 3 === 2 ? -120 : (index % 3 === 1 ? 120 : 0);
            const rotDir = index % 2 === 0 ? -20 : 20;
            const baseRot = index % 2 === 0 ? -2 : 2;

            card.style.transform = `
                translateX(${cardProgress * xDir}%)
                translateY(${cardProgress * yDir}%)
                rotate(${baseRot + cardProgress * rotDir}deg)
            `;

            // Fade out as it exits
            card.style.opacity = cardProgress > 0.6 ? 1 - ((cardProgress - 0.6) / 0.4) : 1;
            card.style.zIndex = 40 - index;
        });

        // Background tagline fade based on first half of progress
        const tagline = document.querySelector('.hero-tagline');
        if (tagline) {
            tagline.style.opacity = 1 - Math.min(1, progress * 4);
        }
    }, { passive: true });
}

function initAudioPlayer() {
    const audioBtn = document.getElementById('audio-play-toggle');
    const audio = document.getElementById('artist-audio');
    if (!audioBtn || !audio) return;

    audioBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            audioBtn.classList.add('playing');
        } else {
            audio.pause();
            audioBtn.classList.remove('playing');
        }
    });

    // Auto-update button visual on end
    audio.onended = () => audioBtn.classList.remove('playing');
}

function initArtworkModal() {
    const modal = document.getElementById('artwork-modal');
    const triggers = document.querySelectorAll('.artwork-card');
    const closeBtn = document.getElementById('modal-close');
    const imgEl = modal?.querySelector('#modal-image');
    
    if (!modal || !triggers.length) return;

    const colorThief = new ColorThief();

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const data = trigger.dataset;
            
            // Populate Modal Content
            modal.querySelector('#modal-title').textContent = data.title;
            modal.querySelector('#modal-price').textContent = data.price;
            modal.querySelector('#modal-desc').textContent = data.description;
            imgEl.src = data.image;

            // Show modal
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            // Wait for image load to extract color
            if (imgEl.complete) {
                applyDynamicColor(imgEl, colorThief);
            } else {
                imgEl.onload = () => applyDynamicColor(imgEl, colorThief);
            }
        });
    });

    closeBtn.onclick = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    modal.onclick = (e) => {
        if (e.target === modal) closeBtn.click();
    };
}

function applyDynamicColor(img, colorThief) {
    try {
        const color = colorThief.getColor(img);
        const rgbStr = `rgb(${color.join(',')})`;
        
        // Apply to modal highlights
        const modal = document.getElementById('artwork-modal');
        modal.style.setProperty('--accent-color', rgbStr);
        
        const highlights = modal.querySelectorAll('.dynamic-accent');
        highlights.forEach(h => h.style.color = rgbStr);
        
        const bgHighlights = modal.querySelectorAll('.dynamic-accent-bg');
        bgHighlights.forEach(h => h.style.backgroundColor = rgbStr);
    } catch(e) {
        console.error('Color extract failed', e);
    }
}
