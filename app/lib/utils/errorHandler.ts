export function handleError(error: any, defaultMessage: string): never {
  const message = error?.message || defaultMessage;
  console.error(message, error);
  throw new Error(message);
}