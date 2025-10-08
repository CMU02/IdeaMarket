import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import styled from "styled-components/native";

const Container = styled(View)`
  margin-bottom: 20px;
`;

const Label = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #09182a;
  margin-bottom: 8px;
`;

const OptionContainer = styled(View)`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 12px;
`;

const OptionButton = styled(TouchableOpacity)<{ selected: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.selected ? "#5BC0EB" : "#e0e0e0")};
  background-color: ${(props) => (props.selected ? "#E8F6FC" : "#ffffff")};
  align-items: center;
`;

const OptionText = styled(Text)<{ selected: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.selected ? "600" : "400")};
  color: ${(props) => (props.selected ? "#5BC0EB" : "#666666")};
`;

const PriceInput = styled(TextInput)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #09182a;
  background-color: #ffffff;
`;

interface PriceSelectorProps {
  isFree: boolean;
  price: string;
  onTypeChange: (isFree: boolean) => void;
  onPriceChange: (price: string) => void;
}

export default function PriceSelector({
  isFree,
  price,
  onTypeChange,
  onPriceChange,
}: PriceSelectorProps) {
  return (
    <Container>
      <Label>
        가격 설정 <Text style={{ color: "#FF0000" }}>*</Text>
      </Label>
      <OptionContainer>
        <OptionButton selected={isFree} onPress={() => onTypeChange(true)}>
          <OptionText selected={isFree}>무료</OptionText>
        </OptionButton>
        <OptionButton selected={!isFree} onPress={() => onTypeChange(false)}>
          <OptionText selected={!isFree}>유료</OptionText>
        </OptionButton>
      </OptionContainer>
      {!isFree && (
        <PriceInput
          placeholder="가격을 입력하세요 (원)"
          value={price}
          onChangeText={onPriceChange}
          keyboardType="numeric"
        />
      )}
    </Container>
  );
}
