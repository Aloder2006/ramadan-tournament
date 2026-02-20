import { useState } from 'react';
import { updateMatch, createMatch, deleteMatch } from '../services/api';

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

/* ──────────────────────────────────────────
   UNIFIED KNOCKOUT EDIT MODAL
────────────────────────────────────────── */
function KOEditModal({ match, onClose, onSaved }) {
    const [matchDate, setMatchDate] = useState(fmtLocal(match.matchDate));
    const [status, setStatus] = useState(match.status);
    const [s1, setS1] = useState(match.score1 ?? '');
    const [s2, setS2] = useState(match.score2 ?? '');
    const [hasPen, setHasPen] = useState(match.hasPenalties || false);
    const [p1, setP1] = useState(match.penaltyScore1 ?? '');
    const [p2, setP2] = useState(match.penaltyScore2 ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isDraw = s1 !== '' && s2 !== '' && Number(s1) === Number(s2);

    const handleSave = async () => {
        setError('');
        if (status === 'Completed' && (s1 === '' || s2 === ''))
            return setError('أدخل النتيجة أو اختر "قيد الانتظار"');
        setSaving(true);
        try {
            const payload = {
                matchDate: matchDate || null,
                status,
                score1: status === 'Completed' ? Number(s1) : undefined,
                score2: status === 'Completed' ? Number(s2) : undefined,
                redCards1: 0,
                redCards2: 0,
                hasPenalties: status === 'Completed' && isDraw && hasPen,
                penaltyScore1: status === 'Completed' && isDraw && hasPen ? Number(p1) || 0 : null,
                penaltyScore2: status === 'Completed' && isDraw && hasPen ? Number(p2) || 0 : null,
            };
            const res = await updateMatch(match._id, payload);
            if (res.message && !res.match) throw new Error(res.message);
            onSaved?.();
            onClose();
        } catch (err) {
            setError(err.message || 'حدث خطأ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">✏️ تعديل مباراة الإقصاء</h3>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-teams-display">
                    <span className="modal-team">{match.team1?.name}</span>
                    <span className="modal-vs ko-round-display">{match.knockoutRound}</span>
                    <span className="modal-team">{match.team2?.name}</span>
                </div>

                <div className="modal-body">
                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">📅 تاريخ ووقت المباراة</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={matchDate}
                            onChange={(e) => setMatchDate(e.target.value)}
                        />
                    </div>

                    {/* Status */}
                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <div className="status-toggle-row">
                            <button type="button"
                                className={`status-toggle-btn ${status === 'Pending' ? 'active-pending' : ''}`}
                                onClick={() => setStatus('Pending')}>⏳ قيد الانتظار</button>
                            <button type="button"
                                className={`status-toggle-btn ${status === 'Completed' ? 'active-done' : ''}`}
                                onClick={() => setStatus('Completed')}>✅ منتهية</button>
                        </div>
                    </div>

                    {/* Score */}
                    {status === 'Completed' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">النتيجة</label>
                                <div className="modal-score-row">
                                    <div className="modal-score-side">
                                        <span className="modal-score-label">{match.team1?.name}</span>
                                        <input type="number" min="0" className="score-input score-input-lg"
                                            value={s1} onChange={(e) => setS1(e.target.value)} placeholder="0" />
                                    </div>
                                    <span className="score-dash">-</span>
                                    <div className="modal-score-side">
                                        <span className="modal-score-label">{match.team2?.name}</span>
                                        <input type="number" min="0" className="score-input score-input-lg"
                                            value={s2} onChange={(e) => setS2(e.target.value)} placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            {/* Penalties */}
                            {isDraw && (
                                <div className="form-group">
                                    <label className="form-label ko-pen-label">
                                        <input type="checkbox" checked={hasPen}
                                            onChange={(e) => setHasPen(e.target.checked)} />
                                        🥅 ضربات جزاء
                                    </label>
                                    {hasPen && (
                                        <div className="modal-score-row" style={{ marginTop: '0.5rem' }}>
                                            <div className="modal-score-side">
                                                <span className="modal-score-label">{match.team1?.name}</span>
                                                <input type="number" min="0" className="score-input score-input-lg"
                                                    value={p1} onChange={(e) => setP1(e.target.value)} placeholder="0" />
                                            </div>
                                            <span className="score-dash">-</span>
                                            <div className="modal-score-side">
                                                <span className="modal-score-label">{match.team2?.name}</span>
                                                <input type="number" min="0" className="score-input score-input-lg"
                                                    value={p2} onChange={(e) => setP2(e.target.value)} placeholder="0" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="alert alert-error">{error}</p>}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                        {saving ? '⏳ جاري الحفظ...' : '💾 حفظ'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   ADD KO MATCH FORM
────────────────────────────────────────── */
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
                    <select className="form-select" value={round}
                        onChange={e => { setRound(e.target.value); setBracketPos(1); }}>
                        {KO_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {maxPos > 1 && (
                    <div className="form-group" style={{ minWidth: 80 }}>
                        <label className="form-label">م.القرعة</label>
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

/* ──────────────────────────────────────────
   MAIN KnockoutMatchManager
────────────────────────────────────────── */
export default function KnockoutMatchManager({ matches, teams, qualifiedTeams, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('حذف هذه المباراة؟')) return;
        setDeleting(id);
        await deleteMatch(id);
        setDeleting(null);
        onRefresh?.();
    };

    // Compute winner for a match
    const getWinner = (m) => {
        if (m.status !== 'Completed') return null;
        if (m.hasPenalties) {
            return m.penaltyScore1 > m.penaltyScore2 ? m.team1 : m.team2;
        }
        if (m.score1 > m.score2) return m.team1;
        if (m.score2 > m.score1) return m.team2;
        return null;
    };

    return (
        <>
            {editingMatch && (
                <KOEditModal
                    match={editingMatch}
                    onClose={() => setEditingMatch(null)}
                    onSaved={() => { setEditingMatch(null); onRefresh?.(); }}
                />
            )}

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
                                const winner = getWinner(m);
                                const w1 = done && winner?._id === (m.team1?._id || m.team1);
                                const w2 = done && winner?._id === (m.team2?._id || m.team2);
                                return (
                                    <div key={m._id} className={`ko-mm-row ${done ? 'ko-mm-done' : ''}`}>
                                        <div className="ko-mm-teams">
                                            {m.bracketPosition && <span className="ko-mm-pos">م{m.bracketPosition}</span>}
                                            <span className={`ko-mm-team ${w1 ? 'ko-mm-winner' : ''}`}>{m.team1?.name}</span>
                                            {done ? (
                                                <span className="ko-mm-score">
                                                    {m.score1} - {m.score2}
                                                    {m.hasPenalties && <small className="ko-pen-tag"> (ج {m.penaltyScore1}-{m.penaltyScore2})</small>}
                                                </span>
                                            ) : (
                                                <span className="ko-mm-vs">VS</span>
                                            )}
                                            <span className={`ko-mm-team ko-mm-team-r ${w2 ? 'ko-mm-winner' : ''}`}>{m.team2?.name}</span>
                                        </div>

                                        {/* Date display */}
                                        <div className="ko-mm-date-cell">
                                            {m.matchDate
                                                ? <span className="ko-mm-date">📅 {fmt(m.matchDate)}{fmtTime(m.matchDate) ? ` ⏰ ${fmtTime(m.matchDate)}` : ''}</span>
                                                : <span className="date-placeholder">لا يوجد تاريخ</span>}
                                        </div>

                                        {/* Status chip + winner */}
                                        <div className="ko-mm-status-row">
                                            <span className={`status-badge ${done ? 'completed' : 'pending'}`}>
                                                {done ? '✅ منتهية' : '⏳ قيد الانتظار'}
                                            </span>
                                            {done && winner && (
                                                <span className="ko-winner-chip">🏆 {winner.name}</span>
                                            )}
                                        </div>

                                        <div className="ko-mm-actions">
                                            <button className="btn btn-ghost btn-xs" onClick={() => setEditingMatch(m)}
                                                title="تعديل المباراة">✏️ تعديل</button>
                                            <button className="btn btn-danger btn-xs"
                                                onClick={() => handleDelete(m._id)}
                                                disabled={deleting === m._id}>
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
        </>
    );
}
