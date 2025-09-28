import * as SplashScreen from "expo-splash-screen";
import { useAuthContext } from "../hooks/UseAuthContext";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function SplashScreenController() {
  const { isLoading } = useAuthContext();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
