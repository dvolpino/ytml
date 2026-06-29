// JavaScript Document

const BASE_URL = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1); // computed dynamically from wherever this page actually lives, instead of a hardcoded domain — this broke when the site moved from the repo root to /ytml/, since the old hardcoded value pointed at the wrong folder. Uses location.pathname (not location.href) so it stays correct even on pages whose query string itself contains slashes (e.g. MPlayer.html's NAS playlist URLs)
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

/* The background image lives on a separate, JS-injected element instead of
   on body directly (see .bg-fixed in styles.css for why) — this finds it,
   creating it on first use so no HTML file needs to be edited by hand to
   add it. Runs on every page automatically since this script already loads
   everywhere. */
function getOrCreateBgDiv() {
    var div = document.querySelector('.bg-fixed');
    if (!div) {
        div = document.createElement('div');
        div.className = 'bg-fixed';
        document.body.insertBefore(div, document.body.firstChild);
    }
    return div;
}

function toAbsolute(path) {
    if (!path || path === NONE_VALUE) return '';
    if (path.startsWith('http')) return path;
    return BASE_URL + path;
}

/* If a background was saved as an absolute URL before the site moved to a
   new location (e.g. from the repo root to /ytml/), that old URL no longer
   matches BASE_URL and would otherwise stay broken forever — toAbsolute()
   treats anything starting with 'http' as already-correct and never
   recomputes it. Recover the relative portion (everything from "images/"
   onward, which is how every background path is structured) and rebuild it
   against the current, correct BASE_URL. */
function migrateStaleAbsoluteUrl(saved) {
    if (!saved || saved === NONE_VALUE || !saved.startsWith('http')) return saved;
    if (saved.startsWith(BASE_URL)) return saved; // already matches the current location, fine as-is
    const marker = 'images/';
    const idx = saved.indexOf(marker);
    if (idx === -1) return saved; // unexpected format, leave it alone rather than guess wrong
    return BASE_URL + saved.substring(idx);
}

// 1. RUN THIS IMMEDIATELY: Apply background before the page even finishes drawing
(function applySavedBackground() {
    getOrCreateBgDiv(); /* always create it — even with no saved preference, the div must exist for styles.css's default background-image to show at all */

    let savedBg = localStorage.getItem('userBackground');
    savedBg = migrateStaleAbsoluteUrl(savedBg);

    if (savedBg === NONE_VALUE) {
        getOrCreateBgDiv().style.backgroundImage = 'none';
        return;
    }

    if (savedBg) {
        const absolute = toAbsolute(savedBg);
        // Fix and re-save if it was stored as a relative path, OR if it just got migrated above
        if (absolute !== localStorage.getItem('userBackground')) {
            localStorage.setItem('userBackground', absolute);
        }
        getOrCreateBgDiv().style.backgroundImage = "url('" + absolute + "')";
    }
})();

// 2. Used on the selector page to save new choices
function updateBackground() {
    const selector = document.getElementById('bgSelector');
    if (selector) {
        const selectedValue = selector.value;

        // "No background" option selected
        if (selectedValue === NONE_VALUE || selectedValue === '') {
            getOrCreateBgDiv().style.backgroundImage = 'none';
            localStorage.setItem('userBackground', NONE_VALUE);
            return;
        }

        const selectedImage = toAbsolute(selectedValue);
        getOrCreateBgDiv().style.backgroundImage = "url('" + selectedImage + "')";
        localStorage.setItem('userBackground', selectedImage);
    }
}

// 3. Sync the dropdown UI menu state once the HTML is ready
window.addEventListener('DOMContentLoaded', () => {
    const savedBg = migrateStaleAbsoluteUrl(localStorage.getItem('userBackground'));
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
