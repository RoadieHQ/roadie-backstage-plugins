# @roadiehq/rag-ai-storage-pgvector

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

## 2.0.2

### Patch Changes

- 27d5559: The `rag-ai` plugins are no longer being actively maintained.
- Updated dependencies [27d5559]
  - @roadiehq/rag-ai-node@0.1.11

## 2.0.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.
- Updated dependencies [a83e7e9]
  - @roadiehq/rag-ai-node@0.1.10

## 2.0.0

### Major Changes

- 43962bd: Remove `@roadiehq/backend-common`. The interface of `createRoadiePgVectorStore` now expects `DatabaseService` in place of `PluginDatabaseManager`.

## 1.0.2

### Patch Changes

- 6847280: added keywords to all plugins
- Updated dependencies [6847280]
  - @roadiehq/rag-ai-node@0.1.8

## 1.0.1

### Patch Changes

- 2718d81: Add link to Roadie in README
- Updated dependencies [2718d81]
  - @roadiehq/rag-ai-node@0.1.7

## 1.0.0

### Major Changes

- 643d210: Switch from winston to `LoggerService` interface to support new backend system

## 0.1.6

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata
- Updated dependencies [d6ae6e9]
  - @roadiehq/rag-ai-node@0.1.6

## 0.1.5

### Patch Changes

- b7c834e: Updated @langchain dependencies
- Updated dependencies [b7c834e]
  - @roadiehq/rag-ai-node@0.1.5

## 0.1.4

### Patch Changes

- f5bab23: Upgraded the langchain dependencies of the rag-ai plugins
- Updated dependencies [f5bab23]
  - @roadiehq/rag-ai-node@0.1.4

## 0.1.3

### Patch Changes

- ed73691: Use `JSON.stringify` for passing the filter to the query
- Updated dependencies [ed73691]
  - @roadiehq/rag-ai-node@0.1.3

## 0.1.2

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5
- Updated dependencies [d02d5df]
  - @roadiehq/rag-ai-node@0.1.2

## 0.1.1

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0
- Updated dependencies [7cd4bdf]
  - @roadiehq/rag-ai-node@0.1.1

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
