import { Image, View } from "react-native";
import styled from "styled-components/native";

const Container = styled(View)`
  flex: 1;
  background-color: #09182a;
  justify-content: center;
  align-items: center;
`;

const IconContainer = styled(View)`
  width: 402px;
  height: 402px;
  justify-content: center;
  align-items: center;
`;

const Icon = styled(Image)`
  width: 100%;
  height: 100%;
`;

export default function SplashScreen() {
  return (
    <Container>
      <IconContainer>
        <Icon
          source={require("../assets/splash-icon.png")}
          resizeMode="contain"
        />
      </IconContainer>
    </Container>
  );
}
