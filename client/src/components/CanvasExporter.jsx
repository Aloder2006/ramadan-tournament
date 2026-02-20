import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const GOLD = '#e2b04a';
const BG = '#14171e';
const BGC = '#1c2030';

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

// ---- Common wrapper for all export templates ----
function ExportWrapper({ id, children }) {
    return (
        <div
            id={id}
            style={{
                width: 1080, minHeight: 1080, background: BG, fontFamily: 'Tajawal, sans-serif',
                direction: 'rtl', padding: 60, boxSizing: 'border-box', position: 'fixed',
                left: -9999, top: -9999, zIndex: -1,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, paddingBottom: 20, borderBottom: `2px solid ${GOLD}` }}>
                <span style={{ fontSize: 48 }}>🌙</span>
                <div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: GOLD }}>دوري رمضان</div>
                    <div style={{ fontSize: 20, color: '#8896b0' }}>كأس رمضان لكرة القدم</div>
                </div>
            </div>
            {children}
        </div>
    );
}

// ---- GROUP TABLE TEMPLATE ----
function GroupExportTemplate({ id, group, teams }) {
    const sorted = [...teams].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    return (
        <ExportWrapper id={id}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#e8eaf0', marginBottom: 24 }}>
                المجموعة {group}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 26 }}>
                <thead>
                    <tr style={{ background: BGC }}>
                        {['#', 'الفريق', 'لع', 'ف', 'ت', 'خ', 'له', 'ع', 'فارق', 'نق'].map(h => (
                            <th key={h} style={{ padding: '14px 10px', color: '#8896b0', fontWeight: 600, textAlign: 'center', borderBottom: '1px solid #2e3347' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((t, i) => (
                        <tr key={t._id} style={{ background: i === 0 ? 'rgba(226,176,74,0.08)' : 'transparent' }}>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#8896b0' }}>{i + 1}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 700, color: '#e8eaf0' }}>{t.name}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.played}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#4caf80' }}>{t.won}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.drawn}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e05c5c' }}>{t.lost}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.gf}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: '#e8eaf0' }}>{t.ga}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', color: t.gd >= 0 ? '#4caf80' : '#e05c5c' }}>{t.gd >= 0 ? `+${t.gd}` : t.gd}</td>
                            <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 900, color: GOLD, fontSize: 30 }}>{t.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ExportWrapper>
    );
}

// ---- ALL GROUPS TEMPLATE ----
function AllGroupsTemplate({ id, teams }) {
    const GROUPS = ['أ', 'ب', 'ج', 'د'];
    return (
        <div id={id} style={{
            width: 1080, minHeight: 1350, background: BG, fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl', padding: 50, boxSizing: 'border-box', position: 'fixed',
            left: -9999, top: -9999, zIndex: -1,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 16, borderBottom: `2px solid ${GOLD}` }}>
                <span style={{ fontSize: 40 }}>🌙</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>دوري رمضان — جداول المجموعات</div>
            </div>
            {GROUPS.map(g => {
                const groupTeams = teams.filter(t => t.group === g).sort((a, b) => b.points - a.points || b.gd - a.gd);
                if (!groupTeams.length) return null;
                return (
                    <div key={g} style={{ marginBottom: 36 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: GOLD, marginBottom: 10 }}>المجموعة {g}</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 20 }}>
                            <thead>
                                <tr style={{ background: BGC }}>
                                    {['#', 'الفريق', 'لع', 'ف', 'ت', 'خ', 'فارق', 'نق'].map(h => (
                                        <th key={h} style={{ padding: '8px 6px', color: '#8896b0', textAlign: 'center', borderBottom: '1px solid #2e3347' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {groupTeams.map((t, i) => (
                                    <tr key={t._id} style={{ background: i < 2 ? 'rgba(226,176,74,0.06)' : 'transparent' }}>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#8896b0' }}>{i + 1}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#e8eaf0', fontWeight: 700 }}>{t.name}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#e8eaf0' }}>{t.played}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#4caf80' }}>{t.won}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>{t.drawn}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: '#e05c5c' }}>{t.lost}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', color: t.gd >= 0 ? '#4caf80' : '#e05c5c' }}>{t.gd >= 0 ? `+${t.gd}` : t.gd}</td>
                                        <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 900, color: GOLD, fontSize: 22 }}>{t.points}</td>
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

// ---- MATCH CARD TEMPLATE (upcoming or result) ----
function MatchCardTemplate({ id, match, showResult = false }) {
    const done = match.status === 'Completed' && showResult;
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' }) : null;
    const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <div id={id} style={{
            width: 1080, height: 1080, background: BG, fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl', padding: 60, boxSizing: 'border-box', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'fixed', left: -9999, top: -9999, zIndex: -1,
        }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌙</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, marginBottom: 8 }}>دوري رمضان</div>
            <div style={{ fontSize: 22, color: '#8896b0', marginBottom: 40 }}>
                {done ? 'نتيجة المباراة' : 'مباراة قادمة'} — المجموعة {match.group}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 40, width: '100%', justifyContent: 'center' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 44, fontWeight: 900, color: done && match.score1 > match.score2 ? GOLD : '#e8eaf0' }}>
                        {match.team1?.name}
                    </div>
                </div>
                <div style={{ padding: '20px 40px', background: BGC, borderRadius: 16, border: `2px solid ${done ? GOLD : '#2e3347'}`, textAlign: 'center', minWidth: 180 }}>
                    {done
                        ? <div style={{ fontSize: 72, fontWeight: 900, color: GOLD }}>{match.score1} - {match.score2}</div>
                        : <div style={{ fontSize: 48, fontWeight: 900, color: '#555e78' }}>VS</div>}
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 44, fontWeight: 900, color: done && match.score2 > match.score1 ? GOLD : '#e8eaf0' }}>
                        {match.team2?.name}
                    </div>
                </div>
            </div>

            {match.matchDate && !done && (
                <div style={{ marginTop: 40, fontSize: 26, color: '#8896b0' }}>
                    📅 {fmt(match.matchDate)} {fmtTime(match.matchDate) && `· ⏰ ${fmtTime(match.matchDate)}`}
                </div>
            )}
            {done && (match.redCards1 > 0 || match.redCards2 > 0) && (
                <div style={{ marginTop: 20, fontSize: 22, color: '#888' }}>
                    🟥 {match.team1?.name}: {match.redCards1} | {match.team2?.name}: {match.redCards2}
                </div>
            )}
        </div>
    );
}

// ---- UPCOMING MATCHES LIST ----
function UpcomingMatchesTemplate({ id, matches }) {
    const pending = matches.filter(m => m.status === 'Pending');
    const fmt = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;
    return (
        <div id={id} style={{
            width: 1080, minHeight: 1080, background: BG, fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl', padding: 60, boxSizing: 'border-box',
            position: 'fixed', left: -9999, top: -9999, zIndex: -1,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36, paddingBottom: 16, borderBottom: `2px solid ${GOLD}` }}>
                <span style={{ fontSize: 40 }}>🌙</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>المباريات القادمة</div>
            </div>
            {pending.map((m) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, background: BGC, borderRadius: 12, padding: '20px 24px', border: '1px solid #2e3347' }}>
                    <span style={{ fontSize: 18, color: '#8896b0', minWidth: 90 }}>المج·{m.group}</span>
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#e8eaf0', flex: 1, textAlign: 'right' }}>{m.team1?.name}</span>
                    <span style={{ fontSize: 20, color: '#555e78', padding: '6px 18px', border: '1px solid #2e3347', borderRadius: 8 }}>VS</span>
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#e8eaf0', flex: 1, textAlign: 'left' }}>{m.team2?.name}</span>
                    {m.matchDate && <span style={{ fontSize: 18, color: '#8896b0', minWidth: 120, textAlign: 'left' }}>📅 {fmt(m.matchDate)}</span>}
                </div>
            ))}
        </div>
    );
}

// ---- KNOCKOUT BRACKET TEMPLATE ----
function KnockoutExportTemplate({ id, matches, qualifiedTeams }) {
    const byRound = (round) => (matches || []).filter((m) => m.knockoutRound === round);
    const rounds = ['ربع النهائي', 'نصف النهائي', 'النهائي', 'نهائي الترتيب'];
    return (
        <div id={id} style={{
            width: 1080, minHeight: 1080, background: BG, fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl', padding: 60, boxSizing: 'border-box',
            position: 'fixed', left: -9999, top: -9999, zIndex: -1,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36, paddingBottom: 16, borderBottom: `2px solid ${GOLD}` }}>
                <span style={{ fontSize: 40 }}>🏆</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>دوري الإقصاء</div>
            </div>
            {rounds.map(round => {
                const rm = byRound(round);
                if (!rm.length) return null;
                return (
                    <div key={round} style={{ marginBottom: 30 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#8896b0', marginBottom: 12 }}>{round}</div>
                        {rm.map(m => (
                            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12, background: BGC, borderRadius: 12, padding: '16px 24px', border: `1px solid ${m.status === 'Completed' ? GOLD : '#2e3347'}` }}>
                                <span style={{ fontSize: 26, fontWeight: 700, color: m.status === 'Completed' && m.score1 > m.score2 ? GOLD : '#e8eaf0', flex: 1, textAlign: 'right' }}>{m.team1?.name}</span>
                                <span style={{ fontSize: 28, fontWeight: 900, color: GOLD, minWidth: 80, textAlign: 'center' }}>
                                    {m.status === 'Completed' ? `${m.score1} - ${m.score2}` : 'VS'}
                                </span>
                                <span style={{ fontSize: 26, fontWeight: 700, color: m.status === 'Completed' && m.score2 > m.score1 ? GOLD : '#e8eaf0', flex: 1, textAlign: 'left' }}>{m.team2?.name}</span>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
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

    return (
        <div className="canvas-exporter">
            {/* ===========================
          SECTION 1: Groups
          =========================== */}
            <div className="export-section">
                <h3 className="export-section-title">📊 المجموعات</h3>
                <div className="export-btn-grid">
                    <ExportBtn id="exp-all-groups" label="جميع المجموعات" filename="all-groups.png" />
                    {GROUPS.map(g => (
                        <ExportBtn key={g} id={`exp-group-${g}`} label={`المجموعة ${g}`} filename={`group-${g}.png`} />
                    ))}
                </div>
            </div>

            {/* ===========================
          SECTION 2: Upcoming Matches
          =========================== */}
            <div className="export-section">
                <h3 className="export-section-title">📅 المباريات القادمة</h3>
                <div className="export-btn-grid">
                    <ExportBtn id="exp-upcoming-all" label="كل المباريات القادمة" filename="upcoming-matches.png" />
                    {pending.map((m, i) => (
                        <ExportBtn
                            key={m._id}
                            id={`exp-match-${m._id}`}
                            label={`${m.team1?.name} vs ${m.team2?.name}`}
                            filename={`match-${i + 1}.png`}
                        />
                    ))}
                </div>
            </div>

            {/* ===========================
          SECTION 3: Completed Results
          =========================== */}
            {completed.length > 0 && (
                <div className="export-section">
                    <h3 className="export-section-title">✅ نتائج المباريات المنتهية</h3>
                    <div className="export-btn-grid">
                        {completed.map((m, i) => (
                            <ExportBtn
                                key={m._id}
                                id={`exp-result-${m._id}`}
                                label={`${m.team1?.name} ${m.score1}-${m.score2} ${m.team2?.name}`}
                                filename={`result-${i + 1}.png`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ===========================
          SECTION 4: Knockout
          =========================== */}
            {knockout.length > 0 && (
                <div className="export-section">
                    <h3 className="export-section-title">🏆 دوري الإقصاء</h3>
                    <div className="export-btn-grid">
                        <ExportBtn id="exp-knockout" label="شجرة الإقصاء الكاملة" filename="knockout-bracket.png" />
                        {knockout.map((m, i) => (
                            <ExportBtn
                                key={m._id}
                                id={`exp-ko-${m._id}`}
                                label={`${m.knockoutRound}: ${m.team1?.name} vs ${m.team2?.name}`}
                                filename={`knockout-${i + 1}.png`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ===========================
          OFF-SCREEN RENDER TARGETS
          =========================== */}

            {/* All groups */}
            <AllGroupsTemplate id="exp-all-groups" teams={teams} />

            {/* Individual groups */}
            {GROUPS.map(g => (
                <GroupExportTemplate
                    key={g}
                    id={`exp-group-${g}`}
                    group={g}
                    teams={teams.filter(t => t.group === g)}
                />
            ))}

            {/* Upcoming matches list */}
            <UpcomingMatchesTemplate id="exp-upcoming-all" matches={matches} />

            {/* Individual pending match cards */}
            {pending.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-match-${m._id}`} match={m} showResult={false} />
            ))}

            {/* Completed result cards */}
            {completed.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-result-${m._id}`} match={m} showResult={true} />
            ))}

            {/* Full knockout bracket */}
            <KnockoutExportTemplate id="exp-knockout" matches={knockout} qualifiedTeams={settings?.qualifiedTeams} />

            {/* Individual knockout match cards */}
            {knockout.map(m => (
                <MatchCardTemplate key={m._id} id={`exp-ko-${m._id}`} match={m} showResult={m.status === 'Completed'} />
            ))}
        </div>
    );
}
