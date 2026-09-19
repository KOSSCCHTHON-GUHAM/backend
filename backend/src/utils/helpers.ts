/**
 * 날짜 포맷 유틸리티
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * 에러 메시지 추출 유틸리티
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

/**
 * 비동기 함수 래퍼 (에러 핸들링 포함)
 */
export const asyncWrapper = <T>(
  fn: () => Promise<T>,
): Promise<[T | null, Error | null]> => {
  return fn()
    .then((data) => [data, null] as [T, null])
    .catch((err) => [null, err instanceof Error ? err : new Error(String(err))] as [null, Error]);
};
