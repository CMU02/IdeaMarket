import React from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { defaultColor } from "../../utils/Color";
import { PurchaseRequestDetail } from "../../lib/services/PurchaseService";
import {
  approvePurchaseRequest,
  rejectPurchaseRequest,
  confirmPayment,
} from "../../lib/services/PurchaseService";

// Styled Components
const Container = styled(View)`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ContentRow = styled(View)`
  flex-direction: row;
  gap: 12px;
`;

const ThumbnailContainer = styled(View)`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: #d9d9d9;
  overflow: hidden;
`;

const Thumbnail = styled(Image)`
  width: 100%;
  height: 100%;
`;

const InfoContainer = styled(View)`
  flex: 1;
`;

const Title = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  margin-bottom: 4px;
`;

const PriceText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  margin-bottom: 8px;
`;

const InfoText = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.6);
  margin-bottom: 4px;
`;

const StatusRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const StatusBadge = styled(View)<{ status: string }>`
  background-color: ${(props) => {
    switch (props.status) {
      case "approved":
        return "#4caf50";
      case "rejected":
        return "#f44336";
      case "pending":
        return "#ff9800";
      case "cancelled":
        return "#9e9e9e";
      default:
        return "#9e9e9e";
    }
  }};
  border-radius: 10px;
  padding: 4px 10px;
`;

const StatusText = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const PaymentBadge = styled(View)<{ paid: boolean }>`
  background-color: ${(props) => (props.paid ? "#2196f3" : "#ff9800")};
  border-radius: 10px;
  padding: 4px 10px;
`;

const PaymentText = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const ActionsContainer = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled(TouchableOpacity)<{
  variant?: "approve" | "reject" | "payment";
  disabled?: boolean;
}>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${(props) => {
    if (props.disabled) return "#cccccc";
    switch (props.variant) {
      case "approve":
        return "#4caf50";
      case "reject":
        return "#f44336";
      case "payment":
        return "#2196f3";
      default:
        return defaultColor.mainColor;
    }
  }};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const ActionButtonText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const Divider = styled(View)`
  height: 1px;
  background-color: rgba(9, 24, 42, 0.1);
  margin: 12px 0;
`;

// Props 인터페이스
interface PurchaseRequestListProps {
  requests: PurchaseRequestDetail[];
  type: "buyer" | "seller";
  onRefresh?: () => void;
  onRequestPress?: (requestId: string) => void;
}

/**
 * PurchaseRequestList 컴포넌트
 * 구매 요청 목록을 표시하는 컴포넌트
 * Requirements: 2.2, 2.3, 3.2, 3.3, 3.4
 */
export default function PurchaseRequestList({
  requests,
  type,
  onRefresh,
  onRequestPress,
}: PurchaseRequestListProps) {
  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "승인 대기";
      case "approved":
        return "승인됨";
      case "rejected":
        return "거절됨";
      case "cancelled":
        return "취소됨";
      default:
        return status;
    }
  };

  // 입금 상태 텍스트 변환
  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "not_paid":
        return "미입금";
      case "paid":
        return "입금 완료";
      default:
        return paymentStatus;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 입금 완료 처리 (구매자)
  const handleConfirmPayment = async (requestId: string) => {
    Alert.alert("입금 확인", "입금을 완료하셨습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          const result = await confirmPayment(requestId);
          if (result.success) {
            Alert.alert("완료", "입금 완료 처리되었습니다.");
            onRefresh?.();
          } else {
            Alert.alert("오류", result.error || "입금 확인에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 구매 요청 승인 (판매자)
  const handleApprove = async (requestId: string, ideaTitle: string) => {
    Alert.alert("승인 확인", `"${ideaTitle}"의 구매 요청을 승인하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "승인",
        onPress: async () => {
          const result = await approvePurchaseRequest(requestId);
          if (result.success) {
            Alert.alert("완료", "구매 요청이 승인되었습니다.");
            onRefresh?.();
          } else {
            Alert.alert("오류", result.error || "승인에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 구매 요청 거절 (판매자)
  const handleReject = async (requestId: string, ideaTitle: string) => {
    Alert.alert("거절 확인", `"${ideaTitle}"의 구매 요청을 거절하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "거절",
        style: "destructive",
        onPress: async () => {
          const result = await rejectPurchaseRequest(requestId);
          if (result.success) {
            Alert.alert("완료", "구매 요청이 거절되었습니다.");
            onRefresh?.();
          } else {
            Alert.alert("오류", result.error || "거절에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 구매자 관점 UI 렌더링
  const renderBuyerView = (request: PurchaseRequestDetail) => {
    const thumbnailUri = request.idea.image_uris?.[0];
    const isPending = request.status === "pending";
    const isNotPaid = request.payment_status === "not_paid";

    return (
      <Container
        key={request.id}
        as={TouchableOpacity}
        onPress={() => onRequestPress?.(request.id)}
      >
        <ContentRow>
          {thumbnailUri && (
            <ThumbnailContainer>
              <Thumbnail source={{ uri: thumbnailUri }} resizeMode="cover" />
            </ThumbnailContainer>
          )}
          <InfoContainer>
            <Title numberOfLines={2}>{request.idea.title}</Title>
            <PriceText>
              {request.idea.is_free
                ? "무료"
                : `${request.idea.price?.toLocaleString()}원`}
            </PriceText>
            <InfoText>요청 날짜: {formatDate(request.created_at)}</InfoText>
          </InfoContainer>
        </ContentRow>

        <StatusRow>
          <StatusBadge status={request.status}>
            <StatusText>{getStatusText(request.status)}</StatusText>
          </StatusBadge>
          {!request.idea.is_free && (
            <PaymentBadge paid={request.payment_status === "paid"}>
              <PaymentText>
                {getPaymentStatusText(request.payment_status)}
              </PaymentText>
            </PaymentBadge>
          )}
        </StatusRow>

        {/* 구매자 액션 버튼 */}
        {isPending && isNotPaid && !request.idea.is_free && (
          <ActionsContainer>
            <ActionButton
              variant="payment"
              onPress={() => handleConfirmPayment(request.id)}
            >
              <Ionicons name="card-outline" size={16} color="#ffffff" />
              <ActionButtonText>입금 완료</ActionButtonText>
            </ActionButton>
          </ActionsContainer>
        )}
      </Container>
    );
  };

  // 판매자 관점 UI 렌더링
  const renderSellerView = (request: PurchaseRequestDetail) => {
    const thumbnailUri = request.idea.image_uris?.[0];
    const isPending = request.status === "pending";
    const isPaid = request.payment_status === "paid";
    const canApprove = isPending && (isPaid || request.idea.is_free);

    return (
      <Container
        key={request.id}
        as={TouchableOpacity}
        onPress={() => onRequestPress?.(request.id)}
      >
        <ContentRow>
          {thumbnailUri && (
            <ThumbnailContainer>
              <Thumbnail source={{ uri: thumbnailUri }} resizeMode="cover" />
            </ThumbnailContainer>
          )}
          <InfoContainer>
            <Title numberOfLines={2}>{request.idea.title}</Title>
            <PriceText>
              {request.idea.is_free
                ? "무료"
                : `${request.idea.price?.toLocaleString()}원`}
            </PriceText>
            <InfoText>구매자: {request.buyer.email}</InfoText>
            <InfoText>요청 날짜: {formatDate(request.created_at)}</InfoText>
          </InfoContainer>
        </ContentRow>

        <Divider />

        <StatusRow>
          <StatusBadge status={request.status}>
            <StatusText>{getStatusText(request.status)}</StatusText>
          </StatusBadge>
          {!request.idea.is_free && (
            <PaymentBadge paid={request.payment_status === "paid"}>
              <PaymentText>
                {getPaymentStatusText(request.payment_status)}
              </PaymentText>
            </PaymentBadge>
          )}
        </StatusRow>

        {/* 판매자 액션 버튼 - Requirement 3.3, 3.4 */}
        {isPending && (
          <ActionsContainer>
            <ActionButton
              variant="approve"
              disabled={!canApprove}
              onPress={() =>
                canApprove && handleApprove(request.id, request.idea.title)
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#ffffff"
              />
              <ActionButtonText>승인</ActionButtonText>
            </ActionButton>
            <ActionButton
              variant="reject"
              onPress={() => handleReject(request.id, request.idea.title)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#ffffff" />
              <ActionButtonText>거절</ActionButtonText>
            </ActionButton>
          </ActionsContainer>
        )}

        {/* 입금 대기 안내 메시지 */}
        {isPending && !isPaid && !request.idea.is_free && (
          <InfoText style={{ marginTop: 8, fontStyle: "italic" }}>
            * 입금 확인 후 승인 버튼이 활성화됩니다.
          </InfoText>
        )}
      </Container>
    );
  };

  // 메인 렌더링
  return (
    <>
      {requests.map((request) =>
        type === "buyer" ? renderBuyerView(request) : renderSellerView(request)
      )}
    </>
  );
}
