import { useState } from 'react';
import { createMatch, saveResult, deleteMatch, updateMatchDate } from '../services/api';

const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];
const ROUND_POS = { 'ربع النهائي': 4, 'نصف النهائي': 2, 'نهائي الترتيب': 1, 'النهائي': 1 };

const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' }) : null;
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
const fmtLocal = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const pad = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

// ── Inline Result with penalty support ──
function InlineResult({ match, onSaved }) {
    const [s1, setS1] = useState(match.score1 ?? '');
    const [s2, setS2] = useState(match.score2 ?? '');
    const [hasPen, setHasPen] = useState(match.hasPenalties || false);
    const [p1, setP1] = useState(match.penaltyScore1 ?? '');
    const [p2, setP2] = useState(match.penaltyScore2 ?? '');
    const [loading, setLoading] = useState(false);

    const isDraw = s1 !== '' && s2 !== '' && Number(s1) === Number(s2);

    const handle = async () => {
        if (s1 === '' || s2 === '') return;
        setLoading(true);
        const penalties = hasPen && isDraw
            ? { hasPenalties: true, penaltyScore1: Number(p1) || 0, penaltyScore2: Number(p2) || 0 }
            : { hasPenalties: false };
        const res = await saveResult(match._id, s1, s2, 0, 0, penalties);
        if (res.match) onSaved?.();
        setLoading(false);
    };

    return (
        <div className="ko-result-wrap">
            <div className="ko-result-input">
                <input type="number" min="0" className="score-input" value={s1} onChange={e => setS1(e.target.value)} placeholder="0" />
                <span className="score-sep">-</span>
                <input type="number" min="0" className="score-input" value={s2} onChange={e => setS2(e.target.value)} placeholder="0" />
                <button className="btn btn-success btn-xs" onClick={handle} disabled={loading}>
                    {loading ? '⏳' : match.status === 'Completed' ? '✏️' : '💾'}
                </button>
            </div>
            {/* Penalty toggle — shown only if draw */}
            {isDraw && (
                <div className="ko-penalty-row">
                    <label className="ko-pen-label">
                        <input type="checkbox" checked={hasPen} onChange={e => setHasPen(e.target.checked)} />
                        🥅 ضربات جزاء
                    </label>
                    {hasPen && (
                        <div className="ko-pen-scores">
                            <input type="number" min="0" className="score-input" value={p1} onChange={e => setP1(e.target.value)} placeholder="0" />
                            <span className="score-sep">-</span>
                            <input type="number" min="0" className="score-input" value={p2} onChange={e => setP2(e.target.value)} placeholder="0" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Add KO Match form ──
function AddKOMatch({ teams, qualifiedTeams, existingMatches, onAdded }) {
    const [round, setRound] = useState('ربع النهائي');
    const [bracketPos, setBracketPos] = useState(1);
    const [team1, setTeam1] = useState('');
    const [team2, setTeam2] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const maxPos = ROUND_POS[round] || 1;
    const taken = existingMatches.filter(m => m.knockoutRound === round).map(m => m.bracketPosition);
    // Only show qualified teams (or all teams if none qualified yet)
    const eligible = qualifiedTeams?.length > 0 ? qualifiedTeams : teams;

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        if (!team1 || !team2) return setError('اختر الفريقين');
        if (team1 === team2) return setError('نفس الفريق مرتين!');
        setLoading(true);
        try {
            const res = await createMatch({
                team1, team2, group: 'knockout', phase: 'knockout',
                knockoutRound: round, bracketPosition: bracketPos,
                matchDate: matchDate || null,
            });
            if (!res._id) throw new Error(res.message || 'خطأ');
            setTeam1(''); setTeam2(''); setMatchDate('');
            onAdded?.();
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    return (
        <form onSubmit={handleAdd} className="ko-add-form">
            <div className="ko-add-row">
                <div className="form-group" style={{ minWidth: 140 }}>
                    <label className="form-label">الدور</label>
                    <select className="form-select" value={round} onChange={e => { setRound(e.target.value); setBracketPos(1); }}>
                        {KO_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {maxPos > 1 && (
                    <div className="form-group" style={{ minWidth: 80 }}>
                        <label className="form-label">م. القرعة</label>
                        <select className="form-select" value={bracketPos} onChange={e => setBracketPos(+e.target.value)}>
                            {Array.from({ length: maxPos }, (_, i) => i + 1).map(p => (
                                <option key={p} value={p} disabled={taken.includes(p)}>م{p}{taken.includes(p) ? ' ✓' : ''}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">الفريق الأول</label>
                    <select className="form-select" value={team1} onChange={e => setTeam1(e.target.value)}>
                        <option value="">— اختر —</option>
                        {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">الفريق الثاني</label>
                    <select className="form-select" value={team2} onChange={e => setTeam2(e.target.value)}>
                        <option value="">— اختر —</option>
                        {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ minWidth: 160 }}>
                    <label className="form-label">📅 التاريخ</label>
                    <input type="datetime-local" className="form-input" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: '0 0 auto' }}>
                    <label className="form-label">&nbsp;</label>
                    <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? '⏳' : '➕ إضافة'}</button>
                </div>
            </div>
            {error && <p className="alert alert-error" style={{ marginTop: '0.5rem' }}>{error}</p>}
        </form>
    );
}

// ── Main KnockoutMatchManager ──
export default function KnockoutMatchManager({ matches, teams, qualifiedTeams, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editDate, setEditDate] = useState({});
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('حذف هذه المباراة؟')) return;
        setDeleting(id);
        await deleteMatch(id);
        setDeleting(null);
        onRefresh?.();
    };

    const startDate = (m) => setEditDate(p => ({ ...p, [m._id]: { editing: true, val: fmtLocal(m.matchDate) } }));
    const saveDate = async (id) => {
        await updateMatchDate(id, editDate[id]?.val || null);
        setEditDate(p => { const n = { ...p }; delete n[id]; return n; });
        onRefresh?.();
    };
    const cancelDate = (id) => setEditDate(p => { const n = { ...p }; delete n[id]; return n; });

    return (
        <div className="ko-match-manager">
            <div className="ko-mm-header">
                <span className="ko-mm-count">{matches.length} مباراة</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(s => !s)}>
                    {showAdd ? '✕ إغلاق' : '➕ إضافة مباراة'}
                </button>
            </div>

            {showAdd && (
                <AddKOMatch teams={teams} qualifiedTeams={qualifiedTeams} existingMatches={matches}
                    onAdded={() => { setShowAdd(false); onRefresh?.(); }} />
            )}

            {KO_ROUNDS.map(round => {
                const rows = matches.filter(m => m.knockoutRound === round);
                if (!rows.length) return null;
                return (
                    <div key={round} className="ko-mm-round">
                        <div className="ko-mm-round-title">{round}</div>
                        {rows.map(m => {
                            const done = m.status === 'Completed';
                            const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                            const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                            const ds = editDate[m._id];
                            return (
                                <div key={m._id} className={`ko-mm-row ${done ? 'ko-mm-done' : ''}`}>
                                    <div className="ko-mm-teams">
                                        {m.bracketPosition && <span className="ko-mm-pos">م{m.bracketPosition}</span>}
                                        <span className={`ko-mm-team ${w1 ? 'ko-mm-winner' : ''}`}>{m.team1?.name}</span>
                                        {done
                                            ? <span className="ko-mm-score">
                                                {m.score1} - {m.score2}
                                                {m.hasPenalties && <small className="ko-pen-tag"> (ج {m.penaltyScore1}-{m.penaltyScore2})</small>}
                                            </span>
                                            : <span className="ko-mm-vs">VS</span>}
                                        <span className={`ko-mm-team ko-mm-team-r ${w2 ? 'ko-mm-winner' : ''}`}>{m.team2?.name}</span>
                                    </div>

                                    <div className="ko-mm-date-cell">
                                        {ds?.editing ? (
                                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                <input type="datetime-local" className="form-input" style={{ fontSize: '0.75rem', padding: '0.28rem 0.5rem' }}
                                                    value={ds.val} onChange={e => setEditDate(p => ({ ...p, [m._id]: { ...p[m._id], val: e.target.value } }))} />
                                                <button className="btn btn-success btn-xs" onClick={() => saveDate(m._id)}>✓</button>
                                                <button className="btn btn-ghost btn-xs" onClick={() => cancelDate(m._id)}>✕</button>
                                            </div>
                                        ) : (
                                            <span className="ko-mm-date" onClick={() => startDate(m)}>
                                                {m.matchDate ? `📅 ${fmt(m.matchDate)} ${fmtTime(m.matchDate) || ''}` : <span className="date-placeholder">+ تاريخ</span>}
                                            </span>
                                        )}
                                    </div>

                                    <div className="ko-mm-actions">
                                        <InlineResult match={m} onSaved={onRefresh} />
                                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(m._id)} disabled={deleting === m._id}>
                                            {deleting === m._id ? '⏳' : '🗑️'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {matches.length === 0 && !showAdd && (
                <div className="empty-state-sm">
                    لا توجد مباريات إقصاء — اضغط "إضافة مباراة" أو فعّل إنشاء تلقائي من الخطوة ٢
                </div>
            )}
        </div>
    );
}
