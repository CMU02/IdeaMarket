import "react-native-url-polyfill/auto";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthStack from "./navigations/AuthStack";
import FontLoader from "./components/FontLoader";
import { StatusBar } from "expo-status-bar";
import AuthProiver from "./providers/AuthProvider";
import { useAuthContext } from "./hooks/UseAuthContext";
import MainStack from "./navigations/MainStack";

export default function App() {
  const { isLoggedIn, session } = useAuthContext();
  return (
    <AuthProiver>
      <SafeAreaProvider>
        <NavigationContainer>
          <FontLoader>
            <StatusBar style="auto" />
            {isLoggedIn ? <MainStack /> : <AuthStack />}
          </FontLoader>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProiver>
  );
}
