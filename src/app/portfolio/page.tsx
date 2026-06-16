"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

type TabKey = "papers" | "projects" | "conferences" | "institutions" | "education";

interface PaperData { journal: string; year: string; authors: string; abstract: string; keywords: string[]; }

const PAPERS: Record<string, PaperData> = {
  "콜센터 상담원의 감정노동 관리를 위한 요구조사 기반의 모듈형 프로그램 제안": { journal:"한국콘텐츠학회논문지",year:"2026",authors:"이예찬, <strong>최재광</strong>, 호선아, 송원영. 한국콘텐츠학회논문지, 26(1), 744-755.",abstract:"본 연구는 콜센터 상담원의 업무 실태와 심리적 지원을 요구조사를 통해 파악하고(N=165), 요구조사 기반 모듈형 프로그램의 기본 구성을 제안하였다. 주요 스트레스 요인은 고객의 무리한 요구(48.5%), 폭언(41.8%)이었으며, 집중 곤란(63.0%), 위축(55.8%), 불안·우울(51.5%) 등이 보고되었다.",keywords:["감정노동","콜센터","요구조사","모듈형 프로그램","소진 예방"] },
  "성범죄자의 일탈적 성 선호에 대한 행동치료의 효과성 검증": { journal:"교정담론",year:"2025",authors:"<strong>최재광</strong>, 한지현, 곽승철, 차유진, 김설환, 송원영. 교정담론, 19(3), 1-39.",abstract:"이 연구는 행동치료가 일탈적 성 선호를 가진 성범죄자에게 미치는 심리 및 행동적 효과를 탐색하고, 성범죄자에 대한 행동치료의 적용 가능성을 검토하고자 진행하였다.",keywords:["성범죄","일탈적 성 선호","행동치료","응혐기법","교정심리"] },
  "교정시설 심리치료 프로그램 과정등급 구분에 따른 성범죄 재범 비교": { journal:"교정담론",year:"2025",authors:"차유진, <strong>최재광</strong>, 송원영. 교정담론, 19(2), 149-178.",abstract:"이 연구는 교정시설에서 시행 중인 성범죄자 심리치료 프로그램의 과정 등급별 재범 양상을 실증적으로 분석하였다.",keywords:["교정시설","성범죄","재범","심리치료 프로그램","과정등급"] },
  "콜센터 상담원의 감정노동과 경험회피 군집유형에 따른 정신건강의 차이": { journal:"상담학연구",year:"2025",authors:"신은미, <strong>최재광</strong>, 송원영. 상담학연구, 26(1), 179-200.",abstract:"이 연구는 콜센터 상담원의 감정노동과 경험회피에 따른 군집을 분류하고, 각 군집의 정신건강 차이를 분석하여 상담학적 시사점을 제안하고자 진행하였다.",keywords:["감정노동","경험회피","잠재프로파일분석","정신건강","직무소진"] },
  "성인 전환기를 경험하는 청소년의 개인발달요인과 발달환경요인과의 관계: 네트워크 분석을 중심으로": { journal:"한국청소년연구",year:"2025",authors:"정춘헌, <strong>최재광</strong>. 한국청소년연구, 36(3), 165-191.",abstract:"이 연구는 후기 청소년의 발달 네트워크를 분석하여 성인기로 전환하는 과정에서 영향을 미치는 발달요인을 탐색하였다.",keywords:["성인전환기","청소년","발달요인","네트워크 분석","한국아동청소년패널"] },
  "코로나-19 팬데믹 상황 속 자살 고위험 청소년의 생태요인 네트워크 분석과 자살사고예측 머신러닝연구": { journal:"한국청소년연구",year:"2025",authors:"정춘헌, <strong>최재광</strong>. 한국청소년연구, 36(4), 111-145.",abstract:"이 연구는 코로나19 팬데믹 상황 속에서 발달하고 있는 청소년의 자살사고를 탐색하고, 자살사고 고위험군의 특징을 탐색하기 위해 진행되었다.",keywords:["코로나19","자살","청소년","네트워크 분석","머신러닝","XGBoost"] },
  "불안정 애착유형과 SNS 정서전염이 간접외상에 미치는 영향: 10.29 (이태원) 참사를 중심으로": { journal:"한국심리학회지: 건강",year:"2024",authors:"<strong>최재광</strong>, 김해솔, 신은미, 송원영. 한국심리학회지: 건강, 29(5), 765-785.",abstract:"이 연구는 한국의 성인을 대상으로 10.29 참사와 관련된 SNS정보를 접촉하였을 때 애착유형에 따라 발생할 수 있는 정서전염과 간접외상과의 관계를 확인하였다.",keywords:["불안정 애착","SNS","정서전염","간접외상","이태원 참사","재난심리"] },
  "경계선 성격 경향성과 강박적 성행동과의 관계: 지각된 스트레스와 부정 긴급성의 매개효과": { journal:"한국심리학회지: 건강",year:"2023",authors:"<strong>최재광</strong>, 한지현, 송원영. 한국심리학회지: 건강, 28(6), 1213-1229.",abstract:"이 연구는 성인을 대상으로 경계선 성격 경향성과 강박적 성행동과의 관계를 확인하고 지각된 스트레스와 부정긴급성의 매개효과를 검증하였다.",keywords:["경계선 성격","강박적 성행동","지각된 스트레스","부정 긴급성","매개효과"] },
  "한국판 노모포비아 척도 타당화": { journal:"한국심리학회지: 건강",year:"2023",authors:"<strong>최재광</strong>, 한지현, 김민범, 송원영. 한국심리학회지: 건강, 28(2), 581-600.",abstract:"이 연구는 성인을 대상으로 노모포비아를 소개하고 Yildirim과 Correia(2015)가 개발한 노모포비아 척도를 타당화하기 위해 진행하였다.",keywords:["노모포비아","NMP-Q","척도 타당화","스마트폰 의존","요인분석"] },
  "콜센터 상담원의 불확실성에 대한 인내력 부족이 정신건강 문제에 미치는 영향": { journal:"한국심리학회지: 건강",year:"2023",authors:"임소희, <strong>최재광</strong>, 송원영. 한국심리학회지: 건강, 28(2), 329-351.",abstract:"이 연구는 콜센터 상담원의 불확실성에 대한 인내력 부족과 정신건강 문제의 관계에서 부적응적 인지적 정서조절전략과 내면화된 수치심의 연속매개효과를 검증하였다.",keywords:["불확실성 인내력 부족","경험회피","콜센터","정신건강","직무소진"] },
  "도농복합지역 가정 및 학교 밖 청소년의 위기 경험에 대한 현상학적 연구": { journal:"발달지원연구",year:"2023",authors:"<strong>최재광</strong>, 한지현, 이유경, 송원영. 발달지원연구, 12(1), 21-50.",abstract:"이 연구는 도농복합지역의 가정 및 학교 밖 청소년의 위기과정과 경험을 이해하고 경험에 따른 개입을 제공하기 위한 근거를 마련하기 위해 진행되었다.",keywords:["위기청소년","도농복합지역","학교 밖 청소년","현상학적 연구","질적연구"] },
  "고등학생의 불확실성에 대한 인내력 부족이 정신건강 문제에 미치는 영향": { journal:"청소년상담연구",year:"2023",authors:"<strong>최재광</strong>, 임소희, 송원영. 청소년상담연구, 31(2), 47-69.",abstract:"본 연구는 불확실성에 대한 인내력 부족(IU)이 정신건강 문제에 미치는 영향에서 경험회피를 통한 부정 긴급성의 조절된 매개효과를 검증하였다.",keywords:["불확실성 인내력 부족","경험회피","부정 긴급성","조절된 매개","청소년"] },
  "한국판 퍼빙 척도 (PS-K) 의 타당화": { journal:"발달지원연구",year:"2022",authors:"김민범, <strong>최재광</strong>, 송원영. 발달지원연구, 11(1), 15-40.",abstract:"이 연구는 스마트폰으로 인해 나타나는 역기능 문제인 퍼빙(phubbing) 행동을 측정하는 척도를 번안 및 타당화하였다.",keywords:["퍼빙","Phubbing","척도 타당화","스마트폰","대인관계"] },
  "위기청소년과 청소년복지시설 실무자 요구조사를 통한 지역사회기반 지원방안": { journal:"발달지원연구",year:"2022",authors:"한지현, <strong>최재광</strong>, 이유경, 송원영. 발달지원연구, 11(2), 75-94.",abstract:"이 연구는 위기청소년과 청소년복지시설 실무자의 의견을 바탕으로 지역사회 위기청소년 지원방안에 대한 실태를 확인하였다.",keywords:["위기청소년","청소년복지시설","요구조사","지역사회","포커스그룹"] },
  "어둠의 성격 4요소와 외로움 및 분노의 관계: 공감의 매개효과를 중심으로": { journal:"상담심리교육복지",year:"2022",authors:"유정아, <strong>최재광</strong>, 송원영. 상담심리교육복지, 7-29.",abstract:"이 연구는 어둠의 성격으로 나타나게 되는 분노와 외로움과의 관계를 공감의 매개를 통해 확인하였다.",keywords:["어둠의 성격","나르시시즘","사이코패시","공감","분노"] },
  "청소년의 코로나19 스트레스가 자살사고에 미치는 영향": { journal:"청소년상담연구",year:"2022",authors:"<strong>최재광</strong>, 임소희, 송원영. 청소년상담연구, 30(2), 239-264.",abstract:"이 연구는 한국의 청소년을 대상으로 코로나19 스트레스와 자살사고와의 관계에서 부적응적 인지적정서조절전략과 정신건강의 연속매개효과를 확인하였다.",keywords:["코로나19","청소년","자살사고","인지적 정서조절","매개효과"] },
  "직장에서의 정당한 성평등에 대한 믿음 척도의 개발 및 타당화": { journal:"한국심리학회지: 일반",year:"2021",authors:"<strong>최재광</strong>, 유제근, 송원영. 한국심리학회지: 일반, 40(2), 155-185.",abstract:"이 연구는 직장 내에서 측정할 수 있는 신뢰롭고 타당한 성평등 믿음 척도를 개발하기 위해 진행하였다.",keywords:["성평등","척도 개발","직장","타당화","성 편견"] },
  "청소년 절도비행의 심리적 특성과 개입": { journal:"발달지원연구",year:"2021",authors:"장혜민, <strong>최재광</strong>, 이유경, 송원영. 발달지원연구, 10(2), 19-40.",abstract:"이 연구는 국내·외 청소년 절도비행과 관련된 문헌의 분석을 통해 절도비행청소년의 심리적 특성과 개입 방안에 대해 탐색 및 종합하였다.",keywords:["청소년 비행","절도","충동성","자기통제","비행 예방"] },
  "청소년 절도비행 재범방지 프로그램 개선을 위한 실무자 요구조사 연구": { journal:"JCIT",year:"2021",authors:"<strong>최재광</strong>, 장혜민, 이유경, 송원영. JCIT, 11(9), 145-156.",abstract:"이 연구는 청소년 재범방지 프로그램을 진행하는 실무자의 요구를 바탕으로 기존의 프로그램을 개선하기 위해 수행하였다.",keywords:["청소년 비행","절도","재범방지","요구조사","실무자"] },
  "대학생을 위한 인지행동치료 기반 우울관리 프로그램의 개발과 효과성 검증": { journal:"발달지원연구",year:"2021",authors:"<strong>최재광</strong>, 송원영. 발달지원연구, 10(3), 91-111.",abstract:"이 연구는 우울을 관리하기 위해 사회부과적 완벽주의, 불확실성에 대한 인내력 부족(IU)과 반추에 초점을 둔 프로그램을 개발하고 그 효과를 검증하였다.",keywords:["우울","인지행동치료","대학생","완벽주의","집단상담"] },
  "사회부과적 완벽주의와 불확실성에 대한 인내력 부족이 우울에 미치는 영향: 경험회피의 매개효과": { journal:"한국심리학회지: 건강",year:"2020",authors:"<strong>최재광</strong>, 오예람, 송원영. 한국심리학회지: 건강, 25(4), 737-756.",abstract:"이 연구는 사회부과적 완벽주의와 불확실성에 대한 인내력 부족이 경험회피를 매개로 우울에 미치는 영향을 검증하였다.",keywords:["사회부과적 완벽주의","불확실성 인내력 부족","경험회피","우울","매개효과"] },
  "대학생의 사회부과적 완벽주의가 우울에 미치는 영향: 불확실성에 대한 인내력 부족과 반추적·반성적 반응양식의 매개효과": { journal:"한국심리학회지: 학교",year:"2020",authors:"<strong>최재광</strong>, 송원영. 한국심리학회지: 학교, 17(2), 199-222.",abstract:"이 연구는 사회부과적 완벽주의가 불확실성에 대한 인내력 부족과 반추적·반성적 반응양식을 매개로 우울에 미치는 영향을 검증하였다.",keywords:["사회부과적 완벽주의","불확실성 인내력 부족","반추","우울","이중매개"] },
  "부적응 병사를 위한 인지행동치료 및 수용전념치료 집단상담 프로그램 개발 및 효과 검증": { journal:"융합정보논문지",year:"2020",authors:"조주성, <strong>최재광</strong>, 강요한, 유한별, 송원영. 융합정보논문지, 10(11), 224-231.",abstract:"본 연구는 국군 장병들의 부적응 문제 해결을 위한 집단상담 프로그램을 개발하고 효과를 검증하였다.",keywords:["군 부적응","인지행동치료","수용전념치료","집단상담","심리적 유연성"] },
  "초등학생 문제행동선별척도: 교사용 (CPBS-E) 의 개발과 타당화": { journal:"한국심리학회지: 학교",year:"2019",authors:"송원영, 장은진, 최가영, <strong>최재광</strong>, 조광순, 원성두, 한미령. 한국심리학회지: 학교, 16(3), 433-451.",abstract:"이 연구는 한국의 초등학교 내에서 발생하는 문제행동을 측정할 수 있는 신뢰롭고 타당한 척도를 개발하였다.",keywords:["초등학생","문제행동","교사 평정","척도 개발","행동선별"] },
  "대학생의 사회부과적 완벽주의가 우울에 미치는 영향: 불확실성에 대한 인내력부족과 무조건적 자기수용의 매개효과를 중심으로": { journal:"융합정보논문지",year:"2018",authors:"<strong>최재광</strong>, 송원영. 융합정보논문지, 8(3), 183-191.",abstract:"본 연구는 사회부과적 완벽주의가 불확실성에 대한 인내력 부족과 무조건적 자기수용을 매개로 우울에 미치는 영향을 검증하였다.",keywords:["사회부과적 완벽주의","불확실성 인내력 부족","무조건적 자기수용","우울","대학생"] },
};

const PAPER_YEARS: { year: string; titles: string[] }[] = [
  { year: "2026", titles: ["콜센터 상담원의 감정노동 관리를 위한 요구조사 기반의 모듈형 프로그램 제안"] },
  { year: "2025", titles: ["성범죄자의 일탈적 성 선호에 대한 행동치료의 효과성 검증","교정시설 심리치료 프로그램 과정등급 구분에 따른 성범죄 재범 비교","콜센터 상담원의 감정노동과 경험회피 군집유형에 따른 정신건강의 차이","성인 전환기를 경험하는 청소년의 개인발달요인과 발달환경요인과의 관계: 네트워크 분석을 중심으로","코로나-19 팬데믹 상황 속 자살 고위험 청소년의 생태요인 네트워크 분석과 자살사고예측 머신러닝연구"] },
  { year: "2024", titles: ["불안정 애착유형과 SNS 정서전염이 간접외상에 미치는 영향: 10.29 (이태원) 참사를 중심으로"] },
  { year: "2023", titles: ["경계선 성격 경향성과 강박적 성행동과의 관계: 지각된 스트레스와 부정 긴급성의 매개효과","한국판 노모포비아 척도 타당화","콜센터 상담원의 불확실성에 대한 인내력 부족이 정신건강 문제에 미치는 영향","도농복합지역 가정 및 학교 밖 청소년의 위기 경험에 대한 현상학적 연구","고등학생의 불확실성에 대한 인내력 부족이 정신건강 문제에 미치는 영향"] },
  { year: "2022", titles: ["한국판 퍼빙 척도 (PS-K) 의 타당화","위기청소년과 청소년복지시설 실무자 요구조사를 통한 지역사회기반 지원방안","어둠의 성격 4요소와 외로움 및 분노의 관계: 공감의 매개효과를 중심으로","청소년의 코로나19 스트레스가 자살사고에 미치는 영향"] },
  { year: "2021", titles: ["직장에서의 정당한 성평등에 대한 믿음 척도의 개발 및 타당화","청소년 절도비행의 심리적 특성과 개입","청소년 절도비행 재범방지 프로그램 개선을 위한 실무자 요구조사 연구","대학생을 위한 인지행동치료 기반 우울관리 프로그램의 개발과 효과성 검증"] },
  { year: "2020", titles: ["사회부과적 완벽주의와 불확실성에 대한 인내력 부족이 우울에 미치는 영향: 경험회피의 매개효과","대학생의 사회부과적 완벽주의가 우울에 미치는 영향: 불확실성에 대한 인내력 부족과 반추적·반성적 반응양식의 매개효과","부적응 병사를 위한 인지행동치료 및 수용전념치료 집단상담 프로그램 개발 및 효과 검증"] },
  { year: "2019", titles: ["초등학생 문제행동선별척도: 교사용 (CPBS-E) 의 개발과 타당화"] },
  { year: "2018", titles: ["대학생의 사회부과적 완벽주의가 우울에 미치는 영향: 불확실성에 대한 인내력부족과 무조건적 자기수용의 매개효과를 중심으로"] },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("papers");
  const [modalTitle, setModalTitle] = useState<string | null>(null);

  const modalData = modalTitle ? PAPERS[modalTitle] : null;

  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{`
          .page-hero{background:linear-gradient(140deg,#0a1830 0%,#132347 45%,#1c3460 100%);padding:110px 5% 70px;text-align:center;position:relative;overflow:hidden;}
          .page-hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;}
          .page-hero-tag{display:inline-block;background:rgba(78,157,224,.15);border:1px solid rgba(78,157,224,.35);color:var(--bs-accent);font-size:.78rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:.38rem 1.1rem;border-radius:100px;margin-bottom:1.2rem;}
          .page-hero h1{font-size:clamp(1.9rem,4vw,2.9rem);color:#fff;font-weight:800;line-height:1.3;margin-bottom:.9rem;}
          .page-hero p{color:rgba(255,255,255,.72);font-size:1.05rem;max-width:580px;margin:0 auto;}
          .stat-row{display:flex;justify-content:center;margin-top:2.8rem;border-top:1px solid rgba(255,255,255,.1);padding-top:2.2rem;flex-wrap:wrap;gap:2.5rem;}
          .hero-stat .stat-num{font-size:2rem;font-weight:800;color:var(--bs-accent);line-height:1;}
          .hero-stat .stat-label{font-size:.8rem;color:rgba(255,255,255,.55);margin-top:.3rem;}
          .tabs-section{background:var(--bs-white);border-bottom:1px solid var(--bs-border);position:sticky;top:64px;z-index:100;}
          .tabs-inner{max-width:1100px;margin:0 auto;display:flex;overflow-x:auto;padding:0 5%;}
          .tab-btn{padding:1.1rem 1.6rem;font-size:.9rem;font-weight:700;color:var(--bs-muted);background:none;border:none;border-bottom:3px solid transparent;cursor:pointer;font-family:inherit;transition:color .2s,border-color .2s;white-space:nowrap;}
          .tab-btn:hover{color:var(--bs-navy);}
          .tab-btn.active{color:var(--bs-navy);border-bottom-color:var(--bs-accent);}
          .tab-count{display:inline-block;background:var(--bs-light-blue);color:var(--bs-blue);font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:100px;margin-left:.45rem;}
          .content-area{padding:60px 5% 80px;max-width:1100px;margin:0 auto;}
          .paper-year-group{margin-bottom:2.5rem;}
          .year-label{font-size:.78rem;font-weight:800;letter-spacing:2px;color:var(--bs-accent);text-transform:uppercase;margin-bottom:1rem;display:flex;align-items:center;gap:.8rem;}
          .year-label::after{content:'';flex:1;height:1px;background:var(--bs-border);}
          .paper-card{background:var(--bs-white);border-radius:14px;border:1px solid var(--bs-border);padding:1.4rem 1.7rem;margin-bottom:.9rem;transition:box-shadow .2s,transform .2s;cursor:pointer;}
          .paper-card:hover{box-shadow:0 6px 22px rgba(26,47,94,.1);transform:translateY(-2px);}
          .paper-meta{display:flex;align-items:center;gap:.6rem;margin-bottom:.55rem;flex-wrap:wrap;}
          .paper-journal{background:var(--bs-light-blue);color:var(--bs-blue);font-size:.72rem;font-weight:700;padding:.22rem .75rem;border-radius:100px;}
          .paper-year-tag{background:#f1f5f9;color:var(--bs-muted);font-size:.72rem;font-weight:600;padding:.22rem .7rem;border-radius:100px;}
          .paper-title{font-size:.97rem;font-weight:700;color:var(--bs-navy);line-height:1.55;margin-bottom:.45rem;}
          .paper-authors{font-size:.84rem;color:var(--bs-muted);}
          .paper-authors strong{color:var(--bs-blue);}
          .project-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.3rem;}
          .project-card{background:var(--bs-white);border-radius:16px;border:1px solid var(--bs-border);padding:1.6rem 1.8rem;transition:box-shadow .2s,transform .2s;}
          .project-card:hover{box-shadow:0 8px 24px rgba(26,47,94,.1);transform:translateY(-3px);}
          .project-period{font-size:.75rem;font-weight:700;color:var(--bs-accent);letter-spacing:.5px;margin-bottom:.55rem;}
          .project-title{font-size:1rem;font-weight:700;color:var(--bs-navy);margin-bottom:.65rem;line-height:1.5;}
          .project-meta{display:flex;gap:.5rem;flex-wrap:wrap;}
          .project-role{background:var(--bs-light-blue);color:var(--bs-blue);font-size:.75rem;font-weight:700;padding:.2rem .8rem;border-radius:100px;}
          .project-org{background:#f1f5f9;color:var(--bs-muted);font-size:.75rem;font-weight:600;padding:.2rem .8rem;border-radius:100px;}
          @media(max-width:680px){.project-grid{grid-template-columns:1fr;}}
          .conf-list{display:flex;flex-direction:column;gap:1.1rem;}
          .conf-card{background:var(--bs-white);border-radius:14px;border:1px solid var(--bs-border);padding:1.3rem 1.7rem;display:grid;grid-template-columns:72px 1fr;gap:1.2rem;align-items:start;transition:box-shadow .2s;}
          .conf-card:hover{box-shadow:0 6px 20px rgba(26,47,94,.09);}
          .conf-year-box{background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue));color:#fff;border-radius:10px;text-align:center;padding:.6rem .4rem;}
          .conf-year-box .cy{font-size:1.15rem;font-weight:800;line-height:1;}
          .conf-year-box .ct{font-size:.7rem;opacity:.75;margin-top:.2rem;}
          .conf-type{display:inline-block;margin-bottom:.45rem;font-size:.72rem;font-weight:700;padding:.2rem .75rem;border-radius:100px;}
          .conf-type.intl{background:#fef3c7;color:#92400e;}
          .conf-type.dom{background:var(--bs-light-blue);color:var(--bs-blue);}
          .conf-title{font-size:.95rem;font-weight:700;color:var(--bs-navy);margin-bottom:.4rem;line-height:1.5;}
          .conf-venue{font-size:.84rem;color:var(--bs-muted);}
          .conf-format{font-size:.78rem;color:var(--bs-accent);font-weight:600;margin-top:.3rem;}
          .inst-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;}
          .inst-card{background:var(--bs-white);border-radius:16px;border:1px solid var(--bs-border);padding:1.8rem 1.6rem;text-align:center;transition:transform .25s,box-shadow .25s;}
          .inst-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(26,47,94,.1);}
          .inst-icon{width:60px;height:60px;border-radius:14px;background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue));display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto 1rem;box-shadow:0 6px 16px rgba(26,47,94,.2);}
          .inst-card h4{color:var(--bs-navy);font-size:.95rem;font-weight:700;margin-bottom:.4rem;line-height:1.4;}
          .inst-card p{color:var(--bs-muted);font-size:.82rem;line-height:1.7;}
          @media(max-width:680px){.inst-grid{grid-template-columns:repeat(2,1fr);}}
          .edu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.3rem;}
          .edu-card{background:var(--bs-white);border-radius:16px;border:1px solid var(--bs-border);padding:1.8rem 1.6rem;transition:transform .25s,box-shadow .25s;}
          .edu-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(26,47,94,.1);}
          .edu-icon{font-size:2rem;margin-bottom:.8rem;}
          .edu-card h4{color:var(--bs-navy);font-size:1rem;font-weight:700;margin-bottom:.6rem;}
          .edu-card p{color:var(--bs-muted);font-size:.87rem;line-height:1.75;}
          .edu-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.9rem;}
          .edu-tag{background:var(--bs-light-blue);color:var(--bs-blue);font-size:.72rem;font-weight:600;padding:.2rem .75rem;border-radius:100px;}
          @media(max-width:680px){.edu-grid{grid-template-columns:1fr;}}
          .modal-overlay{display:none;position:fixed;inset:0;background:rgba(10,18,40,.75);z-index:2000;align-items:center;justify-content:center;padding:1.5rem;backdrop-filter:blur(4px);}
          .modal-overlay.open{display:flex;}
          .modal-box{background:#fff;border-radius:20px;max-width:680px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.35);position:relative;}
          .modal-header{background:linear-gradient(140deg,var(--bs-navy),#1e4080);padding:1.8rem 2rem 1.4rem;border-radius:20px 20px 0 0;position:sticky;top:0;z-index:10;}
          .modal-close{position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,.15);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;}
          .modal-close:hover{background:rgba(255,255,255,.28);}
          .modal-meta{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;}
          .modal-journal{background:rgba(78,157,224,.25);color:#a8d4f5;font-size:.72rem;font-weight:700;padding:.22rem .75rem;border-radius:100px;}
          .modal-year-tag{background:rgba(255,255,255,.12);color:rgba(255,255,255,.7);font-size:.72rem;font-weight:600;padding:.22rem .7rem;border-radius:100px;}
          .modal-title-text{font-size:1.05rem;font-weight:800;color:#fff;line-height:1.55;}
          .modal-body{padding:1.8rem 2rem;}
          .modal-authors{font-size:.88rem;color:var(--bs-muted);margin-bottom:1.4rem;line-height:1.6;}
          .modal-authors strong{color:var(--bs-blue);}
          .modal-section-label{font-size:.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bs-accent);margin-bottom:.6rem;}
          .modal-abstract{font-size:.9rem;color:var(--bs-text);line-height:1.95;margin-bottom:1.5rem;}
          .modal-keywords{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:1.5rem;}
          .modal-keyword{background:var(--bs-light-blue);color:var(--bs-blue);font-size:.74rem;font-weight:600;padding:.22rem .75rem;border-radius:100px;}
          .modal-kci-note{background:var(--bs-bg);border-radius:10px;padding:.9rem 1.1rem;font-size:.82rem;color:var(--bs-muted);border-left:3px solid var(--bs-accent);}
        `}</style>

        <div className="page-hero">
          <div className="page-hero-tag">Portfolio</div>
          <h1>연구 및 포트폴리오</h1>
          <p>최재광 박사를 중심으로 축적된 학술 연구 성과와<br />기관 협력 활동을 소개합니다.</p>
          <div className="stat-row">
            <div className="hero-stat"><div className="stat-num">25+</div><div className="stat-label">KCI 등재 논문</div></div>
            <div className="hero-stat"><div className="stat-num">9</div><div className="stat-label">정부 연구과제</div></div>
            <div className="hero-stat"><div className="stat-num">6</div><div className="stat-label">학술대회 발표</div></div>
            <div className="hero-stat"><div className="stat-num">6</div><div className="stat-label">협력 기관</div></div>
          </div>
        </div>

        <div className="tabs-section">
          <div className="tabs-inner">
            {([["papers","학술 논문","25"],["projects","정부 연구과제","9"],["conferences","학술대회 발표","6"],["institutions","기관 협력","6"],["education","교육 프로그램",""]] as [TabKey, string, string][]).map(([key, label, count]) => (
              <button key={key} className={`tab-btn${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
                {label}{count && <span className="tab-count">{count}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="content-area">
          {activeTab === "papers" && (
            <div>
              {PAPER_YEARS.map(({ year, titles }) => (
                <div key={year} className="paper-year-group">
                  <div className="year-label">{year}</div>
                  {titles.map((title) => {
                    const d = PAPERS[title];
                    if (!d) return null;
                    return (
                      <div key={title} className="paper-card" onClick={() => setModalTitle(title)}>
                        <div className="paper-meta">
                          <span className="paper-journal">{d.journal}</span>
                          <span className="paper-year-tag">{d.year}</span>
                        </div>
                        <div className="paper-title">{title}</div>
                        <div className="paper-authors" dangerouslySetInnerHTML={{ __html: d.authors }} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="project-grid">
              {[
                { year:"2024", title:"일탈적 성 선호에 대한 행동치료 프로그램 개발", role:"연구원", org:"법무부" },
                { year:"2022", title:"사회적 약자 가드닝 프로그램 운영 (우울 및 스트레스)", role:"연구보조", org:"산림청" },
                { year:"2021", title:"성폭력사범 심리치료 효과성 평가를 위한 척도 개발", role:"연구원", org:"법무부" },
                { year:"2021", title:"충남지역 가출 등 위기청소년 실태와 지원방안", role:"연구원", org:"충청남도 도의회" },
                { year:"2021", title:"하동군 청년의 만남을 위한 ALPS 검사", role:"연구원", org:"페어립에듀" },
                { year:"2020", title:"청소년 절도예방 통합 프로그램 개발", role:"연구보조", org:"법무부 범죄예방정책국" },
                { year:"2019", title:"한국형 학교차원의 긍정적 행동지원 모형개발과 실행", role:"연구보조", org:"한국연구재단" },
                { year:"2018", title:"영화를 활용한 가치찾기 교재 및 강의안 개발", role:"연구보조", org:"병무청 사회복무연수센터" },
                { year:"2017", title:"후견사건에서의 친족 후견인 심리상담 지원 프로그램 개발", role:"연구보조", org:"법무부" },
              ].map((p, i) => (
                <div key={i} className="project-card">
                  <div className="project-period">{p.year}</div>
                  <div className="project-title">{p.title}</div>
                  <div className="project-meta"><span className="project-role">{p.role}</span><span className="project-org">{p.org}</span></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "conferences" && (
            <div className="conf-list">
              {[
                { year:"2025", type:"dom", title:"학교폭력 가해경험자의 시기별 발달요인 탐색: 머신러닝 예측과 네트워크 분석을 통한 다층 개입방안", venue:"제14회 한국아동·청소년패널 학술대회", format:"논문 발표" },
                { year:"2024", type:"dom", title:"아동 및 청소년의 행복에 따른 개인발달 및 발달환경의 네트워크", venue:"제13회 한국아동·청소년패널 학술대회", format:"논문 발표" },
                { year:"2020", type:"dom", title:"정당한 성평등에 대한 믿음 척도 개발 및 타당화 연구", venue:"2020년 한국심리학회 학술대회 서던포스트 특별심포지엄", format:"심포지엄 발표" },
                { year:"2019", type:"intl", title:"Effects of Socially Prescribed Perfectionism and Intolerance of Uncertainty of College Students on Their Depression", venue:"세계인지행동치료학회 (WCBCT)", format:"포스터 발표" },
                { year:"2019", type:"intl", title:"Development and Effectiveness of Depression Management Program Based on Cognitive Behavioral Therapy", venue:"세계인지행동치료학회 (WCBCT)", format:"포스터 발표" },
                { year:"2019", type:"intl", title:"Effect of cognitive Behavioral Therapy and Enhanced cognitive Behavioral Therapy Programs on Korean Soldiers' Maladaptation in Military", venue:"세계인지행동치료학회 (WCBCT)", format:"포스터 발표" },
              ].map((c, i) => (
                <div key={i} className="conf-card">
                  <div className="conf-year-box"><div className="cy">{c.year}</div><div className="ct">{c.type === "dom" ? "국내" : "국제"}</div></div>
                  <div>
                    <span className={`conf-type ${c.type}`}>{c.type === "dom" ? "국내" : "국제"}</span>
                    <div className="conf-title">{c.title}</div>
                    <div className="conf-venue">{c.venue}</div>
                    <div className="conf-format">{c.format}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "institutions" && (
            <div className="inst-grid">
              {[
                { icon:"🏫", name:"충청남도 논산계룡교육지청", desc:"지역 내 학교 대상 심리지원 프로그램 운영 및 교사 연수 협력" },
                { icon:"🏫", name:"대전광역시교육청", desc:"학교폭력 예방 및 위기학생 심리지원 프로그램 연계 협력" },
                { icon:"⚖️", name:"대전교도소", desc:"수용자 심리치료 프로그램 운영 및 재범 예방 개입 협력" },
                { icon:"⚖️", name:"천안교도소", desc:"성범죄 사범 대상 행동치료 프로그램 운영 협력" },
                { icon:"🏥", name:"부여군보건소", desc:"지역사회 정신건강 증진 프로그램 및 주민 심리상담 지원 협력" },
                { icon:"🎓", name:"건양대학교 심리상담치료학과", desc:"학과 내 연구 협력 및 실습생 슈퍼비전, 교육 프로그램 공동 운영" },
              ].map((inst, i) => (
                <div key={i} className="inst-card">
                  <div className="inst-icon">{inst.icon}</div>
                  <h4>{inst.name}</h4>
                  <p>{inst.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="edu-grid">
              {[
                { icon:"💙", title:"자살예방교육", desc:"생명존중 의식 함양 및 자살 위기 신호 인식·대응 능력 향상 교육. QPR, safeTALK 기반 게이트키퍼 훈련 포함.", tags:["학교·기관","게이트키퍼","QPR"] },
                { icon:"🤝", title:"대인관계교육", desc:"건강한 관계 형성과 의사소통 기술 향상을 위한 심리교육 프로그램. 청소년·성인·직장인 대상 맞춤형 구성.", tags:["청소년","성인","직장인"] },
                { icon:"🧘", title:"정서관리교육", desc:"감정인식, 조절, 표현 능력 향상을 위한 DBT 기반 정서조절 심리교육. 스트레스 대처 및 마음챙김 기법 포함.", tags:["DBT","마음챙김","스트레스"] },
              ].map((edu, i) => (
                <div key={i} className="edu-card">
                  <div className="edu-icon">{edu.icon}</div>
                  <h4>{edu.title}</h4>
                  <p>{edu.desc}</p>
                  <div className="edu-tags">{edu.tags.map((t) => <span key={t} className="edu-tag">{t}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalTitle && modalData && (
          <div className="modal-overlay open" onClick={(e) => { if ((e.target as HTMLElement).classList.contains("modal-overlay")) setModalTitle(null); }}>
            <div className="modal-box">
              <div className="modal-header">
                <button className="modal-close" onClick={() => setModalTitle(null)}>✕</button>
                <div className="modal-meta">
                  <span className="modal-journal">{modalData.journal}</span>
                  <span className="modal-year-tag">{modalData.year}</span>
                </div>
                <div className="modal-title-text">{modalTitle}</div>
              </div>
              <div className="modal-body">
                <div className="modal-authors" dangerouslySetInnerHTML={{ __html: modalData.authors }} />
                <div className="modal-section-label">초록 (Abstract)</div>
                <div className="modal-abstract">{modalData.abstract}</div>
                <div className="modal-section-label">주요어 (Keywords)</div>
                <div className="modal-keywords">{modalData.keywords.map((k) => <span key={k} className="modal-keyword">{k}</span>)}</div>
                <div className="modal-kci-note">📌 본 논문은 <strong>KCI (한국학술지인용색인)</strong>에 등재된 학술 논문입니다. 전문 열람은 <strong>DBpia</strong> 또는 <strong>RISS</strong>에서 가능합니다.</div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
