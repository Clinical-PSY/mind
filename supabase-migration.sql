-- ============================================================
-- MindLink DB Migration
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. mindlink_sessions 신규 컬럼 (기존 컬럼 포함 — IF NOT EXISTS로 안전하게 실행)
ALTER TABLE mindlink_sessions
  ADD COLUMN IF NOT EXISTS duration        int  NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS mood_before     int,
  ADD COLUMN IF NOT EXISTS mood_after      int,
  ADD COLUMN IF NOT EXISTS observations    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS counselor_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS homework        text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS session_type    text NOT NULL DEFAULT '대면',
  ADD COLUMN IF NOT EXISTS session_notes   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS soap_s          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS soap_o          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS soap_a          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS soap_p          text NOT NULL DEFAULT '';

-- 기존 observations → soap_o 마이그레이션 (데이터 보존)
UPDATE mindlink_sessions
SET
  soap_o = COALESCE(observations, ''),
  soap_a = COALESCE(counselor_notes, ''),
  soap_p = COALESCE(homework, '')
WHERE soap_o = '' AND (observations IS NOT NULL AND observations <> '');

-- 2. 위험관리 테이블
CREATE TABLE IF NOT EXISTS mindlink_risk_assessments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid        NOT NULL REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  session_id      uuid        REFERENCES mindlink_sessions(id) ON DELETE SET NULL,
  assessed_at     date        NOT NULL DEFAULT CURRENT_DATE,
  suicide_risk    int         NOT NULL DEFAULT 0 CHECK (suicide_risk    BETWEEN 0 AND 3),
  self_harm_risk  int         NOT NULL DEFAULT 0 CHECK (self_harm_risk  BETWEEN 0 AND 3),
  harm_to_others  int         NOT NULL DEFAULT 0 CHECK (harm_to_others  BETWEEN 0 AND 3),
  abuse_report    boolean     NOT NULL DEFAULT false,
  action_taken    text        NOT NULL DEFAULT '',
  notes           text        NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS (service role 전용)
ALTER TABLE mindlink_risk_assessments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'mindlink_risk_assessments' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON mindlink_risk_assessments
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
