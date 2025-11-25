/**
 * 오류 메시지 유틸리티
 * 사용자 친화적인 오류 메시지를 제공합니다.
 */

/**
 * Supabase 오류 코드를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: any): string {
  // 오류가 없는 경우
  if (!error) {
    return "알 수 없는 오류가 발생했습니다.";
  }

  // 문자열 오류인 경우
  if (typeof error === "string") {
    return error;
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    return error.message;
  }

  // Supabase 오류 코드 처리
  const code = error.code || error.error_code;
  const message = error.message || error.error_description;

  // 일반적인 Supabase 오류 코드
  switch (code) {
    case "PGRST116":
      return "데이터를 찾을 수 없습니다.";
    case "23505":
      return "이미 존재하는 데이터입니다.";
    case "23503":
      return "참조된 데이터가 존재하지 않습니다.";
    case "42501":
      return "접근 권한이 없습니다.";
    case "42P01":
      return "테이블을 찾을 수 없습니다.";
    case "22P02":
      return "잘못된 데이터 형식입니다.";
    case "23502":
      return "필수 항목이 누락되었습니다.";
    case "23514":
      return "데이터 제약 조건을 위반했습니다.";
    default:
      // 메시지가 있으면 반환
      if (message) {
        return message;
      }
      return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 네트워크 오류 확인
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const message = error.message || error.toString();
  return (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("connection")
  );
}

/**
 * 인증 오류 확인
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;

  const code = error.code || error.error_code;
  return (
    code === "42501" ||
    code === "PGRST301" ||
    code === "invalid_grant" ||
    code === "unauthorized"
  );
}

/**
 * 오류 타입에 따른 사용자 친화적 메시지 반환
 */
export function getFriendlyErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return "네트워크 연결을 확인해주세요.";
  }

  if (isAuthError(error)) {
    return "로그인이 필요하거나 권한이 없습니다.";
  }

  return getErrorMessage(error);
}
