import { ReactNode } from "react";
import styled from "styled-components/native";

const Button = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const IconContainer = styled.View``;
const Title = styled.Text``;

interface SignInButtonProps {
  title: string;
  children?: ReactNode;
  onPress?: () => void;
  style?: {
    paddingHorizontal?: number;
    paddingVertical?: number;
    fontFamily?: string;
    gap?: number;
    borderWidth?: number;
    borderRadius?: number;
    backgroundColor?: string;
  };
}

export default function SignInButton({
  title,
  children,
  style,
  onPress,
}: SignInButtonProps) {
  return (
    <Button
      onPress={onPress}
      style={{
        gap: style?.gap,
        borderWidth: style?.borderWidth,
        paddingHorizontal: style?.paddingHorizontal,
        paddingVertical: style?.paddingVertical,
        borderRadius: style?.borderRadius,
        backgroundColor: style?.backgroundColor,
      }}
    >
      <IconContainer>{children}</IconContainer>
      <Title style={{ fontFamily: style?.fontFamily }}>{title}</Title>
    </Button>
  );
}
