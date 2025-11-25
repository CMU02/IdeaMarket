import { Alert, Platform, ToastAndroid } from "react-native";

/**
 * 토스트 메시지 표시 유틸리티
 * Android에서는 ToastAndroid를 사용하고, iOS에서는 Alert를 사용합니다.
 */

export type ToastType = "success" | "error" | "info";

/**
 * 토스트 메시지 표시
 * @param message 표시할 메시지
 * @param type 토스트 타입 (success, error, info)
 * @param duration 표시 시간 (밀리초, Android만 해당)
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  duration: number = 2000
) {
  if (Platform.OS === "android") {
    // Android에서는 ToastAndroid 사용
    const toastDuration =
      duration > 2000 ? ToastAndroid.LONG : ToastAndroid.SHORT;
    ToastAndroid.show(message, toastDuration);
  } else {
    // iOS에서는 간단한 Alert 사용 (확인 버튼 없이)
    Alert.alert(
      type === "success" ? "✓ 성공" : type === "error" ? "✗ 오류" : "알림",
      message,
      [{ text: "확인" }],
      { cancelable: true }
    );
  }
}

/**
 * 성공 토스트 메시지
 */
export function showSuccessToast(message: string) {
  showToast(message, "success");
}

/**
 * 오류 토스트 메시지
 */
export function showErrorToast(message: string) {
  showToast(message, "error");
}

/**
 * 정보 토스트 메시지
 */
export function showInfoToast(message: string) {
  showToast(message, "info");
}
