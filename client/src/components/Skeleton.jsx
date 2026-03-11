import './Skeleton.css';

/* ─────────────────────────────────────────────
   BASE SHIMMER BONE
   A single animated placeholder element
───────────────────────────────────────────── */
function Bone({ className = '', style = {} }) {
    return <div className={`sk-bone ${className}`} style={style} />;
}

/* ─────────────────────────────────────────────
   MATCH CARD SKELETON
   Mimics the msc-card: team1 | score | team2
───────────────────────────────────────────── */
function SkeletonMatchCard() {
    return (
        <div className="sk-match-card">
            {/* Team 1 */}
            <div className="sk-match-team">
                <Bone className="sk-circle" />
                <Bone className="sk-rect" style={{ width: '65%' }} />
            </div>

            {/* Center score / time */}
            <div className="sk-match-center">
                <Bone className="sk-badge-bone" />
                <Bone className="sk-score-bone" />
            </div>

            {/* Team 2 */}
            <div className="sk-match-team sk-match-team-end">
                <Bone className="sk-rect" style={{ width: '55%' }} />
                <Bone className="sk-circle" />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   TABLE ROW SKELETON
   Mimics a gt-row: rank | name | P | W | D | L | GD | Pts
───────────────────────────────────────────── */
function SkeletonTableRow() {
    return (
        <div className="sk-table-row">
            <Bone className="sk-rank-bone" />
            <Bone className="sk-name-bone" />
            <Bone className="sk-stat-bone" />
            <Bone className="sk-stat-bone" />
            <Bone className="sk-stat-bone" />
            <Bone className="sk-stat-bone" />
            <Bone className="sk-stat-bone" />
            <Bone className="sk-stat-bone sk-stat-pts" />
        </div>
    );
}

/* ─────────────────────────────────────────────
   GROUP TABLE SKELETON
   Mimics a full gt-wrap: header + 4 rows
───────────────────────────────────────────── */
function SkeletonGroupTable() {
    return (
        <div className="sk-group-table">
            {/* Header */}
            <div className="sk-group-header">
                <Bone className="sk-rect" style={{ width: 60, height: 14 }} />
                <Bone className="sk-group-badge-bone" />
            </div>

            {/* Column headers */}
            <div className="sk-table-head">
                <span>الفريق</span>
                <span>ل</span><span>ف</span><span>ت</span>
                <span>خ</span><span>+/-</span><span>نق</span>
            </div>

            {/* Data rows */}
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonTableRow key={i} />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   HERO BANNER SKELETON
   Mimics the navbar + matches tab bar area
───────────────────────────────────────────── */
function SkeletonHeroBanner() {
    return (
        <div className="sk-hero">
            {/* Tab bar */}
            <div className="sk-hero-tabs">
                <Bone className="sk-pill" style={{ width: 120 }} />
            </div>

            {/* Section label */}
            <Bone className="sk-section-label" />
        </div>
    );
}

/* ─────────────────────────────────────────────
   HISTORY ROW SKELETON
   Mimics a mh-card row
───────────────────────────────────────────── */
function SkeletonHistoryRow() {
    return (
        <div className="sk-history-row">
            <Bone className="sk-rect" style={{ width: '40%', height: 12 }} />
            <Bone className="sk-score-bone" />
            <Bone className="sk-rect" style={{ width: '35%', height: 12 }} />
        </div>
    );
}

/* ─────────────────────────────────────────────
   BRACKET CARD SKELETON
   Mimics a bt2-card: team1 | separator | team2
───────────────────────────────────────────── */
function SkeletonBracketCard() {
    return (
        <div className="sk-bracket-card">
            <div className="sk-bracket-slot">
                <Bone className="sk-rect" style={{ width: '60%', height: 12 }} />
                <Bone className="sk-rect" style={{ width: 22, height: 14 }} />
            </div>
            <div className="sk-bracket-sep" />
            <div className="sk-bracket-slot">
                <Bone className="sk-rect" style={{ width: '50%', height: 12 }} />
                <Bone className="sk-rect" style={{ width: 22, height: 14 }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   BRACKET TREE SKELETON
   Mimics: tab bar + 3 rounds (4, 2, 1 cards)
───────────────────────────────────────────── */
function SkeletonBracket() {
    return (
        <div className="sk-bracket">
            {/* Fake tab bar */}
            <div className="sk-bracket-tabs">
                <Bone className="sk-bracket-tab" />
                <Bone className="sk-bracket-tab" />
                <Bone className="sk-bracket-tab" />
            </div>
            {/* Rounds */}
            <div className="sk-bracket-rounds">
                {/* QF — 4 cards */}
                <div className="sk-bracket-round">
                    <Bone className="sk-rect" style={{ width: 70, height: 10, margin: '0 auto 8px' }} />
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonBracketCard key={i} />)}
                </div>
                {/* SF — 2 cards */}
                <div className="sk-bracket-round">
                    <Bone className="sk-rect" style={{ width: 70, height: 10, margin: '0 auto 8px' }} />
                    {Array.from({ length: 2 }).map((_, i) => <SkeletonBracketCard key={i} />)}
                </div>
                {/* Final — 1 card */}
                <div className="sk-bracket-round">
                    <Bone className="sk-rect" style={{ width: 50, height: 10, margin: '0 auto 8px' }} />
                    <SkeletonBracketCard />
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
   <Skeleton type="match-card" count={3} />
   <Skeleton type="table-row" count={4} />
   <Skeleton type="group-table" count={4} />
   <Skeleton type="hero-banner" />
   <Skeleton type="history-row" count={3} />
   <Skeleton type="bracket" />
   <Skeleton type="full-page" />
   <Skeleton type="full-page-knockout" />
───────────────────────────────────────────── */
export default function Skeleton({ type = 'match-card', count = 1 }) {
    const items = Array.from({ length: count });

    switch (type) {
        case 'match-card':
            return (
                <div className="sk-match-list">
                    {items.map((_, i) => <SkeletonMatchCard key={i} />)}
                </div>
            );

        case 'table-row':
            return items.map((_, i) => <SkeletonTableRow key={i} />);

        case 'group-table':
            return (
                <div className="sk-groups-grid">
                    {items.map((_, i) => <SkeletonGroupTable key={i} />)}
                </div>
            );

        case 'hero-banner':
            return <SkeletonHeroBanner />;

        case 'history-row':
            return (
                <div className="sk-history-group">
                    <Bone className="sk-date-label-bone" />
                    {items.map((_, i) => <SkeletonHistoryRow key={i} />)}
                </div>
            );

        case 'bracket':
            return <SkeletonBracket />;

        case 'full-page':
            return (
                <div className="sk-full-page page-fade-in">
                    <SkeletonHeroBanner />
                    <div className="sk-match-list">
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonMatchCard key={i} />)}
                    </div>
                    <div className="sk-section-divider">
                        <Bone className="sk-section-label" />
                    </div>
                    <div className="sk-groups-grid">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonGroupTable key={i} />)}
                    </div>
                    <div className="sk-section-divider">
                        <Bone className="sk-section-label" />
                    </div>
                    <div className="sk-history-group">
                        <Bone className="sk-date-label-bone" />
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonHistoryRow key={i} />)}
                    </div>
                </div>
            );

        case 'full-page-knockout':
            return (
                <div className="sk-full-page page-fade-in">
                    <SkeletonHeroBanner />
                    <div className="sk-match-list">
                        {Array.from({ length: 2 }).map((_, i) => <SkeletonMatchCard key={i} />)}
                    </div>
                    <div className="sk-section-divider">
                        <Bone className="sk-section-label" />
                    </div>
                    <SkeletonBracket />
                    <div className="sk-section-divider">
                        <Bone className="sk-section-label" />
                    </div>
                    <div className="sk-history-group">
                        <Bone className="sk-date-label-bone" />
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonHistoryRow key={i} />)}
                    </div>
                </div>
            );

        default:
            return null;
    }
}
