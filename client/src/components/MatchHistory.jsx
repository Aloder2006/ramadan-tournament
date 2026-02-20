export default function MatchHistory({ matches }) {
    if (!matches || matches.length === 0) return null;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' });
    };

    return (
        <section className="history-section">
            <h2 className="section-title">
                <span className="section-icon">📋</span>
                سجل المباريات
            </h2>
            <div className="history-list">
                {matches.map((match) => (
                    <div key={match._id} className="history-row">
                        <span className="history-group">المج {match.group}</span>
                        <div className="history-match">
                            <span className="history-team">
                                {match.team1?.name}
                                {match.redCards1 > 0 && (
                                    <span className="red-card-badge" title="كروت حمراء">
                                        🟥{match.redCards1}
                                    </span>
                                )}
                            </span>
                            <span className="history-score">
                                {match.score1} — {match.score2}
                            </span>
                            <span className="history-team right">
                                {match.redCards2 > 0 && (
                                    <span className="red-card-badge" title="كروت حمراء">
                                        🟥{match.redCards2}
                                    </span>
                                )}
                                {match.team2?.name}
                            </span>
                        </div>
                        <span className="history-date">{formatDate(match.updatedAt)}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
