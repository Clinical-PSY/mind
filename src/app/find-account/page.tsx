"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type TabKey = "id" | "pw";
type PwPhase = "verify" | "reset" | "done";

interface ResultState { type: "success" | "error"; title: string; content: string; }

const styles = `
  .find-wrap { flex:1; display:flex; align-items:center; justify-content:center; padding:100px 20px 60px; min-height:100vh; }
  .card { background:var(--bs-white); border-radius:20px; box-shadow:0 4px 40px rgba(26,47,94,.10); padding:48px 44px; width:100%; max-width:440px; }
  .card-title { font-size:1.35rem; font-weight:800; color:var(--bs-navy); margin-bottom:28px; }
  .tabs { display:flex; border-bottom:2px solid var(--bs-border); margin-bottom:28px; }
  .tab-btn-find { flex:1; padding:11px 0; background:none; border:none; font-family:inherit; font-size:.9rem; font-weight:600; color:var(--bs-muted); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:color .2s,border-color .2s; }
  .tab-btn-find.active { color:var(--bs-blue); border-bottom-color:var(--bs-blue); }
  .form-group { margin-bottom:16px; }
  .form-group label { display:block; font-size:.82rem; font-weight:600; color:#374151; margin-bottom:6px; }
  .form-group input { width:100%; padding:11px 14px; border:1.5px solid var(--bs-border); border-radius:10px; font-size:.92rem; font-family:inherit; color:var(--bs-text); background:var(--bs-bg); outline:none; transition:border-color .2s; }
  .form-group input:focus { border-color:var(--bs-accent); background:#fff; }
  .btn-primary { width:100%; padding:13px; border:none; border-radius:12px; background:linear-gradient(135deg,#1a2f5e,#2563a8); color:#fff; font-size:.97rem; font-weight:700; cursor:pointer; margin-top:8px; transition:opacity .2s; font-family:inherit; }
  .btn-primary:hover { opacity:.88; }
  .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
  .result-box { border-radius:12px; padding:18px 20px; margin-bottom:16px; }
  .result-box.success { background:#f0fdf4; border:1px solid #bbf7d0; }
  .result-box.error { background:#fef2f2; border:1px solid #fecaca; }
  .result-box-title { font-size:.82rem; font-weight:700; margin-bottom:6px; }
  .result-box.success .result-box-title { color:#15803d; }
  .result-box.error .result-box-title { color:#b91c1c; }
  .result-box-content { font-size:.88rem; }
  .result-box.success .result-box-content { color:#166534; }
  .result-box.error .result-box-content { color:#991b1b; }
  .back-link { display:block; text-align:center; margin-top:20px; font-size:.83rem; color:var(--bs-blue); text-decoration:none; }
  .back-link:hover { color:var(--bs-navy); }
  @media(max-width:480px) { .card { padding:32px 20px; } }
`;

function FindAccountInner() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("id");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "pw") setActiveTab("pw");
    else setActiveTab("id");
  }, [searchParams]);

  const [findName, setFindName] = useState("");
  const [findEmail, setFindEmail] = useState("");
  const [findIdResult, setFindIdResult] = useState<ResultState | null>(null);
  const [findIdLoading, setFindIdLoading] = useState(false);

  const [pwUsername, setPwUsername] = useState("");
  const [pwEmail, setPwEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwResult, setPwResult] = useState<ResultState | null>(null);
  const [pwPhase, setPwPhase] = useState<PwPhase>("verify");
  const [verifiedUsername, setVerifiedUsername] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function findId(e: FormEvent) {
    e.preventDefault();
    setFindIdResult(null);
    setFindIdLoading(true);
    try {
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: findName.trim(), email: findEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setFindIdResult({ type: "success", title: "아이디 찾기 성공", content: `가입하신 아이디: <strong>${data.username}</strong><br/>가입일: ${data.created_at}` });
      } else {
        setFindIdResult({ type: "error", title: "조회 실패", content: data.error });
      }
    } catch {
      setFindIdResult({ type: "error", title: "오류", content: "서버에 연결할 수 없습니다." });
    } finally {
      setFindIdLoading(false);
    }
  }

  async function verifyForPw(e: FormEvent) {
    e.preventDefault();
    setPwResult(null);
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/auth/find-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: pwUsername.trim(), email: pwEmail.trim(), new_password: "__verify_only__x" }),
      });
      if (res.status === 404) {
        setPwResult({ type: "error", title: "조회 실패", content: "일치하는 회원 정보가 없습니다." });
        return;
      }
      setVerifiedUsername(pwUsername.trim());
      setVerifiedEmail(pwEmail.trim());
      setPwPhase("reset");
      setPwResult({ type: "success", title: "본인 확인 완료", content: "새 비밀번호를 입력하세요." });
    } catch {
      setPwResult({ type: "error", title: "오류", content: "서버에 연결할 수 없습니다." });
    } finally {
      setVerifyLoading(false);
    }
  }

  async function resetPw(e: FormEvent) {
    e.preventDefault();
    if (newPw.length < 8) { setPwResult({ type: "error", title: "오류", content: "비밀번호는 8자 이상이어야 합니다." }); return; }
    if (newPw !== newPw2) { setPwResult({ type: "error", title: "오류", content: "비밀번호가 일치하지 않습니다." }); return; }
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/find-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: verifiedUsername, email: verifiedEmail, new_password: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwResult({ type: "success", title: "변경 완료", content: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요." });
        setPwPhase("done");
      } else {
        setPwResult({ type: "error", title: "오류", content: data.error || "변경에 실패했습니다." });
      }
    } catch {
      setPwResult({ type: "error", title: "오류", content: "서버에 연결할 수 없습니다." });
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="find-wrap">
      <div className="card">
        <h1 className="card-title">계정 찾기</h1>
        <div className="tabs">
          <button className={`tab-btn-find${activeTab === "id" ? " active" : ""}`} onClick={() => setActiveTab("id")}>아이디 찾기</button>
          <button className={`tab-btn-find${activeTab === "pw" ? " active" : ""}`} onClick={() => setActiveTab("pw")}>비밀번호 찾기</button>
        </div>

        {activeTab === "id" && (
          <div>
            {findIdResult && (
              <div className={`result-box ${findIdResult.type}`}>
                <div className="result-box-title">{findIdResult.title}</div>
                <div className="result-box-content" dangerouslySetInnerHTML={{ __html: findIdResult.content }} />
              </div>
            )}
            <form onSubmit={findId}>
              <div className="form-group">
                <label>이름</label>
                <input type="text" placeholder="가입 시 입력한 이름" required value={findName} onChange={(e) => setFindName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input type="email" placeholder="가입 시 입력한 이메일" required value={findEmail} onChange={(e) => setFindEmail(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit" disabled={findIdLoading}>{findIdLoading ? "조회 중..." : "아이디 찾기"}</button>
            </form>
          </div>
        )}

        {activeTab === "pw" && (
          <div>
            {pwResult && (
              <div className={`result-box ${pwResult.type}`}>
                <div className="result-box-title">{pwResult.title}</div>
                <div className="result-box-content">{pwResult.content}</div>
              </div>
            )}
            {pwPhase === "verify" && (
              <form onSubmit={verifyForPw}>
                <div className="form-group">
                  <label>아이디</label>
                  <input type="text" placeholder="가입한 아이디" required value={pwUsername} onChange={(e) => setPwUsername(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>이메일</label>
                  <input type="email" placeholder="가입 시 입력한 이메일" required value={pwEmail} onChange={(e) => setPwEmail(e.target.value)} />
                </div>
                <button className="btn-primary" type="submit" disabled={verifyLoading}>{verifyLoading ? "확인 중..." : "인증 확인"}</button>
              </form>
            )}
            {pwPhase === "reset" && (
              <form onSubmit={resetPw}>
                <div className="form-group">
                  <label>새 비밀번호</label>
                  <input type="password" placeholder="8자 이상" required value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>새 비밀번호 확인</label>
                  <input type="password" placeholder="비밀번호 재입력" required value={newPw2} onChange={(e) => setNewPw2(e.target.value)} />
                </div>
                <button className="btn-primary" type="submit" disabled={resetLoading}>{resetLoading ? "변경 중..." : "비밀번호 변경"}</button>
              </form>
            )}
          </div>
        )}

        <a href="/login" className="back-link">← 로그인으로 돌아가기</a>
      </div>
    </div>
  );
}

export default function FindAccountPage() {
  return (
    <>
      <Navbar />
      <main>
        <style>{styles}</style>
        <Suspense fallback={<div className="find-wrap"><div className="card">로딩 중...</div></div>}>
          <FindAccountInner />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
