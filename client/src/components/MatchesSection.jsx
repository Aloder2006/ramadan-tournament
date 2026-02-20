import { useState } from 'react';

/* ──────────────────────────────────────────
   MATCH CARD — compact, 365Score style
────────────────────────────────────────── */
function MatchCard({ m, isTomorrow }) {
    const done = m.status === 'Completed';
    const noDate = !m.matchDate;

    // Determine winner
    let w1 = false, w2 = false;
    if (done) {
        if (m.hasPenalties) {
            w1 = m.penaltyScore1 > m.penaltyScore2;
            w2 = m.penaltyScore2 > m.penaltyScore1;
        } else {
            w1 = m.score1 > m.score2;
            w2 = m.score2 > m.score1;
        }
    }

    const timeStr = m.matchDate
        ? new Date(m.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : null;
    const dayStr = m.matchDate
        ? new Date(m.matchDate).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' })
        : null;

    const badge = m.phase === 'knockout'
        ? (m.knockoutRound || 'إقصاء')
        : (m.group ? `م ${m.group}` : '');

    return (
        <div className={`ms-card ${done ? 'ms-done' : ''} ${isTomorrow ? 'ms-tomorrow' : ''}`}>
            {/* Top bar: group/round badge + time */}
            <div className="ms-card-top">
                {badge && <span className="ms-badge">{badge}</span>}
                {timeStr && <span className="ms-time">{timeStr}</span>}
                {noDate && !done && <span className="ms-time muted">—</span>}
            </div>

            {/* Teams & score */}
            <div className="ms-teams">
                <div className={`ms-team ${w1 ? 'ms-winner' : ''}`}>{m.team1?.name}</div>
                <div className="ms-center">
                    {done ? (
                        <div className="ms-score">
                            <span className={w1 ? 'ms-score-w' : ''}>{m.score1}</span>
                            <span className="ms-score-sep">–</span>
                            <span className={w2 ? 'ms-score-w' : ''}>{m.score2}</span>
                        </div>
                    ) : (
                        <div className="ms-vs">VS</div>
                    )}
                    {m.hasPenalties && (
                        <div className="ms-pen">({m.penaltyScore1}–{m.penaltyScore2} ضرجزاء)</div>
                    )}
                </div>
                <div className={`ms-team ms-team-r ${w2 ? 'ms-winner' : ''}`}>{m.team2?.name}</div>
            </div>

            {/* Date row */}
            {dayStr && <div className="ms-date">{dayStr}</div>}
        </div>
    );
}

/* ──────────────────────────────────────────
   MATCHES SECTION — Today / Tomorrow tabs
────────────────────────────────────────── */
export default function MatchesSection({ todayMatches = [], tomorrowMatches = [] }) {
    const [tab, setTab] = useState('today');

    const todayList = todayMatches;
    const tomorrowList = tomorrowMatches;
    const current = tab === 'today' ? todayList : tomorrowList;

    if (!todayList.length && !tomorrowList.length) return null;

    return (
        <div className="ms-section">
            {/* Tab bar */}
            <div className="ms-tabs">
                <button
                    className={`ms-tab ${tab === 'today' ? 'ms-tab-active' : ''}`}
                    onClick={() => setTab('today')}
                >
                    اليوم
                    {todayList.length > 0 && <span className="ms-count">{todayList.length}</span>}
                </button>
                <button
                    className={`ms-tab ${tab === 'tomorrow' ? 'ms-tab-active' : ''}`}
                    onClick={() => setTab('tomorrow')}
                >
                    الغد
                    {tomorrowList.length > 0 && <span className="ms-count ms-count-tmrw">{tomorrowList.length}</span>}
                </button>
            </div>

            {/* Cards grid */}
            {current.length === 0 ? (
                <div className="ms-empty">لا توجد مباريات</div>
            ) : (
                <div className="ms-grid">
                    {current.map(m => (
                        <MatchCard key={m._id} m={m} isTomorrow={tab === 'tomorrow'} />
                    ))}
                </div>
            )}
        </div>
    );
}
