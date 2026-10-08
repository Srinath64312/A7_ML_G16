export type TrackType = 'math' | 'cs';

export type PolicyType = 'Q-Learning' | 'DQN' | 'Rule-Based' | 'Random' | 'Fixed-Difficulty';

export interface TopicGroup {
  name: string;
  description: string;
  topics: string[];
}

export interface TopicsApiResponse {
  tracks: {
    math: TopicGroup;
    cs: TopicGroup;
  };
  all_topics: string[];
}

export interface StartSessionResponse {
  session_id: string;
  topic: string;
  question: string;
  choices: string[];
  difficulty: number;
  hint: string;
  mastery: number;
}

export interface SubmitAnswerResponse {
  session_id?: string;
  correct: boolean;
  correct_answer: string;
  explanation: string;
  old_mastery: number;
  new_mastery: number;
  mastery?: number;
  mastery_gain?: number;
  next_difficulty: number;
  difficulty_direction: 'increased' | 'decreased' | 'maintained';
  policy_used: PolicyType;
  beta_estimate: number;
  zpd_alignment?: number;
  q_values?: number[];
  next_question: {
    question: string;
    choices: string[];
    difficulty: number;
    hint: string;
  };
  next_choices?: string[];
  next_hint?: string;
}

export interface SimulationEpoch {
  epoch: number;
  reward: number;
  correctness: number;
  learning_gain: number;
  engagement: number;
}

export interface SimulationApiResponse {
  status: string;
  data: Record<PolicyType, SimulationEpoch[]>;
}

export interface DktMetrics {
  accuracy: number;
  auc: number;
  bce_loss: number;
}

export interface DktEvaluationData {
  num_skills: number;
  skills: string[];
  num_student_sequences: number;
  loss_history: number[];
  dkt_metrics: DktMetrics;
  bkt_baseline: DktMetrics;
}

export interface IccSkillData {
  beta: number;
  curve: number[];
  params: {
    p_init?: number;
    p_transit?: number;
    p_slip?: number;
    p_guess?: number;
  };
}

export interface SkillParametersResponse {
  theta_vals: number[];
  icc_data: Record<string, IccSkillData>;
  bkt_params: Record<string, any>;
}

export interface QTableResponse {
  q_table: number[][];
  is_trained: boolean;
}

export interface ExpoScenario {
  id: string;
  name: string;
  tagline: string;
  initial_skill: number;
  learning_rate: number;
  accuracy_tendency: string;
  description: string;
  color: string;
}

export interface ExpoPersonaTraceStep {
  step: number;
  topic: string;
  question: string;
  difficulty: number;
  irt_beta: number;
  student_correct: boolean;
  response_time_sec: number;
  old_mastery: number;
  new_mastery: number;
  mastery_gain: number;
  zpd_score: number;
}

export interface ExpoPersonaSimResult {
  status: string;
  persona_id: string;
  policy: PolicyType;
  topic: string;
  initial_mastery: number;
  final_mastery: number;
  net_gain: number;
  trace: ExpoPersonaTraceStep[];
}

export interface XAiDecisionExplanation {
  status: string;
  policy: PolicyType;
  mastery: number;
  selected_difficulty: number;
  q_values_by_difficulty: Record<string, number>;
  zpd_alignment_index: number;
  empirical_bkt_params: Record<string, any>;
  irt_beta_estimate: number;
  pedagogical_rationale: string;
}

export interface SocraticCoachResponse {
  status: string;
  topic: string;
  query: string;
  socratic_advice: {
    concept_overview: string;
    intuitive_analogy: string;
    step_by_step: string[];
    pedagogical_tip: string;
    suggested_checkpoint: string;
  };
}

export interface ExpoExportSummary {
  project_title: string;
  award_target: string;
  system_version: string;
  algorithms: Record<string, string>;
  benchmarks: {
    dkt_test_auc: number;
    dkt_accuracy: string;
    bkt_baseline_auc: number;
    rl_learning_gain_improvement: string;
    total_simulated_interactions: number;
    evaluated_students: number;
    curriculum_tracks: string[];
  };
  stats_snapshot: Record<string, any>;
}
