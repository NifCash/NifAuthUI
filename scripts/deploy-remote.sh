#!/usr/bin/env bash
# Build + deploy NifAuthUI static site.
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/nifauth-ui/src}"
UI_DIR="${UI_DIR:-/var/www/nifauth-ui}"
BUILD_DIR="${REPO_DIR}/.publish"

echo "==> Repo: $REPO_DIR"
cd "$REPO_DIR"

echo "==> Ensure Node.js 20+"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Build"
npm ci
npm run build

mkdir -p "$UI_DIR" "$BUILD_DIR"
rm -rf "$BUILD_DIR"/*
cp -a dist/. "$BUILD_DIR/"

echo "==> Sync static files"
rsync -a --delete "$BUILD_DIR/" "$UI_DIR/"

nginx -t
systemctl reload nginx || true

curl -s -o /dev/null -w "ui:%{http_code}\n" "http://127.0.0.1:8080/" || true
echo "DEPLOY_UI_DONE"
