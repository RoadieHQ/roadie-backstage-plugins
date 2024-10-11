---
'@roadiehq/rag-ai-backend-embeddings-aws': patch
'@roadiehq/rag-ai': patch
---

Add max retries to embeddings to prevent forever loop in case of errors.
