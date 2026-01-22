import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaClient } from "../../../../prisma/src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { WebSocket } from "ws";

declare global {
  var prisma: PrismaClient | undefined;
}

// Validate DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.trim() === "") {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your environment configuration.",
  );
}

neonConfig.webSocketConstructor = WebSocket;

// Create connection pool and adapter
// const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter: adapter,
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
