import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
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
import { AuthStackList } from "../navigations/AuthStack";
import { defaultColor } from "../utils/Color";
import { validatePassword } from "../utils/authErrorHandler";

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
  margin-top: 143px;
  margin-bottom: 56px;
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

const EyeIconWrapper = styled(TouchableOpacity)`
  position: absolute;
  right: 15px;
  top: 15px;
`;

const ButtonContainer = styled(View)`
  width: 100%;
  margin: auto;
`;

export default function SignUp() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    navigation.navigate("VerifyEmail");
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
                returnKeyType="next"
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
                returnKeyType="next"
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
                returnKeyType="next"
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
                returnKeyType="next"
              />
            </InputContainer>

            <ButtonContainer>
              <PrimaryButton
                title="인증하러 가기"
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
