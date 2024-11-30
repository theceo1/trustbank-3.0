interface ErrorLogParams {
  error: Error;
  errorInfo: React.ErrorInfo;
  context: string;
}

export class ErrorLogger {
  static logError({ error, errorInfo, context }: ErrorLogParams) {
    console.error(`[${context}] Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }
}