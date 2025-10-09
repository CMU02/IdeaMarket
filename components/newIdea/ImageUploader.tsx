import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  margin-bottom: 20px;
`;

const Label = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #09182a;
  margin-bottom: 8px;
`;

const UploadButton = styled(TouchableOpacity)`
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 25px 10px;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
`;

const UploadText = styled(Text)`
  font-size: 14px;
  color: #666666;
  margin-top: 8px;
`;

const ImagesContainer = styled(ScrollView)`
  flex-direction: row;
  margin-top: 12px;
`;

const ImageWrapper = styled(View)`
  position: relative;
  width: 100px;
  height: 100px;
`;

const UploadedImage = styled(Image)`
  width: 100%;
  height: 100%;
  border-radius: 8px;
`;

const RemoveButton = styled(TouchableOpacity)`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #ff4444;
  align-items: center;
  justify-content: center;
`;

interface ImageUploaderProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

export default function ImageUploader({
  images,
  onAddImage,
  onRemoveImage,
}: ImageUploaderProps) {
  return (
    <Container>
      <Label>이미지 업로드</Label>
      <UploadButton onPress={onAddImage}>
        <Ionicons name="cloud-upload-outline" size={40} color="#999999" />
        <UploadText>이미지를 업로드하세요</UploadText>
      </UploadButton>
      {images.length > 0 && (
        <ImagesContainer
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
            marginTop: 8,
          }}
        >
          {images.map((image, index) => (
            <ImageWrapper key={index}>
              <UploadedImage source={{ uri: image }} />
              <RemoveButton onPress={() => onRemoveImage(index)}>
                <Ionicons name="close" size={16} color="#ffffff" />
              </RemoveButton>
            </ImageWrapper>
          ))}
        </ImagesContainer>
      )}
    </Container>
  );
}
