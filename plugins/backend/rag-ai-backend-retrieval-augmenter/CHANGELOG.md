# @roadiehq/rag-ai-backend-retrieval-augmenter

## 1.2.0

### Minor Changes

- f215405: Upgrade to 1.40.2

### Patch Changes

- Updated dependencies [f215405]
  - @roadiehq/rag-ai-node@0.2.0

## 1.1.5

### Patch Changes

- 27d5559: The `rag-ai` plugins are no longer being actively maintained.
- Updated dependencies [27d5559]
  - @roadiehq/rag-ai-node@0.1.11

## 1.1.4

### Patch Changes

- 11112a6: Allow AuthService to be passed and avoid deprecated TokenManager

## 1.1.3

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.
- Updated dependencies [a83e7e9]
  - @roadiehq/rag-ai-node@0.1.10

## 1.1.2

### Patch Changes

- e9c26c6: Update scaffolder packages, tidy up some imports

## 1.1.1

### Patch Changes

- 1cca13c: Improve support for new backend system
- Updated dependencies [1cca13c]
  - @roadiehq/rag-ai-node@0.1.9

## 1.1.0

### Minor Changes

- ad1565e: Make Tech Docs embeddings creation filterable based on additional passed in entity filter values.

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

- 890743e: Fix issue with cleaning up old TechDocs vectors

## 1.0.1

### Patch Changes

- 7176c80: Fix auth when indexing TechDocs documents

## 1.0.0

### Major Changes

- 8d209f4: Support new auth system and replace winston with `LoggerService`

## 0.3.8

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata
- Updated dependencies [d6ae6e9]
  - @roadiehq/rag-ai-node@0.1.6

## 0.3.7

### Patch Changes

- b7c834e: Updated @langchain dependencies
- Updated dependencies [b7c834e]
  - @roadiehq/rag-ai-node@0.1.5

## 0.3.6

### Patch Changes

- f040722: Fixed missing metadata from TechDocs embeddings

## 0.3.5

### Patch Changes

- c0ae442: Add `title` and `location` to metadata of TechDocs embeddings

## 0.3.4

### Patch Changes

- f5bab23: Upgraded the langchain dependencies of the rag-ai plugins
- Updated dependencies [f5bab23]
  - @roadiehq/rag-ai-node@0.1.4

## 0.3.3

### Patch Changes

- 9768baa: Added config parameter `ai.embeddings.concurrencyLimit` for limiting concurrency during creating TechDocs embeddings
- ed73691: Added source `all` for querying all sources simultaneously
- 9768baa: Renamed type `SplitterOptions` to `AugmentationOptions`
- Updated dependencies [ed73691]
  - @roadiehq/rag-ai-node@0.1.3

## 0.3.2

### Patch Changes

- bbf7702: Added support for TechDocs

## 0.3.1

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5
- Updated dependencies [d02d5df]
  - @roadiehq/rag-ai-node@0.1.2

## 0.3.0

### Minor Changes

- 2ac9477: Fix the 401 unauthorized error in searchClient for rag-ai-backend-retrieval-augmenter when using authMiddleware in backstage backend

## 0.2.1

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0
- Updated dependencies [7cd4bdf]
  - @roadiehq/rag-ai-node@0.1.1

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
