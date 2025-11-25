import { Text, TouchableOpacity } from "react-native";
import styled from "styled-components";
import { defaultColor } from "../../utils/Color";

interface SmallButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const ButtonContainer = styled(TouchableOpacity)<{
  variant: "primary" | "secondary";
  disabled?: boolean;
}>`
  background-color: ${(props) =>
    props.disabled
      ? "#cccccc"
      : props.variant === "primary"
      ? defaultColor.btnColor
      : defaultColor.subBtnColor};
  height: 24px;
  width: 45px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 1px 1px;
  shadow-opacity: 0.25;
  shadow-radius: 1px;
  elevation: 2;
`;

const ButtonText = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  text-align: center;
`;

export default function SmallButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: SmallButtonProps) {
  return (
    <ButtonContainer
      onPress={onPress}
      variant={variant}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <ButtonText>{title}</ButtonText>
    </ButtonContainer>
  );
}
