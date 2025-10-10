import { supabase } from "../Supabase";

/**
 * 약관 동의 정보 저장
 */
export async function saveTermsAgreement(userId: string): Promise<void> {
  const { error } = await supabase.from("user_terms_agreement").insert({
    user_id: userId,
    service_terms: true,
    privacy_policy: true,
    location_terms: true,
    marketing_consent: true,
    agreed_at: new Date().toISOString(),
  });

  if (error) {
    console.error("약관 동의 저장 오류:", error);
    throw error;
  }
}

/**
 * 사용자의 약관 동의 여부 확인
 */
export async function checkTermsAgreement(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_terms_agreement")
    .select("service_terms, privacy_policy, location_terms, marketing_consent")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("약관 동의 확인 오류:", error);
    return false;
  }

  // 모든 필수 약관에 동의했는지 확인
  return (
    (data?.service_terms &&
      data?.privacy_policy &&
      data?.location_terms &&
      data?.marketing_consent) ||
    false
  );
}

/**
 * 회원가입 (이메일 + 비밀번호)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { displayName?: string }
): Promise<{
  userId: string | null;
  error: string | null;
  session: any | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      return { userId: null, error: error.message, session: null };
    }

    if (!data.user) {
      return {
        userId: null,
        error: "회원가입에 실패했습니다.",
        session: null,
      };
    }

    // 이메일 자동 확인 처리 (SQL 직접 실행)
    if (data.user.id) {
      await supabase.rpc("confirm_user_email", { user_id: data.user.id });
    }

    return { userId: data.user.id, error: null, session: data.session };
  } catch (error) {
    console.error("회원가입 오류:", error);
    return {
      userId: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      session: null,
    };
  }
}

/**
 * 이메일 인증 코드 전송
 */
export async function sendEmailVerificationCode(
  email: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("인증 코드 전송 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 이메일 인증 코드 검증
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("인증 코드 검증 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
