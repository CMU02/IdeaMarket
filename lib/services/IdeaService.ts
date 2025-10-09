import { supabase } from "../Supabase";

export interface IdeaDetail {
  id: string;
  title: string;
  content: string;
  short_description: string;
  price: number | null;
  is_free: boolean;
  image_uris: string[];
  user_id: string;
  created_at: string;
}

/**
 * 아이디어 상세 정보 가져오기
 */
export async function getIdeaById(ideaId: string): Promise<IdeaDetail | null> {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .single();

  if (error) {
    console.error("아이디어 조회 오류:", error);
    throw error;
  }

  return data;
}

/**
 * 사용자 정보 가져오기 (이메일 또는 displayName)
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !data) {
      // admin API 사용 불가 시 auth.users 메타데이터 사용
      const { data: userData } = await supabase
        .from("user_terms_agreement")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (userData) {
        // 이메일에서 앞부분 추출
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user?.id === userId) {
          const email = authData.user.email || "";
          return email.split("@")[0];
        }
      }
      return "사용자";
    }

    // user_metadata에 displayName이 있으면 사용
    const displayName = data.user.user_metadata?.displayName;
    if (displayName) {
      return displayName;
    }

    // 없으면 이메일 앞부분 사용
    const email = data.user.email || "";
    return email.split("@")[0];
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return "사용자";
  }
}
