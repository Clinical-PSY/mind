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
    session_num:    sessionNum,
    session_date:   body.session_date   ?? new Date().toISOString().slice(0, 10),
    session_type:   body.session_type   ?? '대면',
    duration:       body.duration       ?? 50,
    mood_before:    body.mood_before    ?? null,
    mood_after:     body.mood_after     ?? null,
    session_notes:  body.session_notes  ?? '',
    soap_s:         body.soap_s         ?? '',
    soap_o:         body.soap_o         ?? '',
    soap_a:         body.soap_a         ?? '',
    soap_p:         body.soap_p         ?? '',
    // 하위호환 — 기존 열 유지
    observations:    body.soap_o        ?? body.observations    ?? '',
    counselor_notes: body.soap_a        ?? body.counselor_notes ?? '',
    homework:        body.soap_p        ?? body.homework        ?? '',
  }).select().single();

  if (error) return NextResponse.json({ error: '회기 추가 실패', detail: error.message, code: error.code }, { status: 500 });
  await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;

  const body = await req.json();
  const { session_id, ...fields } = body;
  if (!session_id) return NextResponse.json({ error: 'session_id 필수' }, { status: 400 });

  const allowed = [
    'session_date', 'session_type', 'duration',
    'mood_before', 'mood_after',
    'session_notes',
    'soap_s', 'soap_o', 'soap_a', 'soap_p',
    'observations', 'counselor_notes', 'homework',
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  allowed.forEach(k => { if (k in fields) updates[k] = fields[k]; });

  // SOAP → 하위호환 열 동기화
  if ('soap_o' in fields) updates['observations']    = fields['soap_o'];
  if ('soap_a' in fields) updates['counselor_notes'] = fields['soap_a'];
  if ('soap_p' in fields) updates['homework']        = fields['soap_p'];

  const { error } = await supabase.from('mindlink_sessions')
    .update(updates).eq('id', session_id).eq('case_id', case_id);
  if (error) return NextResponse.json({ error: '수정 실패', detail: error.message, code: error.code }, { status: 500 });
  await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
  return NextResponse.json({ message: '수정되었습니다.' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;

  const { session_id } = await req.json();
  const { error } = await supabase.from('mindlink_sessions')
    .delete().eq('id', session_id).eq('case_id', case_id);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: '삭제되었습니다.' });
}
