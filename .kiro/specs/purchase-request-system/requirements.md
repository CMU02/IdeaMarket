# 요구사항 문서 (Requirements Document)

## 소개 (Introduction)

아이디어 마켓플레이스에서 사용자가 다른 사용자의 아이디어를 구매하고자 할 때, 구매 요청을 보내고 관리할 수 있는 시스템입니다. 이 시스템은 구매자와 판매자 간의 거래 프로세스를 관리하며, 입금 확인 및 승인 프로세스를 포함합니다.

## 용어 정의 (Glossary)

- **System**: 아이디어 구매 요청 시스템
- **User**: 애플리케이션을 사용하는 사용자
- **Buyer**: 아이디어 구매를 요청하는 사용자
- **Seller**: 아이디어를 판매하는 사용자 (게시글 작성자)
- **Purchase Request**: 구매자가 판매자에게 보내는 구매 의사 표시
- **Idea**: 사용자가 작성한 아이디어 게시물
- **Payment Status**: 입금 완료 여부 상태
- **Approval Status**: 판매자의 승인 여부 상태
- **Notification Badge**: 알림 아이콘에 표시되는 숫자 표시
- **Home Screen**: 아이디어 목록이 표시되는 메인 화면
- **Profile Screen**: 사용자의 프로필 및 게시물 관리 화면
- **Detail Screen**: 아이디어 상세 정보를 보여주는 화면
- **Notification Screen**: 알림 목록을 보여주는 화면

## 요구사항 (Requirements)

### 요구사항 1: 구매 요청 생성

**사용자 스토리:** 구매자로서, 원하는 아이디어에 대해 구매 요청을 보낼 수 있어야 하며, 판매자는 이를 알림으로 받을 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 구매자가 아이디어 상세 화면에서 "구매하기" 버튼을 클릭 THEN THE System SHALL 구매 요청 레코드를 생성하고 판매자에게 알림을 전송
2. WHEN 구매자가 자신이 작성한 아이디어를 조회 THEN THE System SHALL "구매하기" 버튼을 숨김 처리
3. WHEN 구매 요청이 생성 THEN THE System SHALL 구매 요청 상태를 "pending"으로 설정하고 입금 상태를 "not_paid"로 초기화
4. WHEN 구매자가 이미 구매 요청한 아이디어를 다시 조회 THEN THE System SHALL "구매하기" 버튼을 "요청 중" 상태로 표시
5. WHEN 무료 아이디어에 대해 구매 요청 THEN THE System SHALL 즉시 승인 상태로 처리하고 입금 확인 단계를 생략

### 요구사항 2: 구매 요청 목록 조회

**사용자 스토리:** 구매자로서, 내가 구매 요청한 아이디어 목록을 확인하고 각 요청의 상태를 파악할 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 구매자가 프로필 화면에서 "구매 요청한 아이디어" 탭을 선택 THEN THE System SHALL 해당 사용자가 구매 요청한 모든 아이디어 목록을 표시
2. WHEN 구매 요청 목록을 표시 THEN THE System SHALL 각 아이디어의 제목, 가격, 요청 날짜, 승인 상태를 포함
3. WHEN 구매 요청 목록을 표시 THEN THE System SHALL 최신 요청 순으로 정렬하여 표시
4. WHEN 구매자가 구매 요청 목록의 아이템을 클릭 THEN THE System SHALL 해당 아이디어의 상세 화면으로 이동
5. WHEN 승인된 구매 요청의 아이디어를 조회 THEN THE System SHALL 전체 콘텐츠를 표시

### 요구사항 3: 구매 요청 수신 목록 조회

**사용자 스토리:** 판매자로서, 내 아이디어에 대한 구매 요청 목록을 확인하고 각 요청을 관리할 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 판매자가 프로필 화면에서 "구매 요청 받은 아이디어" 탭을 선택 THEN THE System SHALL 해당 사용자의 아이디어에 대한 모든 구매 요청 목록을 표시
2. WHEN 구매 요청 수신 목록을 표시 THEN THE System SHALL 각 요청의 구매자 정보, 아이디어 제목, 요청 날짜, 입금 상태, 승인 상태를 포함
3. WHEN 입금이 완료되지 않은 구매 요청을 표시 THEN THE System SHALL 승인 버튼을 비활성화 상태로 표시
4. WHEN 입금이 완료된 구매 요청을 표시 THEN THE System SHALL 승인 및 취소 버튼을 활성화 상태로 표시
5. WHEN 판매자가 승인 버튼을 클릭 THEN THE System SHALL 구매 요청 상태를 "approved"로 변경하고 구매자에게 알림을 전송

### 요구사항 4: 알림 시스템

**사용자 스토리:** 사용자로서, 구매 요청 관련 이벤트가 발생하면 실시간으로 알림을 받을 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 새로운 구매 요청이 생성 THEN THE System SHALL 판매자에게 알림을 생성하고 알림 배지 카운트를 증가
2. WHEN 구매 요청이 승인 또는 거절 THEN THE System SHALL 구매자에게 알림을 생성하고 알림 배지 카운트를 증가
3. WHEN 사용자가 알림 아이콘을 조회 THEN THE System SHALL 읽지 않은 알림 개수를 배지로 표시
4. WHEN 사용자가 알림 화면을 열람 THEN THE System SHALL 모든 알림 목록을 최신 순으로 표시
5. WHEN 사용자가 알림 아이템을 클릭 THEN THE System SHALL 해당 알림을 읽음 처리하고 관련 화면으로 이동

### 요구사항 5: 구매 완료 후 아이디어 표시 제어

**사용자 스토리:** 사용자로서, 구매가 완료된 아이디어는 홈 화면에서 제외되고 구매자만 접근할 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 구매 요청이 승인 THEN THE System SHALL 해당 아이디어를 홈 화면 목록에서 제외
2. WHEN 구매자가 "구매한 아이디어" 목록을 조회 THEN THE System SHALL 승인된 모든 구매 요청의 아이디어를 표시
3. WHEN 구매자가 구매한 아이디어를 조회 THEN THE System SHALL 전체 콘텐츠에 대한 접근 권한을 부여
4. WHEN 구매하지 않은 사용자가 판매된 아이디어를 조회 시도 THEN THE System SHALL 접근을 차단하고 "판매 완료" 메시지를 표시
5. WHEN 판매자가 자신의 판매된 아이디어를 조회 THEN THE System SHALL 전체 콘텐츠에 대한 접근 권한을 유지

### 요구사항 6: 구매 요청 수 표시

**사용자 스토리:** 사용자로서, 아이디어 상세 화면에서 현재 몇 명이 구매 요청했는지 확인할 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 사용자가 아이디어 상세 화면을 조회 THEN THE System SHALL 해당 아이디어에 대한 총 구매 요청 수를 표시
2. WHEN 구매 요청 수를 표시 THEN THE System SHALL 승인 대기 중인 요청만 카운트
3. WHEN 구매 요청 수가 0 THEN THE System SHALL 구매 요청 수 표시를 숨김 처리
4. WHEN 새로운 구매 요청이 생성 THEN THE System SHALL 구매 요청 수를 실시간으로 업데이트
5. WHEN 구매 요청이 승인 또는 거절 THEN THE System SHALL 구매 요청 수를 감소

### 요구사항 7: 입금 상태 관리

**사용자 스토리:** 구매자로서, 입금 완료 상태를 업데이트할 수 있어야 하며, 판매자는 이를 확인할 수 있어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 구매자가 구매 요청 상세에서 "입금 완료" 버튼을 클릭 THEN THE System SHALL 입금 상태를 "paid"로 변경하고 판매자에게 알림을 전송
2. WHEN 입금 상태가 변경 THEN THE System SHALL 입금 완료 시간을 기록
3. WHEN 판매자가 구매 요청 목록을 조회 THEN THE System SHALL 각 요청의 입금 상태를 시각적으로 구분하여 표시
4. WHEN 입금 상태가 "paid" THEN THE System SHALL 판매자의 승인 버튼을 활성화
5. WHEN 입금 상태가 "not_paid" THEN THE System SHALL 판매자의 승인 버튼을 비활성화

### 요구사항 8: 데이터 무결성 및 보안

**사용자 스토리:** 시스템 관리자로서, 구매 요청 데이터의 무결성과 보안이 보장되어야 합니다.

#### 수락 기준 (Acceptance Criteria)

1. WHEN 구매 요청이 생성 THEN THE System SHALL 구매자 ID, 판매자 ID, 아이디어 ID의 유효성을 검증
2. WHEN 사용자가 다른 사용자의 구매 요청 데이터에 접근 시도 THEN THE System SHALL 접근을 차단하고 권한 오류를 반환
3. WHEN 구매 요청 상태가 변경 THEN THE System SHALL 변경 이력을 타임스탬프와 함께 기록
4. WHEN 동일한 구매자가 동일한 아이디어에 중복 구매 요청 시도 THEN THE System SHALL 중복 요청을 차단하고 기존 요청 정보를 반환
5. WHEN 데이터베이스 트랜잭션이 실패 THEN THE System SHALL 롤백을 수행하고 사용자에게 오류 메시지를 표시
