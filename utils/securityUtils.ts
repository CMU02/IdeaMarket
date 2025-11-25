/**
 * 보안 유틸리티 함수
 * 민감한 데이터 필터링 및 권한 검증 관련 함수를 제공합니다.
 */

/**
 * 이메일 주소 마스킹
 * 예: user@example.com -> u***@example.com
 *
 * @param email 마스킹할 이메일 주소
 * @returns 마스킹된 이메일 주소
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) {
    return "***";
  }

  const [localPart, domain] = email.split("@");

  if (localPart.length <= 1) {
    return `${localPart}***@${domain}`;
  }

  // 첫 글자만 보이고 나머지는 ***로 마스킹
  const maskedLocalPart = `${localPart[0]}***`;

  return `${maskedLocalPart}@${domain}`;
}

/**
 * 사용자 ID 검증
 * 현재 로그인한 사용자의 ID와 비교하여 권한을 확인합니다.
 *
 * @param currentUserId 현재 로그인한 사용자 ID
 * @param targetUserId 대상 사용자 ID
 * @returns 권한 여부
 */
export function verifyUserAccess(
  currentUserId: string | undefined,
  targetUserId: string
): boolean {
  if (!currentUserId) {
    return false;
  }

  return currentUserId === targetUserId;
}

/**
 * 구매 요청 권한 검증
 * 구매자 또는 판매자인지 확인합니다.
 *
 * @param currentUserId 현재 로그인한 사용자 ID
 * @param buyerId 구매자 ID
 * @param sellerId 판매자 ID
 * @returns 권한 여부
 */
export function verifyPurchaseRequestAccess(
  currentUserId: string | undefined,
  buyerId: string,
  sellerId: string
): boolean {
  if (!currentUserId) {
    return false;
  }

  return currentUserId === buyerId || currentUserId === sellerId;
}

/**
 * 민감한 데이터 필터링
 * 다른 사용자의 개인정보를 마스킹합니다.
 *
 * @param data 필터링할 데이터
 * @param currentUserId 현재 로그인한 사용자 ID
 * @returns 필터링된 데이터
 */
export function filterSensitiveData<T extends { id: string; email?: string }>(
  data: T,
  currentUserId: string | undefined
): T {
  // 현재 사용자의 데이터인 경우 필터링하지 않음
  if (currentUserId && data.id === currentUserId) {
    return data;
  }

  // 다른 사용자의 이메일은 마스킹
  if (data.email) {
    return {
      ...data,
      email: maskEmail(data.email),
    };
  }

  return data;
}

/**
 * UUID 형식 검증
 *
 * @param id 검증할 ID
 * @returns UUID 형식 여부
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * 입력 값 검증 (XSS 방지)
 *
 * @param input 검증할 입력 값
 * @returns 안전한 입력 값
 */
export function sanitizeInput(input: string): string {
  if (!input) {
    return "";
  }

  // HTML 태그 제거
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
