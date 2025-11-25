import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultColor } from "../utils/Color";
import NotificationBadge from "../components/common/NotificationBadge";

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

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

const RightSection = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const HeaderTitle = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: white;
`;

const ContentContainer = styled(ScrollView)`
  flex: 1;
`;

export default function History() {
  const { top } = useSafeAreaInsets();
  return (
    <Container>
      <HeaderContainer
        style={{
          paddingTop: top,
          paddingBottom: 20,
        }}
      >
        <LeftSection>
          <HeaderTitle>히스토리</HeaderTitle>
        </LeftSection>
        <RightSection>
          <NotificationBadge color="#fff" size={24} />
        </RightSection>
      </HeaderContainer>

      <ContentContainer>{/* TODO: 히스토리 컨텐츠 추가 */}</ContentContainer>
    </Container>
  );
}
