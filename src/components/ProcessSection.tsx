export default function ProcessSection() {
  const steps = [
    { icon: "📋", title: "상담 신청", desc: "전화·이메일·카카오톡으로 간편하게 접수" },
    { icon: "🤝", title: "초기 면담", desc: "방문 목적과 어려움에 대해 편안하게 대화" },
    { icon: "📊", title: "심리 평가", desc: "필요 시 표준화 검사로 객관적 현황 파악" },
    { icon: "💬", title: "상담 진행", desc: "목표 기반의 맞춤 상담 회기 진행" },
    { icon: "✅", title: "종결·사후관리", desc: "변화 점검 및 자립적 유지 전략 수립" },
  ];

  return (
    <section id="process" style={{ padding: "96px 5%", background: "var(--bs-bg)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>How It Works</div>
        <h2 style={sectionTitleStyle}>상담 진행 과정</h2>
        <p style={sectionDescStyle}>처음 방문하시는 분들을 위한 상담 절차를 안내해 드립니다</p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        maxWidth: 1100, margin: "0 auto",
        position: "relative", gap: ".5rem",
      }} className="process-grid-responsive">
        <div style={{
          content: "''", position: "absolute",
          height: 2,
          background: "linear-gradient(90deg, var(--bs-blue), var(--bs-accent))",
          top: 37, left: "10%", right: "10%", zIndex: 0,
        }} className="process-line" />

        {steps.map((step, i) => (
          <div key={i} className={`reveal delay-${i + 1}`} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", padding: "0 .6rem", position: "relative", zIndex: 1,
          }}>
            <div style={{
              width: 76, height: 76,
              background: "linear-gradient(135deg, var(--bs-navy), var(--bs-blue))",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", marginBottom: "1.2rem",
              boxShadow: "0 8px 24px rgba(26,47,94,.2)",
              border: "3px solid var(--bs-bg)",
            }}>
              {step.icon}
            </div>
            <div style={{ fontSize: ".88rem", fontWeight: 700, color: "var(--bs-navy)", marginBottom: ".35rem" }}>{step.title}</div>
            <div style={{ fontSize: ".75rem", color: "var(--bs-muted)", lineHeight: 1.62 }}>{step.desc}</div>
          </div>
        ))}
      </div>

      <div className="reveal" style={{
        maxWidth: 1100, margin: "3rem auto 0",
        background: "linear-gradient(90deg, var(--bs-navy) 0%, var(--bs-blue) 100%)",
        borderRadius: 14, padding: "1.4rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".9rem" }}>
          <span style={{ fontSize: "1.7rem" }}>💻</span>
          <div>
            <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginBottom: ".18rem" }}>비대면 상담 가능</h4>
            <p style={{ color: "rgba(255,255,255,.62)", fontSize: ".83rem", margin: 0 }}>화상 상담(Zoom 등) · 전화 상담 모두 운영 중입니다</p>
          </div>
        </div>
        <a href="#contact" style={{
          background: "var(--bs-accent)", color: "#fff", fontWeight: 700, fontSize: ".88rem",
          padding: ".65rem 1.6rem", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap",
        }}>비대면 상담 신청 →</a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .process-grid-responsive { grid-template-columns: 1fr !important; }
          .process-line { display: none !important; }
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
