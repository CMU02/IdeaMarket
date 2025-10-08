import { Text, View } from "react-native";
import styled from "styled-components";
import SignOutButton from "../components/social-auth-buttons/SignOutButton";

const Container = styled(View)`
  flex: 1;
  background-color: #fff;
  justify-content: center;
  align-items: center;
`;
const Title = styled(Text)``;

export default function Info() {
  return (
    <Container>
      <Title>Info 화면</Title>
      <SignOutButton />
    </Container>
  );
}
