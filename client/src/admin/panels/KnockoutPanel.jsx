import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import {
    setPhase, setQualifiedTeams, setBracketSlots,
    getRankings, generateKnockout,
    createMatch, updateMatch, deleteMatch,
} from '../../services/api';
import config from '../../tournament.config';

const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];
const ROUND_POS = { 'ربع النهائي': 4, 'نصف النهائي': 2, 'نهائي الترتيب': 1, 'النهائي': 1 };
const GROUPS = ['أ', 'ب', 'ج', 'د'];
const fmtLocal = d => { if (!d) return ''; const dt = new Date(d); const p = n => String(n).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`; };
const fmt = d => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

/* ──── KO Edit Modal ──── */
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
            const pl = { matchDate: matchDate ? new Date(matchDate).toISOString() : null, status, score1: status === 'Completed' ? Number(s1) : undefined, score2: status === 'Completed' ? Number(s2) : undefined, hasPenalties: status === 'Completed' && isDraw && hasPen, penaltyScore1: status === 'Completed' && isDraw && hasPen ? Number(p1) || 0 : null, penaltyScore2: status === 'Completed' && isDraw && hasPen ? Number(p2) || 0 : null };
            const res = await updateMatch(match._id, pl);
            if (res.message && !res.match) throw new Error(res.message);
            onSaved?.(); onClose();
        } catch (e) { setError(e.message || 'حدث خطأ'); } finally { setSaving(false); }
    };

    return (
        <div className="adm-modal-overlay" onClick={onClose}>
            <div className="adm-modal" onClick={e => e.stopPropagation()}>
                <div className="adm-modal-head">
                    <span className="adm-modal-title">تعديل مباراة الإقصاء</span>
                    <button className="adm-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="adm-modal-teams">
                    <div className="adm-modal-team">{match.team1?.name}</div>
                    <div className="adm-modal-vs">{match.knockoutRound || 'VS'}</div>
                    <div className="adm-modal-team">{match.team2?.name}</div>
                </div>
                <div className="adm-modal-body">
                    <div className="form-group">
                        <label className="form-label">التاريخ</label>
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
                        {isDraw && (
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
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? '...' : 'حفظ'}</button>
                </div>
            </div>
        </div>
    );
}

/* ──── Main Knockout Panel ──── */
export default function KnockoutPanel() {
    const { settings, teams, koMatches, fetchAll } = useAdmin();
    const [phaseLoading, setPhaseLoading] = useState(false);
    const [rankings, setRankings] = useState(null);
    const [loadingRank, setLoadingRank] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [err, setErr] = useState('');
    const [showAddKO, setShowAddKO] = useState(false);
    const [editingMatch, setEditingMatch] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // ── Add KO form state
    const [addRound, setAddRound] = useState('ربع النهائي');
    const [addPos, setAddPos] = useState(1);
    const [addT1, setAddT1] = useState(''); const [addT2, setAddT2] = useState('');
    const [addDate, setAddDate] = useState(''); const [addErr, setAddErr] = useState('');

    const activateKO = async () => { setPhaseLoading(true); await setPhase('knockout'); fetchAll(); setPhaseLoading(false); };
    const deactivateKO = async () => { setPhaseLoading(true); await setPhase('groups'); fetchAll(); setPhaseLoading(false); };

    const loadRankings = async () => {
        setLoadingRank(true);
        try {
            const data = await getRankings();
            if (data.message) throw new Error(data.message);
            setRankings(data);
        } catch (e) { setErr(e.message); }
        finally { setLoadingRank(false); }
    };

    const doGenerate = async () => {
        setGenerating(true); setErr(''); setResult(null);
        try {
            const data = await generateKnockout();
            if (data.message && !data.bracket) throw new Error(data.message);
            setResult(data); fetchAll();
        } catch (e) { setErr(e.message || 'حدث خطأ'); }
        finally { setGenerating(false); }
    };

    const handleDeleteKO = async (id) => {
        if (!window.confirm('حذف هذه المباراة؟')) return;
        setDeleting(id); await deleteMatch(id); setDeleting(null); fetchAll();
    };

    const handleAddKO = async (e) => {
        e.preventDefault(); setAddErr('');
        if (!addT1 || !addT2) return setAddErr('اختر الفريقين');
        if (addT1 === addT2) return setAddErr('نفس الفريق!');
        try {
            const res = await createMatch({ team1: addT1, team2: addT2, group: 'knockout', phase: 'knockout', knockoutRound: addRound, bracketPosition: addPos, matchDate: addDate || null });
            if (!res._id) throw new Error(res.message || 'خطأ');
            setAddT1(''); setAddT2(''); setAddDate(''); setShowAddKO(false); fetchAll();
        } catch (err) { setAddErr(err.message); }
    };

    const getWinner = m => {
        if (m.status !== 'Completed') return null;
        if (m.hasPenalties) return m.penaltyScore1 > m.penaltyScore2 ? m.team1 : m.team2;
        if (m.score1 > m.score2) return m.team1;
        if (m.score2 > m.score1) return m.team2;
        return null;
    };

    const eligible = (settings?.qualifiedTeams || []).length > 0 ? settings.qualifiedTeams : teams;
    const maxPos = ROUND_POS[addRound] || 1;
    const taken = koMatches.filter(m => m.knockoutRound === addRound).map(m => m.bracketPosition);

    return (
        <div className="adm-knockout">
            {editingMatch && <KOEditModal match={editingMatch} onClose={() => setEditingMatch(null)} onSaved={() => { setEditingMatch(null); fetchAll(); }} />}

            {/* Phase Banner */}
            <div className={`adm-phase-banner ${settings?.phase === 'knockout' ? 'adm-phase-active' : ''}`}>
                {settings?.phase === 'knockout' ? (
                    <>
                        <span className="adm-phase-status">🟢 مرحلة الإقصاء مفعّلة</span>
                        <button className="btn btn-ghost btn-sm" onClick={deactivateKO} disabled={phaseLoading}>↩ رجوع للمجموعات</button>
                    </>
                ) : (
                    <>
                        <span className="adm-phase-status">⚠️ مرحلة المجموعات نشطة</span>
                        <button className="btn btn-primary btn-sm" onClick={activateKO} disabled={phaseLoading}>{phaseLoading ? '⏳' : '🏆 تفعيل الإقصاء'}</button>
                    </>
                )}
            </div>

            {/* Auto Generate Section */}
            <div className="adm-ko-section">
                <div className="adm-ko-section-head">
                    <div className="adm-ko-step">
                        <span className="adm-step-num">١</span>
                        <div>
                            <div className="adm-step-title">توليد القرعة التلقائية</div>
                            <div className="adm-step-desc">فرز المجموعات → نظام المقص → إنشاء ربع النهائي</div>
                        </div>
                    </div>
                </div>
                <div className="adm-ko-actions">
                    <button className="btn btn-ghost btn-sm" onClick={loadRankings} disabled={loadingRank}>{loadingRank ? '⏳' : '📊 عرض الترتيب'}</button>
                    <button className="btn btn-primary" onClick={doGenerate} disabled={generating}>{generating ? '⏳ جاري...' : '🔀 توليد تلقائي'}</button>
                </div>
                {err && <div className="adm-inline-error" style={{ marginTop: '.75rem' }}>{err}</div>}

                {/* Rankings preview */}
                {rankings && (
                    <div className="adm-rankings-preview">
                        <div className="adm-rankings-title">ترتيب المجموعات (نقاط → فارق أهداف → مواجهات مباشرة)</div>
                        <div className="adm-rankings-grid">
                            {GROUPS.map(g => {
                                const gTeams = rankings[g] || [];
                                return (
                                    <div key={g} className="adm-rank-group">
                                        <div className="adm-rank-group-title">المجموعة {g}</div>
                                        {gTeams.map((t, i) => (
                                            <div key={t._id} className={`adm-rank-row ${i < 2 ? 'adm-rank-qualified' : ''}`}>
                                                <span className="adm-rank-num">{i + 1}</span>
                                                <span className="adm-rank-name">{t.name}</span>
                                                <span className="adm-rank-pts">{t.points}ن</span>
                                                <span className="adm-rank-gd">{t.gd >= 0 ? '+' : ''}{t.gd}</span>
                                                {i < 2 && <span className="adm-rank-badge">متأهل</span>}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Generated result */}
                {result?.bracket && (
                    <div className="adm-gen-result">
                        <div className="adm-gen-title">✅ {result.message}</div>
                        <table className="adm-gen-table">
                            <thead><tr><th>المباراة</th><th>الطرف الأول</th><th></th><th>الطرف الثاني</th></tr></thead>
                            <tbody>
                                {result.bracket.map(r => (
                                    <tr key={r.position}>
                                        <td>ربع {r.position}</td>
                                        <td>{r.team1.name}<span className="adm-gtag">م·{r.team1.group}</span></td>
                                        <td>ضد</td>
                                        <td>{r.team2.name}<span className="adm-gtag">م·{r.team2.group}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Match Management Section */}
            <div className="adm-ko-section">
                <div className="adm-ko-section-head">
                    <div className="adm-ko-step">
                        <span className="adm-step-num">٢</span>
                        <div>
                            <div className="adm-step-title">إدارة المباريات</div>
                            <div className="adm-step-desc">تواريخ، نتائج، ضربات جزاء</div>
                        </div>
                        <span className="adm-count-badge">{koMatches.length} مباراة</span>
                    </div>
                    <button className={`btn ${showAddKO ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={() => setShowAddKO(s => !s)}>
                        {showAddKO ? '✕ إغلاق' : '+ إضافة مباراة'}
                    </button>
                </div>

                {/* Add KO match */}
                {showAddKO && (
                    <form onSubmit={handleAddKO} className="adm-add-card" style={{ marginTop: '.75rem' }}>
                        <div className="adm-add-row">
                            <div className="form-group">
                                <label className="form-label">الدور</label>
                                <select className="form-select" value={addRound} onChange={e => { setAddRound(e.target.value); setAddPos(1); }}>
                                    {KO_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            {maxPos > 1 && (
                                <div className="form-group">
                                    <label className="form-label">القرعة</label>
                                    <select className="form-select" value={addPos} onChange={e => setAddPos(+e.target.value)}>
                                        {Array.from({ length: maxPos }, (_, i) => i + 1).map(p => (
                                            <option key={p} value={p} disabled={taken.includes(p)}>م{p}{taken.includes(p) ? ' ✓' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">الأول</label>
                                <select className="form-select" value={addT1} onChange={e => setAddT1(e.target.value)}>
                                    <option value="">— اختر —</option>
                                    {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">الثاني</label>
                                <select className="form-select" value={addT2} onChange={e => setAddT2(e.target.value)}>
                                    <option value="">— اختر —</option>
                                    {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">التاريخ</label>
                                <input type="datetime-local" className="form-input" value={addDate} onChange={e => setAddDate(e.target.value)} />
                            </div>
                        </div>
                        {addErr && <div className="adm-inline-error">{addErr}</div>}
                        <div><button className="btn btn-primary btn-sm" type="submit">+ إضافة</button></div>
                    </form>
                )}

                {/* KO match list */}
                {KO_ROUNDS.map(round => {
                    const rows = koMatches.filter(m => m.knockoutRound === round);
                    if (!rows.length) return null;
                    return (
                        <div key={round} className="adm-ko-round">
                            <div className="adm-ko-round-head">
                                <span className="adm-ko-round-dot" />
                                {round}
                            </div>
                            {rows.map(m => {
                                const done = m.status === 'Completed';
                                const winner = getWinner(m);
                                const w1 = done && winner?._id === (m.team1?._id || m.team1);
                                const w2 = done && winner?._id === (m.team2?._id || m.team2);
                                return (
                                    <div key={m._id} className={`adm-ko-match ${done ? 'adm-match-done' : ''}`}>
                                        <div className="adm-ko-match-teams">
                                            {m.bracketPosition && <span className="adm-ko-pos">م{m.bracketPosition}</span>}
                                            <span className={`adm-ko-tname ${w1 ? 'adm-winner' : ''}`}>{m.team1?.name}</span>
                                            <div className="adm-ko-score-box">
                                                <span className={w1 ? 'adm-score-win' : ''}>{done ? m.score1 : '–'}</span>
                                                <span className="adm-ko-score-sep">:</span>
                                                <span className={w2 ? 'adm-score-win' : ''}>{done ? m.score2 : '–'}</span>
                                            </div>
                                            {m.hasPenalties && <span className="adm-pen-badge">ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                            <span className={`adm-ko-tname ${w2 ? 'adm-winner' : ''}`}>{m.team2?.name}</span>
                                        </div>
                                        <div className="adm-ko-match-info">
                                            <div>
                                                <span className={`adm-status-chip ${done ? 'chip-done' : 'chip-pending'}`}>{done ? 'منتهية' : 'انتظار'}</span>
                                                {done && winner && <span className="adm-ko-winner-label">🏆 {winner.name}</span>}
                                                {m.matchDate && <span className="adm-match-date">{fmt(m.matchDate)}</span>}
                                            </div>
                                            <div className="adm-ko-match-btns">
                                                <button className="btn btn-ghost btn-xs" onClick={() => setEditingMatch(m)}>✏ تعديل</button>
                                                <button className="btn btn-danger btn-xs" onClick={() => handleDeleteKO(m._id)} disabled={deleting === m._id}>{deleting === m._id ? '…' : '🗑️'}</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                {koMatches.length === 0 && !showAddKO && (
                    <div className="adm-empty-state">لا توجد مباريات إقصاء — استخدم التوليد التلقائي أو أضف يدوياً</div>
                )}
            </div>
        </div>
    );
}
