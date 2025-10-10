import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RootBottomTab from "./RootBottomTab";
import NewIdea from "../screens/NewIdea";
import Detail from "../screens/Detail";
import MyIdeas from "../screens/MyIdeas";

export type MainStackList = {
  BottomTab: undefined;
  NewIdea: undefined;
  Detail: { ideaId: string };
  MyIdeas: undefined;
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
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="MyIdeas" component={MyIdeas} />
    </Stack.Navigator>
  );
}
