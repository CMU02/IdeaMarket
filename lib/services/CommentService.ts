import { supabase } from "../Supabase";

export interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
}

/**
 * 아이디어의 댓글 목록 가져오기
 */
export async function getCommentsByIdeaId(ideaId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("댓글 조회 오류:", error);
    throw error;
  }

  return data || [];
}

/**
 * 댓글 작성
 */
export async function createComment(
  ideaId: string,
  content: string,
  parentCommentId?: string | null
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { error } = await supabase.from("comments").insert({
    idea_id: ideaId,
    user_id: user.id,
    content,
    parent_comment_id: parentCommentId || null,
  });

  if (error) {
    console.error("댓글 작성 오류:", error);
    throw error;
  }
}

/**
 * 댓글 작성자 이름 가져오기
 */
export async function getCommentAuthorName(userId: string): Promise<string> {
  try {
    // 현재 로그인한 사용자인 경우
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id === userId) {
      const displayName = user.user_metadata?.displayName;
      if (displayName) return displayName;

      const email = user.email || "";
      return email.split("@")[0];
    }

    // 다른 사용자의 경우 이메일 앞부분만 표시
    return "사용자";
  } catch (error) {
    console.error("댓글 작성자 정보 조회 오류:", error);
    return "사용자";
  }
}
