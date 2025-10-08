import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { defaultColor } from "../../utils/Color";

const Container = styled(View)`
  margin-bottom: 20px;
`;

const Label = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #09182a;
  margin-bottom: 8px;
`;

const TextArea = styled(TextInput)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #09182a;
  background-color: #ffffff;
  min-height: 150px;
`;

const AIButtonContainer = styled(View)`
  margin-top: 12px;
  flex-direction: row;
  gap: 8px;
`;

const AIButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  background-color: ${defaultColor.subBtnColor};
`;

const AIButtonText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

interface AIContentGeneratorProps {
  value: string;
  onChange: (text: string) => void;
  onAIGenerate: () => void;
}

export default function AIContentGenerator({
  value,
  onChange,
  onAIGenerate,
}: AIContentGeneratorProps) {
  return (
    <Container>
      <Label>
        아이디어 소개글 <Text style={{ color: "#FF0000" }}>*</Text>
      </Label>
      <TextArea
        placeholder="아이디어에 대한 자세한 설명을 작성하거나, 키워드를 입력 후 AI 글 작성하기를 눌러보세요."
        value={value}
        onChangeText={onChange}
        multiline
      />
      <AIButtonContainer>
        <AIButton onPress={onAIGenerate}>
          <Ionicons name="sparkles" size={18} color="#ffffff" />
          <AIButtonText>AI 글 작성하기</AIButtonText>
        </AIButton>
      </AIButtonContainer>
    </Container>
  );
}
