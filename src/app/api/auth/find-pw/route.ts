import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { username, email, new_password } = await req.json();
    if (!username?.trim() || !email?.trim()) {
      return NextResponse.json({ error: '아이디와 이메일을 입력하세요.' }, { status: 400 });
    }

    // 본인 확인
    const { data: user } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username.trim())
      .eq('email', email.trim())
      .single();

    if (!user) {
      return NextResponse.json({ error: '일치하는 회원 정보가 없습니다.' }, { status: 404 });
    }

    // new_password가 "__verify_only__x"면 본인 확인만 수행
    if (!new_password || new_password === '__verify_only__x') {
      return NextResponse.json({ message: '본인 확인 완료' });
    }

    if (new_password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }

    const { hash, salt } = hashPassword(new_password);
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hash, salt })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: '비밀번호 변경 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ message: '비밀번호가 변경되었습니다.' });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
