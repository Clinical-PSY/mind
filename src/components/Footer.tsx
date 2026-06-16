export default function Footer() {
  return (
    <footer style={{ background: "#0f1e3d", color: "rgba(255,255,255,.65)", padding: "3.5rem 5% 2rem", fontSize: ".87rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2.5rem" }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: 700, marginBottom: ".6rem" }}>
            별생각 <span style={{ color: "var(--bs-accent)" }}>심리사회 연구소</span>
          </h2>
          <p style={{ lineHeight: 1.9, fontSize: ".82rem", margin: 0 }}>
            대표: 최재광 (임상심리학 박사)<br />
            주소: 충청남도 논산시 대학로 121 건양대학교 산학협력관 218호<br />
            Tel: 010-9936-2420 &nbsp;|&nbsp; Email: clinicalp_h@naver.com
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
          {[
            { href: "#about", label: "연구소 소개" },
            { href: "#services", label: "서비스" },
            { href: "#team", label: "인력 소개" },
            { href: "#testimonials", label: "심리검사" },
            { href: "#portfolio", label: "포트폴리오" },
            { href: "#contact", label: "상담 접수" },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{ color: "rgba(255,255,255,.55)", textDecoration: "none", fontSize: ".84rem" }}>{label}</a>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "2rem auto 0", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,.08)", fontSize: ".78rem", color: "rgba(255,255,255,.35)" }}>
        © 2026 별생각 심리사회 연구소. All rights reserved.
      </div>
    </footer>
  );
}
