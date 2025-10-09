import { supabase } from "../Supabase";

/**
 * 약관 동의 정보 저장
 */
export async function saveTermsAgreement(userId: string): Promise<void> {
  const { error } = await supabase.from("user_terms_agreement").insert({
    user_id: userId,
    agreed: true,
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
    .select("agreed")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("약관 동의 확인 오류:", error);
    return false;
  }

  return data?.agreed || false;
}

/**
 * 회원가입 (이메일 + 비밀번호)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { displayName?: string }
): Promise<{ userId: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { userId: null, error: error.message };
    }

    if (!data.user) {
      return { userId: null, error: "회원가입에 실패했습니다." };
    }

    return { userId: data.user.id, error: null };
  } catch (error) {
    console.error("회원가입 오류:", error);
    return {
      userId: null,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
