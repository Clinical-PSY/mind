'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AuthUser { username: string; name: string; role: string; }

function NavItem({ href, icon, label, exact = false }: {
  href: string; icon: string; label: string; exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={[
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
      active
        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
        : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent',
    ].join(' ')}>
      <span className="shrink-0 w-5 text-center text-base leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function MindLinkLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error();
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!['admin', 'subscriber'].includes(data.role)) throw new Error();
        setUser(data);
      } catch {
        router.replace('/login?redirect=/mindlink');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070c18' }}>
      <div className="text-center">
        <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>인증 확인 중...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const initials = (user.name?.[0] ?? user.username[0]).toUpperCase();

  return (
    <div className="dark min-h-screen flex" style={{ background: '#070c18' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-[224px] shrink-0 fixed top-0 left-0 h-screen z-30 flex flex-col"
        style={{ background: '#0c1220', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="h-[58px] px-5 flex items-center shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/mindlink" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>M</div>
            <span className="text-white font-semibold text-sm tracking-tight">MindLink</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
            style={{ color: 'rgba(255,255,255,0.18)' }}>플랫폼</p>
          <NavItem href="/mindlink" icon="📋" label="사례 관리" exact />

          {user.role === 'admin' && (
            <>
              <div className="h-4" />
              <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
                style={{ color: 'rgba(255,255,255,0.18)' }}>관리자</p>
              <NavItem href="/admin" icon="⚙️" label="관리 패널" />
            </>
          )}
        </nav>

        {/* User section */}
        <div className="px-3 pb-5 pt-3 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {user.name || user.username}
              </p>
              <p className="text-[10px] truncate capitalize" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {user.role === 'admin' ? '관리자' : '구독자'}
              </p>
            </div>
          </div>
          <Link href="/"
            className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs transition-colors"
            style={{
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            ← 나가기
          </Link>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 min-h-screen overflow-auto" style={{ marginLeft: '224px' }}>
        {children}
      </main>
    </div>
  );
}
