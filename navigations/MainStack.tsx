import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
import RootBottomTab from "./RootBottomTab";

export type MainStackList = {
  BottomTab: undefined;
};

const Stack = createNativeStackNavigator<MainStackList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BottomTab" component={RootBottomTab} />
    </Stack.Navigator>
  );
}
