export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiResponseBuilder {
  static success<T>(data: T, messageKey = 'SUCCESS'): ApiResponse<T> {
    return {
      success: true,
      message: messageKey,
      data,
    };
  }

  static error<T = null>(
    messageKey = 'ERROR_OCCURRED',
    data: T = null as T,
  ): ApiResponse<T> {
    return {
      success: false,
      message: messageKey,
      data,
    };
  }
}
