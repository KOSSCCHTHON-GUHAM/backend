import aiClient from '../config/aiClient';

// ────────────────────────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────────────────────────

export interface ChatResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface RecommendationDto {
  userId: string;
  nickname: string;
  jobField: string;
  matchScore: number;
  reason: string;
}

export interface AnalyzeResult {
  keywords: string[];
  summary: string;
  type: 'GIVE' | 'NEED' | string;
}

// ────────────────────────────────────────────────────────────────────
// AI Service
// ────────────────────────────────────────────────────────────────────

export class AiService {
  /**
   * [GUHAM] AI 기반 GIVE/NEED 맞춤형 사용자 추천
   *
   * 추후 구현 방향:
   *  1. userId로 사용자 프로필(GIVE/NEED 태그, 직무 등) 조회
   *  2. OpenAI Embeddings API로 사용자 프로필 벡터화
   *  3. 벡터 유사도(cosine similarity) 기반 상위 N명 반환
   *
   * @param userId  현재 로그인한 사용자 ID
   * @param limit   추천 결과 수 (기본 5)
   */
  async getRecommendations(userId: string, limit: number = 5): Promise<RecommendationDto[]> {
    // TODO: 실제 AI 추천 로직 구현
    // const profile = await UserService.getProfile(userId);
    // const embedding = await aiClient.embeddings.create({ ... });
    // return vectorSearch(embedding, limit);

    // --- 더미 데이터 (개발·테스트용) ---
    const dummy: RecommendationDto[] = Array.from({ length: limit }, (_, i) => ({
      userId: `dummy-user-${i + 1}`,
      nickname: `더미유저${i + 1}`,
      jobField: ['Frontend', 'Backend', 'AI/ML', 'ESG', 'Design'][i % 5],
      matchScore: parseFloat((0.95 - i * 0.05).toFixed(2)),
      reason: `[TODO] AI 추천 이유 — userId: ${userId}`,
    }));

    return dummy;
  }

  /**
   * [GUHAM] GIVE/NEED 텍스트 AI 분석 및 키워드 추출
   *
   * 추후 구현 방향:
   *  1. OpenAI Chat Completions API에 프롬프트로 텍스트 전달
   *  2. 키워드, 직무 분야, 요약 추출
   *  3. 구조화된 JSON 응답 파싱 (structured output 사용 권장)
   *
   * @param text  분석할 GIVE 또는 NEED 텍스트
   * @param type  'GIVE' | 'NEED'
   */
  async analyzeText(text: string, type: string = 'GIVE'): Promise<AnalyzeResult> {
    // TODO: 실제 AI 분석 로직 구현
    // const response = await aiClient.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: [
    //     { role: 'system', content: GUHAM_ANALYZE_SYSTEM_PROMPT },
    //     { role: 'user', content: text },
    //   ],
    //   response_format: { type: 'json_object' },
    // });
    // return JSON.parse(response.choices[0].message.content ?? '{}');

    // --- 더미 데이터 (개발·테스트용) ---
    return {
      keywords: ['[TODO]', 'keyword1', 'keyword2'],
      summary: `[TODO] AI 분석 요약 — 입력 길이: ${text.length}자, 타입: ${type}`,
      type,
    };
  }

  /**
   * OpenAI Chat Completions API 직접 호출 (기존 기능 유지)
   */
  async chat(message: string, model: string = 'gpt-4o-mini'): Promise<ChatResult> {
    const response = await aiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: message }],
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content ?? '',
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  /**
   * 사용 가능한 AI 모델 목록 조회 (기존 기능 유지)
   */
  async listModels(): Promise<string[]> {
    const response = await aiClient.models.list();
    return response.data.map((m) => m.id);
  }
}
