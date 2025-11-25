-- 사용자 약관 동의 테이블
CREATE TABLE IF NOT EXISTS public.user_terms_agreement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreed BOOLEAN NOT NULL DEFAULT false,
  agreed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 사용자당 하나의 약관 동의 레코드만 존재하도록
CREATE UNIQUE INDEX IF NOT EXISTS user_terms_agreement_user_id_idx ON public.user_terms_agreement(user_id);

-- RLS 활성화
ALTER TABLE public.user_terms_agreement ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 약관 동의 정보만 조회 가능
CREATE POLICY "Users can view their own terms agreement"
  ON public.user_terms_agreement
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 약관 동의 정보만 삽입 가능
CREATE POLICY "Users can insert their own terms agreement"
  ON public.user_terms_agreement
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 약관 동의 정보만 업데이트 가능
CREATE POLICY "Users can update their own terms agreement"
  ON public.user_terms_agreement
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER set_updated_at_user_terms_agreement
  BEFORE UPDATE ON public.user_terms_agreement
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
