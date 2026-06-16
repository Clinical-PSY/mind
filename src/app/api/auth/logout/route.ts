import { NextResponse } from 'next/server';

// JWT는 stateless이므로 서버에서 별도 처리 불필요 — 클라이언트가 토큰 삭제
export async function POST() {
  return NextResponse.json({ message: '로그아웃 완료' });
}
