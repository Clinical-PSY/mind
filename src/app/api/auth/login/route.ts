import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, signToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: '아이디와 비밀번호를 입력하세요.' }, { status: 400 });
    }

    // 관리자 계정 (환경변수)
    const adminId = process.env.ADMIN_USERNAME ?? 'admin';
    const adminPw = process.env.ADMIN_PASSWORD ?? '';
    if (username.trim() === adminId) {
      if (!adminPw) return NextResponse.json({ error: '관리자 계정 미설정' }, { status: 500 });
      if (password !== adminPw) return NextResponse.json({ error: '아이디 또는 비밀번호 오류' }, { status: 401 });
      const token = await signToken({ username: adminId, role: 'admin', name: '관리자' });
      return NextResponse.json({ token, username: adminId, name: '관리자', role: 'admin' });
    }

    // 일반 회원
    const { data: user, error } = await supabase
      .from('users')
      .select('username, name, email, role, password_hash, salt')
      .eq('username', username.trim())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: '아이디 또는 비밀번호 오류' }, { status: 401 });
    }

    const { hash } = hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
      return NextResponse.json({ error: '아이디 또는 비밀번호 오류' }, { status: 401 });
    }

    const token = await signToken({ username: user.username, role: user.role, name: user.name });
    return NextResponse.json({ token, username: user.username, name: user.name, role: user.role });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
