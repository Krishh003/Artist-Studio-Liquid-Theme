/**
 * Intersection Observer for staggered grid cards Entrance.
 * Every artist card gets a delay based on its data-index attribute.
 * Also handles the grayscale transition on hover.
 */
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger based on data-index
                const index = entry.target.dataset.index || 0;
                entry.target.style.transitionDelay = `${index % 4 * 0.1}s`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const artistCards = document.querySelectorAll('.artist-card-reveal');
    artistCards.forEach(card => {
        observer.observe(card);
    });
});
