-- MindLink AI Clinical Supervision Platform — DB Schema
-- Run in Supabase SQL Editor

CREATE TABLE mindlink_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_username TEXT NOT NULL,
  client_alias TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  presenting_problems TEXT,
  background TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hold', 'closed', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  session_num INTEGER NOT NULL,
  session_date DATE NOT NULL,
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 10),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 10),
  observations TEXT,
  counselor_notes TEXT,
  homework TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  scores JSONB DEFAULT '{}',
  interpretation TEXT,
  raw_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_psych_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL UNIQUE REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  referral_background TEXT,
  test_results_summary TEXT,
  cognitive_function TEXT,
  emotional_personality TEXT,
  interpersonal TEXT,
  expected_diagnosis TEXT,
  treatment_recommendations TEXT,
  summary TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_conceptualizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL UNIQUE REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  problem_structure TEXT,
  cognitive_emotional_behavioral TEXT,
  environmental_contextual TEXT,
  risk_factors JSONB DEFAULT '[]',
  protective_factors JSONB DEFAULT '[]',
  eemm_grid JSONB DEFAULT '{}',
  summary TEXT,
  dsm_considerations TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_interventions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL UNIQUE REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  recommended_theory TEXT,
  short_term_goals JSONB DEFAULT '[]',
  long_term_goals JSONB DEFAULT '[]',
  session_structure TEXT,
  key_techniques JSONB DEFAULT '[]',
  expected_duration TEXT,
  considerations TEXT,
  eemm_interventions JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_supervision_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mindlink_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL UNIQUE REFERENCES mindlink_cases(id) ON DELETE CASCADE,
  overall_progress TEXT,
  goal_achievement JSONB DEFAULT '{}',
  symptom_change TEXT,
  functional_improvement TEXT,
  remaining_challenges JSONB DEFAULT '[]',
  treatment_response TEXT,
  termination_readiness TEXT,
  next_session_focus JSONB DEFAULT '[]',
  clinical_recommendations TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
