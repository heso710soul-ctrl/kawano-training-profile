const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--jump)');
const sections = document.querySelectorAll('.accordion-content');

document.querySelector('[data-target="programs"]').classList.add('active');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    const isOpen = targetSection.classList.contains('open');

    sections.forEach(sec => sec.classList.remove('open'));
    navLinks.forEach(l => l.classList.remove('active'));

    if (!isOpen) {
      targetSection.classList.add('open');
      link.classList.add('active');

      // アニメーションが終わるのを待ってからスクロール
      targetSection.addEventListener('transitionend', function handler(ev) {
        if (ev.propertyName === 'max-height') {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetSection.removeEventListener('transitionend', handler);
        }
      });
    }
  });
});