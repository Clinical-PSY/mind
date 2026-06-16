"use client";

const portfolios = [
  { img: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=600&q=80", icon: "📄", cat: "학술 논문", title: "KCI 등재 논문 25편 게재", desc: "한국심리학회지·발달지원연구·청소년상담연구 등 국내외 저널 게재 (2018–2026)" },
  { img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80", icon: "🔬", cat: "정부 연구과제", title: "법무부·한국연구재단 등 9개 과제 참여", desc: "성폭력사범 심리치료, 청소년 위기지원, PBS 모형개발 등 정부 의뢰 연구과제 수행" },
  { img: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80", icon: "🏛️", cat: "기관 협력", title: "교육청·교도소·보건소 등 협력", desc: "논산계룡교육지청, 대전교도소, 부여군보건소 등 지역 공공기관 협력 프로그램 운영" },
  { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80", icon: "🎓", cat: "교육 프로그램", title: "자살예방·대인관계·정서관리 교육", desc: "학교·기관 대상 찾아가는 정신건강 교육 및 게이트키퍼 교육 운영" },
  { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80", icon: "💼", cat: "기업·기관 상담", title: "콜센터·기업 대상 심리지원", desc: "콜센터 상담원 감정노동 관리, 임직원 번아웃 예방 EAP 프로그램 운영" },
  { img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80", icon: "🌐", cat: "학술 발표", title: "국내외 학술대회 6회 발표", desc: "세계인지행동치료학회(WCBCT) 포스터 발표 포함, 한국아동·청소년패널 학술대회 등" },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" style={{ padding: "96px 5%", background: "var(--bs-white)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>Portfolio</div>
        <h2 style={sectionTitleStyle}>연구 및 포트폴리오</h2>
        <p style={sectionDescStyle}>KCI 등재 논문 25편, 정부 연구과제 9건, 학술대회 발표 6회</p>
        <a href="#portfolio" style={{
          display: "inline-block", marginTop: "1.1rem",
          background: "var(--bs-navy)", color: "#fff",
          padding: ".65rem 1.8rem", borderRadius: 8,
          fontSize: ".88rem", fontWeight: 700, textDecoration: "none",
        }}>전체 연구실적 보기 →</a>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.4rem", maxWidth: 1100, margin: "0 auto",
      }} className="portfolio-grid-responsive">
        {portfolios.map((p, i) => (
          <div key={i} className={`reveal delay-${(i % 3) + 1}`} style={{
            borderRadius: 14, overflow: "hidden",
            border: "1px solid var(--bs-border)", background: "var(--bs-white)",
            transition: "transform .25s, box-shadow .25s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(26,47,94,.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "none";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div style={{ height: 155, position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.82)", transition: "transform .4s ease, filter .3s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(15,30,61,.55))" }} />
              <div style={{
                position: "absolute", top: ".8rem", right: ".8rem",
                width: 36, height: 36, borderRadius: 8,
                background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>{p.icon}</div>
            </div>
            <div style={{ padding: "1.2rem 1.4rem" }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--bs-accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: ".4rem" }}>{p.cat}</div>
              <h3 style={{ fontSize: ".96rem", color: "var(--bs-navy)", fontWeight: 700, marginBottom: ".4rem", lineHeight: 1.4 }}>{p.title}</h3>
              <p style={{ fontSize: ".82rem", color: "var(--bs-muted)", margin: 0 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .portfolio-grid-responsive { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 540px) { .portfolio-grid-responsive { grid-template-columns: 1fr !important; } }
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
