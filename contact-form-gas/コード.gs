/**
 * 河野智也サイト お問い合わせフォーム 受け取り用スクリプト
 * ------------------------------------------------------------
 * サイトのフォームから送られた内容を
 *   1) このスプレッドシートの「お問い合わせ」シートに1行ずつ記録し
 *   2) Gmail に通知メールを送ります（返信ボタンでそのままお客様に返信できます）
 *
 * 設定するのは下の NOTIFY_TO（通知を受け取るアドレス）だけです。
 * 使い方は同じフォルダの README.md を見てください。
 */

const NOTIFY_TO = 'heso.710.soul@gmail.com'; // 通知を受け取るメールアドレス
const SHEET_NAME = 'お問い合わせ';
const SITE_NAME = '河野智也サイト';

// いたずら・連続送信の対策
const SAME_EMAIL_WAIT_SECONDS = 60; // 同じメールアドレスからは60秒あけないと受け付けない
const DAILY_LIMIT = 50;             // 1日に受け付ける最大件数
const MAX_LENGTH = { name: 100, organization: 150, email: 200, tel: 40, topic: 50, message: 5000, page: 300 };

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // ボット対策：人には見えない欄に入力があれば、受け付けたふりをして何もしない
    if (p.website) return json_({ ok: true });

    const data = {
      name: clean_(p.name, MAX_LENGTH.name),
      organization: clean_(p.organization, MAX_LENGTH.organization),
      email: clean_(p.email, MAX_LENGTH.email),
      tel: clean_(p.tel, MAX_LENGTH.tel),
      topic: clean_(p.topic, MAX_LENGTH.topic),
      message: clean_(p.message, MAX_LENGTH.message),
      page: clean_(p.page, MAX_LENGTH.page)
    };

    if (!data.name || !data.email || !data.message || !data.topic) {
      return json_({ ok: false, error: 'required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return json_({ ok: false, error: 'email' });
    }

    // 連続送信の制限
    const cache = CacheService.getScriptCache();
    const emailKey = 'email:' + data.email.toLowerCase();
    if (cache.get(emailKey)) return json_({ ok: false, error: 'too_soon' });

    const dayKey = 'day:' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
    const count = Number(cache.get(dayKey) || 0);
    if (count >= DAILY_LIMIT) return json_({ ok: false, error: 'limit' });

    // 1) スプレッドシートに記録
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet_();
      sheet.appendRow([
        new Date(),
        sheetSafe_(data.name),
        sheetSafe_(data.organization),
        sheetSafe_(data.email),
        sheetSafe_(data.tel),
        sheetSafe_(data.topic),
        sheetSafe_(data.message),
        '未対応'
      ]);
    } finally {
      lock.releaseLock();
    }

    // 2) Gmail に通知
    const subject = '【' + SITE_NAME + '】お問い合わせ：' + data.name + ' 様（' + data.topic + '）';
    const body = [
      'サイトのお問い合わせフォームから連絡がありました。',
      'このメールに「返信」すると、お客様のアドレス宛てに返信できます。',
      '',
      '■ お名前　　　：' + data.name,
      '■ 会社・店舗名：' + (data.organization || '（未記入）'),
      '■ メール　　　：' + data.email,
      '■ 電話番号　　：' + (data.tel || '（未記入）'),
      '■ ご相談の種類：' + data.topic,
      '',
      '■ ご相談内容',
      data.message,
      '',
      '――――――――――――',
      '受付日時：' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'),
      '記録シート：' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    ].join('\n');

    MailApp.sendEmail({
      to: NOTIFY_TO,
      replyTo: data.email,
      name: SITE_NAME + ' お問い合わせフォーム',
      subject: subject,
      body: body
    });

    cache.put(emailKey, '1', SAME_EMAIL_WAIT_SECONDS);
    cache.put(dayKey, String(count + 1), 60 * 60 * 24);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// ブラウザで直接URLを開いたときの表示（動作確認用）
function doGet() {
  return json_({ ok: true, message: 'お問い合わせフォームの受付は動いています。' });
}

/**
 * 設定の確認用：エディタ上部で「testNotify」を選んで「実行」すると、
 * テストの記録とテストメールが届きます（初回はここで許可を求められます）。
 */
function testNotify() {
  const res = doPost({ parameter: {
    name: 'テスト送信',
    organization: '',
    email: NOTIFY_TO,
    tel: '',
    topic: 'その他',
    message: 'これはスクリプトからのテスト送信です。この行は削除して大丈夫です。',
    page: 'テスト'
  }});
  console.log(res.getContent());
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  // 見出し行（A1が「受付日時」）がすでにある1枚目のシートは、名前を整えてそのまま使う
  if (!sheet) {
    const first = ss.getSheets()[0];
    if (first && first.getRange('A1').getValue() === '受付日時') {
      sheet = first.setName(SHEET_NAME);
      sheet.setFrozenRows(1);
    }
  }
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['受付日時', 'お名前', '会社・店舗名', 'メールアドレス', '電話番号', 'ご相談の種類', 'ご相談内容', '対応状況']);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy/mm/dd hh:mm');
    sheet.setColumnWidth(7, 420);
  }
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/\r\n?/g, '\n').trim().slice(0, max);
}

// スプレッドシートで数式として動かないように、先頭の = + - @ を文字として扱う
function sheetSafe_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
