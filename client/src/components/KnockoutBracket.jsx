import { useState } from 'react';

const ROUNDS = ['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'];

function MatchNode({ match, side = 'left' }) {
    if (!match) {
        return (
            <div className="bracket-match empty">
                <div className="bracket-team empty-team">—</div>
                <div className="bracket-divider" />
                <div className="bracket-team empty-team">—</div>
            </div>
        );
    }

    const done = match.status === 'Completed';
    const w1 = done && match.score1 > match.score2;
    const w2 = done && match.score2 > match.score1;

    return (
        <div className="bracket-match">
            <div className={`bracket-team ${w1 ? 'winner' : ''}`}>
                <span className="bracket-team-name">{match.team1?.name || '—'}</span>
                <span className={`bracket-score ${w1 ? 'winner-score' : ''}`}>
                    {done ? match.score1 : '—'}
                </span>
            </div>
            <div className="bracket-divider" />
            <div className={`bracket-team ${w2 ? 'winner' : ''}`}>
                <span className="bracket-team-name">{match.team2?.name || '—'}</span>
                <span className={`bracket-score ${w2 ? 'winner-score' : ''}`}>
                    {done ? match.score2 : '—'}
                </span>
            </div>
            {match.knockoutRound && (
                <div className="bracket-round-badge">{match.knockoutRound}</div>
            )}
        </div>
    );
}

export default function KnockoutBracket({ qualifiedTeams, knockoutMatches }) {
    const byRound = (round) => (knockoutMatches || []).filter((m) => m.knockoutRound === round);

    const qf = byRound('ربع النهائي');
    const sf = byRound('نصف النهائي');
    const third = byRound('نهائي الترتيب');
    const final = byRound('النهائي');

    const hasAny = knockoutMatches && knockoutMatches.length > 0;

    return (
        <section className="knockout-section">
            <div className="knockout-header">
                <span className="knockout-badge">🏆 دوري الإقصاء</span>
            </div>

            {/* Qualified Teams Grid */}
            {qualifiedTeams && qualifiedTeams.length > 0 && (
                <div className="qualified-display">
                    <h3 className="qualified-display-title">الفرق المتأهلة</h3>
                    <div className="qualified-display-grid">
                        {qualifiedTeams.map((team, i) => (
                            <div key={team._id} className="qualified-display-card">
                                <span className="qd-number">{i + 1}</span>
                                <span className="qd-name">{team.name}</span>
                                <span className="qd-group">المج·{team.group}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BRACKET TREE */}
            {hasAny && (
                <div className="bracket-tree-wrapper">
                    <div className="bracket-tree" id="bracket-export-target">
                        {/* Quarter Finals */}
                        {qf.length > 0 && (
                            <div className="bracket-column">
                                <div className="bracket-col-title">ربع النهائي</div>
                                <div className="bracket-col-matches">
                                    {qf.map((m) => (
                                        <div key={m._id} className="bracket-match-wrapper">
                                            <MatchNode match={m} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Semi Finals */}
                        {sf.length > 0 && (
                            <div className="bracket-column">
                                <div className="bracket-col-title">نصف النهائي</div>
                                <div className="bracket-col-matches spread">
                                    {sf.map((m) => (
                                        <div key={m._id} className="bracket-match-wrapper">
                                            <MatchNode match={m} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Final + 3rd place */}
                        <div className="bracket-column">
                            {final.length > 0 && (
                                <>
                                    <div className="bracket-col-title gold">النهائي 🏆</div>
                                    <div className="bracket-col-matches center-col">
                                        {final.map((m) => (
                                            <div key={m._id} className="bracket-match-wrapper final-match">
                                                <MatchNode match={m} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {third.length > 0 && (
                                <>
                                    <div className="bracket-col-title bronze">المركز الثالث 🥉</div>
                                    <div className="bracket-col-matches center-col">
                                        {third.map((m) => (
                                            <div key={m._id} className="bracket-match-wrapper">
                                                <MatchNode match={m} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!hasAny && (
                <p className="empty-knockout">لم تُضَف مباريات الإقصاء بعد</p>
            )}
        </section>
    );
}
