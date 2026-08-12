const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--jump)');
const sections = document.querySelectorAll('.accordion-content');

// URLのハッシュ（#features など）があれば、そのセクションを開く。無ければ「研修メニュー」を開く
function openSectionFromHash() {
  const hash = window.location.hash.replace('#', ''); // 例: "features"
  const targetId = hash || 'programs'; // ハッシュが無ければデフォルトで programs

  const targetLink = document.querySelector(`[data-target="${targetId}"]`);
  const targetSection = document.getElementById(targetId);

  if (targetLink && targetSection) {
    sections.forEach(sec => sec.classList.remove('open'));
    navLinks.forEach(l => l.classList.remove('active'));

    targetSection.classList.add('open');
    targetLink.classList.add('active');

    // ハッシュがある場合は、開いたあとにその位置までスクロール
    if (hash) {
      targetSection.addEventListener('transitionend', function handler(ev) {
        if (ev.propertyName === 'max-height') {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetSection.removeEventListener('transitionend', handler);
        }
      });
    }
  }
}

// ページ読み込み時に実行
openSectionFromHash();

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
