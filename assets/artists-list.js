/**
 * Intersection Observer for staggered artist card entrance.
 * Progressive enhancement: cards are visible without JS.
 * JS adds .card-ready (hides them) then .is-visible on intersect.
 */
document.addEventListener('DOMContentLoaded', () => {
    const artistCards = document.querySelectorAll('.artist-card-reveal');
    if (!artistCards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index || '0', 10);
                entry.target.style.transitionDelay = `${(index % 4) * 0.1}s`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    artistCards.forEach(card => {
        card.classList.add('card-ready');
        observer.observe(card);
    });
});
