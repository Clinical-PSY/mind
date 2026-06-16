export default function LocationSection() {
  return (
    <section id="location" style={{
      padding: "96px 5%",
      background: "linear-gradient(to bottom, #0d1b3e 0%, #0f2252 60%, #0a1a38 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(78,157,224,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(78,157,224,.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px", pointerEvents: "none",
      }} />

      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-block",
          background: "rgba(78,157,224,.18)", color: "var(--bs-accent)",
          border: "1px solid rgba(78,157,224,.3)",
          fontSize: ".75rem", fontWeight: 700, letterSpacing: "1.5px",
          textTransform: "uppercase", padding: ".3rem 1rem",
          borderRadius: 100, marginBottom: ".9rem",
        }}>Location</div>
        <h2 style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.6rem)", color: "#fff", fontWeight: 800, lineHeight: 1.28, marginBottom: ".7rem" }}>오시는 길</h2>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".97rem", maxWidth: 500, margin: "0 auto" }}>건양대학교 산학협력관에 위치하고 있습니다</p>
      </div>

      <div style={{
        maxWidth: 1060, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1.1fr",
        gap: "2.8rem", alignItems: "center",
        position: "relative", zIndex: 1,
      }} className="location-wrapper-responsive">

        {/* Address Card */}
        <div className="reveal reveal-left" style={{
          background: "rgba(255,255,255,.05)", border: "1px solid rgba(78,157,224,.25)",
          borderRadius: 24, padding: "2.8rem 2.4rem",
          backdropFilter: "blur(14px)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".7rem", marginBottom: "1.6rem" }}>
            <div style={{
              width: 12, height: 12, background: "var(--bs-accent)", borderRadius: "50%",
              animation: "locPulse 2s ease-out infinite",
            }} />
            <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--bs-accent)" }}>우리 위치</span>
          </div>
          <div style={{ fontSize: "1.55rem", fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: ".5rem" }}>
            건양대학교<br /><span style={{ color: "var(--bs-accent)" }}>산학협력관</span> 218호
          </div>
          <div style={{ fontSize: ".88rem", color: "rgba(255,255,255,.5)", marginBottom: ".35rem" }}>건양대학교 · 충청남도 논산</div>
          <div style={{
            fontSize: ".95rem", color: "rgba(255,255,255,.75)", lineHeight: 1.7,
            padding: "1rem 1.2rem", background: "rgba(255,255,255,.06)",
            borderLeft: "3px solid var(--bs-accent)", borderRadius: "0 10px 10px 0",
            margin: "1.3rem 0 1.8rem",
          }}>
            충청남도 논산시 대학로 121<br />건양대학교 산학협력관 218호
          </div>
          <a
            href="https://map.naver.com/v5/search/%EC%B6%A9%EC%B2%AD%EB%82%A8%EB%8F%84%20%EB%85%BC%EC%82%B0%EC%8B%9C%20%EB%8C%80%ED%95%99%EB%A1%9C%20121%20%EA%B1%B4%EC%96%91%EB%8C%80%ED%95%99%EA%B5%90%20%EC%82%B0%ED%95%99%ED%98%91%EB%A0%A5%EA%B4%80"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: ".6rem",
              background: "#03C75A", color: "#fff", fontWeight: 700,
              fontSize: ".92rem", padding: ".82rem 1.8rem", borderRadius: 50,
              textDecoration: "none", boxShadow: "0 6px 20px rgba(3,199,90,.35)",
              letterSpacing: ".2px",
            }}
          >
            📍 네이버 지도에서 보기
          </a>
        </div>

        {/* Info Grid */}
        <div className="reveal reveal-right" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { icon: "📍", label: "주소", value: "충청남도 논산시\n대학로 121" },
            { icon: "📞", label: "전화 상담", value: "010-9936-2420" },
            { icon: "🕐", label: "운영 시간", value: "월–금 09:00–18:00\n토 10:00–14:00" },
            { icon: "🚗", label: "주차 안내", value: "교내 주차 가능\n(방문 전 문의)" },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 16, padding: "1.4rem 1.3rem",
              transition: "background .2s, border-color .2s, transform .2s",
            }}>
              <div style={{
                width: 40, height: 40, background: "rgba(78,157,224,.18)", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.15rem", marginBottom: ".9rem",
              }}>{icon}</div>
              <label style={{ display: "block", fontSize: ".68rem", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--bs-accent)", marginBottom: ".35rem" }}>{label}</label>
              <span style={{ fontSize: ".88rem", color: "rgba(255,255,255,.82)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .location-wrapper-responsive { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
