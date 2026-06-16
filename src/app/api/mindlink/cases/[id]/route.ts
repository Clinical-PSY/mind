import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

async function requireCounselor(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role)) return null;
  return user;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCounselor(req);
  if (!user) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id } = await params;

  const [
    { data: c },
    { data: sessions },
    { data: tests },
    { data: report },
    { data: conceptualization },
    { data: intervention },
    { data: outcomes },
  ] = await Promise.all([
    supabase.from('mindlink_cases').select('*').eq('id', id).single(),
    supabase.from('mindlink_sessions').select('*').eq('case_id', id).order('session_num'),
    supabase.from('mindlink_tests').select('*').eq('case_id', id).order('created_at'),
    supabase.from('mindlink_psych_reports').select('*').eq('case_id', id).single(),
    supabase.from('mindlink_conceptualizations').select('*').eq('case_id', id).single(),
    supabase.from('mindlink_interventions').select('*').eq('case_id', id).single(),
    supabase.from('mindlink_outcomes').select('*').eq('case_id', id).single(),
  ]);

  if (!c) return NextResponse.json({ error: '사례를 찾을 수 없습니다.' }, { status: 404 });
  if (user.role !== 'admin' && c.counselor_username !== user.username)
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  return NextResponse.json({ case: c, sessions: sessions ?? [], tests: tests ?? [], report, conceptualization, intervention, outcomes });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCounselor(req);
  if (!user) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id } = await params;

  const body = await req.json();
  const allowed = ['name','age','gender','referral_source','presenting_problems','background','status','client_code'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  allowed.forEach(k => { if (k in body) updates[k] = body[k]; });

  const { error } = await supabase.from('mindlink_cases').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: '수정 실패' }, { status: 500 });
  return NextResponse.json({ message: '수정되었습니다.' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCounselor(req);
  if (!user) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  const { id } = await params;

  const { error } = await supabase.from('mindlink_cases').delete().eq('id', id);
  if (error) return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
  return NextResponse.json({ message: '사례가 삭제되었습니다.' });
}
