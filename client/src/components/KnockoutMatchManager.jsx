import { useState } from 'react';
import { updateMatch, createMatch, deleteMatch } from '../services/api';

const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];
const ROUND_POS = { 'ربع النهائي': 4, 'نصف النهائي': 2, 'نهائي الترتيب': 1, 'النهائي': 1 };
const fmt = d => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
const fmtLocal = d => { if (!d) return ''; const dt = new Date(d); const p = n => String(n).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`; };

/* ─── KO Edit Modal ─── */
function KOEditModal({ match, onClose, onSaved }) {
    const [matchDate, setMatchDate] = useState(fmtLocal(match.matchDate));
    const [status, setStatus] = useState(match.status);
    const [s1, setS1] = useState(match.score1 ?? ''); const [s2, setS2] = useState(match.score2 ?? '');
    const [hasPen, setHasPen] = useState(match.hasPenalties || false);
    const [p1, setP1] = useState(match.penaltyScore1 ?? ''); const [p2, setP2] = useState(match.penaltyScore2 ?? '');
    const [saving, setSaving] = useState(false); const [error, setError] = useState('');
    const isDraw = s1 !== '' && s2 !== '' && Number(s1) === Number(s2);

    const save = async () => {
        setError('');
        if (status === 'Completed' && (s1 === '' || s2 === '')) return setError('أدخل النتيجة');
        setSaving(true);
        try {
            const pl = { matchDate: matchDate ? new Date(matchDate).toISOString() : null, status, score1: status === 'Completed' ? Number(s1) : undefined, score2: status === 'Completed' ? Number(s2) : undefined, redCards1: 0, redCards2: 0, hasPenalties: status === 'Completed' && isDraw && hasPen, penaltyScore1: status === 'Completed' && isDraw && hasPen ? Number(p1) || 0 : null, penaltyScore2: status === 'Completed' && isDraw && hasPen ? Number(p2) || 0 : null };
            const res = await updateMatch(match._id, pl);
            if (res.message && !res.match) throw new Error(res.message);
            onSaved?.(); onClose();
        } catch (e) { setError(e.message || 'حدث خطأ'); } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">تعديل مباراة الإقصاء</span>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-teams-display">
                    <div className="modal-team">{match.team1?.name}</div>
                    <div className="modal-vs">{match.knockoutRound || 'VS'}</div>
                    <div className="modal-team">{match.team2?.name}</div>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">تاريخ ووقت المباراة</label>
                        <input type="datetime-local" className="form-input" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <div className="admin-status-btns">
                            {[['Pending', 'قيد الانتظار'], ['Completed', 'منتهية']].map(([v, l]) => (
                                <button key={v} type="button" onClick={() => setStatus(v)}
                                    className={`admin-status-btn ${status === v ? (v === 'Completed' ? 'status-completed' : 'status-pending') : ''}`}
                                >{l}</button>
                            ))}
                        </div>
                    </div>
                    {status === 'Completed' && (<>
                        <div className="form-group">
                            <label className="form-label">النتيجة</label>
                            <div className="score-row">
                                <div className="admin-score-col">
                                    <span className="admin-score-team">{match.team1?.name}</span>
                                    <input type="number" min="0" value={s1} onChange={e => setS1(e.target.value)} placeholder="0" className="form-input score-input" />
                                </div>
                                <span className="score-sep">–</span>
                                <div className="admin-score-col">
                                    <span className="admin-score-team">{match.team2?.name}</span>
                                    <input type="number" min="0" value={s2} onChange={e => setS2(e.target.value)} placeholder="0" className="form-input score-input" />
                                </div>
                            </div>
                        </div>
                        {isDraw && (
                            <div className="penalty-section">
                                <label className="admin-checkbox-label">
                                    <input type="checkbox" checked={hasPen} onChange={e => setHasPen(e.target.checked)} /> ضربات جزاء
                                </label>
                                {hasPen && (<div className="score-row" style={{ marginTop: '.6rem' }}>
                                    <input type="number" min="0" value={p1} onChange={e => setP1(e.target.value)} placeholder="0" className="form-input score-input" />
                                    <span className="score-sep">–</span>
                                    <input type="number" min="0" value={p2} onChange={e => setP2(e.target.value)} placeholder="0" className="form-input score-input" />
                                </div>)}
                            </div>
                        )}
                    </>)}
                    {error && <div className="alert alert-error">{error}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Add KO match form ─── */
function AddKOMatch({ teams, qualifiedTeams, existingMatches, onAdded }) {
    const [round, setRound] = useState('ربع النهائي');
    const [bracketPos, setBracketPos] = useState(1);
    const [team1, setTeam1] = useState(''); const [team2, setTeam2] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
    const maxPos = ROUND_POS[round] || 1;
    const taken = existingMatches.filter(m => m.knockoutRound === round).map(m => m.bracketPosition);
    const eligible = qualifiedTeams?.length > 0 ? qualifiedTeams : teams;

    const handleAdd = async (e) => {
        e.preventDefault(); setError('');
        if (!team1 || !team2) return setError('اختر الفريقين');
        if (team1 === team2) return setError('نفس الفريق مرتين!');
        setLoading(true);
        try {
            const res = await createMatch({ team1, team2, group: 'knockout', phase: 'knockout', knockoutRound: round, bracketPosition: bracketPos, matchDate: matchDate || null });
            if (!res._id) throw new Error(res.message || 'خطأ');
            setTeam1(''); setTeam2(''); setMatchDate(''); onAdded?.();
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    return (
        <form onSubmit={handleAdd} className="admin-ko-add-form">
            <div className="admin-form-row">
                <div className="form-group">
                    <label className="form-label">الدور</label>
                    <select className="form-select" value={round} onChange={e => { setRound(e.target.value); setBracketPos(1); }}>
                        {KO_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {maxPos > 1 && (
                    <div className="form-group">
                        <label className="form-label">مباراة القرعة</label>
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
                <div className="form-group">
                    <label className="form-label">التاريخ</label>
                    <input type="datetime-local" className="form-input" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                </div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div><button className="btn btn-primary btn-sm" type="submit" disabled={loading}>{loading ? '...' : '+ إضافة'}</button></div>
        </form>
    );
}

/* ─── Main ─── */
export default function KnockoutMatchManager({ matches, teams, qualifiedTeams, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('حذف هذه المباراة؟')) return;
        setDeleting(id); await deleteMatch(id); setDeleting(null); onRefresh?.();
    };

    const getWinner = m => {
        if (m.status !== 'Completed') return null;
        if (m.hasPenalties) return m.penaltyScore1 > m.penaltyScore2 ? m.team1 : m.team2;
        if (m.score1 > m.score2) return m.team1;
        if (m.score2 > m.score1) return m.team2;
        return null;
    };

    return (
        <>
            {editingMatch && <KOEditModal match={editingMatch} onClose={() => setEditingMatch(null)} onSaved={() => { setEditingMatch(null); onRefresh?.(); }} />}

            <div className="admin-section-header">
                <span className="badge badge-muted">{matches.length} مباراة</span>
                <button className={`btn ${showAdd ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={() => setShowAdd(s => !s)}>
                    {showAdd ? '✕ إغلاق' : '+ إضافة مباراة'}
                </button>
            </div>

            {showAdd && <AddKOMatch teams={teams} qualifiedTeams={qualifiedTeams} existingMatches={matches} onAdded={() => { setShowAdd(false); onRefresh?.(); }} />}

            {KO_ROUNDS.map(round => {
                const rows = matches.filter(m => m.knockoutRound === round);
                if (!rows.length) return null;
                return (
                    <div key={round} className="admin-ko-round">
                        <div className="admin-ko-round-header">
                            <span className="admin-ko-round-indicator" />
                            {round}
                        </div>
                        {rows.map(m => {
                            const done = m.status === 'Completed';
                            const winner = getWinner(m);
                            const w1 = done && winner?._id === (m.team1?._id || m.team1);
                            const w2 = done && winner?._id === (m.team2?._id || m.team2);
                            return (
                                <div key={m._id} className={`admin-ko-match ${done ? 'match-done' : ''}`}>
                                    <div className="admin-ko-match-teams">
                                        {m.bracketPosition && <span className="admin-ko-pos">م{m.bracketPosition}</span>}
                                        <span className={`admin-ko-team-name ${w1 ? 'team-winner' : ''}`}>{m.team1?.name}</span>
                                        <div className="admin-ko-score-box">
                                            <span className={w1 ? 'score-winner' : ''}>{done ? m.score1 : '–'}</span>
                                            <span className="score-sep-sm">:</span>
                                            <span className={w2 ? 'score-winner' : ''}>{done ? m.score2 : '–'}</span>
                                        </div>
                                        {m.hasPenalties && <span className="admin-pen-text">ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                        <span className={`admin-ko-team-name ${w2 ? 'team-winner' : ''}`}>{m.team2?.name}</span>
                                    </div>
                                    <div className="admin-ko-match-meta">
                                        <div className="admin-ko-match-info">
                                            <span className={`match-status-chip ${done ? 'chip-done' : 'chip-pending'}`}>{done ? 'منتهية' : 'انتظار'}</span>
                                            {done && winner && <span className="admin-ko-winner">🏆 {winner.name}</span>}
                                            {m.matchDate && <span className="admin-match-date">{fmt(m.matchDate)}</span>}
                                        </div>
                                        <div className="admin-ko-match-btns">
                                            <button className="btn btn-ghost btn-xs" onClick={() => setEditingMatch(m)}>✏ تعديل</button>
                                            <button className="btn btn-danger btn-xs" onClick={() => handleDelete(m._id)} disabled={deleting === m._id}>{deleting === m._id ? '…' : '🗑'}</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {matches.length === 0 && !showAdd && (
                <div className="admin-empty">
                    لا توجد مباريات إقصاء — اضغط "إضافة مباراة" أو فعّل إنشاء تلقائي من الخطوة ٢
                </div>
            )}
        </>
    );
}
