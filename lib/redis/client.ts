import { Redis } from "@upstash/redis";

import { AppError } from "@/lib/errors/app-error";

let redisClient: Redis | null = null;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.REDIS_HOST;
  const token = process.env.REDIS_TOKEN;

  if (!url || !token) {
    throw new AppError(
      "INTERNAL",
      "Redis 未配置，请设置 REDIS_HOST 与 REDIS_TOKEN 环境变量",
    );
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
}
