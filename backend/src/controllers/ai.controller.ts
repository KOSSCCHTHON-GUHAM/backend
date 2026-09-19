import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import { SourceAnalysisService } from '../services/sourceAnalysis.service';

const aiService = new AiService();
const sourceAnalysisService = new SourceAnalysisService();

/**
 * AI Controller
 * - AI 매칭·분석 관련 요청을 처리합니다.
 * - 현재는 스켈레톤 구조만 구성되어 있으며, 추후 실제 AI API를 연동합니다.
 */
export class AiController {
  /**
   * GET /api/ai/recommend
   * AI 기반 GIVE/NEED 맞춤형 사용자 추천
   *
   * @query { userId?: string, limit?: number }
   * @returns { success: boolean, recommendations: RecommendationDto[] }
   */
  async recommend(req: Request, res: Response): Promise<void> {
    try {
      const { userId, limit = 5 } = req.query;

      // TODO: 인증 미들웨어에서 현재 로그인 사용자 ID 추출
      // TODO: 사용자의 GIVE/NEED 프로필 데이터 조회
      // TODO: AiService.getRecommendations() 호출

      const result = await aiService.getRecommendations(
        String(userId ?? 'anonymous'),
        Number(limit),
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[AiController.recommend] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * POST /api/ai/analyze
   * 링크, 이미지, 텍스트 자료를 함께 분석해 포스팅 초안을 생성
   *
   * @body multipart/form-data { url: string, image: File }
   * @returns { success: boolean, data: PostingDraft }
   */
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { url, model } = req.body;
      if (!url || typeof url !== 'string' || !req.file) {
        res.status(400).json({
          success: false,
          error: 'url과 image 파일은 모두 필수입니다.',
        });
        return;
      }

      const result = await sourceAnalysisService.createPostingDraft({
        url,
        image: req.file,
        model: typeof model === 'string' ? model : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      const isInputError = /URL|링크|내부 서버|http 또는 https|url과 image/.test(message);
      res.status(isInputError ? 400 : 500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/ai/chat  (기존 유지)
   * AI와 직접 채팅 요청
   */
  async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, model } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, error: 'message 필드는 필수입니다.' });
        return;
      }

      const result = await aiService.chat(message, model);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('[AiController.chat] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * GET /api/ai/models  (기존 유지)
   * 사용 가능한 AI 모델 목록 반환
   */
  async listModels(_req: Request, res: Response): Promise<void> {
    try {
      const models = await aiService.listModels();
      res.json({ success: true, data: models });
    } catch (error) {
      console.error('[AiController.listModels] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
