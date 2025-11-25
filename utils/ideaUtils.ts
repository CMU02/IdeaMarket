import { supabase } from "../lib/Supabase";
import { IdeaCardData } from "../components/home/IdeaCard";

/**
 * 모든 아이디어를 가져오고 태그 목록을 추출
 * 승인된 구매 요청이 있는 아이디어는 홈 화면에서 제외
 * (단, 판매자와 구매자는 여전히 접근 가능)
 */
export async function fetchIdeas(): Promise<{
  ideas: IdeaCardData[];
  categories: string[];
}> {
  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // 모든 아이디어 조회
  const { data, error } = await supabase
    .from("ideas_with_stats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("아이디어 조회 오류:", error);
    throw error;
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

  const formattedIdeas: IdeaCardData[] = filteredData.map((idea) => ({
    id: idea.id,
    title: idea.title,
    description: idea.short_description,
    price: idea.is_free ? "무료" : `${idea.price?.toLocaleString()}원`,
    status: "모집중",
    comments: idea.comment_count || 0,
    likes: 0,
    tags: idea.tags || [],
    imageUrls: idea.image_uris || [],
  }));

  // 모든 태그 추출 및 중복 제거 (필터링된 데이터 기준)
  const allTags = filteredData.flatMap((idea) => idea.tags || []);
  const uniqueTags = Array.from(new Set(allTags));
  const categories = ["전체", ...uniqueTags];

  return {
    ideas: formattedIdeas,
    categories,
  };
}

/**
 * 태그로 아이디어 필터링
 */
export function filterIdeasByTag(
  allIdeas: IdeaCardData[],
  tag: string
): IdeaCardData[] {
  if (tag === "전체") {
    return allIdeas;
  }

  return allIdeas.filter((idea) => idea.tags && idea.tags.includes(tag));
}
