export default function AboutSection() {
  return (
    <section id="about" style={{ padding: "96px 5%", background: "var(--bs-white)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>About Us</div>
        <h2 style={sectionTitleStyle}>연구소 소개 및 비전</h2>
        <p style={sectionDescStyle}>증거 기반의 접근으로 개인과 사회의 심리적 건강을 지원합니다</p>
        <a href="#about" style={{
          display: "inline-block", marginTop: "1.1rem",
          background: "var(--bs-navy)", color: "#fff",
          padding: ".65rem 1.8rem", borderRadius: 8,
          fontSize: ".88rem", fontWeight: 700, textDecoration: "none",
        }}>상세 소개 · 비전 보기 →</a>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "4.5rem", alignItems: "center",
        maxWidth: 1100, margin: "0 auto",
      }} className="about-grid-responsive">

        {/* Vision Card */}
        <div className="reveal reveal-left" style={{
          background: "linear-gradient(140deg, var(--bs-navy) 0%, #1e4080 100%)",
          borderRadius: 20, padding: "3rem 2.5rem", color: "#fff",
          position: "relative", overflow: "hidden",
          boxShadow: "0 20px 50px rgba(26,47,94,.22)",
        }}>
          <h3 style={{ fontSize: "1.4rem", marginBottom: "1.6rem", lineHeight: 1.45, fontWeight: 700 }}>
            우리의 비전과 가치
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "과학적 근거 기반의 심리상담 서비스 제공",
              "내담자 중심의 개별화된 접근 방식",
              "지역사회 정신건강 증진에 기여",
              "지속적인 연구·훈련을 통한 전문성 강화",
              "윤리적이고 신뢰할 수 있는 상담 환경 조성",
            ].map((item, i) => (
              <li key={i} style={{
                padding: ".78rem 0",
                borderBottom: i < 4 ? "1px solid rgba(255,255,255,.1)" : "none",
                display: "flex", alignItems: "flex-start", gap: ".8rem",
                fontSize: ".93rem", color: "rgba(255,255,255,.88)",
              }}>
                <span style={{ color: "var(--bs-accent)", flexShrink: 0, marginTop: 3, fontWeight: 700 }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* About Text */}
        <div className="reveal reveal-right">
          <h3 style={{ fontSize: "1.55rem", color: "var(--bs-navy)", fontWeight: 800, marginBottom: "1.1rem", lineHeight: 1.4 }}>
            별생각 심리사회 연구소란?
          </h3>
          <p style={{ color: "var(--bs-muted)", marginBottom: "1rem", fontSize: ".96rem" }}>
            별생각 심리사회 연구소는 개인의 심리적 어려움을 전문적으로 돕고,
            사회적 맥락 속에서 삶의 질을 향상시키기 위해 설립된 전문 심리상담 및 연구 기관입니다.
          </p>
          <p style={{ color: "var(--bs-muted)", marginBottom: "1rem", fontSize: ".96rem" }}>
            임상 심리, 상담 심리, 사회심리 분야의 전문가로 구성된 팀이
            우울, 불안, 대인관계, 자아성찰 등 다양한 심리적 문제를
            체계적이고 따뜻하게 다룹니다.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.6rem" }}>
            {[
              { title: "전문성", desc: "학문적 훈련과 임상 경험 기반" },
              { title: "신뢰성", desc: "엄격한 윤리 기준 준수" },
              { title: "개별성", desc: "내담자 맞춤형 접근" },
              { title: "연구 기반", desc: "증거 기반 개입 방법 적용" },
            ].map(({ title, desc }, i) => (
              <div key={i} className={`reveal delay-${i + 1}`} style={{
                background: "var(--bs-light-blue)", borderRadius: 12, padding: "1.1rem 1.3rem",
              }}>
                <h4 style={{ color: "var(--bs-navy)", fontSize: ".88rem", fontWeight: 700, marginBottom: ".3rem" }}>{title}</h4>
                <p style={{ color: "var(--bs-muted)", fontSize: ".8rem", margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid-responsive { grid-template-columns: 1fr !important; }
        }
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
