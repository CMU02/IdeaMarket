import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackList } from "../navigations/MainStack";
import { defaultColor } from "../utils/Color";
import { supabase } from "../lib/Supabase";
import { getMyIdeas, IdeaDetail } from "../lib/services/IdeaService";

const Container = styled(View)`
  flex: 1;
  background-color: ${defaultColor.textColor};
`;

const Header = styled(View)<{ paddingTop: number }>`
  background-color: ${defaultColor.textColor};
  padding: ${(props) => props.paddingTop}px 16px 16px 16px;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const Content = styled(ScrollView)`
  flex: 1;
  background-color: #ffffff;
`;

const Section = styled(View)`
  padding: 20px 20px;
`;

const SectionTitle = styled(Text)`
  font-size: 20px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  margin-bottom: 16px;
`;

const MenuItem = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
`;

const MenuText = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const MenuValue = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: rgba(9, 24, 42, 0.5);
`;

const ViewAllButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ViewAllText = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const Divider = styled(View)`
  height: 1px;
  background-color: rgba(9, 24, 42, 0.1);
  margin: 16px 0;
`;

const IdeasScrollView = styled(ScrollView)`
  margin-top: 16px;
`;

const IdeasContainer = styled(View)`
  flex-direction: row;
  gap: 16px;
  padding-right: 20px;
`;

const IdeaCard = styled(TouchableOpacity)`
  width: 120px;
`;

const IdeaThumbnail = styled(View)`
  width: 120px;
  height: 120px;
  background-color: #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ThumbnailImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const IdeaTitle = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  text-align: center;
`;

const EmptyText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.5);
  text-align: center;
  padding: 40px 20px;
`;

const LoadingContainer = styled(View)`
  padding: 40px 20px;
  align-items: center;
`;

const SectionHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

type InfoNavigationProp = NativeStackNavigationProp<MainStackList>;

export default function Info() {
  const navigation = useNavigation<InfoNavigationProp>();
  const { top } = useSafeAreaInsets();
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [myIdeas, setMyIdeas] = React.useState<IdeaDetail[]>([]);
  const [loadingIdeas, setLoadingIdeas] = React.useState(true);

  React.useEffect(() => {
    fetchUserEmail();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMyIdeas();
    }, [])
  );

  const fetchUserEmail = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          await supabase.auth.signOut();
          // 로그아웃 후 AuthStack으로 이동
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: () => {
            // 회원 탈퇴 로직
            Alert.alert("알림", "회원 탈퇴 기능은 준비 중입니다.");
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert("알림", "비밀번호 변경 기능은 준비 중입니다.");
  };

  const handleChangeEmail = () => {
    Alert.alert("알림", "이메일 변경 기능은 준비 중입니다.");
  };

  const handleContact = () => {
    Alert.alert("알림", "문의하기 기능은 준비 중입니다.");
  };

  const fetchMyIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const result = await getMyIdeas(5);
      if (result.error) {
        console.error("내 게시물 조회 오류:", result.error);
      } else {
        setMyIdeas(result.data);
      }
    } catch (error) {
      console.error("fetchMyIdeas 예외:", error);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleViewAllPosts = () => {
    navigation.navigate("MyIdeas" as any);
  };

  const handleIdeaPress = (ideaId: string) => {
    navigation.navigate("Detail", { ideaId });
  };

  const handleViewAllPurchases = () => {
    Alert.alert("알림", "구매한 아이디어 전체보기 기능은 준비 중입니다.");
  };

  return (
    <Container>
      <Header paddingTop={top}>
        <HeaderTitle>내 정보</HeaderTitle>
      </Header>

      <Content>
        {/* 계정 섹션 */}
        <Section>
          <SectionTitle>계 정</SectionTitle>
          <MenuItem>
            <MenuText>이메일</MenuText>
            <MenuValue>{userEmail || "로딩 중..."}</MenuValue>
          </MenuItem>
          <MenuItem onPress={handleChangePassword}>
            <MenuText>비밀번호 변경</MenuText>
          </MenuItem>
          <MenuItem onPress={handleChangeEmail}>
            <MenuText>이메일 변경</MenuText>
          </MenuItem>
        </Section>

        <Divider />

        {/* 내 게시물 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle style={{ marginBottom: 0 }}>내 게시물</SectionTitle>
            <ViewAllButton onPress={handleViewAllPosts}>
              <ViewAllText>전체보기</ViewAllText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={defaultColor.textColor}
              />
            </ViewAllButton>
          </SectionHeader>

          {loadingIdeas ? (
            <LoadingContainer>
              <ActivityIndicator size="small" color={defaultColor.textColor} />
            </LoadingContainer>
          ) : myIdeas.length === 0 ? (
            <EmptyText>작성한 게시물이 없습니다.</EmptyText>
          ) : (
            <IdeasScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 0 }}
            >
              <IdeasContainer>
                {myIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    onPress={() => handleIdeaPress(idea.id)}
                  >
                    <IdeaThumbnail>
                      {idea.image_uris?.[0] ? (
                        <ThumbnailImage
                          source={{ uri: idea.image_uris[0] }}
                          resizeMode="cover"
                        />
                      ) : null}
                    </IdeaThumbnail>
                    <IdeaTitle numberOfLines={2}>{idea.title}</IdeaTitle>
                  </IdeaCard>
                ))}
              </IdeasContainer>
            </IdeasScrollView>
          )}
        </Section>

        <Divider />

        {/* 구매한 아이디어 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle style={{ marginBottom: 0 }}>
              구매한 아이디어
            </SectionTitle>
            <ViewAllButton onPress={handleViewAllPurchases}>
              <ViewAllText>전체보기</ViewAllText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={defaultColor.textColor}
              />
            </ViewAllButton>
          </SectionHeader>

          <EmptyText>구매한 아이디어가 없습니다.</EmptyText>
        </Section>

        <Divider />

        {/* 이용 안내 섹션 */}
        <Section>
          <SectionTitle>이용 안내</SectionTitle>
          <MenuItem>
            <MenuText>앱 버전</MenuText>
            <MenuValue>v 1.0.1</MenuValue>
          </MenuItem>
          <MenuItem onPress={handleContact}>
            <MenuText>문의하기</MenuText>
          </MenuItem>
          <MenuItem>
            <MenuText>약관 1</MenuText>
          </MenuItem>
          <MenuItem>
            <MenuText>약관 2</MenuText>
          </MenuItem>
          <MenuItem>
            <MenuText>약관 3</MenuText>
          </MenuItem>
          <MenuItem>
            <MenuText>약관 4</MenuText>
          </MenuItem>
        </Section>

        <Divider />

        {/* 기타 섹션 */}
        <Section>
          <SectionTitle>기타</SectionTitle>
          <MenuItem onPress={handleDeleteAccount}>
            <MenuText>회원 탈퇴</MenuText>
          </MenuItem>
          <MenuItem onPress={handleLogout}>
            <MenuText>로그 아웃</MenuText>
          </MenuItem>
        </Section>
      </Content>
    </Container>
  );
}
