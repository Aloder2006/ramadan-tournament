export default function MatchHistory({ matches }) {
    if (!matches || matches.length === 0) return null;

    // Sort by matchDate ascending, fallback to updatedAt
    const sorted = [...matches].sort((a, b) => {
        const da = new Date(a.matchDate || a.updatedAt || 0);
        const db = new Date(b.matchDate || b.updatedAt || 0);
        return da - db;
    });

    // Group by formatted date label
    const grouped = sorted.reduce((acc, m) => {
        const key = m.matchDate
            ? new Date(m.matchDate).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' })
            : (m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' }) : 'بدون تاريخ');
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
    }, {});

    return (
        <section style={{ padding: '1rem 1.25rem 2rem' }}>
            <div style={{
                fontSize: '.7rem', fontWeight: 800, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '.08em',
                marginBottom: '.85rem', paddingBottom: '.4rem',
                borderBottom: '1px solid var(--border)',
            }}>
                سجل المباريات
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {Object.entries(grouped).map(([date, dayMatches]) => (
                    <div key={date}>
                        <div style={{
                            fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)',
                            marginBottom: '.4rem', display: 'flex', alignItems: 'center', gap: '.5rem',
                        }}>
                            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            {date}
                            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                            {dayMatches.map(m => {
                                const w1 = m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2;
                                const w2 = m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1;
                                const badge = m.phase === 'knockout' ? (m.knockoutRound || 'إقصاء') : (m.group ? `م·${m.group}` : '');

                                return (
                                    <div key={m._id} style={{
                                        background: 'var(--bg-card)',
                                        padding: '.5rem .75rem',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto 1fr',
                                        alignItems: 'center',
                                        gap: '.5rem',
                                    }}>
                                        {/* Team 1 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                                            <div style={{
                                                width: 26, height: 26, borderRadius: '3px', flexShrink: 0,
                                                background: w1 ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                                                border: `1px solid ${w1 ? 'var(--gold-border)' : 'var(--border)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '.65rem', fontWeight: 900,
                                                color: w1 ? 'var(--gold)' : 'var(--text-muted)',
                                                fontFamily: 'Inter, sans-serif',
                                            }}>
                                                {m.team1?.name?.[0] || '?'}
                                            </div>
                                            <span style={{
                                                fontSize: '.84rem', fontWeight: w1 ? 900 : 700,
                                                color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>{m.team1?.name}
                                                {m.redCards1 > 0 && (
                                                    <span style={{ marginRight: '.3rem', fontSize: '.62rem', color: 'var(--danger)', background: 'rgba(224,75,75,.15)', padding: '0 .25rem', borderRadius: '2px' }}>
                                                        خ{m.redCards1}
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Score */}
                                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            {badge && (
                                                <span style={{ fontSize: '.55rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                                                    {badge}
                                                </span>
                                            )}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '3px',
                                                background: 'var(--bg-elevated)',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '3px',
                                                padding: '.12rem .5rem',
                                            }}>
                                                <span style={{ fontSize: '.92rem', fontFamily: 'Inter, sans-serif', fontWeight: 900, color: w1 ? 'var(--gold)' : 'var(--text-secondary)' }}>{m.score1}</span>
                                                <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', margin: '0 2px' }}>–</span>
                                                <span style={{ fontSize: '.92rem', fontFamily: 'Inter, sans-serif', fontWeight: 900, color: w2 ? 'var(--gold)' : 'var(--text-secondary)' }}>{m.score2}</span>
                                            </div>
                                            {m.hasPenalties && (
                                                <span style={{ fontSize: '.58rem', color: 'var(--text-muted)' }}>جزاء {m.penaltyScore1}–{m.penaltyScore2}</span>
                                            )}
                                        </div>

                                        {/* Team 2 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', flexDirection: 'row-reverse' }}>
                                            <div style={{
                                                width: 26, height: 26, borderRadius: '3px', flexShrink: 0,
                                                background: w2 ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                                                border: `1px solid ${w2 ? 'var(--gold-border)' : 'var(--border)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '.65rem', fontWeight: 900,
                                                color: w2 ? 'var(--gold)' : 'var(--text-muted)',
                                                fontFamily: 'Inter, sans-serif',
                                            }}>
                                                {m.team2?.name?.[0] || '?'}
                                            </div>
                                            <span style={{
                                                fontSize: '.84rem', fontWeight: w2 ? 900 : 700,
                                                color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                textAlign: 'left',
                                            }}>
                                                {m.redCards2 > 0 && (
                                                    <span style={{ marginLeft: '.3rem', fontSize: '.62rem', color: 'var(--danger)', background: 'rgba(224,75,75,.15)', padding: '0 .25rem', borderRadius: '2px' }}>
                                                        خ{m.redCards2}
                                                    </span>
                                                )}
                                                {m.team2?.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
