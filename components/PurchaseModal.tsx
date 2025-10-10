import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import styled from "styled-components";
import PrimaryButton from "./social-auth-buttons/PrimaryButton";
import { defaultColor } from "../utils/Color";
import Button from "./common/Button";

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onRequest: () => void;
  price: number;
}

const ModalOverlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContainer = styled(View)`
  background-color: #ffffff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px 26px 30px;
  shadow-color: #000;
  shadow-offset: 1px 1px;
  shadow-opacity: 0.25;
  shadow-radius: 1px;
  elevation: 5;
`;

const DragIndicator = styled(View)`
  width: 60px;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  align-self: center;
  margin-bottom: 20px;
`;

const InfoBox = styled(View)`
  background-color: ${defaultColor.textColor};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const InfoText = styled(Text)`
  font-size: 15px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
  margin-bottom: 10px;
`;

const Divider = styled(View)`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 10px 0;
`;

const ButtonContainer = styled(View)`
  margin: 0 -12px;
  padding: 0 12px;
`;
const RequestButton = styled(TouchableOpacity)`
  width: 100%;
  background-color: ${defaultColor.mainColor};
  padding: 20px 0px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;
const RequestText = styled(Text)`
  color: #fff;
  font-size: 20px;
  font-family: "Paperlogy-Medium";
`;

export default function PurchaseModal({
  visible,
  onClose,
  onRequest,
  price,
}: PurchaseModalProps) {
  const formattedPrice = price.toLocaleString("ko-KR");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <ModalOverlay>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <ModalContainer>
          <DragIndicator />
          <InfoBox>
            <InfoText>계좌번호 : 999-999999-99999 (하나은행)</InfoText>
            <Divider />
            <InfoText style={{ marginBottom: 0 }}>
              가격 : {formattedPrice}원
            </InfoText>
          </InfoBox>

          <ButtonContainer>
            <RequestButton onPress={onRequest}>
              <RequestText>요청하기</RequestText>
            </RequestButton>
          </ButtonContainer>
        </ModalContainer>
      </ModalOverlay>
    </Modal>
  );
}
