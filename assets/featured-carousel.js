/**
 * Vertical carousel pause/play on hover.
 * The carousel structure is 3x duplicated for infinite scrolling.
 * This script ensures hover pauses it across all copies.
 */
document.addEventListener('DOMContentLoaded', () => {
    const carouselWrappers = document.querySelectorAll('.carousel-wrapper');
    
    carouselWrappers.forEach(wrapper => {
        const carousel = wrapper.querySelector('.carousel-content');
        if (!carousel) return;

        wrapper.addEventListener('mouseenter', () => {
            carousel.style.animationPlayState = 'paused';
        });

        wrapper.addEventListener('mouseleave', () => {
            carousel.style.animationPlayState = 'running';
        });

        // Touch support for mobile devices
        wrapper.addEventListener('touchstart', () => {
            carousel.style.animationPlayState = 'paused';
        }, { passive: true });

        wrapper.addEventListener('touchend', () => {
            carousel.style.animationPlayState = 'running';
        }, { passive: true });
    });
});
