const navLinks = document.querySelectorAll('.nav-link:not(.nav-link--jump)');
const sections = document.querySelectorAll('.accordion-content');

// 初期状態：programsだけ開いてる状態にする（HTML側でopenクラス付与済み）
document.querySelector('[data-target="programs"]').classList.add('active');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('data-target');
    const targetSection = document.getElementById(targetId);
    const isOpen = targetSection.classList.contains('open');

    // 全部閉じる & ナビのactive解除
    sections.forEach(sec => sec.classList.remove('open'));
    navLinks.forEach(l => l.classList.remove('active'));

    // クリックしたやつだけ開く（トグル）
    if (!isOpen) {
      targetSection.classList.add('open');
      link.classList.add('active');

      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });
});