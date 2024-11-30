export const handleError = (error: any, defaultMessage: string): Error => {
    if (error instanceof Error) return error;
    return new Error(error?.message || defaultMessage);
  };