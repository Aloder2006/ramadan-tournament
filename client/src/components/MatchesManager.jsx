import { useState } from 'react';
import { updateMatch, createMatch, deleteMatch } from '../services/api';

const GROUPS = ['أ', 'ب', 'ج', 'د'];
const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];
const fmtLocal = (d) => { if (!d) return ''; const dt = new Date(d); const p = n => String(n).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`; };
const fmtDisplay = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

const inp = (extra = {}) => ({ padding: '.45rem .65rem', background: 'var(--bg-input,#0f1117)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontSize: '.9rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', ...extra });
const lbl = { display: 'block', fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' };

function Av({ name, win }) {
    return <div style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0, background: win ? 'var(--gold-dim)' : 'var(--bg-elevated)', border: `1px solid ${win ? 'var(--gold-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 900, color: win ? 'var(--gold)' : 'var(--text-muted)', fontFamily: 'Inter,sans-serif' }}>{name?.[0] || '?'}</div>;
}

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
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--gold)' }}>تعديل المباراة</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '.5rem', padding: '.85rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-primary)', textAlign: 'right' }}>{match.team1?.name}</div>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '.2rem .5rem', border: '1px solid var(--border)', borderRadius: 3 }}>VS</div>
                    <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-primary)', textAlign: 'left' }}>{match.team2?.name}</div>
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.85rem', overflowY: 'auto', maxHeight: '65vh' }}>
                    <div><label style={lbl}>تاريخ ووقت المباراة</label><input type="datetime-local" value={matchDate} onChange={e => setMatchDate(e.target.value)} style={inp()} /></div>
                    <div>
                        <label style={lbl}>الحالة</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                            {[['Pending', 'قيد الانتظار'], ['Completed', 'منتهية']].map(([v, l]) => (
                                <button key={v} onClick={() => setStatus(v)} style={{ padding: '.5rem', border: `1px solid ${status === v ? (v === 'Completed' ? 'var(--success)' : 'var(--gold)') : 'var(--border)'}`, borderRadius: 4, background: status === v ? (v === 'Completed' ? 'rgba(61,186,114,.15)' : 'var(--gold-dim)') : 'var(--bg-elevated)', color: status === v ? (v === 'Completed' ? 'var(--success)' : 'var(--gold)') : 'var(--text-muted)', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
                            ))}
                        </div>
                    </div>
                    {status === 'Completed' && (<>
                        <div>
                            <label style={lbl}>النتيجة</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', gap: '.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>{match.team1?.name}</span>
                                    <input type="number" min="0" value={s1} onChange={e => setS1(e.target.value)} placeholder="0" style={inp({ textAlign: 'center', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Inter,sans-serif', padding: '.6rem' })} />
                                </div>
                                <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', paddingBottom: '.4rem' }}>–</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', textAlign: 'left' }}>{match.team2?.name}</span>
                                    <input type="number" min="0" value={s2} onChange={e => setS2(e.target.value)} placeholder="0" style={inp({ textAlign: 'center', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Inter,sans-serif', padding: '.6rem' })} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={lbl}><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--danger)', borderRadius: 1, marginLeft: '.3rem' }} />البطاقات الحمراء</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', gap: '.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>{match.team1?.name}</span>
                                    <input type="number" min="0" max="11" value={rc1} onChange={e => setRc1(e.target.value)} style={inp({ textAlign: 'center', fontFamily: 'Inter,sans-serif', borderColor: rc1 > 0 ? 'var(--danger)' : 'var(--border)' })} />
                                </div>
                                <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', paddingBottom: '.4rem' }}>–</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                                    <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', textAlign: 'left' }}>{match.team2?.name}</span>
                                    <input type="number" min="0" max="11" value={rc2} onChange={e => setRc2(e.target.value)} style={inp({ textAlign: 'center', fontFamily: 'Inter,sans-serif', borderColor: rc2 > 0 ? 'var(--danger)' : 'var(--border)' })} />
                                </div>
                            </div>
                        </div>
                        {isKO && isDraw && (
                            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '.65rem .85rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                    <input type="checkbox" checked={hasPen} onChange={e => setHasPen(e.target.checked)} /> ضربات جزاء
                                </label>
                                {hasPen && (<div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '.5rem', marginTop: '.6rem', alignItems: 'center' }}>
                                    <input type="number" min="0" value={p1} onChange={e => setP1(e.target.value)} placeholder="0" style={inp({ textAlign: 'center', fontFamily: 'Inter,sans-serif' })} />
                                    <span style={{ color: 'var(--text-muted)' }}>–</span>
                                    <input type="number" min="0" value={p2} onChange={e => setP2(e.target.value)} placeholder="0" style={inp({ textAlign: 'center', fontFamily: 'Inter,sans-serif' })} />
                                </div>)}
                            </div>
                        )}
                    </>)}
                    {error && <div style={{ padding: '.5rem .75rem', background: 'rgba(224,75,75,.12)', border: '1px solid var(--danger)', borderRadius: 4, fontSize: '.82rem', color: 'var(--danger)' }}>{error}</div>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.6rem', padding: '.75rem 1rem', borderTop: '1px solid var(--border)' }}>
                    <button onClick={onClose} style={{ padding: '.45rem 1rem', border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.88rem', fontFamily: 'inherit' }}>إلغاء</button>
                    <button onClick={save} disabled={saving} style={{ padding: '.45rem 1.25rem', border: 'none', borderRadius: 4, background: 'var(--gold)', color: '#000', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '.88rem', fontFamily: 'inherit', opacity: saving ? .7 : 1 }}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>إدارة المباريات</span>
                    <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '.08rem .5rem' }}>{matches.length}</span>
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '.38rem .85rem', border: `1px solid ${showAddForm ? 'var(--border)' : 'var(--gold)'}`, borderRadius: 4, background: showAddForm ? 'transparent' : 'var(--gold)', color: showAddForm ? 'var(--text-muted)' : '#000', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {showAddForm ? '✕ إغلاق' : '+ مباراة جديدة'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} style={{ padding: '.85rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: '.65rem' }}>
                        <div><label style={lbl}>المرحلة</label><select style={inp()} value={newMatch.phase} onChange={set('phase')}><option value="groups">مجموعات</option><option value="knockout">إقصاء</option></select></div>
                        {newMatch.phase === 'groups'
                            ? <div><label style={lbl}>المجموعة</label><select style={inp()} value={newMatch.group} onChange={set('group')}>{GROUPS.map(g => <option key={g} value={g}>المجموعة {g}</option>)}</select></div>
                            : <div><label style={lbl}>الدور</label><select style={inp()} value={newMatch.knockoutRound} onChange={set('knockoutRound')}><option value="">-- اختر --</option>{KO_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>}
                        <div><label style={lbl}>الفريق الأول</label><select style={inp()} value={newMatch.team1} onChange={set('team1')}><option value="">-- اختر --</option>{teams.map(t => <option key={t._id} value={t._id}>{t.name} ({t.group})</option>)}</select></div>
                        <div><label style={lbl}>الفريق الثاني</label><select style={inp()} value={newMatch.team2} onChange={set('team2')}><option value="">-- اختر --</option>{teams.map(t => <option key={t._id} value={t._id}>{t.name} ({t.group})</option>)}</select></div>
                        <div><label style={lbl}>التاريخ والوقت</label><input type="datetime-local" style={inp()} value={newMatch.matchDate} onChange={set('matchDate')} /></div>
                    </div>
                    {addError && <div style={{ fontSize: '.8rem', color: 'var(--danger)', padding: '.35rem .6rem', background: 'rgba(224,75,75,.1)', borderRadius: 3, border: '1px solid var(--danger)' }}>{addError}</div>}
                    <div><button type="submit" style={{ padding: '.45rem 1.25rem', border: 'none', borderRadius: 4, background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>+ إضافة</button></div>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {matches.length === 0
                    ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>لا توجد مباريات</div>
                    : matches.map(m => {
                        const done = m.status === 'Completed';
                        const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                        const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                        return (
                            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.48rem .85rem', borderBottom: '1px solid var(--border)', background: done ? 'var(--bg-elevated)' : 'var(--bg-card)' }}>
                                <span style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', padding: '.06rem .3rem', borderRadius: 3, minWidth: 20, textAlign: 'center', flexShrink: 0 }}>{m.phase === 'knockout' ? (m.knockoutRound?.[0] || 'إ') : m.group}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
                                    <span style={{ fontSize: '.8rem', fontWeight: w1 ? 900 : 600, color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.team1?.name}{m.redCards1 > 0 && <span style={{ marginRight: '.25rem', fontSize: '.58rem', color: 'var(--danger)', background: 'rgba(224,75,75,.15)', padding: '0 .2rem', borderRadius: 2 }}>خ{m.redCards1}</span>}</span>
                                    <Av name={m.team1?.name} win={w1} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', gap: 2, alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '.15rem .45rem' }}>
                                        <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: '.88rem', color: w1 ? 'var(--gold)' : 'var(--text-secondary)' }}>{done ? m.score1 : '–'}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '.65rem', margin: '0 2px' }}>:</span>
                                        <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: '.88rem', color: w2 ? 'var(--gold)' : 'var(--text-secondary)' }}>{done ? m.score2 : '–'}</span>
                                    </div>
                                    {m.hasPenalties && <span style={{ fontSize: '.52rem', color: 'var(--text-muted)', marginTop: 1 }}>ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flex: 1, minWidth: 0 }}>
                                    <Av name={m.team2?.name} win={w2} />
                                    <span style={{ fontSize: '.8rem', fontWeight: w2 ? 900 : 600, color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.redCards2 > 0 && <span style={{ marginLeft: '.25rem', fontSize: '.58rem', color: 'var(--danger)', background: 'rgba(224,75,75,.15)', padding: '0 .2rem', borderRadius: 2 }}>خ{m.redCards2}</span>}{m.team2?.name}</span>
                                </div>
                                <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '.12rem .4rem', borderRadius: 3, flexShrink: 0, background: done ? 'rgba(61,186,114,.15)' : 'rgba(226,176,74,.12)', color: done ? 'var(--success)' : 'var(--gold)', border: `1px solid ${done ? 'var(--success)' : 'var(--gold-border)'}` }}>{done ? 'منتهية' : 'انتظار'}</span>
                                <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0 }}>
                                    <button onClick={() => setEditingMatch(m)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏</button>
                                    <button onClick={() => handleDelete(m._id)} disabled={deletingId === m._id} style={{ width: 26, height: 26, border: '1px solid var(--danger)', borderRadius: 3, background: 'rgba(224,75,75,.1)', color: 'var(--danger)', cursor: 'pointer', fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === m._id ? .5 : 1 }}>{deletingId === m._id ? '…' : '🗑'}</button>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </>
    );
}
