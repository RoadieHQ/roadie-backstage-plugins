# RAG AI Backend-embeddings OpenAI submodule

This is a submodule for the `@roadiehq/rag-ai-backend` module, which provides functionality to use OpenAI embeddings to generate a RAG AI Backend plugin for Backstage. It exposes configuration options to configure OpenAI API token and wanted embeddings model, as well as the parameters for the model.

## Initialization

```typescript
const vectorStore = await createRoadiePgVectorStore({ logger, database });

const augmentationIndexer = await initializeOpenAiEmbeddings({
  logger,
  catalogApi,
  vectorStore,
  discovery,
  config,
});
```

>

## Configuration Options

The module expects an API Token, the name of the embeddings generative AI model and its configuration options to be configured via app-config.

You can generate an API Token in here: https://platform.openai.com/api-keys

```yaml
ai:
  embeddings:
    # OpenAI Embeddings configuration
    openai:
      # (Optional) The API key for accessing OpenAI services. Defaults to process.env.OPENAI_API_KEY
      openAIApiKey: 'sk-123...'

      # (Optional) Name of the OpenAI model to use to create Embeddings. Defaults to text-embedding-3-large
      modelName: 'text-embedding-3-large'

      # The size of the batch to use when creating embeddings. Defaults to 512, max is 2048
      batchSize: 512

      # The number of dimensions to generate. Defaults to use the default value from the chosen model
      embeddingsDimensions: 3072
```

<details><summary>Example minimal configuration</summary>

```yaml
ai:
  embeddings:
    openAI: {} # uses env variable OPENAI_API_KEY for API key, model 'text-embedding-3-large' for embeddings creation model
```

</details>

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
