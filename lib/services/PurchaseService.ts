import { supabase } from "../Supabase";
import {
  PurchaseRequest,
  PurchaseRequestDetail,
  TablesInsert,
} from "../database.types";
import { IdeaDetail } from "./IdeaService";
import { createNotification } from "./NotificationService";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import {
  isValidUUID,
  verifyPurchaseRequestAccess,
  filterSensitiveData,
} from "../../utils/securityUtils";

// PurchaseRequestDetail 타입을 export
export type { PurchaseRequestDetail };

/**
 * 구매 요청 서비스
 * 아이디어 구매 요청 생성, 조회, 승인, 거절 등의 기능을 제공합니다.
 */

/**
 * 구매 요청 생성
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1
 *
 * @param ideaId 구매하려는 아이디어 ID
 * @returns 생성된 구매 요청 정보 또는 오류
 */
export async function createPurchaseRequest(
  ideaId: string
): Promise<{ success: boolean; data?: PurchaseRequest; error?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(ideaId)) {
      return { success: false, error: "유효하지 않은 아이디어 ID입니다." };
    }

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 아이디어 정보 조회
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("id, user_id, is_free, price")
      .eq("id", ideaId)
      .single();

    if (ideaError || !idea) {
      return { success: false, error: "아이디어를 찾을 수 없습니다." };
    }

    // 자신의 아이디어인지 확인 (Requirement 1.2)
    if (idea.user_id === user.id) {
      return { success: false, error: "자신의 아이디어는 구매할 수 없습니다." };
    }

    // 중복 구매 요청 확인 (Requirement 1.4)
    const { data: existingRequest } = await supabase
      .from("purchase_requests")
      .select("*")
      .eq("idea_id", ideaId)
      .eq("buyer_id", user.id)
      .single();

    if (existingRequest) {
      return {
        success: false,
        error: "이미 구매 요청한 아이디어입니다.",
        data: existingRequest,
      };
    }

    // 구매 요청 생성 (Requirement 1.3: 초기 상태 설정)
    const purchaseRequestData: TablesInsert<"purchase_requests"> = {
      idea_id: ideaId,
      buyer_id: user.id,
      seller_id: idea.user_id,
      status: idea.is_free ? "approved" : "pending", // Requirement 1.5: 무료 아이디어 즉시 승인
      payment_status: idea.is_free ? "paid" : "not_paid",
      payment_confirmed_at: null,
      approved_at: idea.is_free ? new Date().toISOString() : null,
      rejected_at: null,
    };

    const { data: purchaseRequest, error: createError } = await supabase
      .from("purchase_requests")
      .insert(purchaseRequestData)
      .select()
      .single();

    if (createError) {
      console.error("구매 요청 생성 오류:", createError);
      return {
        success: false,
        error: getFriendlyErrorMessage(createError),
      };
    }

    // 판매자에게 알림 전송 (Requirement 1.1, 4.1)
    const notificationTitle = idea.is_free
      ? "무료 아이디어 구매 완료"
      : "새로운 구매 요청";
    const notificationMessage = idea.is_free
      ? "무료 아이디어가 자동으로 승인되었습니다."
      : "새로운 구매 요청이 도착했습니다.";

    await createNotification(
      idea.user_id,
      idea.is_free ? "purchase_approved" : "purchase_request",
      notificationTitle,
      notificationMessage,
      purchaseRequest.id
    );

    // 무료 아이디어인 경우 구매자에게도 알림
    if (idea.is_free) {
      await createNotification(
        user.id,
        "purchase_approved",
        "구매 완료",
        "무료 아이디어가 자동으로 승인되었습니다.",
        purchaseRequest.id
      );
    }

    return { success: true, data: purchaseRequest };
  } catch (error) {
    console.error("구매 요청 생성 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 구매자의 구매 요청 목록 조회
 * Requirements: 2.1, 2.2, 2.3
 *
 * @returns 구매 요청 목록
 */
export async function getMyPurchaseRequests(): Promise<{
  data: PurchaseRequestDetail[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "로그인이 필요합니다." };
    }

    // 구매 요청 목록 조회 (최신 순 정렬 - Requirement 2.3)
    const { data: requests, error: requestsError } = await supabase
      .from("purchase_requests")
      .select(
        `
        *,
        idea:ideas(id, title, price, image_uris, is_free, short_description, created_at)
      `
      )
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("구매 요청 목록 조회 오류:", requestsError);
      return { data: [], error: getFriendlyErrorMessage(requestsError) };
    }

    // 구매자 정보 추가 및 민감한 데이터 필터링 (Requirement 8.2)
    const detailedRequests: PurchaseRequestDetail[] = (requests || []).map(
      (request: any) => {
        // 판매자 정보는 민감한 데이터 필터링 적용
        // auth.users 테이블은 직접 조인할 수 없으므로 ID만 사용
        const filteredSeller = filterSensitiveData(
          { id: request.seller_id, email: "" },
          user.id
        );

        // 원본 아이디어가 삭제된 경우 보존된 데이터 사용
        let ideaData = request.idea;
        if (!ideaData && request.idea_title) {
          ideaData = {
            id: request.idea_id || request.id,
            title: request.idea_title,
            price: request.idea_price,
            image_uris: request.idea_image_uris || [],
            is_free: request.idea_price === null || request.idea_price === 0,
            short_description: request.idea_short_description || "",
            created_at: request.idea_created_at || request.created_at,
          };
        }

        return {
          ...request,
          idea: ideaData,
          buyer: { id: user.id, email: user.email || "" },
          seller: filteredSeller,
        };
      }
    );

    return { data: detailedRequests };
  } catch (error) {
    console.error("구매 요청 목록 조회 오류:", error);
    return {
      data: [],
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 판매자의 구매 요청 수신 목록 조회
 * Requirements: 3.1, 3.2
 *
 * @returns 구매 요청 수신 목록
 */
export async function getReceivedPurchaseRequests(): Promise<{
  data: PurchaseRequestDetail[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "로그인이 필요합니다." };
    }

    // 구매 요청 수신 목록 조회 (최신 순 정렬)
    const { data: requests, error: requestsError } = await supabase
      .from("purchase_requests")
      .select(
        `
        *,
        idea:ideas(id, title, price, image_uris, is_free, short_description, created_at)
      `
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("구매 요청 수신 목록 조회 오류:", requestsError);
      return { data: [], error: getFriendlyErrorMessage(requestsError) };
    }

    // 판매자 정보 추가 및 민감한 데이터 필터링 (Requirement 8.2)
    const detailedRequests: PurchaseRequestDetail[] = (requests || []).map(
      (request: any) => {
        // 구매자 정보는 민감한 데이터 필터링 적용
        // auth.users 테이블은 직접 조인할 수 없으므로 ID만 사용
        const filteredBuyer = filterSensitiveData(
          { id: request.buyer_id, email: "" },
          user.id
        );

        // 원본 아이디어가 삭제된 경우 보존된 데이터 사용
        let ideaData = request.idea;
        if (!ideaData && request.idea_title) {
          ideaData = {
            id: request.idea_id || request.id,
            title: request.idea_title,
            price: request.idea_price,
            image_uris: request.idea_image_uris || [],
            is_free: request.idea_price === null || request.idea_price === 0,
            short_description: request.idea_short_description || "",
            created_at: request.idea_created_at || request.created_at,
          };
        }

        return {
          ...request,
          idea: ideaData,
          buyer: filteredBuyer,
          seller: { id: user.id, email: user.email || "" },
        };
      }
    );

    return { data: detailedRequests };
  } catch (error) {
    console.error("구매 요청 수신 목록 조회 오류:", error);
    return {
      data: [],
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 입금 상태 업데이트
 * Requirements: 7.1, 7.2, 8.1, 8.2
 *
 * @param requestId 구매 요청 ID
 * @returns 성공 여부
 */
export async function confirmPayment(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(requestId)) {
      return { success: false, error: "유효하지 않은 구매 요청 ID입니다." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 구매 요청 조회
    const { data: request, error: requestError } = await supabase
      .from("purchase_requests")
      .select("*, idea:ideas(user_id)")
      .eq("id", requestId)
      .eq("buyer_id", user.id)
      .single();

    if (requestError || !request) {
      return { success: false, error: "구매 요청을 찾을 수 없습니다." };
    }

    // 권한 확인 (Requirement 8.2)
    if (request.buyer_id !== user.id) {
      return { success: false, error: "권한이 없습니다." };
    }

    // 입금 상태 업데이트 (Requirement 7.2: 입금 완료 시간 기록)
    const { error: updateError } = await supabase
      .from("purchase_requests")
      .update({
        payment_status: "paid",
        payment_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("입금 상태 업데이트 오류:", updateError);
      return { success: false, error: getFriendlyErrorMessage(updateError) };
    }

    // 판매자에게 알림 전송 (Requirement 7.1)
    const sellerId = (request.idea as any).user_id;
    await createNotification(
      sellerId,
      "payment_confirmed",
      "입금 확인",
      "구매자가 입금을 완료했습니다.",
      requestId
    );

    return { success: true };
  } catch (error) {
    console.error("입금 상태 업데이트 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 구매 요청 승인
 * Requirements: 3.3, 3.4, 3.5, 4.2, 8.1, 8.2
 *
 * @param requestId 구매 요청 ID
 * @returns 성공 여부
 */
export async function approvePurchaseRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(requestId)) {
      return { success: false, error: "유효하지 않은 구매 요청 ID입니다." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 구매 요청 조회
    const { data: request, error: requestError } = await supabase
      .from("purchase_requests")
      .select("*")
      .eq("id", requestId)
      .eq("seller_id", user.id)
      .single();

    if (requestError || !request) {
      return { success: false, error: "구매 요청을 찾을 수 없습니다." };
    }

    // 권한 확인 (Requirement 8.2)
    if (request.seller_id !== user.id) {
      return { success: false, error: "권한이 없습니다." };
    }

    // 이미 처리된 요청인지 확인
    if (request.status !== "pending") {
      return { success: false, error: "이미 처리된 요청입니다." };
    }

    // 입금 확인 체크 (Requirement 3.3, 7.5)
    if (request.payment_status !== "paid") {
      return { success: false, error: "입금 확인 후 승인할 수 있습니다." };
    }

    // 구매 요청 승인 (Requirement 3.5)
    const { error: updateError } = await supabase
      .from("purchase_requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("구매 요청 승인 오류:", updateError);
      return { success: false, error: getFriendlyErrorMessage(updateError) };
    }

    // 구매자에게 알림 전송 (Requirement 4.2)
    await createNotification(
      request.buyer_id,
      "purchase_approved",
      "구매 승인",
      "구매 요청이 승인되었습니다.",
      requestId
    );

    return { success: true };
  } catch (error) {
    console.error("구매 요청 승인 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 구매 요청 거절
 * Requirements: 3.5, 4.2, 8.1, 8.2
 *
 * @param requestId 구매 요청 ID
 * @returns 성공 여부
 */
export async function rejectPurchaseRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // UUID 형식 검증 (Requirement 8.1)
    if (!isValidUUID(requestId)) {
      return { success: false, error: "유효하지 않은 구매 요청 ID입니다." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 구매 요청 조회
    const { data: request, error: requestError } = await supabase
      .from("purchase_requests")
      .select("*")
      .eq("id", requestId)
      .eq("seller_id", user.id)
      .single();

    if (requestError || !request) {
      return { success: false, error: "구매 요청을 찾을 수 없습니다." };
    }

    // 권한 확인 (Requirement 8.2)
    if (request.seller_id !== user.id) {
      return { success: false, error: "권한이 없습니다." };
    }

    // 이미 처리된 요청인지 확인
    if (request.status !== "pending") {
      return { success: false, error: "이미 처리된 요청입니다." };
    }

    // 구매 요청 거절
    const { error: updateError } = await supabase
      .from("purchase_requests")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("구매 요청 거절 오류:", updateError);
      return { success: false, error: getFriendlyErrorMessage(updateError) };
    }

    // 구매자에게 알림 전송 (Requirement 4.2)
    await createNotification(
      request.buyer_id,
      "purchase_rejected",
      "구매 거절",
      "구매 요청이 거절되었습니다.",
      requestId
    );

    return { success: true };
  } catch (error) {
    console.error("구매 요청 거절 오류:", error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}

/**
 * 특정 아이디어의 구매 요청 수 조회
 * Requirements: 6.1, 6.2
 *
 * @param ideaId 아이디어 ID
 * @returns 구매 요청 수 (pending 상태만)
 */
export async function getPurchaseRequestCount(ideaId: string): Promise<number> {
  try {
    // pending 상태의 구매 요청만 카운트 (Requirement 6.2)
    const { count, error } = await supabase
      .from("purchase_requests")
      .select("*", { count: "exact", head: true })
      .eq("idea_id", ideaId)
      .eq("status", "pending");

    if (error) {
      console.error("구매 요청 수 조회 오류:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("구매 요청 수 조회 오류:", error);
    return 0;
  }
}

/**
 * 사용자가 특정 아이디어에 구매 요청했는지 확인
 * Requirements: 1.4
 *
 * @param ideaId 아이디어 ID
 * @returns 구매 요청 여부 및 상태
 */
export async function hasPurchaseRequest(
  ideaId: string
): Promise<{ hasRequest: boolean; status?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { hasRequest: false };
    }

    const { data: request, error } = await supabase
      .from("purchase_requests")
      .select("status")
      .eq("idea_id", ideaId)
      .eq("buyer_id", user.id)
      .single();

    if (error || !request) {
      return { hasRequest: false };
    }

    return { hasRequest: true, status: request.status };
  } catch (error) {
    console.error("구매 요청 확인 오류:", error);
    return { hasRequest: false };
  }
}

/**
 * 구매 완료된 아이디어 목록 조회
 * Requirements: 5.2
 *
 * 원본 아이디어가 삭제되어도 구매 시점의 정보를 보존하여 표시
 *
 * @returns 구매한 아이디어 목록
 */
export async function getPurchasedIdeas(): Promise<{
  data: IdeaDetail[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "로그인이 필요합니다." };
    }

    // 승인된 구매 요청 조회 (Requirement 5.2)
    const { data: requests, error: requestsError } = await supabase
      .from("purchase_requests")
      .select(
        `
        *,
        idea:ideas(*)
      `
      )
      .eq("buyer_id", user.id)
      .eq("status", "approved")
      .order("approved_at", { ascending: false });

    if (requestsError) {
      console.error("구매한 아이디어 목록 조회 오류:", requestsError);
      return { data: [], error: requestsError.message };
    }

    // 아이디어 데이터 추출
    // 원본이 있으면 원본 사용, 없으면 보존된 데이터 사용
    const ideas: IdeaDetail[] = (requests || [])
      .map((request: any) => {
        // 원본 아이디어가 존재하는 경우
        if (request.idea) {
          return request.idea;
        }

        // 원본이 삭제된 경우, 보존된 데이터 사용
        if (request.idea_title && request.idea_content) {
          return {
            id: request.idea_id || request.id, // idea_id가 null이면 request id 사용
            title: request.idea_title,
            content: request.idea_content,
            short_description: request.idea_short_description || "",
            price: request.idea_price,
            is_free: request.idea_price === null || request.idea_price === 0,
            image_uris: request.idea_image_uris || [],
            user_id: request.seller_id,
            created_at: request.idea_created_at || request.created_at,
          };
        }

        return null;
      })
      .filter((idea: any) => idea !== null);

    return { data: ideas };
  } catch (error) {
    console.error("구매한 아이디어 목록 조회 오류:", error);
    return {
      data: [],
      error: getFriendlyErrorMessage(error),
    };
  }
}
