const fmt = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('ar-EG', {
        weekday: 'short', day: '2-digit', month: 'short',
    });
};

const fmtTime = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

export default function TodayMatches({ matches }) {
    if (!matches || matches.length === 0) return null;

    return (
        <section className="today-section">
            <div className="today-header">
                <span className="today-badge">🌙 رمضان كريم</span>
                <h2 className="today-title">مباريات اليوم</h2>
            </div>
            <div className="today-cards">
                {matches.map((match) => (
                    <div key={match._id} className="match-card">
                        <div className="match-group-badge">المجموعة {match.group}</div>
                        <div className="match-teams">
                            <div className="team-name">{match.team1?.name}</div>
                            <div className="vs-badge">VS</div>
                            <div className="team-name">{match.team2?.name}</div>
                        </div>
                        {match.matchDate && (
                            <div className="match-date-display">
                                📅 {fmt(match.matchDate)}
                                {fmtTime(match.matchDate) && <span> · ⏰ {fmtTime(match.matchDate)}</span>}
                            </div>
                        )}
                        <div className="match-status-badge pending">قيد الانتظار</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
