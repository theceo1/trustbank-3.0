const DEBUG = process.env.NODE_ENV === 'development';

export const debug = {
  trade: (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`[Trade Debug] ${message}`, data || '');
    }
  },
  error: (message: string, error: any) => {
    if (DEBUG) {
      console.error(`[Trade Error] ${message}:`, error);
    }
  }
}; 