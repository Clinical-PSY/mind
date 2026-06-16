'use client';
import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function Module5({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) {
        const d = await res.json();
        if (d.supervision_logs?.length) {
          setMessages(d.supervision_logs.map((l: { role: string; content: string }) => ({ role: l.role as 'user' | 'assistant', content: l.content })));
        }
      }
    })();
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetchWithAuth('/api/mindlink/ai/supervision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: id, messages: newMessages }),
      });
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: 'assistant', content: fullText }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: `오류: ${(e as Error).message}` }]);
    }
    setStreaming(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
        <Link href="/mindlink" className="hover:text-white">대시보드</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">AI 슈퍼비전</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">💬 AI 슈퍼비전</h1>
          <p className="text-white/40 text-xs mt-0.5">GPT-4o 스트리밍 실시간 임상 자문</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            대화 초기화
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 p-4 mb-4 space-y-4" style={{ background: '#1e293b' }}>
        {messages.length === 0 && (
          <div className="text-center py-12 text-white/25">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm font-medium">AI 슈퍼바이저와 대화 시작</p>
            <p className="text-xs mt-1">사례에 대한 임상적 질문을 자유롭게 물어보세요</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['이 사례에서 가장 중요한 치료 포인트는?', '다음 회기 개입 방향을 제안해줘', '위기 징후가 있는지 평가해줘'].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full text-xs border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mr-2 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>AI</div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'text-white rounded-br-sm'
                : 'text-white/90 rounded-bl-sm'
            }`}
              style={m.role === 'user'
                ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
                : { background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          rows={2} placeholder="임상적 질문을 입력하세요 (Shift+Enter: 줄바꿈, Enter: 전송)"
          disabled={streaming}
          className="flex-1 rounded-xl px-4 py-3 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none disabled:opacity-50" />
        <button onClick={send} disabled={streaming || !input.trim()}
          className="px-5 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-opacity shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>
          {streaming ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '전송'}
        </button>
      </div>
      <p className="text-white/20 text-xs mt-2 text-center">AI 슈퍼비전은 임상가의 판단을 대체하지 않습니다. 위기 상황 시 즉각적인 임상 조치를 취하세요.</p>
    </div>
  );
}
