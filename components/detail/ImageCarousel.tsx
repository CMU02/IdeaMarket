import React, { useState } from "react";
import { View, Image, ScrollView, Dimensions } from "react-native";
import styled from "styled-components/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Container = styled(View)`
  width: 100%;
  height: 402px;
  background-color: #09182a;
`;

const ImageContainer = styled(ScrollView)`
  width: 100%;
  height: 100%;
`;

const ImageItem = styled(Image)`
  width: ${SCREEN_WIDTH}px;
  height: 402px;
`;

const PageIndicator = styled(View)`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 4px 12px;
  border-radius: 12px;
`;

const PageText = styled.Text`
  color: white;
  font-size: 15px;
  font-weight: 600;
`;

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  if (!images || images.length === 0) {
    return (
      <Container>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#E5F3FF",
          }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <ImageContainer
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <ImageItem key={index} source={{ uri: image }} resizeMode="cover" />
        ))}
      </ImageContainer>
      {images.length > 1 && (
        <PageIndicator>
          <PageText>
            {currentPage + 1} / {images.length}
          </PageText>
        </PageIndicator>
      )}
    </Container>
  );
}
