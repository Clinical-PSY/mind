"use client";

import { useState, FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type StepKey = 1 | 2 | 3 | "done";

interface FormData {
  username: string; password: string; password2: string;
  name: string; gender: string; birthdate: string; phone: string; email: string;
  agreeTerms: boolean; agreePrivacy: boolean;
}

export default function SignupPage() {
  const [step, setStep] = useState<StepKey>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    username: "", password: "", password2: "",
    name: "", gender: "", birthdate: "", phone: "", email: "",
    agreeTerms: false, agreePrivacy: false,
  });

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const usernameOk = /^[a-zA-Z0-9]{4,20}$/.test(form.username);
  const passwordOk = form.password.length >= 8;
  const passwordMatch = form.password === form.password2 && form.password2.length > 0;

  function validateStep1(): boolean {
    if (!form.username || !form.password || !form.password2) { setError("모든 항목을 입력해주세요."); return false; }
    if (!usernameOk) { setError("아이디는 영문+숫자 4~20자입니다."); return false; }
    if (!passwordOk) { setError("비밀번호는 8자 이상이어야 합니다."); return false; }
    if (!passwordMatch) { setError("비밀번호가 일치하지 않습니다."); return false; }
    return true;
  }

  function validateStep2(): boolean {
    if (!form.name || !form.gender || !form.birthdate || !form.phone || !form.email) { setError("모든 항목을 입력해주세요."); return false; }
    if (!form.email.includes("@")) { setError("올바른 이메일 형식을 입력하세요."); return false; }
    return true;
  }

  function goStep(n: StepKey) {
    setError("");
    if (n === 2 && !validateStep1()) return;
    if (n === 3 && !validateStep2()) return;
    setStep(n);
  }

  async function doRegister(e: FormEvent) {
    e.preventDefault();
    if (!form.agreeTerms || !form.agreePrivacy) { setError("필수 약관에 모두 동의해주세요."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username, password: form.password,
          name: form.name, gender: form.gender, birthdate: form.birthdate,
          phone: form.phone, email: form.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "가입에 실패했습니다."); return; }
      setStep("done");
    } catch {
      setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  const stepStatus = (s: 1 | 2 | 3): string => {
    if (step === "done" || (typeof step === "number" && s < step)) return "done";
    if (step === s) return "active";
    return "";
  };

  return (
    <>
      <Navbar />
      <main>
        <style>{`
          .signup-wrap { padding:100px 20px 60px; display:flex; justify-content:center; min-height:100vh; }
          .card { background:var(--bs-white); border-radius:20px; box-shadow:0 4px 40px rgba(26,47,94,.10); padding:48px 44px; width:100%; max-width:520px; height:fit-content; }
          .card-title { font-size:1.4rem; font-weight:800; color:var(--bs-navy); margin-bottom:4px; }
          .card-sub { font-size:.83rem; color:var(--bs-muted); margin-bottom:32px; }
          .steps { display:flex; margin-bottom:32px; }
          .step { flex:1; text-align:center; padding:10px 0; font-size:.78rem; font-weight:600; color:var(--bs-muted); border-bottom:2px solid var(--bs-border); transition:all .3s; }
          .step.active { color:var(--bs-blue); border-bottom-color:var(--bs-blue); }
          .step.done { color:var(--bs-accent); border-bottom-color:var(--bs-accent); }
          .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
          .form-group { margin-bottom:16px; }
          .form-group label { display:block; font-size:.82rem; font-weight:600; color:#374151; margin-bottom:6px; }
          .form-group input, .form-group select { width:100%; padding:11px 14px; border:1.5px solid var(--bs-border); border-radius:10px; font-size:.9rem; font-family:inherit; color:var(--bs-text); background:var(--bs-bg); outline:none; transition:border-color .2s; }
          .form-group input:focus, .form-group select:focus { border-color:var(--bs-accent); background:#fff; }
          .field-note { font-size:.74rem; color:var(--bs-muted); margin-top:4px; }
          .field-valid { font-size:.74rem; color:#15803d; margin-top:4px; }
          .field-error { font-size:.74rem; color:#b91c1c; margin-top:4px; }
          .btn-primary { width:100%; padding:13px; border:none; border-radius:12px; background:linear-gradient(135deg,#1a2f5e,#2563a8); color:#fff; font-size:.97rem; font-weight:700; cursor:pointer; margin-top:8px; transition:opacity .2s; font-family:inherit; }
          .btn-primary:hover { opacity:.88; }
          .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
          .btn-ghost { width:100%; padding:12px; border:1.5px solid var(--bs-border); border-radius:12px; background:none; color:var(--bs-muted); font-size:.92rem; font-weight:600; cursor:pointer; margin-top:8px; transition:border-color .2s,color .2s; font-family:inherit; }
          .btn-ghost:hover { border-color:var(--bs-navy); color:var(--bs-navy); }
          .btn-row { display:flex; gap:10px; margin-top:8px; }
          .btn-row .btn-ghost, .btn-row .btn-primary { margin-top:0; }
          .error-msg { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; border-radius:8px; padding:10px 14px; font-size:.83rem; margin-bottom:14px; }
          .terms-box { border:1.5px solid var(--bs-border); border-radius:10px; padding:14px; height:130px; overflow-y:auto; font-size:.78rem; color:var(--bs-muted); line-height:1.7; margin-bottom:10px; }
          .check-row { display:flex; align-items:center; gap:8px; font-size:.84rem; margin-bottom:10px; cursor:pointer; }
          .check-row input[type=checkbox] { width:16px; height:16px; accent-color:var(--bs-blue); cursor:pointer; }
          .success-screen { text-align:center; padding:24px 0; }
          .success-icon { font-size:3rem; margin-bottom:16px; }
          .success-screen h2 { font-size:1.3rem; font-weight:800; color:var(--bs-navy); margin-bottom:8px; }
          .success-screen p { color:var(--bs-muted); font-size:.88rem; line-height:1.7; margin-bottom:24px; }
          .req { color:#b91c1c; }
          @media(max-width:540px) { .card { padding:32px 20px; } .form-row { grid-template-columns:1fr; } }
        `}</style>

        <div className="signup-wrap">
          <div className="card">
            <h1 className="card-title">회원가입</h1>
            <p className="card-sub">별생각 심리사회 연구소 회원이 되세요</p>

            {step !== "done" && (
              <div className="steps">
                <div className={`step ${stepStatus(1)}`}>① 기본 정보</div>
                <div className={`step ${stepStatus(2)}`}>② 개인 정보</div>
                <div className={`step ${stepStatus(3)}`}>③ 약관 동의</div>
              </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            {step === 1 && (
              <div>
                <div className="form-group">
                  <label>아이디 <span className="req">*</span></label>
                  <input type="text" placeholder="영문+숫자 4~20자" autoComplete="username" value={form.username} onChange={(e) => set("username", e.target.value)} />
                  <div className="field-note">영문자와 숫자 조합 4~20자</div>
                  {form.username.length > 0 && (usernameOk ? <div className="field-valid">✓ 사용 가능한 아이디입니다</div> : <div className="field-error">영문+숫자 4~20자로 입력하세요</div>)}
                </div>
                <div className="form-group">
                  <label>비밀번호 <span className="req">*</span></label>
                  <input type="password" placeholder="8자 이상" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} />
                  <div className="field-note">8자 이상, 영문+숫자 권장</div>
                  {form.password.length > 0 && !passwordOk && <div className="field-error">8자 이상이어야 합니다</div>}
                </div>
                <div className="form-group">
                  <label>비밀번호 확인 <span className="req">*</span></label>
                  <input type="password" placeholder="비밀번호 재입력" autoComplete="new-password" value={form.password2} onChange={(e) => set("password2", e.target.value)} />
                  {form.password2.length > 0 && (passwordMatch ? <div className="field-valid">✓ 비밀번호가 일치합니다</div> : <div className="field-error">비밀번호가 일치하지 않습니다</div>)}
                </div>
                <button className="btn-primary" onClick={() => goStep(2)}>다음 단계</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label>이름 <span className="req">*</span></label>
                    <input type="text" placeholder="실명을 입력하세요" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>성별 <span className="req">*</span></label>
                    <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                      <option value="">선택하세요</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>생년월일 <span className="req">*</span></label>
                  <input type="date" value={form.birthdate} onChange={(e) => set("birthdate", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>연락처 <span className="req">*</span></label>
                  <input type="tel" placeholder="010-0000-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>이메일 <span className="req">*</span></label>
                  <input type="email" placeholder="example@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="btn-row">
                  <button className="btn-ghost" onClick={() => { setError(""); setStep(1); }}>이전</button>
                  <button className="btn-primary" onClick={() => goStep(3)}>다음 단계</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={doRegister}>
                <div className="form-group">
                  <label>이용약관 <span className="req">*</span></label>
                  <div className="terms-box">
                    <strong>별생각 심리사회 연구소 이용약관</strong><br /><br />
                    제1조 (목적) 본 약관은 별생각 심리사회 연구소(이하 &quot;연구소&quot;)가 제공하는 웹사이트 및 온라인 서비스 이용에 관한 조건을 규정합니다.<br /><br />
                    제2조 (서비스 이용) 연구소는 심리상담, 심리검사, AI 지원 서비스를 제공합니다. 제공되는 AI 서비스는 전문 상담을 대체하지 않습니다.<br /><br />
                    제3조 (회원 의무) 회원은 본인의 정보를 정확하게 제공해야 하며, 타인의 정보를 도용하거나 부정한 방법으로 서비스를 이용할 수 없습니다.<br /><br />
                    제4조 (개인정보 보호) 연구소는 개인정보보호법을 준수하며, 수집된 정보는 서비스 제공 목적으로만 활용됩니다.<br /><br />
                    제5조 (서비스 변경 및 중단) 연구소는 운영상 또는 기술상의 이유로 서비스를 변경하거나 일시 중단할 수 있습니다.
                  </div>
                  <label className="check-row">
                    <input type="checkbox" checked={form.agreeTerms} onChange={(e) => set("agreeTerms", e.target.checked)} />
                    이용약관에 동의합니다 (필수)
                  </label>
                </div>
                <div className="form-group">
                  <label>개인정보 수집·이용 동의 <span className="req">*</span></label>
                  <div className="terms-box">
                    <strong>개인정보 수집 및 이용 안내</strong><br /><br />
                    수집 항목: 아이디, 비밀번호(암호화), 이름, 생년월일, 성별, 이메일, 연락처<br /><br />
                    수집 목적: 회원 관리, 서비스 제공, 상담 예약 및 안내<br /><br />
                    보유 기간: 회원 탈퇴 시까지 (관련 법령에 따라 일부 정보는 법정 기간 보관)<br /><br />
                    귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있으나, 미동의 시 서비스 이용이 제한됩니다.
                  </div>
                  <label className="check-row">
                    <input type="checkbox" checked={form.agreePrivacy} onChange={(e) => set("agreePrivacy", e.target.checked)} />
                    개인정보 수집·이용에 동의합니다 (필수)
                  </label>
                </div>
                <div className="btn-row">
                  <button type="button" className="btn-ghost" onClick={() => { setError(""); setStep(2); }}>이전</button>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? "처리 중..." : "가입 완료"}</button>
                </div>
              </form>
            )}

            {step === "done" && (
              <div className="success-screen">
                <div className="success-icon">🎉</div>
                <h2>회원가입이 완료되었습니다!</h2>
                <p>별생각 심리사회 연구소 회원이 되신 것을 환영합니다.<br />로그인 후 다양한 서비스를 이용하세요.</p>
                <a href="/login" className="btn-primary" style={{display:"block",textDecoration:"none",textAlign:"center"}}>로그인 하기</a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
