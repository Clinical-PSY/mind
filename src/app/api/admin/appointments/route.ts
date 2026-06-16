import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

async function requireAdmin(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  return NextResponse.json({ appointments: data });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { id, status, memo } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });

  const updates: Record<string, string> = {};
  if (status) updates.status = status;
  if (memo !== undefined) updates.memo = memo;

  const { error } = await supabase.from('appointments').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: '변경 실패' }, { status: 500 });
  return NextResponse.json({ message: '변경되었습니다.' });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });

  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: '삭제되었습니다.' });
}
