export default function GroupTable({ group, teams }) {
    const sorted = [...teams].sort(
        (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
        }}>
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.85rem 1.15rem',
                background: 'linear-gradient(to left, var(--bg-elevated), var(--bg-card))',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>

                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Cairo, sans-serif', marginTop: -2 }}>
                            المجموعة
                        </div>
                                            <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--gold-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--gold)', fontSize: '.9rem', fontWeight: 900
                    }}>
                        {group}
                    </div>
                    
                </div>
            </div>

            {sorted.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.78rem' }}>
                    لا توجد فرق في هذه المجموعة بعد
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={TH('right', 120)}>الفريق</th>
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
                                        {/* Team name */}
                                        <td style={{ padding: '.7rem .85rem', textAlign: 'right', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                                                <div style={{
                                                    fontSize: '.65rem', fontWeight: 800, color: qualified ? 'var(--gold)' : 'var(--text-muted)',
                                                    fontFamily: 'Inter, sans-serif', minWidth: 16, textAlign: 'center',
                                                     padding: '2px 4px'
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <span style={{
                                                    fontSize: '.9rem', fontWeight: qualified ? 700 : 500,
                                                    color: qualified ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140,
                                                    fontFamily: 'Cairo, sans-serif'
                                                }}>{team.name}</span>
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
                                            color: team.gd > 0 ? 'var(--success)' : team.gd < 0 ? 'var(--danger)' : 'var(--text-muted)',
                                        }}>
                                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                                        </td>

                                        {/* Points */}
                                        <td style={{
                                            ...TD(),
                                            fontWeight: 900, fontSize: '.95rem',
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

const TH = (align = 'center', minW) => ({
    padding: '.6rem .75rem',
    textAlign: align,
    fontSize: '.62rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    borderBottom: '1px solid var(--border)',
    minWidth: minW,
    whiteSpace: 'nowrap',
    background: 'var(--bg-elevated)',
});

const TD = (align = 'center') => ({
    padding: '.7rem .5rem',
    textAlign: align,
    fontSize: '.85rem',
    color: 'var(--text-secondary)',
    verticalAlign: 'middle',
    fontFamily: 'Inter, sans-serif',
});
