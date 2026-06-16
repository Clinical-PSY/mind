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

export default function LimPage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{profileCSS}</style>

        <div className="profile-hero">
          <div className="hero-inner">
            <div className="hero-photo">
              <div className="photo-init">임</div>
            </div>
            <div className="hero-info">
              <a href="/#team" className="hero-back">← 인력 소개로 돌아가기</a>
              <div className="hero-tag">Counselor · Researcher</div>
              <div className="hero-name">임소희 상담사</div>
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
              <p>임소희 상담사는 청소년 및 성인의 우울·불안·스트레스 문제를 전문으로 하는 심리상담사입니다. 건양대학교 심리상담치료학과에서 석사 학위를 취득하였으며, 최재광 박사 연구팀과 함께 불확실성 인내력, 감정노동, 경험회피 등 심리적 기제에 관한 다수의 연구에 참여하였습니다.</p>
              <p>임상 현장에서는 인지행동치료(CBT)와 수용전념치료(ACT)를 바탕으로 내담자의 사고 패턴과 정서 조절 방식을 함께 탐색하며, 개인 맞춤형 상담을 제공합니다. 특히 청소년의 자살예방 및 학교 부적응 문제, 그리고 서비스직 종사자의 소진 예방에 깊은 관심을 가지고 있습니다.</p>
              <p>따뜻하고 비판단적인 상담 환경을 조성하여 내담자가 자신의 내면을 안전하게 탐색하고 삶의 방향을 스스로 찾아갈 수 있도록 돕는 것을 상담 철학으로 삼고 있습니다.</p>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Specialization</div>
            <div className="section-title">전문 분야</div>
            <div className="spec-grid">
              {[
                { icon:"🌧️", name:"우울·불안 상담", desc:"기분 장애, 범불안, 사회불안 등 정서적 어려움에 대한 CBT 기반 개입" },
                { icon:"🧑‍🎓", name:"청소년 정신건강", desc:"청소년 자살예방, 학교 부적응, 코로나 이후 정서 문제 개입 및 위기 상담" },
                { icon:"🔋", name:"소진·스트레스 관리", desc:"직무 소진, 감정노동 관련 심리적 어려움 완화 및 회복탄력성 강화" },
                { icon:"🧭", name:"불확실성 인내력", desc:"미래에 대한 불안과 불확실성을 수용하고 적응적으로 대처하는 능력 훈련" },
                { icon:"🌱", name:"자기성장 상담", desc:"자기이해, 자존감 향상, 가치 명료화를 통한 심리적 성장 촉진" },
                { icon:"💬", name:"심리교육", desc:"학교·기관 대상 정신건강 예방 교육, 자살예방 게이트키퍼 훈련" },
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
                { journal:"상담학연구", year:"2025", title:"콜센터 상담원의 감정노동과 경험회피 군집유형에 따른 정신건강의 차이", authors:"신은미, <strong>최재광</strong>, 송원영. 상담학연구, 26(1), 179-200. (공동연구)" },
                { journal:"한국심리학회지: 건강", year:"2023", title:"콜센터 상담원의 불확실성에 대한 인내력 부족이 정신건강 문제에 미치는 영향", authors:"<strong>최재광</strong>, 임소희, 송원영. 한국심리학회지: 건강, 28(2), 329-351." },
                { journal:"청소년상담연구", year:"2023", title:"고등학생의 불확실성에 대한 인내력 부족이 정신건강 문제에 미치는 영향", authors:"<strong>최재광</strong>, 임소희, 송원영. 청소년상담연구, 31(2), 47-69." },
                { journal:"청소년상담연구", year:"2022", title:"청소년의 코로나19 스트레스가 자살사고에 미치는 영향: 부적응적 인지적정서조절전략과 정신건강의 매개효과", authors:"<strong>최재광</strong>, 임소희, 송원영. 청소년상담연구, 30(2), 239-264." },
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
              <p>임소희 상담사는 내담자가 자신의 감정과 생각에 충분히 머물 수 있는 안전한 공간을 만드는 것을 상담의 출발점으로 삼습니다. 섣불리 해결책을 제시하기보다 내담자의 경험을 진심으로 이해하고 공감하는 과정을 중시합니다.</p>
              <p>인지행동치료(CBT)를 기반으로 내담자의 역기능적 사고와 행동 패턴을 함께 탐색하며, 수용전념치료(ACT)의 심리적 유연성 개념을 통해 내담자가 불편한 감정을 회피하지 않고 삶의 가치 방향으로 나아갈 수 있도록 지원합니다. 특히 불확실성에 대한 인내력 훈련을 통해 만성적 불안과 걱정으로 힘들어하는 분들에게 실질적인 도움을 드리고자 합니다.</p>
              <div className="approach-tags">
                {["CBT","ACT","공감 중심","불확실성 수용","청소년 특화"].map((t) => <span key={t} className="approach-tag">{t}</span>)}
              </div>
            </div>
          </section>
        </div>

        <div className="cta-band">
          <h2>임소희 상담사와 함께하고 싶다면</h2>
          <p>우울·불안·스트레스로 힘드신 분, 편안한 마음으로 문을 두드려 주세요.</p>
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
