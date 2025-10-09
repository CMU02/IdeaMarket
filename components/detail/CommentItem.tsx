import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  padding: 14px 0;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const Avatar = styled(View)`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: #e0e0e0;
  margin-right: 10px;
`;

const UserName = styled(Text)`
  font-size: 15px;
  font-weight: 700;
  color: #09182a;
`;

const AuthorBadge = styled(Text)`
  font-size: 11px;
  color: #666;
  margin-left: 6px;
  font-weight: 500;
`;

const Content = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-left: 34px;
  margin-bottom: 8px;
  line-height: 20px;
`;

const Footer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-left: 34px;
`;

const Timestamp = styled(Text)`
  font-size: 11px;
  color: rgba(9, 24, 42, 0.5);
  font-weight: 500;
`;

const Actions = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: rgba(9, 24, 42, 0.15);
  border-radius: 10px;
  padding: 5px 10px;
  gap: 10px;
`;

const ActionButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const Divider = styled(View)`
  width: 1px;
  height: 12px;
  background-color: rgba(9, 24, 42, 0.25);
`;

export interface CommentData {
  id: string;
  userName: string;
  content: string;
  timestamp: string;
  isAuthor?: boolean;
  parentCommentId?: string | null;
}

interface CommentItemProps {
  comment: CommentData;
  onReply?: (commentId: string) => void;
  onMore?: (commentId: string) => void;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  onReply,
  onMore,
  isReply = false,
}: CommentItemProps) {
  return (
    <Container style={{ marginLeft: isReply ? 48 : 0 }}>
      <Header>
        <Avatar />
        <UserName>
          {comment.userName}
          {comment.isAuthor && <AuthorBadge>(작성자)</AuthorBadge>}
        </UserName>
      </Header>
      <Content>{comment.content}</Content>
      <Footer>
        <Timestamp>{comment.timestamp}</Timestamp>
        <Actions>
          <ActionButton onPress={() => onReply?.(comment.id)}>
            <Ionicons name="chatbubble" size={14} color="#09182a" />
          </ActionButton>
          <Divider />
          <ActionButton onPress={() => onMore?.(comment.id)}>
            <Ionicons name="ellipsis-horizontal" size={14} color="#09182a" />
          </ActionButton>
        </Actions>
      </Footer>
    </Container>
  );
}
