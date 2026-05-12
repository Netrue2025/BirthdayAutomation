export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {})
  };
}

export function deleted() {
  return {
    success: true,
    data: {
      deleted: true
    }
  };
}
