-- 구매 완료된 아이디어 보존 마이그레이션
-- Preserve Purchased Ideas Migration
-- 
-- 목적: 판매자가 아이디어를 삭제해도 구매자가 계속 볼 수 있도록 함
-- Purpose: Allow buyers to continue viewing ideas even after seller deletes them

-- ============================================
-- 1. purchase_requests 테이블에 아이디어 정보 컬럼 추가
-- ============================================
ALTER TABLE purchase_requests
ADD COLUMN IF NOT EXISTS idea_title TEXT,
ADD COLUMN IF NOT EXISTS idea_content TEXT,
ADD COLUMN IF NOT EXISTS idea_short_description TEXT,
ADD COLUMN IF NOT EXISTS idea_price INTEGER,
ADD COLUMN IF NOT EXISTS idea_image_uris TEXT[],
ADD COLUMN IF NOT EXISTS idea_created_at TIMESTAMPTZ;

-- ============================================
-- 2. 기존 외래 키 제약 조건 삭제
-- ============================================
ALTER TABLE purchase_requests
DROP CONSTRAINT IF EXISTS purchase_requests_idea_id_fkey;

-- ============================================
-- 3. 새로운 외래 키 제약 조건 추가 (ON DELETE SET NULL)
-- ============================================
ALTER TABLE purchase_requests
ADD CONSTRAINT purchase_requests_idea_id_fkey
FOREIGN KEY (idea_id)
REFERENCES ideas(id)
ON DELETE SET NULL;

-- ============================================
-- 4. 기존 데이터에 아이디어 정보 복사
-- ============================================
UPDATE purchase_requests pr
SET 
  idea_title = i.title,
  idea_content = i.content,
  idea_short_description = i.short_description,
  idea_price = i.price,
  idea_image_uris = i.image_uris,
  idea_created_at = i.created_at
FROM ideas i
WHERE pr.idea_id = i.id
  AND pr.idea_title IS NULL;

-- ============================================
-- 5. 구매 승인 시 아이디어 정보 자동 복사 트리거 함수
-- ============================================
CREATE OR REPLACE FUNCTION copy_idea_info_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 approved로 변경되고, 아이디어 정보가 아직 복사되지 않은 경우
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.idea_title IS NULL THEN
    -- 아이디어 정보 조회 및 복사
    SELECT 
      title,
      content,
      short_description,
      price,
      image_uris,
      created_at
    INTO 
      NEW.idea_title,
      NEW.idea_content,
      NEW.idea_short_description,
      NEW.idea_price,
      NEW.idea_image_uris,
      NEW.idea_created_at
    FROM ideas
    WHERE id = NEW.idea_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 트리거 생성
-- ============================================
DROP TRIGGER IF EXISTS copy_idea_info_on_approval_trigger ON purchase_requests;

CREATE TRIGGER copy_idea_info_on_approval_trigger
  BEFORE UPDATE ON purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION copy_idea_info_on_approval();

-- ============================================
-- 7. 코멘트 추가
-- ============================================
COMMENT ON COLUMN purchase_requests.idea_title IS '구매 시점의 아이디어 제목 (원본 삭제 시에도 보존)';
COMMENT ON COLUMN purchase_requests.idea_content IS '구매 시점의 아이디어 내용 (원본 삭제 시에도 보존)';
COMMENT ON COLUMN purchase_requests.idea_short_description IS '구매 시점의 아이디어 짧은 설명 (원본 삭제 시에도 보존)';
COMMENT ON COLUMN purchase_requests.idea_price IS '구매 시점의 아이디어 가격 (원본 삭제 시에도 보존)';
COMMENT ON COLUMN purchase_requests.idea_image_uris IS '구매 시점의 아이디어 이미지 (원본 삭제 시에도 보존)';
COMMENT ON COLUMN purchase_requests.idea_created_at IS '구매 시점의 아이디어 생성일 (원본 삭제 시에도 보존)';

