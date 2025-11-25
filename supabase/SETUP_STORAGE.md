# Supabase Storage 설정 가이드

## 오류 해결: Row Level Security Policy 위반

`[Error: new row violates row-level security policy]` 오류가 발생하는 경우, Storage 버킷의 RLS 정책을 설정해야 합니다.

## 설정 방법

### 방법 1: Supabase Dashboard 사용 (권장)

#### 1. Storage 버킷 Public 설정

1. Supabase Dashboard > Storage 접속
2. `idea-images` 버킷 선택
3. 설정(Settings) 클릭
4. "Public bucket" 옵션 활성화

#### 2. RLS 정책 설정

1. Supabase Dashboard > SQL Editor 접속
2. 아래 SQL 실행:

```sql
-- idea-images 버킷을 public으로 설정
UPDATE storage.buckets
SET public = true
WHERE name = 'idea-images';

-- Storage RLS 정책 설정

-- 1. 모든 사용자가 이미지를 조회할 수 있도록 (public 읽기)
CREATE POLICY "Public Access for idea-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'idea-images');

-- 2. 인증된 사용자만 이미지를 업로드할 수 있도록
CREATE POLICY "Authenticated users can upload idea-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'idea-images'
  AND auth.role() = 'authenticated'
);

-- 3. 사용자는 자신이 업로드한 이미지만 업데이트할 수 있도록
CREATE POLICY "Users can update their own idea-images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'idea-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'idea-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 사용자는 자신이 업로드한 이미지만 삭제할 수 있도록
CREATE POLICY "Users can delete their own idea-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'idea-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 방법 2: Supabase CLI 사용

```bash
# 프로젝트 링크 (처음 한 번만)
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

## 정책 설명

### 1. Public Access (SELECT)

- 모든 사용자가 업로드된 이미지를 조회할 수 있습니다.
- 아이디어 목록에서 이미지를 표시하기 위해 필요합니다.

### 2. Authenticated Upload (INSERT)

- 로그인한 사용자만 이미지를 업로드할 수 있습니다.
- 익명 사용자의 무분별한 업로드를 방지합니다.

### 3. Owner Update (UPDATE)

- 사용자는 자신이 업로드한 이미지만 수정할 수 있습니다.
- 폴더명이 user_id와 일치하는지 확인합니다.

### 4. Owner Delete (DELETE)

- 사용자는 자신이 업로드한 이미지만 삭제할 수 있습니다.
- 폴더명이 user_id와 일치하는지 확인합니다.

## 파일 구조

업로드된 이미지는 다음과 같은 구조로 저장됩니다:

```
idea-images/
  └── {user_id}/
      ├── {timestamp}_{random}.jpg
      ├── {timestamp}_{random}.png
      └── ...
```

이렇게 하면 각 사용자의 이미지가 user_id 폴더에 저장되어 관리가 용이합니다.

## 확인 방법

설정이 완료되면 다음 SQL로 정책을 확인할 수 있습니다:

```sql
-- Storage 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 버킷 설정 확인
SELECT * FROM storage.buckets WHERE name = 'idea-images';
```
