import { Text, TouchableOpacity } from "react-native";
import styled from "styled-components";
import { defaultColor } from "../../utils/Color";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

const ButtonContainer = styled(TouchableOpacity)<{ disabled?: boolean }>`
  background-color: ${(props) =>
    props.disabled ? "#cccccc" : defaultColor.btnColor};
  height: 50px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin: 0 12px;
`;

const ButtonText = styled(Text)`
  font-size: 24px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
  text-align: center;
`;

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <ButtonContainer onPress={onPress} disabled={disabled}>
      <ButtonText>{title}</ButtonText>
    </ButtonContainer>
  );
}
