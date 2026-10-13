const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.textContent = open ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.textContent = '☰';
  }));
}
document.getElementById('year').textContent = new Date().getFullYear();

const publicationSearch = document.getElementById('publicationSearch');
const publicationCards = Array.from(document.querySelectorAll('#publicationList .publication'));
const publicationCount = document.getElementById('publicationCount');
const noPublications = document.getElementById('noPublications');
if (publicationSearch) {
  publicationSearch.addEventListener('input', () => {
    const query = publicationSearch.value.trim().toLowerCase();
    let visible = 0;
    publicationCards.forEach(card => {
      const haystack = (card.dataset.search + ' ' + card.innerText).toLowerCase();
      const match = haystack.includes(query);
      card.hidden = !match;
      if (match) visible++;
    });
    if (publicationCount) publicationCount.textContent = `${visible} publication${visible === 1 ? '' : 's'}`;
    if (noPublications) noPublications.hidden = visible !== 0;
  });
}
// Subtle entrance reveal; content remains visible if reduced motion or observer is unavailable.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.research-card, .publication, .project-card, .experience-item, .credential').forEach(el => {
    el.classList.add('reveal-ready');
    revealObserver.observe(el);
  });
}
