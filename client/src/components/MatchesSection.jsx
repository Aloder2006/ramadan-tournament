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
                {badge && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--gold)' }}>{badge}</span>
                )}
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
    
    const [tab, setTab] = useState(safeToday.length > 0 ? 'today' : 'tomorrow');
    const [showHint, setShowHint] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasSwiped = localStorage.getItem('hasSwipedMatches');
            if (!hasSwiped && safeTomorrow.length > 0 && safeToday.length > 0) {
                setShowHint(true);
            }
        }
    }, [safeToday.length, safeTomorrow.length]);

    const dismissHint = () => {
        if (showHint) {
            setShowHint(false);
            if (typeof window !== 'undefined') localStorage.setItem('hasSwipedMatches', 'true');
        }
    };

    const handleScroll = () => {
        dismissHint();
        if (!scrollRef.current) return;
        const scrollLeft = Math.abs(scrollRef.current.scrollLeft);
        const width = scrollRef.current.offsetWidth;
        if (scrollLeft < width / 2) setTab('today');
        else setTab('tomorrow');
    };

    const scrollToTab = (t) => {
        dismissHint();
        if (!scrollRef.current) return;
        const width = scrollRef.current.offsetWidth;
        scrollRef.current.scrollTo({ left: t === 'today' ? 0 : -width, behavior: 'smooth' });
        setTab(t);
    };

    return (
        <section style={{ background: 'var(--bg-base)', padding: '1rem 0 1.5rem', position: 'relative' }}>
            <div style={{ padding: '0 1rem 0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>
                    مباريات الجولة
                </h3>
                
                <div style={{
                    display: 'flex', background: 'var(--bg-elevated)', borderRadius: '100px',
                    padding: '4px', border: '1px solid var(--border)', width: '100%', maxWidth: '260px', position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute', width: 'calc(50% - 4px)', top: '4px', bottom: '4px',
                        right: tab === 'today' ? '4px' : 'calc(50%)',
                        background: 'var(--bg-card)', borderRadius: '100px', 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)', transition: 'right 0.3s'
                    }} />

                    <button onClick={() => scrollToTab('today')} style={tabBtn(tab === 'today')}>
                        اليوم <span style={countBadge(tab === 'today')}>{safeToday.length}</span>
                    </button>
                    <button onClick={() => scrollToTab('tomorrow')} style={tabBtn(tab === 'tomorrow')}>
                        الغد <span style={countBadge(tab === 'tomorrow')}>{safeTomorrow.length}</span>
                    </button>
                </div>
            </div>

            <div style={{ position: 'relative', paddingBottom: '1rem' }}>
                <div ref={scrollRef} onScroll={handleScroll} style={{
                    display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', direction: 'rtl'
                }}>
                    <div style={panelStyle}>
                        <div style={listWrapper}>
                            {safeToday.length === 0 ? <EmptyState text="لا توجد مباريات اليوم" /> :
                            safeToday.map(m => <MatchCard key={m._id} m={m} />)}
                        </div>
                    </div>

                    <div style={panelStyle}>
                        <div style={listWrapper}>
                            {safeTomorrow.length === 0 ? <EmptyState text="لا توجد مباريات غداً" /> :
                            safeTomorrow.map(m => <MatchCard key={m._id} m={m} />)}
                        </div>
                    </div>
                </div>

                {/* التلميح العائم أسفل الصندوق */}
                {showHint && (
                    <div style={{
                        position: 'absolute', 
                        bottom: '-10px', // يجعله يطفو تحت القائمة
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        zIndex: 10, 
                        pointerEvents: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        background: 'var(--bg-card)', // لون خلفية هادئ
                        color: 'var(--text-primary)', 
                        padding: '4px 16px', 
                        borderRadius: '20px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>مرر للمزيد</span>
                        <span className="swipe-animated-arrow" style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>←</span>
                    </div>
                )}
            </div>

            {/* أنيميشن السهم */}
            <style>{`
                @keyframes swipeBounce {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-4px); }
                }
                .swipe-animated-arrow {
                    display: inline-block;
                    animation: swipeBounce 1.5s infinite;
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
    justifyContent: 'center', gap: '6px', outline: 'none'
});

const countBadge = (active) => ({
    fontSize: '0.6rem', background: active ? 'var(--gold-dim)' : 'transparent',
    color: active ? 'var(--gold)' : 'var(--text-muted)', padding: '1px 6px', borderRadius: '10px', fontWeight: 900
});

const panelStyle = { width: '100%', flexShrink: 0, scrollSnapAlign: 'center' };
const listWrapper = { display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 1rem', maxWidth: '550px', margin: '0 auto' };

// تم تصغير صندوق Empty State هنا
const EmptyState = ({ text }) => (
    <div style={{ 
        padding: '1.25rem 1rem', // تصغير المساحة العلوية والسفلية
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontSize: '0.8rem', 
        fontWeight: 700, 
        background: 'var(--bg-card)', 
        borderRadius: '12px', 
        border: '1px dashed var(--border)' 
    }}>
        {text}
    </div>
);