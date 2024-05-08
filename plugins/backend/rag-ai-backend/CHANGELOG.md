# @roadiehq/rag-ai-backend

## 0.3.1

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5
- Updated dependencies [d02d5df]
  - @roadiehq/rag-ai-node@0.1.2

## 0.3.0

### Minor Changes

- 2ac9477: Fix the 401 unauthorized error in searchClient for rag-ai-backend-retrieval-augmenter when using authMiddleware in backstage backend

## 0.2.2

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0
- Updated dependencies [7cd4bdf]
  - @roadiehq/rag-ai-node@0.1.1

## 0.2.1

### Patch Changes

- 296781e: Add support for backend system.

## 0.2.0

### Minor Changes

- 7fa2871: Fixed rag-ai compatiblity with API requests authentication and service-to-service auth enabled apps

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
  - @roadiehq/rag-ai-node@0.1.0
