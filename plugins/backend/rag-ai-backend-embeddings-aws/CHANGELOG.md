# @roadiehq/rag-ai-backend-embeddings-aws

## 1.0.0

### Major Changes

- d2b38ac: Add additional possibility to use Cohere embeddings for AWS Bedrock embeddings module. Release version 1.x

  Add more information about token usage to the backend controller.

### Patch Changes

- Updated dependencies [d2b38ac]
  - @roadiehq/rag-ai-backend@1.1.0

## 0.2.11

### Patch Changes

- 6847280: added keywords to all plugins
- Updated dependencies [6847280]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.0.4
  - @roadiehq/rag-ai-backend@1.0.4
  - @roadiehq/rag-ai-node@0.1.8

## 0.2.10

### Patch Changes

- 2718d81: Add link to Roadie in README
- Updated dependencies [2718d81]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.0.3
  - @roadiehq/rag-ai-backend@1.0.3
  - @roadiehq/rag-ai-node@0.1.7

## 0.2.9

### Patch Changes

- Updated dependencies [8d209f4]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.0.0

## 0.2.8

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata
- Updated dependencies [d6ae6e9]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.3.8
  - @roadiehq/rag-ai-backend@1.0.2
  - @roadiehq/rag-ai-node@0.1.6

## 0.2.7

### Patch Changes

- b7c834e: Updated @langchain dependencies
- Updated dependencies [b7c834e]
- Updated dependencies [caa7d57]
- Updated dependencies [b7c834e]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.3.7
  - @roadiehq/rag-ai-backend@1.0.0
  - @roadiehq/rag-ai-node@0.1.5

## 0.2.6

### Patch Changes

- 19198fb: Updated @roadiehq/rag-ai-backend-retrieval-augmenter to 0.3.6

## 0.2.5

### Patch Changes

- f5bab23: Upgraded the langchain dependencies of the rag-ai plugins
- Updated dependencies [f5bab23]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.3.4
  - @roadiehq/rag-ai-backend@0.3.3
  - @roadiehq/rag-ai-node@0.1.4

## 0.2.4

### Patch Changes

- 9768baa: Added config parameter `ai.embeddings.concurrencyLimit` for limiting concurrency during creating TechDocs embeddings
- 9768baa: Renamed type `SplitterOptions` to `AugmentationOptions`
- Updated dependencies [9768baa]
- Updated dependencies [ed73691]
- Updated dependencies [9768baa]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.3.3
  - @roadiehq/rag-ai-backend@0.3.2
  - @roadiehq/rag-ai-node@0.1.3

## 0.2.3

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5
- Updated dependencies [d02d5df]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.3.1
  - @roadiehq/rag-ai-backend@0.3.1
  - @roadiehq/rag-ai-node@0.1.2

## 0.2.2

### Patch Changes

- Updated dependencies [2ac9477]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.3.0
  - @roadiehq/rag-ai-backend@0.3.0

## 0.2.1

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0
- Updated dependencies [7cd4bdf]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.2.1
  - @roadiehq/rag-ai-backend@0.2.2
  - @roadiehq/rag-ai-node@0.1.1

## 0.2.0

### Minor Changes

- 7fa2871: Fixed rag-ai compatiblity with API requests authentication and service-to-service auth enabled apps

### Patch Changes

- Updated dependencies [7fa2871]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.2.0
  - @roadiehq/rag-ai-backend@0.2.0

## 0.1.0

### Minor Changes

- 7b468fa: Open source and release Roadie RAG AI Backstage Plugin

  This commit introduces the Roadie RAG AI plugin to Backstage. It adds constructs, types and interfaces to enable additional enhancement of RAG AI functionality of Backstage entities, tech-docs, API docs and Tech Insights fact data.

  - Includes the initial end-to-end configuration
  - Adds frontend modal display to handle query UI
  - Introduces and document AI assistant configurations
  - Adds support for vendor-specific embedding implementations for AWS Bedrock and OpenAI

  Contains necessary documentation for new users configure and start using the functionality as well as enhance the integration compatibility with the existing Backstage infrastructure.

### Patch Changes

- Updated dependencies [7b468fa]
  - @roadiehq/rag-ai-backend@0.1.0
  - @roadiehq/rag-ai-backend-retrieval-augmenter@0.1.0
  - @roadiehq/rag-ai-node@0.1.0
