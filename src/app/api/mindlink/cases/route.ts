import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';

async function requireCounselor(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await requireCounselor(req);
  if (!user) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const isAdmin = user.role === 'admin';
  let query = supabase.from('mindlink_cases').select('*').order('updated_at', { ascending: false });
  if (!isAdmin) query = query.eq('counselor_username', user.username);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const user = await requireCounselor(req);
  if (!user) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const body = await req.json();
  if (!body.client_alias?.trim()) return NextResponse.json({ error: '내담자 가명은 필수입니다.' }, { status: 400 });

  const { data, error } = await supabase.from('mindlink_cases').insert({
    counselor_username: user.username,
    client_alias: body.client_alias.trim(),
    age: body.age || null,
    gender: body.gender || '',
    referral_source: body.referral_source || '',
    presenting_problems: body.presenting_problems || '',
    background: body.background || '',
    status: 'active',
  }).select().single();

  if (error) return NextResponse.json({ error: '생성 실패' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
