import { useEffect, useState } from 'react';
import {
    getTeams, getMatches, getSettings,
    setPhase, setQualifiedTeams, setBracketSlots,
    deleteTeam, updateTeam,
    resetGroups, resetKnockout, resetAll,
    getRankings, generateKnockout,
} from '../services/api';
import AddTeamForm from '../components/AddTeamForm';
import MatchesManager from '../components/MatchesManager';
import KnockoutMatchManager from '../components/KnockoutMatchManager';
import CanvasExporter from '../components/CanvasExporter';
import TournamentSettingsEditor, { applySettingsColors } from '../components/TournamentSettingsEditor';
import config from '../tournament.config';



/* ──────────────────────────────────────────
   TEAMS TABLE
────────────────────────────────────────── */
function TeamsTable({ teams, onRefresh }) {
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');

    const startEdit = (t) => { setEditId(t._id); setName(t.name); setGroup(t.group); };
    const saveEdit = async (id) => { await updateTeam(id, { name, group }); setEditId(null); onRefresh(); };
    const del = async (id) => { if (!window.confirm('حذف هذا الفريق؟')) return; await deleteTeam(id); onRefresh(); };

    const thSt = { padding: '.45rem .5rem', fontSize: '.62rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', whiteSpace: 'nowrap' };
    const tdSt = (extra = {}) => ({ padding: '.42rem .5rem', fontSize: '.82rem', color: 'var(--text-secondary)', textAlign: 'center', borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)', ...extra });

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                <thead>
                    <tr>
                        <th style={{ ...thSt, width: 32 }}>#</th>
                        <th style={{ ...thSt, textAlign: 'right', paddingRight: '.75rem', minWidth: 120 }}>الفريق</th>
                        <th style={{ ...thSt, width: 38 }}>مج</th>
                        <th style={{ ...thSt, width: 38 }}>نق</th>
                        <th style={{ ...thSt, width: 36 }}>لع</th>
                        <th style={{ ...thSt, width: 36 }}>ف</th>
                        <th style={{ ...thSt, width: 36 }}>ت</th>
                        <th style={{ ...thSt, width: 36 }}>خ</th>
                        <th style={{ ...thSt, width: 36 }}>له</th>
                        <th style={{ ...thSt, width: 36 }}>عل</th>
                        <th style={{ ...thSt, width: 42 }}>±</th>
                        <th style={{ ...thSt, width: 64 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {teams.length === 0 ? (
                        <tr><td colSpan="12" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>لا يوجد فرق بعد</td></tr>
                    ) : teams.map((t, i) => (
                        <tr key={t._id} style={{ background: editId === t._id ? 'var(--bg-elevated)' : 'var(--bg-card)', transition: 'background .1s' }}>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '.72rem', color: 'var(--text-muted)' })}>{i + 1}</td>
                            <td style={{ ...tdSt({ textAlign: 'right', paddingRight: '.75rem' }), display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 900, color: 'var(--text-muted)', fontFamily: 'Inter,sans-serif', flexShrink: 0 }}>{t.name?.[0]}</div>
                                {editId === t._id
                                    ? <input value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, padding: '.3rem .5rem', background: 'var(--bg-input)', border: '1px solid var(--gold-border)', borderRadius: 3, color: 'var(--text-primary)', fontSize: '.82rem', fontFamily: 'inherit' }} />
                                    : <span style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</span>}
                            </td>
                            <td style={tdSt()}>
                                {editId === t._id
                                    ? <select value={group} onChange={e => setGroup(e.target.value)} style={{ padding: '.3rem .4rem', background: 'var(--bg-input)', border: '1px solid var(--gold-border)', borderRadius: 3, color: 'var(--text-primary)', fontSize: '.78rem', fontFamily: 'inherit' }}>
                                        {config.groups.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    : <span style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', padding: '.06rem .32rem', borderRadius: 3 }}>{t.group}</span>}
                            </td>
                            <td style={tdSt({ color: 'var(--gold)', fontWeight: 900, fontFamily: 'Inter,sans-serif' })}>{t.points}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif' })}>{t.played}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif', color: 'var(--success)' })}>{t.won}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif' })}>{t.drawn}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif', color: 'var(--danger)' })}>{t.lost}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif' })}>{t.gf}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif' })}>{t.ga}</td>
                            <td style={tdSt({ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: t.gd > 0 ? 'var(--success)' : t.gd < 0 ? 'var(--danger)' : 'var(--text-muted)' })}>{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                            <td style={tdSt()}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '.3rem' }}>
                                    {editId === t._id ? <>
                                        <button onClick={() => saveEdit(t._id)} style={{ width: 26, height: 26, border: '1px solid var(--success)', borderRadius: 3, background: 'rgba(61,186,114,.15)', color: 'var(--success)', cursor: 'pointer', fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
                                        <button onClick={() => setEditId(null)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                    </> : <>
                                        <button onClick={() => startEdit(t)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 3, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏</button>
                                        <button onClick={() => del(t._id)} style={{ width: 26, height: 26, border: '1px solid var(--danger)', borderRadius: 3, background: 'rgba(224,75,75,.1)', color: 'var(--danger)', cursor: 'pointer', fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                                    </>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


/* ──────────────────────────────────────────
   QUALIFIED SELECTOR
────────────────────────────────────────── */
function QualifiedSelector({ teams, settings, onSaved }) {
    const [selected, setSelected] = useState(() => (settings?.qualifiedTeams || []).map(t => t._id || t));
    const [msg, setMsg] = useState('');
    useEffect(() => {
        setSelected((settings?.qualifiedTeams || []).map(t => t._id || t));
    }, [settings]);

    const toggle = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const save = async () => {
        await setQualifiedTeams(selected);
        setMsg('✅ تم');
        setTimeout(() => setMsg(''), 3000);
        onSaved?.();
    };

    return (
        <div>
            <p className="card-desc">اختر الفرق المتأهلة من كل مجموعة</p>
            <div className="qualified-selector-grid">
                {config.groups.map(g => (
                    <div key={g} className="qualified-group-col">
                        <div className="qg-title">المجموعة {g}</div>
                        {teams.filter(t => t.group === g).sort((a, b) => b.points - a.points || b.gd - a.gd).map((t, i) => (
                            <label key={t._id} className={`qualified-row ${selected.includes(t._id) ? 'q-selected' : ''}`}>
                                <input type="checkbox" checked={selected.includes(t._id)} onChange={() => toggle(t._id)} />
                                <div className="q-rank">{i + 1}</div>
                                <div className="q-name">{t.name}</div>
                                <div className="q-pts">{t.points}نق</div>
                            </label>
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="btn btn-primary btn-sm" onClick={save}>💾 حفظ</button>
                {msg && <span className="inline-ok">{msg}</span>}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   BRACKET DRAW
────────────────────────────────────────── */
function BracketDraw({ teams, settings, onSaved }) {
    const existing = settings?.bracketSlots || [];
    const [slots, setSlots] = useState(() =>
        Array.from({ length: config.knockoutSize }, (_, i) => {
            const f = existing.find(s => s.position === i + 1);
            return { position: i + 1, teamId: f?.team?._id || f?.team || '' };
        })
    );
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const ex = settings?.bracketSlots || [];
        setSlots(Array.from({ length: config.knockoutSize }, (_, i) => {
            const f = ex.find(s => s.position === i + 1);
            return { position: i + 1, teamId: f?.team?._id || f?.team || '' };
        }));
    }, [settings]);

    const eligible = (settings?.qualifiedTeams || []).length > 0 ? settings.qualifiedTeams : teams;

    const autoSeed = () => {
        const byG = g => teams.filter(t => t.group === g).sort((a, b) => b.points - a.points || b.gd - a.gd);
        const groups = config.groups.map(g => byG(g));
        // Standard seeding pairs: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C (for 4 groups)
        const total = Math.min(config.knockoutSize, groups.length * 2);
        const seeded = [];
        for (let i = 0; i < groups.length && seeded.length < total; i++) {
            seeded.push(groups[i][0], groups[(i + 1) % groups.length][1]);
        }
        setSlots(seeded.slice(0, config.knockoutSize).map((t, i) => ({ position: i + 1, teamId: t?._id || '' })));
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await setBracketSlots(slots.map(s => ({ position: s.position, teamId: s.teamId || null })));
            const created = res.autoCreatedQF || [];
            setMsg(`✅ تم حفظ القرعة${created.length ? ` — إنشاء تلقائي لـ ${created.length} مباراة ربع النهائي` : ''}`);
            onSaved?.();
        } catch { setMsg('❌ فشل'); }
        setSaving(false);
        setTimeout(() => setMsg(''), 5000);
    };

    const setSlotTeam = (pos, teamId) => setSlots(p => p.map(s => s.position === pos ? { ...s, teamId } : s));

    const pairs = [];
    for (let i = 0; i < config.knockoutSize; i += 2) {
        pairs.push([i + 1, i + 2]);
    }

    return (
        <div className="bracket-draw">
            <div className="bracket-draw-actions">
                <button className="btn btn-ghost btn-sm" onClick={autoSeed}>🎯 ترتيب تلقائي</button>
                <span className="card-desc" style={{ fontSize: '0.78rem' }}>سيتم إنشاء مباريات ربع النهائي تلقائياً عند الحفظ</span>
            </div>
            <div className="qf-draw-grid">
                {pairs.map(([a, b], i) => {
                    const sA = slots.find(s => s.position === a);
                    const sB = slots.find(s => s.position === b);
                    return (
                        <div key={i} className="qf-match-draw">
                            <div className="qf-match-label">م{i + 1} · ربع النهائي</div>
                            <div className="qf-team-selects">
                                <select className="form-select" value={sA?.teamId || ''} onChange={e => setSlotTeam(a, e.target.value)}>
                                    <option value="">— الفريق الأول —</option>
                                    {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                                </select>
                                <div className="qf-draw-vs">VS</div>
                                <select className="form-select" value={sB?.teamId || ''} onChange={e => setSlotTeam(b, e.target.value)}>
                                    <option value="">— الفريق الثاني —</option>
                                    {eligible.map(t => <option key={t._id || t} value={t._id || t}>{t.name}{t.group ? ` (${t.group})` : ''}</option>)}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                    {saving ? '⏳ جاري...' : '💾 حفظ القرعة + إنشاء المباريات'}
                </button>
                {msg && <span className={msg.includes('✅') ? 'inline-ok' : 'inline-err'}>{msg}</span>}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   AUTO GENERATE KO
────────────────────────────────────────── */
function AutoGenerateKO({ teams, onGenerated }) {
    const [rankings, setRankings] = useState(null);
    const [loadingRank, setLoadingRank] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [err, setErr] = useState('');

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
            setResult(data);
            onGenerated?.();
        } catch (e) { setErr(e.message || 'حدث خطأ'); }
        finally { setGenerating(false); }
    };

    const GROUPS = ['أ', 'ب', 'ج', 'د'];

    return (
        <div className="ko-step-card">
            <div className="ko-step-header">
                <span className="ko-step-num">١</span>
                <div>
                    <div className="ko-step-title">توليد القرعة التلقائية</div>
                    <div className="ko-step-desc">فرز المجموعات → نظام المقص → إنشاء ربع النهائي</div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="autoko-actions">
                <button className="btn btn-ghost btn-sm" onClick={loadRankings} disabled={loadingRank}>
                    {loadingRank ? '⏳' : '📊 عرض الترتيب الحالي'}
                </button>
                <button className="btn btn-primary" onClick={doGenerate} disabled={generating}>
                    {generating ? '⏳ جاري التوليد...' : '🔀 توليد ربع النهائي تلقائياً'}
                </button>
            </div>

            {err && <div className="alert-error" style={{ marginTop: '0.75rem' }}>{err}</div>}

            {/* Rankings preview */}
            {rankings && (
                <div className="autoko-rankings">
                    <div className="autoko-rank-title">ترتيب المجموعات (نقاط → فارق أهداف → مواجهات مباشرة)</div>
                    <div className="autoko-rank-grid">
                        {GROUPS.map(g => {
                            const gTeams = rankings[g] || [];
                            return (
                                <div key={g} className="autoko-group">
                                    <div className="autoko-group-title">المجموعة {g}</div>
                                    {gTeams.map((t, i) => (
                                        <div key={t._id} className={`autoko-team-row ${i < 2 ? 'autoko-qualified' : ''}`}>
                                            <span className="autoko-rank">{i + 1}</span>
                                            <span className="autoko-tname">{t.name}</span>
                                            <span className="autoko-pts">{t.points} ن</span>
                                            <span className="autoko-gd">{t.gd >= 0 ? '+' : ''}{t.gd}</span>
                                            {i < 2 && <span className="autoko-qual-badge">متأهل</span>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Generated bracket result */}
            {result?.bracket && (
                <div className="autoko-result">
                    <div className="autoko-result-title">✅ {result.message}</div>
                    <div className="autoko-seeding-legend">نظام المقص — لا يلتقي فريقا مجموعة في مرحلة ما قبل النهائي</div>
                    <table className="autoko-table">
                        <thead>
                            <tr>
                                <th>المباراة</th><th>الطرف الأول</th><th></th><th>الطرف الثاني</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.bracket.map(r => (
                                <tr key={r.position}>
                                    <td className="autoko-pos">ربع {r.position}</td>
                                    <td className="autoko-t1">
                                        {r.team1.name}
                                        <span className="autoko-gtag">م·{r.team1.group}</span>
                                    </td>
                                    <td className="autoko-sep">ضد</td>
                                    <td className="autoko-t2">
                                        {r.team2.name}
                                        <span className="autoko-gtag">م·{r.team2.group}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────
   MAIN ADMIN PAGE
────────────────────────────────────────── */

export default function AdminPage({ onLogout }) {
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [settings, setSettingsState] = useState(null);
    const [tab, setTab] = useState('teams');
    const [loading, setLoading] = useState(true);
    const [phaseLoading, setPhaseLoading] = useState(false);
    const [resetting, setResetting] = useState(false);

    const fetchAll = async () => {
        try {
            const [t, m, s] = await Promise.all([getTeams(), getMatches(), getSettings()]);
            setTeams(Array.isArray(t) ? t : []);
            setMatches(Array.isArray(m) ? m : []);
            if (s && !s.message) { setSettingsState(s); applySettingsColors(s); }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const activateKO = async () => { setPhaseLoading(true); await setPhase('knockout'); setSettingsState(p => ({ ...p, phase: 'knockout' })); setPhaseLoading(false); };
    const deactivateKO = async () => { setPhaseLoading(true); await setPhase('groups'); setSettingsState(p => ({ ...p, phase: 'groups' })); setPhaseLoading(false); };

    const handleReset = async (type) => {
        const conf = window.prompt(
            type === 'groups' ? 'هل أنت متأكد؟ سيتم حذف جميع مباريات المجموعات وإعادة تصفير النقاط. اكتب "تأكيد" للمتابعة.' :
                type === 'knockout' ? 'هل أنت متأكد؟ سيتم حذف جميع مباريات الإقصاء وإفراغ القرعة. اكتب "تأكيد" للمتابعة.' :
                    '⚠️ تحذير خطير! سيتم حذف كل شيء (فرق، مباريات، إعدادات) والبدء من الصفر. اكتب "تأكيد" للمتابعة.'
        );
        if (conf !== 'تأكيد') return;

        setResetting(true);
        try {
            if (type === 'groups') await resetGroups();
            if (type === 'knockout') await resetKnockout();
            if (type === 'all') await resetAll();
            await fetchAll();
            alert('✅ تم إعادة التعيين بنجاح');
        } catch (e) { alert('حدث خطأ: ' + e.message); }
        finally { setResetting(false); }
    };

    if (loading) return <div className="loading-screen"><div className="loader" /><p>جاري التحميل...</p></div>;

    const koMatches = matches.filter(m => m.phase === 'knockout');
    const groupMatches = matches.filter(m => m.phase !== 'knockout');

    const tabs = [
        { id: 'teams', label: 'الفرق' },
        { id: 'group-matches', label: 'مباريات المجموعات' },
        { id: 'knockout', label: 'الإقصاء' },
        { id: 'export', label: 'تصدير' },
        { id: 'settings', label: 'الإعدادات' },
        { id: 'reset', label: 'إعادة تعيين' },
    ];

    return (
        <div className="page admin-page">
            <header className="admin-header">
                <div className="admin-header-inner">
                    <div>
                        <h1 className="admin-title">لوحة الإدارة</h1>
                        <p className="admin-subtitle">{settings?.phase === 'knockout' ? 'مرحلة الإقصاء' : 'دور المجموعات'} · {settings?.tournamentName || config.name}</p>
                    </div>
                    <div className="admin-header-actions">
                        <a href="/" className="btn btn-ghost btn-sm">الرئيسية</a>
                        <button className="btn btn-danger btn-sm" onClick={onLogout}>خروج</button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map(({ id, label }) => (
                    <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                        {label}
                        {id === 'knockout' && settings?.phase === 'knockout' && <span className="live-dot" />}
                    </button>
                ))}
            </div>

            {/* ══ TEAMS TAB ══ */}
            {tab === 'teams' && (
                <div className="settings-section">
                    <div className="card">
                        <h2 className="card-title"><span className="icon">➕</span> إضافة فريق</h2>
                        <AddTeamForm onTeamAdded={fetchAll} />
                    </div>
                    <div className="card">
                        <h2 className="card-title"><span className="icon">⚽</span> جميع الفرق ({teams.length})</h2>
                        <TeamsTable teams={teams} onRefresh={fetchAll} />
                    </div>
                </div>
            )}

            {/* ══ GROUP MATCHES TAB ══ */}
            {tab === 'group-matches' && (
                <div className="settings-section">
                    <MatchesManager matches={groupMatches} teams={teams} onRefresh={fetchAll} defaultPhase="groups" />
                </div>
            )}

            {/* ══ KNOCKOUT TAB ══ */}
            {tab === 'knockout' && (
                <div className="settings-section">
                    {/* Phase banner */}
                    <div className="ko-phase-row">
                        {settings?.phase === 'knockout' ? (
                            <div className="ko-phase-banner active-phase">
                                <span>🟢 الإقصاء مفعّل</span>
                                <button className="btn btn-ghost btn-sm" onClick={deactivateKO} disabled={phaseLoading}>↩ رجوع للمجموعات</button>
                            </div>
                        ) : (
                            <div className="ko-phase-banner">
                                <span>⚠️ دور المجموعات — فعّل الإقصاء عند الاكتمال</span>
                                <button className="btn btn-primary btn-sm" onClick={activateKO} disabled={phaseLoading}>
                                    {phaseLoading ? '⏳' : '🏆 تفعيل الإقصاء'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Auto Generate Card */}
                    <AutoGenerateKO teams={teams} onGenerated={fetchAll} />

                    {/* Step 2 — Match management */}
                    <div className="ko-step-card">
                        <div className="ko-step-header">
                            <span className="ko-step-num">٢</span>
                            <div>
                                <div className="ko-step-title">إدارة المباريات</div>
                                <div className="ko-step-desc">تواريخ، نتائج، ضربات جزاء، حذف</div>
                            </div>
                            <span className="ko-step-count">{koMatches.length} مباراة</span>
                        </div>
                        <KnockoutMatchManager
                            matches={koMatches}
                            teams={teams}
                            qualifiedTeams={settings?.qualifiedTeams || []}
                            onRefresh={fetchAll}
                        />
                    </div>
                </div>
            )}


            {/* ══ EXPORT TAB ══ */}
            {tab === 'export' && (
                <div className="card">
                    <h2 className="card-title"><span className="icon">📸</span> تصدير صور (1080×1080)</h2>
                    <p className="card-desc">انقر لتحميل PNG جاهز للنشر في وسائل التواصل</p>
                    <CanvasExporter teams={teams} matches={matches} settings={settings} />
                </div>
            )}

            {/* ══ SETTINGS TAB ══ */}
            {tab === 'settings' && (
                <div className="card">
                    <h2 className="card-title"><span className="icon">🎨</span> إعدادات البطولة</h2>
                    <p className="card-desc">تعديل اسم البطولة، الشعار، الألوان، والخطوط — تُحفظ في قاعدة البيانات</p>
                    <TournamentSettingsEditor settings={settings} onSaved={fetchAll} />
                </div>
            )}

            {/* ══ RESET TAB ══ */}
            {tab === 'reset' && (
                <div className="settings-section">
                    <div className="card" style={{ borderColor: 'var(--danger)' }}>
                        <h2 className="card-title" style={{ color: 'var(--danger)' }}>⚠️ منطقة الخطر</h2>
                        <p className="card-desc">الإجراءات هنا لا يمكن التراجع عنها.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div className="reset-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '8px' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>إعادة تعيين دور المجموعات</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>حذف مباريات المجموعات وتصفير نقاط الفرق (0-0-0).</p>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReset('groups')} disabled={resetting}>تصفير المجموعات</button>
                            </div>

                            <div className="reset-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '8px' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>إعادة تعيين دور الإقصاء</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>حذف مباريات الإقصاء وإفراغ القرعة والمتأهلين.</p>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReset('knockout')} disabled={resetting}>تصفير الإقصاء</button>
                            </div>

                            <div className="reset-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(224, 92, 92, 0.1)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.2rem', color: 'var(--danger)' }}>🔥 تصفير البطولة بالكامل</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>حذف جميع الفرق والمباريات والإعدادات. (بداية جديدة)</p>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReset('all')} disabled={resetting}>حذف كل شيء</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
