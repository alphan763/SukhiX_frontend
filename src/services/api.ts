const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface HealthDataPayload {
  symptoms?: string[];
  heart_rate?: number | null;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  daily_steps?: number | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  sleep_hours?: number | null;
}

export interface PredictionResponse {
  prediction: string;
  symptoms_analyzed: string[];
}

export interface ComponentScore {
  score: number;
  maxScore: number;
  available: boolean;
  status: 'good' | 'attention' | 'concern';
  note: string;
}

export interface HealthScoreResponse {
  overallScore: number | null;
  indicatorsUsed: number;
  indicatorsTotal: number;
  components: Record<string, ComponentScore>;
  positiveIndicators: string[];
  attentionIndicators: string[];
  disclaimer: string;
}

export interface ChatPayload {
  message: string;
  health_context?: HealthDataPayload;
}

export interface ChatResponse {
  response: string;
}

// 1. Fetch available symptoms for multi-select dropdowns
export async function fetchSymptoms(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/symptoms`);
  if (!res.ok) throw new Error('Failed to load symptom list from server.');
  const data = await res.json();
  return data.symptoms;
}

// 2. Predict disease based on selected symptoms
export async function getPrediction(symptoms: string[]): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Prediction request failed.');
  }
  return res.json();
}

// 3. Compute the 0–100 Health Score
export async function calculateHealthScore(payload: HealthDataPayload): Promise<HealthScoreResponse> {
  const res = await fetch(`${API_BASE_URL}/health-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Health score calculation failed.');
  }
  return res.json();
}

// 4. Send chat messages with contextual health data
export async function sendChatMessage(payload: ChatPayload): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'AI chat service unavailable.');
  }
  return res.json();
}