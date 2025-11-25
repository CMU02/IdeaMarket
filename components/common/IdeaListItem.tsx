import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { defaultColor } from "../../utils/Color";

const Container = styled(TouchableOpacity)`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ThumbnailContainer = styled(View)`
  width: 100%;
  height: 150px;
  border-radius: 8px;
  background-color: #d9d9d9;
  margin-bottom: 12px;
  overflow: hidden;
`;

const Thumbnail = styled(Image)`
  width: 100%;
  height: 100%;
`;

const InfoContainer = styled(View)`
  flex: 1;
`;

const Title = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  margin-bottom: 8px;
`;

const Description = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.7);
  margin-bottom: 12px;
  line-height: 20px;
`;

const MetaRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PriceContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const Price = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const Badge = styled(View)`
  background-color: ${defaultColor.textColor};
  border-radius: 10px;
  padding: 3px 8px;
`;

const BadgeText = styled(Text)`
  font-size: 10px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const DateText = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-Medium";
  color: rgba(9, 24, 42, 0.5);
`;

const ActionsContainer = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled(TouchableOpacity)<{ variant?: "delete" }>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.variant === "delete" ? "#ff4444" : defaultColor.mainColor};
`;

const ActionButtonText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

export interface IdeaListItemData {
  id: string;
  title: string;
  short_description: string;
  price: number | null;
  is_free: boolean;
  image_uris: string[];
  created_at: string;
}

interface IdeaListItemProps {
  idea: IdeaListItemData;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function IdeaListItem({
  idea,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}: IdeaListItemProps) {
  const formattedDate = new Date(idea.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const thumbnailUri = idea.image_uris?.[0];

  return (
    <Container onPress={onPress} disabled={!onPress}>
      {thumbnailUri && (
        <ThumbnailContainer>
          <Thumbnail source={{ uri: thumbnailUri }} resizeMode="cover" />
        </ThumbnailContainer>
      )}

      <InfoContainer>
        <Title numberOfLines={2}>{idea.title}</Title>
        <Description numberOfLines={2}>{idea.short_description}</Description>

        <MetaRow>
          <PriceContainer>
            <Price>
              {idea.is_free ? "무료" : `${idea.price?.toLocaleString()}원`}
            </Price>
            <Badge>
              <BadgeText>{idea.is_free ? "무료" : "유료"}</BadgeText>
            </Badge>
          </PriceContainer>
          <DateText>{formattedDate}</DateText>
        </MetaRow>

        {showActions && (
          <ActionsContainer>
            {onEdit && (
              <ActionButton onPress={onEdit}>
                <Ionicons name="create-outline" size={16} color="#ffffff" />
                <ActionButtonText>수정</ActionButtonText>
              </ActionButton>
            )}
            {onDelete && (
              <ActionButton variant="delete" onPress={onDelete}>
                <Ionicons name="trash-outline" size={16} color="#ffffff" />
                <ActionButtonText>삭제</ActionButtonText>
              </ActionButton>
            )}
          </ActionsContainer>
        )}
      </InfoContainer>
    </Container>
  );
}
