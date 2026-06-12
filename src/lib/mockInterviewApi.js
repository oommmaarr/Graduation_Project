const MOCK_INTERVIEW_API_BASE =
  import.meta.env.VITE_MOCK_INTERVIEW_API_URL ||
  "https://mock-interview-production.up.railway.app";

function formatApiError(detail, status) {
  if (typeof detail === "string") return detail.replace(/^'|'$/g, "");
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(", ");
  }
  if (detail) return String(detail);
  return `Request failed (${status})`;
}

async function parseError(res) {
  try {
    const data = await res.json();
    return formatApiError(data.detail ?? data.message, res.status);
  } catch {
    return `Request failed (${res.status})`;
  }
}

/** GET /api/tracks — list interview specializations */
export async function fetchMockTracks() {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/tracks`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.tracks ?? [];
}

/** GET /api/languages — supported interview languages */
export async function fetchMockLanguages() {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/languages`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return data.languages ?? [];
}

/**
 * POST /api/interview/start
 * Opens a session for the given track id (e.g. "frontend") and returns the first question.
 */
export async function startMockInterview(track, language = "en-US") {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/interview/start`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ track, language }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * POST /api/interview/chat
 * Sends the candidate's answer; returns the next question or final evaluation.
 */
export async function sendMockInterviewMessage(sessionId, message) {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/interview/chat`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * GET /api/interview/{session_id}
 * Polls session state (done, rating, evaluation) after refresh or reconnect.
 */
export async function fetchMockSession(sessionId) {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/interview/${sessionId}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * POST /api/interview/{session_id}/end
 * Ends an in-progress session when the user leaves early.
 */
export async function endMockInterview(sessionId) {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/interview/${sessionId}/end`, {
    method: "POST",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function synthesizeSpeech(text) {
  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/tts`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.blob();
}

export async function transcribeAudio(file, language = "en-US") {
  const formData = new FormData();
  formData.append("audio", file);
  formData.append("language", language);

  const res = await fetch(`${MOCK_INTERVIEW_API_BASE}/api/stt`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function resolveMockTrackId(finishedTrackName, mockTracks) {
  if (!finishedTrackName || !mockTracks?.length) return null;

  const normalized = finishedTrackName.trim().toLowerCase();

  const exact = mockTracks.find((t) => t.id === normalized || t.id === normalized.replace(/\s+/g, "-"));
  if (exact) return exact.id;

  const byLabel = mockTracks.find((t) => {
    const label = t.label_en?.toLowerCase() ?? "";
    return normalized.includes(label) || label.includes(normalized);
  });
  if (byLabel) return byLabel.id;

  const keywordMap = [
    { keys: ["frontend", "react", "html", "css", "javascript"], id: "frontend" },
    { keys: ["backend", "node", "api", "server"], id: "backend" },
    { keys: ["mobile", "flutter", "android", "ios"], id: "mobile" },
    { keys: ["data science", "machine learning", "ml"], id: "data-science" },
    { keys: ["data engineer", "etl", "pipeline"], id: "data-engineering" },
    { keys: ["computer vision", "opencv"], id: "computer-vision" },
    { keys: ["iot", "embedded", "microcontroller"], id: "iot" },
    { keys: ["devops", "cloud", "aws", "kubernetes"], id: "cloud-devops" },
    { keys: ["security", "cyber"], id: "cyber-security" },
    { keys: ["game", "unity", "unreal"], id: "game-dev" },
    { keys: ["ai", "llm", "artificial intelligence"], id: "ai" },
    { keys: ["embedded", "firmware", "rtos"], id: "embedded-systems" },
  ];

  for (const entry of keywordMap) {
    if (entry.keys.some((k) => normalized.includes(k))) {
      const track = mockTracks.find((t) => t.id === entry.id);
      if (track) return track.id;
    }
  }

  return null;
}
