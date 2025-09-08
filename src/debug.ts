// Debug logging for S3 Browser Extension

export function logDebug(message: string): void {
  const DEBUG = true;
  if (DEBUG) {
    console.log(`[S3 Browser] ${message}`);
  }
}
