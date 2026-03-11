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

    const RedCard = ({ count }) => (
        <span className="mh-red-card">{count}</span>
    );

    return (
        <section className="mh-section">
            <div className="mh-heading">سجل المباريات</div>

            <div className="mh-days">
                {Object.entries(grouped).map(([date, dayMatches]) => (
                    <div key={date}>
                        <div className="mh-date-label">{date}</div>

                        <div className="mh-day-group">
                            {dayMatches.map(m => {
                                const w1 = m.hasPenalties ? m.penaltyScore1 > m.penaltyScore2 : m.score1 > m.score2;
                                const w2 = m.hasPenalties ? m.penaltyScore2 > m.penaltyScore1 : m.score2 > m.score1;
                                const badge = m.phase === 'knockout' ? (m.knockoutRound || 'إقصاء') : (m.group ? `م·${m.group}` : '');

                                return (
                                    <div key={m._id} className="mh-card">
                                        {/* Team 1 */}
                                        <div className="mh-team mh-team-start">
                                            <span className={`mh-team-name ${w1 ? 'mh-winner' : ''}`}>{m.team1?.name}</span>
                                            {m.redCards1 > 0 && <RedCard count={m.redCards1} />}
                                        </div>

                                        {/* Score Central */}
                                        <div className="mh-center">
                                            {badge && <span className="mh-badge">{badge}</span>}
                                            <div className="mh-score-box">
                                                <span className={`mh-score ${w1 ? 'mh-score-gold' : ''}`}>{m.score1}</span>
                                                <span className="mh-score-sep">:</span>
                                                <span className={`mh-score ${w2 ? 'mh-score-gold' : ''}`}>{m.score2}</span>
                                            </div>
                                            {m.hasPenalties && (
                                                <span className="mh-pen-text">({m.penaltyScore1}–{m.penaltyScore2})</span>
                                            )}
                                        </div>

                                        {/* Team 2 */}
                                        <div className="mh-team mh-team-end">
                                            {m.redCards2 > 0 && <RedCard count={m.redCards2} />}
                                            <span className={`mh-team-name ${w2 ? 'mh-winner' : ''}`}>{m.team2?.name}</span>
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