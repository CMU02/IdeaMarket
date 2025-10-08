import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";

export type MainStackList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<MainStackList>();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}
