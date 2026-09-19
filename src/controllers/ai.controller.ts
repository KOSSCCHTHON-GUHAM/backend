import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';

const aiService = new AiService();

export class AiController {
  /**
   * POST /api/ai/chat
   * AI와 채팅 요청을 처리합니다.
   */
  async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, model } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: 'message 필드는 필수입니다.',
        });
        return;
      }

      const result = await aiService.chat(message, model);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[AiController.chat] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * GET /api/ai/models
   * 사용 가능한 AI 모델 목록을 반환합니다.
   */
  async listModels(_req: Request, res: Response): Promise<void> {
    try {
      const models = await aiService.listModels();
      res.json({
        success: true,
        data: models,
      });
    } catch (error) {
      console.error('[AiController.listModels] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
