import { useState } from 'react';

/* ──────────────────────────────────────────
   MATCH CARD — premium horizontal layout
────────────────────────────────────────── */
function MatchCard({ m, isTomorrow }) {
    const done = m.status === 'Completed';

    let w1 = false, w2 = false;
    if (done) {
        if (m.hasPenalties) { w1 = m.penaltyScore1 > m.penaltyScore2; w2 = !w1; }
        else { w1 = m.score1 > m.score2; w2 = m.score2 > m.score1; }
    }

    const timeStr = m.matchDate ? new Date(m.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
    const dayStr = m.matchDate ? new Date(m.matchDate).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' }) : null;
    const badge = m.phase === 'knockout' ? (m.knockoutRound || 'إقصاء') : (m.group ? `م·${m.group}` : '');

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            padding: '.65rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '.35rem',
            transition: 'background .12s',
        }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
        >
            {/* Top: badge + time */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {badge && (
                    <span style={{
                        fontSize: '.6rem', fontWeight: 800, color: 'var(--gold)',
                        background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                        padding: '.05rem .4rem', borderRadius: '2px',
                        letterSpacing: '.04em', textTransform: 'uppercase',
                    }}>{badge}</span>
                )}
                {timeStr && <span style={{ fontSize: '.7rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: done ? 'var(--text-muted)' : 'var(--gold)' }}>{timeStr}</span>}
                {!timeStr && !done && <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>—</span>}
            </div>

            {/* Teams + Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                {/* Team 1 */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.4rem', minWidth: 0 }}>
                    <span style={{
                        fontSize: '.88rem', fontWeight: w1 ? 900 : 700,
                        color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{m.team1?.name}</span>
                </div>

                {/* Score box */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px', padding: '.15rem .5rem',
                    minWidth: 60, justifyContent: 'center',
                }}>
                    {done ? (
                        <>
                            <span style={{ fontSize: '.95rem', fontFamily: 'Inter, sans-serif', fontWeight: 900, color: w1 ? 'var(--gold)' : 'var(--text-secondary)' }}>{m.score1}</span>
                            <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', margin: '0 2px' }}>–</span>
                            <span style={{ fontSize: '.95rem', fontFamily: 'Inter, sans-serif', fontWeight: 900, color: w2 ? 'var(--gold)' : 'var(--text-secondary)' }}>{m.score2}</span>
                        </>
                    ) : (
                        <span style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.05em' }}>VS</span>
                    )}
                </div>

                {/* Team 2 */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.4rem', minWidth: 0, flexDirection: 'row-reverse' }}>
                    <span style={{
                        fontSize: '.88rem', fontWeight: w2 ? 900 : 700,
                        color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        textAlign: 'left',
                    }}>{m.team2?.name}</span>
                </div>
            </div>

            {/* Penalties & date */}
            {m.hasPenalties && (
                <div style={{ textAlign: 'center', fontSize: '.62rem', color: 'var(--text-muted)' }}>
                    جزاء: {m.penaltyScore1}–{m.penaltyScore2}
                </div>
            )}
            {dayStr && (
                <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', textAlign: 'center' }}>{dayStr}</div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────
   MATCHES SECTION
────────────────────────────────────────── */
export default function MatchesSection({ todayMatches = [], tomorrowMatches = [] }) {
    const [tab, setTab] = useState(todayMatches.length > 0 ? 'today' : 'tomorrow');
    const current = tab === 'today' ? todayMatches : tomorrowMatches;
    if (!todayMatches.length && !tomorrowMatches.length) return null;

    return (
        <div style={{ background: 'var(--bg-elevated)' }}>


            {/* Tab bar — Sliding Pill Selector */}
            <div style={{ padding: '.75rem 1rem', display: 'flex', justifyContent: 'center', background: 'var(--bg-card)', flexDirection: 'column', gap: '.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center' }}>
                    مباريات
                </span>
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-input)',
                    borderRadius: 50,
                    padding: '4px',
                    border: '1px solid var(--border)',
                    width: 'fit-content',
                    minWidth: 240,
                    position: 'relative', // For absolute indicator
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                }}>
                    {/* Sliding Indicator */}
                    <div style={{
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        right: tab === 'today' ? 4 : 'calc(50% - 0px)', // Move right to left (RTL)
                        width: 'calc(50% - 4px)',
                        background: 'var(--bg-hover)',
                        borderRadius: 50,
                        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 0,
                    }} />

                    {[
                        { id: 'today', label: 'اليوم', count: todayMatches.length },
                        { id: 'tomorrow', label: 'الغد', count: tomorrowMatches.length },
                    ].map(t => {
                        const active = tab === t.id;
                        return (
                            <button key={t.id}
                                onClick={() => setTab(t.id)}
                                style={{
                                    flex: 1, padding: '.55rem 0',
                                    border: 'none',
                                    background: 'transparent',
                                    color: active ? 'var(--gold)' : 'var(--text-muted)',
                                    fontFamily: 'Tajawal, sans-serif', fontSize: '.85rem', fontWeight: 800,
                                    cursor: 'pointer', transition: 'color .3s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                                    zIndex: 1,
                                    position: 'relative',
                                }}
                            >
                                <span>{t.label}</span>
                                {t.count > 0 && (
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        minWidth: 16, height: 16, padding: '0 4px', borderRadius: 50,
                                        background: active ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                                        color: active ? 'var(--gold)' : 'var(--text-muted)',
                                        fontSize: '.62rem', fontWeight: 900,
                                    }}>{t.count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Panels with Slide Animation */}
            <div style={{ overflow: 'hidden', position: 'relative', background: 'var(--bg-base)' }}>
                <div style={{
                    display: 'flex',
                    width: '200%',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: `translateX(${tab === 'today' ? '0%' : '50%'})`,
                    borderBottom: '1px solid var(--border)',
                }}>
                    {/* TODAY PANEL */}
                    <div style={{ width: '50%', flexShrink: 0 }}>
                        {todayMatches.length === 0 ? (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                                لا توجد مباريات اليوم
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.8rem',
                                padding: '1rem 1.25rem',
                                maxWidth: 640,
                                margin: '0 auto'
                            }}>
                                {todayMatches.map(m => <MatchCard key={m._id} m={m} isTomorrow={false} />)}
                            </div>
                        )}
                    </div>

                    {/* TOMORROW PANEL */}
                    <div style={{ width: '50%', flexShrink: 0 }}>
                        {tomorrowMatches.length === 0 ? (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                                لا توجد مباريات غداً
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.8rem',
                                padding: '1rem 1.25rem',
                                maxWidth: 640,
                                margin: '0 auto'
                            }}>
                                {tomorrowMatches.map(m => <MatchCard key={m._id} m={m} isTomorrow={true} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
