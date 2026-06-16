"use client";

import { useState } from "react";

const faqs = [
  { q: "상담 비용이 어떻게 되나요?", a: "상담 유형과 회기 수에 따라 다릅니다. 정확한 비용은 전화(010-9936-2420) 또는 이메일로 문의해 주시면 상세히 안내드리겠습니다." },
  { q: "상담 내용은 비밀이 보장되나요?", a: "상담에서 나누는 모든 내용은 철저히 비밀이 보장됩니다. 단, 내담자 본인 또는 타인에게 명백한 위험이 있는 경우에는 법적·윤리적 기준에 따라 예외적으로 처리될 수 있습니다." },
  { q: "첫 상담에서는 어떤 이야기를 하나요?", a: "첫 상담(초기 면담)은 방문 목적, 현재의 어려움, 이전 상담 경험, 상담 목표 등에 대해 편안하게 이야기를 나눕니다. 평가나 진단보다 라포 형성에 초점을 둡니다." },
  { q: "비대면(온라인) 상담도 가능한가요?", a: "네, 가능합니다. 화상 상담(Zoom 등)과 전화 상담 모두 운영하고 있으며, 예약 시 원하시는 방식을 선택하실 수 있습니다." },
  { q: "예약은 어떻게 하나요?", a: "전화(010-9936-2420), 이메일(clinicalp_h@naver.com), 또는 카카오톡 채널을 통해 예약하실 수 있습니다. 상담 유형과 희망 날짜를 말씀해 주시면 빠르게 안내해 드립니다." },
  { q: "어떤 심리검사를 받을 수 있나요?", a: "MMPI-2, BDI(우울), BAI(불안), STAI(상태-특성 불안), 로르샤흐 등 표준화된 심리검사를 제공합니다. 상담사와 상의 후 필요한 검사를 선택할 수 있습니다." },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" style={{ padding: "96px 5%", background: "var(--bs-white)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>FAQ</div>
        <h2 style={sectionTitleStyle}>자주 묻는 질문</h2>
        <p style={sectionDescStyle}>궁금한 점이 있으시면 아래에서 확인해 보세요</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {faqs.map((faq, i) => (
          <div key={i} className={`reveal delay-${Math.min(i + 1, 5)}`} style={{
            background: "var(--bs-bg)",
            border: `1.5px solid ${openIndex === i ? "var(--bs-accent)" : "var(--bs-border)"}`,
            borderRadius: 14, overflow: "hidden",
            transition: "border-color .2s, box-shadow .2s",
            boxShadow: openIndex === i ? "0 4px 18px rgba(78,157,224,.1)" : "none",
          }}>
            <button
              onClick={() => toggle(i)}
              style={{
                width: "100%", background: "none", border: "none",
                padding: "1.1rem 1.4rem",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                cursor: "pointer", textAlign: "left",
                fontFamily: "inherit", fontSize: ".94rem", fontWeight: 700,
                color: "var(--bs-navy)",
              }}
            >
              {faq.q}
              <span style={{
                width: 26, height: 26, borderRadius: "50%",
                background: openIndex === i ? "var(--bs-accent)" : "var(--bs-light-blue)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".85rem", fontWeight: 900,
                color: openIndex === i ? "#fff" : "var(--bs-blue)",
                flexShrink: 0,
                transform: openIndex === i ? "rotate(45deg)" : "none",
                transition: "transform .25s, background .2s, color .2s",
              }}>+</span>
            </button>
            <div style={{
              maxHeight: openIndex === i ? 220 : 0,
              overflow: "hidden",
              transition: "max-height .32s cubic-bezier(.4,0,.2,1), padding .32s",
              fontSize: ".9rem", color: "var(--bs-muted)", lineHeight: 1.82,
              padding: openIndex === i ? "0 1.4rem 1.3rem" : "0 1.4rem",
            }}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>
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
