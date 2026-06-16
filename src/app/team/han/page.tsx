import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

const profileCSS = `
  .profile-hero{background:linear-gradient(140deg,#071120 0%,#0d1e3f 50%,#132347 100%);padding:100px 5% 60px;position:relative;overflow:hidden;}
  .profile-hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;}
  .hero-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;gap:3.5rem;position:relative;}
  .hero-photo{flex-shrink:0;width:150px;height:190px;border-radius:12px;background:#fff;border:4px solid rgba(78,157,224,.4);overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 50px rgba(0,0,0,.4);}
  .photo-init{font-size:4rem;font-weight:800;color:rgba(255,255,255,.7);}
  .hero-info{flex:1;}
  .hero-back{display:inline-flex;align-items:center;gap:.4rem;color:rgba(255,255,255,.5);font-size:.8rem;text-decoration:none;margin-bottom:1.2rem;transition:color .2s;}
  .hero-back:hover{color:var(--bs-accent);}
  .hero-tag{display:inline-block;background:rgba(78,157,224,.15);border:1px solid rgba(78,157,224,.35);color:var(--bs-accent);font-size:.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:.3rem 1rem;border-radius:100px;margin-bottom:1rem;}
  .hero-name{font-size:clamp(2rem,4vw,3rem);color:#fff;font-weight:800;line-height:1.2;margin-bottom:.5rem;}
  .hero-title-text{font-size:1rem;color:rgba(255,255,255,.72);margin-bottom:1.2rem;line-height:1.6;}
  @media(max-width:680px){.hero-inner{flex-direction:column;text-align:center;}.hero-back{display:none;}}
  .content-wrap{max-width:900px;margin:0 auto;padding:0 5%;}
  .profile-section{padding:56px 0;border-bottom:1px solid var(--bs-border);}
  .profile-section:last-child{border-bottom:none;}
  .section-label{font-size:.72rem;font-weight:700;letter-spacing:2px;color:var(--bs-accent);text-transform:uppercase;margin-bottom:1.3rem;}
  .section-title{font-size:1.35rem;color:var(--bs-navy);font-weight:800;margin-bottom:1.2rem;}
  .bio-text p{color:var(--bs-muted);font-size:.95rem;line-height:1.95;margin-bottom:1rem;}
  .spec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
  .spec-item{background:var(--bs-white);border:1px solid var(--bs-border);border-radius:14px;padding:1.2rem 1.1rem;display:flex;align-items:flex-start;gap:.85rem;transition:box-shadow .2s,border-color .2s;}
  .spec-item:hover{box-shadow:0 6px 20px rgba(26,47,94,.08);border-color:var(--bs-accent);}
  .spec-icon{font-size:1.4rem;flex-shrink:0;margin-top:2px;}
  .spec-name{font-size:.88rem;font-weight:700;color:var(--bs-navy);margin-bottom:.25rem;}
  .spec-desc{font-size:.8rem;color:var(--bs-muted);line-height:1.6;}
  @media(max-width:600px){.spec-grid{grid-template-columns:repeat(2,1fr);}}
  .edu-list{display:flex;flex-direction:column;gap:1.1rem;}
  .edu-item{background:var(--bs-white);border:1px solid var(--bs-border);border-radius:14px;padding:1.2rem 1.5rem;display:flex;align-items:flex-start;gap:1.2rem;}
  .edu-badge{flex-shrink:0;width:44px;height:44px;border-radius:10px;background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue));display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;color:#fff;text-align:center;line-height:1.3;}
  .edu-degree{font-size:.95rem;font-weight:700;color:var(--bs-navy);margin-bottom:.2rem;}
  .edu-school{font-size:.85rem;color:var(--bs-muted);}
  .pub-list{display:flex;flex-direction:column;gap:.85rem;}
  .pub-item{background:var(--bs-white);border:1px solid var(--bs-border);border-radius:12px;padding:1.1rem 1.4rem;transition:box-shadow .2s;}
  .pub-item:hover{box-shadow:0 4px 16px rgba(26,47,94,.08);}
  .pub-meta{display:flex;align-items:center;gap:.5rem;margin-bottom:.45rem;flex-wrap:wrap;}
  .pub-journal{background:var(--bs-light-blue);color:var(--bs-blue);font-size:.7rem;font-weight:700;padding:.2rem .7rem;border-radius:100px;}
  .pub-year{background:#f1f5f9;color:var(--bs-muted);font-size:.7rem;font-weight:600;padding:.2rem .65rem;border-radius:100px;}
  .pub-title{font-size:.9rem;font-weight:700;color:var(--bs-navy);line-height:1.55;margin-bottom:.3rem;}
  .pub-authors{font-size:.82rem;color:var(--bs-muted);}
  .pub-authors strong{color:var(--bs-blue);}
  .approach-text{background:var(--bs-white);border:1px solid var(--bs-border);border-radius:16px;padding:2rem 2.2rem;}
  .approach-text p{color:var(--bs-muted);font-size:.93rem;line-height:1.95;margin-bottom:1rem;}
  .approach-text p:last-child{margin-bottom:0;}
  .approach-tags{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1.3rem;}
  .approach-tag{background:var(--bs-light-blue);color:var(--bs-blue);font-size:.78rem;font-weight:700;padding:.3rem 1rem;border-radius:100px;}
  .cta-band{background:linear-gradient(140deg,#0a1830 0%,#132347 60%,#1c3460 100%);padding:64px 5%;text-align:center;position:relative;overflow:hidden;}
  .cta-band::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;}
  .cta-band h2{font-size:1.7rem;color:#fff;font-weight:800;margin-bottom:.8rem;position:relative;}
  .cta-band p{color:rgba(255,255,255,.65);font-size:.95rem;max-width:480px;margin:0 auto 2rem;position:relative;}
  .cta-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative;}
  .btn-cta-primary{background:var(--bs-accent);color:#fff;padding:.85rem 2.2rem;border-radius:9px;font-size:.95rem;font-weight:700;text-decoration:none;transition:background .2s;}
  .btn-cta-primary:hover{background:#3a8cce;}
  .btn-cta-outline{border:1.5px solid rgba(255,255,255,.3);color:#fff;padding:.85rem 2.2rem;border-radius:9px;font-size:.95rem;font-weight:600;text-decoration:none;transition:border-color .2s;}
  .btn-cta-outline:hover{border-color:rgba(255,255,255,.7);}
`;

export default function HanPage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{profileCSS}</style>

        <div className="profile-hero">
          <div className="hero-inner">
            <div className="hero-photo">
              <div className="photo-init">한</div>
            </div>
            <div className="hero-info">
              <a href="/#team" className="hero-back">← 인력 소개로 돌아가기</a>
              <div className="hero-tag">Counselor · Researcher</div>
              <div className="hero-name">한지현 상담사</div>
              <div className="hero-title-text">
                별생각 심리사회 연구소 심리상담사<br />
                심리상담학 석사 (건양대학교)
              </div>
            </div>
          </div>
        </div>

        <div className="content-wrap">
          <section className="profile-section">
            <div className="section-label">About</div>
            <div className="section-title">소개</div>
            <div className="bio-text">
              <p>한지현 상담사는 위기청소년 지원과 대인관계 문제를 전문으로 하는 심리상담사입니다. 건양대학교 심리상담치료학과에서 석사 학위를 취득하였으며, 교정심리학 분야 연구에도 적극적으로 참여하고 있습니다.</p>
              <p>가정 및 학교 밖 위기청소년의 현상학적 연구, 교정시설 성범죄자 심리치료 연구 등 다양한 연구과제에 공동연구자로 참여하였으며, 이를 통해 고위험 집단에 대한 깊은 이해와 임상적 통찰을 축적하였습니다.</p>
              <p>집단 상담 프로그램 운영에 특화된 전문성을 갖추고 있으며, 특히 또래 관계 형성, 정서 표현, 자기 이해를 주제로 한 청소년 집단 프로그램을 설계하고 진행해왔습니다. 내담자 한 사람 한 사람의 삶의 맥락을 존중하며 강점 기반의 접근으로 변화를 함께 만들어가는 것을 상담의 핵심 가치로 삼고 있습니다.</p>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Specialization</div>
            <div className="section-title">전문 분야</div>
            <div className="spec-grid">
              {[
                { icon:"🆘", name:"위기청소년 상담", desc:"가정·학교 밖 청소년, 비행청소년, 고위험 환경 청소년 대상 위기 개입 및 지속 지원" },
                { icon:"🤝", name:"대인관계 상담", desc:"관계 갈등, 사회적 불안, 경계 설정 어려움 등 대인관계 문제에 대한 심층 탐색 및 개입" },
                { icon:"👥", name:"집단 상담", desc:"자존감, 정서 표현, 의사소통 주제의 소그룹 치료 프로그램 설계 및 운영" },
                { icon:"⚖️", name:"교정심리 지원", desc:"교정 장면 심리치료 연구 참여, 성범죄 재범 예방 프로그램 보조 운영" },
                { icon:"🔍", name:"충동·성격 문제", desc:"경계선 성격 경향성, 충동 조절 어려움, 강박적 행동 패턴에 대한 CBT·DBT 기반 개입" },
                { icon:"🏘️", name:"지역사회 기반 지원", desc:"청소년복지시설 연계, 지역사회 자원 활용 통합 지원 방안 연구 및 실무 적용" },
              ].map((s) => (
                <div key={s.name} className="spec-item">
                  <div className="spec-icon">{s.icon}</div>
                  <div><div className="spec-name">{s.name}</div><div className="spec-desc">{s.desc}</div></div>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Education</div>
            <div className="section-title">학력</div>
            <div className="edu-list">
              <div className="edu-item"><div className="edu-badge">석사</div><div><div className="edu-degree">심리상담학 석사 (M.A.)</div><div className="edu-school">건양대학교 심리상담치료학과</div></div></div>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Selected Publications</div>
            <div className="section-title">주요 연구 참여</div>
            <div className="pub-list">
              {[
                { journal:"교정담론", year:"2025", title:"성범죄자의 일탈적 성 선호에 대한 행동치료의 효과성 검증", authors:"최재광, <strong>한지현</strong>, 곽승철, 차유진, 김설환, 송원영. 교정담론, 19(3), 1-39." },
                { journal:"한국심리학회지: 건강", year:"2023", title:"경계선 성격 경향성과 강박적 성행동과의 관계: 지각된 스트레스와 부정 긴급성의 매개효과", authors:"최재광, <strong>한지현</strong>, 송원영. 한국심리학회지: 건강, 28(6), 1213-1229." },
                { journal:"발달지원연구", year:"2023", title:"도농복합지역 가정 및 학교 밖 청소년의 위기 경험에 대한 현상학적 연구", authors:"최재광, <strong>한지현</strong>, 이유경, 송원영. 발달지원연구, 12(1), 21-50." },
                { journal:"발달지원연구", year:"2022", title:"위기청소년과 청소년복지시설 실무자 요구조사를 통한 지역사회기반 지원방안", authors:"<strong>한지현</strong>, 최재광, 이유경, 송원영. 발달지원연구, 11(2), 75-94." },
              ].map((p, i) => (
                <div key={i} className="pub-item">
                  <div className="pub-meta"><span className="pub-journal">{p.journal}</span><span className="pub-year">{p.year}</span></div>
                  <div className="pub-title">{p.title}</div>
                  <div className="pub-authors" dangerouslySetInnerHTML={{ __html: p.authors }} />
                </div>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Therapeutic Approach</div>
            <div className="section-title">상담 철학 및 접근</div>
            <div className="approach-text">
              <p>한지현 상담사는 내담자의 현재 어려움 뒤에 숨겨진 삶의 맥락과 강점에 주목합니다. 문제 중심이 아닌 강점 중심의 시각으로 내담자가 이미 가지고 있는 자원을 발견하고 확장하는 것을 상담의 핵심 과정으로 여깁니다.</p>
              <p>인지행동치료(CBT)를 기반으로 하되, 변증법적 행동치료(DBT)의 정서조절 기술을 활용하여 충동적 행동이나 강렬한 감정으로 어려움을 겪는 내담자에게 실질적인 대처 전략을 제공합니다. 집단 상담 환경에서는 또래 상호작용을 통해 사회적 기술과 공감 능력을 자연스럽게 발달시킬 수 있도록 돕습니다.</p>
              <div className="approach-tags">
                {["CBT","DBT","강점 기반","집단 상담","청소년 특화"].map((t) => <span key={t} className="approach-tag">{t}</span>)}
              </div>
            </div>
          </section>
        </div>

        <div className="cta-band">
          <h2>한지현 상담사와 함께하고 싶다면</h2>
          <p>대인관계, 충동 조절, 청소년 문제로 힘드신 분께 문을 열어드립니다.</p>
          <div className="cta-btns">
            <a href="/#contact" className="btn-cta-primary">상담 신청하기</a>
            <a href="/#team" className="btn-cta-outline">다른 상담사 보기</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
