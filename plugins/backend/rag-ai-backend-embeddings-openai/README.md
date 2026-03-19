<div align="center">
  <img src="https://images.ctfassets.net/hcqpbvoqhwhm/5J0FSNghLU8M6nZNtQHS0D/96bf022e075a5e10a5b3ba6b35ae8990/roadie-horiz-big-transp-back.png" alt="Roadie Logo" width="400"/>
</div>

> ⚠️ **Reference Implementation Only**  
> The rag-ai plugin and its modules are a reference implementation provided for demonstration and educational purposes.  
> We provide minimal support for these components and do not actively maintain or update them.

---

# RAG AI Backend-embeddings OpenAI submodule

This is a submodule for the `@roadiehq/rag-ai-backend` module, which provides functionality to use OpenAI embeddings to generate a RAG AI Backend plugin for Backstage. It exposes configuration options to configure OpenAI API token and wanted embeddings model, as well as the parameters for the model.

## Initialization

```typescript
const vectorStore = await createRoadiePgVectorStore({ logger, database });

const augmentationIndexer = await initializeOpenAiEmbeddings({
  logger,
  catalogApi,
  auth,
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
      openAiApiKey: 'sk-123...'

      # (Optional) Specify URL of self-hosted OpenAI compliant endpoint. Defaults to OpenAI's public API https://api.openai.com
      openAiBaseUrl: ''

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
