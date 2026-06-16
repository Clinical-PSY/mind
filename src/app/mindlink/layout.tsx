'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AuthUser { username: string; name: string; role: string; }

export default function MindLinkLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error();
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bs-navy)' }}>
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm opacity-60">인증 확인 중...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between" style={{ background: '#0f172a' }}>
        <div className="flex items-center gap-6">
          <Link href="/mindlink" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>M</div>
            <span className="text-white font-semibold text-sm">MindLink</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/mindlink"
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${pathname === '/mindlink' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              대시보드
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user.name?.[0] ?? user.username[0]}
          </div>
          <span className="text-white/70 text-xs hidden sm:block">{user.name}</span>
          <Link href="/" className="text-white/40 hover:text-white text-xs transition-colors">나가기</Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
