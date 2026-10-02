---
'@roadiehq/rag-ai-backend-embeddings-aws': patch
---

Replace `@langchain/aws`'s `BedrockEmbeddings` with a built-in `BedrockTitanEmbeddings` implementation that calls Bedrock directly through `@aws-sdk/client-bedrock-runtime`, matching the existing `BedrockCohereEmbeddings`. Behaviour is unchanged for Titan models, and the `@langchain/aws` dependency has been removed.
