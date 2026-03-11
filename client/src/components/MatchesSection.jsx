import { useState, useRef, useEffect } from 'react';

/* ──────────────────────────────────────────
   MATCH CARD
────────────────────────────────────────── */
function MatchCard({ m }) {
    const done = m.status === 'Completed';
    let w1 = false, w2 = false;
    if (done) {
        if (m.hasPenalties) { w1 = m.penaltyScore1 > m.penaltyScore2; w2 = !w1; }
        else { w1 = m.score1 > m.score2; w2 = m.score2 > m.score1; }
    }

    const timeStr = m.matchDate ? new Date(m.matchDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
    const badge = m.phase === 'knockout' ? (m.knockoutRound || 'إقصاء') : (m.group ? `م·${m.group}` : '');

    return (
        <div className="msc-card">
            <div className="msc-team msc-team-start">
                <span className={`msc-team-name ${w1 ? 'msc-winner' : ''}`}>
                    {m.team1?.name || 'فريق 1'}
                </span>
            </div>

            <div className="msc-center">
                {badge && <span className="msc-badge">{badge}</span>}

                <div className="msc-score-box">
                    {done ? (
                        <div className="msc-score-inner">
                            <span className={`msc-score ${w1 ? 'msc-score-gold' : ''}`}>{m.score1}</span>
                            <span className="msc-score-sep">:</span>
                            <span className={`msc-score ${w2 ? 'msc-score-gold' : ''}`}>{m.score2}</span>
                        </div>
                    ) : (
                        <span className="msc-time">{timeStr || 'لم يحدد'}</span>
                    )}
                </div>
                {!done && <span className="msc-vs">VS</span>}
            </div>

            <div className="msc-team msc-team-end">
                <span className={`msc-team-name ${w2 ? 'msc-winner' : ''}`}>
                    {m.team2?.name || 'فريق 2'}
                </span>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   MAIN SECTION
────────────────────────────────────────── */
export default function MatchesSection({ todayMatches = [], tomorrowMatches = [] }) {
    const safeToday = Array.isArray(todayMatches) ? todayMatches : [];
    const safeTomorrow = Array.isArray(tomorrowMatches) ? tomorrowMatches : [];

    const initialTab = safeToday.length > 0 ? 'today' : (safeTomorrow.length > 0 ? 'tomorrow' : 'today');
    const [tab, setTab] = useState(initialTab);
    const [showHint, setShowHint] = useState(false);

    const scrollContainerRef = useRef(null);
    const todayPanelRef = useRef(null);
    const tomorrowPanelRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasSwiped = localStorage.getItem('hasSwipedMatches');
            if (!hasSwiped && safeTomorrow.length > 0 && safeToday.length > 0) {
                const timer = setTimeout(() => setShowHint(true), 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [safeToday.length, safeTomorrow.length]);

    useEffect(() => {
        if (initialTab === 'tomorrow' && tomorrowPanelRef.current) {
            setTimeout(() => {
                tomorrowPanelRef.current?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
            }, 100);
        }
    }, [initialTab]);

    const dismissHint = () => {
        if (showHint) {
            setShowHint(false);
            if (typeof window !== 'undefined') localStorage.setItem('hasSwipedMatches', 'true');
        }
    };

    const handleScroll = () => {
        dismissHint();
        if (!scrollContainerRef.current || !todayPanelRef.current || !tomorrowPanelRef.current) return;

        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + (containerRect.width / 2);

        const todayRect = todayPanelRef.current.getBoundingClientRect();
        const tomorrowRect = tomorrowPanelRef.current.getBoundingClientRect();

        const todayDist = Math.abs(todayRect.left + (todayRect.width / 2) - containerCenter);
        const tomorrowDist = Math.abs(tomorrowRect.left + (tomorrowRect.width / 2) - containerCenter);

        const activeTab = todayDist < tomorrowDist ? 'today' : 'tomorrow';
        if (tab !== activeTab) setTab(activeTab);
    };

    const scrollToTab = (t) => {
        dismissHint();
        setTab(t);
        const targetPanel = t === 'today' ? todayPanelRef.current : tomorrowPanelRef.current;
        if (targetPanel) {
            targetPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    return (
        <section className="msc-section">
            {/* Header & Tabs */}
            <div className="msc-header">
                <h3 className="msc-title">مباريات الجولة</h3>

                <div className="msc-tab-bar">
                    <div className={`msc-tab-indicator ${tab === 'tomorrow' ? 'msc-tab-indicator-right' : ''}`} />

                    <button onClick={() => scrollToTab('today')} className={`msc-tab-btn ${tab === 'today' ? 'msc-tab-active' : ''}`}>
                        اليوم <span className={`msc-tab-count ${tab === 'today' ? 'msc-tab-count-active' : ''}`}>{safeToday.length}</span>
                    </button>
                    <button onClick={() => scrollToTab('tomorrow')} className={`msc-tab-btn ${tab === 'tomorrow' ? 'msc-tab-active' : ''}`}>
                        الغد <span className={`msc-tab-count ${tab === 'tomorrow' ? 'msc-tab-count-active' : ''}`}>{safeTomorrow.length}</span>
                    </button>
                </div>
            </div>

            {/* Scroll panels */}
            <div className="msc-scroll-outer">
                <div
                    ref={scrollContainerRef}
                    className={`msc-scroll-inner ${showHint ? 'peek-scroll-anim' : ''}`}
                    onScroll={handleScroll}
                    onTouchStart={dismissHint}
                    onMouseDown={dismissHint}
                >
                    {/* Today Panel */}
                    <div ref={todayPanelRef} className="msc-panel">
                        <div className="msc-list">
                            {safeToday.length === 0 ? <EmptyState text="لا توجد مباريات اليوم" /> :
                                safeToday.map(m => <MatchCard key={m._id} m={m} />)}
                        </div>
                    </div>

                    {/* Tomorrow Panel */}
                    <div ref={tomorrowPanelRef} className="msc-panel">
                        <div className="msc-list">
                            {safeTomorrow.length === 0 ? <EmptyState text="لا توجد مباريات غداً" /> :
                                safeTomorrow.map(m => <MatchCard key={m._id} m={m} />)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const EmptyState = ({ text }) => (
    <div className="msc-empty">{text}</div>
);