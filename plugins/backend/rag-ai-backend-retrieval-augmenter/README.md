# rag-ai-backend-retrieval-augmenter

This is a base module providing default functionality related to RAG AI indexing embeddings and retrieval of augmentation context. It enables a pluggable AI model initialization in a submodule and provides default, extendable functionality to create, manage, and search embeddings.

It also contains logic to use the default Backstage search to search for additional context that can be added to the query prompts sent to configured LLMs.

This module should be configured to be used by injecting use-case specific embeddings, retrieval, post processing and routing implementations.

The Roadie RAG AI backend expects a retrieval pipeline that is used to retrieve augmentation context when querying information from the LLM. This retrieval pipeline retrieves, processes and sorts information based on queries and other information, providing data that can be used to augment the query sent to the LLM.

This repository provides default retrieval pipeline implementations that can be configured to retrieve as much (or as little ) data as is needed. The pipeline can also be run in a pass-through mode where additional context is not added to the queries and users can interact with the configured LLMs directly.

A bare-bones implementation of the pipeline can be initialized by calling the `DefaultRetrievalPipeline` constructor with an empty configuration object (`{}`).

To start appending important functionality to the RAG pipeline, it is recommended to start implementing and using routers to define correct augmentation information retrievers and to use post processor with enough logic to rerank, sort, and manipulate the retrieved information. The initial starting point, to use a vector store with optional search functionality, is provided by Roadie within this repository. You can get a naive RAG pipeline running this way and start tweaking and configuring the optimal embeddings configuration to provide relevant context for your queries.

```typescript
const retrievalPipeline = createDefaultRetrievalPipeline({
  discovery,
  logger,
  vectorStore: augmentationIndexer.vectorStore,
  tokenManager,
});
```

> You are able to get the vector store implementation from your constructed augmentation indexer. See embeddings submodules or `@roadiehq/rag-ai-backend` README for more information
