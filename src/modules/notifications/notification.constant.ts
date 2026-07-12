export const NOTIFICATION_CONSTANTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export function notificationEmailHtml(name: string, itemsHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 40px auto; border: 1px solid #E5DED8; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
      
      <!-- Header -->
      <div style="background-color: #CC5500; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Recalio</h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px 32px;">
        <h2 style="margin-top: 0; font-size: 20px; color: #1A1A1A;">Xin chào ${name},</h2>
        <p style="color: #71717A; margin-bottom: 24px;">Bạn có thông báo mới từ Recalio. Hãy kiểm tra ngay để duy trì nhịp độ học tập của bạn:</p>
        
        <div style="background-color: #FDFBF7; border: 1px solid #E5DED8; border-radius: 16px; padding: 24px;">
          <ul style="margin: 0; padding-left: 20px; color: #1A1A1A;">
            ${itemsHtml}
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 24px 32px; background-color: #FAFAFA; border-top: 1px solid #E5DED8; text-align: center;">
        <p style="margin: 0; color: #71717A; font-size: 13px;">Recalio — Học từ vựng thông minh</p>
        <p style="margin: 8px 0 0 0; color: #A1A1AA; font-size: 12px;">© ${new Date().getFullYear()} Recalio Inc.</p>
      </div>
    </div>
  `;
}
