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
