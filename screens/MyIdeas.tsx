import React, { useState } from "react";
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
import IdeaListItem from "../components/common/IdeaListItem";

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

type MyIdeasNavigationProp = NativeStackNavigationProp<MainStackList>;

export default function MyIdeas() {
  const navigation = useNavigation<MyIdeasNavigationProp>();
  const { top } = useSafeAreaInsets();

  const [ideas, setIdeas] = useState<IdeaDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchIdeas();
    }, [])
  );

  const fetchIdeas = async () => {
    setLoading(true);
    const result = await getMyIdeas();
    if (result.error) {
      Alert.alert("오류", result.error);
    } else {
      setIdeas(result.data);
    }
    setLoading(false);
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
            Alert.alert("완료", "게시물이 삭제되었습니다.");
            fetchIdeas();
          } else {
            Alert.alert("오류", result.error || "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <Container>
      <Header paddingTop={top}>
        <BackButton onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </BackButton>
        <HeaderTitle>내 게시물</HeaderTitle>
      </Header>

      {loading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color={defaultColor.textColor} />
        </LoadingContainer>
      ) : ideas.length === 0 ? (
        <EmptyContainer>
          <EmptyText>작성한 게시물이 없습니다.</EmptyText>
        </EmptyContainer>
      ) : (
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
      )}
    </Container>
  );
}
