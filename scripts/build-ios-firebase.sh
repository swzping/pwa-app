#!/usr/bin/env bash
set -e

# Build a signed iOS IPA for Firebase App Distribution.
# Usage: ./scripts/build-ios-firebase.sh {staging|prod}
#
# Set IOS_CLEAN=1 for deep clean, IOS_CLEAN=2 for profile+DerivedData only.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:-}"
BUILD_START_SECONDS=$SECONDS

format_duration() {
  local total_seconds="$1"
  local minutes=$((total_seconds / 60))
  local seconds=$((total_seconds % 60))
  if (( minutes > 0 )); then
    printf '%dm %02ds' "$minutes" "$seconds"
  else
    printf '%ds' "$seconds"
  fi
}

case "$ENVIRONMENT" in
  staging)
    SCHEME="Staging"
    ENV_FILE=".env.stg"
    FIREBASE_CONFIG="ios/Firebase/Staging/GoogleService-Info.plist"
    ;;
  prod)
    SCHEME="ProductionRelease"
    ENV_FILE=".env.prd"
    FIREBASE_CONFIG="ios/Firebase/Production/GoogleService-Info.plist"
    ;;
  *)
    echo "Usage: $0 {staging|prod}" >&2
    exit 2
    ;;
esac

WORKSPACE="$ROOT_DIR/ios/GuardianID.xcworkspace"
APP_PLIST="$ROOT_DIR/ios/GuardianID/GoogleService-Info.plist"
ARCHIVE_DIR="$ROOT_DIR/ios/build/$ENVIRONMENT"
ARCHIVE_PATH="$ARCHIVE_DIR/GuardianID.xcarchive"
EXPORT_PATH="$ARCHIVE_DIR/export"
EXPORT_OPTIONS="$ARCHIVE_DIR/ExportOptions.plist"
IPA_PATH="$EXPORT_PATH/GuardianID.ipa"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Required command not found: $1" >&2
    exit 1
  }
}

require_command xcodebuild
require_command pod
require_command ruby

if [[ ! -d "$WORKSPACE" ]]; then
  echo "❌ Xcode workspace not found: $WORKSPACE" >&2
  exit 1
fi
if [[ ! -f "$ROOT_DIR/$ENV_FILE" ]]; then
  echo "❌ Environment file not found: $ENV_FILE" >&2
  exit 1
fi
if [[ ! -f "$ROOT_DIR/$FIREBASE_CONFIG" ]]; then
  echo "❌ Firebase config not found: $FIREBASE_CONFIG" >&2
  exit 1
fi

# ── Clean (runs BEFORE pod install) ──
case "${IOS_CLEAN:-0}" in
  1)
    echo "🧹 IOS_CLEAN=1: DEEP clean (profile + DerivedData + pods)..."
    rm -rf "$ROOT_DIR/ios/build/DerivedData"
    rm -rf ~/Library/Developer/Xcode/DerivedData/GuardianID-*
    rm -rf ~/Library/MobileDevice/Provisioning\ Profiles/*
    echo "✅ Deep clean complete, will pod install after."
    ;;
  2)
    echo "🧹 IOS_CLEAN=2: profile + DerivedData only..."
    rm -rf "$ROOT_DIR/ios/build/DerivedData"
    rm -rf ~/Library/Developer/Xcode/DerivedData/GuardianID-*
    rm -rf ~/Library/MobileDevice/Provisioning\ Profiles/*
    echo "✅ Profile + cache clean complete."
    ;;
  *)
    # Default no clean
    ;;
esac

# ── Proxy ──
configure_proxy() {
  local proxy_url="${HTTPS_PROXY:-${https_proxy:-${HTTP_PROXY:-${http_proxy:-}}}}"
  if [[ -n "$proxy_url" ]]; then
    export HTTP_PROXY="${HTTP_PROXY:-$proxy_url}"
    export HTTPS_PROXY="${HTTPS_PROXY:-$proxy_url}"
    export http_proxy="${http_proxy:-$HTTP_PROXY}"
    export https_proxy="${https_proxy:-$HTTPS_PROXY}"
    echo "🌐 Using configured proxy: $HTTPS_PROXY"
    return
  fi

  if [[ -t 0 ]]; then
    read -r -p "🌐 No proxy detected. Enter Clash/VPN proxy port (default 7897, Enter to skip): " proxy_port
    if [[ -n "$proxy_port" ]]; then
      proxy_url="http://127.0.0.1:${proxy_port}"
      export HTTP_PROXY="$proxy_url"
      export HTTPS_PROXY="$proxy_url"
      export http_proxy="$proxy_url"
      export https_proxy="$proxy_url"
      echo "🌐 Using proxy: $HTTPS_PROXY"
    else
      echo "🌐 No proxy configured; using the current VPN/system network."
    fi
  else
    echo "🌐 No proxy configured; using the current VPN/system network."
  fi
}

configure_proxy

# ── Pod install (single place, after clean) ──
echo "📦 Running pod install..."
(cd "$ROOT_DIR/ios" && pod install)

# ── Build number: UTC timestamp (no pbxproj modification) ──
NEXT_BUILD=$(date -u +%Y%m%d%H%M)
echo "🔢 iOS Build (UTC): $NEXT_BUILD"

# ── Clean export dir ──
mkdir -p "$ARCHIVE_DIR"
rm -rf "$EXPORT_PATH"
rm -f "$EXPORT_OPTIONS"

# Backup env files for restore on exit
ENV_BACKUP="$(mktemp)"
PLIST_BACKUP="$(mktemp)"
cp "$ROOT_DIR/.env" "$ENV_BACKUP"
cp "$APP_PLIST" "$PLIST_BACKUP"
restore_build_inputs() {
  cp "$ENV_BACKUP" "$ROOT_DIR/.env"
  cp "$PLIST_BACKUP" "$APP_PLIST"
  rm -f "$ENV_BACKUP" "$PLIST_BACKUP"
}
trap restore_build_inputs EXIT

cp "$ROOT_DIR/$ENV_FILE" "$ROOT_DIR/.env"
cp "$ROOT_DIR/$FIREBASE_CONFIG" "$APP_PLIST"

# ExportOptions.plist — no DTD declaration
EXPORT_METHOD="${IOS_EXPORT_METHOD:-development}"
TEAM_ID="${DEVELOPMENT_TEAM:-7TU5U5M9U6}"
cat > "$EXPORT_OPTIONS" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${EXPORT_METHOD}</string>
  <key>destination</key>
  <string>export</string>
  <key>teamID</key>
  <string>${TEAM_ID}</string>
  <key>signingStyle</key>
  <string>${IOS_SIGNING_STYLE:-automatic}</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>compileBitcode</key>
  <false/>
</dict>
</plist>
PLIST

echo "🏗️  [1/2] Archiving iOS ($ENVIRONMENT, scheme=$SCHEME, build=$NEXT_BUILD)..."

XCODE_SIGN_ARGS=(
  "CODE_SIGN_STYLE=${IOS_SIGNING_STYLE:-Automatic}"
  "CODE_SIGN_IDENTITY=${IOS_CODE_SIGN_IDENTITY:-Apple Development}"
  "DEVELOPMENT_TEAM=$TEAM_ID"
  "CURRENT_PROJECT_VERSION=$NEXT_BUILD"
  "WARNING_CFLAGS=-Wno-nullability-completeness -Wno-error=incomplete-implementation"
  "CLANG_WARN_NULLABILITY_COMPLETENESS=NO"
)
[[ -n "${PROVISIONING_PROFILE_SPECIFIER:-}" ]] && XCODE_SIGN_ARGS+=("PROVISIONING_PROFILE_SPECIFIER=$PROVISIONING_PROFILE_SPECIFIER")

run_xcodebuild() {
  local phase="$1"
  shift
  local log_file status_file pipeline_pid status spinner_index=0
  log_file="$(mktemp)"
  status_file="$(mktemp)"

  set +e
  (
    xcodebuild -quiet "$@" 2>&1 | tee "$log_file" | awk '
      {
        line=$0; sub(/^[[:space:]]*/, "", line)
        if (line ~ /^(error:|fatal error:)/) {
          print "\n❌ " line; fflush()
        }
      }
    '
    printf '%s\n' "${PIPESTATUS[0]}" > "$status_file"
  ) &
  pipeline_pid=$!

  local spinner_frames=('|' '/' '-' '\')
  while kill -0 "$pipeline_pid" 2>/dev/null; do
    printf '\r⏳ %s... %s' "$phase" "${spinner_frames[spinner_index]}"
    spinner_index=$(( (spinner_index + 1) % 4 ))
    sleep 0.2
  done
  wait "$pipeline_pid" || true
  status="$(cat "$status_file" 2>/dev/null || echo 1)"
  rm -f "$status_file"
  printf '\r\033[K\n'
  if [[ "$status" -ne 0 ]]; then
    echo "❌ xcodebuild $phase failed. Full log: $log_file" >&2
    tail -80 "$log_file" >&2
    return "$status"
  fi
  echo "✅ $phase completed."
  rm -f "$log_file"
}

run_xcodebuild "archive" archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -derivedDataPath "$ROOT_DIR/ios/build/DerivedData" \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  -showBuildTimingSummary \
  "${XCODE_SIGN_ARGS[@]}"

echo "📦 [2/2] Exporting IPA ($EXPORT_METHOD)..."
run_xcodebuild "export" -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates

if [[ ! -f "$IPA_PATH" ]]; then
  FOUND_IPA="$(find "$EXPORT_PATH" -maxdepth 1 -type f -name '*.ipa' -print -quit)"
  if [[ -z "$FOUND_IPA" ]]; then
    echo "❌ xcodebuild export completed but no IPA was found in $EXPORT_PATH" >&2
    exit 1
  fi
  mv "$FOUND_IPA" "$IPA_PATH"
fi

# ── Verify whether the build number within the IPA has been successfully written ──
IPA_INFO=$(unzip -p "$IPA_PATH" "Payload/GuardianID.app/Info.plist" 2>/dev/null | plutil -convert xml1 -o - - 2>/dev/null || echo "")
if echo "$IPA_INFO" | grep -q "$NEXT_BUILD"; then
  echo "✅ IPA Build verified: $NEXT_BUILD"
else
  echo "⚠️  Warning: Build number may not have been written into IPA. Check Info.plist."
fi

echo "✅ IPA ready: $IPA_PATH (build $NEXT_BUILD)"
BUILD_ELAPSED_SECONDS=$((SECONDS - BUILD_START_SECONDS))
echo "⏱️  iOS build completed in $(format_duration "$BUILD_ELAPSED_SECONDS") (${BUILD_ELAPSED_SECONDS}s)"