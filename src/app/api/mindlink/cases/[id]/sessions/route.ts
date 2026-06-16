import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;

  const { data: existing } = await supabase.from('mindlink_sessions').select('id').eq('case_id', case_id);
  const sessionNum = (existing?.length ?? 0) + 1;

  const body = await req.json();
  const { data, error } = await supabase.from('mindlink_sessions').insert({
    case_id,
    session_num: sessionNum,
    session_date: body.session_date ?? new Date().toISOString().slice(0, 10),
    duration: body.duration ?? 50,
    mood_before: body.mood_before ?? null,
    mood_after: body.mood_after ?? null,
    observations: body.observations ?? '',
    goals_progress: body.goals_progress ?? '',
    homework: body.homework ?? '',
    counselor_notes: body.counselor_notes ?? '',
  }).select().single();

  if (error) return NextResponse.json({ error: '회기 추가 실패' }, { status: 500 });

  await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;

  const { session_id } = await req.json();
  const { error } = await supabase.from('mindlink_sessions').delete().eq('id', session_id).eq('case_id', case_id);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: '삭제되었습니다.' });
}
