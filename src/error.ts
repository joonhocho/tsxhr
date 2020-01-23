export const getError = (
  xhr: XMLHttpRequest,
  fallbackMessage: string,
  maybeError?: unknown
): Error => {
  if (maybeError instanceof Error) {
    return maybeError;
  }

  const { status, statusText, responseText } = xhr;

  return new Error(
    `${status || 0} ${statusText || ''}: ${responseText || fallbackMessage}`
  );
};
