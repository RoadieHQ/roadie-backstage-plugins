# rag-ai-backend-embeddings

This is a base module providing default functionality related to RAG AI embeddings. It enables a pluggable AI model initialization in a submodule and provides default, extendable functionality to create, manage, and search embeddings.

It also contains logic to use the default Backstage search to search for additional context that can be added to the query prompts sent to configured LLMs.

This module should be extended using vendor specific embeddings implementations. 
