export function readableError(err: unknown, fallback: string): string {
  if (err instanceof TypeError) {
    return "Couldn't reach the local service. Check that it is running, then try again.";
  }
  if (err instanceof Error) {
    const message = err.message.trim();
    if (message && message !== "undefined" && message !== "null") return message;
  }
  return fallback;
}
