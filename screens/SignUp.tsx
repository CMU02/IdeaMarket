import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components";
import PrimaryButton from "../components/social-auth-buttons/PrimaryButton";
import SmallButton from "../components/social-auth-buttons/SmallButton";
import { AuthStackList } from "../navigations/AuthStack";
import { defaultColor } from "../utils/Color";
import { validateEmail, validatePassword } from "../utils/authErrorHandler";

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${defaultColor.mainColor};
`;

const ContentContainer = styled(View)`
  padding: 0 25px;
  min-height: 100%;
`;

const Title = styled(Text)`
  font-size: 40px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
  margin-bottom: 55px;
`;

const InputContainer = styled(View)`
  margin-bottom: 20px;
  position: relative;
`;

const Input = styled(TextInput)`
  background-color: #ffffff;
  height: 50px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  padding: 0 15px;
  font-size: 15px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.textColor};
`;

const InputWithButton = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const InputWithButtonField = styled(TextInput)`
  flex: 1;
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
`;

const EyeIconWrapper = styled(TouchableOpacity)`
  position: absolute;
  right: 15px;
  top: 15px;
`;

const TimerText = styled(Text)`
  position: absolute;
  right: 60px;
  top: 17px;
  font-size: 8px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.subBtnColor};
`;

const ButtonContainer = styled(View)`
  width: 100%;
  margin: auto;
`;

export default function SignUp() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();
  const { top, bottom } = useSafeAreaInsets();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(300); // 5분 = 300초
  const [isVerified, setIsVerified] = useState(false);

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
      // 이메일 인증 코드 전송 로직
      // TODO: Supabase 이메일 인증 구현
      Alert.alert("인증 코드 전송", "이메일로 인증 코드가 전송되었습니다.");
      setEmailSent(true);
      setTimer(300);
    } catch (error) {
      Alert.alert("오류", "인증 코드 전송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      Alert.alert("입력 오류", "인증 코드를 입력해주세요.");
      return;
    }

    // 인증 코드 확인 로직
    // TODO: 실제 인증 코드 검증 구현
    setIsVerified(true);
    Alert.alert("인증 성공", "이메일 인증이 완료되었습니다.");
  };

  const handleAgreeTerms = () => {
    // 유효성 검사
    if (!userId.trim()) {
      Alert.alert("입력 오류", "아이디를 입력해주세요.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("입력 오류", "비밀번호를 입력해주세요.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert("입력 오류", passwordValidation.message!);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("입력 오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!nickname.trim()) {
      Alert.alert("입력 오류", "닉네임을 입력해주세요.");
      return;
    }

    if (!isVerified) {
      Alert.alert("인증 필요", "이메일 인증을 완료해주세요.");
      return;
    }

    // 약관 동의 화면으로 이동
    Alert.alert("준비 중", "약관 동의 기능은 준비 중입니다.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ContentContainer style={{ paddingTop: top, paddingBottom: bottom }}>
            <Title>회원가입</Title>

            {/* 아이디 */}
            <InputContainer>
              <Input
                placeholder="아이디"
                placeholderTextColor="rgba(9, 24, 42, 0.5)"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
                editable={!loading}
              />
            </InputContainer>

            {/* 비밀번호 */}
            <InputContainer>
              <Input
                placeholder="비밀번호"
                placeholderTextColor="rgba(9, 24, 42, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <EyeIconWrapper onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="rgba(9, 24, 42, 0.5)"
                />
              </EyeIconWrapper>
            </InputContainer>

            {/* 비밀번호 확인 */}
            <InputContainer>
              <Input
                placeholder="비밀번호 확인"
                placeholderTextColor="rgba(9, 24, 42, 0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <EyeIconWrapper
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="rgba(9, 24, 42, 0.5)"
                />
              </EyeIconWrapper>
            </InputContainer>

            {/* 닉네임 */}
            <InputContainer>
              <Input
                placeholder="닉네임"
                placeholderTextColor="rgba(9, 24, 42, 0.5)"
                value={nickname}
                onChangeText={setNickname}
                editable={!loading}
              />
            </InputContainer>

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
                    placeholder="인증 코드"
                    placeholderTextColor="rgba(9, 24, 42, 0.5)"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    editable={!isVerified && timer > 0}
                  />
                  {!isVerified && timer > 0 && (
                    <TimerText>{formatTime(timer)}</TimerText>
                  )}
                  <SmallButtonWrapper>
                    <SmallButton
                      title="확인"
                      onPress={handleVerifyCode}
                      variant="secondary"
                      disabled={isVerified || timer === 0}
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
    </KeyboardAvoidingView>
  );
}
