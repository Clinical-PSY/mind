import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

export default function ServicesPage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{`
          .page-hero { background:linear-gradient(140deg,#0a1830 0%,#132347 45%,#1c3460 100%); padding:110px 5% 70px; text-align:center; position:relative; overflow:hidden; }
          .page-hero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
          .page-hero-tag { display:inline-block; background:rgba(78,157,224,.15); border:1px solid rgba(78,157,224,.35); color:var(--bs-accent); font-size:.78rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:.38rem 1.1rem; border-radius:100px; margin-bottom:1.2rem; }
          .page-hero h1 { font-size:clamp(1.9rem,4vw,2.9rem); color:#fff; font-weight:800; line-height:1.3; margin-bottom:.9rem; }
          .page-hero p { color:rgba(255,255,255,.72); font-size:1.05rem; max-width:560px; margin:0 auto; }
          .services-section { padding:80px 5%; }
          .service-item { display:grid; grid-template-columns:1fr 1fr; gap:0; max-width:1100px; margin:0 auto 5rem; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(26,47,94,.1); background:var(--bs-white); border:1px solid var(--bs-border); }
          .service-item.reverse { direction:rtl; }
          .service-item.reverse > * { direction:ltr; }
          .service-image { position:relative; overflow:hidden; min-height:380px; background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue)); }
          .service-image img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s ease; }
          .service-item:hover .service-image img { transform:scale(1.05); }
          .service-image-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, transparent 50%, rgba(15,30,61,.55)); }
          .service-image-fallback { width:100%; height:100%; min-height:380px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:5rem; gap:1rem; }
          .service-content { padding:3rem 3.2rem; display:flex; flex-direction:column; justify-content:center; }
          .service-number { font-size:.75rem; font-weight:700; letter-spacing:2px; color:var(--bs-accent); text-transform:uppercase; margin-bottom:.9rem; }
          .service-content h2 { font-size:1.55rem; color:var(--bs-navy); font-weight:800; margin-bottom:1.1rem; line-height:1.4; }
          .service-content > p { color:var(--bs-muted); font-size:.95rem; line-height:1.85; margin-bottom:1.4rem; }
          .service-features { list-style:none; display:flex; flex-direction:column; gap:.65rem; margin-bottom:1.6rem; padding:0; }
          .service-features li { display:flex; align-items:flex-start; gap:.7rem; font-size:.9rem; color:var(--bs-text); }
          .service-features li::before { content:'✓'; color:var(--bs-accent); font-weight:800; flex-shrink:0; margin-top:2px; }
          .service-target { background:var(--bs-light-blue); border-radius:10px; padding:.8rem 1.1rem; font-size:.84rem; color:var(--bs-blue); font-weight:600; }
          .service-target span { color:var(--bs-navy); font-weight:700; }
          .learn-btn { display:inline-flex; align-items:center; gap:.5rem; background:var(--bs-navy); color:#fff; padding:.75rem 1.8rem; border-radius:9px; font-size:.92rem; font-weight:700; text-decoration:none; margin-top:1.4rem; transition:background .2s, transform .15s; width:fit-content; }
          .learn-btn:hover { background:var(--bs-blue); transform:translateY(-1px); }
          @media(max-width:900px) { .service-item { grid-template-columns:1fr; } .service-item.reverse { direction:ltr; } .service-image { min-height:260px; } .service-content { padding:2.2rem; } }
          @media(max-width:540px) { .service-content { padding:1.8rem 1.5rem; } }
          .special-section { background:var(--bs-white); padding:80px 5%; }
          .section-header { text-align:center; margin-bottom:3.5rem; }
          .section-tag { display:inline-block; background:var(--bs-light-blue); color:var(--bs-blue); font-size:.75rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:.3rem 1rem; border-radius:100px; margin-bottom:.9rem; }
          .section-title { font-size:clamp(1.6rem,3vw,2.3rem); color:var(--bs-navy); font-weight:800; line-height:1.3; margin-bottom:.6rem; }
          .section-desc { color:var(--bs-muted); font-size:.95rem; max-width:480px; margin:0 auto; }
          .special-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.6rem; max-width:1100px; margin:0 auto; }
          .special-card { background:var(--bs-bg); border-radius:20px; border:1.5px solid var(--bs-border); overflow:hidden; transition:transform .25s,box-shadow .25s; }
          .special-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(26,47,94,.12); }
          .special-icon-wrap { background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue)); padding:1.8rem 2rem 1.2rem; }
          .special-icon { font-size:2.5rem; }
          .special-content { padding:1.6rem 2rem 2rem; }
          .special-tag { font-size:.72rem; font-weight:700; letter-spacing:2px; color:var(--bs-accent); text-transform:uppercase; margin-bottom:.6rem; }
          .special-content h3 { color:var(--bs-navy); font-size:1.2rem; font-weight:800; margin-bottom:.9rem; }
          .special-content > p { color:var(--bs-muted); font-size:.9rem; line-height:1.85; margin-bottom:1.2rem; }
          .special-features { list-style:none; display:flex; flex-direction:column; gap:.7rem; margin-bottom:1.2rem; padding:0; }
          .special-features li { font-size:.87rem; color:var(--bs-text); line-height:1.65; padding-left:1rem; position:relative; }
          .special-features li::before { content:'▸'; position:absolute; left:0; color:var(--bs-accent); font-size:.8rem; }
          .special-notice { background:var(--bs-light-blue); border-radius:8px; padding:.65rem 1rem; font-size:.82rem; color:var(--bs-blue); font-weight:600; line-height:1.6; }
          @media(max-width:900px){.special-grid{grid-template-columns:1fr;}}
          .process-section { background:var(--bs-white); padding:80px 5%; }
          .process-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; max-width:1000px; margin:0 auto; position:relative; }
          .process-steps::before { content:''; position:absolute; top:36px; left:calc(12.5% + 1rem); right:calc(12.5% + 1rem); height:2px; background:var(--bs-border); z-index:0; }
          .step { text-align:center; position:relative; z-index:1; }
          .step-circle { width:72px; height:72px; border-radius:50%; background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue)); color:#fff; font-size:1.1rem; font-weight:800; display:flex; align-items:center; justify-content:center; margin:0 auto 1.1rem; box-shadow:0 6px 18px rgba(26,47,94,.22); }
          .step h4 { color:var(--bs-navy); font-size:.95rem; font-weight:700; margin-bottom:.4rem; }
          .step p { color:var(--bs-muted); font-size:.82rem; line-height:1.65; }
          @media(max-width:700px) { .process-steps { grid-template-columns:repeat(2,1fr); } .process-steps::before { display:none; } }
          .cta-section { background:linear-gradient(140deg,#0a1830 0%,#132347 60%,#1c3460 100%); padding:80px 5%; text-align:center; position:relative; overflow:hidden; }
          .cta-section::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
          .cta-section h2 { font-size:clamp(1.7rem,3.5vw,2.5rem); color:#fff; font-weight:800; margin-bottom:1rem; position:relative; }
          .cta-section p { color:rgba(255,255,255,.72); font-size:1rem; max-width:500px; margin:0 auto 2.2rem; position:relative; }
          .cta-btns { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; position:relative; }
          .cta-primary { background:var(--bs-accent); color:#fff; padding:.9rem 2.4rem; border-radius:9px; font-size:1rem; font-weight:700; text-decoration:none; transition:background .2s,transform .15s; box-shadow:0 4px 18px rgba(78,157,224,.4); }
          .cta-primary:hover { background:#3a8cce; transform:translateY(-2px); }
          .cta-outline { border:1.5px solid rgba(255,255,255,.35); color:#fff; padding:.9rem 2.4rem; border-radius:9px; font-size:1rem; font-weight:600; text-decoration:none; transition:border-color .2s,background .2s; }
          .cta-outline:hover { border-color:rgba(255,255,255,.7); background:rgba(255,255,255,.07); }
        `}</style>

        <div className="page-hero">
          <div className="page-hero-tag">Services</div>
          <h1>전문 심리사회 서비스</h1>
          <p>개인, 집단, 기관을 위한 과학적·인본주의적 접근의<br />맞춤형 심리 서비스를 제공합니다.</p>
        </div>

        <section className="services-section">
          <div className="service-item reveal">
            <div className="service-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" alt="개인 심리상담" />
              <div className="service-image-overlay"></div>
            </div>
            <div className="service-content">
              <div className="service-number">Service 01</div>
              <h2>개인 심리상담</h2>
              <p>전문 상담사와의 1:1 심리상담을 통해 우울, 불안, 자존감 저하, 대인관계 어려움, 외상 후 스트레스 등 다양한 심리적 어려움을 깊이 탐색하고 해결합니다. 내담자의 고유한 삶의 맥락과 강점을 중심에 두고, 증거 기반의 심리치료 기법(CBT, ACT, DBT 등)을 개별 맞춤으로 적용합니다.</p>
              <ul className="service-features">
                <li>인지행동치료(CBT) · 수용전념치료(ACT) · 변증법적 행동치료(DBT)</li>
                <li>우울·불안·트라우마·자존감 문제 <strong>근거기반</strong> 전문 상담</li>
                <li>초기 심리평가를 통한 맞춤형 치료 계획 수립</li>
                <li>비밀 보장 원칙 준수 및 안전한 상담 환경 제공</li>
                <li>회기 간 과제와 자기 모니터링 도구 제공</li>
              </ul>
              <div className="service-target"><span>대상:</span> 심리적 어려움을 겪고 있는 성인 및 청소년 (만 14세 이상)</div>
              <a href="/#contact" className="learn-btn">상담 신청하기 →</a>
            </div>
          </div>

          <div className="service-item reverse reveal">
            <div className="service-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80" alt="집단 상담" />
              <div className="service-image-overlay"></div>
            </div>
            <div className="service-content">
              <div className="service-number">Service 02</div>
              <h2>집단 상담</h2>
              <p>비슷한 어려움을 가진 소그룹(6~10명)이 함께 모여 공통된 주제를 탐색하고 서로에게 배우는 집단 상담 프로그램입니다. 집단 안에서의 상호작용을 통해 대인관계 패턴을 이해하고, 공감·지지·피드백의 치유적 경험을 쌓을 수 있습니다.</p>
              <ul className="service-features">
                <li>청소년 자존감 향상 프로그램 (8회기)</li>
                <li>성인 우울·불안 관리 집단 (12회기)</li>
                <li>대인관계 역량 강화 집단 (10회기)</li>
                <li>마음챙김 기반 스트레스 감소 프로그램 (MBSR)</li>
                <li>소수 정예 운영으로 깊이 있는 집단 경험 보장</li>
              </ul>
              <div className="service-target"><span>대상:</span> 비슷한 심리적 주제를 가진 성인 및 청소년 소그룹</div>
              <a href="/#contact" className="learn-btn">프로그램 문의하기 →</a>
            </div>
          </div>

          <div className="service-item reveal">
            <div className="service-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" alt="심리평가" />
              <div className="service-image-overlay"></div>
            </div>
            <div className="service-content">
              <div className="service-number">Service 03</div>
              <h2>심리평가 및 검사</h2>
              <p>표준화된 심리검사 배터리를 통해 심리적 상태를 체계적으로 평가하고, 임상적 진단 수준의 종합 보고서를 제공합니다. 상담 방향 설정, 직업 적성 탐색, 학습 어려움 원인 파악 등 다양한 목적의 심리평가를 수행합니다.</p>
              <ul className="service-features">
                <li>종합 심리검사 배터리: MMPI-2 · 지능검사(K-WAIS/K-WISC) · SCT · 로르샤흐 · HTP · TAT · TCI</li>
                <li>증상 선별 검사: SCL-90-R · PHQ-9 · GAD-7 · PCL-5 (외상 후 스트레스)</li>
                <li>신경심리 및 인지 기능 평가 (집중력, 기억력, 실행 기능)</li>
                <li>성격 및 적성 검사 (MBTI, HEXACO, 홀랜드 직업흥미검사)</li>
                <li>전문 임상심리사 작성 종합 해석 보고서 제공</li>
              </ul>
              <div className="service-target"><span>대상:</span> 심리 상태 점검이 필요한 성인, 청소년, 아동 (보호자 동의 필요)</div>
              <a href="/#contact" className="learn-btn">검사 예약하기 →</a>
            </div>
          </div>

          <div className="service-item reverse reveal">
            <div className="service-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80" alt="심리사회 연구" />
              <div className="service-image-overlay"></div>
            </div>
            <div className="service-content">
              <div className="service-number">Service 04</div>
              <h2>심리사회 연구</h2>
              <p>정신건강 관련 양적·질적 연구를 수행하고, 연구 결과를 임상 실천에 접목시킵니다. 지역사회 정신건강 실태 조사, 개입 프로그램 효과 연구, 척도 타당화 연구 등 다양한 연구 프로젝트를 진행하며, 학술적 성과를 지역사회로 환원합니다.</p>
              <ul className="service-features">
                <li>지역사회 정신건강 실태 조사 및 욕구 분석</li>
                <li>심리치료 프로그램 효과성 평가 연구</li>
                <li>척도 개발 및 타당화 연구</li>
                <li>공공기관·지자체 연구 용역 수행</li>
                <li>국내외 학술지 논문 발표 및 학술대회 참여</li>
              </ul>
              <div className="service-target"><span>대상:</span> 공공기관, 지자체, 비영리 단체, 학술 연구 협력 기관</div>
              <a href="/#contact" className="learn-btn">연구 협력 문의 →</a>
            </div>
          </div>

          <div className="service-item reveal">
            <div className="service-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" alt="기업 상담" />
              <div className="service-image-overlay"></div>
            </div>
            <div className="service-content">
              <div className="service-number">Service 05</div>
              <h2>기업·기관 상담</h2>
              <p>직장 내 스트레스, 번아웃, 대인관계 갈등 등 조직 구성원의 심리적 건강을 지원하는 EAP(Employee Assistance Program) 및 기관 맞춤형 심리지원 서비스를 제공합니다. 건강한 조직 문화 형성과 구성원의 직무 만족도·생산성 향상에 기여합니다.</p>
              <ul className="service-features">
                <li>임직원 개인 심리상담 프로그램 (EAP)</li>
                <li>직장 내 스트레스·번아웃 조기 감지 및 개입</li>
                <li>조직 내 심리적 안전감 증진 워크숍</li>
                <li>관리자 대상 심리적 지지 리더십 교육</li>
                <li>조직 심리건강 진단 및 컨설팅 보고서 제공</li>
              </ul>
              <div className="service-target"><span>대상:</span> 기업, 공공기관, 학교, 복지 기관 등</div>
              <a href="/#contact" className="learn-btn">기관 상담 문의 →</a>
            </div>
          </div>

          <div className="service-item reverse reveal">
            <div className="service-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80" alt="교육 및 워크숍" />
              <div className="service-image-overlay"></div>
            </div>
            <div className="service-content">
              <div className="service-number">Service 06</div>
              <h2>교육 및 워크숍</h2>
              <p>정신건강에 대한 인식을 높이고 심리적 역량을 강화하는 다양한 교육 프로그램과 워크숍을 운영합니다. 학교, 직장, 지역사회 등 다양한 환경에서 참여자의 수준과 필요에 맞춘 맞춤형 교육 콘텐츠를 개발·제공합니다.</p>
              <ul className="service-features">
                <li>정신건강 인식 개선 교육 (찾아가는 강의)</li>
                <li>정서 조절 및 스트레스 관리 워크숍</li>
                <li>자살·자해 예방 게이트키퍼 교육 (QPR, safeTALK)</li>
                <li>회복탄력성 증진 프로그램 (청소년·성인)</li>
                <li>상담사 및 사회복지사 대상 슈퍼비전 교육</li>
              </ul>
              <div className="service-target"><span>대상:</span> 학교, 지역사회 기관, 기업, 복지관 등 단체 신청 가능</div>
              <a href="/#contact" className="learn-btn">교육 신청하기 →</a>
            </div>
          </div>
        </section>

        <section className="special-section">
          <div className="section-header reveal">
            <div className="section-tag">Specialty</div>
            <h2 className="section-title">전문 특화 서비스</h2>
            <p className="section-desc">고도의 전문성이 요구되는 특수 영역에 대한 집중 개입 프로그램을 제공합니다</p>
          </div>
          <div className="special-grid">
            <div className="special-card reveal delay-1">
              <div className="special-icon-wrap"><div className="special-icon">🔐</div></div>
              <div className="special-content">
                <div className="special-tag">Specialty 01</div>
                <h3>성(性)상담</h3>
                <p>성과 관련된 심리적 어려움은 높은 수치심과 비밀보장에 대한 우려로 인해 혼자 감당하기 어려운 경우가 많습니다. 안전하고 비판 없는 환경에서 전문 임상심리사와 함께 깊이 탐색하고 변화를 이끌어냅니다.</p>
                <ul className="special-features">
                  <li><strong>성중독·과다성욕</strong> — 포르노 중독, 성적 강박행동, 충동 조절</li>
                  <li><strong>성생활 문제</strong> — 성기능 어려움, 성욕 불일치, 관계 내 성적 갈등</li>
                  <li><strong>성 트라우마</strong> — 성폭력·성희롱 피해 후 외상 치료 (TF-CBT, EMDR)</li>
                  <li><strong>성 정체성·젠더</strong> — 성 정체성 탐색, LGBTQ+ 친화적 상담</li>
                </ul>
                <div className="special-notice">🔒 완전한 비밀 보장, 비판 없는 수용적 환경에서 진행합니다.</div>
                <a href="/#contact" className="learn-btn" style={{marginTop:'1.2rem'}}>상담 신청하기 →</a>
              </div>
            </div>
            <div className="special-card reveal delay-2">
              <div className="special-icon-wrap"><div className="special-icon">🔗</div></div>
              <div className="special-content">
                <div className="special-tag">Specialty 02</div>
                <h3>중독상담</h3>
                <p>알코올, 도박, 스마트폰·게임, 쇼핑 등 다양한 중독 문제는 의지력만으로 해결되지 않습니다. 중독의 심리적 기제를 이해하고, 근거기반 치료 접근으로 회복과 재발 방지를 함께 만들어갑니다.</p>
                <ul className="special-features">
                  <li><strong>알코올·약물 중독</strong> — 동기강화상담(MI), 인지행동치료(CBT) 병행</li>
                  <li><strong>행위 중독</strong> — 도박, 게임, 쇼핑, SNS 과사용</li>
                  <li><strong>관계 중독</strong> — 의존적 애착, 공동의존(codependency)</li>
                  <li><strong>재발 방지</strong> — 갈망 관리, 촉발 요인 분석, 대처 기술 훈련</li>
                </ul>
                <div className="special-notice">📋 가족 상담 및 지지 그룹 연계 서비스도 제공합니다.</div>
                <a href="/#contact" className="learn-btn" style={{marginTop:'1.2rem'}}>상담 신청하기 →</a>
              </div>
            </div>
            <div className="special-card reveal delay-3">
              <div className="special-icon-wrap"><div className="special-icon">🌱</div></div>
              <div className="special-content">
                <div className="special-tag">Specialty 03</div>
                <h3>긍정적 행동지원 (PBS)</h3>
                <p>긍정적 행동지원(Positive Behavior Support)은 발달장애, 지적장애, 자폐스펙트럼 등 도전적 행동을 보이는 아동·청소년 및 성인을 대상으로 환경 수정과 기술 교육을 통해 삶의 질을 높이는 근거기반 접근입니다.</p>
                <ul className="special-features">
                  <li><strong>행동 기능평가(FBA)</strong> — 도전적 행동의 원인과 기능 체계적 분석</li>
                  <li><strong>PBS 계획 수립</strong> — 가정·학교·기관 환경 맞춤 지원 전략</li>
                  <li><strong>부모·교사 코칭</strong> — 일관된 지원 환경 구축을 위한 보호자 교육</li>
                  <li><strong>자기조절 기술 훈련</strong> — 대체 행동 및 의사소통 기술 증진</li>
                </ul>
                <div className="special-notice">🏫 가정·학교·복지관 방문 지원 및 기관 자문 서비스도 제공합니다.</div>
                <a href="/#contact" className="learn-btn" style={{marginTop:'1.2rem'}}>상담 신청하기 →</a>
              </div>
            </div>
          </div>
        </section>

        <section className="process-section">
          <div className="section-header reveal">
            <div className="section-tag">Process</div>
            <h2 className="section-title">상담 진행 과정</h2>
            <p className="section-desc">처음부터 끝까지 전문적이고 안전하게 안내해 드립니다</p>
          </div>
          <div className="process-steps">
            <div className="step reveal"><div className="step-circle">01</div><h4>상담 접수</h4><p>전화, 이메일 또는 온라인 폼으로 접수하시면 담당자가 24시간 내 연락드립니다.</p></div>
            <div className="step reveal"><div className="step-circle">02</div><h4>초기 면접</h4><p>50분 초기 면접을 통해 주 호소 문제, 심리 상태, 상담 목표를 함께 설정합니다.</p></div>
            <div className="step reveal"><div className="step-circle">03</div><h4>치료 계획</h4><p>개별 특성에 맞는 심리검사와 치료 방향을 수립하고 상담 계획서를 공유합니다.</p></div>
            <div className="step reveal"><div className="step-circle">04</div><h4>상담 진행 및 종결</h4><p>정기 회기를 진행하며 목표 달성 시 종결 과정을 통해 변화를 공고히 합니다.</p></div>
          </div>
        </section>

        <section className="cta-section">
          <h2 className="reveal">지금 바로 시작하세요</h2>
          <p className="reveal">어떤 서비스가 적합할지 모르겠다면 먼저 무료 전화 상담을 통해 안내 받으세요.</p>
          <div className="cta-btns reveal">
            <a href="/#contact" className="cta-primary">상담 신청하기</a>
            <a href="/tests" className="cta-outline">심리검사 먼저 해보기</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
