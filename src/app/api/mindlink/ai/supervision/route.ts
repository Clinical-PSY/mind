import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callStream, SUPERVISION_SYSTEM, VERBATIM_SUPERVISION_SYSTEM } from '@/lib/openai';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const { case_id, messages, mode } = await req.json();

  const isVerbatim = mode === 'verbatim';
  let systemPrompt = isVerbatim ? VERBATIM_SUPERVISION_SYSTEM : SUPERVISION_SYSTEM;

  if (case_id) {
    const [{ data: c }, { data: concept }] = await Promise.all([
      supabase.from('mindlink_cases').select('*').eq('id', case_id).single(),
      supabase.from('mindlink_conceptualizations').select('summary,dsm_considerations').eq('case_id', case_id).single(),
    ]);
    if (c) {
      systemPrompt += `\n\n## 현재 상담 사례 맥락\n- 내담자: ${c.age}세 ${c.gender}, 주호소: ${c.presenting_problems}\n- 배경: ${c.background?.slice(0, 300)}`;
      if (concept) systemPrompt += `\n- 사례개념화 요약: ${concept.summary?.slice(0, 400)}\n- DSM 고려: ${concept.dsm_considerations?.slice(0, 200)}`;
    }
  }

  const recentMessages = (messages as { role: string; content: string }[]).slice(-12);

  try {
    const stream = await callStream(systemPrompt, recentMessages);

    let fullReply = '';
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            fullReply += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();

        // 대화 저장
        if (case_id && recentMessages.length > 0) {
          const lastUser = [...recentMessages].reverse().find(m => m.role === 'user');
          if (lastUser) {
            await supabase.from('mindlink_supervision_logs').insert([
              { case_id, role: 'user', content: lastUser.content },
              { case_id, role: 'assistant', content: fullReply },
            ]);
          }
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    });
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
