import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, SOAP_SYSTEM } from '@/lib/openai';

interface SoapResult {
  soap_s: string;
  soap_o: string;
  soap_a: string;
  soap_p: string;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const { case_id, session_notes, session_num, session_date } = await req.json();
  if (!session_notes?.trim())
    return NextResponse.json({ error: '상담 노트가 비어 있습니다.' }, { status: 400 });

  // 내담자 컨텍스트 조회
  const { data: c } = await supabase
    .from('mindlink_cases')
    .select('age, gender, presenting_problems, background')
    .eq('id', case_id)
    .single();

  const context = c
    ? `[내담자 정보]\n나이: ${c.age}세, 성별: ${c.gender}\n주호소: ${c.presenting_problems}\n배경: ${c.background}\n회기: ${session_num ?? '?'}회 (${session_date ?? ''})\n\n`
    : '';

  const prompt = `${context}[상담사 자유기술 노트]\n${session_notes.trim()}\n\n위 노트를 SOAP 형식으로 구조화하십시오.`;

  try {
    const result = await callJSON<SoapResult>(SOAP_SYSTEM, prompt, 1200);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
