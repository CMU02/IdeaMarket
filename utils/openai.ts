import axios from "axios";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface GenerateContentParams {
  title: string;
  shortDescription: string;
  existingContent?: string;
}

/**
 * OpenAI API를 사용하여 아이디어 소개글 생성
 * @param params - 제목, 간단 소개, 기존 내용
 * @returns 생성된 텍스트
 */
export async function generateIdeaContent(
  params: GenerateContentParams
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    if (!OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API 키가 설정되지 않았습니다.",
      };
    }

    const { title, shortDescription, existingContent } = params;

    // 프롬프트 생성
    const prompt = existingContent
      ? `다음 아이디어에 대한 소개글을 더 자세하고 매력적으로 개선해주세요.

제목: ${title}
간단 소개: ${shortDescription}
기존 내용: ${existingContent}

요구사항:
- 기존 내용을 바탕으로 더 구체적이고 설득력 있게 작성
- 아이디어의 장점과 특징을 강조
- 자연스럽고 읽기 쉬운 문장으로 작성
- 한국어로 작성`
      : `다음 아이디어에 대한 매력적인 소개글을 작성해주세요.

제목: ${title}
간단 소개: ${shortDescription}

요구사항:
- 아이디어의 핵심 가치와 특징을 명확하게 설명
- 잠재적 사용자나 구매자의 관심을 끌 수 있는 내용
- 구체적인 예시나 활용 방안 포함
- 자연스럽고 읽기 쉬운 문장으로 작성
- 3-5개 문단으로 구성
- 한국어로 작성`;

    // OpenAI API 호출
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "당신은 창의적이고 설득력 있는 아이디어 소개글을 작성하는 전문 작가입니다.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const generatedContent = response.data.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      return {
        success: false,
        error: "AI가 내용을 생성하지 못했습니다.",
      };
    }

    return {
      success: true,
      content: generatedContent,
    };
  } catch (error) {
    console.error("OpenAI API 오류:", error);

    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      return {
        success: false,
        error: `AI 생성 오류: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: "AI 글 생성 중 오류가 발생했습니다.",
    };
  }
}
