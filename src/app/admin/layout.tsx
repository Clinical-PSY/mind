"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("관리자");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const user = (() => { try { return JSON.parse(localStorage.getItem("auth_user") ?? ""); } catch { return null; } })();
    if (!token || user?.role !== "admin") { router.push("/login?redirect=" + pathname); return; }
    if (user?.name) setUserName(user.name);
    setReady(true);
  }, [router, pathname]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#64748b", fontSize: ".88rem" }}>권한 확인 중...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const navItems = [
    { href: "/admin/users", label: "회원 관리", icon: "👥", desc: "Users" },
    { href: "/admin/appointments", label: "예약 관리", icon: "📅", desc: "Appointments" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-item { display:flex; align-items:center; gap:12px; padding:11px 16px; border-radius:12px; text-decoration:none; transition:all .2s; margin-bottom:4px; }
        .nav-item:hover { background:rgba(99,102,241,.15); }
        .nav-item.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); box-shadow:0 4px 14px rgba(99,102,241,.4); }
        .nav-item .icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; background:rgba(255,255,255,.08); }
        .nav-item.active .icon { background:rgba(255,255,255,.2); }
        .nav-item .text { flex:1; }
        .nav-item .text strong { display:block; font-size:.87rem; font-weight:700; color:rgba(255,255,255,.9); }
        .nav-item .text span { font-size:.72rem; color:rgba(255,255,255,.4); font-weight:500; }
        .nav-item.active .text strong { color:#fff; }
        .nav-item.active .text span { color:rgba(255,255,255,.6); }
      `}</style>

      {/* 사이드바 */}
      <aside style={{
        width: 240, background: "#0f172a",
        display: "flex", flexDirection: "column", flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,.05)",
      }}>
        {/* 로고 */}
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", boxShadow: "0 4px 12px rgba(99,102,241,.4)",
            }}>✨</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: ".88rem", lineHeight: 1.2 }}>별생각</div>
              <div style={{ color: "#6366f1", fontWeight: 700, fontSize: ".72rem" }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "0 20px 16px" }} />

        {/* 프로필 */}
        <div style={{ padding: "0 20px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: ".85rem", fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>{userName.charAt(0)}</div>
          <div>
            <div style={{ color: "rgba(255,255,255,.9)", fontSize: ".84rem", fontWeight: 700 }}>{userName}</div>
            <div style={{ color: "#6366f1", fontSize: ".7rem", fontWeight: 600 }}>Administrator</div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "0 20px 16px" }} />

        {/* 메뉴 */}
        <nav style={{ padding: "0 12px", flex: 1 }}>
          <div style={{ fontSize: ".67rem", fontWeight: 700, color: "rgba(255,255,255,.25)", letterSpacing: "1.2px", padding: "0 8px 10px" }}>MANAGEMENT</div>
          {navItems.map(({ href, label, icon, desc }) => (
            <Link key={href} href={href} className={`nav-item${pathname === href ? " active" : ""}`}>
              <div className="icon">{icon}</div>
              <div className="text">
                <strong>{label}</strong>
                <span>{desc}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* 하단 */}
        <div style={{ padding: "16px 12px 24px" }}>
          <div style={{ height: 1, background: "rgba(255,255,255,.06)", marginBottom: 16 }} />
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
            borderRadius: 12, textDecoration: "none", transition: "background .2s",
            color: "rgba(255,255,255,.45)",
          }}
            className="nav-item"
          >
            <div className="icon" style={{ fontSize: ".9rem" }}>←</div>
            <div className="text">
              <strong style={{ color: "rgba(255,255,255,.45)" }}>사이트로 돌아가기</strong>
            </div>
          </Link>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main style={{ flex: 1, overflow: "auto", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
