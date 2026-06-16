"use client";

import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", type: "", message: "" });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("✅ 상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다!");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name, phone: form.phone, email: form.email,
          service_type: form.type, message: form.message,
        }),
      });
      if (res.ok) {
        setToastMsg("✅ 상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다!");
        setForm({ name: "", phone: "", email: "", type: "", message: "" });
      } else {
        setToastMsg("⚠️ 접수 중 오류가 발생했습니다. 전화로 문의해 주세요.");
      }
    } catch {
      setToastMsg("⚠️ 서버에 연결할 수 없습니다. 전화로 문의해 주세요.");
    } finally {
      setSubmitting(false);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 4200);
    }
  };

  return (
    <section id="contact" style={{ padding: "96px 5%", background: "var(--bs-bg)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>Contact</div>
        <h2 style={sectionTitleStyle}>상담 접수 및 문의</h2>
        <p style={sectionDescStyle}>편한 방법으로 연락 주세요. 빠르게 안내해 드리겠습니다</p>
      </div>

      <div style={{
        maxWidth: 1000, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "3rem",
      }} className="contact-wrapper-responsive">

        {/* Contact Info */}
        <div className="reveal reveal-left">
          <h3 style={{ fontSize: "1.4rem", color: "var(--bs-navy)", fontWeight: 800, marginBottom: "1rem" }}>연락처 안내</h3>
          <p style={{ color: "var(--bs-muted)", fontSize: ".93rem", marginBottom: "2rem" }}>전화, 이메일, 카카오톡 채널 모두 운영 중입니다.</p>

          {[
            { icon: "📞", label: "전화 상담", value: "010-9936-2420" },
            { icon: "✉️", label: "이메일", value: "clinicalp_h@naver.com" },
            { icon: "📍", label: "오시는 길", value: "충청남도 논산시 대학로 121\n건양대학교 산학협력관 218호" },
            { icon: "🕐", label: "운영 시간", value: "월–금 09:00–18:00\n토 10:00–14:00 (예약제)" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: ".9rem 0", borderBottom: "1px solid var(--bs-border)" }}>
              <div style={{ width: 42, height: 42, background: "var(--bs-light-blue)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{icon}</div>
              <div>
                <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "var(--bs-blue)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: ".25rem" }}>{label}</label>
                <span style={{ fontSize: ".92rem", color: "var(--bs-text)", whiteSpace: "pre-line" }}>{value}</span>
              </div>
            </div>
          ))}

          <a href="https://pf.kakao.com" target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: ".65rem",
            background: "#FEE500", color: "#3A1D1D", fontWeight: 700, fontSize: ".97rem",
            padding: ".9rem 1.5rem", borderRadius: 10, textDecoration: "none",
            marginTop: "1.6rem", boxShadow: "0 4px 14px rgba(254,229,0,.35)",
            transition: "filter .2s",
          }}>
            카카오톡 채널로 문의하기
          </a>
        </div>

        {/* Contact Form */}
        <div className="reveal reveal-right" style={{
          background: "var(--bs-white)", borderRadius: 16, padding: "2.2rem",
          border: "1px solid var(--bs-border)", boxShadow: "0 4px 20px rgba(26,47,94,.06)",
        }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--bs-navy)", fontWeight: 700, marginBottom: "1.6rem" }}>온라인 상담 접수</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.15rem" }}>
              <div>
                <label style={labelStyle}>이름 <span style={{ color: "#e55" }}>*</span></label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} type="text" placeholder="홍길동" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>연락처 <span style={{ color: "#e55" }}>*</span></label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" placeholder="010-0000-0000" required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: "1.15rem" }}>
              <label style={labelStyle}>이메일</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="example@email.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: "1.15rem" }}>
              <label style={labelStyle}>상담 유형 <span style={{ color: "#e55" }}>*</span></label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required style={inputStyle}>
                <option value="">선택해 주세요</option>
                <option>개인 심리상담</option>
                <option>심리검사 (BDI/BAI 등)</option>
                <option>집단 상담</option>
                <option>기업·기관 상담</option>
                <option>교육·워크숍</option>
                <option>기타 문의</option>
              </select>
            </div>
            <div style={{ marginBottom: "1.15rem" }}>
              <label style={labelStyle}>상담 신청 내용</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="상담 받고 싶은 내용을 간략히 적어 주세요 (선택 사항)"
                style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
              />
            </div>
            <button type="submit" disabled={submitting} style={{
              width: "100%", background: "var(--bs-navy)", color: "#fff",
              border: "none", padding: ".92rem", borderRadius: 9,
              fontSize: ".97rem", fontWeight: 700, cursor: "pointer",
              marginTop: ".4rem", fontFamily: "inherit", letterSpacing: ".2px",
              transition: "background .2s",
            }}>{submitting ? "접수 중..." : "상담 신청 보내기"}</button>
          </form>
        </div>
      </div>

      <div className={`toast${toastVisible ? " show" : ""}`}>{toastMsg}</div>

      <style>{`
        @media (max-width: 900px) { .contact-wrapper-responsive { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

const sectionTagStyle: React.CSSProperties = {
  display: "inline-block",
  background: "var(--bs-light-blue)", color: "var(--bs-blue)",
  fontSize: ".75rem", fontWeight: 700, letterSpacing: "1.5px",
  textTransform: "uppercase", padding: ".3rem 1rem",
  borderRadius: 100, marginBottom: ".9rem",
};
const sectionTitleStyle: React.CSSProperties = {
  fontSize: "clamp(1.75rem, 3.2vw, 2.6rem)",
  color: "var(--bs-navy)", fontWeight: 800, lineHeight: 1.28, marginBottom: ".7rem",
};
const sectionDescStyle: React.CSSProperties = {
  color: "var(--bs-muted)", fontSize: ".97rem", maxWidth: 500, margin: "0 auto",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: ".83rem", fontWeight: 600,
  color: "var(--bs-text)", marginBottom: ".45rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: ".72rem 1rem",
  border: "1.5px solid var(--bs-border)", borderRadius: 9,
  fontSize: ".91rem", color: "var(--bs-text)",
  background: "var(--bs-bg)", outline: "none",
  fontFamily: "inherit",
};
