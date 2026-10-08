import {
  TopicsApiResponse,
  StartSessionResponse,
  SubmitAnswerResponse,
  SimulationApiResponse,
  DktEvaluationData,
  SkillParametersResponse,
  QTableResponse,
  PolicyType,
  ExpoScenario,
  ExpoPersonaSimResult,
  XAiDecisionExplanation,
  SocraticCoachResponse,
  ExpoExportSummary,
} from '../types/api';

const API_BASE = '/api';

export async function fetchTopics(): Promise<TopicsApiResponse> {
  const res = await fetch(`${API_BASE}/topics`);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function startSession(topic: string, policy: PolicyType): Promise<StartSessionResponse> {
  const res = await fetch(`${API_BASE}/student/start_session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, policy }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to start session');
  }
  return res.json();
}

export async function submitAnswer(
  sessionId: string,
  answer: string,
  timeTaken: number,
  hintsUsed: number
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`${API_BASE}/student/submit_answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      answer,
      time_taken: timeTaken,
      hints_used: hintsUsed,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit answer');
  }
  return res.json();
}

export async function runSimulation(): Promise<SimulationApiResponse> {
  const res = await fetch(`${API_BASE}/run_simulation`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to run simulation');
  return res.json();
}

export async function evaluateDkt(): Promise<{ status: string; data: DktEvaluationData }> {
  const res = await fetch(`${API_BASE}/dkt_evaluation`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to evaluate DKT model');
  return res.json();
}

export async function getSkillParameters(): Promise<SkillParametersResponse> {
  const res = await fetch(`${API_BASE}/skill_parameters`);
  if (!res.ok) throw new Error('Failed to load skill parameters');
  return res.json();
}

export async function getQTable(): Promise<QTableResponse> {
  const res = await fetch(`${API_BASE}/get_q_table`);
  if (!res.ok) throw new Error('Failed to load Q-Table');
  return res.json();
}

export async function getExpoScenarios(): Promise<{ status: string; scenarios: ExpoScenario[] }> {
  const res = await fetch(`${API_BASE}/expo/scenarios`);
  if (!res.ok) throw new Error('Failed to load expo scenarios');
  return res.json();
}

export async function simulatePersona(
  personaId: string,
  policy: PolicyType = 'DQN',
  topic: string = 'DSA',
  steps: number = 8
): Promise<ExpoPersonaSimResult> {
  const res = await fetch(`${API_BASE}/expo/simulate_persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona_id: personaId, policy, topic, steps }),
  });
  if (!res.ok) throw new Error('Failed to simulate persona');
  return res.json();
}

export async function explainDecision(params: {
  mastery: number;
  difficulty: number;
  policy: PolicyType;
  topic: string;
  recent_correctness?: number;
  response_time?: number;
  hints?: number;
}): Promise<XAiDecisionExplanation> {
  const res = await fetch(`${API_BASE}/explain_decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to fetch decision explanation');
  return res.json();
}

export async function askAiCoach(
  query: string,
  topic: string,
  mastery: number = 0.5
): Promise<SocraticCoachResponse> {
  const res = await fetch(`${API_BASE}/llm_tutor/ask_coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topic, mastery }),
  });
  if (!res.ok) throw new Error('Failed to query Socratic AI Coach');
  return res.json();
}

export async function getExpoSummary(): Promise<ExpoExportSummary> {
  const res = await fetch(`${API_BASE}/expo/export_summary`);
  if (!res.ok) throw new Error('Failed to fetch expo summary');
  return res.json();
}
