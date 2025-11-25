import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackList } from "../navigations/MainStack";
import ImageCarousel from "../components/detail/ImageCarousel";
import CommentItem, { CommentData } from "../components/detail/CommentItem";
import CommentInput from "../components/detail/CommentInput";
import PurchaseModal from "../components/PurchaseModal";
import IdeaOptionsModal from "../components/IdeaOptionsModal";
import {
  getIdeaById,
  getUserDisplayName,
  IdeaDetail,
  deleteIdea,
  checkIdeaAccess,
} from "../lib/services/IdeaService";
import {
  getCommentsByIdeaId,
  createComment,
  getCommentAuthorName,
} from "../lib/services/CommentService";
import {
  getPurchaseRequestCount,
  hasPurchaseRequest,
  createPurchaseRequest,
} from "../lib/services/PurchaseService";
import { supabase } from "../lib/Supabase";
import NotificationBadge from "../components/common/NotificationBadge";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const Container = styled(View)<{ paddingBottom: number }>`
  flex: 1;
  background-color: white;
  padding-bottom: ${(props) => props.paddingBottom}px;
`;

const Header = styled(View)<{ paddingTop: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  align-items: center;
  padding: ${(props) => props.paddingTop}px 16px 16px 16px;
  background-color: #09182a;
  z-index: 10;
`;

const HeaderButton = styled(TouchableOpacity)`
  padding: 4px;
  margin-right: 16px;
`;

const ContentContainer = styled(ScrollView)`
  flex: 1;
`;

const InfoSection = styled(View)`
  padding: 20px 16px 16px 16px;
  background-color: white;
`;

const Title = styled(Text)`
  font-size: 28px;
  font-weight: 700;
  color: #09182a;
  margin-bottom: 16px;
  line-height: 36px;
`;

const MetaRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PriceContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Price = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: #09182a;
`;

const Badge = styled(View)`
  background-color: #09182a;
  border-radius: 12px;
  padding: 4px 10px;
`;

const BadgeText = styled(Text)`
  font-size: 10px;
  font-weight: 700;
  color: white;
`;

const AuthorContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const AuthorText = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  color: #09182a;
`;

const SectionHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 20px 16px 12px 16px;
  gap: 10px;
`;

const SectionTitle = styled(Text)`
  font-size: 22px;
  font-weight: 700;
  color: #09182a;
`;

const Description = styled(Text)`
  font-size: 15px;
  line-height: 24px;
  color: #333;
  padding: 0 16px 20px 16px;
`;

const LockedContentContainer = styled(View)`
  padding: 60px 16px;
  margin: 0 16px 20px 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #ddd;
  justify-content: center;
  align-items: center;
`;

const LockIconContainer = styled(View)`
  background-color: rgba(9, 24, 42, 0.9);
  width: 60px;
  height: 60px;
  border-radius: 30px;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

const BlurMessage = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #09182a;
  text-align: center;
  margin-bottom: 4px;
`;

const BlurSubMessage = styled(Text)`
  font-size: 13px;
  color: #666;
  text-align: center;
`;

const CommentsSection = styled(View)`
  padding: 0 16px 16px 16px;
  background-color: #fafafa;
`;

const Divider = styled(View)`
  height: 1px;
  background-color: rgba(9, 24, 42, 0.08);
  margin: 12px 0;
`;

const PurchaseRequestCountContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  margin: 0 16px;
  border-radius: 8px;
  gap: 8px;
`;

const PurchaseRequestCountText = styled(Text)`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const PurchaseRequestCountNumber = styled(Text)`
  font-size: 14px;
  color: #09182a;
  font-weight: 700;
`;

const PurchaseButton = styled(TouchableOpacity)<{ disabled?: boolean }>`
  background-color: ${(props) => (props.disabled ? "#ccc" : "#09182a")};
  margin: 20px 16px;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
`;

const PurchaseButtonText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: 700;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

type DetailRouteProp = RouteProp<MainStackList, "Detail">;
type DetailNavigationProp = NativeStackNavigationProp<MainStackList, "Detail">;

export default function Detail() {
  const navigation = useNavigation<DetailNavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { top, bottom } = useSafeAreaInsets();

  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("작성자");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isMyIdea, setIsMyIdea] = useState(false);
  const [purchaseRequestCount, setPurchaseRequestCount] = useState(0);
  const [purchaseRequestStatus, setPurchaseRequestStatus] = useState<
    string | null
  >(null);
  const [hasRequest, setHasRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const ideaId = route.params?.ideaId;

  useEffect(() => {
    if (ideaId) {
      fetchIdeaDetail();
      fetchComments();
    }
  }, [ideaId]);

  // idea와 isMyIdea가 설정된 후 구매 요청 정보 조회
  useEffect(() => {
    if (idea && ideaId) {
      fetchPurchaseRequestInfo();
    }
  }, [idea, isMyIdea, ideaId]);

  // 실시간 구매 요청 수 업데이트 구독
  // Requirements: 6.4 - 구매 요청 생성/승인/거절 시 실시간 UI 업데이트
  useEffect(() => {
    if (!ideaId) return;

    const channel = supabase
      .channel(`purchase-requests-detail-${ideaId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "purchase_requests",
          filter: `idea_id=eq.${ideaId}`,
        },
        () => {
          // 구매 요청 변경 시 정보 다시 조회
          fetchPurchaseRequestInfo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ideaId]);

  const fetchIdeaDetail = async () => {
    try {
      // 접근 권한 확인
      const accessCheck = await checkIdeaAccess(ideaId);
      if (!accessCheck.hasAccess) {
        showErrorToast(
          accessCheck.reason || "이 아이디어에 접근할 수 없습니다."
        );
        navigation.goBack();
        setLoading(false);
        return;
      }

      const data = await getIdeaById(ideaId);
      if (!data) {
        showErrorToast("아이디어를 찾을 수 없습니다.");
        navigation.goBack();
        return;
      }

      setIdea(data);

      // 현재 사용자 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsMyIdea(user?.id === data.user_id);

      // 작성자 이름 가져오기
      const name = await getUserDisplayName(data.user_id);
      setAuthorName(name);
    } catch (error) {
      console.error("아이디어 조회 오류:", error);
      showErrorToast("아이디어를 불러올 수 없습니다.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getCommentsByIdeaId(ideaId);

      const formattedComments: CommentData[] = await Promise.all(
        data.map(async (comment) => {
          const userName = await getCommentAuthorName(comment.user_id);
          return {
            id: comment.id,
            userName,
            content: comment.content,
            timestamp: new Date(comment.created_at || "").toLocaleString(
              "ko-KR",
              {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            isAuthor: comment.user_id === idea?.user_id,
            parentCommentId: comment.parent_comment_id,
          };
        })
      );

      setComments(formattedComments);
    } catch (error) {
      console.error("댓글 조회 오류:", error);
    }
  };

  const fetchPurchaseRequestInfo = async () => {
    try {
      // 구매 요청 수 조회 (Requirement 6.1, 6.2)
      const count = await getPurchaseRequestCount(ideaId);
      setPurchaseRequestCount(count);

      // 사용자의 구매 요청 여부 확인 (Requirement 1.4)
      const requestInfo = await hasPurchaseRequest(ideaId);
      setHasRequest(requestInfo.hasRequest);
      setPurchaseRequestStatus(requestInfo.status || null);

      // 콘텐츠 접근 권한 확인 (Requirement 5.3, 5.4, 5.5)
      // 무료 아이디어, 자신의 아이디어, 승인된 구매 요청이 있는 경우 접근 가능
      const canAccess =
        idea?.is_free ||
        isMyIdea ||
        (requestInfo.hasRequest && requestInfo.status === "approved");
      setHasAccess(canAccess);
    } catch (error) {
      console.error("구매 요청 정보 조회 오류:", error);
    }
  };

  const handleSendComment = async (text: string) => {
    try {
      setSubmitting(true);
      await createComment(ideaId, text);
      await fetchComments();
      showSuccessToast("댓글이 작성되었습니다.");
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      showErrorToast("댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchase = () => {
    // 자신의 게시물인 경우 (Requirement 1.2)
    if (isMyIdea) {
      showErrorToast("자신의 아이디어는 구매할 수 없습니다.");
      return;
    }

    // 이미 구매 요청한 경우 (Requirement 1.4)
    if (hasRequest) {
      const statusText =
        purchaseRequestStatus === "pending"
          ? "승인 대기 중"
          : purchaseRequestStatus === "approved"
          ? "승인됨"
          : purchaseRequestStatus === "rejected"
          ? "거절됨"
          : "처리 중";
      showErrorToast(`이미 구매 요청한 아이디어입니다. (상태: ${statusText})`);
      return;
    }

    setShowPurchaseModal(true);
  };

  const handlePurchaseRequest = async () => {
    try {
      setShowPurchaseModal(false);
      setSubmitting(true);

      // 구매 요청 생성 (Requirement 1.1)
      const result = await createPurchaseRequest(ideaId);

      if (result.success) {
        showSuccessToast("구매 요청이 완료되었습니다.");
        // 구매 요청 정보 다시 조회
        await fetchPurchaseRequestInfo();
      } else {
        showErrorToast(result.error || "구매 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("구매 요청 오류:", error);
      showErrorToast("구매 요청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    navigation.navigate("BottomTab");
  };

  const handleOptions = () => {
    setShowOptionsModal(true);
  };

  const handleEdit = () => {
    setShowOptionsModal(false);
    Alert.alert("알림", "수정 기능은 준비 중입니다.");
  };

  const handleDelete = () => {
    setShowOptionsModal(false);
    Alert.alert("삭제 확인", "정말로 이 아이디어를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          setSubmitting(true);
          const result = await deleteIdea(ideaId);
          setSubmitting(false);

          if (result.success) {
            showSuccessToast("아이디어가 삭제되었습니다.");
            navigation.goBack();
          } else {
            showErrorToast(result.error || "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleShare = () => {
    setShowOptionsModal(false);
    Alert.alert("알림", "공유 기능은 준비 중입니다.");
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    Alert.alert("신고하기", "이 게시물을 신고하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "신고",
        style: "destructive",
        onPress: () => {
          Alert.alert("완료", "신고가 접수되었습니다.");
        },
      },
    ]);
  };

  if (loading || !idea) {
    return (
      <Container paddingBottom={bottom}>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#09182a" />
        </LoadingContainer>
      </Container>
    );
  }

  // 댓글과 대댓글 분리
  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Container paddingBottom={bottom - 10}>
        <Header paddingTop={top}>
          <HeaderButton onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </HeaderButton>
          <HeaderButton onPress={handleHome}>
            <Ionicons name="home" size={24} color="white" />
          </HeaderButton>
          <View style={{ flex: 1 }} />
          <NotificationBadge color="#fff" size={24} />
          <HeaderButton onPress={handleOptions}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </HeaderButton>
        </Header>

        <ContentContainer style={{ marginTop: top + 56 }}>
          <ImageCarousel images={idea.image_uris || []} />

          <InfoSection>
            <Title>{idea.title}</Title>
            <MetaRow>
              <PriceContainer>
                <Price>
                  {idea.is_free ? "무료" : `${idea.price?.toLocaleString()}원`}
                </Price>
                <Badge>
                  <BadgeText>{idea.is_free ? "무료" : "유료"}</BadgeText>
                </Badge>
              </PriceContainer>
              <AuthorContainer>
                <Ionicons name="people-circle" size={20} color="#09182a" />
                <AuthorText>{authorName}</AuthorText>
              </AuthorContainer>
            </MetaRow>
          </InfoSection>

          <SectionHeader>
            <Ionicons name="bulb" size={28} color="#09182a" />
            <SectionTitle>아이디어 소개</SectionTitle>
          </SectionHeader>

          {/* 유료 아이디어이고 접근 권한이 없는 경우 잠금 표시 (Requirement 5.4) */}
          {!idea.is_free && !hasAccess ? (
            <LockedContentContainer>
              <LockIconContainer>
                <Ionicons name="lock-closed" size={28} color="white" />
              </LockIconContainer>
              <BlurMessage>구매 후 확인 가능합니다</BlurMessage>
              <BlurSubMessage>아래 구매하기 버튼을 눌러주세요</BlurSubMessage>
            </LockedContentContainer>
          ) : (
            <Description>{idea.content}</Description>
          )}

          {/* 구매 요청 수 표시 (Requirement 6.1, 6.2) */}
          {purchaseRequestCount > 0 && !isMyIdea && (
            <PurchaseRequestCountContainer>
              <Ionicons name="people" size={16} color="#666" />
              <PurchaseRequestCountText>구매 요청</PurchaseRequestCountText>
              <PurchaseRequestCountNumber>
                {purchaseRequestCount}명
              </PurchaseRequestCountNumber>
            </PurchaseRequestCountContainer>
          )}

          <CommentsSection>
            <SectionHeader style={{ padding: 0 }}>
              <Ionicons name="chatbubbles" size={28} color="#09182a" />
              <SectionTitle>댓글</SectionTitle>
            </SectionHeader>

            {topLevelComments.map((comment) => (
              <View key={comment.id}>
                <CommentItem comment={comment} />
                {replies
                  .filter((reply) => reply.parentCommentId === comment.id)
                  .map((reply) => (
                    <CommentItem key={reply.id} comment={reply} isReply />
                  ))}
                <Divider />
              </View>
            ))}
          </CommentsSection>

          {/* 구매하기 버튼 (Requirement 1.2, 1.4) */}
          {!isMyIdea && (
            <PurchaseButton
              onPress={handlePurchase}
              disabled={hasRequest || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <PurchaseButtonText>
                  {hasRequest
                    ? purchaseRequestStatus === "pending"
                      ? "요청 중"
                      : purchaseRequestStatus === "approved"
                      ? "구매 완료"
                      : purchaseRequestStatus === "rejected"
                      ? "거절됨"
                      : "요청 중"
                    : "구매하기"}
                </PurchaseButtonText>
              )}
            </PurchaseButton>
          )}
        </ContentContainer>

        <CommentInput onSend={handleSendComment} />

        <PurchaseModal
          visible={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onRequest={handlePurchaseRequest}
          price={idea?.price || 0}
          ideaId={ideaId}
          loading={submitting}
        />

        <IdeaOptionsModal
          visible={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onEdit={isMyIdea ? handleEdit : undefined}
          onDelete={isMyIdea ? handleDelete : undefined}
          onShare={!isMyIdea ? handleShare : undefined}
          onReport={!isMyIdea ? handleReport : undefined}
          isMyIdea={isMyIdea}
        />
      </Container>
    </KeyboardAvoidingView>
  );
}
