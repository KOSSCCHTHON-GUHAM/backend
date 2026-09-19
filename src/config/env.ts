import dotenv from 'dotenv';

dotenv.config();

/**
 * 환경변수 설정 모음
 */
export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
} as const;

/**
 * 필수 환경변수 검증
 */
export const validateEnv = (): void => {
  const required = ['OPENAI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('Please copy .env.example to .env and fill in the values.');
  }
};
