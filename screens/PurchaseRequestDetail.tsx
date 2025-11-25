import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackList } from "../navigations/MainStack";
import { defaultColor } from "../utils/Color";
import {
  PurchaseRequestDetail as PurchaseRequestDetailType,
  confirmPayment,
  approvePurchaseRequest,
  rejectPurchaseRequest,
} from "../lib/services/PurchaseService";
import { supabase } from "../lib/Supabase";
import { showSuccessToast, showErrorToast } from "../utils/toast";

// Styled Components
const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled(View)<{ paddingTop: number }>`
  background-color: ${defaultColor.textColor};
  padding: ${(props) => props.paddingTop}px 16px 16px 16px;
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

const Content = styled(ScrollView)`
  flex: 1;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Section = styled(View)`
  padding: 20px 16px;
  background-color: #ffffff;
`;

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  margin-bottom: 16px;
`;

const IdeaContainer = styled(View)`
  flex-direction: row;
  gap: 12px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const ThumbnailContainer = styled(View)`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background-color: #d9d9d9;
  overflow: hidden;
`;

const Thumbnail = styled(Image)`
  width: 100%;
  height: 100%;
`;

const IdeaInfo = styled(View)`
  flex: 1;
`;

const IdeaTitle = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  margin-bottom: 8px;
`;

const IdeaPrice = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const InfoRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom-width: 1px;
  border-bottom-color: rgba(9, 24, 42, 0.1);
`;

const InfoLabel = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.6);
`;

const InfoValue = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
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
  padding: 6px 12px;
`;

const StatusText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const PaymentBadge = styled(View)<{ paid: boolean }>`
  background-color: ${(props) => (props.paid ? "#2196f3" : "#ff9800")};
  border-radius: 10px;
  padding: 6px 12px;
`;

const PaymentText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const Divider = styled(View)`
  height: 1px;
  background-color: rgba(9, 24, 42, 0.1);
  margin: 20px 0;
`;

const ActionsContainer = styled(View)`
  padding: 16px;
  background-color: #ffffff;
  border-top-width: 1px;
  border-top-color: rgba(9, 24, 42, 0.1);
`;

const ActionButton = styled(TouchableOpacity)<{
  variant?: "primary" | "danger" | "secondary";
  disabled?: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: ${(props) => {
    if (props.disabled) return "#cccccc";
    switch (props.variant) {
      case "primary":
        return "#4caf50";
      case "danger":
        return "#f44336";
      case "secondary":
        return "#2196f3";
      default:
        return defaultColor.mainColor;
    }
  }};
  margin-bottom: 12px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const ActionButtonText = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const InfoText = styled(Text)`
  font-size: 13px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.6);
  text-align: center;
  margin-top: 8px;
  font-style: italic;
`;

// 타입 정의
type PurchaseRequestDetailRouteProp = RouteProp<
  MainStackList,
  "PurchaseRequestDetail"
>;
type PurchaseRequestDetailNavigationProp = NativeStackNavigationProp<
  MainStackList,
  "PurchaseRequestDetail"
>;

/**
 * PurchaseRequestDetail 화면
 * 구매 요청 상세 정보를 표시하고 상태 변경 액션을 제공합니다.
 * Requirements: 3.5, 7.1
 */
export default function PurchaseRequestDetail() {
  const navigation = useNavigation<PurchaseRequestDetailNavigationProp>();
  const route = useRoute<PurchaseRequestDetailRouteProp>();
  const { top, bottom } = useSafeAreaInsets();

  const [request, setRequest] = useState<PurchaseRequestDetailType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isBuyer, setIsBuyer] = useState(false);
  const [processing, setProcessing] = useState(false);

  const requestId = route.params?.requestId;

  useEffect(() => {
    if (requestId) {
      fetchRequestDetail();
    }
  }, [requestId]);

  // 실시간 구매 요청 업데이트 구독
  // Requirements: 4.1, 4.2, 6.4 - 구매 요청 생성/승인/거절 시 실시간 UI 업데이트
  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`purchase-request-detail-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "purchase_requests",
          filter: `id=eq.${requestId}`,
        },
        () => {
          // 구매 요청 변경 시 상세 정보 다시 조회
          fetchRequestDetail();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  // 구매 요청 상세 정보 조회
  const fetchRequestDetail = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showErrorToast("로그인이 필요합니다.");
        navigation.goBack();
        return;
      }

      // 구매 요청 조회
      const { data: requestData, error: requestError } = await supabase
        .from("purchase_requests")
        .select(
          `
          *,
          idea:ideas(id, title, price, image_uris, is_free),
          buyer:buyer_id(id, email),
          seller:seller_id(id, email)
        `
        )
        .eq("id", requestId)
        .single();

      if (requestError || !requestData) {
        showErrorToast("구매 요청을 찾을 수 없습니다.");
        navigation.goBack();
        return;
      }

      // 권한 확인 (구매자 또는 판매자만 접근 가능)
      const isBuyerUser = requestData.buyer_id === user.id;
      const isSellerUser = requestData.seller_id === user.id;

      if (!isBuyerUser && !isSellerUser) {
        showErrorToast("접근 권한이 없습니다.");
        navigation.goBack();
        return;
      }

      setIsBuyer(isBuyerUser);
      setRequest(requestData as any);
    } catch (error) {
      console.error("구매 요청 조회 오류:", error);
      showErrorToast("구매 요청을 불러올 수 없습니다.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // 뒤로 가기
  const handleBack = () => {
    navigation.goBack();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  // 입금 완료 처리 (구매자) - Requirement 7.1
  const handleConfirmPayment = async () => {
    if (!request) return;

    Alert.alert("입금 확인", "입금을 완료하셨습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          setProcessing(true);
          const result = await confirmPayment(request.id);
          setProcessing(false);

          if (result.success) {
            showSuccessToast("입금 완료 처리되었습니다.");
            fetchRequestDetail();
          } else {
            showErrorToast(result.error || "입금 확인에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 구매 요청 승인 (판매자) - Requirement 3.5
  const handleApprove = async () => {
    if (!request) return;

    Alert.alert(
      "승인 확인",
      `"${request.idea.title}"의 구매 요청을 승인하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "승인",
          onPress: async () => {
            setProcessing(true);
            const result = await approvePurchaseRequest(request.id);
            setProcessing(false);

            if (result.success) {
              showSuccessToast("구매 요청이 승인되었습니다.");
              fetchRequestDetail();
            } else {
              showErrorToast(result.error || "승인에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  // 구매 요청 거절 (판매자) - Requirement 3.5
  const handleReject = async () => {
    if (!request) return;

    Alert.alert(
      "거절 확인",
      `"${request.idea.title}"의 구매 요청을 거절하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "거절",
          style: "destructive",
          onPress: async () => {
            setProcessing(true);
            const result = await rejectPurchaseRequest(request.id);
            setProcessing(false);

            if (result.success) {
              showSuccessToast("구매 요청이 거절되었습니다.");
              fetchRequestDetail();
            } else {
              showErrorToast(result.error || "거절에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  // 아이디어 상세로 이동
  const handleViewIdea = () => {
    if (request) {
      navigation.navigate("Detail", { ideaId: request.idea.id });
    }
  };

  if (loading || !request) {
    return (
      <Container>
        <Header paddingTop={top}>
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </BackButton>
          <HeaderTitle>구매 요청 상세</HeaderTitle>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      </Container>
    );
  }

  const isPending = request.status === "pending";
  const isPaid = request.payment_status === "paid";
  const canApprove = isPending && (isPaid || request.idea.is_free);

  return (
    <Container>
      <Header paddingTop={top}>
        <BackButton onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </BackButton>
        <HeaderTitle>구매 요청 상세</HeaderTitle>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        {/* 아이디어 정보 */}
        <Section>
          <SectionTitle>아이디어 정보</SectionTitle>
          <IdeaContainer>
            {request.idea.image_uris?.[0] && (
              <ThumbnailContainer>
                <Thumbnail
                  source={{ uri: request.idea.image_uris[0] }}
                  resizeMode="cover"
                />
              </ThumbnailContainer>
            )}
            <IdeaInfo>
              <IdeaTitle numberOfLines={2}>{request.idea.title}</IdeaTitle>
              <IdeaPrice>
                {request.idea.is_free
                  ? "무료"
                  : `${request.idea.price?.toLocaleString()}원`}
              </IdeaPrice>
              <TouchableOpacity
                onPress={handleViewIdea}
                style={{ marginTop: 8 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: defaultColor.mainColor,
                    fontFamily: "Paperlogy-Medium",
                  }}
                >
                  상세보기 →
                </Text>
              </TouchableOpacity>
            </IdeaInfo>
          </IdeaContainer>
        </Section>

        <Divider />

        {/* 구매 요청 정보 */}
        <Section>
          <SectionTitle>구매 요청 정보</SectionTitle>

          <InfoRow>
            <InfoLabel>요청 상태</InfoLabel>
            <StatusBadge status={request.status}>
              <StatusText>{getStatusText(request.status)}</StatusText>
            </StatusBadge>
          </InfoRow>

          {!request.idea.is_free && (
            <InfoRow>
              <InfoLabel>입금 상태</InfoLabel>
              <PaymentBadge paid={request.payment_status === "paid"}>
                <PaymentText>
                  {getPaymentStatusText(request.payment_status)}
                </PaymentText>
              </PaymentBadge>
            </InfoRow>
          )}

          <InfoRow>
            <InfoLabel>요청 날짜</InfoLabel>
            <InfoValue>{formatDate(request.created_at)}</InfoValue>
          </InfoRow>

          {request.payment_confirmed_at && (
            <InfoRow>
              <InfoLabel>입금 확인 날짜</InfoLabel>
              <InfoValue>{formatDate(request.payment_confirmed_at)}</InfoValue>
            </InfoRow>
          )}

          {request.approved_at && (
            <InfoRow>
              <InfoLabel>승인 날짜</InfoLabel>
              <InfoValue>{formatDate(request.approved_at)}</InfoValue>
            </InfoRow>
          )}

          {request.rejected_at && (
            <InfoRow>
              <InfoLabel>거절 날짜</InfoLabel>
              <InfoValue>{formatDate(request.rejected_at)}</InfoValue>
            </InfoRow>
          )}

          {!isBuyer && (
            <InfoRow style={{ borderBottomWidth: 0 }}>
              <InfoLabel>구매자</InfoLabel>
              <InfoValue>{request.buyer.email}</InfoValue>
            </InfoRow>
          )}
        </Section>
      </Content>

      {/* 액션 버튼 */}
      {isPending && (
        <ActionsContainer style={{ paddingBottom: bottom + 16 }}>
          {isBuyer ? (
            // 구매자 액션 - Requirement 7.1
            <>
              {!isPaid && !request.idea.is_free && (
                <>
                  <ActionButton
                    variant="secondary"
                    onPress={handleConfirmPayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons
                          name="card-outline"
                          size={20}
                          color="#ffffff"
                        />
                        <ActionButtonText>입금 완료</ActionButtonText>
                      </>
                    )}
                  </ActionButton>
                  <InfoText>
                    * 입금 완료 후 판매자가 확인하면 승인됩니다.
                  </InfoText>
                </>
              )}
              {isPaid && (
                <InfoText>
                  입금이 확인되었습니다. 판매자의 승인을 기다리고 있습니다.
                </InfoText>
              )}
            </>
          ) : (
            // 판매자 액션 - Requirement 3.5
            <>
              <ActionButton
                variant="primary"
                onPress={handleApprove}
                disabled={!canApprove || processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#ffffff"
                    />
                    <ActionButtonText>승인</ActionButtonText>
                  </>
                )}
              </ActionButton>
              <ActionButton
                variant="danger"
                onPress={handleReject}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#ffffff"
                    />
                    <ActionButtonText>거절</ActionButtonText>
                  </>
                )}
              </ActionButton>
              {!canApprove && !request.idea.is_free && (
                <InfoText>* 입금 확인 후 승인 버튼이 활성화됩니다.</InfoText>
              )}
            </>
          )}
        </ActionsContainer>
      )}
    </Container>
  );
}
