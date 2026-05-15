export class Logger {
  info(message: string) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`);
  }

  error(message: string, error?: Error) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error?.stack);
  }
}
