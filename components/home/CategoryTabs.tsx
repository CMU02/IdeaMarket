import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import styled from "styled-components/native";

const TabsContainer = styled(ScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin: 15px 0px;
`;

const TabsContent = styled(View)`
  flex-direction: row;
  gap: 8px;
  padding: 0px 16px;
`;

const TabButton = styled(TouchableOpacity)<{ isSelected: boolean }>`
  padding: 10px 20px;
  border-radius: 20px;
  background-color: ${(props) => (props.isSelected ? "#000000" : "#F5F5F5")};
  align-items: center;
  justify-content: center;
`;

const TabText = styled(Text)<{ isSelected: boolean }>`
  font-size: 14px;
  font-family: "Paperlogy-Regular";
  color: ${(props) => (props.isSelected ? "#FFFFFF" : "#666666")};
`;

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <TabsContainer>
      <TabsContent>
        {categories.map((category) => (
          <TabButton
            key={category}
            isSelected={selectedCategory === category}
            onPress={() => onSelectCategory(category)}
          >
            <TabText isSelected={selectedCategory === category}>
              {category}
            </TabText>
          </TabButton>
        ))}
      </TabsContent>
    </TabsContainer>
  );
}
