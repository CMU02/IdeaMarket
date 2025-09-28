import { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
import { supabase } from "../lib/Supabase";
import { AuthContext } from "../hooks/UseAuthContext";

// 인증 프로바이더 컴포넌트 - 앱 전체에 인증 상태를 제공
export default function AuthProiver({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>(); // 현재 세션 상태
  const [profile, setProfile] = useState<any>(); // 사용자 프로필 정보
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태

  // 세션을 한 번 가져오고, 인증 상태 변화를 구독
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);

      // 현재 세션 정보 가져오기
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session: ", error);
      }

      setSession(session);
      setIsLoading(false);
    };
    fetchSession();

    // 인증 상태 변화 감지 및 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed: ", { event: _event, session });
      setSession(session);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 세션이 변경될 때마다 프로필 정보 가져오기
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);

      if (session) {
        // 로그인된 사용자의 프로필 정보 조회
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      } else {
        // 로그아웃 시 프로필 정보 초기화
        setProfile(null);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [session]);

  // 인증 컨텍스트 값을 하위 컴포넌트들에게 제공
  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: session != undefined, // 세션이 존재하면 로그인 상태
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
