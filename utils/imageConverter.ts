import * as ImageManipulator from "expo-image-manipulator";

/**
 * HEIC 이미지를 JPG로 변환
 * @param uri 이미지 URI
 * @returns JPG로 변환된 이미지의 base64 데이터 (data:image/jpeg;base64,...)
 */
export async function convertHeicToJpg(uri: string): Promise<string> {
  try {
    // ImageManipulator를 사용하여 이미지를 JPG로 변환
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [], // 변환만 하고 조작은 하지 않음
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulatedImage.base64) {
      throw new Error("Base64 변환 실패");
    }

    return `data:image/jpeg;base64,${manipulatedImage.base64}`;
  } catch (error) {
    console.error("HEIC to JPG 변환 오류:", error);
    throw error;
  }
}

/**
 * 이미지가 HEIC 형식인지 확인
 */
export function isHeicImage(uri: string, mimeType?: string | null): boolean {
  const lowerUri = uri.toLowerCase();
  const lowerMime = mimeType?.toLowerCase();

  return (
    lowerUri.endsWith(".heic") ||
    lowerUri.endsWith(".heif") ||
    lowerMime === "image/heic" ||
    lowerMime === "image/heif"
  );
}
