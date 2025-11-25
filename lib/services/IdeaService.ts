import { supabase } from "../Supabase";
import { isValidUUID } from "../../utils/securityUtils";

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
 * Requirements: 8.1
 */
export async function getIdeaById(ideaId: string): Promise<IdeaDetail | null> {
  // UUID 형식 검증 (Requirement 8.1)
  if (!isValidUUID(ideaId)) {
    throw new Error("유효하지 않은 아이디어 ID입니다.");
  }

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

/**
 * 현재 사용자의 게시물 가져오기
 */
export async function getMyIdeas(
  limit?: number
): Promise<{ data: IdeaDetail[]; error: string | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "로그인이 필요합니다." };
    }

    let query = supabase
      .from("ideas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("내 게시물 조회 오류:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("내 게시물 조회 오류:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 아이디어 삭제
 * Requirements: 8.1
 */
export async function deleteIdea(
  ideaId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(ideaId)) {
      return { success: false, error: "유효하지 않은 아이디어 ID입니다." };
    }

    const { error } = await supabase.from("ideas").delete().eq("id", ideaId);

    if (error) {
      console.error("아이디어 삭제 오류:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("아이디어 삭제 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 아이디어 수정
 * Requirements: 8.1
 */
export async function updateIdea(
  ideaId: string,
  updates: Partial<IdeaDetail>
): Promise<{ success: boolean; error: string | null }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(ideaId)) {
      return { success: false, error: "유효하지 않은 아이디어 ID입니다." };
    }

    const { error } = await supabase
      .from("ideas")
      .update(updates)
      .eq("id", ideaId);

    if (error) {
      console.error("아이디어 수정 오류:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("아이디어 수정 오류:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 모든 아이디어 가져오기 (홈 화면용)
 * 승인된 구매 요청이 있는 아이디어는 제외
 * (단, 판매자와 구매자는 여전히 접근 가능)
 */
export async function getIdeas(
  limit?: number
): Promise<{ data: IdeaDetail[]; error: string | null }> {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    // 모든 아이디어 조회
    let query = supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("아이디어 조회 오류:", error);
      return { data: [], error: error.message };
    }

    // 승인된 구매 요청이 있는 아이디어 ID 목록 조회
    const { data: approvedRequests, error: requestError } = await supabase
      .from("purchase_requests")
      .select("idea_id, buyer_id, seller_id")
      .eq("status", "approved");

    if (requestError) {
      console.error("구매 요청 조회 오류:", requestError);
      // 오류가 발생해도 계속 진행 (구매 요청 테이블이 없을 수 있음)
    }

    // 승인된 아이디어 중 현재 사용자가 판매자나 구매자가 아닌 아이디어 ID 집합
    const excludedIdeaIds = new Set<string>();
    if (approvedRequests && currentUserId) {
      approvedRequests.forEach((request) => {
        // 현재 사용자가 판매자도 아니고 구매자도 아닌 경우에만 제외
        if (
          request.buyer_id !== currentUserId &&
          request.seller_id !== currentUserId
        ) {
          excludedIdeaIds.add(request.idea_id);
        }
      });
    } else if (approvedRequests && !currentUserId) {
      // 로그인하지 않은 경우 모든 승인된 아이디어 제외
      approvedRequests.forEach((request) => {
        excludedIdeaIds.add(request.idea_id);
      });
    }

    // 제외할 아이디어를 필터링
    const filteredData = data.filter((idea) => !excludedIdeaIds.has(idea.id));

    return { data: filteredData || [], error: null };
  } catch (error) {
    console.error("아이디어 조회 오류:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 아이디어 접근 권한 확인
 * 승인된 구매 요청이 있는 아이디어의 경우, 판매자와 구매자만 접근 가능
 * Requirements: 5.4, 5.5, 8.1, 8.2
 */
export async function checkIdeaAccess(
  ideaId: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(ideaId)) {
      return { hasAccess: false, reason: "유효하지 않은 아이디어 ID입니다." };
    }

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { hasAccess: false, reason: "로그인이 필요합니다." };
    }

    // 아이디어 정보 조회
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("user_id")
      .eq("id", ideaId)
      .single();

    if (ideaError || !idea) {
      return { hasAccess: false, reason: "아이디어를 찾을 수 없습니다." };
    }

    // 판매자(작성자)인 경우 항상 접근 가능
    if (idea.user_id === user.id) {
      return { hasAccess: true };
    }

    // 승인된 구매 요청 확인
    const { data: approvedRequest, error: requestError } = await supabase
      .from("purchase_requests")
      .select("buyer_id")
      .eq("idea_id", ideaId)
      .eq("status", "approved")
      .maybeSingle();

    if (requestError) {
      console.error("구매 요청 조회 오류:", requestError);
      // 오류가 발생하면 일단 접근 허용 (구매 요청 테이블이 없을 수 있음)
      return { hasAccess: true };
    }

    // 승인된 구매 요청이 있는 경우
    if (approvedRequest) {
      // 구매자인 경우 접근 가능
      if (approvedRequest.buyer_id === user.id) {
        return { hasAccess: true };
      }
      // 구매자도 판매자도 아닌 경우 접근 불가
      return { hasAccess: false, reason: "판매 완료된 아이디어입니다." };
    }

    // 승인된 구매 요청이 없는 경우 모두 접근 가능
    return { hasAccess: true };
  } catch (error) {
    console.error("아이디어 접근 권한 확인 오류:", error);
    // 오류가 발생하면 일단 접근 허용
    return { hasAccess: true };
  }
}
