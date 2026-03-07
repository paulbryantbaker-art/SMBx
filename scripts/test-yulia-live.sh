#!/bin/bash
#
# Session 0 — Live Yulia Test
# Tests Yulia's knowledge injection with 3 real conversation scenarios.
#
# Usage: APP_URL=https://your-app.railway.app ./scripts/test-yulia-live.sh
#        ./scripts/test-yulia-live.sh  (defaults to localhost:5000)
#

set -euo pipefail

BASE_URL="${APP_URL:-http://localhost:5000}"
API="${BASE_URL}/api"
PASS=0
FAIL=0

echo "=============================================="
echo "  SESSION 0 — LIVE YULIA KNOWLEDGE TEST"
echo "  Target: ${BASE_URL}"
echo "=============================================="
echo ""

# Helper: send anonymous message and capture response
send_message() {
  local message="$1"
  local journey_context="${2:-sell}"

  # Create a new conversation via the anonymous endpoint
  local response
  response=$(curl -s -X POST "${API}/message" \
    -H "Content-Type: application/json" \
    -d "{
      \"message\": \"${message}\",
      \"journeyContext\": \"${journey_context}\"
    }" \
    --max-time 60 \
    2>/dev/null || echo "CURL_ERROR")

  echo "$response"
}

# Helper: check if response contains keyword (case-insensitive)
check_keyword() {
  local response="$1"
  local keyword="$2"
  echo "$response" | grep -qi "$keyword"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: HVAC Valuation Question"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Prompt: I own an HVAC company in Texas doing \$2.8M revenue with"
echo "clean books and recurring maintenance contracts. What is my"
echo "business worth?"
echo ""

RESP1=$(send_message "I own an HVAC company in Texas doing \$2.8M revenue with clean books and recurring maintenance contracts. What is my business worth?" "sell")

echo "Response (first 500 chars):"
echo "$RESP1" | head -c 500
echo ""
echo ""

# Check for specificity markers
T1_PASS=true
for kw in "multiple" "SDE\|EBITDA\|sde\|ebitda" "recurring\|maintenance\|contract"; do
  if echo "$RESP1" | grep -qiE "$kw"; then
    echo "  ✓ Found: $kw"
  else
    echo "  ✗ Missing: $kw"
    T1_PASS=false
  fi
done

if [ "$T1_PASS" = true ]; then
  echo "  → TEST 1: PASSED"
  ((PASS++))
else
  echo "  → TEST 1: FAILED (response may be too generic)"
  ((FAIL++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Thesis Intelligence Question"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Prompt: I have \$600K to invest, I come from a corporate operations"
echo "background, and I want to buy a business. What should I look at?"
echo ""

RESP2=$(send_message "I have \$600K to invest, I come from a corporate operations background, and I want to buy a business. What should I look at?" "buy")

echo "Response (first 500 chars):"
echo "$RESP2" | head -c 500
echo ""
echo ""

T2_PASS=true
for kw in "SBA\|sba\|financing" "industry\|industries\|sector"; do
  if echo "$RESP2" | grep -qiE "$kw"; then
    echo "  ✓ Found: $kw"
  else
    echo "  ✗ Missing: $kw"
    T2_PASS=false
  fi
done

if [ "$T2_PASS" = true ]; then
  echo "  → TEST 2: PASSED"
  ((PASS++))
else
  echo "  → TEST 2: FAILED (response may be too generic)"
  ((FAIL++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Negotiation Intelligence Question"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Prompt: I received an IOI for \$1.1M on my \$1.35M asking price"
echo "HVAC business. The buyer has SBA pre-approval. What should I do?"
echo ""

RESP3=$(send_message "I received an IOI for \$1.1M on my \$1.35M asking price HVAC business. The buyer has SBA pre-approval. What should I do?" "sell")

echo "Response (first 500 chars):"
echo "$RESP3" | head -c 500
echo ""
echo ""

T3_PASS=true
for kw in "counter\|negotiate\|gap" "IOI\|ioi\|offer" "SBA\|sba\|financing"; do
  if echo "$RESP3" | grep -qiE "$kw"; then
    echo "  ✓ Found: $kw"
  else
    echo "  ✗ Missing: $kw"
    T3_PASS=false
  fi
done

if [ "$T3_PASS" = true ]; then
  echo "  → TEST 3: PASSED"
  ((PASS++))
else
  echo "  → TEST 3: FAILED (response may be too generic)"
  ((FAIL++))
fi

echo ""
echo "=============================================="
echo "  RESULTS: ${PASS} passed, ${FAIL} failed"
echo "=============================================="

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "⚠  Some tests failed. Check if knowledge injection is working."
  echo "   The buildSystemPrompt() may not be loading knowledge files."
  exit 1
fi

echo ""
echo "✓ All live tests passed — Yulia has deep M&A knowledge."
