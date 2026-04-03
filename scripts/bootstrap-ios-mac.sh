#!/usr/bin/env bash
# HÄRMÄ72: After Homebrew is installed locally, run this from repo root:
#   bash scripts/bootstrap-ios-mac.sh
# Prerequisite: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Then add shellenv (Apple Silicon vs Intel) as the installer prints.

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for BREW in /opt/homebrew/bin/brew /usr/local/bin/brew; do
  if [[ -x "$BREW" ]]; then
    eval "$("$BREW" shellenv)"
    break
  fi
done

if ! command -v brew &>/dev/null; then
  echo "Homebrew not found. Install it first, then add to PATH, e.g.:"
  echo "  echo 'eval \"\$(/opt/homebrew/bin/brew shellenv)\"' >> ~/.zprofile"
  echo "  eval \"\$(/opt/homebrew/bin/brew shellenv)\""
  exit 1
fi

brew -v
brew install cocoapods
pod --version

if [[ ! -d ios ]]; then
  npx cap add ios
fi

export CAPACITOR_SERVER_URL="${CAPACITOR_SERVER_URL:-https://ai-coach-m68h.vercel.app}"
npm run cap:sync
npx cap open ios

echo "Done. ios/ should exist and Xcode should open."
