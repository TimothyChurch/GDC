#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Phase 2 smoke test for the Transfer Engine.
#
# DO NOT run this against production data — it creates and reverses a real
# Transfer document. Use a staging or local-development DB.
#
# Prerequisites:
#   - npm run dev running on port 3001
#   - At least one Batch document in the DB (export its _id as TEST_BATCH)
#   - Two Vessel documents (export source vessel _id as TEST_SRC, dest as TEST_DST)
#   - The source vessel's contents[] should already include the test batch
#     with at least 10 wine gallons. (To bootstrap, you can use the legacy
#     vessel update route with `allowVesselSlotCreate` once.)
#
# Usage:
#   TEST_BATCH=<batchId> TEST_SRC=<srcVesselId> TEST_DST=<dstVesselId> \
#     ./scripts/smoke-test-transfer.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BASE="${BASE:-http://localhost:3001}"
TEST_BATCH="${TEST_BATCH:?TEST_BATCH env var is required}"
TEST_SRC="${TEST_SRC:?TEST_SRC env var is required}"
TEST_DST="${TEST_DST:?TEST_DST env var is required}"

echo "▶ Sending transfer 10 gal @ 16 proof from ${TEST_SRC} → ${TEST_DST}..."
RESPONSE=$(curl -sS -X POST "${BASE}/api/transfer/create" \
  -H "Content-Type: application/json" \
  -d "$(cat <<JSON
{
  "type": "stage_transition",
  "batch": "${TEST_BATCH}",
  "fromStage": "Fermenting",
  "toStage": "Stripping Run",
  "sources": [{ "vessel": "${TEST_SRC}", "volume": 10, "proof": 16 }],
  "destinations": [{ "vessel": "${TEST_DST}", "volume": 10, "proof": 16 }],
  "loss": { "volume": 0, "proof": 0, "reasonCode": "no_loss" },
  "notes": "Phase 2 smoke test — safe to revert"
}
JSON
)")

echo "$RESPONSE" | jq .

TRANSFER_ID=$(echo "$RESPONSE" | jq -r '.transfer._id // empty')
if [[ -z "$TRANSFER_ID" || "$TRANSFER_ID" == "null" ]]; then
  echo "✗ No transfer ID in response. Aborting." >&2
  exit 1
fi
echo "✓ Transfer created: ${TRANSFER_ID}"

echo ""
echo "▶ Verifying source vessel state..."
curl -sS "${BASE}/api/vessel/${TEST_SRC}" | jq '{name, contents, contentsVersion, current}'

echo ""
echo "▶ Verifying dest vessel state..."
curl -sS "${BASE}/api/vessel/${TEST_DST}" | jq '{name, contents, contentsVersion, current}'

echo ""
echo "▶ Verifying batch cache..."
curl -sS "${BASE}/api/batch/${TEST_BATCH}" | jq '{currentStage, ttbAccount, stageVolumes, stageProofs, cacheVersion}'

echo ""
echo "▶ Reversing transfer ${TRANSFER_ID}..."
curl -sS -X POST "${BASE}/api/transfer/${TRANSFER_ID}/reverse" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Phase 2 smoke-test reverse"}' \
  | jq '{transfer: .transfer._id, reversesOriginal: .transfer.reverses}'

echo ""
echo "▶ Verifying source vessel restored..."
curl -sS "${BASE}/api/vessel/${TEST_SRC}" | jq '{name, contents, contentsVersion}'

echo ""
echo "▶ Listing recent transfers for batch..."
curl -sS "${BASE}/api/transfer?batch=${TEST_BATCH}&limit=5" \
  | jq '.[] | {_id, type, status, totalSourceVolume, totalDestVolume, totalLossVolume}'

echo ""
echo "▶ Verifying 409 guard: attempt direct vessel.contents mutation..."
GUARD=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "${BASE}/api/vessel/${TEST_SRC}" \
  -H "Content-Type: application/json" \
  -d '{"contents":[]}')
if [[ "$GUARD" == "409" ]]; then
  echo "✓ Guard returned 409 as expected"
else
  echo "✗ Expected 409 from vessel PUT with contents, got ${GUARD}" >&2
  exit 1
fi

echo ""
echo "✓ Smoke test complete."
