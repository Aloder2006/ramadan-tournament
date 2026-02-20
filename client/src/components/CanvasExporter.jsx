import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

/* ─── Default export configuration ─── */
const DEFAULT_CFG = {
    bgFrom: '#0c0f16',
    bgTo: '#181d2a',
    accentColor: '#e2b04a',
    textPrimary: '#dde2ed',
    textSecondary: '#7a8aa0',
    cardBg: '#181d2a',
    cardBorder: '#1f2638',
    fontFamily: 'Tajawal',
    scale: 2,           // 1x / 2x / 3x
    showDates: true,
    showWatermark: true,
    showGroupBadge: true,
    watermarkText: '',         // fallback = tournamentName
    cardStyle: 'dark',      // dark | flat | glass
};

const FONTS = ['Tajawal', 'Cairo', 'Lalezar', 'Barlow Condensed', 'Oswald', 'Amiri', 'Rubik'];

/* ─── Download helper ─── */
async function capture(id, filename, cfg) {
    const el = document.getElementById(id);
    if (!el) { alert('العنصر غير موجود'); return; }
    const canvas = await html2canvas(el, {
        backgroundColor: cfg.bgFrom,
        scale: cfg.scale,
        useCORS: true,
        logging: false,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/* ─── Derived helpers ─── */
const bgGrad = (cfg) =>
    `linear-gradient(150deg, ${cfg.bgFrom} 0%, ${cfg.bgTo} 60%, ${cfg.bgFrom} 100%)`;

const cardBg = (cfg) => {
    if (cfg.cardStyle === 'flat') return cfg.cardBg;
    if (cfg.cardStyle === 'glass') return `${cfg.cardBg}cc`;
    return cfg.cardBg; // dark
};

/* ─── Shared styles ─── */
const cellStyle = (cfg) => ({
    padding: '12px 8px', textAlign: 'center',
    borderBottom: `1px solid ${cfg.cardBorder}`,
    color: cfg.textSecondary, fontSize: 20,
});

/* ─────────────────────────────────────────────────
   EXPORT HEADER
───────────────────────────────────────────────── */
function ExportHeader({ settings, subtitle, cfg }) {
    const name = settings?.tournamentName || 'دوري رمضان';
    const logo = settings?.logoEmoji || '';
    const primary = cfg.accentColor;
    const sub = subtitle || settings?.subtitle || '';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, paddingBottom: 20, borderBottom: `2px solid ${primary}40` }}>
            {logo && (
                <div style={{ width: 72, height: 72, borderRadius: 8, background: `${primary}18`, border: `1px solid ${primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, flexShrink: 0 }}>
                    {logo}
                </div>
            )}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: primary, fontFamily: `'${settings?.logoFont || cfg.fontFamily}', sans-serif`, lineHeight: 1.1 }}>{name}</div>
                {sub && <div style={{ fontSize: 18, color: cfg.textSecondary, marginTop: 4 }}>{sub}</div>}
            </div>
            {cfg.showGroupBadge && (
                <div style={{ fontSize: 14, color: cfg.cardBorder, border: `1px solid ${cfg.cardBorder}`, padding: '4px 12px', borderRadius: 4, fontFamily: 'Inter, sans-serif' }}>
                    ramadan-tournament
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────
   EXPORT WRAPPER
───────────────────────────────────────────────── */
function ExportWrapper({ id, children, settings, cfg, subtitle, square = false }) {
    return (
        <div id={id} style={{
            width: 1080, minHeight: square ? 1080 : undefined, height: square ? 1080 : undefined,
            background: bgGrad(cfg),
            fontFamily: `'${cfg.fontFamily}', sans-serif`,
            direction: 'rtl', padding: 56, boxSizing: 'border-box',
            position: 'fixed', left: -9999, top: -9999, zIndex: -1,
        }}>
            <ExportHeader settings={settings} subtitle={subtitle} cfg={cfg} />
            {children}
            {cfg.showWatermark && (
                <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', fontSize: 14, color: `${cfg.accentColor}40`, fontFamily: 'Inter, sans-serif' }}>
                    {cfg.watermarkText || settings?.tournamentName || 'دوري رمضان'} · {new Date().getFullYear()}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────
   TEMPLATE: ALL GROUPS
───────────────────────────────────────────────── */
function AllGroupsTemplate({ id, teams, settings, cfg }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    const primary = cfg.accentColor;
    return (
        <div id={id} style={{ width: 1080, minHeight: 1350, background: bgGrad(cfg), fontFamily: `'${cfg.fontFamily}', sans-serif`, direction: 'rtl', padding: 56, boxSizing: 'border-box', position: 'fixed', left: -9999, top: -9999, zIndex: -1 }}>
            <ExportHeader settings={settings} subtitle="جداول المجموعات" cfg={cfg} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {GROUPS.map(g => {
                    const gt = teams.filter(t => t.group === g).sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
                    if (!gt.length) return null;
                    return (
                        <div key={g} style={{ background: cardBg(cfg), border: `1px solid ${cfg.cardBorder}`, borderRadius: 6 }}>
                            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${cfg.cardBorder}`, fontSize: 18, fontWeight: 800, color: primary }}>المجموعة {g}</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 18 }}>
                                <thead>
                                    <tr style={{ background: `${primary}10` }}>
                                        {['#', 'الفريق', 'لع', 'ف', 'ت', 'خ', 'ف.أ', 'نق'].map(h => (
                                            <th key={h} style={{ padding: '8px 6px', color: cfg.textSecondary, textAlign: 'center', borderBottom: `1px solid ${cfg.cardBorder}`, fontWeight: 700, fontSize: 14 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {gt.map((t, i) => (
                                        <tr key={t._id} style={{ background: i < 2 ? `${primary}08` : 'transparent', borderBottom: `1px solid ${cfg.cardBorder}` }}>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', color: i < 2 ? primary : cfg.textSecondary, fontWeight: 700 }}>{i + 1}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'right', color: cfg.textPrimary, fontWeight: 700 }}>{t.name}</td>
                                            <td style={{ ...cellStyle(cfg) }}>{t.played}</td>
                                            <td style={{ ...cellStyle(cfg), color: '#3dba72' }}>{t.won}</td>
                                            <td style={{ ...cellStyle(cfg) }}>{t.drawn}</td>
                                            <td style={{ ...cellStyle(cfg), color: '#e04b4b' }}>{t.lost}</td>
                                            <td style={{ ...cellStyle(cfg), color: t.gd >= 0 ? '#3dba72' : '#e04b4b' }}>{t.gd >= 0 ? `+${t.gd}` : t.gd}</td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 900, color: primary, fontSize: 20 }}>{t.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────
   TEMPLATE: SINGLE GROUP
───────────────────────────────────────────────── */
function GroupExportTemplate({ id, group, teams, settings, cfg }) {
    const sorted = [...teams].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
    const primary = cfg.accentColor;
    return (
        <ExportWrapper id={id} settings={settings} cfg={cfg} subtitle={`المجموعة ${group}`}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 26 }}>
                <thead>
                    <tr style={{ background: cardBg(cfg) }}>
                        {['#', 'الفريق', 'لع', 'ف', 'ت', 'خ', 'له', 'ع', 'فارق', 'نق'].map(h => (
                            <th key={h} style={{ padding: '14px 10px', color: cfg.textSecondary, fontWeight: 600, textAlign: 'center', borderBottom: `1px solid ${cfg.cardBorder}` }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((t, i) => (
                        <tr key={t._id} style={{ background: i === 0 ? `${primary}12` : i === 1 ? `${primary}06` : 'transparent', borderBottom: `1px solid ${cfg.cardBorder}` }}>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: i < 2 ? primary : cfg.textSecondary, fontWeight: i < 2 ? 800 : 400 }}>{i + 1}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 700, color: cfg.textPrimary }}>{t.name}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: cfg.textSecondary }}>{t.played}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#3dba72' }}>{t.won}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: cfg.textSecondary }}>{t.drawn}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e04b4b' }}>{t.lost}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: cfg.textSecondary }}>{t.gf}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: cfg.textSecondary }}>{t.ga}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: t.gd >= 0 ? '#3dba72' : '#e04b4b' }}>{t.gd >= 0 ? `+${t.gd}` : t.gd}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 900, color: primary, fontSize: 30 }}>{t.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ExportWrapper>
    );
}

/* ─────────────────────────────────────────────────
   TEMPLATE: MATCH CARD (upcoming or result)
───────────────────────────────────────────────── */
function MatchCardTemplate({ id, match, showResult, settings, cfg }) {
    const done = match.status === 'Completed' && showResult;
    const primary = cfg.accentColor;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' }) : null;
    const fmtT = (d) => d ? new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
    const w1 = done && (match.hasPenalties ? match.penaltyScore1 > match.penaltyScore2 : match.score1 > match.score2);
    const w2 = done && (match.hasPenalties ? match.penaltyScore2 > match.penaltyScore1 : match.score2 > match.score1);
    const isKO = match.phase === 'knockout';
    return (
        <div id={id} style={{ width: 1080, height: 1080, background: bgGrad(cfg), fontFamily: `'${cfg.fontFamily}', sans-serif`, direction: 'rtl', padding: 60, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'fixed', left: -9999, top: -9999, zIndex: -1 }}>
            {/* Logo */}
            <div style={{ fontSize: 32, fontWeight: 900, color: primary, marginBottom: 8, fontFamily: `'${settings?.logoFont || cfg.fontFamily}', sans-serif` }}>
                {settings?.tournamentName || 'دوري رمضان'}
            </div>
            <div style={{ fontSize: 18, color: cfg.textSecondary, marginBottom: 48 }}>
                {done ? 'نتيجة المباراة' : 'مباراة قادمة'} — {isKO ? match.knockoutRound : `المجموعة ${match.group}`}
            </div>

            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, width: '100%', justifyContent: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    {w1 && <div style={{ fontSize: 16, color: primary, marginBottom: 6, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>فائز</div>}
                    <div style={{ fontSize: 44, fontWeight: 900, color: w1 ? primary : cfg.textPrimary }}>{match.team1?.name}</div>
                </div>
                <div style={{ padding: '24px 44px', background: cardBg(cfg), borderRadius: 6, border: `1px solid ${done ? primary : cfg.cardBorder}`, textAlign: 'center', minWidth: 200, boxShadow: done ? `0 0 40px ${primary}30` : 'none' }}>
                    {done ? (
                        <>
                            <div style={{ fontSize: 72, fontWeight: 900, color: primary, fontFamily: 'Inter, sans-serif' }}>{match.score1} - {match.score2}</div>
                            {match.hasPenalties && <div style={{ fontSize: 20, color: cfg.textSecondary, marginTop: 4 }}>ج: {match.penaltyScore1} - {match.penaltyScore2}</div>}
                        </>
                    ) : (
                        <div style={{ fontSize: 52, fontWeight: 900, color: cfg.textSecondary, fontFamily: 'Inter, sans-serif' }}>VS</div>
                    )}
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    {w2 && <div style={{ fontSize: 16, color: primary, marginBottom: 6, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>فائز</div>}
                    <div style={{ fontSize: 44, fontWeight: 900, color: w2 ? primary : cfg.textPrimary }}>{match.team2?.name}</div>
                </div>
            </div>

            {/* Date */}
            {cfg.showDates && match.matchDate && !done && (
                <div style={{ marginTop: 48, fontSize: 24, color: cfg.textSecondary, textAlign: 'center' }}>
                    {fmt(match.matchDate)}{fmtT(match.matchDate) && ` · ${fmtT(match.matchDate)}`}
                </div>
            )}
            {done && (match.redCards1 > 0 || match.redCards2 > 0) && (
                <div style={{ marginTop: 20, fontSize: 18, color: cfg.textSecondary }}>
                    بطاقات حمراء — {match.team1?.name}: {match.redCards1} | {match.team2?.name}: {match.redCards2}
                </div>
            )}
            {/* Watermark */}
            {cfg.showWatermark && (
                <div style={{ position: 'absolute', bottom: 24, fontSize: 14, color: `${primary}40`, fontFamily: 'Inter, sans-serif' }}>
                    {cfg.watermarkText || settings?.tournamentName || 'دوري رمضان'} · {new Date().getFullYear()}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────
   TEMPLATE: UPCOMING MATCHES LIST
───────────────────────────────────────────────── */
function UpcomingMatchesTemplate({ id, matches, settings, cfg }) {
    const pending = matches.filter(m => m.status === 'Pending');
    const primary = cfg.accentColor;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
    return (
        <ExportWrapper id={id} settings={settings} cfg={cfg} subtitle="المباريات القادمة">
            {pending.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, background: cardBg(cfg), borderRadius: 4, padding: '18px 22px', border: `1px solid ${cfg.cardBorder}` }}>
                    <span style={{ fontSize: 14, color: cfg.textSecondary, minWidth: 90 }}>{m.phase === 'knockout' ? m.knockoutRound : `المج·${m.group}`}</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: cfg.textPrimary, flex: 1, textAlign: 'right' }}>{m.team1?.name}</span>
                    <span style={{ fontSize: 18, color: cfg.textSecondary, padding: '4px 16px', border: `1px solid ${cfg.cardBorder}`, borderRadius: 4, fontFamily: 'Inter, sans-serif' }}>VS</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: cfg.textPrimary, flex: 1, textAlign: 'left' }}>{m.team2?.name}</span>
                    {cfg.showDates && m.matchDate && <span style={{ fontSize: 14, color: primary, minWidth: 130, textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>{fmt(m.matchDate)}</span>}
                </div>
            ))}
        </ExportWrapper>
    );
}

/* ─────────────────────────────────────────────────
   TEMPLATE: KNOCKOUT BRACKET
───────────────────────────────────────────────── */
function KnockoutExportTemplate({ id, matches, settings, cfg }) {
    const rounds = ['ربع النهائي', 'نصف النهائي', 'النهائي', 'نهائي الترتيب'];
    const primary = cfg.accentColor;
    return (
        <ExportWrapper id={id} settings={settings} cfg={cfg} subtitle="شجرة الإقصاء">
            {rounds.map(round => {
                const rm = matches.filter(m => m.knockoutRound === round);
                if (!rm.length) return null;
                return (
                    <div key={round} style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: primary, marginBottom: 10, letterSpacing: '.05em', textTransform: 'uppercase' }}>{round}</div>
                        {rm.map(m => {
                            const done = m.status === 'Completed';
                            const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                            const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                            return (
                                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 10, background: cardBg(cfg), borderRadius: 4, padding: '14px 20px', border: `1px solid ${done ? primary : cfg.cardBorder}` }}>
                                    <span style={{ fontSize: 24, fontWeight: 700, color: w1 ? primary : cfg.textPrimary, flex: 1, textAlign: 'right' }}>{m.team1?.name}</span>
                                    <span style={{ fontSize: 26, fontWeight: 900, color: primary, minWidth: 80, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{done ? `${m.score1} - ${m.score2}` : 'VS'}</span>
                                    <span style={{ fontSize: 24, fontWeight: 700, color: w2 ? primary : cfg.textPrimary, flex: 1, textAlign: 'left' }}>{m.team2?.name}</span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </ExportWrapper>
    );
}

/* ─────────────────────────────────────────────────
   SETTINGS PANEL
───────────────────────────────────────────────── */
function Toggle({ label, checked, onChange }) {
    return (
        <div className="export-toggle-row">
            <span className="export-toggle-label">{label}</span>
            <label className="toggle-switch">
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
                <span className="toggle-slider" />
            </label>
        </div>
    );
}

function ColorRow({ label, value, onChange }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="color-picker-row">
                <input type="color" value={value} onChange={e => onChange(e.target.value)} className="color-swatch" />
                <input type="text" value={value} onChange={e => onChange(e.target.value)} className="form-input color-hex-input" maxLength={7} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────
   THEME PRESETS
───────────────────────────────────────────────── */
const PRESETS = [
    { label: 'ذهبي داكن', cfg: { bgFrom: '#0c0f16', bgTo: '#181d2a', accentColor: '#e2b04a', cardBg: '#181d2a', cardBorder: '#1f2638' } },
    { label: 'ليل أزرق', cfg: { bgFrom: '#070d1a', bgTo: '#0f1e3a', accentColor: '#4a9ee2', cardBg: '#0f1e3a', cardBorder: '#162744' } },
    { label: 'أخضر رياضي', cfg: { bgFrom: '#070f0a', bgTo: '#0e1f14', accentColor: '#3dba72', cardBg: '#0e1f14', cardBorder: '#143322' } },
    { label: 'أبيض نظيف', cfg: { bgFrom: '#f4f6fa', bgTo: '#e8edf5', accentColor: '#1a73e8', textPrimary: '#1a1e2e', textSecondary: '#555e78', cardBg: '#ffffff', cardBorder: '#dde2ed' } },
    { label: 'بنفسجي', cfg: { bgFrom: '#0d0b1a', bgTo: '#16102e', accentColor: '#8b5cf6', cardBg: '#16102e', cardBorder: '#241b44' } },
];

/* ─────────────────────────────────────────────────
   MAIN CanvasExporter
───────────────────────────────────────────────── */
export default function CanvasExporter({ teams, matches, settings }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    const [cfg, setCfg] = useState({ ...DEFAULT_CFG, textPrimary: settings?.colorTextPrimary || DEFAULT_CFG.textPrimary, accentColor: settings?.primaryColor || DEFAULT_CFG.accentColor });
    const [exporting, setExp] = useState(null);
    const [activeSection, setActiveSection] = useState('groups');

    const set = (key, val) => setCfg(p => ({ ...p, [key]: val }));
    const applyPreset = (p) => setCfg(prev => ({ ...prev, ...{ textPrimary: p.cfg.textPrimary || prev.textPrimary, textSecondary: p.cfg.textSecondary || prev.textSecondary }, ...p.cfg }));

    const doExport = async (id, filename) => {
        setExp(id);
        try { await capture(id, filename, cfg); }
        finally { setExp(null); }
    };

    const ExportBtn = ({ id, label, filename }) => (
        <button className="btn btn-ghost btn-sm" onClick={() => doExport(id, filename)} disabled={exporting === id} style={{ justifyContent: 'flex-start' }}>
            {exporting === id ? 'جاري التصدير...' : label}
        </button>
    );

    const pending = matches.filter(m => m.status === 'Pending');
    const completed = matches.filter(m => m.status === 'Completed');
    const knockout = matches.filter(m => m.phase === 'knockout');
    const tName = settings?.tournamentName || 'دوري-رمضان';

    const SECTIONS = [
        { id: 'groups', label: 'المجموعات' },
        { id: 'upcoming', label: 'المباريات القادمة' },
        { id: 'results', label: 'النتائج' },
        { id: 'knockout', label: 'الإقصاء' },
    ];

    return (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* ── Settings Panel ── */}
            <div style={{ flex: '0 0 260px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div className="export-settings-panel">
                    <div className="export-settings-title">قوالب جاهزة</div>
                    <div className="theme-presets">
                        {PRESETS.map(p => (
                            <button key={p.label} className="theme-preset-btn" onClick={() => applyPreset(p)}
                                style={{ borderColor: p.cfg.accentColor, color: p.cfg.accentColor, background: `${p.cfg.accentColor}12` }}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="export-settings-panel">
                    <div className="export-settings-title">الألوان</div>
                    <ColorRow label="لون الخلفية (من)" value={cfg.bgFrom} onChange={v => set('bgFrom', v)} />
                    <ColorRow label="لون الخلفية (إلى)" value={cfg.bgTo} onChange={v => set('bgTo', v)} />
                    <ColorRow label="لون اللكنة" value={cfg.accentColor} onChange={v => set('accentColor', v)} />
                    <ColorRow label="لون النص الأساسي" value={cfg.textPrimary} onChange={v => set('textPrimary', v)} />
                    <ColorRow label="لون البطاقة" value={cfg.cardBg} onChange={v => set('cardBg', v)} />
                    <ColorRow label="لون الحد" value={cfg.cardBorder} onChange={v => set('cardBorder', v)} />
                </div>

                <div className="export-settings-panel">
                    <div className="export-settings-title">الخط</div>
                    <div className="form-group">
                        <label className="form-label">نوع الخط</label>
                        <select className="form-select" value={cfg.fontFamily} onChange={e => set('fontFamily', e.target.value)}>
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginTop: '.4rem' }}>
                        <label className="form-label">نص العلامة المائية</label>
                        <input className="form-input" value={cfg.watermarkText} onChange={e => set('watermarkText', e.target.value)} placeholder={settings?.tournamentName || 'اتركه فارغاً للافتراضي'} />
                    </div>
                </div>

                <div className="export-settings-panel">
                    <div className="export-settings-title">خيارات</div>
                    <div className="form-group">
                        <label className="form-label">جودة الصورة</label>
                        <select className="form-select" value={cfg.scale} onChange={e => set('scale', Number(e.target.value))}>
                            <option value={1}>عادي (1×)</option>
                            <option value={2}>مرتفع (2×)</option>
                            <option value={3}>عالي جداً (3×)</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginTop: '.4rem' }}>
                        <label className="form-label">نمط البطاقة</label>
                        <select className="form-select" value={cfg.cardStyle} onChange={e => set('cardStyle', e.target.value)}>
                            <option value="dark">داكن</option>
                            <option value="flat">مسطح</option>
                        </select>
                    </div>
                    <div style={{ marginTop: '.5rem' }}>
                        <Toggle label="إظهار التواريخ" checked={cfg.showDates} onChange={v => set('showDates', v)} />
                        <Toggle label="علامة مائية" checked={cfg.showWatermark} onChange={v => set('showWatermark', v)} />
                        <Toggle label="شارة التطبيق" checked={cfg.showGroupBadge} onChange={v => set('showGroupBadge', v)} />
                    </div>
                </div>
            </div>

            {/* ── Export Buttons Panel ── */}
            <div style={{ flex: 1, minWidth: 220 }}>
                {/* Inner section tabs */}
                <div className="tabs" style={{ marginBottom: '1rem' }}>
                    {SECTIONS.map(s => (
                        <button key={s.id} className={`tab-btn ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {activeSection === 'groups' && (
                    <div className="export-section">
                        <div className="export-settings-title">تصدير المجموعات</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                            <ExportBtn id="exp-all-groups" label="جميع المجموعات (صورة واحدة)" filename={`${tName}-all-groups.png`} />
                            {GROUPS.map(g => (
                                <ExportBtn key={g} id={`exp-group-${g}`} label={`المجموعة ${g}`} filename={`${tName}-group-${g}.png`} />
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'upcoming' && (
                    <div className="export-section">
                        <div className="export-settings-title">المباريات القادمة ({pending.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                            <ExportBtn id="exp-upcoming-all" label="قائمة كل المباريات القادمة" filename={`${tName}-upcoming.png`} />
                            {pending.map((m, i) => (
                                <ExportBtn key={m._id} id={`exp-match-${m._id}`}
                                    label={`${m.team1?.name}  ضد  ${m.team2?.name}`}
                                    filename={`${tName}-match-${i + 1}.png`} />
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'results' && (
                    <div className="export-section">
                        <div className="export-settings-title">نتائج منتهية ({completed.length})</div>
                        {completed.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>لا توجد مباريات منتهية بعد</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                                {completed.map((m, i) => (
                                    <ExportBtn key={m._id} id={`exp-result-${m._id}`}
                                        label={`${m.team1?.name} ${m.score1} - ${m.score2} ${m.team2?.name}`}
                                        filename={`${tName}-result-${i + 1}.png`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'knockout' && (
                    <div className="export-section">
                        <div className="export-settings-title">الإقصاء ({knockout.length})</div>
                        {knockout.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>لا توجد مباريات إقصاء بعد</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                                <ExportBtn id="exp-knockout" label="شجرة الإقصاء الكاملة" filename={`${tName}-bracket.png`} />
                                {knockout.map((m, i) => (
                                    <ExportBtn key={m._id} id={`exp-ko-${m._id}`}
                                        label={`${m.knockoutRound}: ${m.team1?.name} ضد ${m.team2?.name}`}
                                        filename={`${tName}-ko-${i + 1}.png`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── OFF-SCREEN RENDER TARGETS ── */}
            <AllGroupsTemplate id="exp-all-groups" teams={teams} settings={settings} cfg={cfg} />
            {GROUPS.map(g => (
                <GroupExportTemplate key={g} id={`exp-group-${g}`} group={g} teams={teams.filter(t => t.group === g)} settings={settings} cfg={cfg} />
            ))}
            <UpcomingMatchesTemplate id="exp-upcoming-all" matches={matches} settings={settings} cfg={cfg} />
            {pending.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-match-${m._id}`} match={m} showResult={false} settings={settings} cfg={cfg} />
            ))}
            {completed.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-result-${m._id}`} match={m} showResult={true} settings={settings} cfg={cfg} />
            ))}
            <KnockoutExportTemplate id="exp-knockout" matches={knockout} settings={settings} cfg={cfg} />
            {knockout.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-ko-${m._id}`} match={m} showResult={m.status === 'Completed'} settings={settings} cfg={cfg} />
            ))}
        </div>
    );
}
