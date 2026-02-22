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
                <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <form onSubmit={handleAdd} style={{ 
                        background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 8, 
                        border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '.75rem', marginBottom: '.25rem' }}>
                            <span style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--gold)' }}>إضافة مباراة جديدة</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={lbl}>المجموعة</label>
                                <select 
                                    style={inp()} 
                                    value={newMatch.group} 
                                    onChange={e => setNewMatch(p => ({ ...p, group: e.target.value, team1: '', team2: '' }))}
                                >
                                    {GROUPS.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>التاريخ والوقت</label>
                                <input type="datetime-local" style={inp()} value={newMatch.matchDate} onChange={set('matchDate')} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '.75rem', alignItems: 'center', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 6, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                <label style={{...lbl, textAlign: 'right'}}>الفريق الأول</label>
                                <select style={inp({ textAlign: 'right', fontWeight: 700, borderColor: newMatch.team1 ? 'var(--gold)' : 'var(--border)' })} value={newMatch.team1} onChange={set('team1')}>
                                    <option value="">-- اختر --</option>
                                    {teams.filter(t => t.group === newMatch.group).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '.2rem .6rem', borderRadius: 4, border: '1px solid var(--border)', marginTop: '1.2rem' }}>ضد</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                <label style={{...lbl, textAlign: 'left'}}>الفريق الثاني</label>
                                <select style={inp({ textAlign: 'left', fontWeight: 700, borderColor: newMatch.team2 ? 'var(--gold)' : 'var(--border)' })} value={newMatch.team2} onChange={set('team2')}>
                                    <option value="">-- اختر --</option>
                                    {teams.filter(t => t.group === newMatch.group).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        {addError && <div style={{ fontSize: '.8rem', color: 'var(--danger)', padding: '.5rem .75rem', background: 'rgba(224,75,75,.1)', borderRadius: 4, border: '1px solid var(--danger)' }}>{addError}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
                            <button type="submit" style={{ padding: '.5rem 1.75rem', border: 'none', borderRadius: 4, background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '.4rem', transition: 'filter 0.2s' }} onMouseEnter={e => e.currentTarget.style.filter='brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter='none'}><span>+</span> إضافة المباراة</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {matches.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>لا توجد مباريات</div>
                ) : (
                    GROUPS.map(g => {
                        const groupMatches = matches.filter(m => m.phase !== 'knockout' && m.group === g);
                        if (groupMatches.length === 0) return null;

                        return (
                            <div key={g} style={{ background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                {/* Group Header */}
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-card)',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{
                                        width: 24, height: 24, borderRadius: 4,
                                        background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                                        color: 'var(--gold)', fontWeight: 900, fontSize: '.75rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>{g}</span>
                                    <h3 style={{ fontSize: '.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>المجموعة {g}</h3>
                                    <span style={{ marginRight: 'auto', fontSize: '.7rem', color: 'var(--text-muted)', fontWeight: 700, padding: '.15rem .5rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>{groupMatches.length} مباريات</span>
                                </div>

                                {/* Group Matches Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--border)' }}>
                                    {groupMatches.map(m => {
                                        const done = m.status === 'Completed';
                                        const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                                        const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                                        const timeStr = m.matchDate ? new Date(m.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
                                        const dayStr = m.matchDate ? new Date(m.matchDate).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' }) : null;

                                        return (
                                            <div key={m._id} style={{
                                                background: done ? 'var(--bg-elevated)' : 'var(--bg-card)',
                                                padding: '1rem',
                                                display: 'flex', flexDirection: 'column', gap: '0.65rem',
                                                position: 'relative',
                                                transition: 'background 0.2s',
                                                cursor: 'default'
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = done ? 'var(--bg-elevated)' : 'var(--bg-card)'}
                                            >
                                                {/* Header: Date & Actions */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                        <span style={{ 
                                                            fontSize: '.55rem', fontWeight: 800, padding: '.15rem .4rem', borderRadius: 3, 
                                                            background: done ? 'rgba(61,186,114,.1)' : 'rgba(226,176,74,.1)', 
                                                            color: done ? 'var(--success)' : 'var(--gold)', border: `1px solid ${done ? 'rgba(61,186,114,.3)' : 'rgba(226,176,74,.3)'}`
                                                        }}>{done ? 'منتهية' : 'انتظار'}</span>
                                                        {m.matchDate && (
                                                            <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                                                                {dayStr} {timeStr && `• ${timeStr}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '.4rem' }}>
                                                        <button onClick={() => setEditingMatch(m)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '.9rem', transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.background='var(--gold)'; e.currentTarget.style.color='#000'; e.currentTarget.style.borderColor='var(--gold)'}} onMouseLeave={e => {e.currentTarget.style.background='var(--bg-elevated)'; e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border)'}}>✏️</button>
                                                        <button onClick={() => handleDelete(m._id)} disabled={deletingId === m._id} style={{ background: 'rgba(224,75,75,.1)', border: '1px solid var(--danger)', borderRadius: 4, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', cursor: 'pointer', fontSize: '.9rem', opacity: deletingId === m._id ? .5 : 1, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--danger)'} onMouseLeave={e => e.currentTarget.style.background='rgba(224,75,75,.1)'}>{deletingId === m._id ? '…' : '🗑'}</button>
                                                    </div>
                                                </div>

                                                {/* Match Body */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                                    {/* Team 1 */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0 }}>
                                                        <span style={{ fontSize: '.85rem', fontWeight: w1 ? 900 : 700, color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {m.team1?.name}
                                                        </span>
                                                        {m.redCards1 > 0 && (
                                                            <div style={{ width: 14, height: 18, background: '#e53e3e', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', color: '#fff', fontWeight: 900, fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                                                                {m.redCards1}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Score */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 .5rem', flexShrink: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: done ? 'var(--bg-card)' : 'transparent', borderRadius: 4, padding: done ? '.2rem .5rem' : 0, border: done ? '1px solid var(--border)' : 'none' }}>
                                                            {done ? (
                                                                <>
                                                                    <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: '1.05rem', color: w1 ? 'var(--gold)' : 'var(--text-primary)' }}>{m.score1}</span>
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: '.7rem' }}>–</span>
                                                                    <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: '1.05rem', color: w2 ? 'var(--gold)' : 'var(--text-primary)' }}>{m.score2}</span>
                                                                </>
                                                            ) : (
                                                                <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '.15rem .5rem', borderRadius: 4, border: '1px solid var(--border)' }}>VS</span>
                                                            )}
                                                        </div>
                                                        {m.hasPenalties && <span style={{ fontSize: '.55rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                                    </div>

                                                    {/* Team 2 */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flex: 1, minWidth: 0, flexDirection: 'row-reverse' }}>
                                                        <span style={{ fontSize: '.85rem', fontWeight: w2 ? 900 : 700, color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                                                            {m.team2?.name}
                                                        </span>
                                                        {m.redCards2 > 0 && (
                                                            <div style={{ width: 14, height: 18, background: '#e53e3e', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', color: '#fff', fontWeight: 900, fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                                                                {m.redCards2}
                                                            </div>
                                                        )}
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
