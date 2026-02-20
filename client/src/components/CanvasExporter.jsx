import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const GOLD = '#e2b04a';
const BG = '#0d1117';
const BGC = '#161b27';
const BG2 = '#1c2236';

// ---- Helper: download canvas as PNG ----
async function downloadEl(el, filename) {
    const canvas = await html2canvas(el, {
        backgroundColor: BG,
        scale: 2,
        useCORS: true,
        logging: false,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ---- Tournament header used in all exports ----
function ExportHeader({ settings, subtitle }) {
    const name = settings?.tournamentName || 'دوري رمضان';
    const emoji = settings?.logoEmoji || '🌙';
    const primary = settings?.primaryColor || GOLD;
    const sub = subtitle || settings?.subtitle || 'كأس رمضان لكرة القدم';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 20, marginBottom: 44,
            paddingBottom: 22, borderBottom: `2px solid ${primary}`,
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: '50%', background: `${primary}22`,
                border: `2px solid ${primary}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 44,
            }}>{emoji}</div>
            <div>
                <div style={{
                    fontSize: 38, fontWeight: 900, color: primary,
                    fontFamily: `'${settings?.logoFont || 'Lalezar'}', sans-serif`, lineHeight: 1.1,
                }}>{name}</div>
                <div style={{ fontSize: 20, color: '#8896b0', marginTop: 4 }}>{sub}</div>
            </div>
            <div style={{ marginRight: 'auto', textAlign: 'left' }}>
                <div style={{
                    fontSize: 16, color: '#3d4766', border: '1px solid #2e3347',
                    padding: '4px 12px', borderRadius: 20,
                }}>ramadan-tournament</div>
            </div>
        </div>
    );
}

// ---- Common wrapper for all export templates ----
function ExportWrapper({ id, children, settings, fixedHeight = false }) {
    return (
        <div
            id={id}
            style={{
                width: 1080, minHeight: fixedHeight ? 1080 : undefined,
                height: fixedHeight ? 1080 : undefined,
                background: `linear-gradient(160deg, #0d1117 0%, #161b27 50%, #0d1117 100%)`,
                fontFamily: `'${settings?.bodyFont || 'Tajawal'}', sans-serif`,
                direction: 'rtl', padding: 60, boxSizing: 'border-box',
                position: 'fixed', left: -9999, top: -9999, zIndex: -1,
            }}
        >
            <ExportHeader settings={settings} />
            {children}
            {/* Footer watermark */}
            <div style={{
                position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center',
                fontSize: 16, color: '#2e3347',
            }}>
                {settings?.tournamentName || 'دوري رمضان'} · {new Date().getFullYear()}
            </div>
        </div>
    );
}

// ---- GROUP TABLE TEMPLATE ----
function GroupExportTemplate({ id, group, teams, settings }) {
    const sorted = [...teams].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    const primary = settings?.primaryColor || GOLD;
    return (
        <ExportWrapper id={id} settings={settings}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
            }}>
                <div style={{
                    background: `${primary}22`, border: `1px solid ${primary}`,
                    borderRadius: 10, padding: '6px 20px',
                    fontSize: 28, fontWeight: 900, color: primary,
                }}>المجموعة {group}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 26 }}>
                <thead>
                    <tr style={{ background: BGC }}>
                        {['#', 'الفريق', 'لع', 'ف', 'ت', 'خ', 'له', 'ع', 'فارق', 'نق'].map(h => (
                            <th key={h} style={{ padding: '14px 10px', color: '#8896b0', fontWeight: 600, textAlign: 'center', borderBottom: `1px solid #2e3347` }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((t, i) => (
                        <tr key={t._id} style={{
                            background: i === 0 ? `${primary}12` : i === 1 ? `${primary}06` : 'transparent',
                            borderBottom: '1px solid #1c2236',
                        }}>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: i < 2 ? primary : '#8896b0', fontWeight: i < 2 ? 800 : 400 }}>{i + 1}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 700, color: '#e8eaf0' }}>{t.name}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.played}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#4caf80' }}>{t.won}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.drawn}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e05c5c' }}>{t.lost}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.gf}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.ga}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: t.gd >= 0 ? '#4caf80' : '#e05c5c' }}>{t.gd >= 0 ? `+${t.gd}` : t.gd}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 900, color: primary, fontSize: 30 }}>{t.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ExportWrapper>
    );
}

// ---- ALL GROUPS TEMPLATE ----
function AllGroupsTemplate({ id, teams, settings }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    const primary = settings?.primaryColor || GOLD;
    return (
        <div id={id} style={{
            width: 1080, minHeight: 1350, background: `linear-gradient(160deg, #0d1117 0%, #161b27 50%, #0d1117 100%)`,
            fontFamily: `'${settings?.bodyFont || 'Tajawal'}', sans-serif`,
            direction: 'rtl', padding: 50, boxSizing: 'border-box',
            position: 'fixed', left: -9999, top: -9999, zIndex: -1,
        }}>
            <ExportHeader settings={settings} subtitle="جداول المجموعات" />
            {GROUPS.map(g => {
                const groupTeams = teams.filter(t => t.group === g).sort((a, b) => b.points - a.points || b.gd - a.gd);
                if (!groupTeams.length) return null;
                return (
                    <div key={g} style={{ marginBottom: 36 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ background: `${primary}22`, border: `1px solid ${primary}`, padding: '3px 14px', borderRadius: 8 }}>المجموعة {g}</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 20 }}>
                            <thead>
                                <tr style={{ background: BGC }}>
                                    {['#', 'الفريق', 'لع', 'ف', 'ت', 'خ', 'فارق', 'نق'].map(h => (
                                        <th key={h} style={{ padding: '8px 6px', color: '#8896b0', textAlign: 'center', borderBottom: `1px solid #2e3347` }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {groupTeams.map((t, i) => (
                                    <tr key={t._id} style={{ background: i < 2 ? `${primary}08` : 'transparent', borderBottom: '1px solid #1c2236' }}>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: i < 2 ? primary : '#8896b0' }}>{i + 1}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#e8eaf0', fontWeight: 700 }}>{t.name}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#e8eaf0' }}>{t.played}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#4caf80' }}>{t.won}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>{t.drawn}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#e05c5c' }}>{t.lost}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: t.gd >= 0 ? '#4caf80' : '#e05c5c' }}>{t.gd >= 0 ? `+${t.gd}` : t.gd}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 900, color: primary, fontSize: 22 }}>{t.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}

// ---- MATCH CARD TEMPLATE ----
function MatchCardTemplate({ id, match, showResult = false, settings }) {
    const done = match.status === 'Completed' && showResult;
    const primary = settings?.primaryColor || GOLD;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' }) : null;
    const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
    const w1 = done && (match.hasPenalties ? match.penaltyScore1 > match.penaltyScore2 : match.score1 > match.score2);
    const w2 = done && (match.hasPenalties ? match.penaltyScore2 > match.penaltyScore1 : match.score2 > match.score1);
    const isKO = match.phase === 'knockout';

    return (
        <div id={id} style={{
            width: 1080, height: 1080,
            background: `linear-gradient(135deg, #0d1117 0%, #161b27 40%, #0d1117 100%)`,
            fontFamily: `'${settings?.bodyFont || 'Tajawal'}', sans-serif`,
            direction: 'rtl', padding: 60, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'fixed', left: -9999, top: -9999, zIndex: -1,
        }}>
            {/* Logo */}
            <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: `${primary}22`, border: `2px solid ${primary}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 50, marginBottom: 16,
            }}>{settings?.logoEmoji || '🌙'}</div>

            <div style={{
                fontSize: 32, fontWeight: 900, color: primary, marginBottom: 6,
                fontFamily: `'${settings?.logoFont || 'Lalezar'}', sans-serif`,
            }}>{settings?.tournamentName || 'دوري رمضان'}</div>

            <div style={{ fontSize: 20, color: '#8896b0', marginBottom: 40 }}>
                {done ? 'نتيجة المباراة' : 'مباراة قادمة'} — {isKO ? match.knockoutRound : `المجموعة ${match.group}`}
            </div>

            {/* Teams + Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, width: '100%', justifyContent: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    {w1 && <div style={{ fontSize: 24, color: primary, marginBottom: 6 }}>🏆 فائز</div>}
                    <div style={{ fontSize: 44, fontWeight: 900, color: w1 ? primary : '#e8eaf0' }}>
                        {match.team1?.name}
                    </div>
                </div>
                <div style={{
                    padding: '24px 44px', background: BGC, borderRadius: 20,
                    border: `2px solid ${done ? primary : '#2e3347'}`, textAlign: 'center', minWidth: 200,
                    boxShadow: done ? `0 0 40px ${primary}33` : 'none',
                }}>
                    {done ? (
                        <>
                            <div style={{ fontSize: 72, fontWeight: 900, color: primary }}>{match.score1} - {match.score2}</div>
                            {match.hasPenalties && (
                                <div style={{ fontSize: 22, color: '#8896b0', marginTop: 4 }}>
                                    ضربات جزاء: {match.penaltyScore1} - {match.penaltyScore2}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ fontSize: 52, fontWeight: 900, color: '#3d4766' }}>VS</div>
                    )}
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    {w2 && <div style={{ fontSize: 24, color: primary, marginBottom: 6 }}>🏆 فائز</div>}
                    <div style={{ fontSize: 44, fontWeight: 900, color: w2 ? primary : '#e8eaf0' }}>
                        {match.team2?.name}
                    </div>
                </div>
            </div>

            {match.matchDate && !done && (
                <div style={{ marginTop: 44, fontSize: 26, color: '#8896b0', textAlign: 'center' }}>
                    📅 {fmt(match.matchDate)}{fmtTime(match.matchDate) && ` · ⏰ ${fmtTime(match.matchDate)}`}
                </div>
            )}
            {done && (match.redCards1 > 0 || match.redCards2 > 0) && (
                <div style={{ marginTop: 20, fontSize: 20, color: '#888' }}>
                    🟥 {match.team1?.name}: {match.redCards1} | {match.team2?.name}: {match.redCards2}
                </div>
            )}
            {/* Watermark */}
            <div style={{ position: 'absolute', bottom: 28, fontSize: 16, color: '#2e3347' }}>
                {settings?.tournamentName || 'دوري رمضان'} · {new Date().getFullYear()}
            </div>
        </div>
    );
}

// ---- UPCOMING MATCHES LIST ----
function UpcomingMatchesTemplate({ id, matches, settings }) {
    const pending = matches.filter(m => m.status === 'Pending');
    const primary = settings?.primaryColor || GOLD;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
    return (
        <ExportWrapper id={id} settings={settings} subtitle="المباريات القادمة">
            {pending.map((m) => (
                <div key={m._id} style={{
                    display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20,
                    background: BGC, borderRadius: 14, padding: '20px 24px', border: `1px solid #2e3347`,
                }}>
                    <span style={{ fontSize: 16, color: '#8896b0', minWidth: 100 }}>
                        {m.phase === 'knockout' ? m.knockoutRound : `المج·${m.group}`}
                    </span>
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#e8eaf0', flex: 1, textAlign: 'right' }}>{m.team1?.name}</span>
                    <span style={{ fontSize: 20, color: '#555e78', padding: '6px 18px', border: '1px solid #2e3347', borderRadius: 8 }}>VS</span>
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#e8eaf0', flex: 1, textAlign: 'left' }}>{m.team2?.name}</span>
                    {m.matchDate && (
                        <span style={{ fontSize: 16, color: primary, minWidth: 140, textAlign: 'left' }}>📅 {fmt(m.matchDate)}</span>
                    )}
                </div>
            ))}
        </ExportWrapper>
    );
}

// ---- KNOCKOUT BRACKET TEMPLATE ----
function KnockoutExportTemplate({ id, matches, settings }) {
    const byRound = (round) => (matches || []).filter((m) => m.knockoutRound === round);
    const rounds = ['ربع النهائي', 'نصف النهائي', 'النهائي', 'نهائي الترتيب'];
    const primary = settings?.primaryColor || GOLD;
    return (
        <ExportWrapper id={id} settings={settings} subtitle="شجرة الإقصاء">
            {rounds.map(round => {
                const rm = byRound(round);
                if (!rm.length) return null;
                return (
                    <div key={round} style={{ marginBottom: 32 }}>
                        <div style={{
                            fontSize: 20, fontWeight: 800, color: primary, marginBottom: 12,
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{ background: `${primary}22`, border: `1px solid ${primary}`, padding: '3px 14px', borderRadius: 8 }}>{round}</span>
                        </div>
                        {rm.map(m => {
                            const done = m.status === 'Completed';
                            const w1 = done && (m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2);
                            const w2 = done && (m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1);
                            return (
                                <div key={m._id} style={{
                                    display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12,
                                    background: BGC, borderRadius: 12, padding: '16px 24px',
                                    border: `1px solid ${done ? primary : '#2e3347'}`,
                                    boxShadow: done ? `0 0 20px ${primary}22` : 'none',
                                }}>
                                    <span style={{ fontSize: 26, fontWeight: 700, color: w1 ? primary : '#e8eaf0', flex: 1, textAlign: 'right' }}>
                                        {w1 && '🏆 '}{m.team1?.name}
                                    </span>
                                    <span style={{ fontSize: 28, fontWeight: 900, color: primary, minWidth: 90, textAlign: 'center' }}>
                                        {done ? `${m.score1} - ${m.score2}` : 'VS'}
                                    </span>
                                    <span style={{ fontSize: 26, fontWeight: 700, color: w2 ? primary : '#e8eaf0', flex: 1, textAlign: 'left' }}>
                                        {m.team2?.name}{w2 && ' 🏆'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </ExportWrapper>
    );
}

// ============================================================
// MAIN CanvasExporter Component
// ============================================================
export default function CanvasExporter({ teams, matches, settings }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    const [exporting, setExporting] = useState(null);

    const doExport = async (id, filename) => {
        const el = document.getElementById(id);
        if (!el) return;
        setExporting(id);
        try {
            await downloadEl(el, filename);
        } finally {
            setExporting(null);
        }
    };

    const pending = matches.filter(m => m.status === 'Pending');
    const completed = matches.filter(m => m.status === 'Completed');
    const knockout = matches.filter(m => m.phase === 'knockout');

    const ExportBtn = ({ id, label, filename }) => (
        <button
            className="btn btn-ghost btn-sm export-btn"
            onClick={() => doExport(id, filename)}
            disabled={exporting === id}
        >
            {exporting === id ? '⏳ جاري التصدير...' : `⬇️ ${label}`}
        </button>
    );

    const tournamentName = settings?.tournamentName || 'دوري-رمضان';

    return (
        <div className="canvas-exporter">
            {/* SECTION 1: Groups */}
            <div className="export-section">
                <h3 className="export-section-title">📊 المجموعات</h3>
                <div className="export-btn-grid">
                    <ExportBtn id="exp-all-groups" label="جميع المجموعات" filename={`${tournamentName}-all-groups.png`} />
                    {GROUPS.map(g => (
                        <ExportBtn key={g} id={`exp-group-${g}`} label={`المجموعة ${g}`} filename={`${tournamentName}-group-${g}.png`} />
                    ))}
                </div>
            </div>

            {/* SECTION 2: Upcoming */}
            <div className="export-section">
                <h3 className="export-section-title">📅 المباريات القادمة</h3>
                <div className="export-btn-grid">
                    <ExportBtn id="exp-upcoming-all" label="كل المباريات القادمة" filename={`${tournamentName}-upcoming.png`} />
                    {pending.map((m, i) => (
                        <ExportBtn key={m._id} id={`exp-match-${m._id}`}
                            label={`${m.team1?.name} vs ${m.team2?.name}`}
                            filename={`${tournamentName}-match-${i + 1}.png`} />
                    ))}
                </div>
            </div>

            {/* SECTION 3: Results */}
            {completed.length > 0 && (
                <div className="export-section">
                    <h3 className="export-section-title">✅ نتائج المباريات المنتهية</h3>
                    <div className="export-btn-grid">
                        {completed.map((m, i) => (
                            <ExportBtn key={m._id} id={`exp-result-${m._id}`}
                                label={`${m.team1?.name} ${m.score1}-${m.score2} ${m.team2?.name}`}
                                filename={`${tournamentName}-result-${i + 1}.png`} />
                        ))}
                    </div>
                </div>
            )}

            {/* SECTION 4: Knockout */}
            {knockout.length > 0 && (
                <div className="export-section">
                    <h3 className="export-section-title">🏆 دوري الإقصاء</h3>
                    <div className="export-btn-grid">
                        <ExportBtn id="exp-knockout" label="شجرة الإقصاء الكاملة" filename={`${tournamentName}-bracket.png`} />
                        {knockout.map((m, i) => (
                            <ExportBtn key={m._id} id={`exp-ko-${m._id}`}
                                label={`${m.knockoutRound}: ${m.team1?.name} vs ${m.team2?.name}`}
                                filename={`${tournamentName}-ko-${i + 1}.png`} />
                        ))}
                    </div>
                </div>
            )}

            {/* OFF-SCREEN RENDER TARGETS */}
            <AllGroupsTemplate id="exp-all-groups" teams={teams} settings={settings} />
            {GROUPS.map(g => (
                <GroupExportTemplate key={g} id={`exp-group-${g}`} group={g}
                    teams={teams.filter(t => t.group === g)} settings={settings} />
            ))}
            <UpcomingMatchesTemplate id="exp-upcoming-all" matches={matches} settings={settings} />
            {pending.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-match-${m._id}`} match={m} showResult={false} settings={settings} />
            ))}
            {completed.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-result-${m._id}`} match={m} showResult={true} settings={settings} />
            ))}
            <KnockoutExportTemplate id="exp-knockout" matches={knockout} settings={settings} />
            {knockout.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-ko-${m._id}`} match={m} showResult={m.status === 'Completed'} settings={settings} />
            ))}
        </div>
    );
}
