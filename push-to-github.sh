#!/usr/bin/env bash
# push-to-github.sh
# Pushes all Telco X output files to github.com/janesurjanto/telco-x-starter
#
# Usage:
#   chmod +x push-to-github.sh
#   GH_TOKEN=your_token_here ./push-to-github.sh
#
# Get a token at: https://github.com/settings/tokens/new
#   Required scope: repo (Full control of private repositories)

set -e

REPO="janesurjanto/telco-x-starter"
BRANCH="main"
MSG="chore: attach all output files — docs, design, JS, CSS, tests"
API="https://api.github.com/repos/${REPO}/contents"

TOKEN="${GH_TOKEN:?Please set GH_TOKEN=your_token before running}"

# ── helper: push one file ──────────────────────────────────────────────────
push_file() {
  local local_path="$1"   # path on disk (relative to this script)
  local repo_path="$2"    # destination path in the repo

  echo -n "  Pushing $repo_path ... "

  # Base64-encode the file
  local content
  content=$(base64 -w 0 "$local_path" 2>/dev/null || base64 "$local_path")

  # Check whether the file already exists (need its SHA to update)
  local sha
  sha=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
    "${API}/${repo_path}" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null || true)

  local body
  if [ -n "$sha" ]; then
    body=$(python3 -c "import json; print(json.dumps({'message':'${MSG}','content':'${content}','sha':'${sha}','branch':'${BRANCH}'}))")
  else
    body=$(python3 -c "import json; print(json.dumps({'message':'${MSG}','content':'${content}','branch':'${BRANCH}'}))")
  fi

  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$body" \
    "${API}/${repo_path}")

  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    echo "OK ($status)"
  else
    echo "FAILED ($status)"
    exit 1
  fi
}

echo ""
echo "Pushing 14 files to github.com/${REPO} ..."
echo ""

# ── Source & dest pairs ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

push_file "$SCRIPT_DIR/server.js"                               "server.js"
push_file "$SCRIPT_DIR/public/js/api.js"                       "public/js/api.js"
push_file "$SCRIPT_DIR/public/js/result.js"                    "public/js/result.js"
push_file "$SCRIPT_DIR/public/js/details.js"                   "public/js/details.js"
push_file "$SCRIPT_DIR/public/js/wifi.js"                      "public/js/wifi.js"
push_file "$SCRIPT_DIR/public/result.html"                     "public/result.html"
push_file "$SCRIPT_DIR/public/details.html"                    "public/details.html"
push_file "$SCRIPT_DIR/public/wifi.html"                       "public/wifi.html"
push_file "$SCRIPT_DIR/public/css/components.css"              "public/css/components.css"
push_file "$SCRIPT_DIR/public/css/wifi.css"                    "public/css/wifi.css"
push_file "$SCRIPT_DIR/tests/server.test.js"                   "tests/server.test.js"
push_file "$SCRIPT_DIR/design/telco-x-ux-prototype.html"       "design/telco-x-ux-prototype.html"
push_file "$SCRIPT_DIR/docs/TELCO_X_Business_Requirements.md"  "docs/TELCO_X_Business_Requirements.md"
push_file "$SCRIPT_DIR/docs/telco-x-technical-documentation.docx" "docs/telco-x-technical-documentation.docx"

echo ""
echo "All 14 files pushed successfully."
echo "View at: https://github.com/${REPO}"
