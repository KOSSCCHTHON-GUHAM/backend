import { Request, Response } from 'express';

/**
 * Auth Controller
 * - 인증 관련 요청을 처리합니다.
 */
export class AuthController {
  /**
   * POST /api/auth/login
   * 사용자 로그인 및 인증 토큰(JWT) 발급
   *
   * @body { email: string, password: string }
   * @returns { success: boolean, token: string, user: UserDto }
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // TODO: 입력값 유효성 검사
    // TODO: 이메일로 사용자 조회 (UserService)
    // TODO: 비밀번호 해시 비교 (bcrypt.compare)
    // TODO: JWT 토큰 발급 (jwt.sign)

    res.status(200).json({
      success: true,
      message: '[TODO] 로그인 로직 미구현',
      data: {
        token: 'dummy-jwt-token',
        user: {
          id: 'user-id-placeholder',
          email,
          nickname: 'placeholder',
        },
      },
    });
  }

  /**
   * POST /api/auth/register
   * 회원가입 및 프로필 초기 설정
   *
   * @body { email: string, password: string, nickname: string, jobField: string }
   * @returns { success: boolean, user: UserDto }
   */
  async register(req: Request, res: Response): Promise<void> {
    const { email, password, nickname, jobField } = req.body;

    // TODO: 입력값 유효성 검사 (email 형식, 패스워드 강도 등)
    // TODO: 이메일 중복 확인
    // TODO: 비밀번호 해싱 (bcrypt.hash)
    // TODO: DB에 사용자 저장
    // TODO: 초기 프로필 생성 (직무, 분야 설정)

    res.status(201).json({
      success: true,
      message: '[TODO] 회원가입 로직 미구현',
      data: {
        user: {
          id: 'new-user-id-placeholder',
          email,
          nickname,
          jobField,
        },
      },
    });
  }
}
