import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import styled from "styled-components/native";
import { defaultColor } from "../../utils/Color";

interface ButtonContainerProps {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

const ButtonContainer = styled(TouchableOpacity)<ButtonContainerProps>`
  padding: 14px 24px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  ${(props) => props.fullWidth && "width: 100%;"}
  ${(props) => {
    switch (props.variant) {
      case "secondary":
        return `background-color: ${defaultColor.subBtnColor};`;
      case "outline":
        return `
          background-color: transparent;
          border: 1px solid ${defaultColor.mainColor};
        `;
      default:
        return `background-color: ${defaultColor.btnColor};`;
    }
  }}
`;

interface ButtonTextProps {
  variant?: "primary" | "secondary" | "outline";
}

const ButtonText = styled(Text)<ButtonTextProps>`
  font-size: 16px;
  font-weight: 600;
  ${(props) => {
    switch (props.variant) {
      case "secondary":
        return "color: #ffffff;";
      case "outline":
        return `color: ${defaultColor.mainColor};`;
      default:
        return `color: ${defaultColor.mainColor};`;
    }
  }}
`;

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <ButtonContainer variant={variant} fullWidth={fullWidth} {...props}>
      <ButtonText variant={variant}>{title}</ButtonText>
    </ButtonContainer>
  );
}
