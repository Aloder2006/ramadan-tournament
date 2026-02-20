import { useState } from 'react';
import { toggleToday, saveResult, createMatch, deleteMatch, updateMatchDate } from '../services/api';

const GROUPS = ['أ', 'ب', 'ج', 'د'];
const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];

const formatLocalDate = (d) => {
    if (!d) return '';
    // Convert ISO to datetime-local format for the input
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

function ResultForm({ match, onResultSaved }) {
    const [s1, setS1] = useState(match.score1 ?? '');
    const [s2, setS2] = useState(match.score2 ?? '');
    const [rc1, setRc1] = useState(match.redCards1 ?? 0);
    const [rc2, setRc2] = useState(match.redCards2 ?? 0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (s1 === '' || s2 === '') return setError('أدخل الأهداف');
        setLoading(true);
        setError('');
        try {
            const res = await saveResult(match._id, s1, s2, rc1, rc2);
            if (!res.match && res.message && !res.message.includes('بنجاح')) throw new Error(res.message);
            if (onResultSaved) onResultSaved();
        } catch (err) {
            setError(err.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="result-form">
            <div className="score-row">
                <input type="number" min="0" className="score-input" placeholder="0" value={s1} onChange={(e) => setS1(e.target.value)} />
                <span className="score-sep">-</span>
                <input type="number" min="0" className="score-input" placeholder="0" value={s2} onChange={(e) => setS2(e.target.value)} />
            </div>
            <div className="red-cards-row">
                <label className="rc-label">🟥<input type="number" min="0" max="11" className="score-input rc-input" value={rc1} onChange={(e) => setRc1(e.target.value)} /></label>
                <span className="rc-sep">ك</span>
                <label className="rc-label"><input type="number" min="0" max="11" className="score-input rc-input" value={rc2} onChange={(e) => setRc2(e.target.value)} />🟥</label>
            </div>
            <button className="btn btn-success btn-xs" onClick={handleSave} disabled={loading}>
                {loading ? '⏳' : match.status === 'Completed' ? '✏️' : '💾'}
            </button>
            {error && <span className="inline-error">{error}</span>}
        </div>
    );
}

function DateCell({ match, onRefresh }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(formatLocalDate(match.matchDate));
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        await updateMatchDate(match._id, val || null);
        setSaving(false);
        setEditing(false);
        onRefresh?.();
    };

    if (editing) {
        return (
            <div className="date-cell-edit">
                <input
                    type="datetime-local"
                    className="form-input"
                    style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                />
                <button className="btn btn-success btn-xs" onClick={save} disabled={saving}>✓</button>
                <button className="btn btn-ghost btn-xs" onClick={() => setEditing(false)}>✕</button>
            </div>
        );
    }

    return (
        <div className="date-cell" onClick={() => setEditing(true)} title="انقر للتعديل" style={{ cursor: 'pointer' }}>
            {match.matchDate
                ? <span className="date-text">📅 {displayDate(match.matchDate)}</span>
                : <span className="date-placeholder">+ تاريخ</span>}
        </div>
    );
}

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
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);


    const handleToggleToday = async (id) => {
        setTogglingId(id);
        try { await toggleToday(id); onRefresh?.(); } catch (e) { console.error(e); }
        setTogglingId(null);
    };

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
        <div className="card">
            <div className="card-title-row">
                <h2 className="card-title"><span className="icon">📋</span> إدارة المباريات</h2>
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
                            <th>اليوم</th>
                            <th>النتيجة</th>
                            <th>حذف</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.length === 0 ? (
                            <tr><td colSpan="9" className="empty-cell">لا توجد مباريات</td></tr>
                        ) : matches.map((match) => (
                            <tr key={match._id} className={match.status === 'Completed' ? 'completed-row' : ''}>
                                <td><span className="group-chip">{match.group}</span></td>
                                <td className="team-cell-name">
                                    {match.team1?.name}
                                    {match.redCards1 > 0 && <span className="rc-mini">🟥{match.redCards1}</span>}
                                </td>
                                <td className="score-display">
                                    {match.status === 'Completed' ? `${match.score1} - ${match.score2}` : '—'}
                                </td>
                                <td className="team-cell-name">
                                    {match.redCards2 > 0 && <span className="rc-mini">🟥{match.redCards2}</span>}
                                    {match.team2?.name}
                                </td>
                                <td><DateCell match={match} onRefresh={onRefresh} /></td>
                                <td>
                                    <span className={`status-badge ${match.status === 'Completed' ? 'completed' : 'pending'}`}>
                                        {match.status === 'Completed' ? 'منتهية' : 'قيد الانتظار'}
                                    </span>
                                </td>
                                <td>
                                    {match.status !== 'Completed' && (
                                        <button
                                            className={`toggle-btn ${match.isToday ? 'active' : ''}`}
                                            onClick={() => handleToggleToday(match._id)}
                                            disabled={togglingId === match._id}
                                        >
                                            {match.isToday ? '👁' : '🚫'}
                                        </button>
                                    )}
                                </td>
                                <td><ResultForm match={match} onResultSaved={onRefresh} /></td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-xs"
                                        onClick={() => handleDeleteMatch(match._id)}
                                        disabled={deletingId === match._id}
                                    >🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
