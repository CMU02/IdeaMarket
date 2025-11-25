import { supabase } from "../Supabase";
import {
  Notification,
  NotificationType,
  TablesInsert,
} from "../database.types";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import { isValidUUID, sanitizeInput } from "../../utils/securityUtils";

/**
 * 알림 서비스
 * 알림 생성, 조회, 읽음 처리 등의 기능을 제공합니다.
 */

/**
 * 알림 생성
 * Requirements: 4.1, 4.2, 8.1, 8.5
 *
 * @param userId 알림을 받을 사용자 ID
 * @param type 알림 타입
 * @param title 알림 제목
 * @param message 알림 메시지
 * @param relatedId 관련 ID (구매 요청 ID 등)
 * @returns 성공 여부
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(userId)) {
      return { success: false, error: "유효하지 않은 사용자 ID입니다." };
    }

    if (relatedId && !isValidUUID(relatedId)) {
      return { success: false, error: "유효하지 않은 관련 ID입니다." };
    }

    // XSS 방지를 위한 입력 값 검증 (Requirement 8.5)
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedMessage = sanitizeInput(message);

    const notificationData: TablesInsert<"notifications"> = {
      user_id: userId,
      type,
      title: sanitizedTitle,
      message: sanitizedMessage,
      related_id: relatedId,
    };

    const { error } = await supabase
      .from("notifications")
      .insert(notificationData);

    if (error) {
      console.error("알림 생성 오류:", error);
      return { success: false, error: getFriendlyErrorMessage(error) };
    }

    return { success: true };
  } catch (error) {
    console.error("알림 생성 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 사용자의 알림 목록 조회
 * Requirements: 4.4
 *
 * @returns 알림 목록 (최신 순 정렬)
 */
export async function getNotifications(): Promise<{
  data: Notification[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "로그인이 필요합니다." };
    }

    // 알림 목록 조회 (최신 순 정렬 - Requirement 4.4)
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (notificationsError) {
      console.error("알림 목록 조회 오류:", notificationsError);
      return { data: [], error: getFriendlyErrorMessage(notificationsError) };
    }

    return { data: notifications || [] };
  } catch (error) {
    console.error("알림 목록 조회 오류:", error);
    return {
      data: [],
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 읽지 않은 알림 수 조회
 * Requirements: 4.3
 *
 * @returns 읽지 않은 알림 수
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    // 읽지 않은 알림 수 조회 (Requirement 4.3)
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("읽지 않은 알림 수 조회 오류:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("읽지 않은 알림 수 조회 오류:", error);
    return 0;
  }
}

/**
 * 알림 읽음 처리
 * Requirements: 4.5, 8.1, 8.2
 *
 * @param notificationId 알림 ID
 * @returns 성공 여부
 */
export async function markAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(notificationId)) {
      return { success: false, error: "유효하지 않은 알림 ID입니다." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 알림 읽음 처리 (Requirement 4.5)
    // RLS 정책에 의해 자동으로 권한 체크됨 (Requirement 8.2)
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("알림 읽음 처리 오류:", updateError);
      return { success: false, error: getFriendlyErrorMessage(updateError) };
    }

    return { success: true };
  } catch (error) {
    console.error("알림 읽음 처리 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 모든 알림 읽음 처리
 * Requirements: 4.5
 *
 * @returns 성공 여부
 */
export async function markAllAsRead(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 모든 알림 읽음 처리 (Requirement 4.5)
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (updateError) {
      console.error("모든 알림 읽음 처리 오류:", updateError);
      return { success: false, error: getFriendlyErrorMessage(updateError) };
    }

    return { success: true };
  } catch (error) {
    console.error("모든 알림 읽음 처리 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}
