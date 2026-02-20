// All paths relative — Vite proxy /api → Express :5000

// --- Auth ---
export const adminLogin = (password) =>
    fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }).then(r => r.json());

// --- Teams ---
export const getTeams = () => fetch('/api/teams').then(r => r.json());
export const createTeam = (data) =>
    fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const updateTeam = (id, data) =>
    fetch(`/api/teams/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteTeam = (id) => fetch(`/api/teams/${id}`, { method: 'DELETE' }).then(r => r.json());

// --- Matches ---
export const getMatches = (phase) =>
    fetch(`/api/matches${phase ? `?phase=${phase}` : ''}`).then(r => r.json());
export const getTodayMatches = () => fetch('/api/matches/today').then(r => r.json());
export const getTomorrowMatches = () => fetch('/api/matches/tomorrow').then(r => r.json());
export const getMatchHistory = () => fetch('/api/matches/history').then(r => r.json());
export const createMatch = (data) =>
    fetch('/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

// Unified match update — handles date, result, red cards, etc. in one call
export const updateMatch = (id, data) =>
    fetch(`/api/matches/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const toggleToday = (id) =>
    fetch(`/api/matches/${id}/toggle-today`, { method: 'PATCH' }).then(r => r.json());
export const updateMatchDate = (id, matchDate) =>
    fetch(`/api/matches/${id}/date`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchDate }) }).then(r => r.json());
export const saveResult = (id, score1, score2, redCards1 = 0, redCards2 = 0, penalties = null) =>
    fetch(`/api/matches/${id}/result`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score1, score2, redCards1, redCards2, ...(penalties || {}) }) }).then(r => r.json());

export const deleteMatch = (id) => fetch(`/api/matches/${id}`, { method: 'DELETE' }).then(r => r.json());

// --- Settings ---
export const getSettings = () => fetch('/api/settings').then(r => r.json());
export const setPhase = (phase) =>
    fetch('/api/settings/phase', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phase }) }).then(r => r.json());
export const setQualifiedTeams = (teamIds) =>
    fetch('/api/settings/qualified', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamIds }) }).then(r => r.json());
export const setBracketSlots = (slots) =>
    fetch('/api/settings/bracket-slots', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slots }) }).then(r => r.json());
export const setTournamentName = (name) =>
    fetch('/api/settings/tournament-name', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }).then(r => r.json());

// Update all tournament info fields (name, subtitle, logo, colors, fonts)
export const updateSettings = (data) =>
    fetch('/api/settings/info', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

// --- Reset ---
export const resetGroups = () => fetch('/api/settings/reset/groups', { method: 'DELETE' }).then(r => r.json());
export const resetKnockout = () => fetch('/api/settings/reset/knockout', { method: 'DELETE' }).then(r => r.json());
export const resetAll = () => fetch('/api/settings/reset/all', { method: 'DELETE' }).then(r => r.json());
