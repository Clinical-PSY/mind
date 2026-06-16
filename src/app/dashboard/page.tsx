"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AuthUser { username: string; name: string; role: string; }

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const stored = localStorage.getItem("auth_user");
    if (!token || !stored) {
      router.push("/login?redirect=/dashboard");
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          router.push("/login?redirect=/dashboard");
          return;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          const u = { username: data.username, name: data.name, role: data.role };
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
        }
      })
      .catch(() => {
        try { setUser(JSON.parse(stored)); } catch { router.push("/login"); }
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  }

  if (loading) {
    return (
      <><Navbar />
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "var(--bs-muted)", fontSize: ".95rem" }}>로딩 중...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "admin";

  const menuCards = [
    { icon: "📅", title: "상담 예약", desc: "새 상담을 예약하거나 예약 현황을 확인합니다.", href: "/#contact", color: "#2563a8" },
    { icon: "🧠", title: "심리검사", desc: "PHQ-9, GAD-7 등 자가 검사를 진행합니다.", href: "/tests", color: "#7c3aed" },
    { icon: "📋", title: "서비스 안내", desc: "제공하는 상담 서비스를 확인합니다.", href: "/services", color: "#059669" },
    { icon: "🏛️", title: "연구소 소개", desc: "별생각 심리사회 연구소를 소개합니다.", href: "/about", color: "#d97706" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--bs-bg)", paddingTop: 80 }}>
        <style>{`
          .dash-wrap { max-width: 960px; margin: 0 auto; padding: 40px 5% 80px; }
          .dash-header { background: linear-gradient(135deg, #1a2f5e 0%, #2563a8 100%); border-radius: 20px; padding: 36px 40px; color: #fff; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
          .dash-avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,.2); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; color: #fff; flex-shrink: 0; border: 2px solid rgba(255,255,255,.35); }
          .dash-info h2 { font-size: 1.4rem; font-weight: 800; margin: 0 0 4px; }
          .dash-info p { font-size: .85rem; opacity: .75; margin: 0; }
          .dash-badge { background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.3); border-radius: 20px; padding: .3rem .85rem; font-size: .75rem; font-weight: 700; display: inline-block; margin-top: 8px; }
          .dash-logout-btn { background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.4); color: #fff; border-radius: 10px; padding: .55rem 1.2rem; font-size: .85rem; font-weight: 600; cursor: pointer; transition: background .2s; font-family: inherit; flex-shrink: 0; }
          .dash-logout-btn:hover { background: rgba(255,255,255,.25); }
          .section-title { font-size: 1.05rem; font-weight: 800; color: var(--bs-navy); margin: 0 0 16px; }
          .menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
          .menu-card { background: var(--bs-white); border: 1px solid var(--bs-border); border-radius: 16px; padding: 24px; text-decoration: none; transition: transform .2s, box-shadow .2s; display: block; }
          .menu-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(26,47,94,.1); }
          .menu-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 14px; }
          .menu-card h3 { font-size: 1rem; font-weight: 700; color: var(--bs-navy); margin: 0 0 6px; }
          .menu-card p { font-size: .82rem; color: var(--bs-muted); margin: 0; line-height: 1.6; }
          .info-card { background: var(--bs-white); border: 1px solid var(--bs-border); border-radius: 16px; padding: 24px 28px; margin-bottom: 32px; }
          .info-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--bs-border); gap: 12px; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-size: .78rem; font-weight: 700; color: var(--bs-muted); width: 90px; flex-shrink: 0; }
          .info-value { font-size: .9rem; color: var(--bs-text); font-weight: 500; }
          .admin-card { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 16px; padding: 20px 24px; margin-bottom: 32px; }
          .admin-card h3 { font-size: .95rem; font-weight: 800; color: #92400e; margin: 0 0 10px; }
          .admin-link { display: inline-block; padding: .5rem 1.1rem; background: #f59e0b; color: #fff; border-radius: 8px; font-size: .82rem; font-weight: 700; text-decoration: none; margin-right: 8px; transition: opacity .2s; }
          .admin-link:hover { opacity: .85; }
          @media (max-width: 600px) {
            .dash-header { flex-direction: column; align-items: flex-start; }
            .menu-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        <div className="dash-wrap">
          <div className="dash-header">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div className="dash-avatar">{(user.name || user.username).charAt(0)}</div>
              <div className="dash-info">
                <h2>{user.name || user.username}님, 안녕하세요!</h2>
                <p>별생각 심리사회 연구소 회원 서비스에 오신 것을 환영합니다.</p>
                <span className="dash-badge">{isAdmin ? "관리자" : "일반 회원"}</span>
              </div>
            </div>
            <button className="dash-logout-btn" onClick={logout}>로그아웃</button>
          </div>

          {isAdmin && (
            <div className="admin-card">
              <h3>⚙️ 관리자 메뉴</h3>
              <Link href="/admin/users" className="admin-link">회원 관리</Link>
              <Link href="/admin/appointments" className="admin-link">예약 관리</Link>
            </div>
          )}

          <div className="info-card">
            <p className="section-title">내 계정 정보</p>
            <div className="info-row">
              <span className="info-label">아이디</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">이름</span>
              <span className="info-value">{user.name || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">권한</span>
              <span className="info-value">{isAdmin ? "관리자" : "일반 회원"}</span>
            </div>
          </div>

          <p className="section-title">바로가기</p>
          <div className="menu-grid">
            {menuCards.map((card) => (
              <Link key={card.href} href={card.href} className="menu-card">
                <div className="menu-icon" style={{ background: card.color + "18" }}>
                  <span style={{ fontSize: "1.4rem" }}>{card.icon}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </Link>
            ))}
          </div>

          <div style={{ background: "var(--bs-white)", border: "1px solid var(--bs-border)", borderRadius: 16, padding: "24px 28px" }}>
            <p className="section-title" style={{ marginBottom: 8 }}>📌 공지사항</p>
            <p style={{ fontSize: ".86rem", color: "var(--bs-muted)", margin: 0, lineHeight: 1.8 }}>
              현재 상담 예약은 홈페이지 하단의 <strong>상담 접수</strong> 양식을 통해 신청하실 수 있습니다.<br />
              접수 후 담당자가 48시간 내 연락드립니다.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
