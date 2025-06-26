<div align="center">
  <img src="https://images.ctfassets.net/hcqpbvoqhwhm/5J0FSNghLU8M6nZNtQHS0D/96bf022e075a5e10a5b3ba6b35ae8990/roadie-horiz-big-transp-back.png" alt="Roadie Logo" width="400"/>
</div>

> ⚠️ **Reference Implementation Only**  
> The rag-ai plugin and its modules are a reference implementation provided for demonstration and educational purposes.  
> We provide minimal support for these components and do not actively maintain or update them.

---

# RoadiePgVectorStore - PostgreSQL RAG AI Vector Storage

A module enabling usage of PostgreSQL as a storage solution for RAG AI Backstage backend plugin.

> Note, you need to have `uuid-ossp` and `vector` PostgreSQL extensions available on your database to be able to use this module.

This module construct a database and needed database tables to support storing embeddings vectors into your PostgreSQL DB. You can control the name of the database with the configured environment name within your Backstage backend application.

## How to initialize

You can use the exported `createRoadiePgVectorStore` function to initialize the RoadiePGVectorStore. This initialization function expects an instance of logger and a Knex DB connection.

Here is a TypeScript example:

```typescript
const config = {
  logger: Logger, // logger instance
  db: Knex, // database connection provided by Knex
  options: {
    chunkSize: number, // (optional) amount of documents to chunk when adding vectors, default is 500
    tableName: string, // (optional) Table naming to use to store embeddings. Default is 'embeddings'
  },
};

const vectorStore = await createRoadiePgVectorStore({
  logger,
  database,
  options: { chunkSize, tableName },
});
```

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
