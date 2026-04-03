#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_PATH="${WORKSPACE_PATH:-ios/AwesomeProject.xcworkspace}"
SCHEME="${SCHEME:-AwesomeProject}"
CONFIGURATION="${CONFIGURATION:-Release}"

# One of: development | ad-hoc | app-store | enterprise
EXPORT_METHOD="${1:-development}"

# Optional (recommended): your Apple Developer Team ID (10 chars)
TEAM_ID="${TEAM_ID:-}"

if [[ ! -d "${WORKSPACE_PATH}" ]]; then
  echo "Workspace not found: ${WORKSPACE_PATH}" >&2
  echo "Tip: run from repo root, or set WORKSPACE_PATH." >&2
  exit 1
fi

ARCHIVE_PATH="${ARCHIVE_PATH:-ios/build/${SCHEME}.xcarchive}"
EXPORT_DIR="${EXPORT_DIR:-ios/build/${SCHEME}-ipa}"

case "${EXPORT_METHOD}" in
  development|ad-hoc|app-store|enterprise) ;;
  *)
    echo "Invalid export method: ${EXPORT_METHOD}" >&2
    echo "Usage: $0 {development|ad-hoc|app-store|enterprise}" >&2
    exit 1
    ;;
esac

EXPORT_OPTIONS_PLIST="$(mktemp -t exportOptions.XXXXXX.plist)"
trap 'rm -f "${EXPORT_OPTIONS_PLIST}"' EXIT

cat >"${EXPORT_OPTIONS_PLIST}" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${EXPORT_METHOD}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>compileBitcode</key>
  <false/>
  <key>stripSwiftSymbols</key>
  <true/>
</dict>
</plist>
PLIST

if [[ -n "${TEAM_ID}" ]]; then
  /usr/libexec/PlistBuddy -c "Add :teamID string ${TEAM_ID}" "${EXPORT_OPTIONS_PLIST}" >/dev/null
fi

echo "==> Archiving ${SCHEME} (${CONFIGURATION})"
xcodebuild \
  -workspace "${WORKSPACE_PATH}" \
  -scheme "${SCHEME}" \
  -configuration "${CONFIGURATION}" \
  -sdk iphoneos \
  -archivePath "${ARCHIVE_PATH}" \
  -allowProvisioningUpdates \
  archive

echo "==> Exporting IPA (${EXPORT_METHOD})"
rm -rf "${EXPORT_DIR}"
mkdir -p "${EXPORT_DIR}"

xcodebuild \
  -exportArchive \
  -archivePath "${ARCHIVE_PATH}" \
  -exportPath "${EXPORT_DIR}" \
  -exportOptionsPlist "${EXPORT_OPTIONS_PLIST}"

echo "==> Done"
echo "IPA output:"
ls -la "${EXPORT_DIR}"/*.ipa
