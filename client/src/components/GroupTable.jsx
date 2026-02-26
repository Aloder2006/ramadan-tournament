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
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '.65rem',
                padding: '10px 12px',
                background: 'linear-gradient(to left, var(--bg-elevated), var(--bg-card))',
                borderBottom: '1px solid var(--border)',
            }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Cairo' }}>
                    المجموعة
                </span>
                <div style={{
                    width: 28, height: 28, borderRadius: 6, background: 'var(--gold-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 900
                }}>
                    {group}
                </div>
            </div>

            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                tableLayout: 'fixed', // يمنع تمدد الجدول خارج الحاوية
            }}>
                <thead>
                    <tr>
                        <th style={{ ...TH('right'), width: 'auto' }}>الفريق</th>
                        <th style={{ ...TH(), width: '10%' }}>ل</th>
                        <th style={{ ...TH(), width: '10%' }}>ف</th>
                        <th style={{ ...TH(), width: '10%' }}>ت</th>
                        <th style={{ ...TH(), width: '10%' }}>خ</th>
                        <th style={{ ...TH(), width: '12%' }}>+/-</th>
                        <th style={{ ...TH(), width: '12%' }}>نق</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((team, i) => {
                        const qualified = i < 2;
                        return (
                            <tr key={team._id} className="group-row-hover" style={{
                                borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                                background: qualified ? 'rgba(226, 176, 74, 0.03)' : 'transparent',
                                borderRight: qualified ? '3px solid var(--gold)' : '3px solid transparent',
                            }}>
                                <td style={{ padding: '8px 6px', textAlign: 'right', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', minWidth: '12px' }}>
                                            {i + 1}
                                        </span>
                                        <span title={team.name} style={{
                                            fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', // خط يصغر مع الشاشة
                                            fontWeight: qualified ? 700 : 500,
                                            color: qualified ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontFamily: 'Cairo'
                                        }}>
                                            {team.name}
                                        </span>
                                    </div>
                                </td>
                                <td style={TD()}>{team.played}</td>
                                <td style={TD()}>{team.won}</td>
                                <td style={TD()}>{team.drawn}</td>
                                <td style={TD()}>{team.lost}</td>
                                <td style={{ ...TD(), direction: 'ltr' }}>
                                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                                </td>
                                <td style={{ ...TD(), fontWeight: 900, color: 'var(--text-primary)' }}>
                                    {team.points}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <style jsx>{`
                .group-row-hover:hover { background: var(--bg-hover) !important; }
                
                /* تقليل المسافات في الشاشات الصغيرة جداً لضمان عدم وجود سكرول */
                @media (max-width: 360px) {
                    th, td { padding: 8px 2px !important; }
                }
            `}</style>
        </div>
    );
}

const TH = (align = 'center') => ({
    padding: '8px 4px',
    textAlign: align,
    fontSize: 'clamp(10px, 2vw, 11px)',
    fontWeight: 800,
    color: 'var(--text-muted)',
    background: 'var(--bg-elevated)',
    borderBottom: '1px solid var(--border)',
});

const TD = (align = 'center') => ({
    padding: '8px 4px',
    textAlign: align,
    fontSize: 'clamp(11px, 2.5vw, 13px)', // خط مرن للأرقام
    color: 'var(--text-secondary)',
    fontFamily: 'Inter, sans-serif',
});