// Elegant scroll reveal: any element with .reveal eases into place once as it
// enters the viewport. Staggered elements keep their animationDelay style —
// the delay applies relative to when the observer fires, so cards glide in
// one after another as the section scrolls into view.
let observer = null;

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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
  }
  return observer;
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
  const obs = getObserver();
  document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => obs.observe(el));
};
