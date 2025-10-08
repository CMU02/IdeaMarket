import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RootBottomTab from "./RootBottomTab";
import NewIdea from "../screens/NewIdea";

export type MainStackList = {
  BottomTab: undefined;
  NewIdea: undefined;
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
      <Stack.Screen name="NewIdea" component={NewIdea} />
    </Stack.Navigator>
  );
}
