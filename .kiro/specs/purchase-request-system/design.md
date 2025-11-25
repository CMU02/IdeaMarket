# 설계 문서 (Design Document)

## 개요 (Overview)

구매 요청 시스템은 아이디어 마켓플레이스에서 구매자와 판매자 간의 거래를 중개하는 핵심 기능입니다. 이 시스템은 구매 요청 생성, 입금 확인, 승인 프로세스, 알림 전송, 그리고 구매 완료 후 콘텐츠 접근 제어를 포함합니다.

주요 기능:

- 구매 요청 생성 및 관리
- 입금 상태 추적
- 판매자의 승인/거절 처리
- 실시간 알림 시스템
- 구매 완료 후 콘텐츠 접근 제어
- 구매 요청 수 집계 및 표시

## 아키텍처 (Architecture)

### 시스템 구성 요소

```
┌─────────────────┐
│  React Native   │
│   Components    │
└────────┬────────┘
         │
┌────────▼────────┐
│   Services      │
│  - Purchase     │
│  - Notification │
└────────┬────────┘
         │
┌────────▼────────┐
│   Supabase      │
│  - Database     │
│  - Realtime     │
│  - RLS          │
└─────────────────┘
```

### 데이터 흐름

1. **구매 요청 생성 흐름**

   - 사용자가 "구매하기" 버튼 클릭
   - PurchaseService가 구매 요청 레코드 생성
   - NotificationService가 판매자에게 알림 전송
   - UI가 버튼 상태를 "요청 중"으로 업데이트

2. **입금 확인 흐름**

   - 구매자가 "입금 완료" 버튼 클릭
   - PurchaseService가 입금 상태 업데이트
   - NotificationService가 판매자에게 알림 전송
   - 판매자 UI에서 승인 버튼 활성화

3. **승인 처리 흐름**
   - 판매자가 "승인" 버튼 클릭
   - PurchaseService가 구매 요청 상태를 "approved"로 변경
   - 아이디어가 홈 화면에서 제외됨
   - NotificationService가 구매자에게 알림 전송
   - 구매자가 전체 콘텐츠에 접근 가능

## 컴포넌트 및 인터페이스 (Components and Interfaces)

### 1. 데이터베이스 스키마

#### purchase_requests 테이블

```sql
CREATE TABLE purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'not_paid' CHECK (payment_status IN ('not_paid', 'paid')),
  payment_confirmed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(idea_id, buyer_id)
);
```

#### notifications 테이블

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase_request', 'payment_confirmed', 'purchase_approved', 'purchase_rejected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 인덱스

```sql
CREATE INDEX idx_purchase_requests_buyer ON purchase_requests(buyer_id);
CREATE INDEX idx_purchase_requests_seller ON purchase_requests(seller_id);
CREATE INDEX idx_purchase_requests_idea ON purchase_requests(idea_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 2. TypeScript 인터페이스

```typescript
// PurchaseRequest 타입
export interface PurchaseRequest {
  id: string;
  idea_id: string;
  buyer_id: string;
  seller_id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  payment_status: "not_paid" | "paid";
  payment_confirmed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
}

// Notification 타입
export interface Notification {
  id: string;
  user_id: string;
  type:
    | "purchase_request"
    | "payment_confirmed"
    | "purchase_approved"
    | "purchase_rejected";
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

// 구매 요청 상세 정보 (조인된 데이터)
export interface PurchaseRequestDetail extends PurchaseRequest {
  idea: {
    id: string;
    title: string;
    price: number | null;
    image_uris: string[];
  };
  buyer: {
    id: string;
    email: string;
  };
  seller: {
    id: string;
    email: string;
  };
}
```

### 3. 서비스 레이어

#### PurchaseService

```typescript
export class PurchaseService {
  // 구매 요청 생성
  async createPurchaseRequest(
    ideaId: string
  ): Promise<{ success: boolean; data?: PurchaseRequest; error?: string }>;

  // 구매자의 구매 요청 목록 조회
  async getMyPurchaseRequests(): Promise<{
    data: PurchaseRequestDetail[];
    error?: string;
  }>;

  // 판매자의 구매 요청 수신 목록 조회
  async getReceivedPurchaseRequests(): Promise<{
    data: PurchaseRequestDetail[];
    error?: string;
  }>;

  // 입금 상태 업데이트
  async confirmPayment(
    requestId: string
  ): Promise<{ success: boolean; error?: string }>;

  // 구매 요청 승인
  async approvePurchaseRequest(
    requestId: string
  ): Promise<{ success: boolean; error?: string }>;

  // 구매 요청 거절
  async rejectPurchaseRequest(
    requestId: string
  ): Promise<{ success: boolean; error?: string }>;

  // 특정 아이디어의 구매 요청 수 조회
  async getPurchaseRequestCount(ideaId: string): Promise<number>;

  // 사용자가 특정 아이디어에 구매 요청했는지 확인
  async hasPurchaseRequest(
    ideaId: string
  ): Promise<{ hasRequest: boolean; status?: string }>;

  // 구매 완료된 아이디어 목록 조회
  async getPurchasedIdeas(): Promise<{ data: IdeaDetail[]; error?: string }>;
}
```

#### NotificationService

```typescript
export class NotificationService {
  // 알림 생성
  async createNotification(
    userId: string,
    type: Notification["type"],
    title: string,
    message: string,
    relatedId?: string
  ): Promise<{ success: boolean; error?: string }>;

  // 사용자의 알림 목록 조회
  async getNotifications(): Promise<{ data: Notification[]; error?: string }>;

  // 읽지 않은 알림 수 조회
  async getUnreadCount(): Promise<number>;

  // 알림 읽음 처리
  async markAsRead(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }>;

  // 모든 알림 읽음 처리
  async markAllAsRead(): Promise<{ success: boolean; error?: string }>;
}
```

### 4. React Native 컴포넌트

#### PurchaseRequestList

- 구매 요청 목록을 표시하는 컴포넌트
- Props: `type: 'sent' | 'received'`
- 구매자/판매자 관점에 따라 다른 UI 표시

#### NotificationBadge

- 알림 아이콘에 배지를 표시하는 컴포넌트
- 실시간으로 읽지 않은 알림 수 업데이트

#### NotificationScreen

- 알림 목록을 표시하는 화면
- 알림 타입별로 다른 아이콘 및 메시지 표시

#### PurchaseRequestButton

- 아이디어 상세 화면의 구매 요청 버튼
- 상태에 따라 다른 텍스트 및 동작 표시

## 데이터 모델 (Data Models)

### 구매 요청 상태 전이도

```
┌─────────┐
│ pending │ ──────────────┐
└────┬────┘               │
     │                    │
     │ approve            │ reject/cancel
     │                    │
┌────▼────┐          ┌────▼────┐
│approved │          │rejected │
└─────────┘          └─────────┘
                          │
                          │
                     ┌────▼────┐
                     │cancelled│
                     └─────────┘
```

### 입금 상태 전이도

```
┌──────────┐
│ not_paid │
└─────┬────┘
      │
      │ confirm payment
      │
┌─────▼────┐
│   paid   │
└──────────┘
```

### Row Level Security (RLS) 정책

#### purchase_requests 테이블

```sql
-- 구매자는 자신의 구매 요청만 조회 가능
CREATE POLICY "Users can view their own purchase requests"
ON purchase_requests FOR SELECT
USING (buyer_id = auth.uid());

-- 판매자는 자신의 아이디어에 대한 구매 요청 조회 가능
CREATE POLICY "Sellers can view purchase requests for their ideas"
ON purchase_requests FOR SELECT
USING (seller_id = auth.uid());

-- 구매자는 구매 요청 생성 가능
CREATE POLICY "Users can create purchase requests"
ON purchase_requests FOR INSERT
WITH CHECK (buyer_id = auth.uid());

-- 구매자는 자신의 구매 요청 업데이트 가능 (입금 확인)
CREATE POLICY "Buyers can update their purchase requests"
ON purchase_requests FOR UPDATE
USING (buyer_id = auth.uid());

-- 판매자는 자신의 아이디어에 대한 구매 요청 업데이트 가능 (승인/거절)
CREATE POLICY "Sellers can update purchase requests for their ideas"
ON purchase_requests FOR UPDATE
USING (seller_id = auth.uid());
```

#### notifications 테이블

```sql
-- 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- 시스템이 알림 생성 가능 (서비스 계정)
CREATE POLICY "Service can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- 사용자는 자신의 알림 업데이트 가능 (읽음 처리)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());
```

## 정확성 속성 (Correctness Properties)

_속성(Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 본질적으로 시스템이 무엇을 해야 하는지에 대한 형식적 진술입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다._

### Property 1: 구매 요청 생성 시 레코드 및 알림 생성

_모든_ 유효한 아이디어와 구매자에 대해, 구매 요청을 생성하면 데이터베이스에 구매 요청 레코드가 생성되고 판매자에게 알림이 전송되어야 합니다.
**Validates: Requirements 1.1, 4.1**

### Property 2: 자신의 아이디어 구매 차단

_모든_ 사용자와 그 사용자가 작성한 아이디어에 대해, 해당 사용자가 자신의 아이디어에 구매 요청을 생성하려고 시도하면 실패해야 합니다.
**Validates: Requirements 1.2**

### Property 3: 구매 요청 초기 상태

_모든_ 새로운 구매 요청에 대해, 생성 시 status는 "pending"이고 payment_status는 "not_paid"여야 합니다.
**Validates: Requirements 1.3**

### Property 4: 중복 구매 요청 방지

_모든_ 구매자와 아이디어 조합에 대해, 동일한 구매자가 동일한 아이디어에 대해 두 번째 구매 요청을 시도하면 실패하거나 기존 요청을 반환해야 합니다.
**Validates: Requirements 1.4, 8.4**

### Property 5: 무료 아이디어 즉시 승인

_모든_ 무료 아이디어(is_free = true)에 대해, 구매 요청 생성 시 status가 즉시 "approved"로 설정되어야 합니다.
**Validates: Requirements 1.5**

### Property 6: 구매자의 구매 요청 목록 완전성

_모든_ 구매자에 대해, 구매 요청 목록 조회 시 해당 구매자가 생성한 모든 구매 요청이 포함되어야 합니다.
**Validates: Requirements 2.1**

### Property 7: 구매 요청 목록 필수 필드 포함

_모든_ 구매 요청 목록 조회 결과에 대해, 각 항목은 아이디어 제목, 가격, 요청 날짜, 승인 상태를 포함해야 합니다.
**Validates: Requirements 2.2, 3.2**

### Property 8: 구매 요청 목록 정렬 순서

_모든_ 구매 요청 목록 조회 결과에 대해, 항목들은 created_at 필드 기준 내림차순으로 정렬되어야 합니다.
**Validates: Requirements 2.3**

### Property 9: 승인된 구매 요청의 콘텐츠 접근

_모든_ 승인된 구매 요청(status = "approved")에 대해, 구매자는 해당 아이디어의 전체 콘텐츠에 접근할 수 있어야 합니다.
**Validates: Requirements 2.5, 5.3**

### Property 10: 판매자의 구매 요청 수신 목록 완전성

_모든_ 판매자에 대해, 구매 요청 수신 목록 조회 시 해당 판매자의 아이디어에 대한 모든 구매 요청이 포함되어야 합니다.
**Validates: Requirements 3.1**

### Property 11: 미입금 구매 요청 승인 차단

_모든_ 입금이 완료되지 않은 구매 요청(payment_status = "not_paid")에 대해, 승인 시도는 실패해야 합니다.
**Validates: Requirements 3.3, 7.5**

### Property 12: 입금 완료 구매 요청 승인 가능

_모든_ 입금이 완료된 구매 요청(payment_status = "paid")에 대해, 판매자의 승인 시도는 성공해야 합니다.
**Validates: Requirements 3.4, 7.4**

### Property 13: 구매 요청 승인 시 상태 변경 및 알림

_모든_ 유효한 구매 요청에 대해, 승인 시 status가 "approved"로 변경되고 구매자에게 알림이 생성되어야 합니다.
**Validates: Requirements 3.5, 4.2**

### Property 14: 읽지 않은 알림 수 정확성

_모든_ 사용자에 대해, 읽지 않은 알림 수는 is_read = false인 알림의 개수와 정확히 일치해야 합니다.
**Validates: Requirements 4.3**

### Property 15: 알림 목록 정렬 순서

_모든_ 알림 목록 조회 결과에 대해, 항목들은 created_at 필드 기준 내림차순으로 정렬되어야 합니다.
**Validates: Requirements 4.4**

### Property 16: 알림 읽음 처리

_모든_ 읽지 않은 알림(is_read = false)에 대해, 읽음 처리 후 is_read가 true로 변경되어야 합니다.
**Validates: Requirements 4.5**

### Property 17: 승인된 아이디어 홈 화면 제외

_모든_ 승인된 구매 요청의 아이디어에 대해, 홈 화면 목록 조회 시 해당 아이디어가 포함되지 않아야 합니다.
**Validates: Requirements 5.1**

### Property 18: 구매한 아이디어 목록 완전성

_모든_ 구매자에 대해, 구매한 아이디어 목록 조회 시 status = "approved"인 모든 구매 요청의 아이디어가 포함되어야 합니다.
**Validates: Requirements 5.2**

### Property 19: 미구매자의 판매된 아이디어 접근 차단

_모든_ 판매된 아이디어와 구매하지 않은 사용자에 대해, 해당 사용자의 아이디어 콘텐츠 접근 시도는 차단되어야 합니다.
**Validates: Requirements 5.4**

### Property 20: 판매자의 자신의 아이디어 접근 유지

_모든_ 판매된 아이디어와 판매자에 대해, 판매자는 여전히 해당 아이디어의 전체 콘텐츠에 접근할 수 있어야 합니다.
**Validates: Requirements 5.5**

### Property 21: 구매 요청 수 정확성

_모든_ 아이디어에 대해, 구매 요청 수는 status = "pending"인 구매 요청의 개수와 정확히 일치해야 합니다.
**Validates: Requirements 6.1, 6.2**

### Property 22: 입금 확인 시 상태 변경 및 알림

_모든_ 유효한 구매 요청에 대해, 입금 확인 시 payment_status가 "paid"로 변경되고 판매자에게 알림이 생성되어야 합니다.
**Validates: Requirements 7.1**

### Property 23: 입금 확인 시간 기록

_모든_ 입금 확인에 대해, payment_confirmed_at 필드가 현재 시간으로 설정되어야 합니다.
**Validates: Requirements 7.2**

### Property 24: 유효하지 않은 ID로 구매 요청 생성 차단

_모든_ 유효하지 않은 구매자 ID, 판매자 ID, 또는 아이디어 ID에 대해, 구매 요청 생성 시도는 실패해야 합니다.
**Validates: Requirements 8.1**

### Property 25: 다른 사용자의 구매 요청 접근 차단

_모든_ 구매 요청과 해당 구매 요청의 구매자/판매자가 아닌 사용자에 대해, 해당 사용자의 구매 요청 데이터 접근 시도는 차단되어야 합니다.
**Validates: Requirements 8.2**

### Property 26: 상태 변경 시 타임스탬프 갱신

_모든_ 구매 요청 상태 변경에 대해, updated_at 필드가 현재 시간으로 갱신되어야 합니다.
**Validates: Requirements 8.3**

## 오류 처리 (Error Handling)

### 1. 구매 요청 생성 오류

- **자신의 아이디어 구매 시도**: "자신의 아이디어는 구매할 수 없습니다" 메시지 반환
- **중복 구매 요청**: "이미 구매 요청한 아이디어입니다" 메시지와 함께 기존 요청 정보 반환
- **존재하지 않는 아이디어**: "아이디어를 찾을 수 없습니다" 메시지 반환
- **인증되지 않은 사용자**: "로그인이 필요합니다" 메시지 반환

### 2. 구매 요청 승인/거절 오류

- **미입금 상태에서 승인 시도**: "입금 확인 후 승인할 수 있습니다" 메시지 반환
- **권한 없는 사용자의 승인 시도**: "권한이 없습니다" 메시지 반환
- **이미 처리된 요청**: "이미 처리된 요청입니다" 메시지 반환

### 3. 데이터 조회 오류

- **존재하지 않는 구매 요청**: "구매 요청을 찾을 수 없습니다" 메시지 반환
- **권한 없는 접근**: "접근 권한이 없습니다" 메시지 반환
- **네트워크 오류**: "네트워크 오류가 발생했습니다. 다시 시도해주세요" 메시지 반환

### 4. 알림 관련 오류

- **알림 생성 실패**: 로그 기록 후 무시 (사용자 경험에 영향 최소화)
- **알림 조회 실패**: 빈 배열 반환 및 오류 로그 기록

### 5. 트랜잭션 오류

- **데이터베이스 제약 조건 위반**: 자동 롤백 및 사용자 친화적 오류 메시지 반환
- **동시성 충돌**: 재시도 로직 적용 (최대 3회)

## 테스트 전략 (Testing Strategy)

### 1. 단위 테스트 (Unit Tests)

단위 테스트는 개별 함수와 메서드의 동작을 검증합니다:

- **PurchaseService 메서드 테스트**

  - `createPurchaseRequest`: 정상 케이스, 자신의 아이디어, 중복 요청
  - `confirmPayment`: 정상 케이스, 존재하지 않는 요청
  - `approvePurchaseRequest`: 정상 케이스, 미입금 상태, 권한 없음
  - `getPurchaseRequestCount`: 다양한 상태의 요청들

- **NotificationService 메서드 테스트**
  - `createNotification`: 정상 케이스, 유효하지 않은 사용자
  - `getUnreadCount`: 읽음/읽지 않음 알림 혼합
  - `markAsRead`: 정상 케이스, 이미 읽은 알림

### 2. 속성 기반 테스트 (Property-Based Tests)

속성 기반 테스트는 위에서 정의한 정확성 속성들을 검증합니다. TypeScript/JavaScript 환경에서는 **fast-check** 라이브러리를 사용합니다.

**테스트 설정**:

- 각 속성 테스트는 최소 100회 반복 실행
- 각 테스트는 설계 문서의 속성 번호를 명시적으로 참조
- 태그 형식: `**Feature: purchase-request-system, Property {number}: {property_text}**`

**생성기 (Generators) 전략**:

- `arbitraryUser()`: 랜덤한 사용자 ID 생성
- `arbitraryIdea()`: 랜덤한 아이디어 생성 (무료/유료, 다양한 가격)
- `arbitraryPurchaseRequest()`: 랜덤한 구매 요청 생성 (다양한 상태)
- `arbitraryNotification()`: 랜덤한 알림 생성 (읽음/읽지 않음)

**예시 속성 테스트**:

```typescript
// Property 3: 구매 요청 초기 상태
fc.assert(
  fc.asyncProperty(arbitraryIdea(), arbitraryUser(), async (idea, buyer) => {
    const result = await createPurchaseRequest(idea.id, buyer.id);
    expect(result.status).toBe("pending");
    expect(result.payment_status).toBe("not_paid");
  }),
  { numRuns: 100 }
);
```

### 3. 통합 테스트 (Integration Tests)

통합 테스트는 여러 컴포넌트 간의 상호작용을 검증합니다:

- **구매 요청 전체 플로우**

  1. 구매 요청 생성
  2. 판매자 알림 확인
  3. 입금 확인
  4. 승인 처리
  5. 구매자 알림 확인
  6. 콘텐츠 접근 권한 확인

- **RLS 정책 테스트**
  - 다른 사용자의 구매 요청 접근 시도
  - 판매자/구매자 권한 확인
  - 알림 접근 권한 확인

### 4. E2E 테스트 (End-to-End Tests)

E2E 테스트는 사용자 관점에서 전체 시나리오를 검증합니다:

- 구매자가 아이디어를 찾고 구매 요청하는 플로우
- 판매자가 구매 요청을 받고 승인하는 플로우
- 알림을 받고 확인하는 플로우

## 성능 고려사항 (Performance Considerations)

### 1. 데이터베이스 최적화

- 인덱스 활용: buyer_id, seller_id, idea_id, status에 인덱스 생성
- 복합 인덱스: (user_id, is_read)로 읽지 않은 알림 조회 최적화
- 페이지네이션: 목록 조회 시 limit/offset 또는 cursor 기반 페이지네이션 적용

### 2. 캐싱 전략

- 구매 요청 수: 아이디어별로 캐싱 (TTL: 5분)
- 읽지 않은 알림 수: 사용자별로 캐싱 (TTL: 1분)
- 실시간 업데이트 시 캐시 무효화

### 3. 실시간 업데이트

- Supabase Realtime을 활용한 구매 요청 및 알림 실시간 구독
- 구독 범위 최소화: 현재 화면에 필요한 데이터만 구독

### 4. 배치 처리

- 알림 생성: 여러 알림을 한 번에 생성하는 배치 API 제공
- 대량 데이터 조회: 필요한 필드만 선택하여 조회

## 보안 고려사항 (Security Considerations)

### 1. Row Level Security (RLS)

- 모든 테이블에 RLS 정책 적용
- 사용자는 자신의 데이터만 조회/수정 가능
- 판매자는 자신의 아이디어에 대한 구매 요청만 관리 가능

### 2. 입력 검증

- 모든 사용자 입력에 대한 서버 사이드 검증
- SQL 인젝션 방지: Supabase 클라이언트의 파라미터화된 쿼리 사용
- XSS 방지: 사용자 입력 이스케이프 처리

### 3. 인증 및 권한

- 모든 API 호출에 대한 인증 확인
- JWT 토큰 검증
- 권한 기반 접근 제어 (RBAC)

### 4. 데이터 무결성

- 외래 키 제약 조건으로 참조 무결성 보장
- UNIQUE 제약 조건으로 중복 구매 요청 방지
- CHECK 제약 조건으로 유효한 상태 값만 허용

## 배포 및 마이그레이션 (Deployment and Migration)

### 1. 데이터베이스 마이그레이션

- Supabase 마이그레이션 파일 생성
- 테이블 생성, 인덱스 생성, RLS 정책 적용을 단계별로 수행
- 롤백 스크립트 준비

### 2. 점진적 배포

- 기능 플래그를 사용한 단계적 배포
- A/B 테스트를 통한 사용자 반응 확인
- 모니터링 및 로깅 강화

### 3. 데이터 마이그레이션

- 기존 데이터가 있는 경우 마이그레이션 스크립트 작성
- 백업 및 복구 계획 수립
- 마이그레이션 전후 데이터 검증

## 모니터링 및 로깅 (Monitoring and Logging)

### 1. 주요 메트릭

- 구매 요청 생성 수 (시간별, 일별)
- 구매 요청 승인율
- 평균 승인 소요 시간
- 알림 전송 성공률

### 2. 로깅

- 모든 구매 요청 생성/승인/거절 이벤트 로깅
- 오류 발생 시 상세 정보 로깅
- 성능 이슈 추적을 위한 쿼리 실행 시간 로깅

### 3. 알림

- 오류율이 임계값을 초과하면 알림
- 성능 저하 감지 시 알림
- 비정상적인 패턴 감지 시 알림
