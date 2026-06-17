import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

async function auth(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role)) return null;
  return user;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth(req)) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;
  const { data, error } = await supabase
    .from('mindlink_risk_assessments')
    .select('*')
    .eq('case_id', case_id)
    .order('assessed_at', { ascending: false });
  if (error) return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth(req)) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;
  const body = await req.json();

  const { data, error } = await supabase.from('mindlink_risk_assessments').insert({
    case_id,
    session_id:     body.session_id    ?? null,
    assessed_at:    body.assessed_at   ?? new Date().toISOString().slice(0, 10),
    suicide_risk:   body.suicide_risk  ?? 0,
    self_harm_risk: body.self_harm_risk ?? 0,
    harm_to_others: body.harm_to_others ?? 0,
    abuse_report:   body.abuse_report  ?? false,
    action_taken:   body.action_taken  ?? '',
    notes:          body.notes         ?? '',
  }).select().single();

  if (error) return NextResponse.json({ error: '위험평가 추가 실패' }, { status: 500 });
  await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth(req)) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;
  const body = await req.json();
  const { risk_id, ...fields } = body;
  if (!risk_id) return NextResponse.json({ error: 'risk_id 필수' }, { status: 400 });

  const allowed = ['assessed_at', 'session_id', 'suicide_risk', 'self_harm_risk', 'harm_to_others', 'abuse_report', 'action_taken', 'notes'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  allowed.forEach(k => { if (k in fields) updates[k] = fields[k]; });

  const { error } = await supabase.from('mindlink_risk_assessments')
    .update(updates).eq('id', risk_id).eq('case_id', case_id);
  if (error) return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  return NextResponse.json({ message: '수정되었습니다.' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth(req)) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id: case_id } = await params;
  const { risk_id } = await req.json();
  const { error } = await supabase.from('mindlink_risk_assessments')
    .delete().eq('id', risk_id).eq('case_id', case_id);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: '삭제되었습니다.' });
}
