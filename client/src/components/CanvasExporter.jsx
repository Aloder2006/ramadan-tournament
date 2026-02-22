import { useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { X, Download } from 'lucide-react';

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
    cardStyle: 'dark',      // dark | flat
};

const FONTS = ['Tajawal', 'Cairo', 'Lalezar', 'Barlow Condensed', 'Oswald', 'Amiri', 'Rubik'];

/* ─── Download helper ─── */
async function capture(el, filename, cfg) {
    if (!el) { alert('العنصر غير موجود'); return; }

    // Using html-to-image
    const dataUrl = await htmlToImage.toPng(el, {
        quality: 1.0,
        pixelRatio: cfg.scale,
        style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
        }
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
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
                    {settings?.tournamentName ? settings.tournamentName.substring(0, 20) : 'رمضانيات'}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────
   EXPORT WRAPPER
───────────────────────────────────────────────── */
function ExportWrapper({ innerRef, children, settings, cfg, subtitle, square = false }) {
    // Note: We don't hide it with position:fixed anymore; the parent handles visibility/scaling
    return (
        <div ref={innerRef} style={{
            width: 1080, minHeight: square ? 1080 : undefined, height: square ? 1080 : undefined,
            background: bgGrad(cfg),
            fontFamily: `'${cfg.fontFamily}', sans-serif`,
            direction: 'rtl', padding: 56, boxSizing: 'border-box',
            position: 'relative'
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
function AllGroupsTemplate({ innerRef, teams, settings, cfg }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    const primary = cfg.accentColor;
    return (
        <div ref={innerRef} style={{ width: 1080, minHeight: 1350, background: bgGrad(cfg), fontFamily: `'${cfg.fontFamily}', sans-serif`, direction: 'rtl', padding: 56, boxSizing: 'border-box', position: 'relative' }}>
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
function GroupExportTemplate({ innerRef, group, teams, settings, cfg }) {
    const sorted = [...teams].sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
    const primary = cfg.accentColor;
    return (
        <ExportWrapper innerRef={innerRef} settings={settings} cfg={cfg} subtitle={`المجموعة ${group}`}>
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
function MatchCardTemplate({ innerRef, match, showResult, settings, cfg }) {
    const done = match.status === 'Completed' && showResult;
    const primary = cfg.accentColor;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' }) : null;
    const fmtT = (d) => d ? new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
    const w1 = done && (match.hasPenalties ? match.penaltyScore1 > match.penaltyScore2 : match.score1 > match.score2);
    const w2 = done && (match.hasPenalties ? match.penaltyScore2 > match.penaltyScore1 : match.score2 > match.score1);
    const isKO = match.phase === 'knockout';
    return (
        <div ref={innerRef} style={{ width: 1080, height: 1080, background: bgGrad(cfg), fontFamily: `'${cfg.fontFamily}', sans-serif`, direction: 'rtl', padding: 60, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
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
                    {w1 && <div style={{ fontSize: 16, color: primary, marginBottom: 6, fontWeight: 800 }}>فائز</div>}
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
                    {w2 && <div style={{ fontSize: 16, color: primary, marginBottom: 6, fontWeight: 800 }}>فائز</div>}
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
function UpcomingMatchesTemplate({ innerRef, matches, settings, cfg }) {
    const pending = matches.filter(m => m.status === 'Pending');
    const primary = cfg.accentColor;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
    return (
        <ExportWrapper innerRef={innerRef} settings={settings} cfg={cfg} subtitle="المباريات القادمة">
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
function KnockoutExportTemplate({ innerRef, matches, settings, cfg }) {
    const rounds = ['ربع النهائي', 'نصف النهائي', 'النهائي', 'نهائي الترتيب'];
    const primary = cfg.accentColor;
    return (
        <ExportWrapper innerRef={innerRef} settings={settings} cfg={cfg} subtitle="شجرة الإقصاء">
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
    { label: 'ذهبي داكن', cfg: { bgFrom: '#0c0f16', bgTo: '#181d2a', accentColor: '#e2b04a', textPrimary: '#dde2ed',cardBg: '#181d2a',textSecondary: '#7a8aa0', cardBorder: '#1f2638' } },
    { label: 'ليل أزرق', cfg: { bgFrom: '#070d1a', bgTo: '#0f1e3a', accentColor: '#4a9ee2',textPrimary: '#dde2ed', cardBg: '#0f1e3a',textSecondary: '#7a8aa0', cardBorder: '#162744' } },
    { label: 'أخضر رياضي', cfg: { bgFrom: '#070f0a', bgTo: '#0e1f14', accentColor: '#3dba72',textPrimary: '#dde2ed', cardBg: '#0e1f14',textSecondary: '#7a8aa0', cardBorder: '#143322' } },
    { label: 'أبيض نظيف', cfg: { bgFrom: '#f4f6fa', bgTo: '#e8edf5', accentColor: '#1a73e8', textPrimary: '#1a1e2e', textSecondary: '#555e78', cardBg: '#ffffff', cardBorder: '#dde2ed' } },
    { label: 'بنفسجي', cfg: { bgFrom: '#0d0b1a', bgTo: '#16102e', accentColor: '#8b5cf6',textPrimary: '#dde2ed', cardBg: '#16102e',textSecondary: '#7a8aa0', cardBorder: '#241b44' } },
];

/* ─────────────────────────────────────────────────
   MAIN CanvasExporter
───────────────────────────────────────────────── */
export default function CanvasExporter({ teams, matches, settings }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    const [cfg, setCfg] = useState(() => {
        try {
            const saved = localStorage.getItem('canvasExporterCfg');
            if (saved) return { ...DEFAULT_CFG, ...JSON.parse(saved) };
        } catch (e) { }
        return { ...DEFAULT_CFG, textPrimary: settings?.colorTextPrimary || DEFAULT_CFG.textPrimary, accentColor: settings?.primaryColor || DEFAULT_CFG.accentColor };
    });

    useEffect(() => {
        localStorage.setItem('canvasExporterCfg', JSON.stringify(cfg));
    }, [cfg]);

    const [exporting, setExp] = useState(false);
    const [activeSection, setActiveSection] = useState('groups');

    // Preview state
    const [previewTarget, setPreviewTarget] = useState(null); // stores object like { type: 'all-groups', matchId: '...', group: 'A' }
    const [previewFilename, setPreviewFilename] = useState('');
    const targetRef = useRef(null);
    const containerRef = useRef(null);
    const [scale, setScale] = useState(0.5);

    // Calculate scale to fit in modal
    useEffect(() => {
        if (previewTarget && containerRef.current && targetRef.current) {
            const containerW = containerRef.current.offsetWidth - 60;
            const containerH = containerRef.current.offsetHeight - 60;
            const targetW = targetRef.current.offsetWidth;
            const targetH = targetRef.current.offsetHeight;
            const scaleW = containerW / targetW;
            const scaleH = containerH / targetH;
            setScale(Math.min(scaleW, scaleH, 1));
        }
    }, [previewTarget, cfg.scale]); // Re-calculate if scale changes (which triggers re-render)

    const set = (key, val) => setCfg(p => ({ ...p, [key]: val }));
    const applyPreset = (p) => setCfg(prev => ({ ...prev, ...{ textPrimary: p.cfg.textPrimary || prev.textPrimary, textSecondary: p.cfg.textSecondary || prev.textSecondary }, ...p.cfg }));

    const openPreview = (type, filename, data = {}) => {
        setPreviewTarget({ type, ...data });
        setPreviewFilename(filename);
    };

    const closePreview = () => {
        setPreviewTarget(null);
        setPreviewFilename('');
    };

    const doExport = async () => {
        if (!targetRef.current) return;
        setExp(true);
        try { await capture(targetRef.current, previewFilename, cfg); }
        finally { setExp(false); }
    };

    const ExportBtn = ({ label, filename, type, data }) => (
        <button className="btn btn-ghost btn-sm" onClick={() => openPreview(type, filename, data)} style={{ justifyContent: 'flex-start' }}>
            معاينة: {label}
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

    // Helper to render the active target cleanly
    const renderTarget = () => {
        if (!previewTarget) return null;

        switch (previewTarget.type) {
            case 'all-groups':
                return <AllGroupsTemplate innerRef={targetRef} teams={teams} settings={settings} cfg={cfg} />;
            case 'single-group':
                return <GroupExportTemplate innerRef={targetRef} group={previewTarget.group} teams={teams.filter(t => t.group === previewTarget.group)} settings={settings} cfg={cfg} />;
            case 'upcoming-all':
                return <UpcomingMatchesTemplate innerRef={targetRef} matches={matches} settings={settings} cfg={cfg} />;
            case 'match':
            case 'result':
            case 'ko-match':
                const match = matches.find(m => m._id === previewTarget.matchId);
                return match ? <MatchCardTemplate innerRef={targetRef} match={match} showResult={previewTarget.type === 'result' || previewTarget.type === 'ko-match'} settings={settings} cfg={cfg} /> : null;
            case 'knockout-all':
                return <KnockoutExportTemplate innerRef={targetRef} matches={knockout} settings={settings} cfg={cfg} />;
            default:
                return null;
        }
    };

    // Render Preview Modal Overlay
    const renderPreviewModal = () => {
        if (!previewTarget) return null;

        return (
            <div className="export-preview-modal-overlay">
                <div className="export-preview-modal">
                    {/* Header */}
                    <div className="export-preview-header">
                        <div className="export-preview-title">
                            معاينة التصدير
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-success" onClick={doExport} disabled={exporting}>
                                <Download size={16} />
                                {exporting ? 'جاري التحميل...' : 'تحميل الصورة'}
                            </button>
                            <button className="btn btn-ghost" onClick={closePreview} style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body (Sidebar + Content) */}
                    <div className="export-preview-body">
                        {/* Settings Sidebar */}
                        <div className="export-preview-sidebar">
                            {/* Pre-made Presets */}
                            <div>
                                <div className="export-settings-title" style={{ marginBottom: '8px' }}>قوالب جاهزة</div>
                                <div className="theme-presets" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {PRESETS.map(p => (
                                        <button key={p.label} className="theme-preset-btn" onClick={() => applyPreset(p)}
                                            style={{ borderColor: p.cfg.accentColor, color: p.cfg.accentColor, background: `${p.cfg.accentColor}12`, flex: '1 1 calc(50% - 6px)', minWidth: '90px', padding: '6px', fontSize: '0.75rem' }}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <div className="export-settings-title" style={{ marginBottom: '8px' }}>الألوان</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <ColorRow label="لون الخلفية (من)" value={cfg.bgFrom} onChange={v => set('bgFrom', v)} />
                                    <ColorRow label="لون الخلفية (إلى)" value={cfg.bgTo} onChange={v => set('bgTo', v)} />
                                    <ColorRow label="لون اللكنة" value={cfg.accentColor} onChange={v => set('accentColor', v)} />
                                    <ColorRow label="لون النص الأساسي" value={cfg.textPrimary} onChange={v => set('textPrimary', v)} />
                                    <ColorRow label="لون البطاقة" value={cfg.cardBg} onChange={v => set('cardBg', v)} />
                                </div>
                            </div>

                            {/* Options */}
                            <div>
                                <div className="export-settings-title" style={{ marginBottom: '8px' }}>الخط والخيارات</div>
                                <div className="form-group" style={{ marginBottom: '8px' }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>الخط</label>
                                    <select className="form-select" value={cfg.fontFamily} onChange={e => set('fontFamily', e.target.value)}>
                                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '8px' }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>نمط البطاقة</label>
                                    <select className="form-select" value={cfg.cardStyle} onChange={e => set('cardStyle', e.target.value)}>
                                        <option value="dark">داكن (Dark)</option>
                                        <option value="flat">مسطح (Flat)</option>
                                        <option value="glass">زجاجي (Glass)</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '8px' }}>
                                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>جودة التصدير</label>
                                    <select className="form-select" value={cfg.scale} onChange={e => set('scale', Number(e.target.value))}>
                                        <option value={1}>عادية (1x)</option>
                                        <option value={2}>عالية (2x)</option>
                                        <option value={3}>فائقة (3x)</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '6px' }}>
                                    <input className="form-input" value={cfg.watermarkText} onChange={e => set('watermarkText', e.target.value)} placeholder="نص العلامة المائية..." />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                                    <Toggle label="إظهار التواريخ" checked={cfg.showDates} onChange={v => set('showDates', v)} />
                                    <Toggle label="علامة مائية" checked={cfg.showWatermark} onChange={v => set('showWatermark', v)} />
                                    <Toggle label="شريط البطولة" checked={cfg.showGroupBadge} onChange={v => set('showGroupBadge', v)} />
                                </div>
                                <button className="btn btn-ghost btn-sm" style={{ marginTop: '12px', width: '100%', fontSize: '0.75rem', border: '1px solid var(--border)' }} onClick={() => setCfg({ ...DEFAULT_CFG, textPrimary: settings?.colorTextPrimary || DEFAULT_CFG.textPrimary, accentColor: settings?.primaryColor || DEFAULT_CFG.accentColor })}>
                                    استعادة الافتراضيات
                                </button>
                            </div>
                        </div>

                        {/* Scaled Preview Canvas */}
                        <div className="export-preview-content" ref={containerRef}>
                            <div className="export-preview-canvas-wrapper" style={{ transform: `scale(${scale})` }}>
                                {renderTarget()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {renderPreviewModal()}

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
                            <ExportBtn type="all-groups" label="جميع المجموعات (صورة واحدة)" filename={`${tName}-all-groups.png`} />
                            {GROUPS.map(g => (
                                <ExportBtn key={g} type="single-group" data={{ group: g }} label={`المجموعة ${g}`} filename={`${tName}-group-${g}.png`} />
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'upcoming' && (
                    <div className="export-section">
                        <div className="export-settings-title">المباريات القادمة ({pending.length})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                            <ExportBtn type="upcoming-all" label="قائمة كل المباريات القادمة" filename={`${tName}-upcoming.png`} />
                            {pending.map((m, i) => (
                                <ExportBtn key={m._id} type="match" data={{ matchId: m._id }}
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
                                    <ExportBtn key={m._id} type="result" data={{ matchId: m._id }}
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
                                <ExportBtn type="knockout-all" label="شجرة الإقصاء الكاملة" filename={`${tName}-bracket.png`} />
                                {knockout.map((m, i) => (
                                    <ExportBtn key={m._id} type="ko-match" data={{ matchId: m._id }}
                                        label={`${m.knockoutRound}: ${m.team1?.name} ضد ${m.team2?.name}`}
                                        filename={`${tName}-ko-${i + 1}.png`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
