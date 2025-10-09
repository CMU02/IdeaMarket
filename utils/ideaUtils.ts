import { supabase } from "../lib/Supabase";
import { IdeaCardData } from "../components/home/IdeaCard";

/**
 * 모든 아이디어를 가져오고 태그 목록을 추출
 */
export async function fetchIdeas(): Promise<{
  ideas: IdeaCardData[];
  categories: string[];
}> {
  const { data, error } = await supabase
    .from("ideas_with_stats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("아이디어 조회 오류:", error);
    throw error;
  }

  const formattedIdeas: IdeaCardData[] = data.map((idea) => ({
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

  // 모든 태그 추출 및 중복 제거
  const allTags = data.flatMap((idea) => idea.tags || []);
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
