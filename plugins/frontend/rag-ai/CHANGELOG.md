# @roadiehq/rag-ai

## 0.2.4

### Patch Changes

- bbf7702: Added a dropdown for selecting a source
- 1e749b8: Added optional property `title` to component `RagModal`

## 0.2.3

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 0.2.2

### Patch Changes

- 793c35c: Filter out embeddings without metadata information when displaying additional data

## 0.2.1

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

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
