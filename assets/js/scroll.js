document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scroll-wrapper').forEach(wrapper => {
        const row = wrapper.querySelector('.scroll-row');
        if (!row) return;

        let startX = 0;

        row.addEventListener('touchstart', e => {
            if (!e.touches || !e.touches[0]) return;
            startX = e.touches[0].clientX;
        }, { passive: true });

        row.addEventListener('touchmove', e => {
            if (!e.touches || !e.touches[0]) return;
            const diff = startX - e.touches[0].clientX;
            row.scrollLeft += diff;
            startX = e.touches[0].clientX;
        }, { passive: true });
    });
});