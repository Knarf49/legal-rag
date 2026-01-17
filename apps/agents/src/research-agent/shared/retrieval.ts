import { RunnableConfig } from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { PineconeStore } from "@langchain/pinecone";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { MongoClient } from "mongodb";
import { ensureBaseConfiguration } from "./configuration.js";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Embeddings } from "@langchain/core/embeddings";
import { CohereEmbeddings } from "@langchain/cohere";
import { OpenAIEmbeddings } from "@langchain/openai";

async function makeChromaRetriever(
  configuration: ReturnType<typeof ensureBaseConfiguration>,
  embeddingModel: Embeddings
): Promise<VectorStoreRetriever> {
  if (!process.env.CHROMA_API_KEY) {
    throw new Error("CHROMA_API_KEY environment variable is not defined");
  }

  // Global collection "law" accessible to all users
  const collectionName = "law";

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

  const searchKwargs = { ...(configuration.searchKwargs ?? {}) };

  const Filter = {
    ...(searchKwargs.where ?? {}),
  };

  return vectorStore.asRetriever({
    filter: Object.keys(Filter).length > 0 ? Filter : undefined,
  });
}

async function makePineconeRetriever(
  configuration: ReturnType<typeof ensureBaseConfiguration>,
  embeddingModel: Embeddings
): Promise<VectorStoreRetriever> {
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) {
    throw new Error("PINECONE_INDEX_NAME environment variable is not defined");
  }
  const pinecone = new PineconeClient();
  const pineconeIndex = pinecone.Index(indexName!);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddingModel, {
    pineconeIndex,
  });

  return vectorStore.asRetriever({ filter: configuration.searchKwargs || {} });
}

async function makeMongoDBRetriever(
  configuration: ReturnType<typeof ensureBaseConfiguration>,
  embeddingModel: Embeddings
): Promise<VectorStoreRetriever> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  const namespace = `langgraph_retrieval_agent.default`;
  const [dbName, collectionName] = namespace.split(".");
  const collection = client.db(dbName).collection(collectionName);
  const vectorStore = new MongoDBAtlasVectorSearch(embeddingModel, {
    collection: collection,
    textKey: "text",
    embeddingKey: "embedding",
    indexName: "vector_index",
  });
  return vectorStore.asRetriever({ filter: configuration.searchKwargs || {} });
}

function makeTextEmbeddings(modelName: string): Embeddings {
  /**
   * Connect to the configured text encoder.
   */
  const index = modelName.indexOf("/");
  let provider, model;
  if (index === -1) {
    model = modelName;
    provider = "openai"; // Assume openai if no provider included
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

export async function makeRetriever(
  config: RunnableConfig
): Promise<VectorStoreRetriever> {
  const configuration = ensureBaseConfiguration(config);
  const embeddingModel = makeTextEmbeddings(configuration.embeddingModel);

  switch (configuration.retrieverProvider) {
    case "chroma":
      return makeChromaRetriever(configuration, embeddingModel);
    case "pinecone":
      return makePineconeRetriever(configuration, embeddingModel);
    case "mongodb":
      return makeMongoDBRetriever(configuration, embeddingModel);
    default:
      throw new Error(
        `Unrecognized retrieverProvider in configuration: ${configuration.retrieverProvider}`
      );
  }
}
