/* ============================================================
   河野智也サイト スクリプト
   1. スマホ用メニューの開閉
   2. 研修・相談メニューのタブ切り替え
   3. ブログ一覧のカテゴリー絞り込み
   4. お問い合わせフォームの送信
   ============================================================ */

/* ------------------------------------------------------------
   1. スマホ用メニューの開閉
------------------------------------------------------------ */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // メニュー内のリンクを押したら閉じる
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Escキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
})();

/* ------------------------------------------------------------
   2. タブ切り替え（キーボードの左右キーでも移動できます）
------------------------------------------------------------ */
document.querySelectorAll('[data-tabs]').forEach((root) => {
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  function select(index, focus) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        select(next, true);
      }
    });
  });
});

/* ------------------------------------------------------------
   3. ブログのカテゴリー絞り込み
------------------------------------------------------------ */
(function () {
  const buttons = document.querySelectorAll('.category-btn');
  if (!buttons.length) return;
  const items = document.querySelectorAll('.blog-list-item');
  const empty = document.querySelector('.no-posts-message');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-category');

      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      let visible = 0;
      items.forEach((item) => {
        const cats = (item.getAttribute('data-categories') || '').split(',');
        const show = selected === 'all' || cats.includes(selected);
        item.hidden = !show;
        if (show) visible++;
      });

      if (empty) empty.hidden = visible !== 0;
    });
  });
})();

/* ------------------------------------------------------------
   4. お問い合わせフォーム
   送信先は _config.yml の contact_endpoint（Google Apps Script のURL）です。
   届いた内容は Gmail に通知され、スプレッドシートにも記録されます。
------------------------------------------------------------ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const endpoint = (form.dataset.endpoint || '').trim();
  const fallback = (form.dataset.fallback || '').trim();
  const status = form.querySelector('.contact-form__status');
  const submit = form.querySelector('.contact-form__submit');

  const messages = {
    name: 'お名前を入力してください。',
    email: 'メールアドレスを入力してください。',
    emailFormat: 'メールアドレスの形式をご確認ください（例：name@example.com）。',
    topic: 'ご相談の種類を選んでください。',
    message: 'ご相談内容を入力してください。'
  };

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
    form.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function showError(field, text) {
    const wrap = field.closest('.field');
    wrap.classList.add('has-error');
    const p = document.createElement('p');
    p.className = 'field-error';
    p.id = (field.id || field.name) + '-error';
    p.textContent = text;
    wrap.appendChild(p);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', p.id);
  }

  function validate() {
    clearErrors();
    const errors = [];
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;
    const topicChecked = form.querySelector('input[name="topic"]:checked');

    if (!name.value.trim()) errors.push([name, messages.name]);
    if (!email.value.trim()) errors.push([email, messages.email]);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errors.push([email, messages.emailFormat]);
    if (!topicChecked) errors.push([form.querySelector('input[name="topic"]'), messages.topic]);
    if (!message.value.trim()) errors.push([message, messages.message]);

    errors.forEach(([field, text]) => showError(field, text));
    if (errors.length) errors[0][0].focus();
    return errors.length === 0;
  }

  function setStatus(html, isError) {
    status.innerHTML = html;
    status.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 送信先がまだ設定されていないあいだは、旧フォームを案内する
    if (!endpoint) {
      setStatus(
        'ただいまフォームの準備中です。お手数ですが、' +
        (fallback ? '<a href="' + fallback + '" target="_blank" rel="noopener">こちらのフォーム</a>' : '別の方法') +
        'からお送りください。',
        true
      );
      return;
    }

    const data = new URLSearchParams(new FormData(form));
    data.append('page', location.href);

    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = '送信しています…';
    setStatus('', false);

    try {
      const res = await fetch(endpoint, { method: 'POST', body: data });
      let result = null;
      try { result = await res.json(); } catch (_) { /* 応答が読めない場合は下で判定 */ }
      if (!res.ok || (result && result.ok === false)) throw new Error((result && result.error) || 'send failed');

      const name = form.elements.name.value.trim();
      const done = document.createElement('div');
      done.className = 'contact-done';
      done.setAttribute('tabindex', '-1');
      done.innerHTML =
        '<h3>送信しました。ありがとうございます。</h3>' +
        '<p></p>' +
        '<p>内容を拝見して、河野からメールでご連絡します。数日たっても返信がない場合は、お手数ですがもう一度お送りいただくか、迷惑メールフォルダをご確認ください。</p>';
      done.querySelector('p').textContent = name + ' 様、お問い合わせを受け付けました。';
      form.replaceChildren(done);
      done.focus();
    } catch (err) {
      submit.disabled = false;
      submit.textContent = label;
      setStatus(
        '送信できませんでした。通信状況をご確認のうえ、もう一度お試しください。' +
        (fallback ? 'うまくいかない場合は<a href="' + fallback + '" target="_blank" rel="noopener">こちらのフォーム</a>からもお送りいただけます。' : ''),
        true
      );
    }
  });
})();
