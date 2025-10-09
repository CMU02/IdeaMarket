import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { defaultColor } from "../utils/Color";
import Input from "../components/common/Input";
import PriceSelector from "../components/newIdea/PriceSelector";
import AIContentGenerator from "../components/newIdea/AIContentGenerator";
import TagInput from "../components/newIdea/TagInput";
import ImageUploader from "../components/newIdea/ImageUploader";
import { useNavigation } from "@react-navigation/native";
import { MainStackList } from "../navigations/MainStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { uploadIdea } from "../lib/services/Upload";
import { convertHeicToJpg, isHeicImage } from "../utils/imageConverter";

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

const CompleteButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const CompleteText = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${defaultColor.btnColor};
`;

const ContentContainer = styled(ScrollView)`
  flex: 1;
  padding: 20px 16px;
`;

export default function NewIdea() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackList>>();
  const { top } = useSafeAreaInsets();

  // Form states
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
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
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const imagePromises = result.assets.map(async (asset) => {
          // HEIC 이미지인 경우 JPG로 변환
          if (isHeicImage(asset.uri, asset.mimeType)) {
            try {
              return await convertHeicToJpg(asset.uri);
            } catch (error) {
              console.error("HEIC 변환 오류:", error);
              return null;
            }
          }

          // 일반 이미지는 base64로 변환
          if (!asset.base64) return null;
          const mimeType = asset.mimeType || "image/jpeg";
          return `data:${mimeType};base64,${asset.base64}`;
        });

        const newImages = (await Promise.all(imagePromises)).filter(
          (base64): base64 is string => base64 !== null
        );
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

  const handleUpload = async () => {
    // 유효성 검사
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }

    if (!shortDescription.trim()) {
      Alert.alert("알림", "아이디어 간단 소개를 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("알림", "아이디어 소개글을 입력해주세요.");
      return;
    }

    if (!isFree && !price.trim()) {
      Alert.alert("알림", "가격을 입력해주세요.");
      return;
    }

    if (!isFree && parseInt(price, 10) <= 0) {
      Alert.alert("알림", "올바른 가격을 입력해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadIdea({
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        isFree,
        price: price.trim(),
        content: content.trim(),
        tags,
        imageUris: images,
      });

      if (result.success) {
        Alert.alert("성공", "아이디어가 업로드되었습니다.", [
          {
            text: "확인",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("오류", result.error || "업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("업로드 오류:", error);
      Alert.alert("오류", "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
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
          <BackButton onPress={handleBack} disabled={isUploading}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </BackButton>
          <HeaderTitle>새 아이디어</HeaderTitle>
          <CompleteButton onPress={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator size="small" color={defaultColor.btnColor} />
            ) : (
              <CompleteText>완료</CompleteText>
            )}
          </CompleteButton>
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
      </Container>
    </KeyboardAvoidingView>
  );
}
