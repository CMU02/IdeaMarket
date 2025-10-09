-- 아이디어 테이블
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT true,
  price INTEGER,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_uris TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 무료일 경우 price는 null, 유료일 경우 price는 필수
  CONSTRAINT check_price_when_paid CHECK (
    (is_free = true AND price IS NULL) OR 
    (is_free = false AND price IS NOT NULL AND price > 0)
  )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS ideas_user_id_idx ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON public.ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS ideas_is_free_idx ON public.ideas(is_free);

-- RLS 활성화
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- 모든 사용자는 아이디어를 조회 가능
CREATE POLICY "Anyone can view ideas"
  ON public.ideas
  FOR SELECT
  USING (true);

-- 사용자는 자신의 아이디어만 삽입 가능
CREATE POLICY "Users can insert their own ideas"
  ON public.ideas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 아이디어만 업데이트 가능
CREATE POLICY "Users can update their own ideas"
  ON public.ideas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 아이디어만 삭제 가능
CREATE POLICY "Users can delete their own ideas"
  ON public.ideas
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER set_updated_at_ideas
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
