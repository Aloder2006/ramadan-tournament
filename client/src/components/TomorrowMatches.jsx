// TomorrowMatches.jsx — shows upcoming matches for tomorrow

const fmt = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' });
};
const fmtTime = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

function TomorrowMatchCard({ match }) {
    const isKO = match.phase === 'knockout';
    return (
        <div className="match-card match-card-tomorrow">
            <div className="match-card-top">
                {isKO
                    ? <div className="match-group-badge ko-badge">🏆 {match.knockoutRound}</div>
                    : <div className="match-group-badge">المجموعة {match.group}</div>}
                <div className="match-status-badge tmrw-badge">⏳ غداً</div>
            </div>
            <div className="match-teams">
                <div className="team-name">{match.team1?.name}</div>
                <div className="match-score-center">
                    <div className="vs-badge">VS</div>
                </div>
                <div className="team-name team-right">{match.team2?.name}</div>
            </div>
            {match.matchDate && (
                <div className="match-date-display">
                    📅 {fmt(match.matchDate)}
                    {fmtTime(match.matchDate) && <span className="match-time"> · ⏰ {fmtTime(match.matchDate)}</span>}
                </div>
            )}
        </div>
    );
}

export default function TomorrowMatches({ matches }) {
    if (!matches || matches.length === 0) return null;

    return (
        <section className="today-section tomorrow-section">
            <div className="today-header">
                <span className="today-badge tmrw-badge-header">🌅 قادم</span>
                <h2 className="today-title">مباريات الغد</h2>
            </div>
            <div className="today-cards">
                {matches.map((match) => (
                    <TomorrowMatchCard key={match._id} match={match} />
                ))}
            </div>
        </section>
    );
}
