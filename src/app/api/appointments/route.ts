import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, service_type, message } = await req.json();
    if (!name?.trim() || !phone?.trim() || !service_type?.trim()) {
      return NextResponse.json({ error: '이름, 연락처, 상담 유형은 필수입니다.' }, { status: 400 });
    }

    const user = await getUserFromRequest(req).catch(() => null);

    const { error } = await supabase.from('appointments').insert({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() ?? '',
      service_type: service_type.trim(),
      message: message?.trim() ?? '',
      status: 'pending',
      username: user?.username ?? null,
    });

    if (error) return NextResponse.json({ error: '접수 중 오류가 발생했습니다.' }, { status: 500 });
    return NextResponse.json({ message: '상담 신청이 접수되었습니다.' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
