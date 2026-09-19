from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
from models import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SignupRequest(BaseModel):
    email: str
    password: str
    nickname: str

@app.get("/")
def home():
    @app.get("/")
    def home():
        return {"message": "Give & Need Backend"}

# ★ 회원가입 API ★
@app.post("/api/auth/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="이미 가입된 이메일입니다."
        )

    user = User(
        email=request.email,
        password=request.password,
        nickname=request.nickname
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "회원가입 성공",
        "user_id": user.id,
        "onboarding_completed": user.onboarding_completed,
        "redirect_url": "/onboarding"
    }

# 로그인 입력 데이터 양식
class LoginRequest(BaseModel):
    email: str
    password: str

# 로그인 API
@app.post("/api/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # 1. 이메일 존재 여부 확인
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=400,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    # 2. 비밀번호 일치 여부 확인
    if user.password != request.password:
        raise HTTPException(
            status_code=400,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    # 3. 로그인 성공 응답
    return {
        "message": "로그인 성공",
        "user_id": user.id,
        "nickname": user.nickname,
        "onboarding_completed": user.onboarding_completed,
        "redirect_url": "/onboarding" if not user.onboarding_completed else "/home"
    }