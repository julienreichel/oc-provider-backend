PROVIDER_URL=http://localhost:3001/api

# 1. Create a draft document
doc_payload='{"title":"Sample Draft","content":"Initial content"}'
doc_id=$(curl -s -X POST "$PROVIDER_URL/documents" \
  -H 'Content-Type: application/json' \
  -d "$doc_payload" | jq -r '.id')
echo "Created document: $doc_id"

# 2. Finalize/update the document
curl -s -X PUT "$PROVIDER_URL/documents/$doc_id" \
  -H 'Content-Type: application/json' \
  -d '{"status":"final","content":"Finalized content"}' | jq .

# 3. Verify document state
curl -s "$PROVIDER_URL/documents/$doc_id" | jq .

# 4. Send the document to the client backend (CLIENT_BASE_URL must be configured)
curl -s -X POST "$PROVIDER_URL/send" \
  -H 'Content-Type: application/json' \
  -d "{\"documentId\":\"$doc_id\"}" | jq .
