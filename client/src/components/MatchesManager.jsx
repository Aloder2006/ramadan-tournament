import { useState } from 'react';
import { updateMatch, createMatch, deleteMatch } from '../services/api';

const GROUPS = ['أ', 'ب', 'ج', 'د'];
const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];

const formatLocalDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const displayDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('ar-EG', {
        weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
};

/* ──────────────────────────────────────────
   UNIFIED EDIT MODAL
────────────────────────────────────────── */
function EditMatchModal({ match, onClose, onSaved }) {
    const [matchDate, setMatchDate] = useState(formatLocalDate(match.matchDate));
    const [status, setStatus] = useState(match.status);
    const [s1, setS1] = useState(match.score1 ?? '');
    const [s2, setS2] = useState(match.score2 ?? '');
    const [rc1, setRc1] = useState(match.redCards1 ?? 0);
    const [rc2, setRc2] = useState(match.redCards2 ?? 0);
    const [hasPen, setHasPen] = useState(match.hasPenalties || false);
    const [p1, setP1] = useState(match.penaltyScore1 ?? '');
    const [p2, setP2] = useState(match.penaltyScore2 ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const isDraw = s1 !== '' && s2 !== '' && Number(s1) === Number(s2);
    const isKO = match.phase === 'knockout';

    const handleSave = async () => {
        setError('');
        if (status === 'Completed' && (s1 === '' || s2 === ''))
            return setError('أدخل النتيجة أو غيّر الحالة إلى "قيد الانتظار"');
        setSaving(true);
        try {
            const payload = {
                matchDate: matchDate || null,
                status,
                score1: status === 'Completed' ? Number(s1) : undefined,
                score2: status === 'Completed' ? Number(s2) : undefined,
                redCards1: Number(rc1) || 0,
                redCards2: Number(rc2) || 0,
            };
            if (isKO && status === 'Completed' && isDraw && hasPen) {
                payload.hasPenalties = true;
                payload.penaltyScore1 = Number(p1) || 0;
                payload.penaltyScore2 = Number(p2) || 0;
            } else {
                payload.hasPenalties = false;
            }
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
                    <h3 className="modal-title">✏️ تعديل المباراة</h3>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-teams-display">
                    <span className="modal-team">{match.team1?.name}</span>
                    <span className="modal-vs">VS</span>
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
                            <button
                                type="button"
                                className={`status-toggle-btn ${status === 'Pending' ? 'active-pending' : ''}`}
                                onClick={() => setStatus('Pending')}
                            >⏳ قيد الانتظار</button>
                            <button
                                type="button"
                                className={`status-toggle-btn ${status === 'Completed' ? 'active-done' : ''}`}
                                onClick={() => setStatus('Completed')}
                            >✅ منتهية</button>
                        </div>
                    </div>

                    {/* Score — only if Completed */}
                    {status === 'Completed' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">النتيجة</label>
                                <div className="modal-score-row">
                                    <div className="modal-score-side">
                                        <span className="modal-score-label">{match.team1?.name}</span>
                                        <input type="number" min="0" className="score-input score-input-lg" value={s1}
                                            onChange={(e) => setS1(e.target.value)} placeholder="0" />
                                    </div>
                                    <span className="score-dash">-</span>
                                    <div className="modal-score-side">
                                        <span className="modal-score-label">{match.team2?.name}</span>
                                        <input type="number" min="0" className="score-input score-input-lg" value={s2}
                                            onChange={(e) => setS2(e.target.value)} placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            {/* Red Cards */}
                            <div className="form-group">
                                <label className="form-label">🟥 البطاقات الحمراء</label>
                                <div className="modal-score-row">
                                    <div className="modal-score-side">
                                        <span className="modal-score-label">{match.team1?.name}</span>
                                        <input type="number" min="0" max="11" className="score-input" value={rc1}
                                            onChange={(e) => setRc1(e.target.value)} />
                                    </div>
                                    <span className="score-dash">—</span>
                                    <div className="modal-score-side">
                                        <span className="modal-score-label">{match.team2?.name}</span>
                                        <input type="number" min="0" max="11" className="score-input" value={rc2}
                                            onChange={(e) => setRc2(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Penalties — only for KO draws */}
                            {isKO && isDraw && (
                                <div className="form-group">
                                    <label className="form-label ko-pen-label">
                                        <input type="checkbox" checked={hasPen}
                                            onChange={(e) => setHasPen(e.target.checked)} />
                                        🥅 ضربات جزاء
                                    </label>
                                    {hasPen && (
                                        <div className="modal-score-row" style={{ marginTop: '0.5rem' }}>
                                            <input type="number" min="0" className="score-input" value={p1}
                                                onChange={(e) => setP1(e.target.value)} placeholder="0" />
                                            <span className="score-dash">-</span>
                                            <input type="number" min="0" className="score-input" value={p2}
                                                onChange={(e) => setP2(e.target.value)} placeholder="0" />
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
                        {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   MAIN MatchesManager
────────────────────────────────────────── */
export default function MatchesManager({ matches, teams, onRefresh, defaultPhase }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMatch, setNewMatch] = useState({
        team1: '', team2: '',
        group: 'أ',
        phase: defaultPhase || 'groups',
        knockoutRound: defaultPhase === 'knockout' ? 'ربع النهائي' : '',
        matchDate: '',
    });
    const [addError, setAddError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);

    const handleDeleteMatch = async (id) => {
        if (!window.confirm('هل تريد حذف هذه المباراة؟ سيتم عكس الإحصائيات إذا كانت مكتملة.')) return;
        setDeletingId(id);
        try { await deleteMatch(id); onRefresh?.(); } catch (e) { console.error(e); }
        setDeletingId(null);
    };

    const handleAddMatch = async (e) => {
        e.preventDefault();
        setAddError('');
        if (!newMatch.team1 || !newMatch.team2) return setAddError('اختر الفريقين');
        if (newMatch.team1 === newMatch.team2) return setAddError('لا يمكن أن يلعب الفريق ضد نفسه');
        try {
            const payload = { ...newMatch };
            if (payload.phase === 'groups') delete payload.knockoutRound;
            if (!payload.matchDate) delete payload.matchDate;
            const res = await createMatch(payload);
            if (!res._id) throw new Error(res.message || 'خطأ في الإضافة');
            setNewMatch({ team1: '', team2: '', group: 'أ', phase: 'groups', knockoutRound: '', matchDate: '' });
            setShowAddForm(false);
            onRefresh?.();
        } catch (err) {
            setAddError(err.message || 'حدث خطأ');
        }
    };

    const set = (field) => (e) => setNewMatch((p) => ({ ...p, [field]: e.target.value }));

    return (
        <>
            {editingMatch && (
                <EditMatchModal
                    match={editingMatch}
                    onClose={() => setEditingMatch(null)}
                    onSaved={() => { setEditingMatch(null); onRefresh?.(); }}
                />
            )}

            <div className="card">
                <div className="card-title-row">
                    <h2 className="card-title"><span className="icon">📋</span> إدارة المباريات
                        <span className="count-badge">{matches.length}</span>
                    </h2>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? '✕ إغلاق' : '+ مباراة جديدة'}
                    </button>
                </div>

                {showAddForm && (
                    <form onSubmit={handleAddMatch} className="add-match-form">
                        <div className="form-group">
                            <label className="form-label">المرحلة</label>
                            <select className="form-select" value={newMatch.phase} onChange={set('phase')}>
                                <option value="groups">مجموعات</option>
                                <option value="knockout">إقصاء</option>
                            </select>
                        </div>
                        {newMatch.phase === 'groups' ? (
                            <div className="form-group">
                                <label className="form-label">المجموعة</label>
                                <select className="form-select" value={newMatch.group} onChange={set('group')}>
                                    {GROUPS.map((g) => <option key={g} value={g}>المجموعة {g}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">الدور</label>
                                <select className="form-select" value={newMatch.knockoutRound} onChange={set('knockoutRound')}>
                                    <option value="">-- اختر --</option>
                                    {KO_ROUNDS.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">الفريق الأول</label>
                            <select className="form-select" value={newMatch.team1} onChange={set('team1')}>
                                <option value="">-- اختر --</option>
                                {teams.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.group})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">الفريق الثاني</label>
                            <select className="form-select" value={newMatch.team2} onChange={set('team2')}>
                                <option value="">-- اختر --</option>
                                {teams.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.group})</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">📅 تاريخ ووقت المباراة</label>
                            <input type="datetime-local" className="form-input" value={newMatch.matchDate} onChange={set('matchDate')} />
                        </div>
                        <button className="btn btn-primary" type="submit">➕ إضافة</button>
                        {addError && <p className="alert alert-error" style={{ width: '100%' }}>{addError}</p>}
                    </form>
                )}

                <div className="table-wrapper">
                    <table className="matches-table">
                        <thead>
                            <tr>
                                <th>المج</th>
                                <th>الفريق ١</th>
                                <th>النتيجة</th>
                                <th>الفريق ٢</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th>تعديل</th>
                                <th>حذف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length === 0 ? (
                                <tr><td colSpan="8" className="empty-cell">لا توجد مباريات</td></tr>
                            ) : matches.map((match) => (
                                <tr key={match._id} className={match.status === 'Completed' ? 'completed-row' : ''}>
                                    <td><span className="group-chip">{match.group}</span></td>
                                    <td className="team-cell-name">
                                        {match.team1?.name}
                                        {match.redCards1 > 0 && <span className="rc-mini">🟥{match.redCards1}</span>}
                                    </td>
                                    <td className="score-display">
                                        {match.status === 'Completed'
                                            ? <><b>{match.score1} - {match.score2}</b>{match.hasPenalties && <small className="pen-tag-sm"> (ج {match.penaltyScore1}-{match.penaltyScore2})</small>}</>
                                            : '—'}
                                    </td>
                                    <td className="team-cell-name">
                                        {match.redCards2 > 0 && <span className="rc-mini">🟥{match.redCards2}</span>}
                                        {match.team2?.name}
                                    </td>
                                    <td>
                                        {match.matchDate
                                            ? <span className="date-text">📅 {displayDate(match.matchDate)}</span>
                                            : <span className="date-placeholder">—</span>}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${match.status === 'Completed' ? 'completed' : 'pending'}`}>
                                            {match.status === 'Completed' ? 'منتهية' : 'قيد الانتظار'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs" onClick={() => setEditingMatch(match)}
                                            title="تعديل المباراة">✏️</button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-xs"
                                            onClick={() => handleDeleteMatch(match._id)}
                                            disabled={deletingId === match._id}
                                        >{deletingId === match._id ? '⏳' : '🗑️'}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
