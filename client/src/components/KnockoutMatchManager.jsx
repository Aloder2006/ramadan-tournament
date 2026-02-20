import { useState } from 'react';
import { updateMatch, createMatch, deleteMatch } from '../services/api';

const KO_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];
const ROUND_POS = { 'ربع النهائي': 4, 'نصف النهائي': 2, 'نهائي الترتيب': 1, 'النهائي': 1 };
const fmt = d => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
const fmtLocal = d => { if (!d) return ''; const dt = new Date(d); const p = n => String(n).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`; };

const inp = (ex = {}) => ({ padding: '.45rem .65rem', background: 'var(--bg-input,#0f1117)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontSize: '.9rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', ...ex });
const lbl = { display: 'block', fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' };

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
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--gold)' }}>تعديل مباراة الإقصاء</span>
                    <button onClick={onClose} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem' }}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '.5rem', padding: '.75rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-primary)', textAlign: 'right' }}>{match.team1?.name}</div>
                    <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text-muted)', padding: '.15rem .45rem', border: '1px solid var(--border)', borderRadius: 3, textAlign: 'center' }}>{match.knockoutRound || 'VS'}</div>
                    <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-primary)', textAlign: 'left' }}>{match.team2?.name}</div>
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
                        {isDraw && (
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
        <form onSubmit={handleAdd} style={{ padding: '.85rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: '.6rem' }}>
                <div>
                    <label style={lbl}>الدور</label>
                    <select style={inp()} value={round} onChange={e => { setRound(e.target.value); setBracketPos(1); }}>
                        {KO_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {maxPos > 1 && (
                    <div>
                        <label style={lbl}>مباراة القرعة</label>
                        <select style={inp()} value={bracketPos} onChange={e => setBracketPos(+e.target.value)}>
                            {Array.from({ length: maxPos }, (_, i) => i + 1).map(p => (
                                <option key={p} value={p} disabled={taken.includes(p)}>م{p}{taken.includes(p) ? ' ✓' : ''}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label style={lbl}>الفريق الأول</label>
                    <select style={inp()} value={team1} onChange={e => setTeam1(e.target.value)}>
                        <option value="">— اختر —</option>
                        {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                    </select>
                </div>
                <div>
                    <label style={lbl}>الفريق الثاني</label>
                    <select style={inp()} value={team2} onChange={e => setTeam2(e.target.value)}>
                        <option value="">— اختر —</option>
                        {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                    </select>
                </div>
                <div>
                    <label style={lbl}>التاريخ</label>
                    <input type="datetime-local" style={inp()} value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                </div>
            </div>
            {error && <div style={{ fontSize: '.8rem', color: 'var(--danger)', padding: '.35rem .6rem', background: 'rgba(224,75,75,.1)', borderRadius: 3, border: '1px solid var(--danger)' }}>{error}</div>}
            <div><button type="submit" disabled={loading} style={{ padding: '.45rem 1.25rem', border: 'none', borderRadius: 4, background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1 }}>{loading ? '...' : '+ إضافة'}</button></div>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{matches.length} مباراة</span>
                <button onClick={() => setShowAdd(s => !s)} style={{ padding: '.38rem .85rem', border: `1px solid ${showAdd ? 'var(--border)' : 'var(--gold)'}`, borderRadius: 4, background: showAdd ? 'transparent' : 'var(--gold)', color: showAdd ? 'var(--text-muted)' : '#000', fontWeight: 800, fontSize: '.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {showAdd ? '✕ إغلاق' : '+ إضافة مباراة'}
                </button>
            </div>

            {showAdd && <AddKOMatch teams={teams} qualifiedTeams={qualifiedTeams} existingMatches={matches} onAdded={() => { setShowAdd(false); onRefresh?.(); }} />}

            {KO_ROUNDS.map(round => {
                const rows = matches.filter(m => m.knockoutRound === round);
                if (!rows.length) return null;
                return (
                    <div key={round} style={{ borderBottom: '1px solid var(--border)' }}>
                        <div style={{ padding: '.38rem .85rem', background: 'var(--bg-elevated)', fontSize: '.68rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <span style={{ width: 4, height: 12, background: 'var(--gold)', borderRadius: 2, display: 'inline-block' }} />
                            {round}
                        </div>
                        {rows.map(m => {
                            const done = m.status === 'Completed';
                            const winner = getWinner(m);
                            const w1 = done && winner?._id === (m.team1?._id || m.team1);
                            const w2 = done && winner?._id === (m.team2?._id || m.team2);
                            return (
                                <div key={m._id} style={{ padding: '.55rem .85rem', borderBottom: '1px solid color-mix(in srgb,var(--border) 60%,transparent)', display: 'flex', flexDirection: 'column', gap: '.35rem', background: done ? 'var(--bg-elevated)' : 'var(--bg-card)' }}>
                                    {/* Match number + teams + score */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        {m.bracketPosition && <span style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '.05rem .3rem', flexShrink: 0 }}>م{m.bracketPosition}</span>}
                                        <span style={{ flex: 1, fontSize: '.84rem', fontWeight: w1 ? 900 : 600, color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.team1?.name}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                            <div style={{ display: 'flex', gap: 2, alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 3, padding: '.15rem .5rem' }}>
                                                <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: '.9rem', color: w1 ? 'var(--gold)' : 'var(--text-secondary)' }}>{done ? m.score1 : '–'}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '.65rem', margin: '0 2px' }}>:</span>
                                                <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 900, fontSize: '.9rem', color: w2 ? 'var(--gold)' : 'var(--text-secondary)' }}>{done ? m.score2 : '–'}</span>
                                            </div>
                                            {m.hasPenalties && <span style={{ fontSize: '.52rem', color: 'var(--text-muted)', marginTop: 1 }}>ج {m.penaltyScore1}–{m.penaltyScore2}</span>}
                                        </div>
                                        <span style={{ flex: 1, fontSize: '.84rem', fontWeight: w2 ? 900 : 600, color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'left', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.team2?.name}</span>
                                    </div>
                                    {/* Meta row */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                            <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '.1rem .4rem', borderRadius: 3, background: done ? 'rgba(61,186,114,.15)' : 'rgba(226,176,74,.12)', color: done ? 'var(--success)' : 'var(--gold)', border: `1px solid ${done ? 'var(--success)' : 'var(--gold-border)'}` }}>{done ? 'منتهية' : 'انتظار'}</span>
                                            {done && winner && <span style={{ fontSize: '.62rem', color: 'var(--gold)', fontWeight: 700 }}>🏆 {winner.name}</span>}
                                            {m.matchDate && <span style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>{fmt(m.matchDate)}</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '.3rem' }}>
                                            <button onClick={() => setEditingMatch(m)} style={{ padding: '.25rem .55rem', border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.72rem', fontFamily: 'inherit' }}>✏ تعديل</button>
                                            <button onClick={() => handleDelete(m._id)} disabled={deleting === m._id} style={{ padding: '.25rem .55rem', border: '1px solid var(--danger)', borderRadius: 3, background: 'rgba(224,75,75,.1)', color: 'var(--danger)', cursor: 'pointer', fontSize: '.72rem', fontFamily: 'inherit', opacity: deleting === m._id ? .5 : 1 }}>{deleting === m._id ? '…' : '🗑'}</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {matches.length === 0 && !showAdd && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.82rem', lineHeight: 1.7 }}>
                    لا توجد مباريات إقصاء — اضغط "إضافة مباراة" أو فعّل إنشاء تلقائي من الخطوة ٢
                </div>
            )}
        </>
    );
}
