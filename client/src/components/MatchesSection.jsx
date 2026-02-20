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
                    <div style={{
                        width: 28, height: 28, borderRadius: '3px',
                        background: w1 ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                        border: `1px solid ${w1 ? 'var(--gold-border)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.72rem', fontWeight: 900, color: w1 ? 'var(--gold)' : 'var(--text-muted)',
                        flexShrink: 0, fontFamily: 'Inter, sans-serif',
                    }}>
                        {m.team1?.name?.[0] || '?'}
                    </div>
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
                    border: `1px solid ${done ? 'var(--border-light)' : 'var(--border)'}`,
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
                    <div style={{
                        width: 28, height: 28, borderRadius: '3px',
                        background: w2 ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                        border: `1px solid ${w2 ? 'var(--gold-border)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.72rem', fontWeight: 900, color: w2 ? 'var(--gold)' : 'var(--text-muted)',
                        flexShrink: 0, fontFamily: 'Inter, sans-serif',
                    }}>
                        {m.team2?.name?.[0] || '?'}
                    </div>
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
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {[
                    { id: 'today', label: 'اليوم', count: todayMatches.length },
                    { id: 'tomorrow', label: 'الغد', count: tomorrowMatches.length },
                ].map(t => (
                    <button key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            flex: 1, padding: '.6rem 1rem', border: 'none',
                            borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`,
                            background: tab === t.id ? 'var(--bg-card)' : 'transparent',
                            color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
                            fontFamily: 'Tajawal, sans-serif', fontSize: '.85rem', fontWeight: 700,
                            cursor: 'pointer', transition: 'all .12s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                        }}
                    >
                        {t.label}
                        {t.count > 0 && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                minWidth: 18, height: 18, padding: '0 5px', borderRadius: '2px',
                                background: t.id === 'today' ? 'var(--gold-dim)' : 'var(--indigo-dim)',
                                color: t.id === 'today' ? 'var(--gold)' : 'var(--indigo)',
                                fontSize: '.62rem', fontWeight: 800,
                            }}>{t.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Cards */}
            {current.length === 0 ? (
                <div style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.82rem' }}>
                    لا توجد مباريات
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {current.map(m => <MatchCard key={m._id} m={m} isTomorrow={tab === 'tomorrow'} />)}
                </div>
            )}
        </div>
    );
}
