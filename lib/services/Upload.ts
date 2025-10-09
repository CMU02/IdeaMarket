import { supabase } from "../Supabase";
import { Database } from "../database.types";
import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";

type IdeaInsert = Database["public"]["Tables"]["ideas"]["Insert"];

interface UploadIdeaParams {
  title: string;
  shortDescription: string;
  isFree: boolean;
  price: string;
  content: string;
  tags: string[];
  imageUris: string[];
}

/**
 * 이미지를 Supabase Storage에 업로드하고 public URL을 반환
 */
async function uploadImage(
  base64Data: string,
  userId: string
): Promise<string> {
  // base64 문자열에서 MIME 타입 추출
  const mimeMatch = base64Data.match(/^data:image\/(\w+);base64,/);
  const fileExt = mimeMatch ? mimeMatch[1] : "jpg";

  // data:image/...;base64, prefix 제거
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, "");

  const filePath = `${userId}/${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;

  console.log("File extension:", fileExt);
  console.log("File path:", filePath);

  const { data, error } = await supabase.storage
    .from("idea-images")
    .upload(filePath, decode(base64String), {
      contentType: `image/${fileExt}`,
    });
  if (error) {
    console.error("이미지 업로드 오류: ", error.message);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("idea-images").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * 여러 이미지를 업로드하고 URL 배열 반환
 */
async function uploadImages(
  imageUris: string[],
  userId: string
): Promise<string[]> {
  if (imageUris.length === 0) return [];

  try {
    const uploadPromises = imageUris.map((uri) => uploadImage(uri, userId));
    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    throw error;
  }
}

/**
 * 아이디어를 데이터베이스에 저장
 */
export async function uploadIdea(
  params: UploadIdeaParams
): Promise<{ success: boolean; ideaId?: string; error?: string }> {
  try {
    // 현재 로그인한 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // 이미지 업로드
    let uploadedImageUrls: string[] = [];
    if (params.imageUris.length > 0) {
      uploadedImageUrls = await uploadImages(params.imageUris, user.id);
    }

    // 가격 처리
    const priceValue = params.isFree ? null : parseInt(params.price, 10);

    // 아이디어 데이터 준비
    const ideaData: IdeaInsert = {
      user_id: user.id,
      title: params.title,
      short_description: params.shortDescription,
      is_free: params.isFree,
      price: priceValue,
      content: params.content,
      tags: params.tags,
      image_uris: uploadedImageUrls,
    };

    // 데이터베이스에 저장
    const { data, error } = await supabase
      .from("ideas")
      .insert(ideaData)
      .select("id")
      .single();

    if (error) {
      console.error("아이디어 저장 오류:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      ideaId: data.id,
    };
  } catch (error) {
    console.error("아이디어 업로드 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 사용자의 아이디어 목록 조회
 */
export async function getUserIdeas(userId: string) {
  try {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("아이디어 조회 오류:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("아이디어 조회 실패:", error);
    throw error;
  }
}

/**
 * 모든 아이디어 조회 (홈 화면용)
 */
export async function getAllIdeas() {
  try {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("아이디어 조회 오류:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("아이디어 조회 실패:", error);
    throw error;
  }
}

/**
 * 아이디어 삭제
 */
export async function deleteIdea(ideaId: string) {
  try {
    const { error } = await supabase.from("ideas").delete().eq("id", ideaId);

    if (error) {
      console.error("아이디어 삭제 오류:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("아이디어 삭제 실패:", error);
    throw error;
  }
}
