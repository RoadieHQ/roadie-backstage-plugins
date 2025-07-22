# @roadiehq/rag-ai-backend-embeddings-aws

## 1.2.0

### Minor Changes

- f215405: Upgrade to 1.40.2

### Patch Changes

- Updated dependencies [f215405]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.2.0
  - @roadiehq/rag-ai-backend@2.1.0
  - @roadiehq/rag-ai-node@0.2.0

## 1.1.5

### Patch Changes

- 27d5559: The `rag-ai` plugins are no longer being actively maintained.
- Updated dependencies [27d5559]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.1.5
  - @roadiehq/rag-ai-backend@2.0.1
  - @roadiehq/rag-ai-node@0.1.11

## 1.1.4

### Patch Changes

- Updated dependencies [31ae687]
  - @roadiehq/rag-ai-backend@2.0.0

## 1.1.3

### Patch Changes

- 11112a6: Allow AuthService to be passed and avoid deprecated TokenManager
- Updated dependencies [11112a6]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.1.4

## 1.1.2

### Patch Changes

- c551190: Update dependency on rag backend.
- a83e7e9: Tidy unused plugin depdendencies.
- Updated dependencies [a83e7e9]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.1.3
  - @roadiehq/rag-ai-backend@1.3.3
  - @roadiehq/rag-ai-node@0.1.10

## 1.1.1

### Patch Changes

- e9c26c6: Update scaffolder packages, tidy up some imports
- Updated dependencies [e9c26c6]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.1.2

## 1.1.0

### Minor Changes

- d8e19e7: Made `maxRetries` configurable

## 1.0.3

### Patch Changes

- 1cca13c: Improve support for new backend system
- Updated dependencies [1cca13c]
  - @roadiehq/rag-ai-backend-retrieval-augmenter@1.1.1
  - @roadiehq/rag-ai-node@0.1.9

## 1.0.2

### Patch Changes

- 05d5d94: Update retrieval augmenter dependency

## 1.0.1

### Patch Changes

- 3e4965f: Add max retries to embeddings to prevent forever loop in case of errors.

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
