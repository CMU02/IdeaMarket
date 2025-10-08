import React, { useState } from "react";
import { View, FlatList } from "react-native";
import styled from "styled-components/native";
import HomeHeader from "../components/home/HomeHeader";
import CategoryTabs from "../components/home/CategoryTabs";
import IdeaCard, { IdeaCardData } from "../components/home/IdeaCard";

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

// 임시 데이터
const MOCK_IDEAS: IdeaCardData[] = [
  {
    id: "1",
    title: "Idea Market",
    description: "아이디어가 생각 만나는 사람들 의한 마켓",
    price: "50,000원",
    status: "모집중",
    comments: 5,
    likes: 3,
  },
  {
    id: "2",
    title: "Game World",
    description: "게임을 손쉽게 만드는 세상",
    price: "0원",
    status: "마감",
    comments: 8,
    likes: 5,
  },
  {
    id: "3",
    title: "Game World",
    description: "게임을 손쉽게 만드는 세상",
    price: "0원",
    status: "마감",
    comments: 2,
    likes: 3,
  },
  {
    id: "4",
    title: "Game World",
    description: "게임을 손쉽게 만드는 세상",
    price: "0원",
    status: "마감",
    comments: 1,
    likes: 1,
  },
  {
    id: "5",
    title: "Game World",
    description: "게임을 손쉽게 만드는 세상",
    price: "0원",
    status: "마감",
    comments: 3,
    likes: 2,
  },
];

const CATEGORIES = ["전체", "IT", "사업", "투자"];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("업로드 순");
  const [activeTab, setActiveTab] = useState("전체");

  const handleFilterPress = () => {
    console.log("필터 버튼 클릭");
    // TODO: 필터 모달 열기
  };

  const handleSearchPress = () => {
    console.log("검색 버튼 클릭");
    // TODO: 검색 화면으로 이동
  };

  const handleNotificationPress = () => {
    console.log("알림 버튼 클릭");
    // TODO: 알림 화면으로 이동
  };

  const handleRefresh = () => {
    console.log("새로고침");
    // TODO: 데이터 새로고침
  };

  const handleWritePress = () => {
    console.log("글쓰기");
    // TODO: 글쓰기 화면으로 이동
  };

  const handleIdeaPress = (id: string) => {
    console.log("아이디어 클릭:", id);
    // TODO: 아이디어 상세 화면으로 이동
  };

  return (
    <Container>
      <HomeHeader
        selectedCategory={selectedCategory}
        onFilterPress={handleFilterPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        onRefresh={handleRefresh}
        onWritePress={handleWritePress}
      />
      <View>
        <CategoryTabs
          categories={CATEGORIES}
          selectedCategory={activeTab}
          onSelectCategory={setActiveTab}
        />
      </View>
      <FlatList
        data={MOCK_IDEAS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard data={item} onPress={handleIdeaPress} />
        )}
      />
    </Container>
  );
}
