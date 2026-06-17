# 심리상담 기록 시스템 개발 WBS (MindLink)

---

## 3. 상담기록 화면 설계

### 3.1 내담자 기본정보 화면 ✅ 완료
- 내담자 가명(별칭) 입력 — 식별정보 비식별화 처리
- 나이 / 성별
- 의뢰경로 (`referral_source`)
- 주호소 문제 (`presenting_problems`)
- 배경 정보 (`background`)
- 사례 상태 (`active` / `hold` / `closed` / `terminated`) — 인라인 수정
- ⬜ 보호자 정보
- ⬜ 동의서 여부

### 3.2 회기기록 작성 화면 ✅ 완료 (일부 ⬜)
- 회기번호 (`session_num` — 자동 부여)
- 상담일시 (`session_date`)
- 기분 척도: 상담 전 / 후 (1~10점)
- 임상 관찰 (`observations`)
- 상담사 메모 (`counselor_notes`)
- 과제 (`homework`)
- 수정 / 삭제 기능
- ⬜ 상담형태 (대면 / 비대면)
- ⬜ 상담시간 (분 단위)
- ⬜ 참여자 정보 (개인 / 가족 / 집단)

### 3.3 상담기록 구조화 템플릿 ⬜ 미구현
> 현재: 비구조화 자유기술(observations / counselor_notes). 아래는 차기 버전 설계.

- **Subjective** — 내담자 진술, 주요 호소 내용, 감정 및 사고 보고
- **Objective** — 행동관찰, 정서상태, 검사 결과 연동, 위험징후 확인
- **Assessment** — 임상적 해석, 사례개념화 요약, 진단적 고려사항, 위험도 평가
- **Plan** — 다음 회기 목표, 개입계획, 과제 부여, 의뢰 여부

### 3.4 심리검사 입력 화면 ✅ 완료 (파일첨부 ⬜)
- **지능검사** — K-WAIS-IV / K-WISC-V / K-ABC-II / 기타 (FSIQ·VCI·VSI·FRI·WMI·PSI)
- **성격검사**
  - MMPI (MMPI-2 / MMPI-2-RF / MMPI-A): 타당도 3척도 + 임상 10척도 T점수
  - TCI-RS: 기질 4척도 + 성격 3척도 T점수
  - 기타: 자유 척도명·점수 추가
- **투사검사**
  - 로르샤하: 반응별 코딩(카드·위치·DQ·결정인·FQ·쌍·내용·P·Z점수·특수점수) + Exner CS 구조적 요약 자동 계산
  - SCT (문장완성검사): 주요 반응 자유기술
  - HTP: 집·나무·사람 관찰 분리 기술
  - 기타 투사검사
- **신경심리검사** — K-MoCA / MMSE / TMT / Stroop / WMS / RCFT / BGT / 기타 (원점수·표준점수·백분위)
- **기타검사** — BDI-II / BAI / PCL-5 등 자유기술
- 검사 결과 수정 / 삭제
- ⬜ 파일 업로드 (PDF 결과지, 이미지)
- ⬜ 동의서 첨부

**산출물**
- 화면설계서 (구현 UI 기준)
- 입력항목 정의서 (DB 컬럼 매핑 포함)

---

## 4. 데이터베이스 설계

### 4.1 내담자 테이블 `mindlink_cases` ✅ 완료

| 컬럼 | 설명 |
|------|------|
| `id` | UUID PK |
| `counselor_username` | 담당 상담사 |
| `client_alias` | 내담자 가명 |
| `age` | 나이 |
| `gender` | 성별 |
| `referral_source` | 의뢰경로 |
| `presenting_problems` | 주호소 |
| `background` | 배경 정보 |
| `status` | active / hold / closed / terminated |
| `psych_report` | AI 심리검사 보고서 (JSON) |
| `case_concept` | AI 사례개념화 (JSON) |
| `intervention_plan` | AI 개입전략 (JSON) |
| `outcome_data` | AI 성과분석 (JSON) |
| `created_at` / `updated_at` | 타임스탬프 |

### 4.2 상담회기 테이블 `mindlink_sessions` ✅ 완료

| 컬럼 | 설명 |
|------|------|
| `id` | UUID PK |
| `case_id` | FK → mindlink_cases |
| `session_num` | 회기번호 |
| `session_date` | 상담일 |
| `mood_before` / `mood_after` | 기분 척도 1~10 |
| `observations` | 임상 관찰 |
| `counselor_notes` | 상담사 메모 |
| `homework` | 과제 |
| `created_at` / `updated_at` | 타임스탬프 |
| ⬜ `session_type` | 대면 / 비대면 |
| ⬜ `duration` | 상담시간(분) |
| ⬜ `participants` | 참여자 유형 |

### 4.3 상담기록 구조화 ⬜ 미구현
> 차기 버전에서 SOAP 구조로 분리 예정

| 컬럼 | 설명 |
|------|------|
| `subjective` | 내담자 진술 |
| `objective` | 행동관찰 |
| `assessment` | 임상 해석 |
| `plan` | 치료계획 |

### 4.4 심리검사 테이블 `mindlink_tests` ✅ 완료

| 컬럼 | 설명 |
|------|------|
| `id` | UUID PK |
| `case_id` | FK → mindlink_cases |
| `category` | 지능 / 성격 / 투사 / 신경심리 / 기타 |
| `sub_type` | MMPI / TCI / SCT / 로르샤하 / HTP 등 |
| `test_name` | 구체적 검사명 |
| `test_date` | 실시일 |
| `scores` | 점수 (JSON) |
| `raw_data` | 원자료 (로르샤하 반응코딩 JSON 등) |
| `interpretation` | 해석 및 소견 |
| `created_at` / `updated_at` | 타임스탬프 |
| ⬜ `attachments` | 첨부파일 URL 배열 |

### 4.5 위험관리 테이블 ⬜ 미구현

| 컬럼 | 설명 |
|------|------|
| `suicide_risk` | 자살위험 (0~3 단계) |
| `self_harm_risk` | 자해위험 |
| `harm_to_others` | 타해위험 |
| `abuse_report` | 학대 신고 여부 |
| `action_taken` | 취해진 조치 |

**산출물**
- ERD
- 데이터 사전 (Data Dictionary)

---

## 5. 기능 개발

### 5.1 내담자 관리
- ✅ 등록 (가명, 나이, 성별, 의뢰경로, 주호소, 배경)
- ✅ 수정 (상태 변경 — 인라인 드롭다운)
- ⬜ 상세 정보 수정 (나이·성별·주호소 등 편집 모달)
- ⬜ 검색 (이름·상태·날짜 필터)
- ⬜ 페이지네이션

### 5.2 상담기록 관리
- ✅ 회기 작성
- ✅ 회기 수정 / 삭제
- ⬜ 임시저장 (로컬스토리지 초안 보관)
- ⬜ 자동저장 (입력 후 30초 debounce)
- ⬜ 회기 복사 (이전 회기 구조 재사용)

### 5.3 심리검사 관리
- ✅ 5개 카테고리 검사 입력
- ✅ 로르샤하 반응코딩 + Exner CS 자동 계산 (PTI·DEPI·CDI·S-CON·HVI·OBS 포함)
- ✅ 검사 수정 / 삭제
- ⬜ 파일 업로드 (Supabase Storage 연동)

### 5.4 AI 임상 지원 모듈 ✅ 완료
- ✅ Module 2: 심리검사 통합 보고서 (AI 자동 생성)
- ✅ Module 3: EEMM 사례개념화 (6차원 분석)
- ✅ Module 4: 개입전략 설계 (EEMM 매핑)
- ✅ Module 5: AI 슈퍼비전 (스트리밍 대화)
- ✅ Module 6: 성과 분석 (치료 진척도)

### 5.5 사례관리 기능
- ⬜ 치료 목표 설정 및 추적
- ⬜ 종결 보고서 생성
- ⬜ 사례 이관

### 5.6 검색 기능
- ⬜ 내담자 검색 (가명·상태)
- ⬜ 회기 검색 (날짜 범위)
- ⬜ 키워드 전문 검색

### 5.7 출력 기능
- ⬜ 상담기록 PDF 출력
- ⬜ 심리검사 보고서 PDF 출력
- ⬜ 사례회의용 요약 출력
- ⬜ 로르샤하 구조적 요약 인쇄

---

## 6. 보안 및 개인정보 보호

### 6.1 접근권한 관리
- ✅ `admin` — 전체 사례 조회 및 관리
- ✅ `subscriber` — 본인 사례만 조회·수정
- ⬜ `trainee` (수련생) — 지도감독 사례 한정 접근
- ⬜ 읽기전용 사용자 (외부 자문용)

### 6.2 개인정보 보호
- ✅ JWT 기반 인증 (jose, 서버사이드 검증)
- ✅ 내담자 가명처리 (실명 미저장 원칙)
- ✅ Service Role Key 서버 전용 격리 (`src/lib/supabase.ts`)
- ⬜ 접속 로그 기록
- ⬜ 개인정보 마스킹 (일부 항목 표시 제한)
- ⬜ 데이터 내보내기 감사 로그

### 6.3 법적 준수
- ⬜ 개인정보보호법 적합성 검토
- ⬜ 의료법 / 상담 윤리강령 검토
- ⬜ 전자문서 보관 기준 확인 (최소 5년)
- ⬜ 개인정보 처리방침 고지 페이지

**산출물**
- 보안정책 문서
- 개인정보 처리방침

---

**범례:** ✅ 완료 · ⬜ 미구현
