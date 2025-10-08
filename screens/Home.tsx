import { Text, View } from "react-native";
import styled from "styled-components";

const Container = styled(View)``;
const Title = styled(Text)``;

export default function Home() {
  return (
    <Container>
      <Title>홈 화면</Title>
    </Container>
  );
}
