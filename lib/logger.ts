type LogData = Record<string, unknown>;

export function logInfo(event: string, data: LogData = {}) {
  console.log(
    JSON.stringify({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  );
}

export function logError(event: string, error: unknown, data: LogData = {}) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({
      level: "error",
      event,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  );
}
