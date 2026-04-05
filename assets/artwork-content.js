/**
 * Artwork detail page Controller.
 * Handles: Main image zoom, metadata entrance, inquiry mailto composition.
 */
document.addEventListener('DOMContentLoaded', () => {
    initImageZoom();
    initEntranceAnimations();
    initInquiryButton();
});

function initImageZoom() {
    const containers = document.querySelectorAll('.image-zoom-container');
    
    containers.forEach(container => {
        const image = container.querySelector('.zoom-target');
        if (!image) return;

        container.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = container.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;

            image.style.transformOrigin = `${x * 100}% ${y * 100}%`;
            image.style.transform = 'scale(1.2)';
        });

        container.addEventListener('mouseleave', () => {
            image.style.transform = 'scale(1)';
        });
    });
}

function initEntranceAnimations() {
    const revealItems = document.querySelectorAll('.artwork-reveal');
    revealItems.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('is-visible');
        }, 100 * index);
    });
}

function initInquiryButton() {
    const inquiryBtns = document.querySelectorAll('[data-inquiry-button]');
    
    inquiryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent(`Inquiry for Artwork: ${btn.dataset.title}`);
            const body = encodeURIComponent(`Hi Pristine Forests Team,\n\nI am interested in the artwork "${btn.dataset.title}" by ${btn.dataset.artist}.\n\nPlease let me know if this piece is available and the shipping details.`);
            
            window.location.href = `mailto:pankaj.saroj@hotmail.com?subject=${subject}&body=${body}`;
        });
    });
}
