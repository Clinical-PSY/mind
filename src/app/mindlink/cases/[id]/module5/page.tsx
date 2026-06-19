'use client';
import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Message { role: 'user' | 'assistant'; content: string; }

// ── Simple markdown renderer ─────────────────────────────────────────
function MdLine({ text }: { text: string }) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-4 border-white/10" />);
      i++; continue;
    }
    // H1
    if (line.startsWith('# ')) {
      nodes.push(<h1 key={i} className="text-base font-bold text-white mt-5 mb-2">{line.slice(2)}</h1>);
      i++; continue;
    }
    // H2
    if (line.startsWith('## ')) {
      nodes.push(<h2 key={i} className="text-sm font-bold mt-4 mb-1.5" style={{ color: '#a5b4fc' }}>{line.slice(3)}</h2>);
      i++; continue;
    }
    // H3
    if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} className="text-xs font-semibold mt-3 mb-1 uppercase tracking-wide" style={{ color: '#7dd3fc' }}>{line.slice(4)}</h3>);
      i++; continue;
    }
    // Table: detect header row
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|---')) {
      const headers = line.split('|').slice(1, -1).map(h => h.trim());
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].split('|').slice(1, -1).map(c => c.trim()));
        i++;
      }
      nodes.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-3 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.12)' }}>
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 text-left font-semibold" style={{ color: '#a5b4fc', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <MdLine text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 align-top" style={{ color: 'rgba(255,255,255,0.75)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <MdLine text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    // Bullet list
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-1 pl-4">
          {items.map((it, ii) => (
            <li key={ii} className="text-xs flex gap-2" style={{ color: 'rgba(255,255,255,0.72)' }}>
              <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-indigo-400 inline-block" />
              <MdLine text={it} />
            </li>
          ))}
        </ul>
      );
      continue;
    }
    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-1 pl-4 list-decimal list-outside">
          {items.map((it, ii) => (
            <li key={ii} className="text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
              <MdLine text={it} />
            </li>
          ))}
        </ol>
      );
      continue;
    }
    // Bold-prefix section label (e.g. **[발화 N]**)
    if (line.startsWith('**[') && line.endsWith(']**')) {
      nodes.push(
        <div key={i} className="mt-5 mb-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#c7d2fe', display: 'inline-block' }}>
          {line.slice(3, -3)}
        </div>
      );
      i++; continue;
    }
    // Empty line
    if (!line.trim()) {
      nodes.push(<div key={i} className="h-1.5" />);
      i++; continue;
    }
    // Default paragraph
    nodes.push(
      <p key={i} className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
        <MdLine text={line} />
      </p>
    );
    i++;
  }
  return <div className="space-y-0.5">{nodes}</div>;
}

// ── 상담 단계 옵션 ───────────────────────────────────────────────────
const STAGES = ['초기', '중기', '종결기'] as const;

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
export default function Module5({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Chat tab state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Verbatim tab state
  const [verbatim, setVerbatim] = useState('');
  const [stage, setStage] = useState<string>('');
  const [sessionNum, setSessionNum] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Tab
  const [tab, setTab] = useState<'chat' | 'verbatim'>('chat');

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

  // ── Chat send ──────────────────────────────────────────────────────
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
        body: JSON.stringify({ case_id: id, messages: newMessages, mode: 'chat' }),
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

  // ── Verbatim analysis ──────────────────────────────────────────────
  async function analyzeVerbatim() {
    if (!verbatim.trim() || analyzing) return;
    setAnalyzing(true);
    setAnalysisResult('');

    const contextNote = [
      stage && `상담 단계: ${stage}기`,
      sessionNum && `회기 번호: ${sessionNum}회기`,
    ].filter(Boolean).join(', ');

    const userMessage = [
      contextNote && `[상담 맥락: ${contextNote}]`,
      '아래 상담 축어록을 5단계 슈퍼비전 형식으로 분석해주세요.',
      '',
      verbatim.trim(),
    ].filter(s => s !== undefined).join('\n');

    try {
      const res = await fetchWithAuth('/api/mindlink/ai/supervision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: id,
          messages: [{ role: 'user', content: userMessage }],
          mode: 'verbatim',
        }),
      });
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAnalysisResult(full);
      }
    } catch (e) {
      setAnalysisResult(`오류: ${(e as Error).message}`);
    }
    setAnalyzing(false);
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col" style={{ minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
        <Link href="/mindlink" className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">AI 슈퍼비전</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">💬 AI 슈퍼비전</h1>
          <p className="text-white/40 text-xs mt-0.5">임상 자문 · 축어록 슈퍼비전 분석</p>
        </div>
        {tab === 'chat' && messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            대화 초기화
          </button>
        )}
        {tab === 'verbatim' && analysisResult && (
          <button onClick={() => setAnalysisResult('')} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            결과 초기화
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([
          { key: 'chat',    label: '💬 AI 자문' },
          { key: 'verbatim', label: '📋 축어록 슈퍼비전' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === t.key
              ? { background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)' }
              : { color: 'rgba(255,255,255,0.38)', border: '1px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ Tab 1: Chat ══ */}
      {tab === 'chat' && (
        <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
          <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 p-4 mb-4 space-y-4" style={{ background: '#1e293b', minHeight: 360 }}>
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
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'text-white rounded-br-sm' : 'text-white/90 rounded-bl-sm'}`}
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
                    : { background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 animate-pulse rounded-sm" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

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
          <p className="text-white/20 text-xs mt-2 text-center">AI 슈퍼비전은 임상가의 판단을 대체하지 않습니다.</p>
        </div>
      )}

      {/* ══ Tab 2: Verbatim Supervision ══ */}
      {tab === 'verbatim' && (
        <div className="space-y-5">

          {/* Context fields */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>상담 맥락 (선택)</p>
            <div className="flex gap-4 flex-wrap">
              {/* 상담 단계 */}
              <div>
                <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>상담 단계</p>
                <div className="flex gap-1.5">
                  {STAGES.map(s => (
                    <button key={s} onClick={() => setStage(stage === s ? '' : s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={stage === s
                        ? { background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* 회기 번호 */}
              <div>
                <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>회기 번호</p>
                <input type="number" min={1} value={sessionNum} onChange={e => setSessionNum(e.target.value)}
                  placeholder="예: 5"
                  className="w-24 px-3 py-1.5 rounded-lg text-white text-xs bg-white/5 border border-white/10 outline-none focus:border-indigo-400/60"
                  style={{ color: 'rgba(255,255,255,0.75)' }} />
              </div>
            </div>
          </div>

          {/* Verbatim input */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold text-white/60">상담 축어록 입력</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>내담자/상담자 발화를 구분하여 붙여넣으세요</p>
            </div>
            <textarea
              value={verbatim}
              onChange={e => setVerbatim(e.target.value)}
              rows={12}
              placeholder={`예시:\n내담자: 요즘 계속 불안하고 아무것도 하기 싫어요. 그냥 다 포기하고 싶은 마음이에요.\n상담자: 많이 힘드시겠네요. 어떤 부분이 가장 힘드세요?\n내담자: 사람들을 만나는 게 너무 무서워요. 뭔가 잘못될 것 같아서...`}
              className="w-full px-4 py-4 text-sm resize-none outline-none"
              style={{
                background: '#0f172a',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'monospace',
                lineHeight: 1.7,
              }}
              disabled={analyzing}
            />
          </div>

          {/* Analyze button */}
          <div className="flex items-center gap-4">
            <button
              onClick={analyzeVerbatim}
              disabled={analyzing || !verbatim.trim()}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              {analyzing
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>분석 중...</span></>
                : <><span>🔍</span><span>슈퍼비전 분석 시작</span></>}
            </button>
            {verbatim.trim() && (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {verbatim.split('\n').filter(l => l.trim()).length}줄 입력됨
              </p>
            )}
          </div>

          {/* Analysis result */}
          {(analysisResult || analyzing) && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
              {/* Result header */}
              <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>S</div>
                <p className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>슈퍼바이저 분석 결과</p>
                {analyzing && <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-auto animate-pulse rounded-sm" />}
              </div>

              {/* Result body */}
              <div className="px-5 py-5" style={{ background: '#0f172a' }}>
                {analysisResult
                  ? <MarkdownBlock content={analysisResult} />
                  : <p className="text-xs animate-pulse" style={{ color: 'rgba(255,255,255,0.3)' }}>분석 중입니다...</p>
                }
              </div>
            </div>
          )}

          {!analysisResult && !analyzing && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-medium text-white/40">축어록을 입력하고 분석을 시작하세요</p>
              <p className="text-xs mt-2 text-white/20">5단계 슈퍼비전: 맥락 분석 → 공감수준 평가 → 발화별 분석 → 대안반응 제안 → 종합 코멘트</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
