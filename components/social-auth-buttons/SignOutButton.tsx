import styled from "styled-components/native";
import { supabase } from "../../lib/Supabase";

const Button = styled.TouchableOpacity``;
const ButtonText = styled.Text``;

async function onSignOutButtonPress() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error sigining out: ", error);
  }
}

export default function SignOutButton() {
  return (
    <Button onPress={onSignOutButtonPress}>
      <ButtonText>Sign out</ButtonText>
    </Button>
  );
}
