import { useNavigation } from "@react-navigation/native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components";
import Agree from "../components/Agree";
import PrimaryButton from "../components/social-auth-buttons/PrimaryButton";
import SmallButton from "../components/social-auth-buttons/SmallButton";
import { supabase } from "../lib/Supabase";
import { AuthStackList } from "../navigations/AuthStack";
import { defaultColor } from "../utils/Color";
import { validateEmail } from "../utils/authErrorHandler";

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

export default function VerifyEmail() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();
  const { top, bottom } = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(300); // 5분 = 300초
  const [isVerified, setIsVerified] = useState(false);
  const [showAgreeModal, setShowAgreeModal] = useState(false);

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
    if (!validateEmail(email)) {
      Alert.alert("입력 오류", "올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // Supabase 이메일 인증 코드 전송
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });

      if (error) {
        Alert.alert("오류", "인증 코드 전송에 실패했습니다.");
        console.error("이메일 인증 에러:", error);
        return;
      }

      Alert.alert("인증 코드 전송", "이메일로 인증 코드가 전송되었습니다.");
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
      // Supabase OTP 검증 (6자리 코드)
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: verificationCode.trim(),
        type: "email",
      });

      if (error) {
        Alert.alert("인증 실패", "인증 코드가 올바르지 않습니다.");
        console.error("인증 코드 검증 에러:", error);
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

  const handleAgreeComplete = () => {
    setShowAgreeModal(false);
    Alert.alert("가입 완료", "회원가입이 완료되었습니다!", [
      {
        text: "확인",
        onPress: () => {
          // 로그인 화면으로 이동하거나 자동 로그인 처리
          navigation.navigate("SignIn");
        },
      },
    ]);
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
                <InputWithButtonField
                  placeholder="이메일"
                  placeholderTextColor="rgba(9, 24, 42, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading && !emailSent}
                  returnKeyType="done"
                />
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
                disabled={loading}
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
