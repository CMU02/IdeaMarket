# 구현 작업 목록 (Implementation Plan)

- [x] 1. 데이터베이스 스키마 생성 및 RLS 정책 설정

  - Supabase 마이그레이션 파일 생성
  - purchase_requests 테이블 생성 (id, idea_id, buyer_id, seller_id, status, payment_status, 타임스탬프 필드)
  - notifications 테이블 생성 (id, user_id, type, title, message, related_id, is_read, created_at)
  - 인덱스 생성 (buyer_id, seller_id, idea_id, status, user_id+is_read)
  - UNIQUE 제약 조건 추가 (idea_id, buyer_id)
  - RLS 정책 적용 (구매자/판매자 권한 분리)
  - _Requirements: 1.1, 1.3, 8.1, 8.2, 8.4_

- [x] 2. TypeScript 타입 정의 및 데이터베이스 타입 업데이트

  - database.types.ts에 purchase_requests 및 notifications 테이블 타입 추가
  - PurchaseRequest, Notification, PurchaseRequestDetail 인터페이스 정의
  - Supabase 타입 생성 명령 실행하여 최신 타입 반영
  - _Requirements: 모든 요구사항_

- [x] 3. PurchaseService 구현

  - lib/services/PurchaseService.ts 파일 생성
  - createPurchaseRequest 메서드 구현 (자신의 아이디어 체크, 중복 체크, 무료 아이디어 즉시 승인)
  - getMyPurchaseRequests 메서드 구현 (구매자 관점)
  - getReceivedPurchaseRequests 메서드 구현 (판매자 관점)
  - confirmPayment 메서드 구현 (입금 상태 업데이트)
  - approvePurchaseRequest 메서드 구현 (승인 처리, 입금 확인 체크)
  - rejectPurchaseRequest 메서드 구현 (거절 처리)
  - getPurchaseRequestCount 메서드 구현 (pending 상태만 카운트)
  - hasPurchaseRequest 메서드 구현 (사용자의 구매 요청 여부 확인)
  - getPurchasedIdeas 메서드 구현 (승인된 구매 요청의 아이디어 목록)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.3, 8.4_

- [ ]\* 3.1 PurchaseService 속성 기반 테스트 작성

  - **Property 1: 구매 요청 생성 시 레코드 및 알림 생성**
  - **Validates: Requirements 1.1, 4.1**
  - **Property 2: 자신의 아이디어 구매 차단**
  - **Validates: Requirements 1.2**
  - **Property 3: 구매 요청 초기 상태**
  - **Validates: Requirements 1.3**
  - **Property 4: 중복 구매 요청 방지**
  - **Validates: Requirements 1.4, 8.4**
  - **Property 5: 무료 아이디어 즉시 승인**
  - **Validates: Requirements 1.5**

- [ ]\* 3.2 PurchaseService 속성 기반 테스트 작성 (조회 및 상태 관리)

  - **Property 6: 구매자의 구매 요청 목록 완전성**
  - **Validates: Requirements 2.1**
  - **Property 7: 구매 요청 목록 필수 필드 포함**
  - **Validates: Requirements 2.2, 3.2**
  - **Property 8: 구매 요청 목록 정렬 순서**
  - **Validates: Requirements 2.3**
  - **Property 11: 미입금 구매 요청 승인 차단**
  - **Validates: Requirements 3.3, 7.5**
  - **Property 12: 입금 완료 구매 요청 승인 가능**
  - **Validates: Requirements 3.4, 7.4**

- [ ]\* 3.3 PurchaseService 속성 기반 테스트 작성 (승인 및 입금)

  - **Property 13: 구매 요청 승인 시 상태 변경 및 알림**
  - **Validates: Requirements 3.5, 4.2**
  - **Property 21: 구매 요청 수 정확성**
  - **Validates: Requirements 6.1, 6.2**
  - **Property 22: 입금 확인 시 상태 변경 및 알림**
  - **Validates: Requirements 7.1**
  - **Property 23: 입금 확인 시간 기록**
  - **Validates: Requirements 7.2**
  - **Property 26: 상태 변경 시 타임스탬프 갱신**
  - **Validates: Requirements 8.3**

- [x] 4. NotificationService 구현

  - lib/services/NotificationService.ts 파일 생성
  - createNotification 메서드 구현 (알림 생성)
  - getNotifications 메서드 구현 (사용자의 알림 목록 조회, 최신 순 정렬)
  - getUnreadCount 메서드 구현 (읽지 않은 알림 수 조회)
  - markAsRead 메서드 구현 (알림 읽음 처리)
  - markAllAsRead 메서드 구현 (모든 알림 읽음 처리)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]\* 4.1 NotificationService 속성 기반 테스트 작성

  - **Property 14: 읽지 않은 알림 수 정확성**
  - **Validates: Requirements 4.3**
  - **Property 15: 알림 목록 정렬 순서**
  - **Validates: Requirements 4.4**
  - **Property 16: 알림 읽음 처리**
  - **Validates: Requirements 4.5**

- [x] 5. IdeaService 업데이트 (구매 완료 아이디어 필터링)

  - getIdeas 메서드에 구매 완료 아이디어 제외 로직 추가
  - 승인된 구매 요청이 있는 아이디어는 홈 화면에서 제외
  - 판매자와 구매자는 여전히 접근 가능하도록 권한 체크
  - _Requirements: 5.1, 5.4, 5.5_

- [ ]\* 5.1 IdeaService 속성 기반 테스트 작성

  - **Property 9: 승인된 구매 요청의 콘텐츠 접근**
  - **Validates: Requirements 2.5, 5.3**
  - **Property 17: 승인된 아이디어 홈 화면 제외**
  - **Validates: Requirements 5.1**
  - **Property 18: 구매한 아이디어 목록 완전성**
  - **Validates: Requirements 5.2**
  - **Property 19: 미구매자의 판매된 아이디어 접근 차단**
  - **Validates: Requirements 5.4**
  - **Property 20: 판매자의 자신의 아이디어 접근 유지**
  - **Validates: Requirements 5.5**

- [x] 6. Detail 화면 업데이트 (구매 요청 버튼 및 요청 수 표시)

  - 구매 요청 수 표시 UI 추가 (pending 상태만 카운트)
  - "구매하기" 버튼 상태 관리 (자신의 게시물, 이미 요청한 경우, 일반 상태)
  - 구매 요청 생성 로직 연동
  - PurchaseModal 컴포넌트 업데이트 (구매 요청 생성 API 호출)
  - _Requirements: 1.1, 1.2, 1.4, 6.1, 6.2_

- [x] 7. 프로필 화면 탭 추가 (구매 요청한 아이디어, 구매 요청 받은 아이디어)

  - MyIdeas 화면에 탭 네비게이션 추가
  - "내 게시물", "구매 요청한 아이디어", "구매 요청 받은 아이디어", "구매한 아이디어" 탭 구현
  - 각 탭별 데이터 조회 및 표시
  - _Requirements: 2.1, 3.1, 5.2_

- [x] 8. PurchaseRequestList 컴포넌트 구현

  - components/profile/PurchaseRequestList.tsx 파일 생성
  - 구매 요청 목록 표시 (아이디어 제목, 가격, 요청 날짜, 상태)
  - 구매자 관점 UI (승인 대기, 승인됨, 거절됨 상태 표시)
  - 판매자 관점 UI (구매자 정보, 입금 상태, 승인/취소 버튼)
  - 입금 상태에 따른 승인 버튼 활성화/비활성화
  - _Requirements: 2.2, 2.3, 3.2, 3.3, 3.4_

- [x] 9. PurchaseRequestDetail 화면 구현

  - screens/PurchaseRequestDetail.tsx 파일 생성
  - 구매 요청 상세 정보 표시
  - 구매자: 입금 완료 버튼, 요청 취소 버튼
  - 판매자: 승인 버튼, 거절 버튼 (입금 확인 후 활성화)
  - 상태 변경 로직 연동
  - _Requirements: 3.5, 7.1_

- [x] 10. 알림 시스템 UI 구현

  - NotificationBadge 컴포넌트 구현 (읽지 않은 알림 수 표시)
  - NotificationScreen 화면 구현 (알림 목록 표시)
  - 알림 타입별 아이콘 및 메시지 표시
  - 알림 클릭 시 관련 화면으로 이동
  - 실시간 알림 업데이트 (Supabase Realtime 구독)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. 네비게이션 업데이트

  - MainStack에 PurchaseRequestDetail, NotificationScreen 추가
  - 알림 아이콘을 헤더에 추가 (NotificationBadge 포함)
  - 네비게이션 타입 정의 업데이트
  - _Requirements: 4.4, 4.5_

- [x] 12. 실시간 업데이트 구현

  - Supabase Realtime을 사용한 구매 요청 실시간 구독
  - Supabase Realtime을 사용한 알림 실시간 구독
  - 구매 요청 생성/승인/거절 시 실시간 UI 업데이트
  - 알림 수신 시 배지 업데이트
  - _Requirements: 4.1, 4.2, 6.4_

- [ ]\* 12.1 실시간 업데이트 통합 테스트 작성

  - 구매 요청 생성 시 판매자 화면 실시간 업데이트 확인
  - 승인 시 구매자 화면 실시간 업데이트 확인
  - 알림 수신 시 배지 실시간 업데이트 확인

- [x] 13. 오류 처리 및 사용자 피드백 개선

  - 모든 API 호출에 대한 오류 처리 추가
  - 사용자 친화적인 오류 메시지 표시
  - 로딩 상태 표시 (ActivityIndicator)
  - 성공/실패 토스트 메시지 표시
  - _Requirements: 8.5_

- [ ]\* 13.1 오류 처리 단위 테스트 작성

  - 자신의 아이디어 구매 시도 오류 처리
  - 중복 구매 요청 오류 처리
  - 미입금 상태 승인 시도 오류 처리
  - 권한 없는 접근 오류 처리

- [x] 14. 접근 제어 및 보안 강화

  - RLS 정책 테스트 및 검증
  - 클라이언트 사이드 권한 체크 추가
  - 민감한 데이터 필터링 (다른 사용자의 개인정보 숨김)
  - _Requirements: 8.2, 8.5_

- [ ]\* 14.1 접근 제어 속성 기반 테스트 작성

  - **Property 10: 판매자의 구매 요청 수신 목록 완전성**
  - **Validates: Requirements 3.1**
  - **Property 24: 유효하지 않은 ID로 구매 요청 생성 차단**
  - **Validates: Requirements 8.1**
  - **Property 25: 다른 사용자의 구매 요청 접근 차단**
  - **Validates: Requirements 8.2**

- [ ] 15. 최종 체크포인트 - 모든 테스트 통과 확인
  - 모든 단위 테스트 실행 및 통과 확인
  - 모든 속성 기반 테스트 실행 및 통과 확인
  - 통합 테스트 실행 및 통과 확인
  - 사용자 시나리오 기반 수동 테스트
  - 성능 테스트 (대량 데이터 처리)
  - 보안 테스트 (권한 체크, RLS 정책)
  - 모든 테스트가 통과하면 사용자에게 질문하여 다음 단계 진행
