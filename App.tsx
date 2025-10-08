import "react-native-url-polyfill/auto";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import FontLoader from "./components/FontLoader";
import { useAuthContext } from "./hooks/UseAuthContext";
import AuthStack from "./navigations/AuthStack";
import MainStack from "./navigations/MainStack";
import AuthProvider from "./providers/AuthProvider";

function Navigation() {
  const { isLoggedIn, isLoading } = useAuthContext();

  // 로딩 중일 때는 빈 화면 또는 로딩 화면 표시
  if (isLoading) {
    return null; // 또는 <LoadingScreen />
  }

  return isLoggedIn ? <MainStack /> : <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <FontLoader>
            <StatusBar style="light" />
            <Navigation />
          </FontLoader>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
