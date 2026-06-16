"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const items = sectionRef.current?.querySelectorAll(".reveal");
    items?.forEach((el) => el.classList.add("visible"));
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        background: `
          linear-gradient(to bottom, rgba(5,12,28,0.72) 0%, rgba(10,22,50,0.60) 50%, rgba(15,30,61,0.80) 100%),
          url('https://images.unsplash.com/photo-1765825365130-52e276bca060?auto=format&fit=crop&w=2560&q=95') center/cover no-repeat`,
        display: "flex",
        alignItems: "center",
        padding: "100px 5% 70px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(78,157,224,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(78,157,224,.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* orbs */}
      {[
        { width: 500, height: 500, bg: "radial-gradient(circle, rgba(78,157,224,.10), transparent 70%)", top: -100, right: -80, duration: "18s" },
        { width: 380, height: 380, bg: "radial-gradient(circle, rgba(37,99,168,.12), transparent 70%)", bottom: -60, left: -60, duration: "24s" },
        { width: 260, height: 260, bg: "radial-gradient(circle, rgba(78,157,224,.08), transparent 70%)", top: "40%", left: "45%", duration: "14s" },
      ].map((orb, i) => (
        <div key={i} style={{
          position: "absolute",
          width: orb.width, height: orb.height,
          background: orb.bg,
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: `float linear ${orb.duration} infinite`,
          top: (orb as { top?: number | string }).top,
          right: (orb as { right?: number }).right,
          bottom: (orb as { bottom?: number }).bottom,
          left: (orb as { left?: number | string }).left,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 740 }}>
        <div className="reveal" style={{
          display: "inline-flex", alignItems: "center", gap: ".5rem",
          background: "rgba(78,157,224,.15)", border: "1px solid rgba(78,157,224,.35)",
          color: "var(--bs-accent)", fontSize: ".78rem", fontWeight: 700,
          letterSpacing: "1.5px", textTransform: "uppercase",
          padding: ".38rem 1.1rem", borderRadius: 100, marginBottom: "1.6rem",
        }}>
          ✦ 별생각 심리사회 연구소
        </div>

        <h1 className="reveal delay-1" style={{
          fontSize: "clamp(2.3rem, 5.5vw, 3.8rem)", color: "#fff",
          fontWeight: 800, lineHeight: 1.22, letterSpacing: "-.5px", marginBottom: "1.4rem",
        }}>
          마음을 탐구하고<br />
          <em style={{ fontStyle: "normal", color: "var(--bs-accent)" }}>삶을 변화</em>시킵니다
        </h1>

        <p className="reveal delay-2" style={{
          fontSize: "1.08rem", color: "rgba(255,255,255,.72)",
          maxWidth: 560, marginBottom: "2.6rem", lineHeight: 1.8,
        }}>
          심리상담, 심리검사, 연구 기반의 전문적인 심리사회 서비스를 제공합니다.<br />
          당신의 이야기를 함께 듣겠습니다.
        </p>

        <div className="reveal delay-3" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a href="#contact" style={{
            background: "var(--bs-accent)", color: "#fff",
            padding: ".88rem 2.1rem", borderRadius: 8, fontSize: ".97rem", fontWeight: 700,
            textDecoration: "none", boxShadow: "0 4px 18px rgba(78,157,224,.4)",
            transition: "background .2s, transform .15s",
          }}>상담 신청하기</a>
          <a href="#about" style={{
            background: "transparent", color: "#fff",
            padding: ".88rem 2.1rem", borderRadius: 8, fontSize: ".97rem", fontWeight: 600,
            textDecoration: "none", border: "1.5px solid rgba(255,255,255,.32)",
          }}>연구소 소개 보기</a>
          <a href="#testimonials" style={{
            background: "transparent", color: "var(--bs-accent)",
            padding: ".88rem 2.1rem", borderRadius: 8, fontSize: ".97rem", fontWeight: 600,
            textDecoration: "none", border: "1.5px solid rgba(78,157,224,.55)",
          }}>심리검사</a>
        </div>

        <div className="reveal delay-4" style={{
          display: "flex", gap: "3rem", marginTop: "4rem",
          paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,.1)", flexWrap: "wrap",
        }}>
          {[
            { num: "500+", label: "상담 사례" },
            { num: "3+", label: "전문 인력" },
            { num: "10+", label: "연구·포트폴리오" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--bs-accent)", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: ".83rem", color: "rgba(255,255,255,.55)", marginTop: ".3rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
