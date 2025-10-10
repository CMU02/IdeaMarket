import { Modal, Text, TouchableOpacity, View } from "react-native";
import styled from "styled-components";
import { Ionicons } from "@expo/vector-icons";
import { defaultColor } from "../utils/Color";

interface IdeaOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  isMyIdea: boolean;
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

const OptionButton = styled(TouchableOpacity)<{ variant?: "delete" }>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.variant === "delete" ? "#ff4444" : defaultColor.mainColor};
  margin-bottom: 12px;
`;

const OptionText = styled(Text)`
  font-size: 16px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

export default function IdeaOptionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
  onReport,
  onShare,
  isMyIdea,
}: IdeaOptionsModalProps) {
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

          {isMyIdea ? (
            <>
              {onEdit && (
                <OptionButton onPress={onEdit}>
                  <Ionicons name="create-outline" size={20} color="#ffffff" />
                  <OptionText>수정하기</OptionText>
                </OptionButton>
              )}

              {onDelete && (
                <OptionButton variant="delete" onPress={onDelete}>
                  <Ionicons name="trash-outline" size={20} color="#ffffff" />
                  <OptionText>삭제하기</OptionText>
                </OptionButton>
              )}
            </>
          ) : (
            <>
              {onShare && (
                <OptionButton onPress={onShare}>
                  <Ionicons name="share-outline" size={20} color="#ffffff" />
                  <OptionText>공유하기</OptionText>
                </OptionButton>
              )}

              {onReport && (
                <OptionButton variant="delete" onPress={onReport}>
                  <Ionicons name="flag-outline" size={20} color="#ffffff" />
                  <OptionText>신고하기</OptionText>
                </OptionButton>
              )}
            </>
          )}
        </ModalContainer>
      </ModalOverlay>
    </Modal>
  );
}
