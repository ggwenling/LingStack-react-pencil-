import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";
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

function createPgPoolConfig(): PoolConfig {
  const rejectUnauthorized =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false";
  const runtimeConnectionString = new URL(connectionString!);

  // pg v8 会把 URL 里的 sslmode=require 当成 verify-full，在 Supabase
  // pooler 上容易触发 self-signed certificate in certificate chain（Vercel/本地均可能）。
  // SSL 统一由下方 ssl 选项控制，不再依赖连接串里的 sslmode。
  runtimeConnectionString.searchParams.delete("sslmode");

  // Production defaults to 8: a single Next.js instance can serve concurrent
  // requests; max 1 serialized DB access and caused queueing under load.
  const productionPoolMax = Number(process.env.DATABASE_POOL_MAX ?? 8);

  return {
    connectionString: runtimeConnectionString.toString(),
    max:
      process.env.NODE_ENV === "production"
        ? Number.isFinite(productionPoolMax) && productionPoolMax > 0
          ? productionPoolMax
          : 8
        : undefined,
    // 本地若被代理/杀毒注入自签证书，可在 .env 设 DATABASE_SSL_REJECT_UNAUTHORIZED=false
    ssl: { rejectUnauthorized },
  };
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

const adapter = new PrismaPg(createPgPoolConfig());

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

globalForPrisma.prisma = prisma;
