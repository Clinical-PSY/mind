const partners = ["건양대학교","법무부","한국연구재단","논산계룡교육지청","대전교도소","부여군보건소","한국심리학회"];

export default function PartnersSection() {
  return (
    <section id="partners" style={{ background: "var(--bs-bg)", padding: "52px 5% 60px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <p className="reveal" style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--bs-muted)", marginBottom: "1.8rem" }}>
          협력 기관
        </p>
        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: ".9rem" }}>
          {partners.map((p) => (
            <span key={p} style={{
              padding: ".62rem 1.4rem",
              background: "var(--bs-white)", border: "1px solid var(--bs-border)",
              borderRadius: 50, fontSize: ".83rem", fontWeight: 600, color: "var(--bs-navy)",
              transition: "border-color .2s, box-shadow .2s, color .2s",
              cursor: "default",
            }}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
