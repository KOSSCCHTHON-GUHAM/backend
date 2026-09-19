import OpenAI from 'openai';

/**
 * 환경변수에서 AI API 설정을 읽어 OpenAI 클라이언트를 초기화합니다.
 * OPENAI_BASE_URL을 통해 커스텀 엔드포인트(예: Azure, 로컬 LLM 등)를 지원합니다.
 */
const createAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  const config: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey,
  };

  if (baseURL) {
    config.baseURL = baseURL;
    console.log(`🤖 AI Client initialized with custom base URL: ${baseURL}`);
  } else {
    console.log('🤖 AI Client initialized with default OpenAI endpoint');
  }

  return new OpenAI(config);
};

export const aiClient = createAIClient();
export default aiClient;
