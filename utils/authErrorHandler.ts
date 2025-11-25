import { AuthError } from "@supabase/supabase-js";

/**
 * Supabase Auth 에러를 사용자 친화적인 한글 메시지로 변환
 * @param error - Supabase AuthError 객체
 * @returns 사용자에게 표시할 한글 에러 메시지
 */
export const getAuthErrorMessage = (error: AuthError): string => {
  const errorMsg = error.message.toLowerCase();

  // 회원가입 관련 에러
  if (errorMsg.includes("user already registered")) {
    return "이미 가입된 이메일입니다.";
  }

  // 이메일 관련 에러
  if (errorMsg.includes("invalid email")) {
    return "유효하지 않은 이메일 주소입니다.";
  }

  if (errorMsg.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.";
  }

  if (errorMsg.includes("email provider")) {
    return "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }

  // 비밀번호 관련 에러
  if (errorMsg.includes("password") && errorMsg.includes("weak")) {
    return "비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.";
  }

  if (errorMsg.includes("password") && errorMsg.includes("short")) {
    return "비밀번호는 최소 6자 이상이어야 합니다.";
  }

  if (errorMsg.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  // Rate limit 에러
  if (errorMsg.includes("rate limit")) {
    return "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.";
  }

  // 회원가입 비활성화
  if (errorMsg.includes("signups not allowed")) {
    return "현재 회원가입이 비활성화되어 있습니다.";
  }

  // 세션 관련 에러
  if (errorMsg.includes("session not found")) {
    return "세션이 만료되었습니다. 다시 로그인해주세요.";
  }

  if (errorMsg.includes("refresh token")) {
    return "인증이 만료되었습니다. 다시 로그인해주세요.";
  }

  // 네트워크 에러
  if (errorMsg.includes("network")) {
    return "네트워크 연결을 확인해주세요.";
  }

  // 기본 에러 메시지
  return "인증 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
};

/**
 * 이메일 형식 유효성 검사
 * @param email - 검사할 이메일 주소
 * @returns 유효한 이메일이면 true, 아니면 false
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사
 * @param password - 검사할 비밀번호
 * @returns 유효성 검사 결과 객체
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "비밀번호는 최소 6자 이상이어야 합니다.",
    };
  }

  // 추가 비밀번호 강도 검사 (선택사항)
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return { isValid: true };
};
