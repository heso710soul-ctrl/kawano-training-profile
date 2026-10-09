# 河野智也 訓練プロフィールサイト

組織づくり・人材育成メンター 河野智也の公式プロフィールサイトです。
研修メニューの紹介、実績、プロフィール、ブログなどを掲載しています。

🔗 公開URL: https://heso710soul-ctrl.github.io/kawano-training-profile/

## 使用技術

- [Jekyll](https://jekyllrb.com/)（静的サイトジェネレーター）
- [GitHub Pages](https://pages.github.com/)（ホスティング、`main`ブランチのルートから公開）
- プラグイン: `jekyll-sitemap`（sitemap.xmlの自動生成）

## ディレクトリ構成

```
.
├── _config.yml          # サイト全体の設定（タイトル、URL、パーマリンク等）
├── _includes/
│   ├── head-common.html # 全ページ共通の<head>（フォント・GA・CSS）
│   ├── site-header.html # 全ページ共通のヘッダー・メニュー
│   └── site-footer.html # 全ページ共通のフッター
├── _layouts/
│   ├── default.html     # ブログ一覧・記事ページの共通レイアウト
│   └── post.html        # ブログ記事用レイアウト（著者紹介・前後の記事つき）
├── _posts/               # ブログ記事（Markdown）
│   └── YYYY-MM-DD-タイトル.md
├── 画像/ もしくは image/  # 画像ファイル（プロフィール写真・ブログ用画像など）
├── index.html            # トップページ
├── blog.html              # ブログ一覧ページ
├── style.css              # 全体のスタイル
├── script.js               # スマホメニュー・タブ切り替え・カテゴリー絞り込み・お問い合わせ送信
├── contact-form-gas/       # お問い合わせの受け取りスクリプト（サイトには公開されない）
├── robots.txt
└── .github/workflows/
    └── rebuild.yml         # 毎日0時(JST)に自動で再ビルド・再デプロイするワークフロー
```

## ブログ記事の書き方

`_posts/` フォルダに、以下の形式でMarkdownファイルを追加します。

```
YYYY-MM-DD-記事タイトル.md
```

ファイル冒頭には以下のフロントマターを記載します。

```yaml
---
layout: post
title: "記事のタイトル"
date: YYYY-MM-DD
categories: [カテゴリー名]
---
```

画像を挿入する場合は以下のように記述します。

```markdown
![代替テキスト](/kawano-training-profile/image/blog/ファイル名.jpg)
```

## 自動再ビルドについて

`.github/workflows/rebuild.yml` により、毎日 JST 0:00 に自動で空コミット→pushを行い、GitHub Pagesの再ビルドをトリガーしています。手動で今すぐ再ビルドしたい場合は、GitHubの「Actions」タブから該当ワークフローを選び、「Run workflow」から手動実行できます。

## サイトマップ

`jekyll-sitemap` プラグインにより、ビルド時に `sitemap.xml` が自動生成されます。手動で編集する必要はありません。Google Search Consoleには以下のURLを送信してください。

```
https://heso710soul-ctrl.github.io/kawano-training-profile/sitemap.xml
```

## デザインについて（2026年10月リニューアル）

- 色はプロフィール写真（定禅寺通りのケヤキ並木・ネイビーのベスト）から取っています。`style.css` 冒頭の `:root` で一括変更できます
- 見出し：しっぽり明朝 B1／本文：Zen角ゴシック New（Google Fonts）
- トップページの「ブログ」欄には、最新の記事3件が自動で表示されます
- リニューアル前の状態は `backup-before-redesign-20261009` ブランチと、Googleドライブの「河野智也サイト(kawano-training-profile) 旧サイト バックアップ (2026-10-09)」フォルダに保管しています

## お問い合わせフォーム

トップページ下部のフォームから送られた内容は、Google Apps Script を通じて

- Gmail（heso.710.soul@gmail.com）に通知
- Googleスプレッドシート「河野智也サイト お問い合わせ記録」に記録

されます。送信先のURLは `_config.yml` の `contact_endpoint` に設定します。設定手順は [`contact-form-gas/README.md`](contact-form-gas/README.md) を参照してください。

`contact_endpoint` が空のあいだは、送信時に旧Googleフォーム（`contact_fallback_url`）を案内します。
