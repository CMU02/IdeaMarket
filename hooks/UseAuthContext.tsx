import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

// 인증 관련 데이터 타입 정의
export type AuthData = {
  session?: Session | null; // Supabase 세션 정보
  profile?: any | null; // 사용자 프로필 정보
  isLoading: boolean; // 로딩 상태
  isLoggedIn: boolean; // 로그인 여부
};

// 인증 컨텍스트 생성 (기본값 설정)
export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
});

// 인증 컨텍스트를 사용하기 위한 커스텀 훅
export const useAuthContext = () => useContext(AuthContext);
