const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--jump)');
const sections = document.querySelectorAll('.accordion-content');

// トップページ（アコーディオン）用：最初から開いておく項目があれば設定
const defaultOpenLink = document.querySelector('[data-target="programs"]');
if (defaultOpenLink) {
  defaultOpenLink.classList.add('active');
}

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

      targetSection.addEventListener('transitionend', function handler(ev) {
        if (ev.propertyName === 'max-height') {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetSection.removeEventListener('transitionend', handler);
        }
      });
    }
  });
});

// ブログのカテゴリーフィルター
const categoryButtons = document.querySelectorAll('.category-btn');
const blogItems = document.querySelectorAll('.blog-list-item');
const noPostsMessage = document.querySelector('.no-posts-message');

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selected = btn.getAttribute('data-category');

    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    let visibleCount = 0;

    blogItems.forEach(item => {
      const itemCategories = item.getAttribute('data-categories').split(',');

      if (selected === 'all' || itemCategories.includes(selected)) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (noPostsMessage) {
      noPostsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  });
});