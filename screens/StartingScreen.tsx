import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components";
import PrimaryButton from "../components/social-auth-buttons/PrimaryButton";
import { AuthStackList } from "../navigations/AuthStack";
import { defaultColor } from "../utils/Color";

const Container = styled(View)`
  flex: 1;
  background-color: ${defaultColor.mainColor};
`;

const ContentContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LogoContainer = styled(View)`
  width: 98px;
  height: 146px;
  margin-bottom: 15px;
`;

const Logo = styled(Image)`
  width: 100%;
  height: 100%;
`;

const Title = styled(Text)`
  font-size: 24px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
`;

const Description = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
  text-align: center;
  line-height: 28px;
`;

const BottomContainer = styled(View)`
  padding: 0 12px;
  margin-bottom: 20px;
`;

const LoginTextContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const LoginText = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: #ffffff;
`;

const LoginLink = styled(Text)`
  font-size: 18px;
  font-family: "Paperlogy-SemiBold";
  color: ${defaultColor.btnColor};
`;

export default function StartingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();
  const { bottom } = useSafeAreaInsets();

  const handleStartPress = () => {
    navigation.navigate("SignUp");
  };

  const handleLoginPress = () => {
    navigation.navigate("SignIn");
  };

  return (
    <Container>
      <ContentContainer>
        <LogoContainer>
          <Logo source={require("../assets/logo.png")} resizeMode="contain" />
        </LogoContainer>
        <Title>가치가 되는 생각</Title>
        <Description>
          스쳐 지나간 아이디어{"\n"}여기서 새로운 가치가 시작됩니다.
        </Description>
      </ContentContainer>

      <BottomContainer style={{ paddingBottom: bottom }}>
        <PrimaryButton title="시작하기" onPress={handleStartPress} />
        <LoginTextContainer>
          <LoginText>이미 계정이 있나요? </LoginText>
          <TouchableOpacity onPress={handleLoginPress}>
            <LoginLink>로그인</LoginLink>
          </TouchableOpacity>
        </LoginTextContainer>
      </BottomContainer>
    </Container>
  );
}
