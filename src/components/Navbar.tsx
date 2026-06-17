"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthUser { username: string; name: string; role: string; }

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try { setAuthUser(JSON.parse(stored)); } catch { /* ignore */ }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_user") {
        try { setAuthUser(e.newValue ? JSON.parse(e.newValue) : null); } catch { setAuthUser(null); }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthUser(null);
    router.push("/");
    setMobileOpen(false);
  }

  const navLinks = [
    { href: "/about", label: "연구소 소개" },
    { href: "/services", label: "서비스" },
    { href: "/#team", label: "인력 소개" },
    { href: "/tests", label: "심리검사" },
    { href: "/portfolio", label: "포트폴리오" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5%",
          background: scrolled ? "rgba(26,47,94,0.96)" : "rgba(26,47,94,0.0)",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,.18)" : "none",
          transition: "background .3s, backdrop-filter .3s, box-shadow .3s",
        }}
      >
        <Link href="/" style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-.3px", textDecoration: "none" }}>
          별생각 <span style={{ color: "var(--bs-accent)" }}>심리사회 연구소</span>
        </Link>

        <ul style={{ display: "flex", gap: "1.6rem", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }} className="nav-links-desktop">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              {href.startsWith('/#') ? (
                <a href={href} style={navLinkStyle}>{label}</a>
              ) : (
                <Link href={href} style={navLinkStyle}>{label}</Link>
              )}
            </li>
          ))}
          <li>
            <a href="/#contact" style={{ ...navLinkStyle, background: "var(--bs-accent)", color: "#fff", padding: ".42rem 1.15rem", borderRadius: 6, fontWeight: 700 }}>
              상담 접수
            </a>
          </li>
          {authUser && ["admin", "subscriber"].includes(authUser.role) && (
            <li>
              <Link href="/mindlink" style={{ ...navLinkStyle, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", padding: ".38rem 1rem", borderRadius: 6, fontWeight: 700, fontSize: ".82rem" }}>
                MindLink
              </Link>
            </li>
          )}
          <li>
            {authUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                <Link href="/dashboard" style={{ ...navLinkStyle, color: "rgba(255,255,255,.9)", fontWeight: 600 }}>
                  {authUser.name || authUser.username}님
                </Link>
                <button onClick={logout} style={{ ...navLinkStyle, background: "none", border: "1px solid rgba(255,255,255,.3)", borderRadius: 6, padding: ".35rem .85rem", cursor: "pointer", fontSize: ".82rem" }}>
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" style={{ ...navLinkStyle, border: "1.5px solid rgba(78,157,224,.55)", color: "var(--bs-accent)", padding: ".38rem 1rem", borderRadius: 6, fontWeight: 600 }}>
                로그인
              </Link>
            )}
          </li>
        </ul>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: "none", flexDirection: "column", gap: 5, cursor: "pointer", padding: 4, background: "none", border: "none" }}
          className="hamburger-btn"
          aria-label="메뉴"
        >
          <span style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, transition: "transform .3s, opacity .3s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, opacity: mobileOpen ? 0 : 1, transition: "opacity .3s" }} />
          <span style={{ display: "block", width: 24, height: 2, background: "#fff", borderRadius: 2, transition: "transform .3s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </nav>

      {mobileOpen && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 64, left: 0, right: 0,
          background: "rgba(20,38,76,.97)",
          padding: "1.5rem 5%",
          gap: "1.2rem",
          zIndex: 999,
          backdropFilter: "blur(10px)",
        }}>
          {navLinks.map(({ href, label }) => (
            href.startsWith('/#') ? (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: "rgba(255,255,255,.85)",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgba(255,255,255,.08)",
                  paddingBottom: "1rem",
                }}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: "rgba(255,255,255,.85)",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgba(255,255,255,.08)",
                  paddingBottom: "1rem",
                }}
              >
                {label}
              </Link>
            )
          ))}
          <a href="/#contact" onClick={() => setMobileOpen(false)} style={{ color: "var(--bs-accent)", textDecoration: "none", fontSize: "1rem", fontWeight: 700 }}>
            상담 접수 →
          </a>
          {authUser ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: "rgba(255,255,255,.9)", textDecoration: "none", fontSize: "1rem", fontWeight: 600 }}>
                {authUser.name || authUser.username}님의 마이페이지
              </Link>
              {["admin", "subscriber"].includes(authUser.role) && (
                <Link href="/mindlink" onClick={() => setMobileOpen(false)} style={{ color: "#a5b4fc", textDecoration: "none", fontSize: "1rem", fontWeight: 700 }}>
                  MindLink →
                </Link>
              )}
              <button onClick={logout} style={{ background: "none", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, padding: ".55rem 1rem", color: "rgba(255,255,255,.7)", fontSize: ".9rem", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} style={{ color: "var(--bs-accent)", textDecoration: "none", fontSize: "1rem", fontWeight: 600 }}>
              로그인 / 회원가입
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,.82)",
  textDecoration: "none",
  fontSize: ".88rem",
  fontWeight: 500,
};
