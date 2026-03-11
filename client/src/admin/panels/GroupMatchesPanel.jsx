import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { updateMatch, createMatch, deleteMatch } from '../../services/api';
import config from '../../tournament.config';

const GROUPS = config.groups;
const fmtLocal = (d) => { if (!d) return ''; const dt = new Date(d); const p = n => String(n).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`; };

/* ─── Edit Modal ─── */
function EditModal({ match, onClose, onSaved }) {
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
        <div className="adm-modal-overlay" onClick={onClose}>
            <div className="adm-modal" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-head">
                    <span className="adm-modal-title">تعديل المباراة</span>
                    <button className="adm-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="adm-modal-teams">
                    <div className="adm-modal-team">{match.team1?.name}</div>
                    <div className="adm-modal-vs">VS</div>
                    <div className="adm-modal-team">{match.team2?.name}</div>
                </div>
                <div className="adm-modal-body">
                    <div className="form-group">
                        <label className="form-label">تاريخ ووقت المباراة</label>
                        <input type="datetime-local" className="form-input" value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">الحالة</label>
                        <div className="adm-status-btns">
                            {[['Pending', 'قيد الانتظار'], ['Completed', 'منتهية']].map(([v, l]) => (
                                <button key={v} type="button" onClick={() => setStatus(v)}
                                    className={`adm-status-btn ${status === v ? (v === 'Completed' ? 'status-completed' : 'status-pending') : ''}`}
                                >{l}</button>
                            ))}
                        </div>
                    </div>
                    {status === 'Completed' && (<>
                        <div className="form-group">
                            <label className="form-label">النتيجة</label>
                            <div className="adm-score-row">
                                <div className="adm-score-col">
                                    <span className="adm-score-team">{match.team1?.name}</span>
                                    <input type="number" min="0" value={s1} onChange={e => setS1(e.target.value)} placeholder="0" className="form-input adm-score-input" />
                                </div>
                                <span className="adm-score-sep">–</span>
                                <div className="adm-score-col">
                                    <span className="adm-score-team">{match.team2?.name}</span>
                                    <input type="number" min="0" value={s2} onChange={e => setS2(e.target.value)} placeholder="0" className="form-input adm-score-input" />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label"><span className="adm-red-dot" />البطاقات الحمراء</label>
                            <div className="adm-score-row">
                                <div className="adm-score-col">
                                    <input type="number" min="0" max="11" value={rc1} onChange={e => setRc1(e.target.value)} className={`form-input adm-score-input ${rc1 > 0 ? 'input-danger' : ''}`} />
                                </div>
                                <span className="adm-score-sep">–</span>
                                <div className="adm-score-col">
                                    <input type="number" min="0" max="11" value={rc2} onChange={e => setRc2(e.target.value)} className={`form-input adm-score-input ${rc2 > 0 ? 'input-danger' : ''}`} />
                                </div>
                            </div>
                        </div>
                        {isKO && isDraw && (
                            <div className="adm-penalty-section">
                                <label className="adm-checkbox-label">
                                    <input type="checkbox" checked={hasPen} onChange={e => setHasPen(e.target.checked)} /> ضربات جزاء
                                </label>
                                {hasPen && (<div className="adm-score-row" style={{ marginTop: '.6rem' }}>
                                    <input type="number" min="0" value={p1} onChange={e => setP1(e.target.value)} placeholder="0" className="form-input adm-score-input" />
                                    <span className="adm-score-sep">–</span>
                                    <input type="number" min="0" value={p2} onChange={e => setP2(e.target.value)} placeholder="0" className="form-input adm-score-input" />
                                </div>)}
                            </div>
                        )}
                    </>)}
                    {error && <div className="adm-inline-error">{error}</div>}
                </div>
                <div className="adm-modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main ─── */
export default function GroupMatchesPanel() {
    const { groupMatches: matches, teams, fetchAll } = useAdmin();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMatch, setNewMatch] = useState({ team1: '', team2: '', group: 'أ', phase: 'groups', matchDate: '' });
    const [addError, setAddError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('هل تريد حذف هذه المباراة؟')) return;
        setDeletingId(id);
        try { await deleteMatch(id); fetchAll(); } catch (e) { console.error(e); }
        setDeletingId(null);
    };

    const handleAdd = async (e) => {
        e.preventDefault(); setAddError('');
        if (!newMatch.team1 || !newMatch.team2) return setAddError('اختر الفريقين');
        if (newMatch.team1 === newMatch.team2) return setAddError('لا يمكن أن يلعب الفريق ضد نفسه');
        try {
            const pl = { ...newMatch }; if (!pl.matchDate) delete pl.matchDate;
            const res = await createMatch(pl);
            if (!res._id) throw new Error(res.message || 'خطأ في الإضافة');
            setNewMatch({ team1: '', team2: '', group: 'أ', phase: 'groups', matchDate: '' }); setShowAddForm(false); fetchAll();
        } catch (err) { setAddError(err.message); }
    };

    return (
        <div className="adm-matches">
            {editingMatch && <EditModal match={editingMatch} onClose={() => setEditingMatch(null)} onSaved={() => { setEditingMatch(null); fetchAll(); }} />}

            <div className="adm-panel-header">
                <div className="adm-panel-header-right">
                    <h2 className="adm-panel-title">مباريات المجموعات</h2>
                    <span className="adm-count-badge">{matches.length}</span>
                </div>
                <button className={`btn ${showAddForm ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? '✕ إغلاق' : '+ مباراة جديدة'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="adm-add-card">
                    <form onSubmit={handleAdd} className="adm-add-form">
                        <div className="adm-add-row">
                            <div className="form-group">
                                <label className="form-label">المجموعة</label>
                                <select className="form-select" value={newMatch.group}
                                    onChange={e => setNewMatch(p => ({ ...p, group: e.target.value, team1: '', team2: '' }))}>
                                    {GROUPS.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">الفريق الأول</label>
                                <select className="form-select" value={newMatch.team1} onChange={e => setNewMatch(p => ({ ...p, team1: e.target.value }))}>
                                    <option value="">-- اختر --</option>
                                    {teams.filter(t => t.group === newMatch.group).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">الفريق الثاني</label>
                                <select className="form-select" value={newMatch.team2} onChange={e => setNewMatch(p => ({ ...p, team2: e.target.value }))}>
                                    <option value="">-- اختر --</option>
                                    {teams.filter(t => t.group === newMatch.group).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">التاريخ</label>
                                <input type="datetime-local" className="form-input" value={newMatch.matchDate} onChange={e => setNewMatch(p => ({ ...p, matchDate: e.target.value }))} />
                            </div>
                        </div>
                        {addError && <div className="adm-inline-error">{addError}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
                            <button className="btn btn-primary btn-sm" type="submit">+ إضافة المباراة</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Match list grouped by group */}
            <div className="adm-match-groups">
                {matches.length === 0 ? (
                    <div className="adm-empty-state">لا توجد مباريات — اضغط "+ مباراة جديدة"</div>
                ) : (
                    GROUPS.map(g => {
                        const gMatches = matches.filter(m => m.group === g);
                        if (!gMatches.length) return null;
                        return (
                            <div key={g} className="adm-match-group">
                                <div className="adm-match-group-head">
                                    <span className="adm-group-badge">{g}</span>
                                    <h3 className="adm-group-name">المجموعة {g}</h3>
                                    <span className="adm-count-badge">{gMatches.length}</span>
                                </div>
                                <div className="adm-match-grid">
                                    {gMatches.map(m => {
                                        const done = m.status === 'Completed';
                                        const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                                        const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                                        const dayStr = m.matchDate ? new Date(m.matchDate).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' }) : null;
                                        const timeStr = m.matchDate ? new Date(m.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
                                        return (
                                            <div key={m._id} className={`adm-match-card ${done ? 'adm-match-done' : ''}`}>
                                                <div className="adm-match-top">
                                                    <div className="adm-match-meta">
                                                        <span className={`adm-status-chip ${done ? 'chip-done' : 'chip-pending'}`}>{done ? 'منتهية' : 'انتظار'}</span>
                                                        {m.matchDate && <span className="adm-match-date">{dayStr} {timeStr && `• ${timeStr}`}</span>}
                                                    </div>
                                                    <div className="adm-match-btns">
                                                        <button className="btn btn-ghost btn-xs" onClick={() => setEditingMatch(m)}>✏️</button>
                                                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(m._id)} disabled={deletingId === m._id}>{deletingId === m._id ? '…' : '🗑️'}</button>
                                                    </div>
                                                </div>
                                                <div className="adm-match-body">
                                                    <div className="adm-match-team">
                                                        <span className={`adm-match-tname ${w1 ? 'adm-winner' : ''}`}>{m.team1?.name}</span>
                                                        {m.redCards1 > 0 && <span className="adm-red-card">{m.redCards1}</span>}
                                                    </div>
                                                    <div className="adm-match-center">
                                                        {done ? (
                                                            <div className="adm-scoreline">
                                                                <span className={w1 ? 'adm-score-win' : ''}>{m.score1}</span>
                                                                <span className="adm-score-dash">–</span>
                                                                <span className={w2 ? 'adm-score-win' : ''}>{m.score2}</span>
                                                            </div>
                                                        ) : <span className="adm-vs-text">VS</span>}
                                                        {m.hasPenalties && <span className="adm-pen-badge">ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                                    </div>
                                                    <div className="adm-match-team adm-match-team-l">
                                                        <span className={`adm-match-tname ${w2 ? 'adm-winner' : ''}`}>{m.team2?.name}</span>
                                                        {m.redCards2 > 0 && <span className="adm-red-card">{m.redCards2}</span>}
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
        </div>
    );
}
