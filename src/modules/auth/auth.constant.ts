export const AUTH_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  DISPLAY_NAME_MAX_LENGTH: 100,
  REFRESH_TOKEN_BYTES: 64,
  BCRYPT_ROUNDS: 12,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
} as const;

export function forgotPasswordEmailHtml(otpCode: string, name: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #2E2E2E; margin: 0;">Recalio</h1>
      </div>
      <div style="background: #fff; border-radius: 16px; border: 1px solid #E8DDD4; padding: 32px 24px;">
        <h2 style="font-size: 18px; color: #2E2E2E; margin: 0 0 8px;">Xin chào ${name},</h2>
        <p style="color: #6B6B6B; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          Sử dụng mã OTP dưới đây để xác thực:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #D97D56; background: #F6EBDD; padding: 12px 24px; border-radius: 12px;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #6B6B6B; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
          Mã OTP có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
        <hr style="border: none; border-top: 1px solid #E8DDD4; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          Recalio — Học từ vựng thông minh
        </p>
      </div>
    </div>
  `;
}

export function resetPasswordSuccessEmailHtml(name: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #2E2E2E; margin: 0;">Recalio</h1>
      </div>
      <div style="background: #fff; border-radius: 16px; border: 1px solid #E8DDD4; padding: 32px 24px;">
        <h2 style="font-size: 18px; color: #2E2E2E; margin: 0 0 8px;">Xin chào ${name},</h2>
        <p style="color: #6B6B6B; font-size: 14px; line-height: 1.6; margin: 0;">
          Mật khẩu của bạn đã được đặt lại thành công.
        </p>
        <hr style="border: none; border-top: 1px solid #E8DDD4; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          Recalio — Học từ vựng thông minh
        </p>
      </div>
    </div>
  `;
}
