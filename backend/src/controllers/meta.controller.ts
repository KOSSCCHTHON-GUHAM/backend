import { Request, Response } from 'express';

export class MetaController {
  options(_req: Request, res: Response): void {
    res.json({
      giveFields: ['기획', '디자인', 'Frontend', 'Backend', 'AI/ML', '데이터', '마케팅', '콘텐츠', '영상', '기타'],
      interests: ['IT_AI', 'STARTUP', 'ESG', 'MARKETING', 'DESIGN'],
      regions: ['전국', '온라인', '서울', '경기', '인천', '강원', '충청', '전라', '경상', '제주'],
    });
  }
}
