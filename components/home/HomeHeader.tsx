import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { defaultColor } from "../../utils/Color";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  background-color: ${defaultColor.mainColor};
`;

const LeftSection = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const CategoryText = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: white;
`;

const RightSection = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled(TouchableOpacity)`
  padding: 4px;
`;

// 메뉴 모달 스타일
const ModalOverlay = styled(TouchableOpacity)`
  flex: 1;
`;

const MenuContainer = styled(View)`
  position: absolute;
  top: 105px;
  right: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 8px 0;
  min-width: 140px;
`;

const MenuItem = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
`;

const MenuText = styled(Text)`
  font-size: 14px;
  color: #000000;
`;

interface HomeHeaderProps {
  selectedCategory: string;
  onFilterPress: () => void;
  onSearchPress: () => void;
  onNotificationPress: () => void;
  onRefresh?: () => void;
  onWritePress?: () => void;
}

export default function HomeHeader({
  selectedCategory,
  onFilterPress,
  onSearchPress,
  onNotificationPress,
  onRefresh,
  onWritePress,
}: HomeHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { top } = useSafeAreaInsets();

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleRefresh = () => {
    setMenuVisible(false);
    onRefresh?.();
  };

  const handleWrite = () => {
    setMenuVisible(false);
    onWritePress?.();
  };

  return (
    <>
      <HeaderContainer
        style={{
          paddingTop: top,
          paddingBottom: 10,
        }}
      >
        <LeftSection>
          <TouchableOpacity
            onPress={onFilterPress}
            style={{ flexDirection: "row", gap: 5.5 }}
          >
            <CategoryText>{selectedCategory}</CategoryText>
            <Ionicons name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </LeftSection>

        <RightSection>
          <IconButton onPress={onSearchPress}>
            <Ionicons name="search" size={24} color="#fff" />
          </IconButton>
          <IconButton onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </IconButton>
          <IconButton onPress={handleMenuPress}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </IconButton>
        </RightSection>
      </HeaderContainer>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <ModalOverlay
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: {
              width: 2,
              height: 2,
            },
          }}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <MenuContainer>
            <MenuItem onPress={handleRefresh}>
              <Ionicons name="refresh-outline" size={20} color="#000" />
              <MenuText>새로고침</MenuText>
            </MenuItem>
            <MenuItem onPress={handleWrite}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <MenuText>글쓰기</MenuText>
            </MenuItem>
          </MenuContainer>
        </ModalOverlay>
      </Modal>
    </>
  );
}
