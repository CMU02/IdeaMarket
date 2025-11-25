import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackList } from "../navigations/MainStack";
import { defaultColor } from "../utils/Color";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../lib/services/NotificationService";
import { Notification } from "../lib/database.types";
import { supabase } from "../lib/Supabase";
import { showErrorToast } from "../utils/toast";

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled(View)<{ paddingTop: number }>`
  background-color: ${defaultColor.textColor};
  padding: ${(props) => props.paddingTop}px 16px 16px 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const MarkAllButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const MarkAllText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-Medium";
  color: ${defaultColor.btnColor};
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const EmptyText = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.5);
  text-align: center;
`;

const NotificationItem = styled(TouchableOpacity)<{ isRead: boolean }>`
  flex-direction: row;
  padding: 16px;
  background-color: ${(props) => (props.isRead ? "#ffffff" : "#f8f9fa")};
  border-bottom-width: 1px;
  border-bottom-color: rgba(9, 24, 42, 0.1);
`;

const IconContainer = styled(View)<{ notificationType: string }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${(props) => {
    switch (props.notificationType) {
      case "purchase_request":
        return "#FFE006";
      case "payment_confirmed":
        return "#5BC0EB";
      case "purchase_approved":
        return "#4CAF50";
      case "purchase_rejected":
        return "#FF5252";
      default:
        return "#E0E0E0";
    }
  }};
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const NotificationContent = styled(View)`
  flex: 1;
`;

const NotificationTitle = styled(Text)<{ isRead: boolean }>`
  font-size: 16px;
  font-family: ${(props) =>
    props.isRead ? "Paperlogy-Medium" : "Paperlogy-SemiBold"};
  color: ${defaultColor.textColor};
  margin-bottom: 4px;
`;

const NotificationMessage = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-Regular";
  color: rgba(9, 24, 42, 0.7);
  margin-bottom: 4px;
`;

const NotificationTime = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-Regular";
  color: rgba(9, 24, 42, 0.5);
`;

const UnreadDot = styled(View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${defaultColor.btnColor};
  margin-left: 8px;
`;

type NotificationNavigationProp = NativeStackNavigationProp<MainStackList>;

/**
 * 알림 화면
 * Requirements: 4.4, 4.5 - 알림 목록 표시 및 읽음 처리
 */
export default function NotificationScreen() {
  const navigation = useNavigation<NotificationNavigationProp>();
  const { top } = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 알림 목록 조회
  const fetchNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.error) {
        console.error("알림 조회 오류:", result.error);
        showErrorToast("알림을 불러오는데 실패했습니다.");
      } else {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("fetchNotifications 예외:", error);
      showErrorToast("알림을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 화면 포커스 시 알림 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // 실시간 알림 업데이트 구독
  useEffect(() => {
    const channel = supabase
      .channel("notifications-screen")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          // 알림 변경 시 목록 다시 조회
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 알림 타입별 아이콘 반환
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "purchase_request":
        return "cart-outline";
      case "payment_confirmed":
        return "card-outline";
      case "purchase_approved":
        return "checkmark-circle-outline";
      case "purchase_rejected":
        return "close-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  // 알림 클릭 처리
  const handleNotificationPress = async (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    // Requirements: 4.5 - 알림 클릭 시 읽음 처리
    if (!notification.is_read) {
      await markAsRead(notification.id);
      // 로컬 상태 업데이트
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }

    // 관련 화면으로 이동
    // Requirements: 4.5 - 알림 클릭 시 관련 화면으로 이동
    if (notification.related_id) {
      if (
        notification.type === "purchase_request" ||
        notification.type === "payment_confirmed" ||
        notification.type === "purchase_approved" ||
        notification.type === "purchase_rejected"
      ) {
        navigation.navigate("PurchaseRequestDetail", {
          requestId: notification.related_id,
        });
      }
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } else {
      showErrorToast("알림 읽음 처리에 실패했습니다.");
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <Container>
        <Header paddingTop={top}>
          <HeaderLeft>
            <BackButton onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </BackButton>
            <HeaderTitle>알림</HeaderTitle>
          </HeaderLeft>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header paddingTop={top}>
        <HeaderLeft>
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </BackButton>
          <HeaderTitle>알림</HeaderTitle>
        </HeaderLeft>
        {notifications.some((n) => !n.is_read) && (
          <MarkAllButton onPress={handleMarkAllAsRead}>
            <MarkAllText>모두 읽음</MarkAllText>
          </MarkAllButton>
        )}
      </Header>

      {notifications.length === 0 ? (
        <EmptyContainer>
          <Ionicons
            name="notifications-outline"
            size={64}
            color="rgba(9, 24, 42, 0.3)"
          />
          <EmptyText>알림이 없습니다.</EmptyText>
        </EmptyContainer>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              isRead={item.is_read}
              onPress={() => handleNotificationPress(item)}
            >
              <IconContainer notificationType={item.type}>
                <Ionicons
                  name={getNotificationIcon(item.type)}
                  size={24}
                  color="#ffffff"
                />
              </IconContainer>
              <NotificationContent>
                <NotificationTitle isRead={item.is_read}>
                  {item.title}
                </NotificationTitle>
                <NotificationMessage>{item.message}</NotificationMessage>
                <NotificationTime>
                  {formatTime(item.created_at)}
                </NotificationTime>
              </NotificationContent>
              {!item.is_read && <UnreadDot />}
            </NotificationItem>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </Container>
  );
}
