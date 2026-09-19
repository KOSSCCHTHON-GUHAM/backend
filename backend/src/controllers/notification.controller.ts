import { Request, Response } from 'express';
import { notifications } from '../data/memoryStore';
import { persistAllNotificationsRead, persistNotificationRead } from '../services/persistence.service';

export class NotificationController {
  list(req: Request, res: Response): void {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const unreadOnly = String(req.query.unreadOnly ?? 'false') === 'true';
    const items = [...notifications.values()].filter((item) => item.userId === req.user!.id).filter((item) => !unreadOnly || !item.isRead).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ notifications: items.slice((page - 1) * limit, page * limit), unreadCount: items.filter((item) => !item.isRead).length, hasNext: page * limit < items.length });
  }

  async read(req: Request, res: Response): Promise<void> {
    const item = notifications.get(req.params.id);
    if (!item) { res.status(404).json({ success: false, error: '알림을 찾을 수 없습니다.' }); return; }
    if (item.userId !== req.user!.id) { res.status(403).json({ success: false, error: '알림 접근 권한이 없습니다.' }); return; }
    try { await persistNotificationRead(item.id, req.user!.id); }
    catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : '읽음 처리 실패' }); return; }
    item.isRead = true; res.json({ id: item.id, isRead: true });
  }

  async readAll(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    try { await persistAllNotificationsRead(userId); }
    catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : '전체 읽음 처리 실패' }); return; }
    let updatedCount = 0;
    for (const item of notifications.values()) {
      if (item.userId === userId && !item.isRead) { item.isRead = true; updatedCount += 1; }
    }
    res.json({ updatedCount, unreadCount: 0 });
  }
}
