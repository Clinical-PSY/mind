import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{`
          .page-hero { background:linear-gradient(140deg,#0a1830 0%,#132347 45%,#1c3460 100%); padding:110px 5% 80px; text-align:center; position:relative; overflow:hidden; }
          .page-hero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
          .page-hero-tag { display:inline-block; background:rgba(78,157,224,.15); border:1px solid rgba(78,157,224,.35); color:var(--bs-accent); font-size:.78rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:.38rem 1.1rem; border-radius:100px; margin-bottom:1.2rem; }
          .page-hero h1 { font-size:clamp(1.9rem,4vw,2.9rem); color:#fff; font-weight:800; line-height:1.3; margin-bottom:.9rem; }
          .page-hero p { color:rgba(255,255,255,.72); font-size:1.05rem; max-width:560px; margin:0 auto; }
          section { padding:88px 5%; }
          .section-header { text-align:center; margin-bottom:4rem; }
          .section-tag { display:inline-block; background:var(--bs-light-blue); color:var(--bs-blue); font-size:.75rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:.3rem 1rem; border-radius:100px; margin-bottom:.9rem; }
          .section-title { font-size:clamp(1.6rem,3vw,2.3rem); color:var(--bs-navy); font-weight:800; line-height:1.3; margin-bottom:.7rem; }
          .section-desc { color:var(--bs-muted); font-size:.95rem; max-width:520px; margin:0 auto; }
          #intro { background:var(--bs-white); }
          .intro-grid { display:grid; grid-template-columns:1fr 1fr; gap:3.5rem; max-width:1060px; margin:0 auto; align-items:center; }
          .intro-text h2 { font-size:1.55rem; color:var(--bs-navy); font-weight:800; margin-bottom:1rem; line-height:1.4; }
          .intro-text p { color:var(--bs-muted); font-size:.95rem; line-height:1.9; margin-bottom:.9rem; }
          .intro-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:1.8rem; }
          .intro-stat { background:var(--bs-light-blue); border-radius:14px; padding:1.2rem 1rem; text-align:center; }
          .intro-stat-num { font-size:1.9rem; font-weight:800; color:var(--bs-navy); line-height:1; }
          .intro-stat-label { font-size:.8rem; color:var(--bs-muted); margin-top:.3rem; }
          .intro-visual { background:linear-gradient(140deg,var(--bs-navy),#1e4080); border-radius:22px; padding:2.8rem 2.5rem; color:#fff; box-shadow:0 20px 50px rgba(26,47,94,.22); position:relative; overflow:hidden; }
          .intro-visual::after { content:'✦'; position:absolute; right:1rem; top:.5rem; font-size:8rem; opacity:.04; line-height:1; }
          .intro-visual h3 { font-size:1.2rem; font-weight:700; margin-bottom:1.5rem; opacity:.9; }
          .vision-item { display:flex; align-items:flex-start; gap:.85rem; padding:.75rem 0; border-bottom:1px solid rgba(255,255,255,.1); font-size:.92rem; color:rgba(255,255,255,.88); line-height:1.65; }
          .vision-item:last-child { border-bottom:none; }
          .vision-icon { font-size:1.1rem; flex-shrink:0; margin-top:2px; }
          @media(max-width:860px){.intro-grid{grid-template-columns:1fr;}}
          #venn { background:var(--bs-bg); }
          .venn-block { max-width:1000px; margin:0 auto 5rem; background:var(--bs-white); border-radius:24px; border:1px solid var(--bs-border); box-shadow:0 8px 32px rgba(26,47,94,.08); overflow:hidden; }
          .venn-block:last-child { margin-bottom:0; }
          .venn-inner { display:grid; grid-template-columns:1fr 1fr; }
          .venn-inner.rev { direction:rtl; }
          .venn-inner.rev > * { direction:ltr; }
          .venn-diagram-side { background:var(--bs-light-blue); display:flex; align-items:center; justify-content:center; padding:3rem 2rem; min-height:380px; }
          .venn-text-side { padding:3rem 3rem; display:flex; flex-direction:column; justify-content:center; }
          .venn-num { font-size:.75rem; font-weight:700; letter-spacing:2px; color:var(--bs-accent); text-transform:uppercase; margin-bottom:.7rem; }
          .venn-text-side h3 { font-size:1.35rem; color:var(--bs-navy); font-weight:800; margin-bottom:1rem; line-height:1.4; }
          .venn-text-side p { color:var(--bs-muted); font-size:.93rem; line-height:1.85; margin-bottom:1.2rem; }
          .venn-areas { display:flex; flex-direction:column; gap:.6rem; }
          .venn-area { display:flex; align-items:flex-start; gap:.8rem; font-size:.88rem; }
          .venn-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:4px; }
          .venn-area-label { font-weight:700; color:var(--bs-navy); }
          .venn-area-desc { color:var(--bs-muted); font-size:.84rem; margin-top:.1rem; }
          .venn-svg { width:100%; max-width:320px; height:auto; }
          @media(max-width:860px){.venn-inner,.venn-inner.rev{grid-template-columns:1fr;direction:ltr;}.venn-diagram-side{min-height:300px;}.venn-text-side{padding:2rem;}}
          #values { background:var(--bs-white); }
          .values-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.2rem; max-width:1000px; margin:0 auto; }
          .value-card { background:var(--bs-bg); border-radius:18px; padding:2rem 1.5rem; border:1.5px solid var(--bs-border); transition:transform .25s,box-shadow .25s,border-color .25s; text-align:center; }
          .value-card:hover { transform:translateY(-5px); box-shadow:0 14px 36px rgba(26,47,94,.1); border-color:var(--bs-accent); }
          .value-icon { width:64px; height:64px; border-radius:16px; background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue)); display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin:0 auto 1.1rem; box-shadow:0 6px 18px rgba(26,47,94,.2); }
          .value-card h4 { color:var(--bs-navy); font-size:1.05rem; font-weight:800; margin-bottom:.6rem; }
          .value-card p { color:var(--bs-muted); font-size:.86rem; line-height:1.75; }
          @media(max-width:760px){.values-grid{grid-template-columns:repeat(2,1fr);}}
          @media(max-width:420px){.values-grid{grid-template-columns:1fr;}}
          #history { background:var(--bs-bg); }
          .timeline { max-width:780px; margin:0 auto; position:relative; padding-left:2.5rem; }
          .timeline::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:var(--bs-border); }
          .tl-item { position:relative; margin-bottom:2.5rem; }
          .tl-dot { position:absolute; left:-2.5rem; top:.25rem; width:16px; height:16px; border-radius:50%; background:var(--bs-accent); border:3px solid #fff; box-shadow:0 0 0 2px var(--bs-accent); transform:translateX(-7px); }
          .tl-year { font-size:.78rem; font-weight:700; color:var(--bs-accent); letter-spacing:1px; text-transform:uppercase; margin-bottom:.3rem; }
          .tl-title { font-size:1rem; color:var(--bs-navy); font-weight:700; margin-bottom:.3rem; }
          .tl-desc { color:var(--bs-muted); font-size:.88rem; line-height:1.75; }
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
          <div className="page-hero-tag">About Us</div>
          <h1>연구소 소개 및 비전</h1>
          <p>과학과 돌봄이 사회 속에서 만나는 곳,<br />별생각 심리사회 연구소를 소개합니다.</p>
        </div>

        <section id="intro">
          <div className="intro-grid">
            <div className="intro-text reveal">
              <h2>별생각 심리사회 연구소란?</h2>
              <p>별생각 심리사회 연구소는 개인의 심리적 어려움을 전문적으로 돕고, 사회적 맥락 속에서 삶의 질을 향상시키기 위해 설립된 전문 심리상담 및 연구 기관입니다.</p>
              <p>저희는 &apos;별생각&apos;이라는 이름처럼, 사람마다 다른 고유한 생각과 감정의 세계를 존중합니다. 임상심리, 상담심리, 사회심리 분야의 전문가들이 함께 모여 과학적 근거와 따뜻한 인간 중심의 가치를 통합한 서비스를 제공합니다.</p>
              <p>단순한 치료를 넘어, 내담자가 자신의 삶의 주인공이 될 수 있도록 역량을 강화하고 지역사회 전체의 정신건강 수준을 높이는 것이 우리의 궁극적인 목표입니다.</p>
              <div className="intro-stats">
                <div className="intro-stat reveal delay-1">
                  <div className="intro-stat-num">500+</div>
                  <div className="intro-stat-label">누적 상담 사례</div>
                </div>
                <div className="intro-stat reveal delay-2">
                  <div className="intro-stat-num">10+</div>
                  <div className="intro-stat-label">연구·출판 실적</div>
                </div>
                <div className="intro-stat reveal delay-3">
                  <div className="intro-stat-num">3+</div>
                  <div className="intro-stat-label">전문 인력</div>
                </div>
              </div>
            </div>
            <div className="intro-visual reveal">
              <h3>우리의 다짐</h3>
              <div className="vision-item"><span className="vision-icon">🔬</span><span>과학적 근거(Evidence-Based Practice)에 기반한 심리상담 및 심리치료를 제공합니다</span></div>
              <div className="vision-item"><span className="vision-icon">🤝</span><span>내담자 중심(Client-Centered)의 개별화된 접근으로 모든 내담자를 존중합니다</span></div>
              <div className="vision-item"><span className="vision-icon">🌱</span><span>지역사회 정신건강 증진에 적극 기여하며 공공 서비스 역할을 다합니다</span></div>
              <div className="vision-item"><span className="vision-icon">📚</span><span>지속적인 연구·훈련으로 최신 심리치료의 전문성을 유지하고 강화합니다</span></div>
              <div className="vision-item"><span className="vision-icon">🛡️</span><span>엄격한 윤리 기준과 비밀 보장 원칙으로 신뢰할 수 있는 상담 환경을 만듭니다</span></div>
            </div>
          </div>
        </section>

        <section id="venn">
          <div className="section-header reveal">
            <div className="section-tag">Identity</div>
            <h2 className="section-title">벤다이어그램으로 보는 별생각</h2>
            <p className="section-desc">세 가지 관점으로 연구소의 정체성, 서비스 구조, 치료 철학을 이해해 보세요</p>
          </div>

          <div className="venn-block reveal">
            <div className="venn-inner">
              <div className="venn-diagram-side">
                <svg className="venn-svg" viewBox="0 0 340 320" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow1"><feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity={0.15}/></filter>
                  </defs>
                  <circle cx="148" cy="128" r="115" fill="rgba(26,47,94,0.22)" stroke="#1a2f5e" strokeWidth="2.5" filter="url(#shadow1)"/>
                  <circle cx="232" cy="128" r="115" fill="rgba(37,99,168,0.22)" stroke="#2563a8" strokeWidth="2.5" filter="url(#shadow1)"/>
                  <circle cx="190" cy="212" r="115" fill="rgba(78,157,224,0.22)" stroke="#4e9de0" strokeWidth="2.5" filter="url(#shadow1)"/>
                  <text x="88" y="72" textAnchor="middle" fill="#1a2f5e" fontSize="13" fontWeight="800">연구</text>
                  <text x="88" y="88" textAnchor="middle" fill="#1a2f5e" fontSize="10">(Research)</text>
                  <text x="295" y="72" textAnchor="middle" fill="#2563a8" fontSize="13" fontWeight="800">실천</text>
                  <text x="295" y="88" textAnchor="middle" fill="#2563a8" fontSize="10">(Practice)</text>
                  <text x="190" y="295" textAnchor="middle" fill="#4e9de0" fontSize="13" fontWeight="800">사회</text>
                  <text x="190" y="311" textAnchor="middle" fill="#4e9de0" fontSize="10">(Community)</text>
                  <text x="145" y="152" textAnchor="middle" fill="#1a3a70" fontSize="9.5" fontWeight="600">근거 기반</text>
                  <text x="235" y="152" textAnchor="middle" fill="#1a3a70" fontSize="9.5" fontWeight="600">임상 적용</text>
                  <text x="190" y="213" textAnchor="middle" fill="#1a3a70" fontSize="9.5" fontWeight="600">지역 환원</text>
                  <text x="190" y="168" textAnchor="middle" fill="#0f1e3d" fontSize="12" fontWeight="800">별생각</text>
                  <text x="190" y="183" textAnchor="middle" fill="#0f1e3d" fontSize="9.5">심리사회 연구소</text>
                </svg>
              </div>
              <div className="venn-text-side">
                <div className="venn-num">Venn 01</div>
                <h3>핵심 정체성 :<br />연구 · 실천 · 사회의 교차점</h3>
                <p>별생각 심리사회 연구소는 세 가지 핵심 영역이 하나로 교차하는 지점에 자리합니다. 학문적 연구(Research), 임상 실천(Practice), 지역사회 기여(Community)가 서로를 강화하며 통합된 서비스로 발현됩니다.</p>
                <div className="venn-areas">
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#1a2f5e'}}></div></div><div><div className="venn-area-label">연구 (Research)</div><div className="venn-area-desc">체계적 문헌 검토, 실증적 데이터, 학술 발표를 통해 최신 심리학 지식을 축적합니다.</div></div></div>
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#2563a8'}}></div></div><div><div className="venn-area-label">실천 (Practice)</div><div className="venn-area-desc">연구 성과를 임상 현장에 적용하여 내담자에게 효과적인 심리 서비스를 제공합니다.</div></div></div>
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#4e9de0'}}></div></div><div><div className="venn-area-label">사회 (Community)</div><div className="venn-area-desc">지역사회 정신건강 증진을 위해 공공 서비스, 교육, 정책 자문 활동을 수행합니다.</div></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="venn-block reveal">
            <div className="venn-inner rev">
              <div className="venn-diagram-side">
                <svg className="venn-svg" viewBox="0 0 340 320" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="148" cy="128" r="115" fill="rgba(78,157,224,0.25)" stroke="#4e9de0" strokeWidth="2.5"/>
                  <circle cx="232" cy="128" r="115" fill="rgba(37,99,168,0.25)" stroke="#2563a8" strokeWidth="2.5"/>
                  <circle cx="190" cy="212" r="115" fill="rgba(26,47,94,0.25)" stroke="#1a2f5e" strokeWidth="2.5"/>
                  <text x="82" y="68" textAnchor="middle" fill="#1e7cc0" fontSize="13" fontWeight="800">개인</text>
                  <text x="82" y="84" textAnchor="middle" fill="#1e7cc0" fontSize="10">(Individual)</text>
                  <text x="298" y="68" textAnchor="middle" fill="#2563a8" fontSize="13" fontWeight="800">집단</text>
                  <text x="298" y="84" textAnchor="middle" fill="#2563a8" fontSize="10">(Group)</text>
                  <text x="190" y="295" textAnchor="middle" fill="#1a2f5e" fontSize="13" fontWeight="800">기관·조직</text>
                  <text x="190" y="311" textAnchor="middle" fill="#1a2f5e" fontSize="10">(Organization)</text>
                  <text x="145" y="148" textAnchor="middle" fill="#0f3060" fontSize="9" fontWeight="600">소규모</text>
                  <text x="145" y="160" textAnchor="middle" fill="#0f3060" fontSize="9" fontWeight="600">집단 상담</text>
                  <text x="237" y="148" textAnchor="middle" fill="#0f3060" fontSize="9" fontWeight="600">기관 내</text>
                  <text x="237" y="160" textAnchor="middle" fill="#0f3060" fontSize="9" fontWeight="600">집단 프로그램</text>
                  <text x="190" y="210" textAnchor="middle" fill="#0f3060" fontSize="9" fontWeight="600">개인화된</text>
                  <text x="190" y="222" textAnchor="middle" fill="#0f3060" fontSize="9" fontWeight="600">조직 상담</text>
                  <text x="190" y="168" textAnchor="middle" fill="#0a1830" fontSize="12" fontWeight="800">통합적</text>
                  <text x="190" y="183" textAnchor="middle" fill="#0a1830" fontSize="9.5">다층 서비스</text>
                </svg>
              </div>
              <div className="venn-text-side">
                <div className="venn-num">Venn 02</div>
                <h3>서비스 구조 :<br />개인 · 집단 · 기관의 다층 개입</h3>
                <p>별생각의 서비스는 개인(Individual), 집단(Group), 기관/조직(Organization)의 세 수준에서 통합적으로 제공됩니다. 각 수준은 독립적으로도, 상호 연계해서도 활용될 수 있어 내담자의 필요에 따라 최적의 서비스 조합이 가능합니다.</p>
                <div className="venn-areas">
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#4e9de0'}}></div></div><div><div className="venn-area-label">개인 (Individual)</div><div className="venn-area-desc">1:1 심리상담, 개인 심리평가, 맞춤형 치료 계획 수립</div></div></div>
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#2563a8'}}></div></div><div><div className="venn-area-label">집단 (Group)</div><div className="venn-area-desc">소그룹 치료 프로그램, 주제별 집단 상담, 동료 지지 그룹</div></div></div>
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#1a2f5e'}}></div></div><div><div className="venn-area-label">기관·조직 (Organization)</div><div className="venn-area-desc">EAP, 기관 상담 프로그램, 조직 건강 진단 및 컨설팅</div></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="venn-block reveal">
            <div className="venn-inner">
              <div className="venn-diagram-side">
                <svg className="venn-svg" viewBox="0 0 340 320" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="148" cy="128" r="115" fill="rgba(26,47,94,0.22)" stroke="#1a2f5e" strokeWidth="2.5"/>
                  <circle cx="232" cy="128" r="115" fill="rgba(78,157,224,0.22)" stroke="#4e9de0" strokeWidth="2.5"/>
                  <circle cx="190" cy="212" r="115" fill="rgba(37,99,168,0.22)" stroke="#2563a8" strokeWidth="2.5"/>
                  <text x="80" y="64" textAnchor="middle" fill="#1a2f5e" fontSize="12" fontWeight="800">증거 기반</text>
                  <text x="80" y="80" textAnchor="middle" fill="#1a2f5e" fontSize="9.5">(Evidence-Based)</text>
                  <text x="298" y="64" textAnchor="middle" fill="#1e7cc0" fontSize="12" fontWeight="800">인본주의</text>
                  <text x="298" y="80" textAnchor="middle" fill="#1e7cc0" fontSize="9.5">(Humanistic)</text>
                  <text x="190" y="295" textAnchor="middle" fill="#2563a8" fontSize="12" fontWeight="800">체계적 접근</text>
                  <text x="190" y="311" textAnchor="middle" fill="#2563a8" fontSize="9.5">(Systemic)</text>
                  <text x="142" y="148" textAnchor="middle" fill="#0a1830" fontSize="9" fontWeight="600">과학적</text>
                  <text x="142" y="160" textAnchor="middle" fill="#0a1830" fontSize="9" fontWeight="600">공감</text>
                  <text x="238" y="148" textAnchor="middle" fill="#0a1830" fontSize="9" fontWeight="600">맥락적</text>
                  <text x="238" y="160" textAnchor="middle" fill="#0a1830" fontSize="9" fontWeight="600">성장</text>
                  <text x="190" y="210" textAnchor="middle" fill="#0a1830" fontSize="9" fontWeight="600">구조화된</text>
                  <text x="190" y="222" textAnchor="middle" fill="#0a1830" fontSize="9" fontWeight="600">돌봄</text>
                  <text x="190" y="165" textAnchor="middle" fill="#0a1830" fontSize="12" fontWeight="800">통합적</text>
                  <text x="190" y="181" textAnchor="middle" fill="#0a1830" fontSize="9.5">치료 철학</text>
                </svg>
              </div>
              <div className="venn-text-side">
                <div className="venn-num">Venn 03</div>
                <h3>치료 철학 :<br />증거·인본·체계의 통합</h3>
                <p>별생각의 치료 철학은 세 가지 핵심 패러다임의 균형에 기반합니다. 연구로 검증된 기법(증거 기반), 내담자의 존엄성과 주체성을 존중하는 가치(인본주의), 그리고 개인을 둘러싼 관계와 사회적 맥락을 고려하는 관점(체계적 접근)을 통합합니다.</p>
                <div className="venn-areas">
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#1a2f5e'}}></div></div><div><div className="venn-area-label">증거 기반 접근</div><div className="venn-area-desc">CBT, ACT, DBT, EMDR 등 임상 연구로 효과가 검증된 치료 기법 적용</div></div></div>
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#4e9de0'}}></div></div><div><div className="venn-area-label">인본주의 접근</div><div className="venn-area-desc">무조건적 긍정적 존중, 공감적 이해, 내담자의 자기 결정권 존중</div></div></div>
                  <div className="venn-area"><div><div className="venn-dot" style={{background:'#2563a8'}}></div></div><div><div className="venn-area-label">체계적 접근</div><div className="venn-area-desc">가족, 직장, 사회문화적 맥락을 고려한 다층적 개입 계획 수립</div></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="values">
          <div className="section-header reveal">
            <div className="section-tag">Core Values</div>
            <h2 className="section-title">핵심 가치</h2>
            <p className="section-desc">별생각의 모든 서비스와 연구는 이 네 가지 가치를 기반으로 합니다</p>
          </div>
          <div className="values-grid">
            <div className="value-card reveal delay-1"><div className="value-icon">🔬</div><h4>전문성 (Expertise)</h4><p>학문적 훈련과 풍부한 임상 경험을 갖춘 전문가들이 최신 심리치료 지식을 바탕으로 서비스를 제공합니다.</p></div>
            <div className="value-card reveal delay-2"><div className="value-icon">🛡️</div><h4>신뢰성 (Integrity)</h4><p>한국심리학회 및 한국상담심리학회의 윤리 기준을 철저히 준수하며, 비밀 보장과 투명한 소통을 우선합니다.</p></div>
            <div className="value-card reveal delay-3"><div className="value-icon">🌿</div><h4>개별성 (Individuality)</h4><p>모든 내담자는 고유한 존재입니다. 표준화된 프로토콜을 바탕으로 하되, 개인의 맥락과 필요에 맞게 유연하게 접근합니다.</p></div>
            <div className="value-card reveal delay-4"><div className="value-icon">📊</div><h4>연구 기반 (Evidence)</h4><p>임상적 경험과 학술 연구를 지속적으로 통합하여, 효과가 검증된 개입 방법만을 적용합니다.</p></div>
          </div>
        </section>

        <section id="history">
          <div className="section-header reveal">
            <div className="section-tag">History</div>
            <h2 className="section-title">연구소 연혁</h2>
            <p className="section-desc">별생각의 발걸음을 돌아봅니다</p>
          </div>
          <div className="timeline">
            <div className="tl-item reveal"><div className="tl-dot"></div><div className="tl-year">2021</div><div className="tl-title">별생각 심리사회 연구소 설립</div><div className="tl-desc">임상심리 전문가 최재광 대표를 중심으로 연구소 설립. 개인 심리상담 서비스 시작.</div></div>
            <div className="tl-item reveal"><div className="tl-dot"></div><div className="tl-year">2022</div><div className="tl-title">집단 상담 프로그램 출범 · 지역사회 연구 시작</div><div className="tl-desc">청소년 자존감 향상 집단 프로그램 첫 운영. 지역 청년 우울 실태 조사 프로젝트 착수.</div></div>
            <div className="tl-item reveal"><div className="tl-dot"></div><div className="tl-year">2023</div><div className="tl-title">기관 협력 확대 · EAP 서비스 도입</div><div className="tl-desc">지역 정신건강복지센터 자문 활동 시작. 기업 대상 EAP(직원 심리지원) 서비스 론칭.</div></div>
            <div className="tl-item reveal"><div className="tl-dot"></div><div className="tl-year">2024</div><div className="tl-title">학술 성과 강화 · 전문 인력 확충</div><div className="tl-desc">한국심리학회 연구 발표. 심리상담사 2명 추가 채용으로 서비스 역량 강화.</div></div>
            <div className="tl-item reveal"><div className="tl-dot"></div><div className="tl-year">2025–현재</div><div className="tl-title">온라인 서비스 확장 · 연구 고도화</div><div className="tl-desc">비대면 심리상담 서비스 도입. 척도 타당화 연구 및 국제 학술 협력 추진 중.</div></div>
          </div>
        </section>

        <section className="cta-section">
          <h2 className="reveal">함께 시작할 준비가 되셨나요?</h2>
          <p className="reveal">별생각의 전문가와 함께 당신만의 여정을 시작해 보세요.</p>
          <div className="cta-btns reveal">
            <a href="/#contact" className="cta-primary">상담 신청하기</a>
            <a href="/services" className="cta-outline">서비스 더 알아보기</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
