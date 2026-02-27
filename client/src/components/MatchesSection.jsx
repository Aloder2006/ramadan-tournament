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
        <div style={{
            background: 'linear-gradient(145deg, var(--bg-card), var(--bg-elevated))',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            padding: '0.75rem 0.85rem',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                <span style={{
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', fontWeight: w1 ? 900 : 600,
                    color: w1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontFamily: 'Cairo, sans-serif'
                }}>{m.team1?.name || 'فريق 1'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                {badge && <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--gold)' }}>{badge}</span>}
                
                <div style={{
                    background: 'var(--bg-base)', padding: '4px 10px', borderRadius: '6px',
                    border: '1px solid var(--border)', minWidth: '70px', textAlign: 'center'
                }}>
                    {done ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: w1 ? 'var(--gold)' : 'var(--text-primary)' }}>{m.score1}</span>
                            <span style={{ color: 'var(--text-muted)' }}>:</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: w2 ? 'var(--gold)' : 'var(--text-primary)' }}>{m.score2}</span>
                        </div>
                    ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)' }}>{timeStr || 'لم يحدد'}</span>
                    )}
                </div>
                {!done && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>VS</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row-reverse', minWidth: 0 }}>
                <span style={{
                    fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', fontWeight: w2 ? 900 : 600,
                    color: w2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left',
                    fontFamily: 'Cairo, sans-serif'
                }}>{m.team2?.name || 'فريق 2'}</span>
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
                const timer = setTimeout(() => setShowHint(true), 1000); 
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
        if (!scrollContainerRef.current || !todayPanelRef.current || !tomorrowPanelRef.current) return;
        
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + (containerRect.width / 2);
        
        const todayRect = todayPanelRef.current.getBoundingClientRect();
        const tomorrowRect = tomorrowPanelRef.current.getBoundingClientRect();
        
        const todayDist = Math.abs(todayRect.left + (todayRect.width / 2) - containerCenter);
        const tomorrowDist = Math.abs(tomorrowRect.left + (tomorrowRect.width / 2) - containerCenter);
        
        const activeTab = todayDist < tomorrowDist ? 'today' : 'tomorrow';
        
        if (tab !== activeTab) {
            setTab(activeTab);
        }
    };

    const scrollToTab = (t) => {
        dismissHint();
        setTab(t);
        
        const targetPanel = t === 'today' ? todayPanelRef.current : tomorrowPanelRef.current;
        if (targetPanel) {
            targetPanel.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        }
    };

    return (
        <section style={{ background: 'var(--bg-base)', padding: '1rem 0 1.5rem', position: 'relative' }}>
            {/* Header & Tabs */}
            <div style={{ padding: '0 1rem 0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>
                    مباريات الجولة
                </h3>
                
                <div style={{
                    display: 'flex', background: 'var(--bg-elevated)', borderRadius: '100px',
                    padding: '4px', border: '1px solid var(--border)', width: '100%', maxWidth: '260px', position: 'relative',
                    WebkitTapHighlightColor: 'transparent',
                }}>
                    <div style={{
                        position: 'absolute', width: 'calc(50% - 4px)', top: '4px', bottom: '4px',
                        right: tab === 'today' ? '4px' : 'calc(50%)',
                        background: 'var(--bg-card)', borderRadius: '100px', 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />

                    <button onClick={() => scrollToTab('today')} style={tabBtn(tab === 'today')}>
                        اليوم <span style={countBadge(tab === 'today')}>{safeToday.length}</span>
                    </button>
                    <button onClick={() => scrollToTab('tomorrow')} style={tabBtn(tab === 'tomorrow')}>
                        الغد <span style={countBadge(tab === 'tomorrow')}>{safeTomorrow.length}</span>
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div style={{ position: 'relative', paddingBottom: '1rem' }}>
                <div 
                    ref={scrollContainerRef} 
                    onScroll={handleScroll} 
                    onTouchStart={dismissHint} 
                    onMouseDown={dismissHint}
                    style={{
                        display: 'flex', 
                        overflowX: 'auto', 
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch', 
                        scrollbarWidth: 'none', 
                        direction: 'rtl',
                        overscrollBehaviorX: 'contain'
                    }}
                >
                    {/* Today Panel */}
                    <div ref={todayPanelRef} style={panelStyle}>
                        <div style={listWrapper}>
                            {safeToday.length === 0 ? <EmptyState text="لا توجد مباريات اليوم" /> :
                            safeToday.map(m => <MatchCard key={m._id} m={m} />)}
                        </div>
                    </div>

                    {/* Tomorrow Panel */}
                    <div ref={tomorrowPanelRef} style={panelStyle}>
                        <div style={listWrapper}>
                            {safeTomorrow.length === 0 ? <EmptyState text="لا توجد مباريات غداً" /> :
                            safeTomorrow.map(m => <MatchCard key={m._id} m={m} />)}
                        </div>
                    </div>
                </div>

                {/* مؤشر التمرير الصامت (بدون نصوص أو إيموجي) */}
                {showHint && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: '1rem',
                        zIndex: 20, pointerEvents: 'none', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, transparent 70%)',
                    }}>
                        <div className="gesture-track">
                            <div className="gesture-dot"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS الأنيميشن الجديد لمسار الحركة */}
            <style>{`
                .gesture-track {
                    width: 70px;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
                    backdrop-filter: blur(2px);
                }

                .gesture-dot {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 30px;
                    height: 100%;
                    background: var(--gold, #FFD700); /* يفضل أن يكون بلون مميز في ثيمك مثل الذهبي */
                    border-radius: 10px;
                    box-shadow: 0 0 8px var(--gold, #FFD700);
                    animation: wordlessSwipeGesture 2s infinite ease-in-out;
                }

                @keyframes wordlessSwipeGesture {
                    0% {
                        transform: translateX(35px); /* يبدأ من خارج المسار قليلاً */
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    75% {
                        transform: translateX(-40px); /* يتحرك للجهة الأخرى محاكياً السحب */
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(-45px);
                        opacity: 0;
                    }
                }
            `}</style>
        </section>
    );
}

/* ──────────────────────────────────────────
   Styles
────────────────────────────────────────── */
const tabBtn = (active) => ({
    flex: 1, padding: '6px 0', border: 'none', background: 'transparent',
    color: active ? 'var(--gold)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800,
    cursor: 'pointer', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', 
    justifyContent: 'center', gap: '6px', 
    outline: 'none',
    WebkitTapHighlightColor: 'transparent', 
    userSelect: 'none'
});

const countBadge = (active) => ({
    fontSize: '0.6rem', background: active ? 'var(--gold-dim)' : 'transparent',
    color: active ? 'var(--gold)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: '10px', fontWeight: 900
});

const panelStyle = { width: '100%', flexShrink: 0, scrollSnapAlign: 'center' }; 
const listWrapper = { display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 1rem', maxWidth: '550px', margin: '0 auto' };

const EmptyState = ({ text }) => (
    <div style={{ 
        padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', 
        fontSize: '0.8rem', fontWeight: 700, background: 'var(--bg-card)', 
        borderRadius: '12px', border: '1px dashed var(--border)' 
    }}>
        {text}
    </div>
);