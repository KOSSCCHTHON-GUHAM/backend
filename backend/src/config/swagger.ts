import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

// Windows 환경의 역슬래시(\) 경로를 swagger-jsdoc(glob)이 인식할 수 있도록 슬래시(/)로 변환
const routesTsPath = path.resolve(__dirname, '../routes/**/*.{ts,js}').replace(/\\/g, '/');
const routesRootTsPath = path.resolve(process.cwd(), 'src/routes/**/*.{ts,js}').replace(/\\/g, '/');

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GUHAM API',
      version: '1.0.0',
      description: [
        'GUHAM 백엔드 서비스 API 명세서 (Express + TypeScript)',
        '',
        '실시간 채팅은 같은 서버의 Socket.IO `path: /chat`을 사용합니다.',
        '`auth.accessToken`으로 연결한 뒤 `chat:join`, `message:send`, `message:read`, `chat:leave` 이벤트를 전송하며,',
        '서버는 `chat:joined`, `message:new`, `message:read` 이벤트를 전달합니다.',
      ].join('\n'),
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '로컬 개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object', required: ['email', 'password'],
          properties: { email: { type: 'string', format: 'email', example: 'user@example.com' }, password: { type: 'string', format: 'password', minLength: 8 } },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' }, refreshToken: { type: 'string' },
            user: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, email: { type: 'string', format: 'email' }, nickname: { type: 'string' }, onboardingCompleted: { type: 'boolean' } } },
          },
        },
        RegisterRequest: {
          type: 'object', required: ['email', 'password', 'nickname'],
          properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password', minLength: 8 }, nickname: { type: 'string', minLength: 2, maxLength: 10 } },
        },
        RegisterResponse: {
          type: 'object', required: ['user', 'nextAction'],
          properties: {
            user: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, email: { type: 'string', format: 'email' }, nickname: { type: 'string' } } },
            nextAction: { type: 'string', enum: ['LOGIN'], example: 'LOGIN' },
          },
        },
        ErrorResponse: {
          type: 'object', required: ['success', 'error'],
          properties: { success: { type: 'boolean', example: false }, error: { type: 'string' } },
        },
        OnboardingRequest: {
          type: 'object', required: ['giveFields', 'interests', 'regions'],
          properties: {
            giveFields: { type: 'array', items: { type: 'string' } }, interests: { type: 'array', items: { type: 'string' } }, regions: { type: 'array', items: { type: 'string' } },
            customGiveText: { type: 'string' }, customInterestText: { type: 'string' },
          },
        },
        BoardCreateInput: {
          type: 'object', required: ['title', 'category', 'recruitCount', 'content', 'giveTags', 'needTags', 'activityRegion', 'activityMethod', 'activityHours'],
          properties: {
            title: { type: 'string' }, category: { type: 'string' }, recruitCount: { type: 'integer', minimum: 1 }, content: { type: 'string' },
            giveTags: { type: 'array', items: { type: 'string' } }, needTags: { type: 'array', items: { type: 'string' } },
            activityRegion: { type: 'string' }, activityMethod: { type: 'string' }, activityHours: { type: 'string' }, relatedLinks: { type: 'array', items: { type: 'string', format: 'uri' } },
          },
        },
        BoardDetail: {
          allOf: [
            { $ref: '#/components/schemas/BoardCreateInput' },
            { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, authorId: { type: 'string', format: 'uuid' }, imageUrls: { type: 'array', items: { type: 'string' } }, recruitment: { type: 'object', properties: { current: { type: 'integer' }, target: { type: 'integer' }, status: { type: 'string', enum: ['RECRUITING', 'COMPLETED'] } } }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } } },
          ],
        },
        AiDraftResponse: {
          allOf: [
            { $ref: '#/components/schemas/BoardCreateInput' },
            { type: 'object', properties: { warnings: { type: 'array', items: { type: 'string' } } } },
          ],
        },
        ChatMessage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, roomId: { type: 'string', format: 'uuid' }, senderId: { type: 'string', format: 'uuid' },
            clientMessageId: { type: 'string' }, content: { type: 'string' }, messageType: { type: 'string', enum: ['TEXT', 'LINK'] },
            readBy: { type: 'array', items: { type: 'string', format: 'uuid' } }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ChatRoom: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, boardId: { type: 'string', format: 'uuid' },
            participantIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, type: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' },
            isRead: { type: 'boolean' }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Supabase 인증' }, { name: 'User', description: '온보딩과 마이페이지' },
      { name: 'Meta', description: '선택 옵션' }, { name: 'Board', description: '포스팅' },
      { name: 'AI', description: '분석·초안·추천' }, { name: 'Chat', description: 'REST 및 Socket.IO 채팅' },
      { name: 'Notification', description: '알림' },
    ],
  },
  apis: [routesTsPath, routesRootTsPath],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
