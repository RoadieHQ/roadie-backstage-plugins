---
'@roadiehq/rag-ai-backend-retrieval-augmenter': major
'@roadiehq/rag-ai-backend-embeddings-aws': major
'@roadiehq/rag-ai-backend-embeddings-openai': minor
'@roadiehq/rag-ai-backend': patch
---

Remove the dependency on the deprecated `@backstage/backend-common` package.

**BREAKING**: The `tokenManager` option has been removed and `auth` (`AuthService`) is now required. `discovery` is now typed as `DiscoveryService` from `@backstage/backend-plugin-api`. This affects `createDefaultRetrievalPipeline`, `SearchRetriever`, `RoadieEmbeddingsConfig`, `DefaultVectorAugmentationIndexer`, `initializeBedrockEmbeddings` and `initializeOpenAiEmbeddings`. Pass `coreServices.auth` and `coreServices.discovery` from the new backend system:

```diff
 createDefaultRetrievalPipeline({
   discovery,
   logger,
   vectorStore: augmentationIndexer.vectorStore,
-  tokenManager,
+  auth,
 });
```

`@roadiehq/rag-ai-backend` no longer wraps its logger in a Winston adapter or registers its own error handler, as the new backend system's root HTTP router already handles errors.
