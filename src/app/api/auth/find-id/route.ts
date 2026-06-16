import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: '이름과 이메일을 모두 입력하세요.' }, { status: 400 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('username, created_at')
      .eq('name', name.trim())
      .eq('email', email.trim())
      .single();

    if (!user) {
      return NextResponse.json({ error: '일치하는 회원 정보가 없습니다.' }, { status: 404 });
    }

    // 아이디 일부 마스킹 (원본 server.py 방식)
    const uid = user.username;
    const masked =
      uid.length > 3
        ? uid.slice(0, 2) + '*'.repeat(Math.max(uid.length - 4, 1)) + uid.slice(-2)
        : uid[0] + '*'.repeat(uid.length - 1);

    return NextResponse.json({
      username: masked,
      created_at: user.created_at?.slice(0, 10) ?? '',
    });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
