import nodemailer from "nodemailer";

import { AppError } from "@/lib/errors/app-error";
import { PASSWORD_RESET_CODE_VALID_MINUTES } from "@/lib/redis/password-reset-code-store";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new AppError(
      "INTERNAL",
      "邮件服务未配置，请设置 SMTP_HOST、SMTP_USER、SMTP_PASS 环境变量",
    );
  }

  const port = Number(process.env.SMTP_PORT || "465");
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const from = process.env.SMTP_FROM || `LingStack <${user}>`;

  return {
    host,
    port,
    secure,
    from,
    auth: {
      user,
      pass,
    },
  };
}

function formatVerificationCode(code: string) {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

function formatRequestedAt(date: Date) {
  return date.toLocaleString("zh-CN", {
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
}

function buildPasswordResetCodeHtml(input: {
  email: string;
  code: string;
  requestedAt: Date;
}) {
  const formattedCode = formatVerificationCode(input.code);
  const requestedAt = formatRequestedAt(input.requestedAt);

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #e5e7eb;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#111827;">LingStack</td>
                    <td align="right" style="font-family:Consolas,Monaco,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#9ca3af;">AI Learning Workspace</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.25;font-weight:700;">重置你的 LingStack 密码</h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">我们收到了重置你账户密码的请求。请使用下方验证码完成身份验证。</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;background-color:#ffffff;">
                  <tr>
                    <td align="center" style="padding:28px 24px 12px 24px;font-family:Consolas,Monaco,monospace;font-size:40px;line-height:1.1;font-weight:700;letter-spacing:0.18em;color:#2563eb;">
                      ${formattedCode}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 24px 24px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6b7280;">
                      验证码 ${PASSWORD_RESET_CODE_VALID_MINUTES} 分钟内有效
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#4b5563;">
                请勿向任何人泄露此代码，包括 LingStack 的工作人员。
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td colspan="2" style="padding:10px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;font-family:Consolas,Monaco,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;">System Metadata</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;width:34%;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;border-bottom:1px solid #f3f4f6;">消息来源</td>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">LingStack 账户安全系统</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;border-bottom:1px solid #f3f4f6;">发送原因</td>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">请求重置登录密码</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;border-bottom:1px solid #f3f4f6;">请求时间</td>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">${requestedAt}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;">接收邮箱</td>
                    <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;">${input.email}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#6b7280;">
                安全提示：如果这不是你本人操作，说明有人尝试访问你的账户。请确保你的邮箱安全，并忽略此邮件。重置密码不会删除你的学习记录。
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 32px 40px;border-top:1px solid #e5e7eb;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
                      LingStack · 免费开源项目<br />
                      <span style="color:#9ca3af;">Precision learning workspace for React and Next.js.</span>
                    </td>
                    <td align="right" style="font-family:Consolas,Monaco,monospace;font-size:10px;line-height:1.6;color:#9ca3af;text-transform:uppercase;">
                      System Generated Message<br />
                      Do Not Reply
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetCodeEmail(input: {
  email: string;
  code: string;
  requestedAt?: Date;
}) {
  const smtp = getSmtpConfig();
  const requestedAt = input.requestedAt ?? new Date();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  try {
    await transporter.sendMail({
      from: smtp.from,
      to: input.email,
      subject: "LingStack 密码重置验证码",
      html: buildPasswordResetCodeHtml({
        email: input.email,
        code: input.code,
        requestedAt,
      }),
    });
  } catch (error) {
    console.error("[mail] password reset code send failed", error);
    throw new AppError("INTERNAL", "验证码邮件发送失败，请稍后再试");
  }
}
