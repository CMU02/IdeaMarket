import React from "react";
import { View, Text, TextInput } from "react-native";
import styled from "styled-components/native";
import Switch from "../common/Switch";
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

const SwitchWrapper = styled(View)`
  margin-bottom: 12px;
`;

const PriceInput = styled(TextInput)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #09182a;
  background-color: #ffffff;
`;
const SwitchContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
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
      <SwitchContainer>
        <Label>
          가격 설정 <Text style={{ color: "#FF0000" }}>*</Text>
        </Label>
        <Switch
          leftLabel="무료"
          rightLabel="유료"
          isLeft={isFree}
          onToggle={onTypeChange}
          leftColor={defaultColor.btnColor}
          rightColor={defaultColor.mainColor}
        />
      </SwitchContainer>

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
