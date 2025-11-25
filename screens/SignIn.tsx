import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
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
import PrimaryButton from "../components/social-auth-buttons/PrimaryButton";
import { supabase } from "../lib/Supabase";
import { AuthStackList } from "../navigations/AuthStack";
import { defaultColor } from "../utils/Color";
import { getAuthErrorMessage, validateEmail } from "../utils/authErrorHandler";

const Container = styled(ScrollView)`
  flex: 1;
  background-color: ${defaultColor.mainColor};
`;

const ContentContainer = styled(View)`
  width: 100%;
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

const LinksContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 60px;
`;

const LinkText = styled(Text)`
  font-size: 12px;
  font-family: "Paperlogy-SemiBold";
  color: rgba(255, 255, 255, 0.8);
`;

const Divider = styled(View)`
  width: 1px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  margin: 0 15px;
`;

const ButtonContainer = styled(View)`
  width: 100%;
  margin-bottom: auto;
`;

export default function SignIn() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 유효성 검사
    if (!email.trim() || !password.trim()) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("입력 오류", "올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        const errorMessage = getAuthErrorMessage(error);
        Alert.alert("로그인 실패", errorMessage);
        console.error(`로그인 에러 : ${error}`);
        return;
      }

      // 로그인 성공
      console.log("로그인 성공:", data);
    } catch (error) {
      Alert.alert(
        "오류 발생",
        "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
      console.error("로그인 에러:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindId = () => {
    Alert.alert("준비 중", "아이디 찾기 기능은 준비 중입니다.");
  };

  const handleFindPassword = () => {
    Alert.alert("준비 중", "비밀번호 찾기 기능은 준비 중입니다.");
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container keyboardShouldPersistTaps="handled">
          <ContentContainer>
            <Title>로그인</Title>

            <InputContainer>
              <Input
                placeholder="아이디"
                placeholderTextColor="rgba(9, 24, 42, 0.5)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                returnKeyType="next"
              />
            </InputContainer>

            <InputContainer>
              <Input
                placeholder="비밀번호"
                placeholderTextColor="rgba(9, 24, 42, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </InputContainer>

            <LinksContainer>
              <TouchableOpacity onPress={handleFindId}>
                <LinkText>아이디 찾기</LinkText>
              </TouchableOpacity>
              <Divider />
              <TouchableOpacity onPress={handleFindPassword}>
                <LinkText>비밀번호 찾기</LinkText>
              </TouchableOpacity>
              <Divider />
              <TouchableOpacity onPress={handleSignUp}>
                <LinkText>회원가입</LinkText>
              </TouchableOpacity>
            </LinksContainer>

            <ButtonContainer>
              <PrimaryButton
                title="로그인"
                onPress={handleLogin}
                disabled={loading}
              />
            </ButtonContainer>
          </ContentContainer>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
