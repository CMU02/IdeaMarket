import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackList } from "../../navigations/MainStack";
import { getUnreadCount } from "../../lib/services/NotificationService";
import { supabase } from "../../lib/Supabase";

const BadgeContainer = styled(TouchableOpacity)`
  position: relative;
  padding: 8px;
`;

const Badge = styled(View)`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #ff3b30;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  padding: 0 6px;
`;

const BadgeText = styled(Text)`
  color: #ffffff;
  font-size: 12px;
  font-family: "Paperlogy-Bold";
`;

type NotificationNavigationProp = NativeStackNavigationProp<MainStackList>;

interface NotificationBadgeProps {
  color?: string;
  size?: number;
}

/**
 * 알림 배지 컴포넌트
 * Requirements: 4.3 - 읽지 않은 알림 수를 배지로 표시
 */
export default function NotificationBadge({
  color = "#ffffff",
  size = 24,
}: NotificationBadgeProps) {
  const navigation = useNavigation<NotificationNavigationProp>();
  const [unreadCount, setUnreadCount] = useState(0);

  // 읽지 않은 알림 수 조회
  const fetchUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  useEffect(() => {
    fetchUnreadCount();

    // Supabase Realtime 구독 - 실시간 알림 업데이트
    // Requirements: 4.1, 4.2 - 실시간 알림 업데이트
    const channel = supabase
      .channel("notifications-badge")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          // 알림 변경 시 카운트 다시 조회
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePress = () => {
    navigation.navigate("NotificationScreen");
  };

  return (
    <BadgeContainer onPress={handlePress}>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {unreadCount > 0 && (
        <Badge>
          <BadgeText>{unreadCount > 99 ? "99+" : unreadCount}</BadgeText>
        </Badge>
      )}
    </BadgeContainer>
  );
}
