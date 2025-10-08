import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View } from "react-native";
import { styled } from "styled-components";
import { AuthStackList } from "../../navigations/AuthStack";

const HeaderContainer = styled(View)`
  margin-bottom: 20px;
  flex-direction: row;
  padding: 10px 16px;
  gap: 30px;
`;
const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-family: "Paperlogy-Bold";
`;
const BackButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;
const BackText = styled(Text)`
  font-size: 18px;
`;

interface EmailFormHeaderProps {
  title: string;
}

export default function EmailFormHeader({ title }: EmailFormHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackList>>();
  return (
    <HeaderContainer>
      <BackButton onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} />
        <BackText>뒤로</BackText>
      </BackButton>
      <HeaderTitle>{title}</HeaderTitle>
    </HeaderContainer>
  );
}
