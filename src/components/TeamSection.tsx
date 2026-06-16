export default function TeamSection() {
  return (
    <section id="team" style={{ padding: "96px 5%", background: "var(--bs-white)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>Our Team</div>
        <h2 style={sectionTitleStyle}>인력 소개</h2>
        <p style={sectionDescStyle}>전문성과 따뜻함을 갖춘 팀이 함께합니다</p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* CEO */}
        <div className="reveal" style={{ display: "flex", justifyContent: "center", marginBottom: 0 }}>
          <MemberCard
            isLead
            initial="최"
            role="대표 · 임상심리학 박사"
            name="최재광 박사"
            desc={<>연구소 설립자 · 건양대학교 겸임교수<br /><strong style={{ color: "rgba(255,255,255,.85)", fontSize: ".8rem" }}>전문영역</strong><br />우울 및 불안 · 성 · 중독<br />학교심리학 · 교정심리학</>}
            href="#team"
          />
        </div>

        {/* Connector */}
        <div className="reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 2, height: 44, background: "var(--bs-border)" }} />
          <div style={{ position: "relative", width: 432, height: 0 }} className="hline-wrapper">
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", height: 2, background: "var(--bs-border)",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: 44, background: "var(--bs-border)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 2, height: 44, background: "var(--bs-border)" }} />
            </div>
          </div>
        </div>

        {/* Staff */}
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: 44, flexWrap: "wrap" }}>
          <div className="reveal delay-2">
            <MemberCard
              initial="임"
              role="연구원 · 심리상담사"
              name="임소희"
              desc={<>건양대학교 심리상담치료학과 석사과정<br /><strong style={{ fontSize: ".78rem", color: "var(--bs-navy)" }}>전문영역</strong><br />우울·불안 · 청소년 정신건강<br />감정노동 · 스트레스 관리</>}
              href="#team"
            />
          </div>
          <div className="reveal delay-3">
            <MemberCard
              initial="한"
              role="연구원 · 심리상담사"
              name="한지현"
              desc={<>건양대학교 심리상담치료학과 석사과정<br /><strong style={{ fontSize: ".78rem", color: "var(--bs-navy)" }}>전문영역</strong><br />위기청소년 · 교정심리<br />외상 및 애착 · 집단상담</>}
              href="#team"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hline-wrapper { display: none !important; }
        }
      `}</style>
    </section>
  );
}

function MemberCard({
  isLead = false, initial, role, name, desc, href,
}: {
  isLead?: boolean;
  initial: string;
  role: string;
  name: string;
  desc: React.ReactNode;
  href: string;
}) {
  return (
    <div
      style={{
        background: isLead
          ? "linear-gradient(140deg, var(--bs-navy) 0%, #1e4080 100%)"
          : "var(--bs-bg)",
        border: isLead ? "none" : "1px solid var(--bs-border)",
        borderRadius: 16,
        padding: "2rem 2.2rem",
        textAlign: "center",
        width: isLead ? 330 : 360,
        boxShadow: isLead ? "0 16px 40px rgba(26,47,94,.22)" : "none",
        cursor: "pointer",
        transition: "transform .25s, box-shadow .25s",
      }}
    >
      <div style={{
        width: 120, height: 150, borderRadius: 10,
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 1.1rem",
        border: isLead ? "2px solid rgba(255,255,255,.4)" : "2px solid var(--bs-border)",
        overflow: "hidden",
      }}>
        <span style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", fontWeight: 800,
          color: isLead ? "#fff" : "var(--bs-accent)",
          background: isLead ? "var(--bs-navy)" : undefined,
        }}>{initial}</span>
      </div>
      <div style={{
        fontSize: ".72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
        color: isLead ? "rgba(255,255,255,.65)" : "var(--bs-accent)", marginBottom: ".4rem",
      }}>{role}</div>
      <div style={{
        fontSize: "1.1rem", fontWeight: 700,
        color: isLead ? "#fff" : "var(--bs-navy)", marginBottom: ".6rem",
      }}>{name}</div>
      <div style={{
        fontSize: ".82rem", lineHeight: 1.65,
        color: isLead ? "rgba(255,255,255,.72)" : "var(--bs-muted)",
      }}>{desc}</div>
      <a href={href} style={{
        display: "inline-block", marginTop: "1rem",
        fontSize: ".78rem", fontWeight: 700,
        color: isLead ? "rgba(255,255,255,.75)" : "var(--bs-accent)",
        textDecoration: "none", letterSpacing: ".5px",
      }}>프로필 보기 →</a>
    </div>
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
