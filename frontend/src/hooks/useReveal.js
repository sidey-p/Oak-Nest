// Elegant scroll reveal: any element with .reveal eases into place once as it
// enters the viewport. Staggered elements keep their animationDelay style —
// the delay applies relative to when the observer fires, so cards glide in
// one after another as the section scrolls into view.
//
// Robust against:
//   - elements mounted late (async grids, reviews): a MutationObserver picks
//     them up the moment they hit the DOM
//   - route changes: revealPage() is called by App on every navigation
//   - straddling elements (peeking at the viewport bottom): generous
//     rootMargin means anything even partially visible reveals immediately
let observer = null;
let mutationWatcher = null;

const getObserver = () => {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      // Reveal as soon as any part of the element crosses into the viewport
      // (plus a small look-ahead below), so nothing ever sits visibly stuck.
      { threshold: 0, rootMargin: '0px 0px 40px 0px' },
    );
  }
  return observer;
};

const watch = (el) => getObserver().observe(el);

const startMutationWatcher = () => {
  if (mutationWatcher || typeof MutationObserver === 'undefined') return;
  mutationWatcher = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes?.forEach?.((node) => {
        if (node.nodeType !== 1) return;
        if (node.classList?.contains('reveal') && !node.classList.contains('is-visible')) watch(node);
        node.querySelectorAll?.('.reveal:not(.is-visible)').forEach(watch);
      });
    }
  });
  mutationWatcher.observe(document.body, { childList: true, subtree: true });
};

// Observe every not-yet-visible .reveal element in the document. Safe to
// call repeatedly (after route changes, async loads, etc.).
export const revealPage = () => {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }
  startMutationWatcher();
  document.querySelectorAll('.reveal:not(.is-visible)').forEach(watch);
};
