import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  margin-bottom: 20px;
`;

const Label = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #09182a;
  margin-bottom: 8px;
`;

const InputContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #09182a;
  background-color: #ffffff;
`;

const AddButton = styled(TouchableOpacity)`
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #5bc0eb;
`;

const TagsContainer = styled(ScrollView)`
  flex-direction: row;
  margin-top: 12px;
  gap: 8px;
`;

const Tag = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: #e8f6fc;
`;

const TagText = styled(Text)`
  font-size: 14px;
  color: #5bc0eb;
`;

const RemoveButton = styled(TouchableOpacity)`
  padding: 2px;
`;

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
}

export default function TagInput({
  tags,
  onAddTag,
  onRemoveTag,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    if (inputValue.trim()) {
      const tag = inputValue.startsWith("#")
        ? inputValue.trim()
        : `#${inputValue.trim()}`;
      onAddTag(tag);
      setInputValue("");
    }
  };

  return (
    <Container>
      <Label>태그 추가</Label>
      <InputContainer>
        <StyledInput
          placeholder="#태그명"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAddTag}
        />
        <AddButton onPress={handleAddTag}>
          <Ionicons name="add" size={20} color="#ffffff" />
        </AddButton>
      </InputContainer>
      {tags.length > 0 && (
        <TagsContainer horizontal showsHorizontalScrollIndicator={false}>
          {tags.map((tag, index) => (
            <Tag key={index}>
              <TagText>{tag}</TagText>
              <RemoveButton onPress={() => onRemoveTag(index)}>
                <Ionicons name="close" size={16} color="#5bc0eb" />
              </RemoveButton>
            </Tag>
          ))}
        </TagsContainer>
      )}
    </Container>
  );
}
