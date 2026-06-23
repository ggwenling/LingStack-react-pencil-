import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const PRISMA_CLIENT_RESET_KEY = "__lingstack_prisma_schema__";
// Bump when Prisma schema changes so dev picks up regenerated client.
const PRISMA_SCHEMA_MARKER = "20260621140000_add_exercise_gate_models";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

if (process.env.NODE_ENV === "development") {
  const markerStore = globalThis as typeof globalThis & {
    [PRISMA_CLIENT_RESET_KEY]?: string;
  };

  if (markerStore[PRISMA_CLIENT_RESET_KEY] !== PRISMA_SCHEMA_MARKER) {
    if (globalForPrisma.prisma) {
      void globalForPrisma.prisma.$disconnect();
    }

    globalForPrisma.prisma = undefined;
    markerStore[PRISMA_CLIENT_RESET_KEY] = PRISMA_SCHEMA_MARKER;
  }
}

const adapter = new PrismaPg({ connectionString });

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : undefined,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

export type PrismaTransaction = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export function transaction<T>(
  callback: (tx: PrismaTransaction) => Promise<T>,
) {
  return prisma.$transaction(callback);
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
