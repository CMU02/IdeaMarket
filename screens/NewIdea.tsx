import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { defaultColor } from "../utils/Color";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import PriceSelector from "../components/newIdea/PriceSelector";
import AIContentGenerator from "../components/newIdea/AIContentGenerator";
import TagInput from "../components/newIdea/TagInput";
import ImageUploader from "../components/newIdea/ImageUploader";

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const HeaderContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  background-color: ${defaultColor.mainColor};
`;

const HeaderTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: white;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const ContentContainer = styled(ScrollView)`
  flex: 1;
  padding: 20px 16px;
`;

const ButtonContainer = styled(View)`
  padding: 16px;
  border-top-width: 1px;
  border-top-color: #e0e0e0;
  background-color: #ffffff;
`;

export default function NewIdea() {
  const { top } = useSafeAreaInsets();

  // Form states
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const handleBack = () => {
    console.log("뒤로가기");
    // TODO: 뒤로가기 구현
  };

  const handleAIGenerate = () => {
    console.log("AI 글 작성하기:", content);
    // TODO: AI 글 작성 API 호출
  };

  const handleAddTag = (tag: string) => {
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddImage = async () => {
    try {
      // 권한 요청
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    console.log("업로드");
    // TODO: 업로드 구현
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Container>
        <HeaderContainer
          style={{
            paddingTop: top,
            paddingBottom: 10,
          }}
        >
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </BackButton>
          <HeaderTitle>새 아이디어</HeaderTitle>
          <View style={{ width: 32 }} />
        </HeaderContainer>

        <ContentContainer showsVerticalScrollIndicator={false}>
          <Input
            label="제목"
            placeholder="아이디어 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            required
          />

          <Input
            label="아이디어 간단 소개"
            placeholder="아이디어를 간단히 소개해주세요"
            value={shortDescription}
            onChangeText={setShortDescription}
            multiline
            numberOfLines={3}
            required
          />

          <PriceSelector
            isFree={isFree}
            price={price}
            onTypeChange={setIsFree}
            onPriceChange={setPrice}
          />

          <AIContentGenerator
            value={content}
            onChange={setContent}
            onAIGenerate={handleAIGenerate}
          />

          <TagInput
            tags={tags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          <ImageUploader
            images={images}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
          />
        </ContentContainer>

        <ButtonContainer>
          <Button title="업로드" onPress={handleUpload} fullWidth />
        </ButtonContainer>
      </Container>
    </KeyboardAvoidingView>
  );
}
