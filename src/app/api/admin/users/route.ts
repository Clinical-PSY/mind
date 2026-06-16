import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('username, name, email, phone, gender, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { username, role } = await req.json();
  if (!['user', 'subscriber', 'admin'].includes(role)) {
    return NextResponse.json({ error: '유효하지 않은 역할입니다.' }, { status: 400 });
  }

  const { error } = await supabase.from('users').update({ role }).eq('username', username);
  if (error) return NextResponse.json({ error: '변경 실패' }, { status: 500 });
  return NextResponse.json({ message: `${username}의 역할이 ${role}로 변경되었습니다.` });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: '사용자명이 필요합니다.' }, { status: 400 });

  const { error } = await supabase.from('users').delete().eq('username', username);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: `${username} 회원이 삭제되었습니다.` });
}
