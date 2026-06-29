import { getCurrentUser } from "@/lib/auth/session";
import { AppError, toApiResponse } from "@/lib/errors/app-error";
import {
  chatRequestSchema,
  processChatRequest,
} from "@/lib/services/chat-service";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AppError("UNAUTHORIZED", "未登录");
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      throw new AppError("BAD_REQUEST", "请求体不是合法 JSON");
    }

    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", "聊天消息格式不正确");
    }

    return await processChatRequest(user.id, parsed.data);
  } catch (error) {
    if (error instanceof AppError) {
      return toApiResponse(error);
    }

    throw error;
  }
}
