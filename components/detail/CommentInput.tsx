import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #e0e0e0;
`;

const Input = styled(TextInput)`
  flex: 1;
  height: 40px;
  background-color: rgba(9, 24, 42, 0.08);
  border-radius: 20px;
  padding: 0 16px;
  font-size: 15px;
  color: #09182a;
`;

const SendButton = styled(TouchableOpacity)`
  margin-left: 12px;
  padding: 6px;
`;

interface CommentInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

export default function CommentInput({
  onSend,
  placeholder = "댓글을 입력하세요",
}: CommentInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <Container>
      <Input
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="rgba(9, 24, 42, 0.5)"
        multiline={false}
      />
      <SendButton onPress={handleSend}>
        <Ionicons name="send" size={22} color="#09182a" />
      </SendButton>
    </Container>
  );
}
