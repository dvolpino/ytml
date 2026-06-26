// JavaScript Document

const BASE_URL = 'https://dvolpino.github.io/';
const NONE_VALUE = 'none'; // sentinel stored in localStorage + used as the <option value="none"> in the dropdown

// 0. RUN THIS IMMEDIATELY: measure the REAL visible viewport height via JS and
//    expose it as a CSS variable. CSS-only vh/dvh/svh all proved unreliable
//    specifically in the installed PWA (standalone display mode) on Android —
//    pages were scrollable well past their actual content, with the logo
//    scrolling out of view into blank space that was never real content.
//    window.innerHeight is the one source that reliably reflects what's
//    actually visible, regardless of browser tab vs. installed PWA vs.
//    dynamic toolbar state. styles.css uses var(--real-vh, 100svh) so it
//    still has a CSS-only fallback before this script runs.
(function setRealViewportHeight() {
    function update() {
        document.documentElement.style.setProperty('--real-vh', window.innerHeight + 'px');
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', function () {
        setTimeout(update, 200); /* let the browser/OS finish resizing before re-measuring */
    });
})();

function toAbsolute(path) {
    if (!path || path === NONE_VALUE) return '';
    if (path.startsWith('http')) return path;
    return BASE_URL + path;
}

// 1. RUN THIS IMMEDIATELY: Apply background before the page even finishes drawing
(function applySavedBackground() {
    const savedBg = localStorage.getItem('userBackground');

    if (savedBg === NONE_VALUE) {
        document.body.style.backgroundImage = 'none';
        return;
    }

    if (savedBg) {
        const absolute = toAbsolute(savedBg);
        // Fix and re-save if it was stored as a relative path
        if (!savedBg.startsWith('http')) {
            localStorage.setItem('userBackground', absolute);
        }
        document.body.style.backgroundImage = "url('" + absolute + "')";
    }
})();

// 2. Used on the selector page to save new choices
function updateBackground() {
    const selector = document.getElementById('bgSelector');
    if (selector) {
        const selectedValue = selector.value;

        // "No background" option selected
        if (selectedValue === NONE_VALUE || selectedValue === '') {
            document.body.style.backgroundImage = 'none';
            localStorage.setItem('userBackground', NONE_VALUE);
            return;
        }

        const selectedImage = toAbsolute(selectedValue);
        document.body.style.backgroundImage = "url('" + selectedImage + "')";
        localStorage.setItem('userBackground', selectedImage);
    }
}

// 3. Sync the dropdown UI menu state once the HTML is ready
window.addEventListener('DOMContentLoaded', () => {
    const savedBg = localStorage.getItem('userBackground');
    const selector = document.getElementById('bgSelector');

    if (savedBg && selector) {
        if (savedBg === NONE_VALUE) {
            selector.value = NONE_VALUE;
        } else {
            // Match against both relative and absolute versions
            const relative = savedBg.replace(BASE_URL, '');
            selector.value = relative;
        }
    }
});
