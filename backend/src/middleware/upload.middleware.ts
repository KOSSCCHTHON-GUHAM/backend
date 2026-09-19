import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) return callback(new Error('이미지 파일만 업로드할 수 있습니다.'));
    callback(null, true);
  },
}).array('images', 10);

export const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  uploadImages(req, res, (error) => {
    if (!error) return next();
    const message = error instanceof multer.MulterError
      ? `파일 업로드 오류: ${error.message}`
      : error instanceof Error ? error.message : '파일 업로드 오류';
    res.status(400).json({ success: false, error: message });
  });
};
