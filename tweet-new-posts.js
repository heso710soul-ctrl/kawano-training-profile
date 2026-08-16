// .github/scripts/tweet-new-posts.js
// _posts/ に新しく追加されたMarkdownファイルを検知し、Xに投稿する

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

const SITE_URL = 'https://heso710soul-ctrl.github.io/kawano-training-profile';

function getAddedPostFiles() {
  // 直前のコミットとの差分から、_posts/ 配下で新規追加(A)されたファイルのみ抽出
  const output = execSync('git diff --name-status HEAD^ HEAD -- _posts', {
    encoding: 'utf-8',
  }).trim();

  if (!output) return [];

  return output
    .split('\n')
    .map((line) => line.split('\t'))
    .filter(([status]) => status === 'A')
    .map(([, filePath]) => filePath)
    .filter((filePath) => filePath.endsWith('.md'));
}

function extractTitle(content) {
  const match = content.match(/^title:\s*"(.+)"\s*$/m) || content.match(/^title:\s*(.+)\s*$/m);
  return match ? match[1].trim() : null;
}

function buildPostUrl(filePath) {
  // 例: _posts/2026-08-09-コミュニケーション.md → 2026-08-09-コミュニケーション
  const slug = path.basename(filePath, '.md');
  return `${SITE_URL}/blog/${slug}/`;
}

async function main() {
  const addedFiles = getAddedPostFiles();

  if (addedFiles.length === 0) {
    console.log('新規追加されたブログ記事はありませんでした。');
    return;
  }

  const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_KEY_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
  const rwClient = client.readWrite;

  for (const filePath of addedFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = extractTitle(content);
      const url = buildPostUrl(filePath);

      if (!title) {
        console.warn(`タイトルが取得できませんでした: ${filePath}`);
        continue;
      }

      const tweetText = `${title}\n\n${url}`;
      await rwClient.v2.tweet(tweetText);
      console.log(`投稿しました: ${tweetText}`);
    } catch (err) {
      console.error(`投稿に失敗しました (${filePath}):`, err);
    }
  }
}

main();
