import { Request, Response } from 'express';

/**
 * Chat Controller
 * - 1:1 채팅 관련 요청을 처리합니다.
 */
export class ChatController {
  /**
   * POST /api/chat/rooms
   * 사용자 간 1:1 채팅방 생성
   *
   * @body { targetUserId: string }
   * @returns { success: boolean, room: ChatRoomDto }
   */
  async createRoom(req: Request, res: Response): Promise<void> {
    const { targetUserId } = req.body;

    // TODO: 인증 미들웨어에서 요청자 userId 추출 (req.user)
    // TODO: 동일한 두 사용자 간 채팅방이 이미 있는지 확인
    // TODO: 없으면 ChatService.createRoom(requesterId, targetUserId) 호출
    // TODO: 있으면 기존 채팅방 반환

    res.status(201).json({
      success: true,
      message: '[TODO] 채팅방 생성 로직 미구현',
      data: {
        room: {
          id: 'room-id-placeholder',
          participants: ['requester-id-placeholder', targetUserId],
          createdAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * GET /api/chat/rooms/:roomId
   * 1:1 채팅방 메시지 내역 조회
   *
   * @param roomId - 채팅방 ID
   * @query { page?: number, limit?: number }
   * @returns { success: boolean, messages: MessageDto[], roomId: string }
   */
  async getRoomMessages(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // TODO: 인증 미들웨어로 요청자가 해당 채팅방 참여자인지 확인
    // TODO: ChatService.getMessages(roomId, pagination) 호출
    // TODO: 메시지를 읽음 처리 (read receipt)
    // TODO: 커서 기반 페이지네이션 고려 (채팅 특성상 무한스크롤)

    res.status(200).json({
      success: true,
      message: '[TODO] 채팅 메시지 조회 로직 미구현',
      data: {
        roomId,
        messages: [],
        page: Number(page),
        limit: Number(limit),
      },
    });
  }
}
