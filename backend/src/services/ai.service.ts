import aiClient from '../config/aiClient';

export interface ChatResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AiService {
  /**
   * OpenAI Chat Completions API를 사용해 메시지에 대한 응답을 생성합니다.
   */
  async chat(
    message: string,
    model: string = 'gpt-4o-mini',
  ): Promise<ChatResult> {
    const response = await aiClient.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
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
   * 사용 가능한 AI 모델 목록을 가져옵니다.
   */
  async listModels(): Promise<string[]> {
    const response = await aiClient.models.list();
    return response.data.map((m) => m.id);
  }
}
