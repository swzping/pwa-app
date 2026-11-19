#!/usr/bin/env bash
set -e

# Upload an already-built iOS IPA to Firebase App Distribution.
# Usage: ./scripts/upload-firebase-ios.sh {prod|staging}

# ── 0. Env ──
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENV=$1
if [ -z "$ENV" ]; then
  echo "❌ Usage: $0 {prod|staging}"
  exit 1
fi

if [ "$ENV" == "prod" ]; then
  APP_ID="1:892404998062:ios:a250109ad7f6e6aa5fb23f"
  TEST_GROUP="proder"
  FLAVOR="production"
  SA_KEY="$HOME/.firebase-keys/prod-sa.json"
elif [ "$ENV" == "staging" ]; then
  APP_ID="1:559336040593:ios:3d97159d683b7f6b69b730"
  TEST_GROUP="tester"
  FLAVOR="staging"
  SA_KEY="$HOME/.firebase-keys/staging-sa.json"
else
  echo "❌ Unknown env: $ENV (expected 'prod' or 'staging')"
  exit 1
fi

# ── 1. Preflight ──
echo "🔍 Preflight checks..."

# Node version (informational, Node 20 works with v11)
NODE_VER=$(node -v 2>/dev/null || echo "none")
echo "   Node: $NODE_VER"

# Locate firebase binary (prefer nvm, fallback to global)
FIREBASE_BIN=$(command -v firebase || true)
if [ -z "$FIREBASE_BIN" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  FIREBASE_BIN=$(command -v firebase || true)
fi
if [ -z "$FIREBASE_BIN" ]; then
  echo "❌ firebase-tools not found. Install: npm i -g firebase-tools@11.30.0"
  exit 1
fi
echo "   CLI: $($FIREBASE_BIN --version)"

# SA key file
if [ ! -f "$SA_KEY" ]; then
  echo "❌ SA key not found: $SA_KEY"
  echo "   Download from Firebase Console → Project Settings → Service accounts"
  exit 1
fi
chmod 600 "$SA_KEY" 2>/dev/null || true
echo "   SA:  $(basename "$SA_KEY") ✅"

# ── Proxy (required for Google APIs from CN) ──
if [ -n "$HTTPS_PROXY" ] || [ -n "$https_proxy" ]; then
  echo "   Proxy: already set (HTTPS_PROXY=$HTTPS_PROXY)"
else
  read -r -p "   🔑 No proxy detected. Enter Clash port (default 7897): " PROXY_PORT
  PROXY_PORT=${PROXY_PORT:-7897}
  export HTTP_PROXY="http://127.0.0.1:$PROXY_PORT"
  export HTTPS_PROXY="http://127.0.0.1:$PROXY_PORT"
  export http_proxy="http://127.0.0.1:$PROXY_PORT"
  export https_proxy="http://127.0.0.1:$PROXY_PORT"
  echo "   Proxy: $HTTPS_PROXY"
fi

# Clear browser login cache, force SA auth
$FIREBASE_BIN logout 2>/dev/null || true

export GOOGLE_APPLICATION_CREDENTIALS="$SA_KEY"

# ── 2. Release notes ──
BRANCH="$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo detached)"
COMMIT_HASH="$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || echo unknown)"
TIME="$(date -u +%Y%m%d_%H%M)"

IPA="$ROOT_DIR/ios/build/$ENV/export/GuardianID.ipa"
if [ ! -f "$IPA" ]; then
  echo "❌ IPA not found: $IPA"$'\n   Build it first: yarn build:ios:'"$ENVIRONMENT"
  exit 1
fi

SIZE="$(du -h "$IPA" | cut -f1 | xargs)"
GIT_USER="$(git -C "$ROOT_DIR" config user.name || true)"
GIT_EMAIL="$(git -C "$ROOT_DIR" config user.email || true)"

TMPFILE="$(mktemp)"
git -C "$ROOT_DIR" log --oneline -5 --no-decorate 2>/dev/null \
  | sed 's/^[a-f0-9]* /- /' > "$TMPFILE"

printf '\n📝 Edit release notes (vim): :i to insert, Esc → :wq to save and exit\n'
sleep 1
vim "$TMPFILE"

CHANGELOG="$(grep -v '^#' "$TMPFILE" | grep -v '^$' | sed 's/^/  /')"
rm -f "$TMPFILE"
[[ -n "$(echo "$CHANGELOG" | tr -d ' ')" ]] || CHANGELOG="  (no notes)"

NOTES="branch: ${BRANCH}
commit: ${COMMIT_HASH}
build: ${TIME} (UTC)
environment: ${ENV}
size: ${SIZE}
builder: ${GIT_USER} <${GIT_EMAIL}>

📋 Update content:
${CHANGELOG}"

echo "════ Release Notes ════"
echo "$NOTES"
echo "═══════════════════════"
read -r -p "Upload iOS IPA to Firebase ($ENV)? (y/N) " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 0
fi

# ── 3. Upload ──
echo ""
echo "📤 Uploading $(basename "$IPA") (${SIZE}) → group: ${TEST_GROUP}"
echo "   App ID: $APP_ID"
echo "   (this may take a while for large APKs...)"
echo ""

start=$(date +%s)

$FIREBASE_BIN --debug appdistribution:distribute "$IPA" \
  --app "$APP_ID" \
  --groups "$TEST_GROUP" \
  --release-notes "$NOTES" \
  2>&1 | tee /tmp/fb_distribute.log

rc=${PIPESTATUS[0]}
end=$(date +%s)
cost=$((end - start))

echo ""
if [ $rc -eq 0 ]; then
  echo "✅ Upload complete in ${cost}s. Testers notified."
  echo ""
  echo "🔎 Latest releases:"
  $FIREBASE_BIN appdistribution:releases:list \
    --app "$APP_ID" \
    --limit 3 2>/dev/null || true
else
  echo "❌ Upload failed (exit $rc). Check /tmp/fb_distribute.log"
  echo "   Common: VPN/proxy, SA role, or --app format"
  exit $rc
fi
