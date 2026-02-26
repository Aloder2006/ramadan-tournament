export default function MatchHistory({ matches }) {
    if (!matches || matches.length === 0) return null;

    const sorted = [...matches].sort((a, b) => {
        const da = new Date(a.matchDate || a.updatedAt || 0);
        const db = new Date(b.matchDate || b.updatedAt || 0);
        return db - da;
    });

    const grouped = sorted.reduce((acc, m) => {
        const key = m.matchDate
            ? new Date(m.matchDate).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' })
            : (m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('ar-EG', { weekday: 'long', day: '2-digit', month: 'long' }) : 'بدون تاريخ');
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
    }, {});

    // ستايل الكارت الأحمر المحسن
    const RedCard = ({ count }) => (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ff4d4f', // لون أحمر صريح
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            width: '14px',
            height: '18px',
            borderRadius: '2px',
            margin: '0 4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.1)'
        }}>
            {count}
        </span>
    );

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
                            {date}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            {dayMatches.map(m => {
                                const w1 = m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2;
                                const w2 = m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1;
                                const badge = m.phase === 'knockout' ? (m.knockoutRound || 'إقصاء') : (m.group ? `م·${m.group}` : '');

                                return (
                                    <div key={m._id} style={{
                                        background: 'var(--bg-card)',
                                        padding: '.7rem .75rem',
                                        display: 'grid',
                                        // تقسيم الجدول لـ 3 أعمدة: (اسم 1) | (النتيجة) | (اسم 2)
                                        // العمود الأول والأخير 1fr لضمان بقاء النتيجة في المنتصف تماماً
                                        gridTemplateColumns: '1fr 85px 1fr', 
                                        alignItems: 'center',
                                        gap: '.25rem',
                                    }}>
                                        {/* Team 1 */}
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'flex-start',
                                            gap: '.4rem',
                                            minWidth: 0 // ضروري لعمل الـ ellipsis داخل الجريد
                                        }}>
                                            <span style={{
                                                fontSize: '.82rem', 
                                                fontWeight: w1 ? 900 : 600,
                                                color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {m.team1?.name}
                                            </span>
                                            {m.redCards1 > 0 && <RedCard count={m.redCards1} />}
                                        </div>

                                        {/* Score Central Area */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            {badge && (
                                                <span style={{ fontSize: '.52rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', opacity: 0.8 }}>
                                                    {badge}
                                                </span>
                                            )}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'var(--bg-elevated)',
                                                border: '1px solid var(--border-light)',
                                                borderRadius: '4px',
                                                width: '100%',
                                                padding: '.15rem 0',
                                            }}>
                                                <span style={{ fontSize: '.95rem', fontFamily: 'Inter, sans-serif', fontWeight: 900, color: w1 ? 'var(--gold)' : 'var(--text-secondary)' }}>{m.score1}</span>
                                                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', margin: '0 6px', fontWeight: 400 }}>:</span>
                                                <span style={{ fontSize: '.95rem', fontFamily: 'Inter, sans-serif', fontWeight: 900, color: w2 ? 'var(--gold)' : 'var(--text-secondary)' }}>{m.score2}</span>
                                            </div>
                                            {m.hasPenalties && (
                                                <span style={{ fontSize: '.55rem', color: 'var(--text-muted)', fontWeight: 600 }}>({m.penaltyScore1}–{m.penaltyScore2})</span>
                                            )}
                                        </div>

                                        {/* Team 2 */}
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'flex-end',
                                            gap: '.4rem',
                                            minWidth: 0,
                                            textAlign: 'left'
                                        }}>
                                            {m.redCards2 > 0 && <RedCard count={m.redCards2} />}
                                            <span style={{
                                                fontSize: '.82rem', 
                                                fontWeight: w2 ? 900 : 600,
                                                color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                direction: 'rtl'
                                            }}>
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