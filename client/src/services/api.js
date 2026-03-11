/**
 * API Service — centralized fetch with error handling and JWT auth
 */

// ── Helpers ────────────────────────────────────────────────────
function getToken() {
    return sessionStorage.getItem('adminToken') || '';
}

function authHeaders() {
    const token = getToken();
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
}

async function request(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.message || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}

// ── Auth ───────────────────────────────────────────────────────
export const adminLogin = (password) =>
    request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });

// ── Teams ──────────────────────────────────────────────────────
export const getTeams = () => request('/api/teams');
export const createTeam = (data) =>
    request('/api/teams', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
export const updateTeam = (id, data) =>
    request(`/api/teams/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
export const deleteTeam = (id) =>
    request(`/api/teams/${id}`, { method: 'DELETE', headers: authHeaders() });

// ── Matches ────────────────────────────────────────────────────
export const getMatches = (phase) =>
    request(`/api/matches${phase ? `?phase=${phase}` : ''}`);
export const getTodayMatches = () => request('/api/matches/today');
export const getTomorrowMatches = () => request('/api/matches/tomorrow');
export const getMatchHistory = () => request('/api/matches/history');
export const createMatch = (data) =>
    request('/api/matches', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
export const updateMatch = (id, data) =>
    request(`/api/matches/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
export const deleteMatch = (id) =>
    request(`/api/matches/${id}`, { method: 'DELETE', headers: authHeaders() });

// ── Settings ───────────────────────────────────────────────────
export const getSettings = () => request('/api/settings');
export const setPhase = (phase) =>
    request('/api/settings/phase', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ phase }) });
export const setQualifiedTeams = (teamIds) =>
    request('/api/settings/qualified', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ teamIds }) });
export const setBracketSlots = (slots) =>
    request('/api/settings/bracket-slots', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ slots }) });
export const setTournamentName = (name) =>
    request('/api/settings/tournament-name', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ name }) });
export const updateSettings = (data) =>
    request('/api/settings/info', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });

export const recordVisit = () =>
    request('/api/settings/visit', { method: 'POST' });

// ── Reset (requires separate RESET_PASSWORD) ───────────────────
export const resetGroups = (password) =>
    request('/api/settings/reset/groups', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ password }) });
export const resetKnockout = (password) =>
    request('/api/settings/reset/knockout', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ password }) });
export const resetAll = (password) =>
    request('/api/settings/reset/all', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ password }) });

// ── Rankings / Knockout ────────────────────────────────────────
export const getRankings = () => request('/api/settings/rankings');
export const generateKnockout = () =>
    request('/api/settings/generate-knockout', { method: 'POST', headers: authHeaders() });
