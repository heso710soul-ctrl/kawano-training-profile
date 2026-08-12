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
├── _layouts/
│   ├── default.html     # 共通レイアウト（ヘッダー・ナビ・フッター）
│   └── post.html        # ブログ記事用レイアウト
├── _posts/               # ブログ記事（Markdown）
│   └── YYYY-MM-DD-タイトル.md
├── 画像/ もしくは image/  # 画像ファイル（プロフィール写真・ブログ用画像など）
├── index.html            # トップページ
├── blog.html              # ブログ一覧ページ
├── style.css              # 全体のスタイル
├── script.js               # アコーディオン開閉・ブログのカテゴリーフィルター等
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

## お問い合わせフォーム

トップページの「お問い合わせ」セクションからGoogleフォームにリンクしています。フォームのURLを変更する場合は `index.html` 内の該当箇所を編集してください。
