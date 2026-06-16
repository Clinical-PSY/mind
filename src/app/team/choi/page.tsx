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
  .stats-bar{background:var(--bs-navy);padding:1.4rem 5%;}
  .stats-inner{max-width:900px;margin:0 auto;display:flex;gap:3rem;flex-wrap:wrap;}
  .stat-item{text-align:center;}
  .stat-num{font-size:1.7rem;font-weight:800;color:var(--bs-accent);line-height:1;}
  .stat-label{font-size:.75rem;color:rgba(255,255,255,.55);margin-top:.2rem;}
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
  .pub-more-link{display:inline-block;margin-top:1.3rem;font-size:.85rem;font-weight:700;color:var(--bs-accent);text-decoration:none;}
  .pub-more-link:hover{text-decoration:underline;}
  .approach-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;}
  .approach-item{background:var(--bs-white);border:1px solid var(--bs-border);border-radius:14px;padding:1.4rem 1.5rem;}
  .approach-theory{font-size:.75rem;font-weight:700;color:var(--bs-accent);letter-spacing:1px;text-transform:uppercase;margin-bottom:.5rem;}
  .approach-name{font-size:1rem;font-weight:700;color:var(--bs-navy);margin-bottom:.5rem;}
  .approach-desc{font-size:.86rem;color:var(--bs-muted);line-height:1.75;}
  @media(max-width:560px){.approach-grid{grid-template-columns:1fr;}}
  .cta-band{background:linear-gradient(140deg,#0a1830 0%,#132347 60%,#1c3460 100%);padding:64px 5%;text-align:center;position:relative;overflow:hidden;}
  .cta-band::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;}
  .cta-band h2{font-size:1.7rem;color:#fff;font-weight:800;margin-bottom:.8rem;position:relative;}
  .cta-band p{color:rgba(255,255,255,.65);font-size:.95rem;max-width:480px;margin:0 auto 2rem;position:relative;}
  .cta-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative;}
  .btn-cta-primary{background:var(--bs-accent);color:#fff;padding:.85rem 2.2rem;border-radius:9px;font-size:.95rem;font-weight:700;text-decoration:none;transition:background .2s;}
  .btn-cta-primary:hover{background:#3a8cce;}
  .btn-cta-outline{border:1.5px solid rgba(255,255,255,.3);color:#fff;padding:.85rem 2.2rem;border-radius:9px;font-size:.95rem;font-weight:600;text-decoration:none;transition:border-color .2s;}
  .btn-cta-outline:hover{border-color:rgba(255,255,255,.7);}
  .career-badge-current{background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue));color:#fff;font-size:.7rem;font-weight:800;padding:.28rem .85rem;border-radius:100px;letter-spacing:.5px;}
  .career-badge-prev{background:linear-gradient(140deg,#4a5568,#718096);color:#fff;font-size:.7rem;font-weight:800;padding:.28rem .85rem;border-radius:100px;letter-spacing:.5px;}
  .career-chip-current{background:var(--bs-light-blue);color:var(--bs-navy);font-size:.82rem;font-weight:700;padding:.4rem 1rem;border-radius:8px;border:1px solid rgba(37,99,168,.15);}
  .career-chip-prev{background:#f1f5f9;color:#4a5568;font-size:.82rem;font-weight:700;padding:.4rem 1rem;border-radius:8px;border:1px solid #e2e8f0;}
`;

export default function ChoiPage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{profileCSS}</style>

        <div className="profile-hero">
          <div className="hero-inner">
            <div className="hero-photo">
              <div className="photo-init">최</div>
            </div>
            <div className="hero-info">
              <a href="/#team" className="hero-back">← 인력 소개로 돌아가기</a>
              <div className="hero-tag">Director · Researcher</div>
              <div className="hero-name">최재광 박사</div>
              <div className="hero-title-text">
                별생각 심리사회 연구소 대표<br />
                건양대학교 심리상담치료학과 겸임교수
              </div>
            </div>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stats-inner">
            <div className="stat-item"><div className="stat-num">25+</div><div className="stat-label">KCI 등재 논문</div></div>
            <div className="stat-item"><div className="stat-num">9</div><div className="stat-label">정부 연구과제</div></div>
            <div className="stat-item"><div className="stat-num">6</div><div className="stat-label">국내외 학술대회 발표</div></div>
            <div className="stat-item"><div className="stat-num">10+</div><div className="stat-label">임상 경력 (년)</div></div>
          </div>
        </div>

        <div className="content-wrap">
          <section className="profile-section">
            <div className="section-label">About</div>
            <div className="section-title">소개</div>
            <div className="bio-text">
              <p>최재광 박사는 별생각 심리사회 연구소의 설립자이자 대표로, 임상심리학 분야에서 10여 년간 연구와 임상 실천을 병행해왔습니다. 건양대학교 심리상담치료학과에서 석사·박사 학위를 취득하였으며, 학문적 엄밀성과 따뜻한 인간 중심 가치를 통합하는 치료 철학을 바탕으로 다양한 내담자를 만나고 있습니다.</p>
              <p>성범죄·중독·외상 후 스트레스 등 고위험 집단의 심리치료 전문가로서, 교정시설 내 성범죄자 행동치료 프로그램 개발 및 효과성 검증 연구를 주도하였습니다. 법무부, 한국연구재단, 충청남도 도의회 등 다수의 정부 기관과의 연구과제를 통해 정책과 임상 현장을 잇는 실증적 기여를 지속하고 있습니다.</p>
              <p>KCI 등재 학술지에 25편 이상의 논문을 발표하였으며, 세계인지행동치료학회(WCBCT)를 포함한 국내외 학술대회에서 연구 성과를 발표하였습니다. 척도 타당화, 네트워크 분석, 머신러닝 등 최신 연구 방법론을 적용하여 심리학 연구의 질적 수준을 높이는 데 기여하고 있습니다.</p>
              <p>현재 별생각 심리사회 연구소를 이끌며 개인 심리상담, 집단 프로그램 운영, 기관 자문, 교육 활동을 통해 지역사회 정신건강 증진에 힘쓰고 있습니다.</p>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Specialization</div>
            <div className="section-title">전문 분야</div>
            <div className="spec-grid">
              {[
                { icon:"🔒", name:"성범죄·교정심리", desc:"교정시설 내 성범죄자 행동치료, 재범 위험 평가 및 개입, 교정 프로그램 개발" },
                { icon:"⚡", name:"중독·충동 조절", desc:"강박적 성행동, 스마트폰 과의존, 충동 조절 문제에 대한 인지행동치료 접근" },
                { icon:"🌊", name:"외상 및 위기 개입", desc:"외상 후 스트레스, 간접외상, 재난 심리 지원 및 위기청소년 개입" },
                { icon:"📊", name:"척도 개발·타당화", desc:"한국판 심리 척도 타당화, 요인분석, 수렴·변별 타당도 검증 연구" },
                { icon:"🧑‍🤝‍🧑", name:"청소년 위기 개입", desc:"가정·학교 밖 위기청소년, 자살예방, 비행청소년 대상 프로그램 연구 및 운영" },
                { icon:"💼", name:"감정노동자 지원", desc:"콜센터·서비스 직종 종사자의 소진 예방, 감정노동 관리 프로그램 개발" },
                { icon:"💛", name:"우울·불안·정서 문제", desc:"우울장애, 불안장애, 정서 조절 곤란에 대한 인지행동치료 및 수용 기반 개입" },
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
              <div className="edu-item"><div className="edu-badge">박사</div><div><div className="edu-degree">심리상담학 박사 (Ph.D.)</div><div className="edu-school">건양대학교 심리상담치료학과 · 지도교수: 송원영 교수</div></div></div>
              <div className="edu-item"><div className="edu-badge">석사</div><div><div className="edu-degree">심리상담학 석사 (M.A.)</div><div className="edu-school">건양대학교 심리상담치료학과</div></div></div>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Career</div>
            <div className="section-title">경력</div>
            <div style={{display:"flex",flexDirection:"column",gap:"1.4rem"}}>
              <div style={{background:"var(--bs-white)",border:"1px solid var(--bs-border)",borderRadius:"14px",padding:"1.3rem 1.6rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:".7rem",marginBottom:"1rem"}}>
                  <span className="career-badge-current">현직</span>
                  <span style={{fontSize:".8rem",color:"var(--bs-muted)"}}>Current Positions</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:".55rem"}}>
                  {["별생각 심리사회 연구소 대표","건양대 심리상담치료학과 겸임교수","대전교도소 논산지소 징벌위원회 위원","논산교육지원청 교육위원","대전준법센터 심리치료 위원"].map((t) => (
                    <span key={t} className="career-chip-current">{t}</span>
                  ))}
                </div>
              </div>
              <div style={{background:"var(--bs-white)",border:"1px solid var(--bs-border)",borderRadius:"14px",padding:"1.3rem 1.6rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:".7rem",marginBottom:"1rem"}}>
                  <span className="career-badge-prev">전직</span>
                  <span style={{fontSize:".8rem",color:"var(--bs-muted)"}}>Previous Positions</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:".55rem"}}>
                  {["대구교육대학교 강의교수","건양대학교 마음행복연구소 연구원"].map((t) => (
                    <span key={t} className="career-chip-prev">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-label">Selected Publications</div>
            <div className="section-title">주요 연구 업적</div>
            <div className="pub-list">
              {[
                { journal:"교정담론", year:"2025", title:"성범죄자의 일탈적 성 선호에 대한 행동치료의 효과성 검증", authors:"<strong>최재광</strong>, 한지현, 곽승철, 차유진, 김설환, 송원영. 교정담론, 19(3), 1-39." },
                { journal:"한국심리학회지: 건강", year:"2024", title:"불안정 애착유형과 SNS 정서전염이 간접외상에 미치는 영향: 10.29 이태원 참사를 중심으로", authors:"<strong>최재광</strong>, 김해솔, 신은미, 송원영. 한국심리학회지: 건강, 29(5), 765-785." },
                { journal:"한국심리학회지: 건강", year:"2023", title:"경계선 성격 경향성과 강박적 성행동과의 관계: 지각된 스트레스와 부정 긴급성의 매개효과", authors:"<strong>최재광</strong>, 한지현, 송원영. 한국심리학회지: 건강, 28(6), 1213-1229." },
                { journal:"한국심리학회지: 일반", year:"2021", title:"직장에서의 정당한 성평등에 대한 믿음 척도의 개발 및 타당화", authors:"<strong>최재광</strong>, 유제근, 송원영. 한국심리학회지: 일반, 40(2), 155-185." },
                { journal:"발달지원연구", year:"2021", title:"대학생을 위한 인지행동치료 기반 우울관리 프로그램의 개발과 효과성 검증", authors:"<strong>최재광</strong>, 송원영. 발달지원연구, 10(3), 91-111." },
              ].map((p, i) => (
                <div key={i} className="pub-item">
                  <div className="pub-meta"><span className="pub-journal">{p.journal}</span><span className="pub-year">{p.year}</span></div>
                  <div className="pub-title">{p.title}</div>
                  <div className="pub-authors" dangerouslySetInnerHTML={{ __html: p.authors }} />
                </div>
              ))}
            </div>
            <a href="/portfolio" className="pub-more-link">전체 연구 업적 보기 (25편+) →</a>
          </section>

          <section className="profile-section">
            <div className="section-label">Therapeutic Approach</div>
            <div className="section-title">치료적 접근</div>
            <div className="approach-grid">
              {[
                { theory:"CBT", name:"인지행동치료", desc:"역기능적 사고와 행동 패턴을 인식하고 수정하는 구조화된 접근. 우울, 불안, 충동 조절 문제에 광범위하게 적용." },
                { theory:"ACT", name:"수용전념치료", desc:"심리적 유연성을 높이고 가치 기반의 행동을 강화하는 제3세대 인지행동치료. 경험회피 및 만성 스트레스 개입에 효과적." },
                { theory:"BT", name:"행동치료", desc:"조건 형성 원리에 기반한 행동 수정 기법. 교정 장면에서 일탈적 행동 패턴 수정 및 사회 재통합 지원에 활용." },
                { theory:"EBP", name:"근거기반 실천", desc:"최신 연구 결과, 임상 전문성, 내담자 가치를 통합하는 과학적 임상 실천. 치료 효과를 지속적으로 모니터링하고 개선." },
              ].map((a) => (
                <div key={a.theory} className="approach-item">
                  <div className="approach-theory">{a.theory}</div>
                  <div className="approach-name">{a.name}</div>
                  <div className="approach-desc">{a.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="cta-band">
          <h2>최재광 박사와 상담을 원하신다면</h2>
          <p>전문적인 심리평가와 치료적 접근으로 당신의 여정을 함께 하겠습니다.</p>
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
