# Supabase Database Schema

## 테이블 구조

### 1. user_terms_agreement (사용자 약관 동의)

사용자의 약관 동의 정보를 저장하는 테이블입니다.

**컬럼:**

- `id` (UUID): 기본 키
- `user_id` (UUID): 사용자 ID (auth.users 참조)
- `agreed` (BOOLEAN): 약관 동의 여부
- `agreed_at` (TIMESTAMPTZ): 약관 동의 시간
- `created_at` (TIMESTAMPTZ): 생성 시간
- `updated_at` (TIMESTAMPTZ): 수정 시간

**특징:**

- 사용자당 하나의 레코드만 존재 (UNIQUE INDEX)
- RLS 활성화: 사용자는 자신의 약관 동의 정보만 조회/수정 가능

### 2. ideas (아이디어)

사용자가 작성한 아이디어를 저장하는 테이블입니다.

**컬럼:**

- `id` (UUID): 기본 키
- `user_id` (UUID): 작성자 ID (auth.users 참조)
- `title` (TEXT): 아이디어 제목
- `short_description` (TEXT): 아이디어 간단 소개
- `is_free` (BOOLEAN): 무료/유료 여부
- `price` (INTEGER): 가격 (무료일 경우 NULL, 유료일 경우 필수)
- `content` (TEXT): 아이디어 소개글
- `tags` (TEXT[]): 태그 배열
- `image_uris` (TEXT[]): 이미지 URI 배열
- `created_at` (TIMESTAMPTZ): 생성 시간
- `updated_at` (TIMESTAMPTZ): 수정 시간

**제약 조건:**

- 무료일 경우 price는 NULL
- 유료일 경우 price는 필수이며 0보다 커야 함

**특징:**

- RLS 활성화
- 모든 사용자가 아이디어 조회 가능
- 작성자만 자신의 아이디어 수정/삭제 가능

## 마이그레이션 적용 방법

### Supabase CLI 사용:

```bash
# Supabase 프로젝트 링크
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

### Supabase Dashboard 사용:

1. Supabase Dashboard > SQL Editor 접속
2. 각 마이그레이션 파일의 내용을 복사하여 실행
3. 순서대로 실행:
   - `20250108000001_create_user_terms_agreement.sql`
   - `20250108000002_create_ideas.sql`

## TypeScript 타입 생성

```bash
supabase gen types typescript --project-id your-project-ref > lib/database.types.ts
```
