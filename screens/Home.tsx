import React, { useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HomeHeader from "../components/home/HomeHeader";
import CategoryTabs from "../components/home/CategoryTabs";
import IdeaCard, { IdeaCardData } from "../components/home/IdeaCard";
import { MainStackList } from "../navigations/MainStack";
import { fetchIdeas, filterIdeasByTag } from "../utils/ideaUtils";

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

type HomeNavigationProp = NativeStackNavigationProp<MainStackList>;

export default function Home() {
  const navigation = useNavigation<HomeNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState("업로드 순");
  const [activeTab, setActiveTab] = useState("전체");
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [allIdeas, setAllIdeas] = useState<IdeaCardData[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const { ideas, categories: fetchedCategories } = await fetchIdeas();
      setAllIdeas(ideas);
      setFilteredIdeas(ideas);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("아이디어 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    setActiveTab(tag);
    const filtered = filterIdeasByTag(allIdeas, tag);
    setFilteredIdeas(filtered);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadIdeas();
    }, [])
  );

  const handleFilterPress = () => {
    console.log("필터 버튼 클릭");
    // TODO: 필터 모달 열기
  };

  const handleSearchPress = () => {
    console.log("검색 버튼 클릭");
    // TODO: 검색 화면으로 이동
  };

  const handleRefresh = () => {
    loadIdeas();
  };

  const handleWritePress = () => {
    navigation.navigate("NewIdea");
  };

  const handleIdeaPress = (id: string) => {
    navigation.navigate("Detail", { ideaId: id });
  };

  if (loading) {
    return (
      <Container>
        <HomeHeader
          selectedCategory={selectedCategory}
          onFilterPress={handleFilterPress}
          onSearchPress={handleSearchPress}
          onRefresh={handleRefresh}
          onWritePress={handleWritePress}
        />
        <LoadingContainer>
          <ActivityIndicator size="large" color="#007AFF" />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <HomeHeader
        selectedCategory={selectedCategory}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
        onRefresh={handleRefresh}
        onWritePress={handleWritePress}
      />
      <View>
        <CategoryTabs
          categories={categories}
          selectedCategory={activeTab}
          onSelectCategory={handleTagSelect}
        />
      </View>
      <FlatList
        data={filteredIdeas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard data={item} onPress={handleIdeaPress} />
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
      />
    </Container>
  );
}
