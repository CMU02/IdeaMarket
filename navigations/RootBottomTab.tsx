import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CommentPost from "../screens/CommentPost";
import History from "../screens/History";
import Home from "../screens/Home";
import Info from "../screens/Info";
import { defaultColor } from "../utils/Color";

type BottomTabList = {
  Home: undefined;
  History: undefined;
  CommentPosts: undefined;
  Info: undefined;
};

const BottomTab = createBottomTabNavigator<BottomTabList>();

export default function RootBottomTab() {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "CommentPosts") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Info") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: defaultColor.btnColor,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: defaultColor.mainColor,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Paperlogy-SemiBold",
        },
      })}
    >
      <BottomTab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: "" }}
      />
      <BottomTab.Screen
        name="History"
        component={History}
        options={{ tabBarLabel: "" }}
      />
      <BottomTab.Screen
        name="CommentPosts"
        component={CommentPost}
        options={{ tabBarLabel: "" }}
      />
      <BottomTab.Screen
        name="Info"
        component={Info}
        options={{ tabBarLabel: "" }}
      />
    </BottomTab.Navigator>
  );
}
