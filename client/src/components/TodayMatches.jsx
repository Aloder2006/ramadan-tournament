// TodayMatches.jsx — shows all today's and tomorrow's matches with status

const fmt = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' });
};
const fmtTime = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

function MatchCard({ match }) {
    const done = match.status === 'Completed';
    const isKO = match.phase === 'knockout';
    const w1 = done && (match.hasPenalties ? match.penaltyScore1 > match.penaltyScore2 : match.score1 > match.score2);
    const w2 = done && (match.hasPenalties ? match.penaltyScore2 > match.penaltyScore1 : match.score2 > match.score1);

    return (
        <div className={`match-card ${done ? 'match-card-done' : ''}`}>
            {/* Badge row */}
            <div className="match-card-top">
                {isKO
                    ? <div className="match-group-badge ko-badge">🏆 {match.knockoutRound}</div>
                    : <div className="match-group-badge">المجموعة {match.group}</div>}
                <div className={`match-status-badge ${done ? 'completed' : 'today-live'}`}>
                    {done ? '✅ منتهية' : <><span className="live-dot" />مباراة اليوم</>}
                </div>
            </div>

            {/* Teams + Score */}
            <div className="match-teams">
                <div className={`team-name ${w1 ? 'team-winner' : ''}`}>{match.team1?.name}</div>
                <div className="match-score-center">
                    {done ? (
                        <div className="scoreboard">
                            <span className={`score-num ${w1 ? 'score-winner' : ''}`}>{match.score1}</span>
                            <span className="score-dash">-</span>
                            <span className={`score-num ${w2 ? 'score-winner' : ''}`}>{match.score2}</span>
                        </div>
                    ) : (
                        <div className="vs-badge">VS</div>
                    )}
                    {done && match.hasPenalties && (
                        <div className="penalty-tag">ج {match.penaltyScore1} - {match.penaltyScore2}</div>
                    )}
                </div>
                <div className={`team-name team-right ${w2 ? 'team-winner' : ''}`}>{match.team2?.name}</div>
            </div>

            {/* Time */}
            {match.matchDate && (
                <div className="match-date-display">
                    📅 {fmt(match.matchDate)}
                    {fmtTime(match.matchDate) && <span className="match-time"> · ⏰ {fmtTime(match.matchDate)}</span>}
                </div>
            )}
        </div>
    );
}

export default function TodayMatches({ matches, title }) {
    if (!matches || matches.length === 0) return null;

    return (
        <section className="today-section">
            <div className="today-header">
                <span className="today-badge">🌙 رمضان كريم</span>
                <h2 className="today-title">{title || 'مباريات اليوم'}</h2>
            </div>
            <div className="today-cards">
                {matches.map((match) => (
                    <MatchCard key={match._id} match={match} />
                ))}
            </div>
        </section>
    );
}
