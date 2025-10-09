import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { defaultColor } from "../../utils/Color";

const SwitchContainer = styled(View)`
  width: 30%;
  height: 35px;
  border-radius: 15px;
  background-color: #e8e8e8;
  padding: 3px;
  position: relative;
  flex-direction: row;
`;

const SwitchOption = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const SwitchText = styled(Text)<{ active: boolean }>`
  font-size: 13px;
  font-family: "Paperlogy-SemiBold";
  color: ${(props) => (props.active ? "#ffffff" : "#999999")};
`;

const SwitchSlider = styled(View)<{
  isLeft: boolean;
  leftColor?: string;
  rightColor?: string;
}>`
  position: absolute;
  top: 3.5px;
  left: ${(props) => (props.isLeft ? "3px" : "50%")};
  right: ${(props) => (props.isLeft ? "50%" : "3px")};
  height: 27px;
  border-radius: 10px;
  background-color: ${(props) => {
    if (props.isLeft && props.leftColor) return props.leftColor;
    if (!props.isLeft && props.rightColor) return props.rightColor;
    return props.isLeft ? defaultColor.btnColor : defaultColor.mainColor;
  }};
  z-index: 1;
`;

interface SwitchProps {
  leftLabel: string;
  rightLabel: string;
  isLeft: boolean;
  onToggle: (isLeft: boolean) => void;
  leftColor?: string;
  rightColor?: string;
}

export default function Switch({
  leftLabel,
  rightLabel,
  isLeft,
  onToggle,
  leftColor,
  rightColor,
}: SwitchProps) {
  return (
    <SwitchContainer>
      <SwitchSlider
        isLeft={isLeft}
        leftColor={leftColor}
        rightColor={rightColor}
      />
      <SwitchOption onPress={() => onToggle(true)} activeOpacity={0.8}>
        <SwitchText active={isLeft}>{leftLabel}</SwitchText>
      </SwitchOption>
      <SwitchOption onPress={() => onToggle(false)} activeOpacity={0.8}>
        <SwitchText active={!isLeft}>{rightLabel}</SwitchText>
      </SwitchOption>
    </SwitchContainer>
  );
}
