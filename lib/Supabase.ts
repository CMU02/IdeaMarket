import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

// 환경변수에서 Supabase URL과 익명 키를 가져옴 (없으면 기본값 사용)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "";

// AsyncStorage를 사용한 스토리지 어댑터 (세션 정보 저장용)
const ExpoSecureStoreAdater = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key); // 저장된 값 가져오기
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value); // 값 저장하기
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key); // 저장된 값 삭제하기
  },
};

// Supabase 클라이언트 생성 및 설정
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: ExpoSecureStoreAdater, // 커스텀 스토리지 어댑터 사용
    autoRefreshToken: true, // 토큰 자동 갱신
    persistSession: true, // 세션 지속성 유지
    detectSessionInUrl: false, // URL에서 세션 감지 비활성화 (모바일 앱용)
    lock: processLock,
  },
});
