import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Trophy, Crown, Medal, Clock, Zap, Star } from 'lucide-react';

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */
const getWinner = (m) => {
    if (!m || m.status !== 'Completed') return null;
    if (m.hasPenalties) return m.penaltyScore1 > m.penaltyScore2 ? m.team1 : m.team2;
    if (m.score1 > m.score2) return m.team1;
    if (m.score2 > m.score1) return m.team2;
    return null;
};
const teamName = (t) => t?.name || '—';
const teamId = (t) => t?._id || t;

const ROUNDS = [
    { key: 'ربع النهائي', label: 'ربع النهائي' },
    { key: 'نصف النهائي', label: 'نصف النهائي' },
    { key: 'النهائي', label: 'النهائي' },
];

/* ═══════════════════════════════════════════════
   Match Card — Glassmorphism
   ═══════════════════════════════════════════════ */
function MatchCard({ match, slotA, slotB, isChampionMatch }) {
    const empty = !match && !slotA?.team && !slotB?.team;

    if (empty) {
        return (
            <div className="bt2-card bt2-card-empty">
                <div className="bt2-slot"><span className="bt2-await"><Clock size={12} /> بانتظار</span></div>
                <div className="bt2-sep" />
                <div className="bt2-slot"><span className="bt2-await"><Clock size={12} /> بانتظار</span></div>
            </div>
        );
    }

    const done = match?.status === 'Completed';
    const winner = getWinner(match);
    const wId = winner ? teamId(winner) : null;
    const isW1 = done && wId && (wId === teamId(match?.team1));
    const isW2 = done && wId && (wId === teamId(match?.team2));

    const t1 = match ? teamName(match.team1) : (slotA?.team ? teamName(slotA.team) : '—');
    const t2 = match ? teamName(match.team2) : (slotB?.team ? teamName(slotB.team) : '—');

    const dateStr = match?.matchDate
        ? new Date(match.matchDate).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' })
        : null;
    const timeStr = match?.matchDate
        ? new Date(match.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : null;

    const isChampion = isChampionMatch && done && winner;

    return (
        <div className={`bt2-card ${done ? 'bt2-card-done' : ''} ${isChampion ? 'bt2-card-champion' : ''}`}>
            <div className={`bt2-slot ${isW1 ? 'bt2-slot-w' : ''} ${done && !isW1 ? 'bt2-slot-l' : ''}`}>
                <div className="bt2-team">
                    <span className="bt2-tname">{t1}</span>
                    {isW1 && <Crown size={13} className="bt2-crown-mini" />}
                </div>
                <span className={`bt2-sc ${isW1 ? 'bt2-sc-w' : ''}`}>{done ? match.score1 : ''}</span>
            </div>

            <div className="bt2-sep">
                {match?.hasPenalties && (
                    <span className="bt2-pen"><Zap size={11} /> ركلات ترجيح {match.penaltyScore1} – {match.penaltyScore2}</span>
                )}
                {!done && dateStr && (
                    <span className="bt2-date-chip">{dateStr} • {timeStr}</span>
                )}
            </div>

            <div className={`bt2-slot ${isW2 ? 'bt2-slot-w' : ''} ${done && !isW2 ? 'bt2-slot-l' : ''}`}>
                <div className="bt2-team">
                    <span className="bt2-tname">{t2}</span>
                    {isW2 && <Crown size={13} className="bt2-crown-mini" />}
                </div>
                <span className={`bt2-sc ${isW2 ? 'bt2-sc-w' : ''}`}>{done ? match.score2 : ''}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   Champion Celebration
   ═══════════════════════════════════════════════ */
function ChampionBanner({ match }) {
    const winner = getWinner(match);
    if (!winner) return null;
    const name = teamName(winner);
    return (
        <div className="bt2-champ">
            <div className="bt2-champ-glow" />
            <div className="bt2-champ-glow bt2-champ-glow2" />
            <div className="bt2-champ-inner">
                <Trophy size={32} className="bt2-champ-trophy" />
                <div className="bt2-champ-label">بطل البطولة</div>
                <div className="bt2-champ-name">{name}</div>
                <div className="bt2-champ-stars">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   MAIN: BracketTree
   ═══════════════════════════════════════════════ */
export default function BracketTree({ knockoutMatches = [], bracketSlots = [] }) {
    const [activeTab, setActiveTab] = useState(0);
    const scrollRef = useRef(null);
    const roundRefs = useRef([]);
    const tabClickRef = useRef(false);
    const rafScrollRef = useRef(null);

    const matchesByRound = useMemo(() => {
        const map = {};
        for (const r of ROUNDS) {
            map[r.key] = knockoutMatches
                .filter(m => m.knockoutRound === r.key)
                .sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0));
        }
        return map;
    }, [knockoutMatches]);

    const qf = matchesByRound['ربع النهائي'];
    const sf = matchesByRound['نصف النهائي'];
    const final = matchesByRound['النهائي'];
    const thirdPlace = knockoutMatches.find(m => m.knockoutRound === 'نهائي الترتيب');
    const finalMatch = final[0] || null;
    const hasChampion = finalMatch?.status === 'Completed' && getWinner(finalMatch);
    const qfSlotPairs = [[1, 2], [3, 4], [5, 6], [7, 8]];

    // Derive QF winners → auto-populate SF placeholders
    const qfWinners = useMemo(() => {
        return qf.map(m => getWinner(m));
    }, [qf]);

    // SF: if no SF matches exist yet, show QF winners as placeholders (always 2 cards)
    const sfDisplayMatches = useMemo(() => {
        if (sf.length > 0) return sf;
        // Always build 2 placeholder pairs from QF winners: [winner0 vs winner1], [winner2 vs winner3]
        const placeholders = [];
        for (let i = 0; i < 4; i += 2) {
            const w1 = qfWinners[i] || null;
            const w2 = qfWinners[i + 1] || null;
            placeholders.push({ _placeholder: true, team1: w1, team2: w2 });
        }
        return placeholders;
    }, [sf, qfWinners]);

    // Auto-detect active round on mount
    useEffect(() => {
        if (final.length > 0 && final.some(m => m.status !== 'Completed' || getWinner(m))) setActiveTab(2);
        else if (sf.length > 0 && sf.some(m => m.status !== 'Completed')) setActiveTab(1);
        else setActiveTab(0);
    }, [qf, sf, final]);

    const scrollToRound = useCallback((index) => {
        const el = roundRefs.current[index];
        const container = scrollRef.current;
        if (!el || !container) return;

        tabClickRef.current = true;
        setActiveTab(index);

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const scrollLeft = container.scrollLeft + (elRect.left - containerRect.left)
            - (containerRect.width / 2 - elRect.width / 2);

        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        setTimeout(() => { tabClickRef.current = false; }, 700);
    }, []);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (tabClickRef.current) return;
            if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
            rafScrollRef.current = requestAnimationFrame(() => {
                const { scrollLeft, scrollWidth, clientWidth } = container;
                if (scrollWidth <= clientWidth) return;

                let bestIdx = 0;
                let bestDist = Infinity;
                const containerCenter = scrollLeft + clientWidth / 2;

                roundRefs.current.forEach((ref, i) => {
                    if (!ref) return;
                    const elCenter = ref.offsetLeft + ref.offsetWidth / 2;
                    const dist = Math.abs(containerCenter - elCenter);
                    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
                });
                setActiveTab(bestIdx);
            });
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
        };
    }, [knockoutMatches, bracketSlots]);

    const setRoundRef = (i) => (el) => { roundRefs.current[i] = el; };

    return (
        <div className="bt2-root">
            {hasChampion && <ChampionBanner match={finalMatch} />}

            {/* Sticky Tabs — no icons */}
            <div className="bt2-tabs-bar">
                <div className="bt2-tabs">
                    {ROUNDS.map((r, i) => {
                        const count = matchesByRound[r.key].length;
                        const active = activeTab === i;
                        return (
                            <button
                                key={r.key}
                                className={`bt2-tab ${active ? 'bt2-tab-active' : ''}`}
                                onClick={() => scrollToRound(i)}
                            >
                                <span className="bt2-tab-label">{r.label}</span>
                                {count > 0 && (
                                    <span className={`bt2-tab-count ${active ? 'bt2-tab-count-active' : ''}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Bracket */}
            <div className="bt2-scroll-container" ref={scrollRef}>
                {/* Quarter-Finals */}
                <div className="bt2-round" ref={setRoundRef(0)} data-round-index="0">
                    <div className="bt2-round-title">ربع النهائي</div>
                    <div className="bt2-round-cards">
                        {qf.length > 0 ? qf.map((m) => (
                            <div key={m._id} className="bt2-card-anchor">
                                <MatchCard match={m} />
                            </div>
                        )) : qfSlotPairs.map((pair, i) => {
                            const slotA = bracketSlots.find(s => s.position === pair[0]);
                            const slotB = bracketSlots.find(s => s.position === pair[1]);
                            return (
                                <div key={i} className="bt2-card-anchor">
                                    <MatchCard slotA={slotA} slotB={slotB} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Semi-Finals — auto-populated with QF winners */}
                <div className="bt2-round bt2-round-sf" ref={setRoundRef(1)} data-round-index="1">
                    <div className="bt2-round-title">نصف النهائي</div>
                    <div className="bt2-round-cards bt2-round-cards-sf">
                        {sfDisplayMatches.length > 0 ? sfDisplayMatches.map((m, i) => (
                            <div key={m._id || `sf-ph-${i}`} className="bt2-card-anchor">
                                {m._placeholder ? (
                                    <MatchCard
                                        slotA={m.team1 ? { team: m.team1 } : null}
                                        slotB={m.team2 ? { team: m.team2 } : null}
                                    />
                                ) : (
                                    <MatchCard match={m} />
                                )}
                            </div>
                        )) : Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="bt2-card-anchor">
                                <MatchCard />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final */}
                <div className="bt2-round bt2-round-final" ref={setRoundRef(2)} data-round-index="2">
                    <div className="bt2-round-title"><Trophy size={14} /> النهائي</div>
                    <div className="bt2-round-cards bt2-round-cards-final">
                        <div className="bt2-card-anchor">
                            <MatchCard match={finalMatch} isChampionMatch />
                        </div>
                        {thirdPlace && (
                            <div className="bt2-third">
                                <div className="bt2-third-label">
                                    <Medal size={16} />
                                    مباراة تحديد المركز الثالث
                                </div>
                                <MatchCard match={thirdPlace} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
