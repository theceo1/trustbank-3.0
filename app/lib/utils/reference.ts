export function generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
  return `TRX-${timestamp}-${random}`.toUpperCase();
}
    