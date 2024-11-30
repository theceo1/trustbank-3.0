declare global {
    namespace NodeJS {
      interface ProcessEnv {
        QUIDAX_API_KEY: string;
        QUIDAX_API_URL: string;
        NODE_ENV: 'development' | 'production' | 'test';
      }
    }
  }
  
  export {};