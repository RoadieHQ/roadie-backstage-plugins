# @roadiehq/rag-ai-backend

## 3.0.1

### Patch Changes

- 4288c3c: Added property maxConcurrency to example AWS Bedrock configuration

## 3.0.0

### Major Changes

- 8ed88c3: **BREAKING** LangChain dependencies have been upgraded to their latest versions.

  Since their API is not backwards compatible, you need to upgrade the dependencies in your project as well.

### Patch Changes

- Updated dependencies [8ed88c3]
  - @roadiehq/rag-ai-node@0.4.0

## 2.2.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

### Patch Changes

- Updated dependencies [c2274f9]
  - @roadiehq/rag-ai-node@0.3.0

## 2.1.0

### Minor Changes

- f215405: Upgrade to 1.40.2

### Patch Changes

- Updated dependencies [f215405]
  - @roadiehq/rag-ai-node@0.2.0

## 2.0.1

### Patch Changes

- 27d5559: The `rag-ai` plugins are no longer being actively maintained.
- Updated dependencies [27d5559]
  - @roadiehq/rag-ai-node@0.1.11

## 2.0.0

### Major Changes

- 31ae687: Remove deprecated TokenManager param from router constructor that was deprecated and fix README examples

## 1.3.3

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.
- Updated dependencies [a83e7e9]
  - @roadiehq/rag-ai-node@0.1.10

## 1.3.2

### Patch Changes

- dffd381: Add error logging to query endpoint

## 1.3.1

### Patch Changes

- 855e5d1: Added `ai.embeddings.bedrock.maxRetries` to README

## 1.3.0

### Minor Changes

- 8915f83: We are making the logger compatible with Backstage's LoggerService and winston's Logger so that Roadie can be used with newer and older versions of Backstage.

## 1.2.0

### Minor Changes

- 6da7661: Add support for specifying a custom OpenAI baseURL via config

## 1.1.0

### Minor Changes

- d2b38ac: Add additional possibility to use Cohere embeddings for AWS Bedrock embeddings module. Release version 1.x

  Add more information about token usage to the backend controller.

## 1.0.4

### Patch Changes

- 6847280: added keywords to all plugins
- Updated dependencies [6847280]
  - @roadiehq/rag-ai-node@0.1.8

## 1.0.3

### Patch Changes

- 2718d81: Add link to Roadie in README
- Updated dependencies [2718d81]
  - @roadiehq/rag-ai-node@0.1.7

## 1.0.2

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata
- Updated dependencies [d6ae6e9]
  - @roadiehq/rag-ai-node@0.1.6

## 1.0.1

### Patch Changes

- 5fd75a3: Fixed missing newlines

## 1.0.0

### Major Changes

- b7c834e: **BREAKING** Added support for streaming responses

### Patch Changes

- b7c834e: Updated @langchain dependencies
- caa7d57: Added Content-Type header to query responses
- Updated dependencies [b7c834e]
  - @roadiehq/rag-ai-node@0.1.5

## 0.3.4

### Patch Changes

- 35d5410: Added support for chat completion models

## 0.3.3

### Patch Changes

- f5bab23: Upgraded the langchain dependencies of the rag-ai plugins
- Updated dependencies [f5bab23]
  - @roadiehq/rag-ai-node@0.1.4

## 0.3.2

### Patch Changes

- ed73691: Added source `all` for querying all sources simultaneously
- Updated dependencies [ed73691]
  - @roadiehq/rag-ai-node@0.1.3

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
