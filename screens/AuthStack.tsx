import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../components/Login";

export type AuthStackList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}
