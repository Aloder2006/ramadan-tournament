/**
 * BracketTree — SofaScore-style bracket with round tabs
 * Tabs: QF / SF / Final — clicking dims other rounds and scrolls/focuses the selected one
 * RTL layout: QF (right) → SF → Final (center-left)
 */
import { useState, useRef } from 'react';
import config from '../tournament.config';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' }) : null;
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;

function getWinner(match) {
    if (!match || match.status !== 'Completed') return null;
    if (match.hasPenalties) return match.penaltyScore1 > match.penaltyScore2 ? match.team1 : match.team2;
    if (match.score1 > match.score2) return match.team1;
    if (match.score2 > match.score1) return match.team2;
    return null;
}
function getLoser(match) {
    if (!match || match.status !== 'Completed') return null;
    if (match.hasPenalties) return match.penaltyScore1 > match.penaltyScore2 ? match.team2 : match.team1;
    if (match.score1 > match.score2) return match.team2;
    if (match.score2 > match.score1) return match.team1;
    return null;
}

function buildBracket(bracketSlots, knockoutMatches) {
    const slots = [...(bracketSlots || [])].sort((a, b) => a.position - b.position);
    const slotTeam = (i) => slots[i]?.team || null;
    const qfAll = knockoutMatches.filter(m => m.knockoutRound === 'ربع النهائي');
    const sfAll = knockoutMatches.filter(m => m.knockoutRound === 'نصف النهائي');

    const makeQF = (pos) => {
        const m = qfAll.find(x => x.bracketPosition === pos) || qfAll[pos - 1] || null;
        return { match: m, team1: m?.team1 || slotTeam((pos - 1) * 2), team2: m?.team2 || slotTeam((pos - 1) * 2 + 1), winner: getWinner(m), loser: getLoser(m) };
    };
    const qf = [makeQF(1), makeQF(2), makeQF(3), makeQF(4)];

    const makeSF = (pos) => {
        const m = sfAll.find(x => x.bracketPosition === pos) || sfAll[pos - 1] || null;
        const autoT1 = pos === 1 ? qf[0].winner : qf[2].winner;
        const autoT2 = pos === 1 ? qf[1].winner : qf[3].winner;
        return { match: m, team1: m?.team1 || autoT1, team2: m?.team2 || autoT2, winner: getWinner(m), loser: getLoser(m) };
    };
    const sf = [makeSF(1), makeSF(2)];
    const finalM = knockoutMatches.find(m => m.knockoutRound === 'النهائي') || null;
    const thirdM = knockoutMatches.find(m => m.knockoutRound === 'نهائي الترتيب') || null;

    return {
        qf, sf,
        final: { match: finalM, team1: finalM?.team1 || sf[0].winner, team2: finalM?.team2 || sf[1].winner, winner: getWinner(finalM) },
        third: { match: thirdM, team1: thirdM?.team1 || sf[0].loser, team2: thirdM?.team2 || sf[1].loser, winner: getWinner(thirdM) },
    };
}

function TeamRow({ team, score, isWinner, isPenaltyWinner, crown = false, placeholder = 'قيد الانتظار' }) {
    const name = typeof team === 'object' ? team?.name : null;
    const initial = name ? name.trim()[0] : '?';
    const showScore = score !== null && score !== undefined;
    return (
        <div className={`bt-team-row ${isWinner ? 'bt-winner' : ''} ${!name ? 'bt-tbd' : ''}`}>
            <div className={`bt-avatar ${isWinner ? 'bt-avatar-win' : ''}`}>{initial}</div>
            <span className="bt-team-name">{name || placeholder}</span>
            {isPenaltyWinner && <span className="bt-pen-icon" title="فائز بالجزاء">ج</span>}
            <div className={`bt-score-box ${isWinner ? 'bt-score-win' : ''} ${!showScore ? 'bt-score-empty' : ''}`}>
                {showScore ? score : '–'}
                {crown && isWinner && <span className="bt-crown">*</span>}
            </div>
        </div>
    );
}

function MatchCard({ team1, team2, match, isFinal = false, isThird = false }) {
    const done = match?.status === 'Completed';
    const penWin1 = done && match?.hasPenalties && match.penaltyScore1 > match.penaltyScore2;
    const penWin2 = done && match?.hasPenalties && match.penaltyScore2 > match.penaltyScore1;
    const w1 = done && (match.score1 > match.score2 || penWin1);
    const w2 = done && (match.score2 > match.score1 || penWin2);
    const hasBoth = team1 && team2;
    return (
        <div className={`bt-card ${isFinal ? 'bt-final' : ''} ${isThird ? 'bt-third' : ''} ${done ? 'bt-done' : ''} ${isFinal && done ? 'bt-champion' : ''} ${!hasBoth ? 'bt-ghost' : ''}`}>
            {match?.matchDate && (
                <div className="bt-date">
                    {fmtDate(match.matchDate)}{fmtTime(match.matchDate) ? ` · ${fmtTime(match.matchDate)}` : ''}
                </div>
            )}
            <TeamRow team={team1} score={match?.score1} isWinner={w1} isPenaltyWinner={penWin1} crown={isFinal} placeholder="قيد الانتظار" />
            {done && match.hasPenalties && <div className="bt-penalties">{match.penaltyScore1} - {match.penaltyScore2} <small>جزاء</small></div>}
            <div className="bt-divider" />
            <TeamRow team={team2} score={match?.score2} isWinner={w2} isPenaltyWinner={penWin2} crown={isFinal} placeholder="قيد الانتظار" />
            {!done && hasBoth && <div className="bt-pending">قادمة</div>}
        </div>
    );
}

const ROUND_TABS = [
    { id: 'qf', label: 'ربع النهائي' },
    { id: 'sf', label: 'نصف النهائي' },
    { id: 'final', label: 'النهائي' },
];

export default function BracketTree({ knockoutMatches = [], bracketSlots = [] }) {
    const [activeRound, setActiveRound] = useState('qf');
    const qfRef = useRef(null);
    const sfRef = useRef(null);
    const finRef = useRef(null);

    const hasAnyData = bracketSlots.some(s => s.team) || knockoutMatches.length > 0;

    if (!hasAnyData) {
        return (
            <div className="bt-empty">
                <div className="bt-empty-icon">—</div>
                <p className="bt-empty-text">لم يتم إعداد قرعة الإقصاء بعد</p>
                <p className="bt-empty-sub">لوحة الإدارة ← الإقصاء ← توليد ربع النهائي</p>
            </div>
        );
    }

    const { qf, sf, final, third } = buildBracket(bracketSlots, knockoutMatches);

    const handleTabClick = (id) => {
        setActiveRound(id);
        const refs = { qf: qfRef, sf: sfRef, final: finRef };
        refs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    const roundClass = (id) => {
        if (activeRound === id) return 'bt-active';
        return 'bt-dimmed';
    };

    return (
        <div>
            {/* Round tabs */}
            <div className="bt-round-tabs">
                {ROUND_TABS.map(t => (
                    <button
                        key={t.id}
                        className={`bt-round-tab ${activeRound === t.id ? 'bt-tab-active' : ''}`}
                        onClick={() => handleTabClick(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Bracket tree */}
            <div className="bt-scroll">
                {/* Top half: QF1, QF2 → SF1 → Final */}
                <div className="bt-bracket">
                    <div className={`bt-round ${roundClass('qf')}`} ref={qfRef}>
                        <div className="bt-round-label">ربع النهائي</div>
                        <div className="bt-col">
                            <div className="bt-match-wrap bt-top"><MatchCard {...qf[0]} /></div>
                            <div className="bt-spacer" />
                            <div className="bt-match-wrap"><MatchCard {...qf[1]} /></div>
                        </div>
                    </div>
                    <div className="bt-connector-col">
                        <div className="bt-wire bt-wire-top" />
                        <div className="bt-wire-gap" />
                        <div className="bt-wire bt-wire-bot" />
                    </div>
                    <div className={`bt-round ${roundClass('sf')}`} ref={sfRef}>
                        <div className="bt-round-label">نصف النهائي</div>
                        <div className="bt-col bt-sf-col">
                            <div className="bt-match-wrap bt-sf-top"><MatchCard {...sf[0]} /></div>
                            <div className="bt-sf-spacer" />
                        </div>
                    </div>
                    <div className="bt-connector-col bt-connector-final">
                        <div className="bt-wire bt-wire-top" />
                        <div className="bt-wire-gap bt-gap-lg" />
                        <div className="bt-wire bt-wire-bot" />
                    </div>
                    <div className={`bt-round bt-final-round ${roundClass('final')}`} ref={finRef}>
                        <div className="bt-final-col">
                            <div>
                                <div className="bt-round-label bt-round-gold">النهائي</div>
                                <div className="bt-match-wrap"><MatchCard {...final} isFinal /></div>
                            </div>
                            <div className="bt-round-sep" />
                            <div>
                                <div className="bt-round-label bt-round-bronze">المركز الثالث</div>
                                <div className="bt-match-wrap"><MatchCard {...third} isThird /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom half: QF3, QF4 → SF2 */}
                <div className="bt-bracket bt-bracket-bottom">
                    <div className={`bt-round ${roundClass('qf')}`}>
                        <div className="bt-round-label bt-invisible">.</div>
                        <div className="bt-col">
                            <div className="bt-match-wrap"><MatchCard {...qf[2]} /></div>
                            <div className="bt-spacer" />
                            <div className="bt-match-wrap"><MatchCard {...qf[3]} /></div>
                        </div>
                    </div>
                    <div className="bt-connector-col">
                        <div className="bt-wire bt-wire-top" />
                        <div className="bt-wire-gap" />
                        <div className="bt-wire bt-wire-bot" />
                    </div>
                    <div className={`bt-round ${roundClass('sf')}`}>
                        <div className="bt-round-label bt-invisible">.</div>
                        <div className="bt-col bt-sf-col">
                            <div className="bt-match-wrap bt-sf-bot"><MatchCard {...sf[1]} /></div>
                        </div>
                    </div>
                    <div className="bt-connector-col bt-connector-final bt-invisible">
                        <div style={{ width: '40px' }} />
                    </div>
                    <div className={`bt-round bt-final-round bt-invisible-round ${roundClass('final')}`} />
                </div>
            </div>
        </div>
    );
}
