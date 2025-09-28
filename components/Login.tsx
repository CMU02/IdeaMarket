import { AppState } from "react-native";
import { useState } from "react";
import styled from "styled-components/native";
import { supabase } from "../lib/Supabase";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
const Logo = styled.View`
  width: 120px;
  height: 120px;
  background-color: skyblue;
  border-radius: 50%;
`;

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Container>
      <Logo />
    </Container>
  );
}
