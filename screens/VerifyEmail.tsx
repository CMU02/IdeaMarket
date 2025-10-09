import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import styled from "styled-components";
import Agree from "../components/Agree";
import PrimaryButton from "../components/social-auth-buttons/PrimaryButton";
import SmallButton from "../components/social-auth-buttons/SmallButton";
import { AuthStackList } from "../navigations/AuthStack";
import { defaultColor } from "../utils/Color";
import {
  saveTermsAgreement,
  signUpWithEmail,
  sendEmailVerificationCode,
  verifyEmailCode,
} from "../lib/services/AuthService";

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${defaultColor.mainColor};
`;

const ContentContainer = styled(View)`
  padding: 0 25px;
  flex: 1;
`;

const Title = styled(Text)`
  font-size: 40px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
  margin-top: 143px;
  margin-bottom: 56px;
`;

const InputContainer = styled(View)`
  margin-bottom: 20px;
  position: relative;
`;

const InputWithButton = styled(View)`
  position: relative;
`;

const InputWithButtonField = styled(TextInput)`
  background-color: #ffffff;
  height: 50px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  padding: 0 15px;
  padding-right: 60px;
  font-size: 15px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const EmailDisplayBox = styled(View)`
  background-color: #ffffff;
  height: 50px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  padding: 0 15px;
  padding-right: 60px;
  justify-content: center;
`;

const EmailText = styled(Text)`
  font-size: 15px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const SmallButtonWrapper = styled(View)`
  position: absolute;
  right: 10px;
  top: 13px;
`;

const TimerText = styled(Text)`
  position: absolute;
  right: 65px;
  top: 18px;
  font-size: 13px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.subBtnColor};
`;

const ButtonContainer = styled(View)`
  margin: 0 -12px;
  margin-top: auto;
  margin-bottom: 40px;
`;

type VerifyEmailRouteProp = RouteProp<AuthStackList, "VerifyEmail">;

export default function VerifyEmail() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();
  const route = useRoute<VerifyEmailRouteProp>();
  const { email: initialEmail, password, displayName } = route.params;

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(300); // 5분 = 300초
  const [isVerified, setIsVerified] = useState(false);
  const [showAgreeModal, setShowAgreeModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 타이머 카운트다운
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailSent && timer > 0 && !isVerified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailSent, timer, isVerified]);

  // 타이머 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      // 먼저 회원가입 진행
      const signUpResult = await signUpWithEmail(
        initialEmail.trim(),
        password,
        {
          displayName,
        }
      );

      if (signUpResult.error || !signUpResult.userId) {
        Alert.alert("회원가입 실패", signUpResult.error || "알 수 없는 오류");
        return;
      }

      setUserId(signUpResult.userId);

      // 회원가입 성공 후 이메일 인증 코드 전송
      const sendResult = await sendEmailVerificationCode(initialEmail.trim());

      if (!sendResult.success) {
        Alert.alert(
          "오류",
          sendResult.error || "인증 코드 전송에 실패했습니다."
        );
        return;
      }

      Alert.alert(
        "인증 코드 전송",
        "이메일로 6자리 인증 코드가 전송되었습니다."
      );
      setEmailSent(true);
      setTimer(300);
    } catch (error) {
      Alert.alert("오류", "인증 코드 전송 중 문제가 발생했습니다.");
      console.error("이메일 인증 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("입력 오류", "인증 코드를 입력해주세요.");
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert("입력 오류", "인증 코드는 6자리 숫자입니다.");
      return;
    }

    setLoading(true);
    try {
      // 인증 코드 검증
      const verifyResult = await verifyEmailCode(
        initialEmail.trim(),
        verificationCode.trim()
      );

      if (!verifyResult.success) {
        Alert.alert(
          "인증 실패",
          verifyResult.error || "인증 코드가 올바르지 않습니다."
        );
        return;
      }

      setIsVerified(true);
      Alert.alert("인증 성공", "이메일 인증이 완료되었습니다.");
    } catch (error) {
      Alert.alert("오류", "인증 코드 확인 중 문제가 발생했습니다.");
      console.error("인증 코드 검증 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeTerms = () => {
    if (!isVerified) {
      Alert.alert("인증 필요", "이메일 인증을 완료해주세요.");
      return;
    }

    // 약관 동의 모달 표시
    setShowAgreeModal(true);
  };

  const handleAgreeComplete = async () => {
    if (!userId) {
      Alert.alert("오류", "사용자 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      // 약관 동의 정보 저장
      await saveTermsAgreement(userId);

      setShowAgreeModal(false);
      Alert.alert("가입 완료", "회원가입이 완료되었습니다!", [
        {
          text: "확인",
          onPress: () => {
            navigation.navigate("SignIn");
          },
        },
      ]);
    } catch (error) {
      console.error("약관 동의 저장 오류:", error);
      Alert.alert("오류", "약관 동의 처리 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeClose = () => {
    setShowAgreeModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContentContainer>
            <Title>이메일 인증</Title>

            {/* 이메일 */}
            <InputContainer>
              <InputWithButton>
                <EmailDisplayBox>
                  <EmailText>{initialEmail}</EmailText>
                </EmailDisplayBox>
                <SmallButtonWrapper>
                  <SmallButton
                    title="인증"
                    onPress={handleSendVerification}
                    disabled={loading || emailSent}
                  />
                </SmallButtonWrapper>
              </InputWithButton>
            </InputContainer>

            {/* 인증 코드 */}
            {emailSent && (
              <InputContainer>
                <InputWithButton>
                  <InputWithButtonField
                    placeholder="인증 코드 6자리 입력"
                    placeholderTextColor="rgba(9, 24, 42, 0.5)"
                    value={verificationCode}
                    onChangeText={(text) => {
                      // 숫자만 입력 가능, 최대 6자리
                      const numericText = text.replace(/[^0-9]/g, "");
                      if (numericText.length <= 6) {
                        setVerificationCode(numericText);
                      }
                    }}
                    keyboardType="number-pad"
                    editable={!isVerified && timer > 0}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyCode}
                    maxLength={6}
                  />
                  {!isVerified && timer > 0 && (
                    <TimerText>{formatTime(timer)}</TimerText>
                  )}
                  <SmallButtonWrapper>
                    <SmallButton
                      title="확인"
                      onPress={handleVerifyCode}
                      variant="secondary"
                      disabled={isVerified || timer === 0 || loading}
                    />
                  </SmallButtonWrapper>
                </InputWithButton>
              </InputContainer>
            )}

            <ButtonContainer>
              <PrimaryButton
                title="약관 동의"
                onPress={handleAgreeTerms}
                disabled={loading || !isVerified}
              />
            </ButtonContainer>
          </ContentContainer>
        </Container>
      </TouchableWithoutFeedback>

      {/* 약관 동의 모달 */}
      <Agree
        visible={showAgreeModal}
        onClose={handleAgreeClose}
        onAgree={handleAgreeComplete}
      />
    </KeyboardAvoidingView>
  );
}
