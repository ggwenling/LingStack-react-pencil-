import { createHash, randomInt } from "node:crypto";

import bcrypt from "bcryptjs";

import { AppError } from "@/lib/errors/app-error";
import { getRedisClient } from "@/lib/redis/client";

const PASSWORD_RESET_CODE_TTL_SECONDS = 180;
const PASSWORD_RESET_COOLDOWN_SECONDS = 60;
const PASSWORD_RESET_ATTEMPT_LOCK_SECONDS = 15 * 60;
const PASSWORD_RESET_MAX_EMAIL_ATTEMPTS = 5;
const PASSWORD_RESET_MAX_IP_ATTEMPTS = 20;

type StoredPasswordResetCode = {
  codeHash: string;
  userId: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function resetCodeKey(email: string) {
  return `lingstack:pwd-reset:${normalizeEmail(email)}`;
}

function cooldownKey(email: string) {
  return `lingstack:pwd-reset:cooldown:${normalizeEmail(email)}`;
}

function emailAttemptKey(email: string) {
  return `lingstack:pwd-reset:attempts:email:${normalizeEmail(email)}`;
}

function normalizeIpAddress(ipAddress?: string | null) {
  return ipAddress?.split(",")[0]?.trim() || null;
}

function ipAttemptKey(ipAddress: string) {
  const hash = createHash("sha256").update(ipAddress).digest("hex");
  return `lingstack:pwd-reset:attempts:ip:${hash}`;
}

function parseAttemptCount(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value) || 0;
  }

  return 0;
}

function tooManyAttemptsMessage() {
  return "验证码错误次数过多，请 15 分钟后重新发送验证码";
}

async function incrementAttempt(redis: ReturnType<typeof getRedisClient>, key: string) {
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, PASSWORD_RESET_ATTEMPT_LOCK_SECONDS);
  }

  return attempts;
}

async function assertPasswordResetAttemptLimit(input: {
  email: string;
  ipAddress?: string | null;
}) {
  const redis = getRedisClient();
  const ipAddress = normalizeIpAddress(input.ipAddress);
  const emailAttempts = parseAttemptCount(await redis.get(emailAttemptKey(input.email)));
  const ipAttempts = ipAddress
    ? parseAttemptCount(await redis.get(ipAttemptKey(ipAddress)))
    : 0;

  if (
    emailAttempts >= PASSWORD_RESET_MAX_EMAIL_ATTEMPTS ||
    ipAttempts >= PASSWORD_RESET_MAX_IP_ATTEMPTS
  ) {
    throw new AppError("BAD_REQUEST", tooManyAttemptsMessage());
  }
}

async function recordPasswordResetFailedAttempt(input: {
  email: string;
  ipAddress?: string | null;
}) {
  const redis = getRedisClient();
  const ipAddress = normalizeIpAddress(input.ipAddress);
  const emailAttempts = await incrementAttempt(redis, emailAttemptKey(input.email));
  const ipAttempts = ipAddress
    ? await incrementAttempt(redis, ipAttemptKey(ipAddress))
    : 0;

  if (emailAttempts >= PASSWORD_RESET_MAX_EMAIL_ATTEMPTS) {
    await redis.del(resetCodeKey(input.email));
    throw new AppError("BAD_REQUEST", tooManyAttemptsMessage());
  }

  if (ipAttempts >= PASSWORD_RESET_MAX_IP_ATTEMPTS) {
    throw new AppError("BAD_REQUEST", tooManyAttemptsMessage());
  }
}

export function generatePasswordResetCode() {
  return randomInt(100000, 1000000).toString();
}

export async function assertPasswordResetCooldown(email: string) {
  const redis = getRedisClient();
  const [cooldown, emailAttempts] = await Promise.all([
    redis.get<string>(cooldownKey(email)),
    redis.get(emailAttemptKey(email)),
  ]);

  if (cooldown) {
    throw new AppError("BAD_REQUEST", "请稍后再试，60 秒内只能发送一次验证码");
  }

  if (parseAttemptCount(emailAttempts) >= PASSWORD_RESET_MAX_EMAIL_ATTEMPTS) {
    throw new AppError("BAD_REQUEST", tooManyAttemptsMessage());
  }
}

export async function setPasswordResetCooldown(email: string) {
  const redis = getRedisClient();

  await redis.set(cooldownKey(email), "1", {
    ex: PASSWORD_RESET_COOLDOWN_SECONDS,
  });
}

export async function setPasswordResetCode(input: {
  email: string;
  userId: string;
  plainCode: string;
}) {
  const redis = getRedisClient();
  const codeHash = await bcrypt.hash(input.plainCode, 10);
  const payload: StoredPasswordResetCode = {
    codeHash,
    userId: input.userId,
  };

  await redis.set(resetCodeKey(input.email), JSON.stringify(payload), {
    ex: PASSWORD_RESET_CODE_TTL_SECONDS,
  });

  await redis.set(cooldownKey(input.email), "1", {
    ex: PASSWORD_RESET_COOLDOWN_SECONDS,
  });
}

export async function verifyPasswordResetCode(input: {
  email: string;
  plainCode: string;
  ipAddress?: string | null;
}) {
  const redis = getRedisClient();
  await assertPasswordResetAttemptLimit(input);

  const raw = await redis.get<string>(resetCodeKey(input.email));

  if (!raw) {
    throw new AppError("BAD_REQUEST", "验证码无效或已过期，请重新发送");
  }

  const stored =
    typeof raw === "string"
      ? (JSON.parse(raw) as StoredPasswordResetCode)
      : (raw as StoredPasswordResetCode);

  if (!stored?.codeHash || !stored?.userId) {
    throw new AppError("BAD_REQUEST", "验证码无效或已过期，请重新发送");
  }

  const isValid = await bcrypt.compare(input.plainCode, stored.codeHash);

  if (!isValid) {
    await recordPasswordResetFailedAttempt(input);
    throw new AppError("BAD_REQUEST", "验证码不正确，请检查后重试");
  }

  return stored.userId;
}

export async function deletePasswordResetCode(email: string) {
  const redis = getRedisClient();
  await redis.del(resetCodeKey(email));
}

export async function clearPasswordResetAttemptLimits(input: {
  email: string;
  ipAddress?: string | null;
}) {
  const redis = getRedisClient();
  const ipAddress = normalizeIpAddress(input.ipAddress);
  const keys = [emailAttemptKey(input.email)];

  if (ipAddress) {
    keys.push(ipAttemptKey(ipAddress));
  }

  await redis.del(...keys);
}

export const PASSWORD_RESET_CODE_VALID_MINUTES = PASSWORD_RESET_CODE_TTL_SECONDS / 60;
