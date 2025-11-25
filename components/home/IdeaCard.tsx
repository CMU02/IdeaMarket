import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const CardContainer = styled(TouchableOpacity)`
  flex-direction: row;
  padding: 16px;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const ImageContainer = styled(View)<{ backgroundColor?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background-color: ${(props) => props.backgroundColor || "#d9d9d9"};
  margin-right: 16px;
  overflow: hidden;
`;

const IdeaImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ContentContainer = styled(View)`
  flex: 1;
  justify-content: space-between;
`;

const TopSection = styled(View)`
  flex: 1;
`;

const Title = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
`;

const Description = styled(Text)`
  font-size: 14px;
  color: #666666;
  line-height: 20px;
`;

const BottomSection = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PriceContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const PriceText = styled(Text)`
  font-size: 16px;
  font-weight: 700;
  color: #000000;
`;

const StatusBadge = styled(View)<{ status: "모집중" | "마감" }>`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.status === "모집중" ? "#FFD700" : "#E0E0E0"};
`;

const StatusText = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: #000000;
`;

const StatsContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const StatItem = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const StatText = styled(Text)`
  font-size: 12px;
  color: #999999;
`;

export interface IdeaCardData {
  id: string;
  title: string;
  description: string;
  price: string;
  status: "모집중" | "마감";
  comments: number;
  likes: number;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
}

// 파스텔톤 색상 배열
const PASTEL_COLORS = [
  "#FFE5E5", // 파스텔 핑크
  "#E5F3FF", // 파스텔 블루
  "#FFF5E5", // 파스텔 오렌지
  "#E5FFE5", // 파스텔 그린
  "#F5E5FF", // 파스텔 퍼플
  "#FFFFE5", // 파스텔 옐로우
  "#E5FFFF", // 파스텔 시안
  "#FFE5F5", // 파스텔 로즈
];

/**
 * ID를 기반으로 일관된 파스텔 색상 반환
 */
function getPastelColor(id: string): string {
  const hash = id.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}

interface IdeaCardProps {
  data: IdeaCardData;
  onPress: (id: string) => void;
}

export default function IdeaCard({ data, onPress }: IdeaCardProps) {
  // 첫 번째 이미지 URL 또는 파스텔 색상 결정
  const imageUrl = useMemo(() => {
    if (data.imageUrls && data.imageUrls.length > 0) {
      return data.imageUrls[0];
    }
    return data.imageUrl;
  }, [data.imageUrls, data.imageUrl]);

  const backgroundColor = useMemo(() => {
    return getPastelColor(data.id);
  }, [data.id]);

  return (
    <CardContainer onPress={() => onPress(data.id)}>
      <ImageContainer backgroundColor={!imageUrl ? backgroundColor : undefined}>
        {imageUrl && (
          <IdeaImage source={{ uri: imageUrl }} resizeMode="cover" />
        )}
      </ImageContainer>
      <ContentContainer>
        <TopSection>
          <Title numberOfLines={1}>{data.title}</Title>
          <Description numberOfLines={2}>{data.description}</Description>
        </TopSection>
        <BottomSection>
          <PriceContainer>
            <PriceText>{data.price}</PriceText>
            <StatusBadge status={data.status}>
              <StatusText>{data.status}</StatusText>
            </StatusBadge>
          </PriceContainer>
          <StatsContainer>
            <StatItem>
              <Ionicons name="chatbubble-outline" size={14} color="#999999" />
              <StatText>{data.comments}</StatText>
            </StatItem>
            <StatItem>
              <Ionicons name="heart-outline" size={14} color="#999999" />
              <StatText>{data.likes}</StatText>
            </StatItem>
          </StatsContainer>
        </BottomSection>
      </ContentContainer>
    </CardContainer>
  );
}
