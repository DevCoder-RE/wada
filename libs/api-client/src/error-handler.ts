// Error handling utilities

export class ErrorHandler {
  static handleApiError(error: any): string {
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  }

  static isNetworkError(error: any): boolean {
    return error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: any): boolean {
    return error?.status === 401 || error?.message?.includes('JWT');
  }
}