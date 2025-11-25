import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackList } from "../navigations/MainStack";
import { defaultColor } from "../utils/Color";
import {
  getMyIdeas,
  deleteIdea,
  IdeaDetail,
} from "../lib/services/IdeaService";
import {
  getMyPurchaseRequests,
  getReceivedPurchaseRequests,
  getPurchasedIdeas,
  PurchaseRequestDetail,
} from "../lib/services/PurchaseService";
import IdeaListItem from "../components/common/IdeaListItem";
import PurchaseRequestList from "../components/profile/PurchaseRequestList";
import NotificationBadge from "../components/common/NotificationBadge";
import { supabase } from "../lib/Supabase";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const Header = styled(View)<{ paddingTop: number }>`
  background-color: ${defaultColor.textColor};
  padding: ${(props) => props.paddingTop}px 16px 16px 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const LeftSection = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const RightSection = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const TabContainer = styled(View)`
  flex-direction: row;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: rgba(9, 24, 42, 0.1);
`;

const TabButton = styled(TouchableOpacity)<{ active: boolean }>`
  flex: 1;
  padding: 16px 8px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${(props) =>
    props.active ? defaultColor.textColor : "transparent"};
`;

const TabText = styled(Text)<{ active: boolean }>`
  font-size: 14px;
  font-family: ${(props) =>
    props.active ? "Paperlogy-SemiBold" : "Paperlogy-Medium"};
  color: ${(props) =>
    props.active ? defaultColor.textColor : "rgba(9, 24, 42, 0.5)"};
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyText = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.5);
  text-align: center;
`;

type TabType = "myIdeas" | "sentRequests" | "receivedRequests" | "purchased";

type MyIdeasNavigationProp = NativeStackNavigationProp<MainStackList>;

export default function MyIdeas() {
  const navigation = useNavigation<MyIdeasNavigationProp>();
  const { top } = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("myIdeas");
  const [ideas, setIdeas] = useState<IdeaDetail[]>([]);
  const [sentRequests, setSentRequests] = useState<PurchaseRequestDetail[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<
    PurchaseRequestDetail[]
  >([]);
  const [purchasedIdeas, setPurchasedIdeas] = useState<IdeaDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [activeTab])
  );

  // 실시간 구매 요청 업데이트 구독
  // Requirements: 4.1, 4.2, 6.4 - 구매 요청 생성/승인/거절 시 실시간 UI 업데이트
  useEffect(() => {
    const channel = supabase
      .channel("purchase-requests-myideas")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "purchase_requests",
        },
        () => {
          // 구매 요청 변경 시 현재 탭의 데이터 다시 조회
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case "myIdeas":
        await fetchMyIdeas();
        break;
      case "sentRequests":
        await fetchSentRequests();
        break;
      case "receivedRequests":
        await fetchReceivedRequests();
        break;
      case "purchased":
        await fetchPurchasedIdeas();
        break;
    }
    setLoading(false);
  };

  const fetchMyIdeas = async () => {
    const result = await getMyIdeas();
    if (result.error) {
      showErrorToast(result.error);
    } else {
      setIdeas(result.data);
    }
  };

  const fetchSentRequests = async () => {
    const result = await getMyPurchaseRequests();
    if (result.error) {
      showErrorToast(result.error);
    } else {
      setSentRequests(result.data);
    }
  };

  const fetchReceivedRequests = async () => {
    const result = await getReceivedPurchaseRequests();
    if (result.error) {
      showErrorToast(result.error);
    } else {
      setReceivedRequests(result.data);
    }
  };

  const fetchPurchasedIdeas = async () => {
    const result = await getPurchasedIdeas();
    if (result.error) {
      showErrorToast(result.error);
    } else {
      setPurchasedIdeas(result.data);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleIdeaPress = (ideaId: string) => {
    navigation.navigate("Detail", { ideaId });
  };

  const handleEdit = (ideaId: string) => {
    // TODO: 수정 화면으로 이동
    Alert.alert("알림", "수정 기능은 준비 중입니다.");
  };

  const handleDelete = (ideaId: string, title: string) => {
    Alert.alert("삭제 확인", `"${title}"을(를) 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          const result = await deleteIdea(ideaId);
          if (result.success) {
            showSuccessToast("게시물이 삭제되었습니다.");
            fetchMyIdeas();
          } else {
            showErrorToast(result.error || "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const renderMyIdeas = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      );
    }

    if (ideas.length === 0) {
      return (
        <EmptyContainer>
          <EmptyText>작성한 게시물이 없습니다.</EmptyText>
        </EmptyContainer>
      );
    }

    return (
      <Content showsVerticalScrollIndicator={false}>
        {ideas.map((idea) => (
          <IdeaListItem
            key={idea.id}
            idea={idea}
            onPress={() => handleIdeaPress(idea.id)}
            onEdit={() => handleEdit(idea.id)}
            onDelete={() => handleDelete(idea.id, idea.title)}
            showActions
          />
        ))}
      </Content>
    );
  };

  const renderSentRequests = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      );
    }

    if (sentRequests.length === 0) {
      return (
        <EmptyContainer>
          <EmptyText>구매 요청한 아이디어가 없습니다.</EmptyText>
        </EmptyContainer>
      );
    }

    return (
      <Content showsVerticalScrollIndicator={false}>
        <PurchaseRequestList
          requests={sentRequests}
          type="buyer"
          onRefresh={fetchSentRequests}
          onRequestPress={(requestId) => {
            navigation.navigate("PurchaseRequestDetail", { requestId });
          }}
        />
      </Content>
    );
  };

  const renderReceivedRequests = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      );
    }

    if (receivedRequests.length === 0) {
      return (
        <EmptyContainer>
          <EmptyText>받은 구매 요청이 없습니다.</EmptyText>
        </EmptyContainer>
      );
    }

    return (
      <Content showsVerticalScrollIndicator={false}>
        <PurchaseRequestList
          requests={receivedRequests}
          type="seller"
          onRefresh={fetchReceivedRequests}
          onRequestPress={(requestId) => {
            navigation.navigate("PurchaseRequestDetail", { requestId });
          }}
        />
      </Content>
    );
  };

  const renderPurchasedIdeas = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      );
    }

    if (purchasedIdeas.length === 0) {
      return (
        <EmptyContainer>
          <EmptyText>구매한 아이디어가 없습니다.</EmptyText>
        </EmptyContainer>
      );
    }

    return (
      <Content showsVerticalScrollIndicator={false}>
        {purchasedIdeas.map((idea) => (
          <IdeaListItem
            key={idea.id}
            idea={idea}
            onPress={() => handleIdeaPress(idea.id)}
          />
        ))}
      </Content>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "myIdeas":
        return renderMyIdeas();
      case "sentRequests":
        return renderSentRequests();
      case "receivedRequests":
        return renderReceivedRequests();
      case "purchased":
        return renderPurchasedIdeas();
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header paddingTop={top}>
        <LeftSection>
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </BackButton>
          <HeaderTitle>내 프로필</HeaderTitle>
        </LeftSection>
        <RightSection>
          <NotificationBadge color="#fff" size={24} />
        </RightSection>
      </Header>

      <TabContainer>
        <TabButton
          active={activeTab === "myIdeas"}
          onPress={() => setActiveTab("myIdeas")}
        >
          <TabText active={activeTab === "myIdeas"}>내 게시물</TabText>
        </TabButton>
        <TabButton
          active={activeTab === "sentRequests"}
          onPress={() => setActiveTab("sentRequests")}
        >
          <TabText active={activeTab === "sentRequests"}>구매 요청</TabText>
        </TabButton>
        <TabButton
          active={activeTab === "receivedRequests"}
          onPress={() => setActiveTab("receivedRequests")}
        >
          <TabText active={activeTab === "receivedRequests"}>받은 요청</TabText>
        </TabButton>
        <TabButton
          active={activeTab === "purchased"}
          onPress={() => setActiveTab("purchased")}
        >
          <TabText active={activeTab === "purchased"}>구매 완료</TabText>
        </TabButton>
      </TabContainer>

      {renderContent()}
    </Container>
  );
}
