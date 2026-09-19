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
      description: 'GUHAM 백엔드 서비스 API 명세서 (Express + TypeScript)',
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
    },
  },
  apis: [routesTsPath, routesRootTsPath],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
