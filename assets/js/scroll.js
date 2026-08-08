document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scroll-wrapper').forEach(wrapper => {
        const row = wrapper.querySelector('.scroll-row');
        const left = wrapper.querySelector('.gallery-left');
        const right = wrapper.querySelector('.gallery-right');

        if (!row) return;

        // Calculate page width dynamically (in case wrapper resizes)
        function pageWidth() {
            return wrapper.clientWidth || window.innerWidth;
        }

        if (left) {
            left.addEventListener('click', () => {
                row.scrollBy({ left: -pageWidth(), behavior: 'smooth' });
            });
        }

        if (right) {
            right.addEventListener('click', () => {
                row.scrollBy({ left: pageWidth(), behavior: 'smooth' });
            });
        }

        // Mobile swipe support
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