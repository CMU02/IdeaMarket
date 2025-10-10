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
} from "../lib/services/IdeaService";
import {
  getCommentsByIdeaId,
  createComment,
  getCommentAuthorName,
} from "../lib/services/CommentService";
import { supabase } from "../lib/Supabase";

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

const PrivateText = styled(Text)`
  font-size: 14px;
  color: #999;
  padding: 0 16px 20px 16px;
  font-style: italic;
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

const PurchaseButton = styled(TouchableOpacity)`
  background-color: #09182a;
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

  const ideaId = route.params?.ideaId;

  useEffect(() => {
    if (ideaId) {
      fetchIdeaDetail();
      fetchComments();
    }
  }, [ideaId]);

  const fetchIdeaDetail = async () => {
    try {
      const data = await getIdeaById(ideaId);
      if (!data) {
        Alert.alert("오류", "아이디어를 찾을 수 없습니다.");
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
      Alert.alert("오류", "아이디어를 불러올 수 없습니다.");
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

  const handleSendComment = async (text: string) => {
    try {
      await createComment(ideaId, text);
      await fetchComments();
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      Alert.alert("오류", "댓글 작성에 실패했습니다.");
    }
  };

  const handlePurchase = () => {
    if (idea?.is_free) {
      Alert.alert("무료 아이디어", "무료 아이디어는 구매가 필요하지 않습니다.");
      return;
    }
    setShowPurchaseModal(true);
  };

  const handlePurchaseRequest = () => {
    setShowPurchaseModal(false);
    Alert.alert("구매 요청", "구매 요청이 완료되었습니다.");
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
          const result = await deleteIdea(ideaId);
          if (result.success) {
            Alert.alert("완료", "아이디어가 삭제되었습니다.", [
              {
                text: "확인",
                onPress: () => navigation.goBack(),
              },
            ]);
          } else {
            Alert.alert("오류", result.error || "삭제에 실패했습니다.");
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

          <Description>{idea.content}</Description>
          {!idea.is_free && <PrivateText>(비공개)</PrivateText>}

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

          <PurchaseButton onPress={handlePurchase}>
            <PurchaseButtonText>구매하기</PurchaseButtonText>
          </PurchaseButton>
        </ContentContainer>

        <CommentInput onSend={handleSendComment} />

        <PurchaseModal
          visible={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onRequest={handlePurchaseRequest}
          price={idea?.price || 0}
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
