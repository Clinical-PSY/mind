import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { username, password, name, email, phone, birthdate, gender } = await req.json();

    // 필수 검증
    const required = { username, password, name, email, phone, birthdate, gender };
    for (const [key, val] of Object.entries(required)) {
      if (!String(val ?? '').trim()) {
        return NextResponse.json({ error: `필수 항목 누락: ${key}` }, { status: 400 });
      }
    }

    const id = username.trim();
    if (!/^[a-zA-Z0-9]{4,20}$/.test(id)) {
      return NextResponse.json({ error: '아이디는 영문+숫자 4~20자입니다.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
    }
    if (id === (process.env.ADMIN_USERNAME ?? 'admin')) {
      return NextResponse.json({ error: '사용할 수 없는 아이디입니다.' }, { status: 400 });
    }

    // 중복 확인
    const { data: dup } = await supabase.from('users').select('username').eq('username', id).single();
    if (dup) return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 });

    const { data: dupEmail } = await supabase.from('users').select('email').eq('email', email.trim()).single();
    if (dupEmail) return NextResponse.json({ error: '이미 등록된 이메일입니다.' }, { status: 409 });

    const { hash, salt } = hashPassword(password);
    const { error } = await supabase.from('users').insert({
      username: id,
      password_hash: hash,
      salt,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthdate: birthdate.trim(),
      gender: gender.trim(),
      role: 'user',
    });

    if (error) {
      return NextResponse.json({ error: '가입 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ message: '회원가입이 완료되었습니다.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
