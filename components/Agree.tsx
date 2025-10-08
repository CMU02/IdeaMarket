import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import styled from "styled-components";
import PrimaryButton from "./social-auth-buttons/PrimaryButton";
import { defaultColor } from "../utils/Color";

interface AgreeProps {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
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
  padding: 30px 26px;
  shadow-color: #000;
  shadow-offset: 1px 1px;
  shadow-opacity: 0.25;
  shadow-radius: 1px;
  elevation: 5;
  max-height: 400px;
`;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled(Text)`
  font-size: 30px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const CloseButton = styled(TouchableOpacity)`
  padding: 5px;
`;

const TermsContainer = styled(View)`
  gap: 15px;
  margin-bottom: 30px;
`;

const TermItem = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TermLeft = styled(View)`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const CheckboxContainer = styled(TouchableOpacity)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid ${defaultColor.textColor};
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const CheckboxInner = styled(View)<{ checked: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${(props) =>
    props.checked ? defaultColor.textColor : "transparent"};
`;

const TermText = styled(Text)`
  font-size: 15px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const ViewButton = styled(TouchableOpacity)``;

const ViewButtonText = styled(Text)`
  font-size: 15px;
  font-family: "Paperlogy-SemiBold";
  color: rgba(0, 0, 0, 0.5);
  text-decoration-line: underline;
`;

const ButtonContainer = styled(View)`
  margin: 0 -12px;
`;

const TermDetailModal = styled(Modal)``;

const TermDetailOverlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const TermDetailContainer = styled(View)`
  background-color: #ffffff;
  border-radius: 15px;
  padding: 20px;
  width: 90%;
  max-height: 70%;
`;

const TermDetailHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const TermDetailTitle = styled(Text)`
  font-size: 20px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const TermDetailContent = styled(ScrollView)`
  max-height: 400px;
`;

const TermDetailText = styled(Text)`
  font-size: 14px;
  font-family: "Paperlogy-Medium";
  color: ${defaultColor.textColor};
  line-height: 22px;
`;

// 약관 데이터
const termsData = [
  {
    id: 1,
    title: "(필수) 서비스 이용약관",
    content: `제1조 (목적)
본 약관은 IdeaMarket(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 아이디어 공유 및 거래 플랫폼을 의미합니다.
2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.
3. "회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.
2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.

제4조 (서비스의 제공)
1. 회사는 이용자에게 아이디어 공유 및 거래 서비스를 제공합니다.
2. 회사는 서비스의 품질 향상을 위해 지속적으로 노력합니다.`,
  },
  {
    id: 2,
    title: "(필수) 개인정보 처리방침",
    content: `제1조 (개인정보의 수집 및 이용목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다.

1. 회원 가입 및 관리
- 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증
- 회원자격 유지·관리, 서비스 부정이용 방지

2. 서비스 제공
- 아이디어 공유 및 거래 서비스 제공
- 맞춤형 서비스 제공, 본인인증

3. 마케팅 및 광고 활용
- 신규 서비스 개발 및 맞춤 서비스 제공
- 이벤트 및 광고성 정보 제공 및 참여기회 제공

제2조 (개인정보의 처리 및 보유기간)
회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

제3조 (개인정보의 제3자 제공)
회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령의 규정에 의한 경우는 예외로 합니다.`,
  },
  {
    id: 3,
    title: "(필수) 위치기반 서비스 이용약관",
    content: `제1조 (목적)
본 약관은 회사가 제공하는 위치기반서비스와 관련하여 회사와 개인위치정보주체와의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (서비스 내용)
회사는 위치정보사업자로부터 수집한 개인위치정보를 이용하여 다음과 같은 서비스를 제공합니다.
1. 위치 기반 아이디어 추천 서비스
2. 주변 사용자 검색 서비스
3. 지역별 트렌드 분석 서비스

제3조 (개인위치정보의 이용 또는 제공)
1. 회사는 개인위치정보를 이용하여 서비스를 제공하고자 하는 경우 미리 이용약관에 명시한 후 개인위치정보주체의 동의를 얻어야 합니다.
2. 회사는 개인위치정보주체의 동의 없이 개인위치정보를 제3자에게 제공하지 않습니다.

제4조 (개인위치정보의 보유기간)
회사는 위치기반서비스 제공을 위해 필요한 최소한의 기간 동안 개인위치정보를 보유합니다.`,
  },
  {
    id: 4,
    title: "(필수) 마케팅 정보 수신 동의",
    content: `제1조 (목적)
본 동의는 회사가 제공하는 다양한 혜택 및 이벤트 정보를 이용자에게 제공하기 위한 목적으로 합니다.

제2조 (수집하는 개인정보 항목)
회사는 마케팅 정보 제공을 위해 다음의 개인정보를 수집합니다.
- 이메일 주소
- 휴대전화번호
- 서비스 이용 기록

제3조 (마케팅 정보의 내용)
1. 신규 서비스 및 기능 안내
2. 이벤트 및 프로모션 정보
3. 맞춤형 광고 및 추천 서비스
4. 설문조사 및 이벤트 참여 안내

제4조 (정보 수신 방법)
마케팅 정보는 다음의 방법으로 제공됩니다.
- 이메일
- SMS/MMS
- 푸시 알림
- 앱 내 알림

제5조 (동의 철회)
이용자는 언제든지 마케팅 정보 수신 동의를 철회할 수 있으며, 동의 철회 시 관련 서비스 제공이 중단됩니다.`,
  },
];

export default function Agree({ visible, onClose, onAgree }: AgreeProps) {
  const [agreements, setAgreements] = useState([false, false, false, false]);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);

  const toggleAgreement = (index: number) => {
    const newAgreements = [...agreements];
    newAgreements[index] = !newAgreements[index];
    setAgreements(newAgreements);
  };

  const allAgreed = agreements.every((agreed) => agreed);

  const handleAgree = () => {
    if (allAgreed) {
      onAgree();
    }
  };

  const handleViewTerm = (index: number) => {
    setSelectedTerm(index);
  };

  const handleCloseTermDetail = () => {
    setSelectedTerm(null);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <ModalOverlay>
          <ModalContainer>
            <Header>
              <Title>약관 동의</Title>
              <CloseButton onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={defaultColor.textColor}
                />
              </CloseButton>
            </Header>

            <TermsContainer>
              {termsData.map((term, index) => (
                <TermItem key={term.id}>
                  <TermLeft>
                    <CheckboxContainer onPress={() => toggleAgreement(index)}>
                      <CheckboxInner checked={agreements[index]} />
                    </CheckboxContainer>
                    <TermText>{term.title}</TermText>
                  </TermLeft>
                  <ViewButton onPress={() => handleViewTerm(index)}>
                    <ViewButtonText>보기</ViewButtonText>
                  </ViewButton>
                </TermItem>
              ))}
            </TermsContainer>

            <ButtonContainer>
              <PrimaryButton
                title="가입하기"
                onPress={handleAgree}
                disabled={!allAgreed}
              />
            </ButtonContainer>
          </ModalContainer>
        </ModalOverlay>
      </Modal>

      {/* 약관 상세보기 모달 */}
      {selectedTerm !== null && (
        <TermDetailModal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={handleCloseTermDetail}
        >
          <TermDetailOverlay>
            <TermDetailContainer>
              <TermDetailHeader>
                <TermDetailTitle>
                  {termsData[selectedTerm].title}
                </TermDetailTitle>
                <CloseButton onPress={handleCloseTermDetail}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={defaultColor.textColor}
                  />
                </CloseButton>
              </TermDetailHeader>
              <TermDetailContent>
                <TermDetailText>
                  {termsData[selectedTerm].content}
                </TermDetailText>
              </TermDetailContent>
            </TermDetailContainer>
          </TermDetailOverlay>
        </TermDetailModal>
      )}
    </>
  );
}
