/**
 * This "graph" simply exposes an endpoint for a user to upload docs to be indexed.
 */

import { Document } from "@langchain/core/documents";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph } from "@langchain/langgraph";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { Embeddings } from "@langchain/core/embeddings";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CohereEmbeddings } from "@langchain/cohere";
import { OpenAIEmbeddings } from "@langchain/openai";

import { IndexStateAnnotation } from "./state.js";
// import { makeRetriever } from "./retrieval.js";
import {
  ensureIndexConfiguration,
  IndexConfigurationAnnotation,
} from "./configuration.js";

function ensureDocsHaveUserId(docs: Document[], userId: string): Document[] {
  return docs.map((doc) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: { ...doc.metadata, user_id: userId },
    });
  });
}

/**
 * Create a user-specific Chroma retriever for indexing new documents
 * New documents are stored in collection: langgraph_retrieval_agent_<userId>
 * Global "law" collection is read-only for all users
 */
async function makeUserSpecificChromaRetriever(
  userId: string,
  embeddingModel: Embeddings
): Promise<VectorStoreRetriever> {
  if (!process.env.CHROMA_API_KEY) {
    throw new Error("CHROMA_API_KEY environment variable is not defined");
  }

  // User-specific collection for new documents
  const collectionName = `langgraph_retrieval_agent_${userId}`;

  const vectorStore = new Chroma(embeddingModel, {
    collectionName,
    chromaCloudAPIKey: process.env.CHROMA_API_KEY,
    clientParams: {
      host: "api.trychroma.com",
      port: 8000,
      ssl: true,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
    },
  });

  return vectorStore.asRetriever();
}

function makeTextEmbeddings(modelName: string): Embeddings {
  const index = modelName.indexOf("/");
  let provider, model;
  if (index === -1) {
    model = modelName;
    provider = "openai";
  } else {
    provider = modelName.slice(0, index);
    model = modelName.slice(index + 1);
  }
  switch (provider) {
    case "openai":
      return new OpenAIEmbeddings({ model });
    case "cohere":
      return new CohereEmbeddings({ model });
    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }
}

async function indexDocs(
  state: typeof IndexStateAnnotation.State,
  config?: RunnableConfig
): Promise<typeof IndexStateAnnotation.Update> {
  if (!config) {
    throw new Error("ConfigurationAnnotation required to run index_docs.");
  }

  // Use userId from config metadata or default to 'default'
  const userId = config.metadata?.userId || "default";

  const docs = state.docs;
  const configuration = ensureIndexConfiguration(config);
  const embeddingModel = makeTextEmbeddings(configuration.embeddingModel);

  // Use user-specific collection for new documents
  const retriever = await makeUserSpecificChromaRetriever(
    userId,
    embeddingModel
  );
  const stampedDocs = ensureDocsHaveUserId(docs, userId);

  await retriever.addDocuments(stampedDocs);
  return { docs: "delete" };
}

// Define a new graph

const builder = new StateGraph(
  IndexStateAnnotation,
  IndexConfigurationAnnotation
)
  .addNode("indexDocs", indexDocs)
  .addEdge("__start__", "indexDocs");

// Finally, we compile it!
// This compiles it into a graph you can invoke and deploy.
export const graph = builder.compile();

graph.name = "Index Graph"; // Customizes the name displayed in LangSmith
