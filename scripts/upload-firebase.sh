#!/usr/bin/env bash
set -e

# ───────────────────────────────────────────────
#  RN → Firebase App Distribution (v11 + SA)
#  Usage: ./distribute.sh {prod|staging}
#  Precondition:
#    need firebase sa key, then configure:
#      mkdir -p "$HOME/.firebase-keys"
#      If the file is in the ~/Downloads: mv "$HOME/Downloads/staging-sa.json" "$HOME/.firebase-keys/staging-sa.json"
#      chmod 600 "$HOME/.firebase-keys/staging-sa.json"
#    use nvm change node 20.x better
#    npm i firebase-tools@11.30.0 -g
#    open VPN network
# ───────────────────────────────────────────────

# ── 0. Env ──
ENV=$1
if [ -z "$ENV" ]; then
  echo "❌ Usage: $0 {prod|staging}"
  exit 1
fi

if [ "$ENV" == "prod" ]; then
  APP_ID="1:892404998062:android:793e606d5f112a665fb23f"
  TEST_GROUP="proder"
  FLAVOR="production"
  SA_KEY="$HOME/.firebase-keys/prod-sa.json"
elif [ "$ENV" == "staging" ]; then
  APP_ID="1:559336040593:android:b46f0209183279d169b730"
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
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
TIME=$(date -u +%Y%m%d_%H%M)
VC=$(grep -E 'versionCode\s+' android/app/build.gradle | grep -oE '[0-9]+' | tail -1 || echo "?")

APK=$(ls android/app/build/outputs/apk/${FLAVOR}/release/*.apk 2>/dev/null | head -1)
if [ ! -f "$APK" ]; then
  echo "❌ APK not found: android/app/build/outputs/apk/${FLAVOR}/release/*.apk"
  echo "   Build it first: cd android && ./gradlew assemble${FLAVOR^}Release"
  exit 1
fi
SIZE=$(du -h "$APK" | cut -f1)

GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

TMPFILE=$(mktemp)
git log --oneline -5 --no-decorate 2>/dev/null | sed 's/^[a-f0-9]* /- /' > "$TMPFILE"

echo ""
echo "📝 Edit release notes (vim): :i to insert, Esc → :wq to save and exit"
sleep 1
vim "$TMPFILE"

CHANGELOG=$(grep -v '^#' "$TMPFILE" | grep -v '^$' | sed 's/^/  /')
rm "$TMPFILE"
[ -z "$(echo "$CHANGELOG" | tr -d ' ')" ] && CHANGELOG="  (no notes)"

NOTES="branch: ${BRANCH}
commit: ${COMMIT_HASH}
build: ${TIME} (UTC)
versionCode: ${VC}
flavor: ${ENV}
size: ${SIZE}
builder: ${GIT_USER} <${GIT_EMAIL}>

📋 Update content:
${CHANGELOG}"

echo ""
echo "════ Release Notes ════"
echo "$NOTES"
echo "═══════════════════════"

read -r -p "Upload to Firebase ($ENV)? (y/N) " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 0
fi

# ── 3. Upload ──
echo ""
echo "📤 Uploading $(basename "$APK") (${SIZE}) → group: ${TEST_GROUP}"
echo "   App ID: $APP_ID"
echo "   (this may take a while for large APKs...)"
echo ""

start=$(date +%s)

$FIREBASE_BIN --debug appdistribution:distribute "$APK" \
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