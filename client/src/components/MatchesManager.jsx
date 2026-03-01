import { useState } from 'react';
import { updateMatch, createMatch, deleteMatch } from '../services/api';

const GROUPS = ['أ', 'ب', 'ج', 'د'];
const fmtLocal = (d) => { if (!d) return ''; const dt = new Date(d); const p = n => String(n).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`; };

function EditMatchModal({ match, onClose, onSaved }) {
    const [matchDate, setMatchDate] = useState(fmtLocal(match.matchDate));
    const [status, setStatus] = useState(match.status);
    const [s1, setS1] = useState(match.score1 ?? ''); const [s2, setS2] = useState(match.score2 ?? '');
    const [rc1, setRc1] = useState(match.redCards1 ?? 0); const [rc2, setRc2] = useState(match.redCards2 ?? 0);
    const [hasPen, setHasPen] = useState(match.hasPenalties || false);
    const [p1, setP1] = useState(match.penaltyScore1 ?? ''); const [p2, setP2] = useState(match.penaltyScore2 ?? '');
    const [saving, setSaving] = useState(false); const [error, setError] = useState('');
    const isDraw = s1 !== '' && s2 !== '' && Number(s1) === Number(s2);
    const isKO = match.phase === 'knockout';

    const save = async () => {
        setError('');
        if (status === 'Completed' && (s1 === '' || s2 === '')) return setError('أدخل النتيجة');
        setSaving(true);
        try {
            const pl = { matchDate: matchDate ? new Date(matchDate).toISOString() : null, status, score1: status === 'Completed' ? Number(s1) : undefined, score2: status === 'Completed' ? Number(s2) : undefined, redCards1: Number(rc1) || 0, redCards2: Number(rc2) || 0 };
            if (isKO && status === 'Completed' && isDraw && hasPen) { pl.hasPenalties = true; pl.penaltyScore1 = Number(p1) || 0; pl.penaltyScore2 = Number(p2) || 0; } else pl.hasPenalties = false;
            const res = await updateMatch(match._id, pl);
            if (res.message && !res.match) throw new Error(res.message);
            onSaved?.(); onClose();
        } catch (e) { setError(e.message || 'حدث خطأ'); } finally { setSaving(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">تعديل المباراة</span>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="modal-teams-display">
                    <div className="modal-team">{match.team1?.name}</div>
                    <div className="modal-vs">VS</div>
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
                        <div className="form-group">
                            <label className="form-label"><span className="admin-red-dot" />البطاقات الحمراء</label>
                            <div className="score-row">
                                <div className="admin-score-col">
                                    <span className="admin-score-team">{match.team1?.name}</span>
                                    <input type="number" min="0" max="11" value={rc1} onChange={e => setRc1(e.target.value)} className={`form-input score-input ${rc1 > 0 ? 'input-danger' : ''}`} />
                                </div>
                                <span className="score-sep">–</span>
                                <div className="admin-score-col">
                                    <span className="admin-score-team">{match.team2?.name}</span>
                                    <input type="number" min="0" max="11" value={rc2} onChange={e => setRc2(e.target.value)} className={`form-input score-input ${rc2 > 0 ? 'input-danger' : ''}`} />
                                </div>
                            </div>
                        </div>
                        {isKO && isDraw && (
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

export default function MatchesManager({ matches, teams, onRefresh, defaultPhase }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMatch, setNewMatch] = useState({ team1: '', team2: '', group: 'أ', phase: defaultPhase || 'groups', knockoutRound: '', matchDate: '' });
    const [addError, setAddError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('هل تريد حذف هذه المباراة؟')) return;
        setDeletingId(id);
        try { await deleteMatch(id); onRefresh?.(); } catch (e) { console.error(e); }
        setDeletingId(null);
    };

    const handleAdd = async (e) => {
        e.preventDefault(); setAddError('');
        if (!newMatch.team1 || !newMatch.team2) return setAddError('اختر الفريقين');
        if (newMatch.team1 === newMatch.team2) return setAddError('لا يمكن أن يلعب الفريق ضد نفسه');
        try {
            const pl = { ...newMatch }; if (pl.phase === 'groups') delete pl.knockoutRound; if (!pl.matchDate) delete pl.matchDate;
            const res = await createMatch(pl);
            if (!res._id) throw new Error(res.message || 'خطأ في الإضافة');
            setNewMatch({ team1: '', team2: '', group: 'أ', phase: 'groups', knockoutRound: '', matchDate: '' }); setShowAddForm(false); onRefresh?.();
        } catch (err) { setAddError(err.message || 'حدث خطأ'); }
    };

    const set = f => e => setNewMatch(p => ({ ...p, [f]: e.target.value }));

    return (
        <>
            {editingMatch && <EditMatchModal match={editingMatch} onClose={() => setEditingMatch(null)} onSaved={() => { setEditingMatch(null); onRefresh?.(); }} />}

            <div className="admin-section-header">
                <div className="admin-section-title-row">
                    <span className="admin-section-title">إدارة المباريات</span>
                    <span className="badge badge-muted">{matches.length}</span>
                </div>
                <button className={`btn ${showAddForm ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? '✕ إغلاق' : '+ مباراة جديدة'}
                </button>
            </div>

            {showAddForm && (
                <div className="admin-add-form-wrapper">
                    <form onSubmit={handleAdd} className="admin-add-form">
                        <div className="admin-add-form-header">
                            <span className="admin-add-form-title">إضافة مباراة جديدة</span>
                        </div>
                        <div className="admin-form-row">
                            <div className="form-group">
                                <label className="form-label">المجموعة</label>
                                <select className="form-select" value={newMatch.group}
                                    onChange={e => setNewMatch(p => ({ ...p, group: e.target.value, team1: '', team2: '' }))}>
                                    {GROUPS.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">التاريخ والوقت</label>
                                <input type="datetime-local" className="form-input" value={newMatch.matchDate} onChange={set('matchDate')} />
                            </div>
                        </div>
                        <div className="admin-vs-row">
                            <div className="form-group">
                                <label className="form-label">الفريق الأول</label>
                                <select className={`form-select ${newMatch.team1 ? 'input-gold' : ''}`} value={newMatch.team1} onChange={set('team1')}>
                                    <option value="">-- اختر --</option>
                                    {teams.filter(t => t.group === newMatch.group).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="admin-vs-badge">ضد</div>
                            <div className="form-group">
                                <label className="form-label">الفريق الثاني</label>
                                <select className={`form-select ${newMatch.team2 ? 'input-gold' : ''}`} value={newMatch.team2} onChange={set('team2')}>
                                    <option value="">-- اختر --</option>
                                    {teams.filter(t => t.group === newMatch.group).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        {addError && <div className="alert alert-error">{addError}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
                            <button className="btn btn-primary" type="submit">+ إضافة المباراة</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-matches-list">
                {matches.length === 0 ? (
                    <div className="admin-empty">لا توجد مباريات</div>
                ) : (
                    GROUPS.map(g => {
                        const groupMatches = matches.filter(m => m.phase !== 'knockout' && m.group === g);
                        if (groupMatches.length === 0) return null;

                        return (
                            <div key={g} className="admin-group-card">
                                <div className="admin-group-header">
                                    <span className="admin-group-badge">{g}</span>
                                    <h3 className="admin-group-name">المجموعة {g}</h3>
                                    <span className="badge badge-muted">{groupMatches.length} مباريات</span>
                                </div>
                                <div className="admin-match-grid">
                                    {groupMatches.map(m => {
                                        const done = m.status === 'Completed';
                                        const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                                        const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                                        const timeStr = m.matchDate ? new Date(m.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
                                        const dayStr = m.matchDate ? new Date(m.matchDate).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' }) : null;

                                        return (
                                            <div key={m._id} className={`admin-match-card ${done ? 'match-done' : ''}`}>
                                                <div className="admin-match-top">
                                                    <div className="admin-match-meta">
                                                        <span className={`match-status-chip ${done ? 'chip-done' : 'chip-pending'}`}>{done ? 'منتهية' : 'انتظار'}</span>
                                                        {m.matchDate && <span className="admin-match-date">{dayStr} {timeStr && `• ${timeStr}`}</span>}
                                                    </div>
                                                    <div className="admin-match-actions">
                                                        <button className="btn btn-ghost btn-xs" onClick={() => setEditingMatch(m)}>✏️</button>
                                                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(m._id)} disabled={deletingId === m._id}>{deletingId === m._id ? '…' : '🗑'}</button>
                                                    </div>
                                                </div>
                                                <div className="admin-match-body">
                                                    <div className="admin-match-team">
                                                        <span className={`admin-team-name ${w1 ? 'team-winner' : ''}`}>{m.team1?.name}</span>
                                                        {m.redCards1 > 0 && <span className="admin-red-card">{m.redCards1}</span>}
                                                    </div>
                                                    <div className="admin-match-center">
                                                        {done ? (
                                                            <div className="admin-scoreline">
                                                                <span className={w1 ? 'score-winner' : ''}>{m.score1}</span>
                                                                <span className="score-dash">–</span>
                                                                <span className={w2 ? 'score-winner' : ''}>{m.score2}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="admin-vs-text">VS</span>
                                                        )}
                                                        {m.hasPenalties && <span className="admin-pen-text">ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                                    </div>
                                                    <div className="admin-match-team admin-match-team-r">
                                                        <span className={`admin-team-name ${w2 ? 'team-winner' : ''}`}>{m.team2?.name}</span>
                                                        {m.redCards2 > 0 && <span className="admin-red-card">{m.redCards2}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}
