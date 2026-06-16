import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;

  const body = await req.json();
  if (!body.test_name?.trim()) return NextResponse.json({ error: '검사명은 필수입니다.' }, { status: 400 });

  const { data, error } = await supabase.from('mindlink_tests').insert({
    case_id,
    test_name: body.test_name.trim(),
    test_date: body.test_date ?? new Date().toISOString().slice(0, 10),
    scores: body.scores ?? {},
    interpretation: body.interpretation ?? '',
  }).select().single();

  if (error) return NextResponse.json({ error: '검사 추가 실패' }, { status: 500 });
  await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;

  const { test_id } = await req.json();
  const { error } = await supabase.from('mindlink_tests').delete().eq('id', test_id).eq('case_id', case_id);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: '삭제되었습니다.' });
}
