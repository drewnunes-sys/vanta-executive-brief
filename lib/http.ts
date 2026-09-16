export function errorMessage(error: unknown, fallback = "Unknown error") {
  return error instanceof Error ? error.message : fallback;
}

export function statusForError(error: unknown) {
  const message = errorMessage(error);
  if (message === "UNAUTHENTICATED") return 401;
  if (message === "FORBIDDEN") return 403;
  return 500;
}

export function jsonError(error: unknown, fallback?: string) {
  const status = statusForError(error);
  const message =
    status === 500 ? errorMessage(error, fallback ?? "Unknown error") : errorMessage(error);
  return Response.json({ error: message }, { status });
}
