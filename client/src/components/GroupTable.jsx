import { useMemo } from 'react';

export default function GroupTable({ group, teams }) {
    const sorted = useMemo(() => {
        return [...teams].sort(
            (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
        );
    }, [teams]);

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            // تجنب إخفاء الظلال عند عمل Scroll
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
        }}>
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'clamp(0.6rem, 2vw, .85rem) clamp(0.8rem, 3vw, 1.15rem)', // مسافات مرنة
                background: 'linear-gradient(to left, var(--bg-elevated), var(--bg-card))',
                borderBottom: '1px solid var(--border)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                    <div style={{ 
                        fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', // نص مرن
                        fontWeight: 900, color: 'var(--text-primary)', 
                        fontFamily: 'Cairo, sans-serif', marginTop: -2 
                    }}>
                        المجموعة
                    </div>
                    <div style={{
                        width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)', 
                        borderRadius: 8, background: 'var(--gold-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--gold)', fontSize: 'clamp(0.8rem, 2vw, .9rem)', fontWeight: 900
                    }}>
                        {group}
                    </div>
                </div>
            </div>

            {sorted.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'clamp(0.7rem, 2vw, 0.78rem)' }}>
                    لا توجد فرق في هذه المجموعة بعد
                </div>
            ) : (
                // حاوية التمرير الأفقي للهواتف
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
                        <thead>
                            <tr>
                                <th style={TH('right')}>الفريق</th>
                                <th style={TH()}>ل</th>
                                <th style={TH()}>ف</th>
                                <th style={TH()}>ت</th>
                                <th style={TH()}>خ</th>
                                <th style={TH()}>+/-</th>
                                <th style={TH()}>نق</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((team, i) => {
                                const qualified = i < 2;
                                return (
                                    <tr key={team._id} style={{
                                        borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                                        transition: 'background .15s',
                                        background: qualified ? 'rgba(226, 176, 74, 0.03)' : 'transparent',
                                        borderRight: qualified ? '3px solid var(--gold)' : '3px solid transparent',
                                    }} className="group-row-hover">
                                        
                                        {/* Team Name Cell */}
                                        <td style={{ 
                                            padding: 'clamp(0.5rem, 1.5vw, .7rem) clamp(0.5rem, 2vw, .85rem)', 
                                            textAlign: 'right', verticalAlign: 'middle' 
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.4rem, 1.5vw, .65rem)' }}>
                                                <div style={{
                                                    fontSize: 'clamp(0.55rem, 1.5vw, .65rem)', fontWeight: 800, 
                                                    color: qualified ? 'var(--gold)' : 'var(--text-muted)',
                                                    fontFamily: 'Inter, sans-serif', minWidth: 16, textAlign: 'center',
                                                    padding: '2px 4px'
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <span title={team.name} style={{
                                                    fontSize: 'clamp(0.8rem, 2vw, .9rem)', 
                                                    fontWeight: qualified ? 700 : 500,
                                                    color: qualified ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                    // التعامل مع النصوص الطويلة هنا
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', 
                                                    maxWidth: 'clamp(90px, 25vw, 160px)', // عرض مرن للاسم
                                                    display: 'inline-block',
                                                    fontFamily: 'Cairo, sans-serif'
                                                }}>
                                                    {team.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td style={TD()}>{team.played}</td>
                                        <td style={TD()}>{team.won}</td>
                                        <td style={TD()}>{team.drawn}</td>
                                        <td style={TD()}>{team.lost}</td>

                                        {/* GD */}
                                        <td style={{
                                            ...TD(),
                                            fontWeight: 600,
                                            direction: 'ltr', // للحفاظ على علامة السالب/الموجب في مكانها الصحيح
                                            color: team.gd > 0 ? 'var(--success)' : team.gd < 0 ? 'var(--danger)' : 'var(--text-muted)',
                                        }}>
                                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                                        </td>

                                        {/* Points */}
                                        <td style={{
                                            ...TD(),
                                            fontWeight: 900, 
                                            fontSize: 'clamp(0.85rem, 2.5vw, .95rem)',
                                            color: qualified ? 'var(--gold)' : 'var(--text-primary)',
                                        }}>
                                            {team.points}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .group-row-hover:hover {
                    background: var(--bg-hover) !important;
                }
            `}</style>
        </div>
    );
}

// الدوال المساعدة للستايل (تم تحديثها لتكون متجاوبة)
const TH = (align = 'center') => ({
    padding: 'clamp(0.4rem, 1.5vw, .6rem) clamp(0.3rem, 1vw, .75rem)',
    textAlign: align,
    fontSize: 'clamp(0.55rem, 1.5vw, .62rem)', // خط مرن
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    background: 'var(--bg-elevated)',
});

const TD = (align = 'center') => ({
    padding: 'clamp(0.5rem, 1.5vw, .7rem) clamp(0.3rem, 1vw, .5rem)',
    textAlign: align,
    fontSize: 'clamp(0.75rem, 2vw, .85rem)', // خط مرن
    color: 'var(--text-secondary)',
    verticalAlign: 'middle',
    fontFamily: 'Inter, sans-serif',
});