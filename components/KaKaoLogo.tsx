import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number; // 크기 조절
  color?: string; // 색상 조절 (기본: 카카오 브라운)
};

const KakaoLogo: React.FC<Props> = ({ size = 128, color = "#2E0000" }) => {
  return (
    <Svg
      width={size}
      height={(size * 348) / 321} // 원본 비율 유지
      viewBox="0 0 512 512"
    >
      {/* 채팅 말풍선 모양 */}
      <Path
        d="M256 32C132.3 32 32 114.6 32 216c0 53.3 27.4 101.6 72.2 136.2L72 480l109.3-73.5c23.4 5.5 48.5 8.5 74.7 8.5 123.7 0 224-82.6 224-184S379.7 32 256 32z"
        fill={color}
      />
    </Svg>
  );
};

export default KakaoLogo;
