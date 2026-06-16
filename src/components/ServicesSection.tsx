"use client";

const services = [
  {
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    label: "개인 심리상담",
    desc: "우울, 불안, 자존감, 대인관계 등 개인의 심리적 어려움을 전문 상담사와 1:1로 탐색하고 해결합니다.",
  },
  {
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    label: "집단 상담",
    desc: "공통된 주제를 가진 소그룹이 함께 탐색하며 성장하는 집단 상담 프로그램을 운영합니다.",
  },
  {
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    label: "심리평가 및 검사",
    desc: "MMPI-2, 로르샤흐 등 표준화된 심리검사를 통해 정확한 현황 파악과 개입 방향을 제시합니다.",
  },
  {
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    label: "심리사회 연구",
    desc: "지역사회 정신건강 관련 연구를 수행하고, 학술 성과를 실천에 접목시킵니다.",
  },
  {
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    label: "기업·기관 상담",
    desc: "직장 내 스트레스, 번아웃, 조직 문화 개선을 위한 기업 및 기관 대상 상담 서비스를 제공합니다.",
  },
  {
    img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
    label: "교육 및 워크숍",
    desc: "정신건강 인식 향상과 심리적 역량 강화를 위한 교육 프로그램과 워크숍을 진행합니다.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" style={{ padding: "96px 5%", background: "var(--bs-bg)" }}>
      <div className="reveal" style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={sectionTagStyle}>Services</div>
        <h2 style={sectionTitleStyle}>제공 서비스</h2>
        <p style={sectionDescStyle}>개인의 필요에 맞는 다양한 심리사회 서비스를 제공합니다</p>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.4rem", maxWidth: 1100, margin: "0 auto",
      }} className="services-grid-responsive">
        {services.map((svc, i) => (
          <div
            key={i}
            className={`reveal delay-${(i % 3) + 1}`}
            style={{
              background: "var(--bs-white)", borderRadius: 16,
              border: "1px solid var(--bs-border)",
              overflow: "hidden", position: "relative",
              transition: "transform .25s, box-shadow .25s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 14px 36px rgba(26,47,94,.11)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "none";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div style={{ height: 175, overflow: "hidden", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={svc.img}
                alt={svc.label}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.88)", transition: "transform .45s ease, filter .3s" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(26,47,94,0) 35%, rgba(26,47,94,.62))" }} />
              <div style={{ position: "absolute", bottom: ".85rem", left: "1.1rem", color: "#fff", fontSize: "1.02rem", fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,.4)", lineHeight: 1.3 }}>
                {svc.label}
              </div>
            </div>
            <div style={{ padding: "1.2rem 1.5rem 1.5rem" }}>
              <p style={{ color: "var(--bs-muted)", fontSize: ".86rem", lineHeight: 1.72, margin: 0 }}>{svc.desc}</p>
              <a href="#services" style={{ display: "inline-block", marginTop: ".8rem", fontSize: ".8rem", fontWeight: 700, color: "var(--bs-accent)", textDecoration: "none" }}>
                자세히 보기 →
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .services-grid-responsive { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 540px) { .services-grid-responsive { grid-template-columns: 1fr !important; } }
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
