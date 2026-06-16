"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const user = (() => { try { return JSON.parse(localStorage.getItem("auth_user") ?? ""); } catch { return null; } })();
    if (!token || user?.role !== "admin") {
      router.push("/login?redirect=" + pathname);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fc" }}>
      <p style={{ color: "#6b7280" }}>권한 확인 중...</p>
    </div>
  );

  const navItems = [
    { href: "/admin/users", label: "👥 회원 관리" },
    { href: "/admin/appointments", label: "📅 예약 관리" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex" }}>
      {/* 사이드바 */}
      <aside style={{
        width: 220, background: "#1a2f5e", color: "#fff",
        padding: "0", display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <Link href="/" style={{ color: "#4e9de0", fontWeight: 800, fontSize: ".95rem", textDecoration: "none" }}>
            ← 사이트로
          </Link>
          <div style={{ marginTop: 12, fontSize: ".78rem", color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: 1 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: "block", padding: "10px 14px", borderRadius: 8, marginBottom: 4,
              textDecoration: "none", fontSize: ".88rem", fontWeight: 600,
              color: pathname === href ? "#fff" : "rgba(255,255,255,.65)",
              background: pathname === href ? "rgba(78,157,224,.25)" : "transparent",
              transition: "background .15s, color .15s",
            }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.1)", fontSize: ".75rem", color: "rgba(255,255,255,.35)" }}>
          별생각 심리사회 연구소
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
