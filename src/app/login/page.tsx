"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => { if (r.ok) router.push("/"); })
        .catch(() => {});
    }
  }, [router]);

  async function doLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "로그인에 실패했습니다."); return; }
      const user = { username: data.username, name: data.name, role: data.role };
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      const params = new URLSearchParams(window.location.search);
      router.push(params.get("redirect") || "/");
    } catch {
      setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <style>{`
          .login-wrap { flex:1; display:flex; align-items:center; justify-content:center; padding:100px 20px 60px; min-height:100vh; }
          .login-card { background:var(--bs-white); border-radius:20px; box-shadow:0 4px 40px rgba(26,47,94,.10); padding:48px 44px; width:100%; max-width:420px; }
          .login-logo { text-align:center; margin-bottom:8px; }
          .login-logo-icon { width:52px; height:52px; background:linear-gradient(135deg,#1a2f5e,#2563a8); border-radius:14px; display:inline-flex; align-items:center; justify-content:center; font-size:1.6rem; margin-bottom:10px; }
          .login-title { text-align:center; font-size:1.35rem; font-weight:800; color:var(--bs-navy); margin-bottom:4px; }
          .login-sub { text-align:center; font-size:.83rem; color:var(--bs-muted); margin-bottom:32px; }
          .form-group { margin-bottom:16px; }
          .form-group label { display:block; font-size:.82rem; font-weight:600; color:#374151; margin-bottom:6px; }
          .form-group input { width:100%; padding:11px 14px; border:1.5px solid var(--bs-border); border-radius:10px; font-size:.92rem; font-family:inherit; color:var(--bs-text); background:var(--bs-bg); outline:none; transition:border-color .2s; }
          .form-group input:focus { border-color:var(--bs-accent); background:#fff; }
          .btn-primary { width:100%; padding:13px; border:none; border-radius:12px; background:linear-gradient(135deg,#1a2f5e,#2563a8); color:#fff; font-size:.97rem; font-weight:700; cursor:pointer; margin-top:8px; transition:opacity .2s; font-family:inherit; }
          .btn-primary:hover { opacity:.88; }
          .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
          .login-links { display:flex; justify-content:center; margin-top:18px; font-size:.82rem; color:var(--bs-muted); }
          .login-links a { color:var(--bs-blue); text-decoration:none; padding:0 10px; border-right:1px solid var(--bs-border); transition:color .2s; }
          .login-links a:last-child { border-right:none; }
          .login-links a:hover { color:var(--bs-navy); }
          .divider { border:none; border-top:1px solid var(--bs-border); margin:24px 0; }
          .signup-area { text-align:center; }
          .signup-area p { font-size:.83rem; color:var(--bs-muted); margin-bottom:10px; }
          .btn-outline-navy { display:inline-block; padding:10px 28px; border:1.5px solid var(--bs-navy); border-radius:10px; color:var(--bs-navy); font-size:.88rem; font-weight:600; text-decoration:none; transition:background .2s,color .2s; background:none; cursor:pointer; font-family:inherit; }
          .btn-outline-navy:hover { background:var(--bs-navy); color:#fff; }
          .error-msg { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; border-radius:8px; padding:10px 14px; font-size:.83rem; margin-bottom:14px; }
          @media(max-width:480px) { .login-card { padding:32px 24px; } }
        `}</style>
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">
              <div className="login-logo-icon">✨</div>
            </div>
            <h1 className="login-title">로그인</h1>
            <p className="login-sub">별생각 심리사회 연구소 회원 서비스</p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={doLogin}>
              <div className="form-group">
                <label htmlFor="username">아이디</label>
                <input id="username" type="text" placeholder="아이디를 입력하세요" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <input id="password" type="password" placeholder="비밀번호를 입력하세요" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button>
            </form>
            <div className="login-links">
              <a href="/find-account?tab=id">아이디 찾기</a>
              <a href="/find-account?tab=pw">비밀번호 찾기</a>
            </div>
            <hr className="divider" />
            <div className="signup-area">
              <p>아직 회원이 아니신가요?</p>
              <a href="/signup" className="btn-outline-navy">회원가입</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
