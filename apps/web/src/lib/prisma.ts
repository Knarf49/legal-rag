import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
// import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  var prisma: PrismaClient | undefined;
}

// Validate DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;

neonConfig.webSocketConstructor = ws;

// Create connection pool and adapter
// const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
  });

// if (process.env.NODE_ENV === "development") global.prisma = prisma;
