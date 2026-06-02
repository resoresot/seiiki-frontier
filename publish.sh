#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "変更状況:"
git status --short

if [ -z "$(git status --short)" ]; then
  echo "変更なし。終了します。"
  exit 0
fi

git add .
git commit -m "${1:-Update game}"
git push

echo "公開しました。GitHub Pagesの反映まで少し待ってください。"
