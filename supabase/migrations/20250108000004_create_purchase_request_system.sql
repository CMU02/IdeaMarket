-- 구매 요청 시스템 마이그레이션
-- Purchase Request System Migration

-- ============================================
-- 1. purchase_requests 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_requests (
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

-- ============================================
-- 2. notifications 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase_request', 'payment_confirmed', 'purchase_approved', 'purchase_rejected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. 인덱스 생성
-- ============================================
-- purchase_requests 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer ON purchase_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_seller ON purchase_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_idea ON purchase_requests(idea_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);

-- notifications 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 4. updated_at 자동 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_purchase_requests_updated_at
  BEFORE UPDATE ON purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RLS (Row Level Security) 활성화
-- ============================================
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. purchase_requests RLS 정책
-- ============================================

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
USING (buyer_id = auth.uid())
WITH CHECK (buyer_id = auth.uid());

-- 판매자는 자신의 아이디어에 대한 구매 요청 업데이트 가능 (승인/거절)
CREATE POLICY "Sellers can update purchase requests for their ideas"
ON purchase_requests FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- ============================================
-- 7. notifications RLS 정책
-- ============================================

-- 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- 시스템이 알림 생성 가능 (모든 인증된 사용자가 알림 생성 가능)
CREATE POLICY "Authenticated users can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 사용자는 자신의 알림 업데이트 가능 (읽음 처리)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 8. 코멘트 추가
-- ============================================
COMMENT ON TABLE purchase_requests IS '아이디어 구매 요청 테이블';
COMMENT ON TABLE notifications IS '사용자 알림 테이블';

COMMENT ON COLUMN purchase_requests.status IS '구매 요청 상태: pending, approved, rejected, cancelled';
COMMENT ON COLUMN purchase_requests.payment_status IS '입금 상태: not_paid, paid';
COMMENT ON COLUMN notifications.type IS '알림 타입: purchase_request, payment_confirmed, purchase_approved, purchase_rejected';
