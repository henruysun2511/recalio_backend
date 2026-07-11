export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode?: number;
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;
}
