"use client";

const reviews = [
  {
    text: "상담 전에는 매일 아침이 두려웠는데, 꾸준한 상담을 통해 제 감정을 이해하고 조절하는 방법을 배웠습니다. 일상이 훨씬 가벼워졌어요.",
    author: "A씨", sub: "30대 직장인",
  },
  {
    text: "처음에는 낯설었지만, 선생님께서 판단 없이 들어주셔서 마음의 짐을 내려놓을 수 있었습니다. 대학원 생활 중 가장 잘한 선택이었습니다.",
    author: "B씨", sub: "20대 대학원생",
  },
  {
    text: "불안과 강박으로 오랫동안 고생했는데, 체계적인 심리평가와 맞춤 상담으로 실질적인 변화를 경험했습니다. 따뜻하고 전문적인 접근이 인상적이었어요.",
    author: "C씨", sub: "20대 대학생",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ padding: "96px 5%", background: "var(--bs-white)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>Reviews</div>
        <h2 style={sectionTitleStyle}>내담자 이야기</h2>
        <p style={sectionDescStyle}>실제 상담을 경험하신 분들의 소중한 후기입니다</p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.5rem", maxWidth: 1100, margin: "0 auto",
      }} className="testi-grid-responsive">
        {reviews.map((r, i) => (
          <div key={i} className={`reveal delay-${i + 1}`} style={{
            background: "var(--bs-bg)", border: "1px solid var(--bs-border)",
            borderRadius: 20, padding: "2rem 1.8rem 1.6rem",
            transition: "transform .25s, box-shadow .25s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(26,47,94,.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "none";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "3.6rem", lineHeight: .85, color: "var(--bs-accent)", fontFamily: "Georgia, serif", fontWeight: 900, opacity: .3, marginBottom: ".3rem" }}>&ldquo;</div>
            <div style={{ color: "#f59e0b", letterSpacing: 2, fontSize: ".9rem", marginBottom: ".9rem" }}>★★★★★</div>
            <p style={{ fontSize: ".9rem", color: "var(--bs-text)", lineHeight: 1.85, marginBottom: "1.4rem" }}>{r.text}</p>
            <div style={{ display: "flex", alignItems: "center", gap: ".8rem", paddingTop: "1rem", borderTop: "1px solid var(--bs-border)" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--bs-navy), var(--bs-blue))",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".82rem", fontWeight: 700, flexShrink: 0,
              }}>{r.author[0]}</div>
              <div>
                <strong style={{ display: "block", fontSize: ".84rem", fontWeight: 700, color: "var(--bs-navy)" }}>{r.author}</strong>
                <span style={{ fontSize: ".76rem", color: "var(--bs-muted)" }}>{r.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) { .testi-grid-responsive { grid-template-columns: 1fr !important; } }
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
